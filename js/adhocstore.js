/* ============================================================
   adhocstore.js — Ad-hoc Tests data (Admin writes, Sticker Quest reads)
   ------------------------------------------------------------
   Everything stays on this device. Tests live in ONE versioned
   localStorage record (shared by all learners, hence hub_):

     hub_adhocDB = { schema: 1, updated, tests: [Test] }
     Test = { id, title, date "YYYY-MM-DD", subject, grade, notes,
              status "draft" | "published", source "builder" |
              "worksheet" | "sightwords" | "sample", difficulty,
              recipe {difficulty, count, types[], seed} | null,
              questions [{type, difficulty, params}],   ← specs only
              attachments [{id, name, w, h, size}], created, updated }

   Questions are stored as engine specs and rebuilt with
   MathQuestions.build() when shown, so answers are always worked
   out by the engine, and an imported file cannot smuggle in
   markup. A "recipe" test (builder / samples) can make new numbers.

   Worksheet photos are too big for localStorage: they go to
   IndexedDB "KidsHubAdhocFiles" (store "images", JPEG data URLs,
   resized by the Admin page). Export/import bundles both into one
   JSON file. Until a grown-up first opens Ad-hoc Tests admin there
   is no hub_adhocDB, and the kids' page shows the built-in samples.
   ============================================================ */
