/* ============================================================
   KidsDB — the Learning Hub's tiny, offline "database"
   ------------------------------------------------------------
   A super-light data layer shared by the Hub (index.html) and the
   Grown-Ups Insights page. It stores:

     hub_kids       [ {id, name, avatar, grade, created} ]   learner profiles
     hub_activeKid  "<id>"                                    who is logged in
     hub_events     [ {kid, grade, app, action, meta, ts} ]  what kids do

   Everything is just localStorage JSON — no server, works offline.
   Because every app opens as a file:// page they share ONE
   localStorage, so this module (and the Insights page) can see the
   whole family's activity and every app's saved progress.

   Grades run PreK to 5th: pk, kg, g1, g2, g3, g4, g5 (GRADE_ORDER).
   Most apps were built for "kg" or "g3" only, so each grade has a
   `band`: the app level it uses until it has content of its own
   (pk → kg, g1–g5 → g3). Use KidsDB.band(grade) wherever an app or
   page asks "KG or 3rd grade?". Profiles keep their real grade.
   ============================================================ */
window.KidsDB = (function () {
  "use strict";

  var K = { kids: "hub_kids", active: "hub_activeKid", events: "hub_events" };
  var CAP = 800; // keep the event log light — ring-buffer the last N actions

  /* Grade metadata: label, mascot, and which Hub category it filters to. */
  var GRADES = {
    pk: { code: "pk", n: -1, label: "Pre-K Learner",  short: "Pre-K",
          emoji: "🧸", cat: "kinder", band: "kg", color: "#ff9f43" },
    kg: { code: "kg", n: 0, label: "Kindergartener", short: "Kindergarten",
          emoji: "🐣", cat: "kinder", band: "kg", color: "#ff6f91" },
    g1: { code: "g1", n: 1, label: "1st Grader",     short: "1st Grade",
          emoji: "✏️", cat: "elementary", band: "g3", color: "#20c997" },
    g2: { code: "g2", n: 2, label: "2nd Grader",     short: "2nd Grade",
          emoji: "📒", cat: "elementary", band: "g3", color: "#339af0" },
    g3: { code: "g3", n: 3, label: "3rd Grader",     short: "3rd Grade",
          emoji: "🎒", cat: "elementary", band: "g3", color: "#8a7dff" },
    g4: { code: "g4", n: 4, label: "4th Grader",     short: "4th Grade",
          emoji: "🔭", cat: "elementary", band: "g3", color: "#e64980" },
    g5: { code: "g5", n: 5, label: "5th Grader",     short: "5th Grade",
          emoji: "🚀", cat: "elementary", band: "g3", color: "#f08c00" }
  };
  var GRADE_ORDER = ["pk", "kg", "g1", "g2", "g3", "g4", "g5"];
  // The app level ("kg" | "g3") a grade uses until it has its own content.
  function band(grade) { return (GRADES[grade] || GRADES.kg).band; }

  /* Friendly avatar choices for the login picker. */
  var AVATARS = ["🦄", "🦖", "🐬", "🦊", "🐼", "🐯", "🐸", "🦉",
                 "🐙", "🐧", "🦁", "🐨", "🐰", "🐵", "🦋", "🐢"];

  /* ---------- storage helpers ---------- */
  function read(key, fallback) {
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch (e) { return fallback; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  /* ---------- profiles ---------- */
  function kids() { return read(K.kids, []); }
  function activeId() { return localStorage.getItem(K.active) || ""; }
  function active() {
    var id = activeId(), list = kids();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function setActive(id) { localStorage.setItem(K.active, id || ""); }
  function logout() { localStorage.removeItem(K.active); }

  /* opts.activate === false → add without logging the new learner in (Admin). */
  function addKid(name, avatar, grade, opts) {
    var list = kids();
    var wasEmpty = list.length === 0;
    var id = "k" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
    var kid = {
      id: id,
      name: (name || "").trim() || "Friend",
      avatar: avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)],
      grade: GRADES[grade] ? grade : "kg",
      created: Date.now()
    };
    list.push(kid); write(K.kids, list);
    if (!opts || opts.activate !== false) setActive(id);
    mirror(kid);
    // The very first learner inherits any progress saved before login existed,
    // so nothing is lost the day per-profile scores are switched on.
    if (wasEmpty) migrateLegacyProgress(id);
    log("hub", "profile_create", { grade: kid.grade, name: kid.name, by: opts && opts.by || "kid" });
    return kid;
  }

  /* Edit a learner (name / avatar / grade). Returns the updated profile. */
  function updateKid(id, patch) {
    var list = kids(), out = null;
    list.forEach(function (k) {
      if (k.id !== id) return;
      ["name", "avatar", "grade"].forEach(function (f) { if (patch[f] != null && patch[f] !== "") k[f] = f === "name" ? String(patch[f]).trim() : patch[f]; });
      if (!GRADES[k.grade]) k.grade = "kg";
      k.updated = Date.now(); out = k;
    });
    write(K.kids, list);
    if (out) mirror(out);
    return out;
  }

  /* Keep the ActivityDB "students" table in step with the profile list. */
  function mirror(kid) {
    if (!window.ActivityDB) return;
    ActivityDB.students().then(function (rows) {
      var prev = null;
      rows.forEach(function (r) { if (r.id === kid.id) prev = r; });
      ActivityDB.putStudent(Object.assign({ notes: "", archived: false }, prev || {}, kid));
    }).catch(function () {});
  }
  function syncStudents() { kids().forEach(mirror); }

  /* Copy legacy un-namespaced app progress into a learner's namespace, once. */
  function migrateLegacyProgress(id) {
    if (localStorage.getItem("hub_legacyMigrated") === "1") return;
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i));
    keys.forEach(function (key) {
      if (key == null) return;
      if (key.indexOf("hub_") === 0) return;     // profile registry / log — global
      if (key.indexOf("rw_") === 0) return;      // shared Prize Wheel pot — global
      if (key.indexOf("::") !== -1) return;      // already namespaced
      localStorage.setItem("k" + id + "::" + key, localStorage.getItem(key));
    });
    localStorage.setItem("hub_legacyMigrated", "1");
  }
  function removeKid(id) {
    write(K.kids, kids().filter(function (k) { return k.id !== id; }));
    if (activeId() === id) logout();
    if (window.ActivityDB) ActivityDB.students().then(function (rows) {
      rows.forEach(function (r) { if (r.id === id) { r.archived = true; r.removed = Date.now(); ActivityDB.putStudent(r); } });
    }).catch(function () {});
  }

  /* ---------- event log (the "actions" table) ---------- */
  function events() { return read(K.events, []); }
  function log(app, action, meta) {
    var a = active();
    var list = events();
    list.push({
      kid: a ? a.id : "",
      grade: a ? a.grade : "",
      app: app || "hub",
      action: action || "event",
      meta: meta || null,
      ts: Date.now()
    });
    if (list.length > CAP) list = list.slice(list.length - CAP);
    write(K.events, list);
    // Mirror into the activity database (the full, uncapped history).
    if (window.ActivityDB) {
      var ev = list[list.length - 1];
      ActivityDB.add({ ts: ev.ts, kid: ev.kid, grade: ev.grade, app: ev.app,
                       type: action === "open_app" ? "open" : "account", action: action, meta: meta || null });
    }
    return list[list.length - 1];
  }
  /* All events belonging to one kid (or everyone if id omitted). */
  function eventsFor(id) {
    if (!id) return events();
    return events().filter(function (e) { return e.kid === id; });
  }
  function clearEvents() { write(K.events, []); }

  return {
    GRADES: GRADES,
    GRADE_ORDER: GRADE_ORDER,
    band: band,
    AVATARS: AVATARS,
    kids: kids,
    active: active,
    activeId: activeId,
    setActive: setActive,
    logout: logout,
    addKid: addKid,
    updateKid: updateKid,
    syncStudents: syncStudents,
    removeKid: removeKid,
    events: events,
    eventsFor: eventsFor,
    log: log,
    clearEvents: clearEvents
  };
})();
