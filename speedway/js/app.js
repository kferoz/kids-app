/* ============================================================
   Learning Speedway — App Engine
   Rev the Race Car 🏎️ drives a 3-lane road. Each lap shows a
   question and three "gates"; steering into the right gate zooms
   the car through it.

   Screens: Home → Race → Finish, plus a Garage (cars + trophies).
   Fully data-driven by COURSES / ROUND_MAKERS in data.js.
   Saves to localStorage under the `sw_` prefix.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- tiny helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function stripHtml(s) { var d = el("div", null, s); return d.textContent || d.innerText || ""; }

  /* ---------- storage ---------- */
  function getNum(k) { var v = parseInt(localStorage.getItem(k), 10); return isNaN(v) ? 0 : v; }
  function setNum(k, n) { localStorage.setItem(k, String(n)); }
  function getArr(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } }
  function setArr(k, a) { localStorage.setItem(k, JSON.stringify(a)); }
  function getObj(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function setObj(k, o) { localStorage.setItem(k, JSON.stringify(o)); }

  var K = {
    points: "sw_points",     // ⭐ points (read by the Rewards Center)
    trophies: "sw_trophies", // trophy ids
    cars: "sw_cars",         // unlocked car ids
    car: "sw_car",           // the car currently being driven
    stars: "sw_stars",       // { courseId: bestStars 1-3 }  (also = "done" map)
    dash: "sw_dashbest",     // best Highway Dash gate count
    tickets: "rw_tickets"    // SHARED with the Arcade / Prize Wheel
  };

  function points() { return getNum(K.points); }
  function addPoints(n) { setNum(K.points, points() + n); }
  function starsMap() { return getObj(K.stars); }
  function courseStars(id) { return starsMap()[id] || 0; }
  function isFinished(id) { return courseStars(id) > 0; }
  function racesDone() { return Object.keys(starsMap()).length; }
  function saveStars(id, n) {
    var m = starsMap();
    if ((m[id] || 0) < n) { m[id] = n; setObj(K.stars, m); }
  }
  function myCars() {
    var c = getArr(K.cars);
    if (c.indexOf("racer") === -1) { c.unshift("racer"); setArr(K.cars, c); }
    return c;
  }
  function unlockCar(id) {
    var c = myCars();
    if (c.indexOf(id) !== -1) return false;
    c.push(id); setArr(K.cars, c); return true;
  }
  function currentCar() {
    var id = localStorage.getItem(K.car);
    var car = id ? byId(CAR_GARAGE, id) : null;
    if (!car || myCars().indexOf(car.id) === -1) car = byId(CAR_GARAGE, "racer");
    return car;
  }
  function grantTrophy(id) {
    var a = getArr(K.trophies);
    if (a.indexOf(id) !== -1) return false;
    a.push(id); setArr(K.trophies, a); return true;
  }
  function addTicket(n) { setNum(K.tickets, getNum(K.tickets) + (n || 1)); }

  /* ---------- speech (read-aloud) ---------- */
  var canSpeak = "speechSynthesis" in window;
  var muted = localStorage.getItem("sw_muted") === "1";
  function speak(text) {
    if (!canSpeak || !text || muted) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(stripHtml(String(text)));
      u.rate = 0.95; u.pitch = 1.15; u.lang = "en-US";
      window.speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }
  function hush() { if (canSpeak) { try { window.speechSynthesis.cancel(); } catch (e) {} } }

  /* ---------- confetti ---------- */
  function confetti() {
    var box = $("confetti"); if (!box) return;
    var emo = ["🎉", "⭐", "🏁", "🎈", "✨", "🏆", "🎊", "🚗"];
    for (var i = 0; i < 26; i++) {
      var p = el("span", "confetti-bit", emo[Math.floor(Math.random() * emo.length)]);
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.5) + "s";
      p.style.fontSize = (16 + Math.random() * 22) + "px";
      box.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 2200); })(p);
    }
  }

  /* ---------- screens ---------- */
  var screens = ["homeScreen", "raceScreen", "finishScreen", "garageScreen"];
  function show(id) {
    for (var i = 0; i < screens.length; i++) {
      var s = $(screens[i]); if (s) s.classList.toggle("active", screens[i] === id);
    }
    window.scrollTo(0, 0);
  }

  /* =========================================================
     HOME — pick a road
     ========================================================= */
  function renderHome() {
    var list = $("zoneList"); list.innerHTML = "";

    ZONES.forEach(function (z) {
      var sec = el("section", "zone " + z.theme);
      var mine = COURSES.filter(function (c) { return c.zone === z.id; });
      var done = mine.filter(function (c) { return isFinished(c.id); }).length;

      sec.appendChild(el("h2", "zone-head",
        '<span class="zone-emoji">' + z.emoji + '</span>' + z.name +
        '<span class="zone-blurb">' + z.blurb + '</span>' +
        '<span class="zone-count">' + done + " / " + mine.length + '</span>'));

      var grid = el("div", "course-grid");
      mine.forEach(function (c) {
        var st = courseStars(c.id);
        var card = el("button", "course-card" + (st ? " done" : ""));
        card.innerHTML =
          '<span class="course-emoji">' + c.emoji + '</span>' +
          '<span class="course-name">' + c.name + '</span>' +
          '<span class="course-blurb">' + c.blurb + '</span>' +
          '<span class="course-stars">' + starRow(st) + '</span>' +
          '<span class="course-go">' + (st ? "Race again →" : "Start race →") + '</span>';
        card.addEventListener("click", function () { startRace(c); });
        grid.appendChild(card);
      });
      sec.appendChild(grid);
      list.appendChild(sec);
    });

    updateHud();
  }
  function starRow(n) {
    var s = "";
    for (var i = 1; i <= 3; i++) s += '<span class="st' + (i <= n ? " on" : "") + '">★</span>';
    return s;
  }

  function updateHud() {
    var p = $("hudPoints"); if (p) p.textContent = "⭐ " + points();
    var r = $("hudRaces"); if (r) r.textContent = "🏁 " + racesDone() + "/" + COURSES.length;
    var m = muted ? "🔇" : "🔊";
    if ($("muteBtn")) $("muteBtn").textContent = m;
    if ($("raceMute")) $("raceMute").textContent = m;
  }

  /* =========================================================
     RACE — the road
     ========================================================= */
  var course = null;     // the COURSE being raced (null in Highway Dash)
  var dashMode = false;
  var lap = 0;           // gates passed this race
  var mistakes = 0;      // wrong taps this race
  var round = null;      // the current round object
  var locked = false;    // true while the car is animating
  var focusLane = 1;     // keyboard steering

  function startRace(c) {
    course = c; dashMode = false;
    lap = 0; mistakes = 0;
    $("raceScreen").className = "screen " + zoneTheme(c.zone) + " active";
    $("raceTitle").innerHTML = c.emoji + " " + c.name;
    $("dashStop").hidden = true;
    $("car").textContent = currentCar().emoji;
    show("raceScreen");
    nextLap();
  }

  function startDash() {
    course = null; dashMode = true;
    lap = 0; mistakes = 0;
    $("raceScreen").className = "screen z-dash active";
    $("raceTitle").innerHTML = "🌈 Highway Dash";
    $("dashStop").hidden = false;
    $("car").textContent = currentCar().emoji;
    show("raceScreen");
    speak("Highway Dash! Drive as far as you like.");
    nextLap();
  }

  function zoneTheme(id) { var z = byId(ZONES, id); return z ? z.theme : "z-english"; }

  function makeRound() {
    var gen = dashMode ? swPick(COURSES).gen : course.gen;
    return ROUND_MAKERS[gen]();
  }

  function nextLap() {
    round = makeRound();
    locked = false; focusLane = 1;

    // lap progress
    var dots = $("lapDots"); dots.innerHTML = "";
    if (dashMode) {
      $("lapCount").textContent = "🏁 " + lap + " gates";
    } else {
      for (var i = 0; i < course.laps; i++) {
        dots.appendChild(el("span", "ldot" + (i < lap ? " past" : i === lap ? " now" : "")));
      }
      $("lapCount").textContent = "Lap " + (lap + 1) + " of " + course.laps;
    }

    // question + optional picture
    $("qText").innerHTML = round.q;
    $("qVisual").innerHTML = round.visual || "";
    $("qVisual").hidden = !round.visual;
    var fb = $("raceFeedback"); fb.className = "race-feedback"; fb.innerHTML = "";

    // gates
    var gates = $("gates"); gates.innerHTML = "";
    round.choices.forEach(function (ch, i) {
      var g = el("button", "gate", '<span class="gate-body">' + ch.html + '</span><span class="gate-post"></span>');
      g.setAttribute("data-lane", i);
      g.setAttribute("aria-label", "Lane " + (i + 1));
      g.addEventListener("click", function () { drive(i, ch, g); });
      gates.appendChild(g);
    });

    // car back to the middle lane
    var car = $("car");
    car.className = "car";
    car.style.transform = "";
    car.textContent = currentCar().emoji;
    setTimeout(function () { parkAt(1); }, 20);

    speak(round.say || round.q);
  }

  /* move the car (visually) to a lane */
  function parkAt(lane) {
    var car = $("car"), g = $("gates").children[lane];
    if (!car || !g) return;
    var road = $("asphalt").getBoundingClientRect();
    var box = g.getBoundingClientRect();
    var dx = (box.left + box.width / 2) - (road.left + road.width / 2);
    car.style.transform = "translateX(" + Math.round(dx) + "px)";
    highlight(lane);
  }
  function highlight(lane) {
    var gs = $("gates").children;
    for (var i = 0; i < gs.length; i++) gs[i].classList.toggle("aim", i === lane);
    focusLane = lane;
  }

  /* steer into a gate */
  function drive(lane, choice, gateEl) {
    if (locked) return;
    var right = choice.key === round.answerKey;
    if (window.Tracker) Tracker.answer(right, course ? (course && (course.name || course.title || course.id)) : "Highway Dash");
    parkAt(lane);
    locked = true;

    if (right) {
      setTimeout(function () {
        gateEl.classList.add("open");
        $("car").classList.add("zoom");
        confettiBurst();
        addPoints(5); updateHud();
        var fb = $("raceFeedback");
        fb.className = "race-feedback yay";
        fb.innerHTML = "⭐ +5 &nbsp;" + swPick(SW_CHEERS);
        speak(swPick(SW_CHEERS));
        lap++;
        if (dashMode) dashProgress();
        setTimeout(function () {
          if (!dashMode && lap >= course.laps) return finishRace();
          nextLap();
        }, 900);
      }, 260);
    } else {
      setTimeout(function () {
        mistakes++;
        gateEl.classList.add("shut");
        gateEl.disabled = true;
        $("car").classList.add("bump");
        var fb = $("raceFeedback");
        fb.className = "race-feedback try";
        fb.innerHTML = "🚧 Good try — pick another gate!" + (round.hint && mistakes >= 2 ? '<span class="hint">💡 ' + round.hint + "</span>" : "");
        speak("Good try. Try another gate.");
        setTimeout(function () {
          $("car").classList.remove("bump");
          parkAt(1);
          locked = false;
        }, 520);
      }, 260);
    }
  }

  function confettiBurst() {
    var box = $("confetti"); if (!box) return;
    for (var i = 0; i < 8; i++) {
      var p = el("span", "confetti-bit", swPick(["✨", "⭐", "🎉"]));
      p.style.left = (35 + Math.random() * 30) + "%";
      p.style.animationDelay = (Math.random() * 0.2) + "s";
      box.appendChild(p);
      (function (node) { setTimeout(function () { node.remove(); }, 1600); })(p);
    }
  }

  /* Highway Dash: a ticket every 5 gates, no fail state */
  function dashProgress() {
    if (lap % 5 === 0) {
      addTicket();
      var fb = $("raceFeedback");
      fb.className = "race-feedback yay";
      fb.innerHTML = "🎟️ Ticket earned! " + lap + " gates!";
      speak("You earned a ticket!");
    }
  }

  function endDash() {
    hush();
    var best = getNum(K.dash);
    if (lap > best) setNum(K.dash, lap);
    var newTrophies = [];
    if (lap >= 20 && grantTrophy("dash-star")) newTrophies.push(byId(SW_TROPHIES, "dash-star"));
    if (points() >= 200 && grantTrophy("point-pro")) newTrophies.push(byId(SW_TROPHIES, "point-pro"));

    $("finishBox").innerHTML =
      '<div class="finish-flag">🏁</div>' +
      "<h2>Great drive!</h2>" +
      '<p class="finish-sub">You passed <b>' + lap + "</b> gate" + (lap === 1 ? "" : "s") +
        " on the Highway Dash.</p>" +
      '<div class="finish-stats">' +
        "<span>⭐ +" + (lap * 5) + " points</span>" +
        "<span>🎟️ " + Math.floor(lap / 5) + " tickets</span>" +
        "<span>🏆 Best: " + Math.max(lap, best) + "</span>" +
      "</div>" + trophyHtml(newTrophies);

    $("raceAgainBtn").textContent = "↺ Drive Again";
    $("raceAgainBtn").onclick = startDash;
    show("finishScreen");
    confetti();
    speak("Great drive! You passed " + lap + " gates.");
    updateHud();
  }

  /* =========================================================
     FINISH — race complete
     ========================================================= */
  function finishRace() {
    hush();
    var stars = mistakes === 0 ? 3 : (mistakes <= 2 ? 2 : 1);
    if (window.Tracker) Tracker.complete("road", stars, 3, { item: (course && (course.name || course.title || course.id)), mistakes: mistakes });
    var firstTime = !isFinished(course.id);
    var best = courseStars(course.id);
    saveStars(course.id, stars);

    var newCar = null, newTrophies = [];
    if (firstTime) {
      addTicket();
      if (unlockCar(course.car)) newCar = byId(CAR_GARAGE, course.car);
      if (grantTrophy("first-race")) newTrophies.push(byId(SW_TROPHIES, "first-race"));
      if (zoneClear("english") && grantTrophy("english-ace")) newTrophies.push(byId(SW_TROPHIES, "english-ace"));
      if (zoneClear("math") && grantTrophy("math-ace")) newTrophies.push(byId(SW_TROPHIES, "math-ace"));
      if (racesDone() >= COURSES.length && grantTrophy("grand-prix")) newTrophies.push(byId(SW_TROPHIES, "grand-prix"));
    }
    if (myCars().length >= 8 && grantTrophy("garage-hero")) newTrophies.push(byId(SW_TROPHIES, "garage-hero"));
    if (stars === 3 && grantTrophy("perfect-lap")) newTrophies.push(byId(SW_TROPHIES, "perfect-lap"));
    if (points() >= 200 && grantTrophy("point-pro")) newTrophies.push(byId(SW_TROPHIES, "point-pro"));

    var msg = stars === 3 ? "Perfect race — no bumps at all! 🌟"
      : stars === 2 ? "Super driving! 🚗💨" : "You made it to the finish line! 🎉";

    var html =
      '<div class="finish-flag">🏁</div>' +
      "<h2>" + course.name + " complete!</h2>" +
      '<p class="finish-sub">' + msg + "</p>" +
      '<div class="finish-stars">' + starRow(stars) + "</div>" +
      '<div class="finish-stats">' +
        "<span>⭐ +" + (lap * 5) + " points</span>" +
        (firstTime ? "<span>🎟️ +1 ticket</span>" : "<span>🏅 Best: " + Math.max(best, stars) + " stars</span>") +
      "</div>";

    if (newCar) {
      html += '<div class="finish-new"><h3>🚗 New car unlocked!</h3>' +
        '<div class="new-car"><span class="nc-emoji">' + newCar.emoji + "</span><b>" + newCar.name +
        "</b><span>Tap 🚗 Garage to drive it!</span></div></div>";
    }
    html += trophyHtml(newTrophies);

    $("finishBox").innerHTML = html;
    $("raceAgainBtn").textContent = "↺ Race Again";
    $("raceAgainBtn").onclick = function () { startRace(course); };
    show("finishScreen");
    confetti();
    speak("Race complete! " + msg + (newCar ? " You unlocked " + newCar.name + "!" : ""));
    updateHud();
  }

  function trophyHtml(list) {
    if (!list.length) return "";
    var h = '<div class="finish-new"><h3>🏆 New Trophy!</h3>';
    list.forEach(function (t) {
      if (t) h += '<div class="new-item">' + t.icon + " <b>" + t.name + "</b> — " + t.desc + "</div>";
    });
    return h + "</div>";
  }

  function zoneClear(zid) {
    var mine = COURSES.filter(function (c) { return c.zone === zid; });
    for (var i = 0; i < mine.length; i++) if (!isFinished(mine[i].id)) return false;
    return true;
  }

  /* =========================================================
     GARAGE — cars + trophies
     ========================================================= */
  function renderGarage() {
    var got = myCars(), drv = currentCar();

    $("grTotals").innerHTML =
      '<div class="stat"><b>⭐ ' + points() + "</b><span>points</span></div>" +
      '<div class="stat"><b>🏁 ' + racesDone() + "/" + COURSES.length + "</b><span>races</span></div>" +
      '<div class="stat"><b>🚗 ' + got.length + "/" + CAR_GARAGE.length + "</b><span>cars</span></div>" +
      '<div class="stat"><b>🌈 ' + getNum(K.dash) + "</b><span>dash best</span></div>";

    var grid = $("carGrid"); grid.innerHTML = "";
    CAR_GARAGE.forEach(function (c) {
      var have = got.indexOf(c.id) !== -1;
      var item = el("button", "car-card" + (have ? " have" : " locked") + (drv.id === c.id ? " driving" : ""));
      item.innerHTML =
        '<span class="cc-emoji">' + (have ? c.emoji : "🔒") + "</span>" +
        "<b>" + (have ? c.name : "???") + "</b>" +
        '<span class="cc-how">' + c.how + "</span>" +
        (drv.id === c.id ? '<span class="cc-tag">Driving now</span>' : "");
      if (have) {
        item.addEventListener("click", function () {
          localStorage.setItem(K.car, c.id);
          $("revCar").textContent = c.emoji;
          speak("You are driving " + c.name + "!");
          renderGarage();
        });
      } else {
        item.addEventListener("click", function () { speak(c.how + " to unlock this car."); });
      }
      grid.appendChild(item);
    });

    var tw = $("trophyWall"); tw.innerHTML = "";
    var gt = getArr(K.trophies);
    SW_TROPHIES.forEach(function (t) {
      var have = gt.indexOf(t.id) !== -1;
      var d = el("div", "wall-item" + (have ? " have" : ""));
      d.innerHTML = '<span class="wi-icon">' + (have ? t.icon : "🔒") + "</span><b>" + t.name +
        '</b><span class="wi-desc">' + t.desc + "</span>";
      tw.appendChild(d);
    });

    show("garageScreen");
  }

  /* =========================================================
     WIRING
     ========================================================= */
  function toggleMute() {
    muted = !muted;
    localStorage.setItem("sw_muted", muted ? "1" : "0");
    if (muted) hush();
    updateHud();
  }

  function goHome() { hush(); renderHome(); show("homeScreen"); }

  function wire() {
    $("dashBtn").addEventListener("click", startDash);
    $("garageBtn").addEventListener("click", renderGarage);
    $("garageBack").addEventListener("click", goHome);
    $("raceBack").addEventListener("click", goHome);
    $("finishHome").addEventListener("click", goHome);
    $("dashStop").addEventListener("click", endDash);
    $("muteBtn").addEventListener("click", toggleMute);
    $("raceMute").addEventListener("click", toggleMute);
    $("sayBtn").addEventListener("click", function () {
      if (round) { hush(); speak(round.say || round.q); }
    });

    // keep the car parked in its lane when the road resizes
    window.addEventListener("resize", function () {
      if ($("raceScreen").classList.contains("active") && !locked) parkAt(focusLane);
    });

    // keyboard steering: ← → to aim, Enter/Space to drive, 1-3 direct
    document.addEventListener("keydown", function (e) {
      if (!$("raceScreen").classList.contains("active") || locked) return;
      var gates = $("gates").children, n = gates.length;
      if (e.key === "ArrowLeft") { e.preventDefault(); parkAt((focusLane + n - 1) % n); }
      else if (e.key === "ArrowRight") { e.preventDefault(); parkAt((focusLane + 1) % n); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); gates[focusLane].click(); }
      else if (e.key >= "1" && e.key <= "3") {
        var i = parseInt(e.key, 10) - 1;
        if (gates[i]) gates[i].click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wire();
    $("revCar").textContent = currentCar().emoji;
    renderHome();
    show("homeScreen");
  });
})();
