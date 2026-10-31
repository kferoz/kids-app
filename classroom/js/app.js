/* ============================================================
   Class Corner — the teacher's board (Phase 1: points)
   ------------------------------------------------------------
   Tap a student → give a positive or needs-work skill. Select
   several (or the whole class) → give one skill to all, after a
   confirm. Every award can be undone. Data: ClassStore.
   ============================================================ */
(function () {
  "use strict";
  var S = window.ClassStore;
  var $ = function (id) { return document.getElementById(id); };
  var st = { cls: null, selecting: false, picked: [] };
  var LAST = "cc_lastClass";   // per-device convenience: reopen the last class

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function signed(n) { return n > 0 ? "+" + n : n < 0 ? "−" + Math.abs(n) : "0"; }
  function tone(n) { return n > 0 ? "pos" : n < 0 ? "neg" : ""; }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }

  /* ---------- grown-up gate (same keys and hash as Admin) ---------- */
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return "h" + (h >>> 0).toString(36); }
  function gate(done) {
    var ok0 = false; try { ok0 = sessionStorage.getItem("adm_ok") === "1"; } catch (e) {}
    if (ok0) { done(); return; }
    var g = $("gate"), pin = null; try { pin = localStorage.getItem("hub_adminPin"); } catch (e) {}
    var a = 6 + Math.floor(Math.random() * 7), b = 7 + Math.floor(Math.random() * 6);
    g.hidden = false;
    $("gateQ").textContent = pin ? "Enter the admin PIN" : "Grown-ups only: what is " + a + " × " + b + "?";
    $("gateIn").setAttribute("inputmode", "numeric");
    $("gateForm").onsubmit = function (ev) {
      ev.preventDefault();
      var v = $("gateIn").value.trim();
      if (pin ? hash(v) === pin : +v === a * b) {
        try { sessionStorage.setItem("adm_ok", "1"); } catch (e) {}
        g.hidden = true; done();
      } else { $("gateMsg").textContent = "Not quite — try again."; $("gateIn").value = ""; }
    };
    $("gateIn").focus();
  }

  /* ---------- toast with undo ---------- */
  var toastT = null;
  function toast(msg, undoBatch) {
    var t = $("toast");
    t.innerHTML = "<span>" + esc(msg) + "</span>" + (undoBatch ? '<button class="btn" type="button">↶ Undo</button>' : "");
    if (undoBatch) t.querySelector("button").onclick = function () { doUndo(undoBatch); };
    t.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove("show"); }, undoBatch ? 6000 : 2600);
  }

  /* ---------- render ---------- */
  function render() {
    var list = S.classes();
    if (st.cls && !S.getClass(st.cls)) st.cls = null;
    if (!st.cls && list.length) {
      var last = null; try { last = localStorage.getItem(LAST); } catch (e) {}
      st.cls = (list.filter(function (c) { return c.id === last; })[0] || list[0]).id;
    }
    $("classSel").innerHTML = list.map(function (c) { return '<option value="' + c.id + '"' + (c.id === st.cls ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("");
    var has = !!st.cls;
    ["classSel", "editSkills", "showLog"].forEach(function (id) { $(id).disabled = !has; });
    $("classSel").parentNode.hidden = !has;
    $("toolbar").hidden = !has; $("summary").hidden = !has;
    if (!has) { $("selBar").hidden = true; renderEmptyClass(); return; }
    renderSummary(); renderBoard(); renderSel();
    $("undo").disabled = !S.lastBatch(st.cls);
  }

  function renderEmptyClass() {
    $("board").innerHTML = '<div class="empty"><div class="big">🏫</div><h2>Make your first class</h2>' +
      "<p>Add a class, then your students. Everything stays on this device.</p>" +
      '<form id="firstClass"><label class="sr" for="firstName">Class name</label>' +
      '<input id="firstName" class="btn" style="text-align:left;font-weight:400" placeholder="e.g. Room 12" maxlength="40" required />' +
      '<button class="btn primary" type="submit">Create class</button></form><p class="err" id="firstErr"></p></div>';
    $("firstClass").onsubmit = function (ev) {
      ev.preventDefault();
      try { var c = S.addClass($("firstName").value); pickClass(c.id); openRoster(); }
      catch (e) { $("firstErr").textContent = e.message; }
    };
  }

  function renderSummary() {
    var s = S.summary(st.cls);
    $("summary").innerHTML =
      '<div class="stat pos"><b>' + signed(s.plus) + '</b><small>positive points today</small></div>' +
      '<div class="stat neg"><b>' + (s.minus ? signed(s.minus) : "0") + '</b><small>needs-work points today</small></div>' +
      '<div class="stat"><b>' + s.active + " / " + s.roster + '</b><small>students with points today</small></div>' +
      '<div class="stat"><b>' + s.none + '</b><small>' + (s.none === 1 ? "student" : "students") + " with none yet</small></div>";
  }

  function renderBoard() {
    var kids = S.students(st.cls), tot = S.totals(st.cls);
    if (!kids.length) {
      $("board").innerHTML = '<div class="empty"><div class="big">🧑‍🎓</div><h2>No students yet</h2><p>Add your class list to start giving points.</p>' +
        '<button class="btn primary" type="button" id="emptyAdd">＋ Add students</button></div>';
      $("emptyAdd").onclick = openRoster; return;
    }
    $("board").innerHTML = kids.map(function (k) {
      var n = tot[k.id] || 0;
      return '<button class="card" type="button" data-s="' + k.id + '"' + (st.selecting ? ' aria-pressed="' + (st.picked.indexOf(k.id) >= 0) + '"' : "") + ">" +
        '<span class="av" aria-hidden="true">' + esc(k.avatar) + '</span><span class="nm">' + esc(k.name) + "</span>" +
        '<span class="pts ' + tone(n) + '"><span class="sr">Points: </span>' + signed(n) + "</span></button>";
    }).join("");
  }

  function renderSel() {
    $("selectMode").setAttribute("aria-pressed", String(st.selecting));
    $("selBar").hidden = !st.selecting;
    $("selCount").textContent = plural(st.picked.length, "student") + " selected";
    $("selGive").disabled = !st.picked.length;
  }

  function pickClass(id) {
    st.cls = id; st.picked = []; st.selecting = false;
    try { localStorage.setItem(LAST, id); } catch (e) {}
    render();
  }

  /* ---------- awarding ---------- */
  function dialog(html, onReady) {
    var d = $("dlg"); d.innerHTML = html;
    var x = d.querySelector(".x"); if (x) x.onclick = function () { d.close(); };
    if (!d.open) d.showModal();
    if (onReady) onReady(d);
    return d;
  }

  // ids: students to award. whole: the whole-class button was used.
  function openAward(ids, whole, tab) {
    var kids = S.students(st.cls).filter(function (k) { return ids.indexOf(k.id) >= 0; });
    if (!kids.length) return;
    var one = kids.length === 1, type = tab || "pos";
    var head = one ? '<span class="av" aria-hidden="true">' + esc(kids[0].avatar) + '</span><h2 id="dlgTitle">' + esc(kids[0].name) + "</h2>"
      : '<span class="av" aria-hidden="true">👥</span><h2 id="dlgTitle">' + (whole ? "Whole class" : "Group") + " · " + plural(kids.length, "student") + "</h2>";
    var sk = S.skills(st.cls, type);
    dialog('<div class="dlg"><div class="dlg-head">' + head + '<button class="x" type="button" aria-label="Close">✕</button></div>' +
      '<div class="tabs" role="tablist">' +
        '<button class="tab pos" role="tab" type="button" data-tab="pos" aria-selected="' + (type === "pos") + '">👍 Positive</button>' +
        '<button class="tab neg" role="tab" type="button" data-tab="neg" aria-selected="' + (type === "neg") + '">✋ Needs work</button></div>' +
      '<div class="skills" role="tabpanel">' + (sk.length ? sk.map(function (k) {
        return '<button class="skill ' + k.type + '" type="button" data-k="' + k.id + '"><span class="em" aria-hidden="true">' + esc(k.emoji) + "</span>" +
          esc(k.name) + '<span class="val">' + signed(k.value) + "</span></button>";
      }).join("") : '<p>No skills here yet. Add some with ⚙️ Skills.</p>') + "</div>" +
      '<div id="awardConfirm"></div></div>', function (d) {
      d.querySelectorAll("[data-tab]").forEach(function (b) { b.onclick = function () { openAward(ids, whole, b.getAttribute("data-tab")); }; });
      d.querySelectorAll("[data-k]").forEach(function (b) {
        b.onclick = function () {
          var k = sk.filter(function (x) { return x.id === b.getAttribute("data-k"); })[0];
          if (one) { give(ids, k, whole); d.close(); return; }
          // group: confirm first
          $("awardConfirm").innerHTML = '<div class="confirm"><span>Give ' + esc(k.emoji + " " + k.name) + " (" + signed(k.value) + ") to " + plural(kids.length, "student") + "?</span>" +
            '<div class="row-btns" style="justify-content:center"><button class="btn" type="button" id="cNo">Back</button>' +
            '<button class="btn primary" type="button" id="cYes">Yes, give points</button></div></div>';
          $("cNo").onclick = function () { $("awardConfirm").innerHTML = ""; };
          $("cYes").onclick = function () { give(ids, k, whole); d.close(); };
          $("cYes").focus();
        };
      });
    });
  }

  function give(ids, k, whole) {
    var r;
    try { r = S.award(st.cls, ids, k.id, { whole: !!whole }); }
    catch (e) { toast(e.message); return; }
    if (!r.saved) toast("This device is out of room. Save a backup now.");
    var who = ids.length === 1 ? (S.students(st.cls).filter(function (s) { return s.id === ids[0]; })[0] || {}).name : plural(ids.length, "student");
    if (st.selecting) { st.picked = []; st.selecting = false; }
    render();
    ids.forEach(function (id) { var c = document.querySelector('.card[data-s="' + id + '"]'); if (c) c.classList.add("bump"); });
    if (r.saved) toast(signed(k.value) + " " + k.emoji + " " + k.name + " · " + who, r.batch);
  }

  function doUndo(batch) {
    var n = S.undo(st.cls, batch || S.lastBatch(st.cls));
    $("toast").classList.remove("show");
    render();
    toast(n ? "Undone (" + plural(n, "award") + ")" : "Nothing to undo");
  }

  /* ---------- roster ---------- */
  function openRoster() {
    var kids = S.students(st.cls);
    dialog('<div class="dlg"><div class="dlg-head"><h2 id="dlgTitle">🧑‍🎓 Students</h2><button class="x" type="button" aria-label="Close">✕</button></div>' +
      '<label class="field">Add students (one name per line)<textarea id="newNames" placeholder="Ava&#10;Ben&#10;Cy"></textarea></label>' +
      '<div class="row-btns"><button class="btn primary" type="button" id="addNames">＋ Add to class</button></div><p class="err" id="rosterErr"></p>' +
      (kids.length ? "<h3>In this class (" + kids.length + ")</h3><ul class=\"list\">" + kids.map(function (k) {
        return '<li><input class="emo" data-av="' + k.id + '" value="' + esc(k.avatar) + '" aria-label="Avatar for ' + esc(k.name) + '" />' +
          '<input class="txt" data-nm="' + k.id + '" value="' + esc(k.name) + '" aria-label="Name" maxlength="30" />' +
          '<button class="btn danger" type="button" data-rm="' + k.id + '">Remove</button></li>';
      }).join("") + "</ul><p><small>Removing takes a student off the board. Their points stay in the records.</small></p>" : "") +
      "</div>", function (d) {
      $("addNames").onclick = function () {
        var added = S.addStudents(st.cls, $("newNames").value.split(/\n|,/));
        render(); openRoster();
        toast(added.length ? "Added " + plural(added.length, "student") : "No new names to add");
      };
      d.querySelectorAll("[data-nm], [data-av]").forEach(function (inp) {
        inp.onchange = function () {
          var id = inp.getAttribute("data-nm") || inp.getAttribute("data-av");
          try { S.updateStudent(st.cls, id, inp.hasAttribute("data-nm") ? { name: inp.value } : { avatar: inp.value }); $("rosterErr").textContent = ""; render(); }
          catch (e) { $("rosterErr").textContent = e.message; }
        };
      });
      d.querySelectorAll("[data-rm]").forEach(function (b) {
        b.onclick = function () {
          var id = b.getAttribute("data-rm"), k = kids.filter(function (x) { return x.id === id; })[0];
          if (b.getAttribute("data-sure") !== "1") { b.setAttribute("data-sure", "1"); b.textContent = "Remove " + k.name + "?"; return; }
          S.archiveStudent(st.cls, id); st.picked = st.picked.filter(function (x) { return x !== id; });
          render(); openRoster(); toast(k.name + " removed from the board");
        };
      });
    });
  }

  /* ---------- skills ---------- */
  // msg: an error to show after a redraw (a refused edit redraws to put the old value back)
  function openSkills(msg) {
    var all = S.skills(st.cls);
    function rows(type) {
      return all.filter(function (k) { return k.type === type; }).map(function (k) {
        return '<li><input class="emo" data-se="' + k.id + '" value="' + esc(k.emoji) + '" aria-label="Emoji for ' + esc(k.name) + '" />' +
          '<input class="txt" data-sn="' + k.id + '" value="' + esc(k.name) + '" aria-label="Skill name" maxlength="30" />' +
          '<input class="num" data-sv="' + k.id + '" type="number" min="1" max="' + S.MAX_VALUE + '" value="' + Math.abs(k.value) + '" aria-label="Points for ' + esc(k.name) + '" />' +
          '<button class="btn danger" type="button" data-sr="' + k.id + '" aria-label="Remove ' + esc(k.name) + '">✕</button></li>';
      }).join("");
    }
    dialog('<div class="dlg"><div class="dlg-head"><h2 id="dlgTitle">⚙️ Skills</h2><button class="x" type="button" aria-label="Close">✕</button></div>' +
      "<h3>👍 Positive (adds points)</h3><ul class=\"list\">" + rows("pos") + "</ul>" +
      "<h3>✋ Needs work (takes points)</h3><ul class=\"list\">" + rows("neg") + "</ul>" +
      '<h3>Add a skill</h3><div class="list"><li><input class="emo" id="nkE" value="⭐" aria-label="Emoji" />' +
      '<input class="txt" id="nkN" placeholder="Skill name" maxlength="30" aria-label="Skill name" />' +
      '<input class="num" id="nkV" type="number" min="1" max="' + S.MAX_VALUE + '" value="1" aria-label="Points" />' +
      '<select id="nkT" aria-label="Kind" class="txt" style="flex:none;width:auto"><option value="pos">👍 Positive</option><option value="neg">✋ Needs work</option></select></li></div>' +
      '<div class="row-btns"><button class="btn primary" type="button" id="nkAdd">＋ Add skill</button></div><p class="err" id="skErr"></p>' +
      '<p><small>Points are 1 to ' + S.MAX_VALUE + '. Needs-work skills take them away. Removed skills keep their past awards.</small></p></div>', function (d) {
      function upd(inp, key) {
        inp.onchange = function () {
          var patch = {}; patch[key] = inp.value;
          try { S.updateSkill(st.cls, inp.getAttribute("data-s" + key[0]), patch); $("skErr").textContent = ""; }
          catch (e) { openSkills(e.message); }
        };
      }
      $("skErr").textContent = msg || "";
      d.querySelectorAll("[data-se]").forEach(function (i) { upd(i, "emoji"); });
      d.querySelectorAll("[data-sn]").forEach(function (i) { upd(i, "name"); });
      d.querySelectorAll("[data-sv]").forEach(function (i) { upd(i, "value"); });
      d.querySelectorAll("[data-sr]").forEach(function (b) {
        b.onclick = function () {
          if (b.getAttribute("data-sure") !== "1") { b.setAttribute("data-sure", "1"); b.textContent = "Remove?"; return; }
          S.archiveSkill(st.cls, b.getAttribute("data-sr")); openSkills();
        };
      });
      $("nkAdd").onclick = function () {
        try { S.addSkill(st.cls, { emoji: $("nkE").value, name: $("nkN").value, value: $("nkV").value, type: $("nkT").value }); openSkills(); toast("Skill added"); }
        catch (e) { $("skErr").textContent = e.message; }
      };
    });
  }

  /* ---------- new class, log, backup ---------- */
  function openNewClass() {
    dialog('<form class="dlg" id="ncForm"><div class="dlg-head"><h2 id="dlgTitle">＋ New class</h2><button class="x" type="button" aria-label="Close">✕</button></div>' +
      '<label class="field">Class name<input id="ncName" maxlength="40" placeholder="e.g. Room 12" required /></label>' +
      (st.cls ? '<label class="field">Or rename "' + esc(S.getClass(st.cls).name) + '"<input id="rnName" maxlength="40" value="' + esc(S.getClass(st.cls).name) + '" /></label>' : "") +
      '<p class="err" id="ncErr"></p><div class="row-btns">' + (st.cls ? '<button class="btn" type="button" id="rnGo">Rename this class</button>' : "") +
      '<button class="btn primary" type="submit">Create class</button></div></form>', function () {
      $("ncName").focus();
      $("ncForm").onsubmit = function (ev) {
        ev.preventDefault();
        try { var c = S.addClass($("ncName").value); $("dlg").close(); pickClass(c.id); openRoster(); }
        catch (e) { $("ncErr").textContent = e.message; }
      };
      if (st.cls) $("rnGo").onclick = function () {
        try { S.renameClass(st.cls, $("rnName").value); $("dlg").close(); render(); toast("Class renamed"); }
        catch (e) { $("ncErr").textContent = e.message; }
      };
    });
  }

  var ACTIONS = { class_add: "Class created", class_rename: "Class renamed", class_archive: "Class archived",
    student_add: "Students added", student_edit: "Student edited", student_archive: "Student removed",
    skill_add: "Skill added", skill_edit: "Skill edited", skill_archive: "Skill removed", award: "Points", undo: "Undone" };
  function logLine(e) {
    var d = e.d || {}, txt = ACTIONS[e.a] || e.a;
    if (e.a === "award") txt = signed(d.v) + " " + (d.skill || "") + " · " + (d.whole ? "whole class, " : "") + plural(d.n, "student");
    else if (e.a === "student_add") txt += ": " + (d.names || []).join(", ");
    else if (e.a === "student_archive" || e.a === "skill_archive" || e.a === "skill_add") txt += ": " + (d.name || "");
    else if (e.a === "undo") txt += " · " + plural(d.n, "award");
    return txt;
  }
  function openLog() {
    var log = S.auditLog(st.cls, 100);
    dialog('<div class="dlg"><div class="dlg-head"><h2 id="dlgTitle">📜 Class log</h2><button class="x" type="button" aria-label="Close">✕</button></div>' +
      (log.length ? '<ul class="list log">' + log.map(function (e) {
        return '<li><span class="grow">' + esc(logLine(e)) + '</span><time datetime="' + new Date(e.t).toISOString() + '">' + esc(new Date(e.t).toLocaleString()) + "</time></li>";
      }).join("") + "</ul>" : "<p>Nothing yet.</p>") + "<p><small>The newest 100 changes for this class.</small></p></div>");
  }

  function backup() {
    var name = "class-corner-backup-" + S.dayKey(Date.now()) + ".json", text = S.exportJSON();
    if (window.AndroidBridge && AndroidBridge.saveFile) {
      var where = AndroidBridge.saveFile(name, text, "application/json");
      toast(where ? "Saved to " + where : "Could not save the file"); return;
    }
    var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: "application/json" })); a.download = name;
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    toast("Backup saved");
  }

  /* ---------- wire up ---------- */
  function start() {
    $("app").hidden = false;
    $("classSel").onchange = function () { pickClass(this.value); };
    $("newClass").onclick = openNewClass;
    $("editSkills").onclick = function () { openSkills(); };
    $("showLog").onclick = openLog;
    $("roster").onclick = openRoster;
    $("backup").onclick = backup;
    $("undo").onclick = function () { doUndo(); };
    $("wholeClass").onclick = function () { openAward(S.students(st.cls).map(function (k) { return k.id; }), true); };
    $("selectMode").onclick = function () { st.selecting = !st.selecting; st.picked = []; render(); };
    $("selClear").onclick = function () { st.selecting = false; st.picked = []; render(); };
    $("selAll").onclick = function () { st.picked = S.students(st.cls).map(function (k) { return k.id; }); render(); };
    $("selGive").onclick = function () { if (st.picked.length) openAward(st.picked.slice(), st.picked.length === S.students(st.cls).length); };
    $("board").addEventListener("click", function (ev) {
      var c = ev.target.closest(".card"); if (!c) return;
      var id = c.getAttribute("data-s");
      if (!st.selecting) { openAward([id]); return; }
      var i = st.picked.indexOf(id);
      if (i >= 0) st.picked.splice(i, 1); else st.picked.push(id);
      c.setAttribute("aria-pressed", String(i < 0)); renderSel();
    });
    render();
  }

  document.addEventListener("DOMContentLoaded", function () { gate(start); });
  window.__cc = { state: function () { return st; } };   // for tests
})();
