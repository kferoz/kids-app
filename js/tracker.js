/* ============================================================
   tracker.js — records what a learner does inside an app
   ------------------------------------------------------------
   Include on every APP page, after profile-store.js and
   activitydb.js and before the app's own scripts:

     <script src="../js/activitydb.js"></script>
     <script src="../js/tracker.js" data-app="homeschool"></script>

   Automatic (no app changes needed):
     • session start, time spent (visible + recently-active time only,
       so a tab left open overnight doesn't count), session end
     • every change to the app's saved progress (points, stars,
       trophies, stickers, lessons done…) as a "progress" event

   Called by the apps where a question is checked / something ends:
     Tracker.answer(ok, skill, meta)       — one answered question
     Tracker.complete(what, score, total)  — lesson / story / level done
     Tracker.log(type, action, meta)       — anything else

   Every event is tagged with the logged-in learner, grade, app and
   session id and stored in ActivityDB (IndexedDB).
   ============================================================ */
(function () {
  "use strict";
  if (window.Tracker) return;

  var script = document.currentScript;
  var APP = (script && script.getAttribute("data-app")) ||
            (location.pathname.split("/").slice(-2, -1)[0] || "app");
  var IDLE_MS = 60 * 1000;          // count at most 1 min after the last tap/key
  var session = "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function raw(k) { return window.ProfileStore ? ProfileStore.rawGet(k) : localStorage.getItem(k); }
  function who() {
    var id = raw("hub_activeKid") || "", grade = "";
    try {
      (JSON.parse(raw("hub_kids") || "[]")).forEach(function (k) { if (k.id === id) grade = k.grade; });
    } catch (e) {}
    return { kid: id, grade: grade };
  }
  function send(e, sync) {
    var w = who();
    e.kid = w.kid; e.grade = w.grade; e.app = e.app || APP; e.session = session; e.ts = e.ts || Date.now();
    if (!window.ActivityDB) return;
    // On page close an async IndexedDB write may be cut off, so park it in
    // the localStorage queue; ActivityDB flushes the queue on the next page.
    if (sync) {
      try {
        var q = JSON.parse(raw("hub_evq") || "[]"); q.push(e);
        (window.ProfileStore ? ProfileStore.rawSet : function (k, v) { localStorage.setItem(k, v); })("hub_evq", JSON.stringify(q));
      } catch (err) {}
    } else {
      ActivityDB.add(e);
    }
  }

  /* ---------- time on task ---------- */
  var segStart = document.visibilityState === "visible" ? Date.now() : 0;
  var lastActive = Date.now(), total = 0, ended = false;
  ["pointerdown", "keydown", "touchstart"].forEach(function (t) {
    window.addEventListener(t, function () { lastActive = Date.now(); }, { passive: true, capture: true });
  });
  function closeSegment(sync) {
    if (!segStart) return;
    var end = Math.min(Date.now(), Math.max(lastActive, segStart) + IDLE_MS);
    var ms = Math.max(0, end - segStart);
    segStart = 0;
    if (ms < 1000) return;
    total += ms;
    send({ type: "session", action: "time", ms: ms }, sync);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") closeSegment(true);
    else { segStart = Date.now(); lastActive = Date.now(); }
  });
  window.addEventListener("pagehide", function () {
    if (ended) return; ended = true;
    closeSegment(true);
    send({ type: "session", action: "end", ms: total }, true);
  });
  send({ type: "session", action: "start", meta: { title: document.title } });

  /* ---------- progress changes (wraps localStorage.setItem) ---------- */
  var proto = Storage.prototype, origSet = proto.setItem, origGet = proto.getItem;
  var SKIP = /^(hub_|kb_|tt_voice|.*voice|.*settings|.*sound|.*mute)/i;
  function measure(v) {
    if (v == null) return { n: 0, kind: "none" };
    var p; try { p = JSON.parse(v); } catch (e) { p = v; }
    if (typeof p === "number") return { n: p, kind: "num" };
    if (typeof p === "string" && p.trim() !== "" && !isNaN(+p)) return { n: +p, kind: "num" };
    if (Array.isArray(p)) return { n: p.length, kind: "list" };
    if (p && typeof p === "object") return { n: Object.keys(p).length, kind: "obj" };
    return { n: 0, kind: "text" };
  }
  function kindOf(key) {
    if (/troph|badge|medal/i.test(key)) return "trophy";
    if (/sticker|cars?$|critter|chest/i.test(key)) return "collectible";
    if (/done|mastered|solved|progress|season|learned|completed/i.test(key)) return "completion";
    if (/ticket/i.test(key)) return "tickets";
    return "score";
  }
  proto.setItem = function (key, val) {
    var before = null;
    var watch = this === localStorage && !SKIP.test(String(key));
    if (watch) { try { before = origGet.call(this, key); } catch (e) {} }
    var r = origSet.call(this, key, val);
    if (watch && before !== String(val)) {
      var a = measure(before), b = measure(String(val));
      var delta = (a.kind === b.kind || a.kind === "none") ? b.n - a.n : null;
      if (delta !== 0) {
        send({ type: "progress", action: kindOf(String(key)), value: delta,
               meta: { key: String(key), to: b.kind === "num" ? b.n : b.n + " items" } });
      }
    }
    return r;
  };

  /* ---------- public API for the apps ---------- */
  window.Tracker = {
    app: APP,
    session: session,
    answer: function (ok, skill, meta) {
      send({ type: "answer", action: ok ? "correct" : "wrong", ok: !!ok, skill: skill || "", meta: meta || null });
    },
    complete: function (what, score, total, meta) {
      var m = meta || {}; m.what = what; if (total != null) m.total = total;
      send({ type: "complete", action: what || "done", value: typeof score === "number" ? score : null, meta: m });
    },
    log: function (type, action, meta) { send({ type: type || "event", action: action || "", meta: meta || null }); }
  };
})();
