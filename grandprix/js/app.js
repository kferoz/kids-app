/* ============================================================
   Turbo Grand Prix — Race Engine
   You + 3 rivals run GP_LAPS questions. A correct answer moves
   your car down the track; answering fast adds a speed bonus and
   a streak triggers turbo. Whoever is furthest at the flag wins.

   Screens: Home → Race → Result, plus a Garage (upgrades,
   standings, trophies). Saves to localStorage under `gp_`.
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
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  /* ---------- storage ---------- */
  function getNum(k) { var v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? 0 : v; }
  function setNum(k, n) { localStorage.setItem(k, String(n)); }
  function getArr(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function setArr(k, a) { localStorage.setItem(k, JSON.stringify(a)); }
  function getObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function setObj(k, o) { localStorage.setItem(k, JSON.stringify(o)); }

  var K = {
    points: "gp_points",     // 🏅 championship points (read by the Rewards Center)
    trophies: "gp_trophies", // trophy ids
    season: "gp_season",     // { gpId: { pos, pts } } — best result per race
    parts: "gp_parts",       // 🔧 parts to spend
    earned: "gp_earned",     // 🔧 parts earned in total (for the Gearhead trophy)
    upgrades: "gp_upgrades", // { engine, tires, nitro } levels 0-3
    trial: "gp_trial",       // { gpId: best correct count in a Time Trial }
    streak: "gp_beststreak", // longest answer streak
    tickets: "rw_tickets"    // SHARED with the Arcade / Prize Wheel
  };

  function points() { return getNum(K.points); }
  function parts() { return getNum(K.parts); }
  function season() { return getObj(K.season); }
  function resultFor(id) { return season()[id] || null; }
  function racesDone() { return Object.keys(season()).length; }
  function wins() {
    var s = season(), n = 0;
    for (var k in s) if (s.hasOwnProperty(k) && s[k].pos === 1) n++;
    return n;
  }
  function upgrades() {
    var u = getObj(K.upgrades);
    return { engine: u.engine || 0, tires: u.tires || 0, nitro: u.nitro || 0 };
  }
  function grantTrophy(id) {
    var a = getArr(K.trophies);
    if (a.indexOf(id) !== -1) return false;
    a.push(id); setArr(K.trophies, a); return true;
  }
  function rank() {
    var p = points(), best = GP_RANKS[0];
    GP_RANKS.forEach(function (r) { if (p >= r.need) best = r; });
    return best;
  }

  /* ---------- tuning: upgrades change the real race maths ---------- */
  function tuning() {
    var u = upgrades();
    return {
      base: 9 + u.engine * 0.8,          // distance per correct answer
      speedMax: 3 + u.tires * 0.5,       // max speed bonus
      missRoll: 2 + u.tires * 0.7,       // distance you still roll after a miss
      turboAt: u.nitro >= 2 ? 2 : 3,     // streak needed for turbo
      turboAdd: u.nitro >= 3 ? 5 : (u.nitro >= 1 ? 4 : 3)
    };
  }

  /* ---------- confetti ---------- */
  function confetti(n) {
    var box = $("confetti"); if (!box) return;
    var emo = ["🏁", "🏆", "✨", "🎉", "🔧", "⭐"];
    for (var i = 0; i < (n || 26); i++) {
      var p = el("span", "confetti-bit", emo[Math.floor(Math.random() * emo.length)]);
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.fontSize = (14 + Math.random() * 20) + "px";
      box.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(p);
    }
  }

  /* ---------- screens ---------- */
  var screens = ["homeScreen", "raceScreen", "resultScreen", "garageScreen"];
  function show(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = $(screens[i]); if (s) s.classList.toggle("active", screens[i] === id);
    }
    window.scrollTo(0, 0);
  }

  /* =========================================================
     HOME — the paddock
     ========================================================= */
  function renderHome() {
    var list = $("gpList"); list.innerHTML = "";
    GRANDS_PRIX.forEach(function (gp) {
      var res = resultFor(gp.id);
      var card = el("button", "gp-card" + (res ? " raced" : "") + (res && res.pos === 1 ? " won" : ""));
      card.innerHTML =
        '<span class="gp-round">Round ' + gp.n + "</span>" +
        '<span class="gp-emoji">' + gp.emoji + "</span>" +
        '<span class="gp-name">' + gp.name + "</span>" +
        '<span class="gp-subject ' + gp.subject.toLowerCase() + '">' + gp.subject + "</span>" +
        '<span class="gp-topic">' + gp.topic + "</span>" +
        '<span class="gp-result">' + (res ? posLabel(res.pos) + " · " + res.pts + " pts" : "not raced yet") + "</span>" +
        '<span class="gp-go">' + (res ? "Race again →" : "Enter race →") + "</span>";
      card.addEventListener("click", function () { startRace(gp, false); });
      list.appendChild(card);
    });

    var tt = $("ttList"); tt.innerHTML = "";
    var best = getObj(K.trial);
    GRANDS_PRIX.forEach(function (gp) {
      var b = best[gp.id];
      var chip = el("button", "tt-chip" + (b === GP_LAPS ? " perfect" : ""));
      chip.innerHTML = gp.emoji + " " + gp.name + '<span>' + (b ? "best " + b + "/" + GP_LAPS : "—") + "</span>";
      chip.addEventListener("click", function () { startRace(gp, true); });
      tt.appendChild(chip);
    });

    var done = racesDone();
    $("seasonFill").style.width = Math.round(done / GRANDS_PRIX.length * 100) + "%";
    $("seasonText").textContent = "Season " + done + " / " + GRANDS_PRIX.length + " races · " +
      wins() + " win" + (wins() === 1 ? "" : "s");
    updateHud();
  }
  function posLabel(p) { return ["🥇 1st", "🥈 2nd", "🥉 3rd", "4th"][p - 1] || (p + "th"); }

  function updateHud() {
    var r = rank();
    if ($("hudRank")) $("hudRank").textContent = r.icon + " " + r.title;
    if ($("hudPts")) $("hudPts").textContent = "🏅 " + points() + " pts";
    if ($("hudParts")) $("hudParts").textContent = "🔧 " + parts();
    if ($("partsPill")) $("partsPill").textContent = "🔧 " + parts();
  }

  /* =========================================================
     RACE
     ========================================================= */
  var gp = null, trial = false;
  var lap = 0, correct = 0, streak = 0, bestStreak = 0;
  var me = 0, rivals = [], q = null, answered = false;
  var timer = null, timeLeft = 0, tune = null;

  function startRace(g, isTrial) {
    gp = g; trial = !!isTrial;
    lap = 0; correct = 0; streak = 0; bestStreak = 0; me = 0;
    tune = tuning();
    rivals = RIVALS.map(function (r) { return { r: r, d: 0 }; });
    $("raceTitle").innerHTML = gp.emoji + " " + gp.name + (trial ? " — Time Trial" : "");
    $("raceQuit").textContent = trial ? "← Stop" : "← Retire";
    show("raceScreen");
    nextQuestion();
  }

  function nextQuestion() {
    answered = false;
    q = QMAKERS[gpPick(gp.gens)]();
    $("lapPill").textContent = "Lap " + (lap + 1) + "/" + GP_LAPS;
    $("streakPill").textContent = "STREAK " + streak;
    $("streakPill").classList.toggle("hot", streak >= tune.turboAt);
    $("verdict").className = "verdict";
    $("verdict").innerHTML = "";
    $("qText").innerHTML = q.q;

    var ans = $("answers"), form = $("typeForm"), input = $("typeInput");
    ans.innerHTML = "";
    if (q.k === "type") {
      ans.hidden = true; form.hidden = false;
      input.value = ""; input.disabled = false;
      setTimeout(function () { input.focus(); }, 60);
    } else {
      form.hidden = true; ans.hidden = false;
      q.choices.forEach(function (c) {
        var b = el("button", "answer", c.label);
        b.addEventListener("click", function () { submit(c.key, b); });
        ans.appendChild(b);
      });
    }
    drawTrack();
    startTimer();
  }

  /* the speed bar — running out never blocks you, it only costs the bonus */
  function startTimer() {
    stopTimer();
    timeLeft = GP_ANSWER_SECONDS;
    paintSpeed();
    timer = setInterval(function () {
      timeLeft -= 0.1;
      if (timeLeft <= 0) { timeLeft = 0; stopTimer(); }
      paintSpeed();
    }, 100);
  }
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function paintSpeed() {
    var pct = Math.max(0, timeLeft / GP_ANSWER_SECONDS);
    var fill = $("speedFill");
    fill.style.width = Math.round(pct * 100) + "%";
    fill.className = pct > .5 ? "hi" : pct > .2 ? "mid" : "lo";
    $("speedLabel").textContent = pct > 0
      ? "SPEED BONUS +" + (Math.round(pct * tune.speedMax * 10) / 10)
      : "NO SPEED BONUS — take your time";
  }

  function submit(key, btnEl) {
    if (answered) return;
    answered = true;
    stopTimer();

    var right = q.k === "type"
      ? normalize(key) === normalize(q.answer) ||
        (q.accept || []).some(function (a) { return normalize(a) === normalize(key); })
      : key === q.answerKey;
      if (window.Tracker) Tracker.answer(right, (gp && (gp.name || gp.title || gp.id)), { trial: trial });

    var gained;
    if (right) {
      correct++; streak++;
      if (streak > bestStreak) bestStreak = streak;
      var speedBonus = Math.max(0, timeLeft / GP_ANSWER_SECONDS) * tune.speedMax;
      var turbo = streak >= tune.turboAt ? tune.turboAdd : 0;
      gained = tune.base + speedBonus + turbo;
      me += gained;
      $("verdict").className = "verdict good";
      $("verdict").innerHTML = "✅ " + gpPick(GP_CHEERS) +
        '<span class="gain">+' + gained.toFixed(1) + " m" + (turbo ? "  🔥 TURBO" : "") + "</span>" +
        '<span class="why">' + q.why + "</span>";
      if (btnEl) btnEl.classList.add("right");
    } else {
      streak = 0;
      gained = tune.missRoll;
      me += gained;
      $("verdict").className = "verdict bad";
      $("verdict").innerHTML = "❌ " + gpPick(GP_MISSES) +
        '<span class="gain">Answer: <b>' + esc(q.k === "type" ? q.answer : q.answerKey) + "</b></span>" +
        '<span class="why">' + q.why + "</span>";
      if (btnEl) btnEl.classList.add("wrong");
      // light up the correct one
      [].forEach.call($("answers").children, function (b) {
        if (b.textContent === q.answerKey) b.classList.add("right");
      });
    }

    // rivals take their turn (Time Trial has no rivals)
    if (!trial) {
      rivals.forEach(function (rv) { rv.d += rv.r.pace * (0.9 + Math.random() * 0.2); });
    }

    [].forEach.call($("answers").children, function (b) { b.disabled = true; });
    $("typeInput").disabled = true;
    $("streakPill").textContent = "STREAK " + streak;
    $("streakPill").classList.toggle("hot", streak >= tune.turboAt);
    drawTrack();

    lap++;
    var wait = right ? 1500 : 2600;   // linger on a miss so the explanation can be read
    setTimeout(function () {
      if (lap >= GP_LAPS) return finishRace();
      nextQuestion();
    }, wait);
  }

  function normalize(s) { return String(s == null ? "" : s).trim().toLowerCase().replace(/\s+/g, " "); }

  /* the live position board */
  function drawTrack() {
    var cars = [{ name: "You", emoji: "🏎️", d: me, color: "#ffd53d", you: true }];
    if (!trial) {
      rivals.forEach(function (rv) {
        cars.push({ name: rv.r.name, emoji: rv.r.emoji, d: rv.d, color: rv.r.color });
      });
    }
    var max = Math.max(1, Math.max.apply(null, cars.map(function (c) { return c.d; })), GP_LAPS * 11);
    var order = cars.slice().sort(function (a, b) { return b.d - a.d; });

    var t = $("track"); t.innerHTML = "";
    cars.forEach(function (c) {
      var pos = order.indexOf(c) + 1;
      var lane = el("div", "lane" + (c.you ? " you" : ""));
      lane.innerHTML =
        '<span class="lane-pos">' + pos + "</span>" +
        '<span class="lane-name">' + c.name + "</span>" +
        '<span class="lane-road"><i style="width:' + Math.min(100, c.d / max * 100) + '%;background:' + c.color + '"></i>' +
        '<b style="left:' + Math.min(96, c.d / max * 96) + '%">' + c.emoji + "</b></span>" +
        '<span class="lane-dist">' + Math.round(c.d) + " m</span>";
      t.appendChild(lane);
    });
  }

  /* =========================================================
     RESULT
     ========================================================= */
  function finishRace() {
    if (window.Tracker) Tracker.complete(trial ? "time-trial" : "race", correct, GP_LAPS, { item: (gp && (gp.name || gp.title || gp.id)), bestStreak: bestStreak });
    stopTimer();
    if (bestStreak > getNum(K.streak)) setNum(K.streak, bestStreak);

    var newTrophies = [];
    if (bestStreak >= 10 && grantTrophy("turbo-master")) newTrophies.push(byId(GP_TROPHIES, "turbo-master"));
    if (correct === GP_LAPS && grantTrophy("clean-sheet")) newTrophies.push(byId(GP_TROPHIES, "clean-sheet"));

    var html;
    if (trial) {
      var best = getObj(K.trial);
      var isBest = !best[gp.id] || correct > best[gp.id];
      if (isBest) { best[gp.id] = correct; setObj(K.trial, best); }
      html =
        '<div class="res-flag">⏱️</div><h2>Time Trial complete</h2>' +
        '<p class="res-sub">' + gp.emoji + " " + gp.name + "</p>" +
        '<div class="res-score">' + correct + " / " + GP_LAPS + "</div>" +
        '<div class="res-stats"><span>🔥 Best streak ' + bestStreak + "</span>" +
        "<span>" + (isBest ? "🎉 New personal best!" : "Best: " + best[gp.id] + "/" + GP_LAPS) + "</span></div>" +
        '<p class="res-note">Time Trials are practice — they don\'t score championship points.</p>';
      $("nextGpBtn").textContent = "↺ Run Again";
      $("nextGpBtn").onclick = function () { startRace(gp, true); };
    } else {
      var all = [{ name: "You", emoji: "🏎️", d: me, you: true }]
        .concat(rivals.map(function (rv) { return { name: rv.r.name, emoji: rv.r.emoji, d: rv.d }; }));
      all.sort(function (a, b) { return b.d - a.d; });
      var pos = all.findIndex(function (c) { return c.you; }) + 1;
      var pts = GP_POINTS[pos - 1], prz = GP_PARTS[pos - 1];

      // championship points & parts are awarded on your BEST result for each race
      var s = season(), prev = s[gp.id];
      var improved = !prev || pts > prev.pts;
      if (improved) {
        var delta = pts - (prev ? prev.pts : 0);
        setNum(K.points, points() + delta);
        s[gp.id] = { pos: pos, pts: pts };
        setObj(K.season, s);
      }
      setNum(K.parts, parts() + prz);
      setNum(K.earned, getNum(K.earned) + prz);
      setNum(K.tickets, getNum(K.tickets) + 1);

      if (pts > 0 && grantTrophy("first-points")) newTrophies.push(byId(GP_TROPHIES, "first-points"));
      if (pos === 1 && grantTrophy("first-win")) newTrophies.push(byId(GP_TROPHIES, "first-win"));
      if (getNum(K.earned) >= 50 && grantTrophy("gearhead")) newTrophies.push(byId(GP_TROPHIES, "gearhead"));
      if (racesDone() >= GRANDS_PRIX.length && points() >= 60 && grantTrophy("season-champ"))
        newTrophies.push(byId(GP_TROPHIES, "season-champ"));
      if (wins() >= GRANDS_PRIX.length && grantTrophy("track-master"))
        newTrophies.push(byId(GP_TROPHIES, "track-master"));

      html =
        '<div class="res-flag">' + (pos === 1 ? "🏆" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : "🏁") + "</div>" +
        "<h2>" + posLabel(pos) + " place</h2>" +
        '<p class="res-sub">' + gp.emoji + " " + gp.name + " · " + correct + "/" + GP_LAPS + " correct</p>" +
        '<div class="podium">' + all.map(function (c, i) {
          return '<div class="pod-row' + (c.you ? " you" : "") + '"><span>' + (i + 1) + "</span>" +
            "<b>" + c.emoji + " " + c.name + "</b><i>" + Math.round(c.d) + " m</i></div>";
        }).join("") + "</div>" +
        '<div class="res-stats">' +
          "<span>🏅 " + pts + " championship pts" + (improved ? "" : " (best kept)") + "</span>" +
          "<span>🔧 +" + prz + " parts</span>" +
          "<span>🔥 Best streak " + bestStreak + "</span>" +
          "<span>🎟️ +1 ticket</span>" +
        "</div>";

      var next = GRANDS_PRIX[GRANDS_PRIX.indexOf(gp) + 1];
      if (next) {
        $("nextGpBtn").textContent = "Next: " + next.name + " →";
        $("nextGpBtn").onclick = function () { startRace(next, false); };
      } else {
        $("nextGpBtn").textContent = "↺ Race Again";
        $("nextGpBtn").onclick = function () { startRace(gp, false); };
      }
    }

    if (newTrophies.length) {
      html += '<div class="res-new"><h3>🏆 New Trophy!</h3>' + newTrophies.map(function (t) {
        return t ? '<div class="new-item">' + t.icon + " <b>" + t.name + "</b> — " + t.desc + "</div>" : "";
      }).join("") + "</div>";
    }

    $("resultBox").innerHTML = html;
    show("resultScreen");
    if (!trial || correct >= GP_LAPS - 1) confetti();
    updateHud();
  }

  /* =========================================================
     GARAGE — upgrades, standings, trophies
     ========================================================= */
  function renderGarage() {
    var u = upgrades(), t = tuning();

    $("grTotals").innerHTML =
      '<div class="stat"><b>' + rank().icon + " " + rank().title + "</b><span>rank</span></div>" +
      '<div class="stat"><b>🏅 ' + points() + "</b><span>points</span></div>" +
      '<div class="stat"><b>🏁 ' + racesDone() + "/" + GRANDS_PRIX.length + "</b><span>raced</span></div>" +
      '<div class="stat"><b>🥇 ' + wins() + "</b><span>wins</span></div>" +
      '<div class="stat"><b>🔥 ' + getNum(K.streak) + "</b><span>best streak</span></div>";

    var list = $("upgList"); list.innerHTML = "";
    UPGRADES.forEach(function (up) {
      var lvl = u[up.id], maxed = lvl >= 3;
      var cost = maxed ? 0 : UPGRADE_COST[lvl];
      var row = el("div", "upg" + (maxed ? " maxed" : ""));
      row.innerHTML =
        '<span class="upg-ic">' + up.icon + "</span>" +
        '<span class="upg-info"><b>' + up.name + " · Level " + lvl + "</b>" +
          "<span>" + up.desc + "</span>" +
          '<span class="upg-now">Now: ' + up.levels[lvl] + (maxed ? "" : "  →  " + up.levels[lvl + 1]) + "</span>" +
        "</span>" +
        '<span class="upg-pips">' + [0, 1, 2, 3].map(function (i) {
          return '<i class="' + (i <= lvl ? "on" : "") + '"></i>';
        }).join("") + "</span>";
      var buy = el("button", "upg-buy", maxed ? "MAXED" : "🔧 " + cost);
      buy.disabled = maxed || parts() < cost;
      buy.addEventListener("click", function () {
        if (maxed || parts() < cost) return;
        setNum(K.parts, parts() - cost);
        var next = upgrades(); next[up.id] = lvl + 1; setObj(K.upgrades, next);
        var n = upgrades();
        if (n.engine === 3 && n.tires === 3 && n.nitro === 3) grantTrophy("full-tune");
        confetti(10);
        renderGarage(); updateHud();
      });
      row.appendChild(buy);
      list.appendChild(row);
    });

    var sd = $("standings"); sd.innerHTML = "";
    var s = season();
    GRANDS_PRIX.forEach(function (g) {
      var r = s[g.id];
      var row = el("div", "std-row" + (r ? " done" : ""));
      row.innerHTML =
        '<span class="std-n">R' + g.n + "</span>" +
        '<span class="std-name">' + g.emoji + " " + g.name + "</span>" +
        '<span class="std-pos">' + (r ? posLabel(r.pos) : "—") + "</span>" +
        '<span class="std-pts">' + (r ? r.pts : 0) + "</span>";
      sd.appendChild(row);
    });
    sd.appendChild(el("div", "std-row total",
      '<span class="std-n"></span><span class="std-name"><b>Season total</b></span>' +
      '<span class="std-pos">' + rank().icon + " " + rank().title + "</span>" +
      '<span class="std-pts"><b>' + points() + "</b></span>"));

    var tw = $("trophyWall"); tw.innerHTML = "";
    var got = getArr(K.trophies);
    GP_TROPHIES.forEach(function (tr) {
      var have = got.indexOf(tr.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? tr.icon : "🔒") + "</span><b>" + tr.name +
        '</b><span class="wi-desc">' + tr.desc + "</span>";
      tw.appendChild(d);
    });

    updateHud();
    show("garageScreen");
  }

  /* =========================================================
     WIRING
     ========================================================= */
  function goHome() { stopTimer(); renderHome(); show("homeScreen"); }

  function wire() {
    $("garageBtn").addEventListener("click", renderGarage);
    $("garageBack").addEventListener("click", goHome);
    $("raceQuit").addEventListener("click", goHome);
    $("resultHome").addEventListener("click", goHome);

    $("typeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (answered) return;
      var v = $("typeInput").value;
      if (!normalize(v)) { $("typeInput").focus(); return; }
      submit(v, null);
    });

    // 1-4 picks an answer while racing
    document.addEventListener("keydown", function (e) {
      if (!$("raceScreen").classList.contains("active") || answered) return;
      if (q && q.k === "type") return;
      if (e.key >= "1" && e.key <= "4") {
        var b = $("answers").children[parseInt(e.key, 10) - 1];
        if (b) b.click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire();
    renderHome();
    show("homeScreen");
  });
})();
