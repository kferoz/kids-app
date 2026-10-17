/* ============================================================
   Clue Island — App Engine
   Mira the Mapmaker 🧭 crosses five island maps. The child DRAGS
   Mira from her current stop onto the next one; that opens a short
   passage with two comprehension questions. Answer both and the
   trail segment lights up and Mira stays. Miss one and she slides
   back so the passage can be re-read.

   Screens: Home → Map → Clue → Chest, plus a Journal.
   Data-driven by ISLANDS in data.js. Saves under `ci_`.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function stripHtml(s) { var d = el("div", null, s); return d.textContent || d.innerText || ""; }

  /* ---------- storage ---------- */
  function getNum(k) { var v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? 0 : v; }
  function setNum(k, n) { localStorage.setItem(k, String(n)); }
  function getArr(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function setArr(k, a) { localStorage.setItem(k, JSON.stringify(a)); }
  function getObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function setObj(k, o) { localStorage.setItem(k, JSON.stringify(o)); }

  var K = {
    gems: "ci_gems",          // 💎 (read by the Rewards Center)
    trophies: "ci_trophies",
    progress: "ci_progress",  // { islandId: stops cleared }
    chests: "ci_chests",      // island ids finished
    clean: "ci_clean",        // island ids finished with no re-reads
    skills: "ci_skills",      // { skillName: times answered correctly }
    tickets: "rw_tickets"     // SHARED with the Arcade / Prize Wheel
  };

  function gems() { return getNum(K.gems); }
  function addGems(n) { setNum(K.gems, gems() + n); }
  function progress() { return getObj(K.progress); }
  function stopsDone(id) { return progress()[id] || 0; }
  function setStopsDone(id, n) {
    var p = progress();
    if ((p[id] || 0) < n) { p[id] = n; setObj(K.progress, p); }
  }
  function chests() { return getArr(K.chests); }
  function hasChest(id) { return chests().indexOf(id) !== -1; }
  function islandOpen(i) { return i === 0 || hasChest(ISLANDS[i - 1].id); }
  function grantTrophy(id) {
    var a = getArr(K.trophies);
    if (a.indexOf(id) !== -1) return false;
    a.push(id); setArr(K.trophies, a); return true;
  }
  function noteSkill(name) {
    var s = getObj(K.skills);
    s[name] = (s[name] || 0) + 1;
    setObj(K.skills, s);
  }

  /* ---------- read-aloud ---------- */
  var canSpeak = "speechSynthesis" in window;
  var muted = localStorage.getItem("ci_muted") === "1";
  function speak(text) {
    if (!canSpeak || !text || muted) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(stripHtml(String(text)));
      u.rate = 0.92; u.pitch = 1.05; u.lang = "en-US";
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function hush() { if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) {} } }

  /* ---------- confetti ---------- */
  function confetti(n) {
    var box = $("confetti"); if (!box) return;
    var emo = ["💎", "🗺️", "✨", "🎉", "🧭", "🏆"];
    for (var i = 0; i < (n || 26); i++) {
      var p = el("span", "confetti-bit", pick(emo));
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.fontSize = (14 + Math.random() * 20) + "px";
      box.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(p);
    }
  }

  /* ---------- screens ---------- */
  var screens = ["homeScreen", "mapScreen", "clueScreen", "chestScreen", "logScreen"];
  function show(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = $(screens[i]); if (s) s.classList.toggle("active", screens[i] === id);
    }
    window.scrollTo(0, 0);
  }

  /* =========================================================
     HOME
     ========================================================= */
  function renderHome() {
    var list = $("islandList"); list.innerHTML = "";
    ISLANDS.forEach(function (isl, i) {
      var open = islandOpen(i), done = stopsDone(isl.id), total = isl.stops.length;
      var card = el("button", "island-card " + isl.theme +
        (hasChest(isl.id) ? " finished" : "") + (open ? "" : " locked"));
      card.innerHTML =
        '<span class="isl-n">Map ' + isl.n + "</span>" +
        '<span class="isl-emoji">' + (open ? isl.emoji : "🔒") + "</span>" +
        '<span class="isl-name">' + isl.name + "</span>" +
        '<span class="isl-blurb">' + (open ? isl.blurb : "Finish " + ISLANDS[i - 1].name + " to unlock this map.") + "</span>" +
        '<span class="isl-bar"><i style="width:' + Math.round(done / total * 100) + '%"></i></span>' +
        '<span class="isl-foot">' + (open
          ? (hasChest(isl.id) ? isl.chest.icon + " " + isl.chest.name : done + " / " + total + " stops")
          : "locked") + "</span>" +
        '<span class="isl-go">' + (open ? (done ? "Continue →" : "Set out →") : "🔒") + "</span>";
      if (open) card.addEventListener("click", function () { openMap(isl); });
      else card.addEventListener("click", function () { speak("Finish the map before this one first."); });
      list.appendChild(card);
    });
    updateHud();
  }

  function updateHud() {
    if ($("hudGems")) $("hudGems").textContent = "💎 " + gems();
    if ($("hudChests")) $("hudChests").textContent = "🧰 " + chests().length + "/" + ISLANDS.length;
    if ($("muteBtn")) $("muteBtn").textContent = muted ? "🔇" : "🔊";
  }

  /* =========================================================
     MAP — the draggable trail
     ========================================================= */
  var island = null;      // current island
  var at = 0;             // how many stops are cleared (also = index of the NEXT stop)
  var retriesThisIsland = 0;

  function openMap(isl) {
    island = isl;
    at = stopsDone(isl.id);
    if (at >= isl.stops.length) at = isl.stops.length;   // finished map: re-walkable from the chest
    retriesThisIsland = 0;
    $("mapScreen").className = "screen " + isl.theme + " active";
    $("mapTitle").innerHTML = isl.emoji + " " + isl.name;
    drawMap();
    show("mapScreen");
  }

  function drawMap() {
    var stops = island.stops;
    $("mapProgress").textContent = Math.min(at, stops.length) + "/" + stops.length;

    /* trail: landing point -> stop 1 -> ... -> last stop.
       Segment j joins path[j] to path[j+1], so it is "walked" once at > j. */
    var path = [island.start].concat(stops);
    var svg = $("trail");
    svg.innerHTML = "";
    for (var i = 0; i < path.length - 1; i++) {
      var a = path[i], b = path[i + 1];
      var seg = document.createElementNS("http://www.w3.org/2000/svg", "line");
      seg.setAttribute("x1", a.x); seg.setAttribute("y1", a.y);
      seg.setAttribute("x2", b.x); seg.setAttribute("y2", b.y);
      seg.setAttribute("class", "seg" + (i < at ? " walked" : ""));
      svg.appendChild(seg);
    }

    /* map decoration: a compass rose in the corner */
    var rose = el("div", "rose", '<b>N</b><span>✦</span>');
    rose.setAttribute("aria-hidden", "true");

    /* the boat Mira arrived in, marking the start of the trail */
    var boat = el("div", "boat", "⛵");
    boat.style.left = island.start.x + "%";
    boat.style.top = island.start.y + "%";
    boat.setAttribute("aria-hidden", "true");

    /* stop markers */
    var layer = $("stopLayer"); layer.innerHTML = "";
    stops.forEach(function (s, i) {
      var state = i < at ? "done" : i === at ? "next" : "locked";
      var node = el("button", "stop " + state);
      node.style.left = s.x + "%";
      node.style.top = s.y + "%";
      node.setAttribute("data-i", i);
      node.setAttribute("aria-label", "Stop " + (i + 1) + ": " + s.name + " (" + state + ")");
      // the last stop is the treasure — show it as X marks the spot, not a padlock
      var last = i === stops.length - 1;
      var face = state === "done" ? "✅" : state === "next" ? s.emoji : (last ? "❌" : "🔒");
      node.innerHTML =
        '<span class="stop-dot' + (last ? " treasure" : "") + '">' + face + "</span>" +
        '<span class="stop-name">' + (last && state === "locked" ? "The Treasure" : s.name) + "</span>";
      // tapping the next stop works too — dragging is fun, but must never be the only way in
      if (state === "next") node.addEventListener("click", function () { enterStop(i); });
      else if (state === "done") node.addEventListener("click", function () { enterStop(i); });
      else node.addEventListener("click", function () {
        flash("Follow the trail in order — the next stop is " + stops[at].name + ".");
      });
      layer.appendChild(node);
    });
    layer.appendChild(boat);
    layer.appendChild(rose);

    /* Mira stands where she has already GOT to, never on the stop she must reach */
    var here = tokenSpot();
    var token = $("token");
    token.style.left = here.x + "%";
    token.style.top = here.y + "%";
    token.classList.toggle("finished", at >= stops.length);

    $("mapHint").innerHTML = at >= stops.length
      ? "🧰 This map is complete! Tap any stop to read it again."
      : "Drag <b>Mira 🧭</b> onto <b>" + stops[at].name + "</b> — or just tap the stop.";
  }

  function flash(msg) {
    var h = $("mapHint");
    h.textContent = msg;
    h.classList.add("warn");
    setTimeout(function () { h.classList.remove("warn"); drawMapHintOnly(); }, 1800);
  }
  function drawMapHintOnly() {
    var stops = island.stops;
    $("mapHint").innerHTML = at >= stops.length
      ? "🧰 This map is complete! Tap any stop to read it again."
      : "Drag <b>Mira 🧭</b> onto <b>" + stops[at].name + "</b> — or just tap the stop.";
  }

  /* ---------- pointer dragging (works with mouse, touch and pen) ---------- */
  var dragging = false, dragId = null;

  /* Mira's resting place: the landing point until stop 1 is cleared, then the
     last stop she actually reached. Never the stop she still has to drag to. */
  function tokenSpot() {
    return at === 0 ? island.start : island.stops[Math.min(at, island.stops.length) - 1];
  }
  function tokenHome() {
    var here = tokenSpot();
    var token = $("token");
    token.style.left = here.x + "%";
    token.style.top = here.y + "%";
  }

  function pctFromEvent(e) {
    var box = $("mapBox").getBoundingClientRect();
    return {
      x: (e.clientX - box.left) / box.width * 100,
      y: (e.clientY - box.top) / box.height * 100
    };
  }

  function onDown(e) {
    if (!island || at >= island.stops.length) return;
    dragging = true; dragId = e.pointerId;
    var token = $("token");
    token.classList.add("dragging");
    try { token.setPointerCapture(e.pointerId); } catch (err) {}
    var next = $("stopLayer").querySelector(".stop.next");
    if (next) next.classList.add("hot");
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging || e.pointerId !== dragId) return;
    var p = pctFromEvent(e);
    var token = $("token");
    token.style.left = Math.max(0, Math.min(100, p.x)) + "%";
    token.style.top = Math.max(0, Math.min(100, p.y)) + "%";

    // highlight the target while Mira is near enough to drop
    var target = island.stops[at];
    var over = near(p, target);
    token.classList.toggle("over", over);
    var next = $("stopLayer").querySelector(".stop.next");
    if (next) next.classList.toggle("armed", over);
    e.preventDefault();
  }

  function onUp(e) {
    if (!dragging || e.pointerId !== dragId) return;
    dragging = false; dragId = null;
    var token = $("token");
    token.classList.remove("dragging", "over");
    var next = $("stopLayer").querySelector(".stop.next");
    if (next) next.classList.remove("hot", "armed");

    var p = pctFromEvent(e);
    if (near(p, island.stops[at])) {
      enterStop(at);
    } else {
      token.classList.add("snapback");
      tokenHome();
      setTimeout(function () { token.classList.remove("snapback"); }, 420);
    }
  }

  /* is a point close enough to a stop to count as a drop?
     the box is wider than it is tall, so compare in PIXELS not percent. */
  function near(p, stop) {
    var box = $("mapBox").getBoundingClientRect();
    var dx = (p.x - stop.x) / 100 * box.width;
    var dy = (p.y - stop.y) / 100 * box.height;
    return Math.sqrt(dx * dx + dy * dy) <= Math.max(58, box.width * 0.075);
  }

  /* =========================================================
     CLUE — passage + two questions
     ========================================================= */
  var stopIdx = 0, qIdx = 0, missedHere = false, replay = false;

  function enterStop(i) {
    hush();
    stopIdx = i;
    qIdx = 0;
    missedHere = false;
    replay = i < at;                 // re-reading a stop already cleared
    var s = island.stops[i];
    $("clueScreen").className = "screen " + island.theme + " active";
    $("clueTitle").innerHTML = s.emoji + " " + s.name;
    $("cluePlace").textContent = "Stop " + (i + 1) + " of " + island.stops.length;
    $("passageTitle").textContent = s.passage.title;
    $("passageText").textContent = s.passage.text;
    renderQuestion();
    show("clueScreen");
    speak(s.passage.title + ". " + s.passage.text);
  }

  function renderQuestion() {
    var s = island.stops[stopIdx], q = s.qs[qIdx];
    $("skillTag").textContent = q.skill;
    $("qNum").textContent = "Question " + (qIdx + 1) + " of " + s.qs.length;
    $("qText").textContent = q.q;
    $("feedback").className = "feedback";
    $("feedback").innerHTML = "";

    var wrap = $("choices"); wrap.innerHTML = "";
    var opts = shuffle([q.a].concat(q.wrong));
    opts.forEach(function (text) {
      var b = el("button", "choice", text);
      b.addEventListener("click", function () { answer(b, text === q.a, q); });
      wrap.appendChild(b);
    });
  }

  function answer(btn, right, q) {
    if (btn.disabled) return;
    if (window.Tracker) Tracker.answer(!!right, q.skill, { island: (island && (island.name || island.title || island.id)) });
    var fb = $("feedback");

    if (right) {
      [].forEach.call($("choices").children, function (b) { b.disabled = true; });
      btn.classList.add("right");
      fb.className = "feedback good";
      var firstTry = !btn.classList.contains("afterMiss");
      var won = 0;
      if (!replay) {
        won = missedHere ? CI_GEM_RETRY : CI_GEM_FIRST_TRY;
        addGems(won);
        noteSkill(q.skill);
      }
      fb.innerHTML = "✅ " + pick(CI_CHEERS) +
        (won ? '<span class="gain">💎 +' + won + "</span>" : '<span class="gain">Re-reading — no gems this time</span>') +
        '<span class="why">' + q.why + "</span>";
      speak(pick(CI_CHEERS));
      setTimeout(nextQuestion, 1700);
    } else {
      btn.classList.add("wrong");
      btn.disabled = true;
      missedHere = true;
      if (!replay) retriesThisIsland++;
      fb.className = "feedback try";
      fb.innerHTML = "🔍 " + pick(CI_RETRIES) +
        '<span class="why">💡 ' + q.lookFor + "</span>";
      speak("Not quite. Read the passage again.");
      // mark the remaining choices so a later correct answer knows it was a retry
      [].forEach.call($("choices").children, function (b) { b.classList.add("afterMiss"); });
      $("passage").classList.add("nudge");
      setTimeout(function () { $("passage").classList.remove("nudge"); }, 700);
    }
  }

  function nextQuestion() {
    var s = island.stops[stopIdx];
    qIdx++;
    if (qIdx < s.qs.length) { missedHere = false; return renderQuestion(); }
    clearStop();
  }

  function clearStop() {
    hush();
    if (!replay && stopIdx === at) {
      at++;
      setStopsDone(island.id, at);
      if (grantTrophy("first-stop")) { /* first stop ever */ }
      if (gems() >= 60) grantTrophy("gem-hunter");
      if (Object.keys(getObj(K.skills)).length >= 12) grantTrophy("all-skills");
      if (at >= island.stops.length) return openChest();
    }
    drawMap();
    show("mapScreen");
    confetti(10);
  }

  /* =========================================================
     CHEST — island complete
     ========================================================= */
  function openChest() {
    var first = !hasChest(island.id);
    var clean = retriesThisIsland === 0;
    var newTrophies = [];

    if (first) {
      var c = chests(); c.push(island.id); setArr(K.chests, c);
      setNum(K.tickets, getNum(K.tickets) + 1);
      if (grantTrophy("first-chest")) newTrophies.push(byId(CI_TROPHIES, "first-chest"));
      if (chests().length >= 3 && grantTrophy("half-way")) newTrophies.push(byId(CI_TROPHIES, "half-way"));
      if (chests().length >= ISLANDS.length && grantTrophy("mapmaker")) newTrophies.push(byId(CI_TROPHIES, "mapmaker"));
    }
    if (clean) {
      var cl = getArr(K.clean);
      if (cl.indexOf(island.id) === -1) { cl.push(island.id); setArr(K.clean, cl); }
      if (grantTrophy("sharp-eyes")) newTrophies.push(byId(CI_TROPHIES, "sharp-eyes"));
    }

    var html =
      '<div class="chest-icon">' + island.chest.icon + "</div>" +
      "<h2>" + island.name + " complete!</h2>" +
      '<p class="chest-sub">You opened <b>' + island.chest.name + "</b>.</p>" +
      '<div class="chest-stats">' +
        "<span>💎 " + gems() + " gems</span>" +
        "<span>📖 " + island.stops.length + " passages read</span>" +
        "<span>" + (clean ? "👁️ No re-reads — perfect!" : "🔍 " + retriesThisIsland + " re-read" + (retriesThisIsland === 1 ? "" : "s")) + "</span>" +
        (first ? "<span>🎟️ +1 ticket</span>" : "<span>↺ Revisited</span>") +
      "</div>";

    if (newTrophies.length) {
      html += '<div class="chest-new"><h3>🏆 New Trophy!</h3>' + newTrophies.map(function (t) {
        return t ? '<div class="new-item">' + t.icon + " <b>" + t.name + "</b> — " + t.desc + "</div>" : "";
      }).join("") + "</div>";
    }

    var idx = ISLANDS.indexOf(island), next = ISLANDS[idx + 1];
    if (next) {
      html += '<p class="chest-next">A new map is unlocked: <b>' + next.emoji + " " + next.name + "</b></p>";
      $("nextIslandBtn").hidden = false;
      $("nextIslandBtn").textContent = "Sail to " + next.name + " →";
      $("nextIslandBtn").onclick = function () { openMap(next); };
    } else {
      html += '<p class="chest-next">You have read your way across every island. 🧭</p>';
      $("nextIslandBtn").hidden = true;
    }

    $("chestBox").innerHTML = html;
    show("chestScreen");
    confetti(34);
    speak("Island complete! You opened " + island.chest.name + ".");
    updateHud();
  }

  /* =========================================================
     JOURNAL
     ========================================================= */
  function renderLog() {
    var totalStops = ISLANDS.reduce(function (n, i) { return n + i.stops.length; }, 0);
    var read = ISLANDS.reduce(function (n, i) { return n + Math.min(stopsDone(i.id), i.stops.length); }, 0);
    var skills = getObj(K.skills);
    var skillCount = 0, answered = 0;
    for (var s in skills) if (skills.hasOwnProperty(s)) { skillCount++; answered += skills[s]; }

    $("jrTotals").innerHTML =
      '<div class="stat"><b>💎 ' + gems() + "</b><span>gems</span></div>" +
      '<div class="stat"><b>📖 ' + read + "/" + totalStops + "</b><span>passages</span></div>" +
      '<div class="stat"><b>🧰 ' + chests().length + "/" + ISLANDS.length + "</b><span>chests</span></div>" +
      '<div class="stat"><b>🧠 ' + skillCount + "</b><span>skills</span></div>";

    var row = $("chestRow"); row.innerHTML = "";
    ISLANDS.forEach(function (i) {
      var have = hasChest(i.id), cleanly = getArr(K.clean).indexOf(i.id) !== -1;
      var d = el("div", "chest-card" + (have ? " have" : ""));
      d.innerHTML =
        '<span class="cc-icon">' + (have ? i.chest.icon : "🔒") + "</span>" +
        "<b>" + (have ? i.chest.name : "???") + "</b>" +
        '<span class="cc-from">' + i.emoji + " " + i.name + "</span>" +
        (cleanly ? '<span class="cc-tag">👁️ no re-reads</span>' : "");
      row.appendChild(d);
    });

    /* every skill that appears anywhere in the data, with how often it was answered */
    var allSkills = [];
    ISLANDS.forEach(function (i) {
      i.stops.forEach(function (st) {
        st.qs.forEach(function (q) { if (allSkills.indexOf(q.skill) === -1) allSkills.push(q.skill); });
      });
    });
    allSkills.sort();
    var grid = $("skillGrid"); grid.innerHTML = "";
    allSkills.forEach(function (name) {
      var n = skills[name] || 0;
      var d = el("div", "skill-chip" + (n ? " on" : ""));
      d.innerHTML = "<b>" + name + "</b><span>" + (n ? n + "×" : "not yet") + "</span>";
      grid.appendChild(d);
    });

    var tw = $("trophyWall"); tw.innerHTML = "";
    var got = getArr(K.trophies);
    CI_TROPHIES.forEach(function (t) {
      var have = got.indexOf(t.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? t.icon : "🔒") + "</span><b>" + t.name +
        '</b><span class="wi-desc">' + t.desc + "</span>";
      tw.appendChild(d);
    });

    show("logScreen");
  }

  /* =========================================================
     WIRING
     ========================================================= */
  function goHome() { hush(); renderHome(); show("homeScreen"); }

  function wire() {
    $("mapBack").addEventListener("click", goHome);
    $("clueBack").addEventListener("click", function () { hush(); drawMap(); show("mapScreen"); });
    $("chestHome").addEventListener("click", goHome);
    $("logBtn").addEventListener("click", renderLog);
    $("logBack").addEventListener("click", goHome);
    $("readBtn").addEventListener("click", function () {
      var s = island.stops[stopIdx];
      hush(); speak(s.passage.title + ". " + s.passage.text);
    });
    $("muteBtn").addEventListener("click", function () {
      muted = !muted;
      localStorage.setItem("ci_muted", muted ? "1" : "0");
      if (muted) hush();
      updateHud();
    });

    var token = $("token");
    token.addEventListener("pointerdown", onDown);
    token.addEventListener("pointermove", onMove);
    token.addEventListener("pointerup", onUp);
    token.addEventListener("pointercancel", onUp);
    // keyboard: Enter on the token walks to the next stop
    token.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && island && at < island.stops.length) {
        e.preventDefault(); enterStop(at);
      }
    });
    // keep Mira on her stop when the map is resized
    window.addEventListener("resize", function () {
      if (island && $("mapScreen").classList.contains("active") && !dragging) tokenHome();
    });

    // 1-4 picks an answer on the clue screen
    document.addEventListener("keydown", function (e) {
      if (!$("clueScreen").classList.contains("active")) return;
      if (e.key >= "1" && e.key <= "4") {
        var b = $("choices").children[parseInt(e.key, 10) - 1];
        if (b && !b.disabled) b.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire();
    renderHome();
    show("homeScreen");
  });
})();
