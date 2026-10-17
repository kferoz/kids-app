/* ============================================================
   ActivityDB — the Learning Hub's activity database (IndexedDB)
   ------------------------------------------------------------
   IndexedDB is the real database built into every browser: it
   works offline, from file:// pages, with no server or install,
   and holds far more than localStorage. One database is shared by
   the Hub, every app (through js/tracker.js) and the Admin page.

   Database "KidsLearningHub"  (version 1)
     events    { id (auto), ts, kid, grade, app, type, action,
                 ok, skill, value, ms, session, meta }
               indexes: ts, kid, app, type, kid_ts [kid, ts]
     students  { id, name, avatar, grade, created, updated, notes, archived }
     meta      { key, value }   — flags (e.g. legacy-log migration)

   Event "type" vocabulary (what the Admin page understands):
     session  — app opened / closed  (action start|end, ms = time spent)
     answer   — a question answered  (ok true|false, skill)
     complete — lesson/story/level finished (value = score, meta.total)
     progress — an app's saved score changed (meta.key, value = delta)
     open     — app opened from the Hub
     admin    — grown-up actions in Admin (the audit trail)
     account  — learner login / logout / create / edit / remove

   Writes made before the DB opens (or if IndexedDB is blocked) are
   queued in localStorage "hub_evq" and flushed on the next open.

   KEEP THE DATA: app updates (new versions of the site or the APK) must
   never lose students, progress or history. Schema changes are additive
   only: bump VERSION and create new stores/indexes in onupgradeneeded;
   never delete a store, rename a key or clear data in an upgrade. The
   only thing that wipes data is the grown-up "Reset everything" button
   in Admin → Data (resetAll), which downloads a backup first.
   ============================================================ */
