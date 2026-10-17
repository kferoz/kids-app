/* ============================================================
   Grammar Treasure Hunt — App Logic
   Vanilla JS. Sail an island map: each stop is a grammar clue.
   Answer correctly to move the ship forward; reach the X to dig
   up the treasure. Gold coins + trophies saved under "th_".
   Kind by design: a wrong answer wiggles and says "try again"
   (no coin lost) — you must solve each clue to sail on.
   ============================================================ */

(function () {
  "use strict";

  var TREASURE_BONUS = 5;   // extra coins for reaching the X

  var GRAND = { id: "master", icon: "👑", name: "Master Treasure Hunter", desc: "Finish every map" };

  var state = {
    coins: loadCoins(),
    trophies: loadTrophies(),
    adv: null,
    stop: 0,          // current clue index (0..N)
    locked: false,
    wrongs: 0,        // wrong taps this hunt (for star rating)
    coinsThisHunt: 0
  };

  // ---------- Trophy catalog ----------
  function buildTrophyCatalog() {
    var list = ADVENTURES.map(function (a) {
      return { id: "map:" + a.id, icon: "🏅", name: a.name, desc: "Dig up the treasure" };
    });
    list.push(GRAND);
    return list;
  }
  var TROPHY_CATALOG = buildTrophyCatalog();

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    screens: {
      home: $("homeScreen"),
      map: $("mapScreen"),
      result: $("resultScreen"),
      trophy: $("trophyScreen")
    },
    backBtn: $("backBtn"),
    coinCount: $("coinCount"),
    coinBadge: $("coinBadge"),
    adventureGrid: $("adventureGrid"),
    trophyBtn: $("trophyBtn"),
    // map
    adventureName: $("adventureName"),
    stopNow: $("stopNow"),
    stopTotal: $("stopTotal"),
    mapRoute: $("mapRoute"),
    clueQ: $("clueQ"),
    readBtn: $("readBtn"),
    clueOptions: $("clueOptions"),
    clueFeedback: $("clueFeedback"),
    // result
    chest: $("chest"),
    chestBurst: $("chestBurst"),
    resultHeadline: $("resultHeadline"),
    resultCoins: $("resultCoins"),
    resultStars: $("resultStars"),
    resultMessage: $("resultMessage"),
    rewardUnlock: $("rewardUnlock"),
    nextHuntBtn: $("nextHuntBtn"),
    againBtn: $("againBtn"),
    resultHomeBtn: $("resultHomeBtn"),
    // trophy
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid")
  };

  // ---------- Persistence ----------
  function loadCoins() { return parseInt(localStorage.getItem("th_coins") || "0", 10); }
  function saveCoins() { localStorage.setItem("th_coins", String(state.coins)); }
  function loadTrophies() {
    try { return new Set(JSON.parse(localStorage.getItem("th_trophies") || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveTrophies() { localStorage.setItem("th_trophies", JSON.stringify(Array.from(state.trophies))); }

  // ---------- Helpers ----------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }
  function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }

  function showScreen(name) {
    stopSpeaking();
    Object.keys(el.screens).forEach(function (k) { el.screens[k].classList.remove("active"); });
    el.screens[name].classList.add("active");
    el.backBtn.hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateCoinBadge() {
    el.coinCount.textContent = state.coins;
    var icon = el.coinBadge.querySelector(".coin-icon");
    icon.style.animation = "none";
    void icon.offsetWidth;
    icon.style.animation = "spin 0.5s ease";
  }

  function addCoins(n) {
    state.coins += n;
    state.coinsThisHunt += n;
    saveCoins();
    updateCoinBadge();
  }

  function awardTrophy(id, quiet) {
    if (state.trophies.has(id)) return false;
    state.trophies.add(id);
    saveTrophies();
    var t = TROPHY_CATALOG.find(function (x) { return x.id === id; });
    if (t && !quiet) showTrophyToast(t);
    return true;
  }
  function showTrophyToast(trophy) {
    var toast = document.createElement("div");
    toast.className = "trophy-toast";
    toast.innerHTML = '<span class="toast-icon">' + trophy.icon + "</span>" +
      "<span>New trophy: <b>" + trophy.name + "</b>!</span>";
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () { toast.remove(); }, 500);
    }, 2600);
  }

  // ---------- Home ----------
  function buildHome() {
    el.adventureGrid.innerHTML = "";
    ADVENTURES.forEach(function (a) {
      var done = state.trophies.has("map:" + a.id);
      var card = document.createElement("button");
      card.className = "adv-card" + (done ? " done" : "");
      card.innerHTML =
        '<span class="adv-emoji">' + a.emoji + "</span>" +
        '<span class="adv-name">' + a.name + "</span>" +
        '<span class="adv-blurb">' + a.blurb + "</span>" +
        '<span class="adv-meta">' + a.clues.length + " clues</span>" +
        (done ? '<span class="adv-go done">🏴‍☠️ Conquered!</span>' : '<span class="adv-go">Set Sail →</span>');
      card.addEventListener("click", function () { startAdventure(a); });
      el.adventureGrid.appendChild(card);
    });
  }

  // ---------- Play ----------
  function startAdventure(adv) {
    state.adv = adv;
    state.stop = 0;
    state.wrongs = 0;
    state.coinsThisHunt = 0;
    el.adventureName.textContent = adv.emoji + " " + adv.name;
    el.stopTotal.textContent = adv.clues.length;
    renderMap();
    renderClue();
    showScreen("map");
  }

  function renderMap() {
    var adv = state.adv;
    var total = adv.clues.length;   // island nodes; treasure is node index === total
    el.mapRoute.innerHTML = "";
    for (var i = 0; i <= total; i++) {
      if (i > 0) {
        var seg = document.createElement("span");
        seg.className = "trail-seg" + (i <= state.stop ? " sailed" : "");
        el.mapRoute.appendChild(seg);
      }
      var isTreasure = (i === total);
      var node = document.createElement("div");
      node.className = "island-node" +
        (i < state.stop ? " done" : "") +
        (i === state.stop ? " active" : "") +
        (isTreasure ? " treasure" : "");
      var emoji = isTreasure ? "💰" : adv.route[i % adv.route.length];
      node.innerHTML =
        (i === state.stop ? '<span class="ship-marker">⛵</span>' : "") +
        '<span class="node-emoji">' + (i < state.stop ? "🚩" : emoji) + "</span>" +
        '<span class="node-label">' + (isTreasure ? "X" : (i + 1)) + "</span>";
      el.mapRoute.appendChild(node);
    }
    // keep the ship in view on narrow screens
    var active = el.mapRoute.querySelector(".island-node.active");
    if (active && active.scrollIntoView) active.scrollIntoView({ inline: "center", block: "nearest" });
  }

  function renderClue() {
    var adv = state.adv;
    var clue = adv.clues[state.stop];
    state.locked = false;
    el.stopNow.textContent = state.stop + 1;
    el.clueQ.textContent = clue.q;
    el.clueFeedback.textContent = "";
    el.clueFeedback.className = "clue-feedback";
    el.clueOptions.innerHTML = "";
    clue.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.className = "opt-btn";
      btn.textContent = opt;
      btn.addEventListener("click", function () { answer(i, btn); });
      el.clueOptions.appendChild(btn);
    });
    speak(clue.q);
  }

  function answer(i, btn) {
    if (state.locked) return;
    var clue = state.adv.clues[state.stop];
    if (window.Tracker) Tracker.answer(i === clue.answer, (state.adv && (state.adv.name || state.adv.title || state.adv.id)));
    if (i !== clue.answer) {
      state.wrongs++;
      btn.classList.add("wrong");
      btn.disabled = true;
      el.clueFeedback.textContent = "Not quite, matey — try again! 💪";
      el.clueFeedback.className = "clue-feedback try";
      return;
    }
    state.locked = true;
    btn.classList.add("right");
    Array.prototype.forEach.call(el.clueOptions.children, function (b) { b.disabled = true; });
    addCoins(1);
    var cheer = pick(CHEERS);
    el.clueFeedback.textContent = cheer;
    el.clueFeedback.className = "clue-feedback win";
    speak(cheer.replace(/[^\w! ]/g, ""));
    burstConfetti(16);

    setTimeout(function () {
      state.stop++;
      renderMap();
      if (state.stop >= state.adv.clues.length) finishAdventure();
      else renderClue();
    }, 1050);
  }

  function finishAdventure() {
    if (window.Tracker) Tracker.complete("map", 3 - Math.min(2, state.wrongs || 0), 3, { item: (state.adv && (state.adv.name || state.adv.title || state.adv.id)) });
    addCoins(TREASURE_BONUS);
    var earnedGrand = false;
    awardTrophy("map:" + state.adv.id);
    var allDone = ADVENTURES.every(function (a) { return state.trophies.has("map:" + a.id); });
    if (allDone) earnedGrand = awardTrophy(GRAND.id, true);

    el.resultCoins.textContent = "You collected " + state.coinsThisHunt + " 🪙";
    // star rating from mistakes
    var stars = state.wrongs === 0 ? 3 : (state.wrongs <= 3 ? 2 : 1);
    el.resultStars.innerHTML = "";
    for (var s = 0; s < 3; s++) {
      var span = document.createElement("span");
      span.className = "res-star" + (s < stars ? "" : " dim");
      span.textContent = s < stars ? "⭐" : "☆";
      span.style.animationDelay = (s * 0.12) + "s";
      el.resultStars.appendChild(span);
    }
    if (stars === 3) {
      el.resultHeadline.textContent = "Treasure Found!";
      el.resultMessage.textContent = "A perfect voyage — no wrong turns! You're a true grammar pirate.";
    } else if (stars === 2) {
      el.resultHeadline.textContent = "Treasure Found!";
      el.resultMessage.textContent = "Well sailed! You solved every clue and dug up the gold.";
    } else {
      el.resultHeadline.textContent = "You Made It!";
      el.resultMessage.textContent = "The seas were rough, but you never gave up. Sail again to earn more stars!";
    }
    el.rewardUnlock.hidden = !earnedGrand;
    if (earnedGrand) el.rewardUnlock.textContent = "👑 You unlocked Master Treasure Hunter!";

    showScreen("result");
    el.chest.classList.remove("open");
    void el.chest.offsetWidth;
    setTimeout(function () {
      el.chest.classList.add("open");
      spawnCoins();
      burstConfetti(70);
    }, 250);
  }

  function spawnCoins() {
    el.chestBurst.innerHTML = "";
    for (var i = 0; i < 10; i++) {
      var c = document.createElement("span");
      c.className = "fly-coin";
      c.textContent = "🪙";
      c.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      c.style.setProperty("--dy", (-60 - Math.random() * 90) + "px");
      c.style.animationDelay = (Math.random() * 0.25) + "s";
      el.chestBurst.appendChild(c);
    }
  }

  // ---------- Trophy shelf ----------
  function buildTrophies() {
    el.trophyGrid.innerHTML = "";
    var earned = 0;
    TROPHY_CATALOG.forEach(function (t) {
      var has = state.trophies.has(t.id);
      if (has) earned++;
      var card = document.createElement("div");
      card.className = "trophy-card " + (has ? "earned" : "locked");
      card.innerHTML =
        '<span class="trophy-icon">' + (has ? t.icon : "🔒") + "</span>" +
        '<span class="trophy-name">' + t.name + "</span>" +
        '<span class="trophy-desc">' + t.desc + "</span>";
      el.trophyGrid.appendChild(card);
    });
    el.trophyEarned.textContent = earned;
    el.trophyTotalCount.textContent = TROPHY_CATALOG.length;
  }

  // ---------- Confetti ----------
  function burstConfetti(count) {
    var colors = ["#f2b134", "#cf4a54", "#17697a", "#8fd6c9", "#e6cf9c"];
    for (var i = 0; i < count; i++) {
      var c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = pick(colors);
      c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      document.body.appendChild(c);
      setTimeout(function (node) { return function () { node.remove(); }; }(c), 3200);
    }
  }

  // ---------- Init ----------
  function init() {
    buildHome();
    updateCoinBadge();

    el.backBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.trophyBtn.addEventListener("click", function () { buildTrophies(); showScreen("trophy"); });
    el.readBtn.addEventListener("click", function () {
      if (state.adv) speak(state.adv.clues[state.stop].q);
    });
    el.nextHuntBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.againBtn.addEventListener("click", function () { startAdventure(state.adv); });
    el.resultHomeBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });

    document.addEventListener("keydown", function (e) {
      if (!el.screens.map.classList.contains("active") || state.locked) return;
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= el.clueOptions.children.length) {
        el.clueOptions.children[n - 1].click();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