(function (root) {
  "use strict";
  var KEY = "hub_adhocDB", SCHEMA = 1, FILES_DB = "KidsHubAdhocFiles";
  var SUBJECTS = ["Multiplication", "Addition", "Subtraction", "Division", "Fractions", "Sight Words", "Spelling", "Reading", "Science", "Social Studies", "Other"];
  var GRADES = [["pk", "PreK"], ["kg", "Kindergarten"], ["g1", "Grade 1"], ["g2", "Grade 2"], ["g3", "Grade 3"], ["g4", "Grade 4"], ["g5", "Grade 5"]];
  var LEVELS = ["easy", "medium", "hard", "mixed"];
  var ls = root.localStorage;

  function str(v, max) { return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
  function isDate(d) { return /^\d{4}-\d\d-\d\d$/.test(d) && !isNaN(new Date(d + "T00:00:00")); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function newId(prefix) { return (prefix || "t") + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function engine() { return root.MathQuestions || null; }

  /* ---------- clean anything coming in (forms, old data, imported files) ---------- */
  function cleanSpec(s) {
    var M = engine();
    if (!s || typeof s !== "object" || typeof s.type !== "string") return null;
    var spec = { type: s.type, difficulty: LEVELS.indexOf(s.difficulty) >= 0 && s.difficulty !== "mixed" ? s.difficulty : "auto", params: s.params || {} };
    if (!M) return spec;
    try { var q = M.build(spec); return q.spec; } catch (e) { return null; }   // the engine refuses bad numbers and markup
  }
  function cleanRecipe(r) {
    var M = engine();
    if (!r || typeof r !== "object") return null;
    var types = Array.isArray(r.types) ? r.types.filter(function (t) { return !M || M.TYPES.indexOf(t) >= 0; }) : [];
    var out = { difficulty: LEVELS.indexOf(r.difficulty) >= 0 ? r.difficulty : "mixed", count: Math.max(1, Math.min(30, r.count | 0 || 10)), types: types };
    if (r.seed != null && r.seed !== "") out.seed = typeof r.seed === "number" ? r.seed >>> 0 : str(r.seed, 40);
    if (M) { try { M.createSession({ seed: 1, count: 1, difficulty: out.difficulty, types: types.length ? types : null }); } catch (e) { return null; } }
    return out;
  }
  function levelOf(t) {
    if (t.recipe && !t.questions.length) return t.recipe.difficulty;
    var d = {};
    t.questions.forEach(function (s) {
      var lv = s.difficulty;
      if (lv === "auto" && engine()) { try { lv = engine().build(s).difficulty; } catch (e) {} }
      d[lv] = 1;
    });
    var k = Object.keys(d);
    return k.length === 1 && LEVELS.indexOf(k[0]) >= 0 ? k[0] : k.length ? "mixed" : "easy";
  }
  function cleanTest(t) {
    if (!t || typeof t !== "object") return null;
    var out = {
      id: /^[A-Za-z0-9_-]{1,40}$/.test(t.id || "") ? t.id : newId(),
      title: str(t.title, 120) || "Untitled test",
      date: isDate(t.date) ? t.date : today(),
      subject: str(t.subject, 40) || "Other",
      grade: GRADES.some(function (g) { return g[0] === t.grade; }) ? t.grade : "g3",
      notes: str(t.notes, 2000),
      status: t.status === "published" ? "published" : "draft",
      source: ["builder", "worksheet", "sightwords", "sample"].indexOf(t.source) >= 0 ? t.source : "worksheet",
      recipe: cleanRecipe(t.recipe),
      questions: (Array.isArray(t.questions) ? t.questions : []).slice(0, 60).map(cleanSpec).filter(Boolean),
      attachments: (Array.isArray(t.attachments) ? t.attachments : []).filter(function (a) { return a && /^[A-Za-z0-9_-]{1,40}$/.test(a.id || ""); })
        .map(function (a) { return { id: a.id, name: str(a.name, 80) || "worksheet.jpg", w: a.w | 0, h: a.h | 0, size: a.size | 0 }; }),
      created: +t.created || Date.now(), updated: +t.updated || Date.now()
    };
    out.difficulty = levelOf(out);
    return out;
  }
  function count(t) { return t.questions.length || (t.recipe ? t.recipe.count : 0); }

  /* ---------- the record ---------- */
  function migrate(db) {
    // schema 1 is the first; later versions add a step here and never drop tests.
    db.schema = SCHEMA;
    return db;
  }
  function load() {
    var raw = null;
    try { raw = JSON.parse(ls.getItem(KEY)); } catch (e) {}
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.tests)) return null;
    if ((raw.schema | 0) > SCHEMA) return { schema: raw.schema, tests: [], tooNew: true, updated: raw.updated };
    return migrate(raw);
  }
  function save(db) {
    db.schema = SCHEMA; db.updated = Date.now();
    ls.setItem(KEY, JSON.stringify(db));   // throws when the device is full: the Admin page shows it
    return db;
  }
  function fromSample(s) {
    return cleanTest({ id: s.id, title: s.title, date: s.date, subject: "Multiplication", grade: "g3", status: "published", source: "sample",
      recipe: { difficulty: s.difficulty, count: s.count, types: s.types, seed: s.seed }, questions: [] });
  }
  // First Admin visit: start the record with the built-in samples (published; the grown-up can change them).
  function ensure(samples) {
    var db = load();
    if (db) return db;
    return save({ schema: SCHEMA, tests: (samples || []).map(fromSample).filter(Boolean) });
  }
  function all() { var db = load(); return db ? db.tests.slice() : []; }
  function get(id) { return all().filter(function (t) { return t.id === id; })[0] || null; }
  function put(test) {
    var db = ensure([]), t = cleanTest(test);
    t.updated = Date.now();
    var i = db.tests.findIndex(function (x) { return x.id === t.id; });
    if (i >= 0) { t.created = db.tests[i].created || t.created; db.tests[i] = t; } else db.tests.push(t);
    save(db);
    return t;
  }
  function remove(id) {
    var db = load(); if (!db) return Promise.resolve();
    var t = db.tests.filter(function (x) { return x.id === id; })[0];
    db.tests = db.tests.filter(function (x) { return x.id !== id; });
    save(db);
    return t ? deleteImages(t.attachments.map(function (a) { return a.id; })) : Promise.resolve();
  }
  function duplicate(id) {
    var t = get(id); if (!t) return Promise.reject(new Error("Test not found"));
    var copy = JSON.parse(JSON.stringify(t));
    copy.id = newId(); copy.title = (t.title + " (copy)").slice(0, 120); copy.status = "draft"; copy.created = copy.updated = Date.now();
    return Promise.all(t.attachments.map(function (a) {
      return getImage(a.id).then(function (img) {
        var nid = newId("i");
        return img ? putImage(Object.assign({}, img, { id: nid })).then(function () { return Object.assign({}, a, { id: nid }); }) : null;
      });
    })).then(function (atts) { copy.attachments = atts.filter(Boolean); return put(copy); });
  }
  // What the kids' page shows: published tests, newest first (built-in samples until Admin is first used).
  function published(samples) {
    var db = load();
    var list = db ? db.tests.filter(function (t) { return t.status === "published"; }) : (samples || []).map(fromSample).filter(Boolean);
    return list.sort(function (a, b) { return b.date.localeCompare(a.date) || b.updated - a.updated; });
  }

  /* ---------- worksheet photos (IndexedDB) ---------- */
  var dbp = null;
  function files() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!root.indexedDB) return rej(new Error("This browser can't store photos."));
      var r = root.indexedDB.open(FILES_DB, 1);
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains("images")) r.result.createObjectStore("images", { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error || new Error("Could not open photo storage")); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return files().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction("images", mode), st = t.objectStore("images"), out = fn(st);
        t.oncomplete = function () { res(out && "result" in out ? out.result : undefined); };
        t.onerror = t.onabort = function () { rej(t.error || new Error("Photo storage error")); };
      });
    });
  }
  function cleanImage(img) {
    if (!img || !/^[A-Za-z0-9_-]{1,40}$/.test(img.id || "") || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(img.dataUrl || "")) return null;
    return { id: img.id, name: str(img.name, 80), w: img.w | 0, h: img.h | 0, size: img.dataUrl.length, dataUrl: img.dataUrl };
  }
  function putImage(img) { var c = cleanImage(img); return c ? tx("readwrite", function (st) { st.put(c); }) : Promise.reject(new Error("Not a picture")); }
  function getImage(id) { return tx("readonly", function (st) { return st.get(id); }); }
  function deleteImages(ids) { return ids.length ? tx("readwrite", function (st) { ids.forEach(function (id) { st.delete(id); }); }).catch(function () {}) : Promise.resolve(); }

  /* ---------- backup ---------- */
  function exportData() {
    var tests = all();
    var ids = []; tests.forEach(function (t) { t.attachments.forEach(function (a) { ids.push(a.id); }); });
    return Promise.all(ids.map(function (id) { return getImage(id).catch(function () { return null; }); })).then(function (imgs) {
      return { app: "kids-learning-hub/adhoc-tests", schema: SCHEMA, exported: new Date().toISOString(), tests: tests, images: imgs.filter(Boolean) };
    });
  }
  // Merge: tests with the same id are replaced, others are added. Returns {tests, images, skipped}.
  function importData(data) {
    if (!data || data.app !== "kids-learning-hub/adhoc-tests" || !Array.isArray(data.tests)) return Promise.reject(new Error("This is not an Ad-hoc Tests backup file."));
    if ((data.schema | 0) > SCHEMA) return Promise.reject(new Error("This backup is from a newer version of the app."));
    var images = (Array.isArray(data.images) ? data.images : []).map(cleanImage).filter(Boolean);
    return Promise.all(images.map(putImage)).catch(function () {}).then(function () {
      var db = ensure([]), n = 0, skipped = 0;
      data.tests.forEach(function (raw) {
        var t = cleanTest(raw);
        if (!t) { skipped++; return; }
        var i = db.tests.findIndex(function (x) { return x.id === t.id; });
        if (i >= 0) db.tests[i] = t; else db.tests.push(t);
        n++;
      });
      save(db);
      return { tests: n, images: images.length, skipped: skipped };
    });
  }

  root.AdhocStore = {
    KEY: KEY, SCHEMA: SCHEMA, SUBJECTS: SUBJECTS, GRADES: GRADES,
    load: load, ensure: ensure, all: all, get: get, put: put, remove: remove, duplicate: duplicate,
    published: published, count: count, clean: cleanTest, today: today, newId: newId,
    putImage: putImage, getImage: getImage, deleteImages: deleteImages,
    exportData: exportData, importData: importData
  };
})(typeof window !== "undefined" ? window : globalThis);