window.ActivityDB = (function () {
  "use strict";

  var NAME = "KidsLearningHub", VERSION = 1, QKEY = "hub_evq";
  var dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("IndexedDB unavailable")); return; }
      var req = indexedDB.open(NAME, VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("events")) {
          var ev = db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
          ev.createIndex("ts", "ts");
          ev.createIndex("kid", "kid");
          ev.createIndex("app", "app");
          ev.createIndex("type", "type");
          ev.createIndex("kid_ts", ["kid", "ts"]);
        }
        if (!db.objectStoreNames.contains("students")) db.createObjectStore("students", { keyPath: "id" });
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta", { keyPath: "key" });
      };
      req.onsuccess = function () {
        var db = req.result;
        persist();
        db.onversionchange = function () { db.close(); dbPromise = null; };
        resolve(db);
        flushQueue();
      };
      req.onerror = function () { dbPromise = null; reject(req.error); };
    });
    return dbPromise;
  }

  function tx(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode), out;
        t.oncomplete = function () { resolve(out); };
        t.onerror = t.onabort = function () { reject(t.error); };
        out = fn(t.objectStore(store), function (v) { out = v; });
      });
    });
  }
  function reqToPromise(r) {
    return new Promise(function (res, rej) { r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; });
  }

  /* ---------- offline queue (localStorage) ---------- */
  function rawGet(k) { return window.ProfileStore ? ProfileStore.rawGet(k) : localStorage.getItem(k); }
  function rawSet(k, v) { return window.ProfileStore ? ProfileStore.rawSet(k, v) : localStorage.setItem(k, v); }
  function queue(evt) {
    try {
      var q = JSON.parse(rawGet(QKEY) || "[]"); q.push(evt);
      if (q.length > 2000) q = q.slice(q.length - 2000);
      rawSet(QKEY, JSON.stringify(q));
    } catch (e) { /* storage full — drop silently, never break an app */ }
  }
  function flushQueue() {
    var q;
    try { q = JSON.parse(rawGet(QKEY) || "[]"); } catch (e) { q = []; }
    if (!q.length) return Promise.resolve(0);
    rawSet(QKEY, "[]");
    return putMany("events", q).catch(function () { q.forEach(queue); });
  }

  /* ---------- events ---------- */
  function normalize(e) {
    return {
      ts: e.ts || Date.now(),
      kid: e.kid || "",
      grade: e.grade || "",
      app: e.app || "hub",
      type: e.type || "event",
      action: e.action || "",
      ok: typeof e.ok === "boolean" ? e.ok : null,
      skill: e.skill || "",
      value: typeof e.value === "number" ? e.value : null,
      ms: typeof e.ms === "number" ? Math.round(e.ms) : null,
      session: e.session || "",
      meta: e.meta || null
    };
  }
  function add(e) {
    var evt = normalize(e);
    return tx("events", "readwrite", function (s) { s.add(evt); }).catch(function () { queue(evt); });
  }
  function putMany(store, list) {
    return tx(store, "readwrite", function (s) { list.forEach(function (x) { s.put(store === "events" ? normalize(x) : x); }); });
  }
  /* query({kid, app, type, since, until}) → newest-last array */
  function query(f) {
    f = f || {};
    return tx("events", "readonly", function (s, set) {
      var range = null, src = s;
      if (f.kid) {
        src = s.index("kid_ts");
        range = IDBKeyRange.bound([f.kid, f.since || 0], [f.kid, f.until || Number.MAX_SAFE_INTEGER]);
      } else if (f.since || f.until) {
        src = s.index("ts");
        range = IDBKeyRange.bound(f.since || 0, f.until || Number.MAX_SAFE_INTEGER);
      }
      var out = [];
      src.openCursor(range).onsuccess = function (ev) {
        var c = ev.target.result;
        if (!c) { set(out); return; }
        var v = c.value;
        if ((!f.app || v.app === f.app) && (!f.type || v.type === f.type)) out.push(v);
        c.continue();
      };
    });
  }
  function count() { return tx("events", "readonly", function (s, set) { reqToPromise(s.count()).then(set); }); }
  function deleteWhere(pred) {
    return tx("events", "readwrite", function (s, set) {
      var n = 0;
      s.openCursor().onsuccess = function (ev) {
        var c = ev.target.result;
        if (!c) { set(n); return; }
        if (pred(c.value)) { c.delete(); n++; }
        c.continue();
      };
    });
  }
  // Ask the browser to keep this site's storage under disk pressure
  // (otherwise phones/tablets may evict IndexedDB + localStorage).
  var persistAsked = false;
  function persist() {
    if (persistAsked || !navigator.storage || !navigator.storage.persist) return;
    persistAsked = true;
    navigator.storage.persisted().then(function (yes) { if (!yes) return navigator.storage.persist(); }).catch(function () {});
  }

  // Start fresh: empty every table and every app's saved progress on this device.
  // keep: localStorage keys to leave alone (e.g. the admin PIN).
  function resetAll(keep) {
    keep = keep || [];
    return Promise.all(["events", "students", "meta"].map(clearStore)).then(function () {
      var saved = {};
      keep.forEach(function (k) { var v = localStorage.getItem(k); if (v != null) saved[k] = v; });
      localStorage.clear();
      Object.keys(saved).forEach(function (k) { localStorage.setItem(k, saved[k]); });
    });
  }

  function clearStore(store) { return tx(store, "readwrite", function (s) { s.clear(); }); }

  /* ---------- students (mirror of KidsDB profiles + admin notes) ---------- */
  function students() { return tx("students", "readonly", function (s, set) { reqToPromise(s.getAll()).then(set); }); }
  function putStudent(st) { return tx("students", "readwrite", function (s) { s.put(st); }); }
  function deleteStudent(id) { return tx("students", "readwrite", function (s) { s.delete(id); }); }

  /* ---------- meta ---------- */
  function getMeta(key) {
    return tx("meta", "readonly", function (s, set) { reqToPromise(s.get(key)).then(function (r) { set(r ? r.value : undefined); }); });
  }
  function setMeta(key, value) { return tx("meta", "readwrite", function (s) { s.put({ key: key, value: value }); }); }

  /* One-time import of the old localStorage action log (hub_events). */
  function migrateLegacy() {
    return getMeta("legacyEventsImported").then(function (done) {
      if (done) return 0;
      var old = [];
      try { old = JSON.parse(rawGet("hub_events") || "[]"); } catch (e) {}
      var mapped = old.map(function (e) {
        return { ts: e.ts, kid: e.kid, grade: e.grade, app: e.app,
                 type: e.action === "open_app" ? "open" : "account", action: e.action, meta: e.meta };
      });
      return (mapped.length ? putMany("events", mapped) : Promise.resolve())
        .then(function () { return setMeta("legacyEventsImported", Date.now()); })
        .then(function () { return mapped.length; });
    });
  }

  /* Full backup: database + every localStorage key (progress lives there). */
  function exportAll() {
    return Promise.all([query({}), students()]).then(function (r) {
      var ls = {};
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); ls[k] = rawGet(k); }
      return { format: "kids-learning-hub-backup", version: 1, exported: Date.now(),
               events: r[0], students: r[1], localStorage: ls };
    });
  }
  function importAll(data, opts) {
    if (!data || data.format !== "kids-learning-hub-backup") return Promise.reject(new Error("Not a Learning Hub backup file"));
    var p = (opts && opts.replace) ? clearStore("events").then(function () { return clearStore("students"); }) : Promise.resolve();
    return p.then(function () {
      var evs = (data.events || []).map(function (e) { var c = Object.assign({}, e); if (!(opts && opts.replace)) delete c.id; return c; });
      return putMany("events", evs);
    }).then(function () { return putMany("students", data.students || []); })
      .then(function () {
        if (opts && opts.restoreProgress && data.localStorage) {
          Object.keys(data.localStorage).forEach(function (k) { rawSet(k, data.localStorage[k]); });
        }
      });
  }

  // Open early so queued events flush as soon as any page loads.
  open().catch(function () {});

  return {
    open: open, add: add, query: query, count: count, deleteWhere: deleteWhere,
    clearEvents: function () { return clearStore("events"); },
    students: students, putStudent: putStudent, deleteStudent: deleteStudent,
    getMeta: getMeta, setMeta: setMeta, migrateLegacy: migrateLegacy,
    exportAll: exportAll, importAll: importAll, flushQueue: flushQueue,
    resetAll: resetAll, persist: persist
  };
})();
