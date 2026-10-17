/* ============================================================
   Little Learners — App Logic
   Vanilla JS. Five tap-to-play games, stars, trophies, and
   read-aloud for pre-readers. Progress saved under "ll_".
   Kindness-first: wrong taps just say "try again" — never a
   score penalty. Every finished round earns a star.
   ============================================================ */

(function () {
  "use strict";

  var ROUNDS_PER_GAME = 5;
  var MATCH_PAIRS = 4;              // 8 cards — comfy for little hands
  var MILESTONES = [
    { id: "stars:10",  icon: "🌟", name: "Rising Star", desc: "Earn 10 stars",  need: 10 },
    { id: "stars:25",  icon: "💫", name: "Super Star",  desc: "Earn 25 stars",  need: 25 },
    { id: "stars:50",  icon: "🌠", name: "Mega Star",   desc: "Earn 50 stars",  need: 50 },
    { id: "stars:75",  icon: "🎖️", name: "Star Hero",   desc: "Earn 75 stars",  need: 75 },
    { id: "stars:100", icon: "👑", name: "Star Legend", desc: "Earn 100 stars", need: 100 }
  ];
  // Won when every game's trophy is collected.
  var GRAND = { id: "champion", icon: "🎓", name: "Learning Champion", desc: "Win all 10 games" };

  var state = {
    stars: loadStars(),
    trophies: loadTrophies(),       // Set of trophy ids
    gameType: null,
    rounds: [],
    roundIndex: 0,
    starsThisGame: 0,
    match: null,
    busy: false
  };

  // ---------- Trophy catalog ----------
  var SUMMER_GRAND = { id: "summer-champ", icon: "☀️", name: "Summer Superstar", desc: "Finish all Summer School games" };

  function buildTrophyCatalog() {
    var list = [];
    GAMES.forEach(function (g) {
      list.push({ id: "game:" + g.id, icon: "🏅", name: g.name + " Star", desc: "Finish " + g.name });
    });
    MILESTONES.forEach(function (m) { list.push({ id: m.id, icon: m.icon, name: m.name, desc: m.desc }); });
    list.push({ id: GRAND.id, icon: GRAND.icon, name: GRAND.name, desc: GRAND.desc });
    SUMMER_GAMES.forEach(function (g) {
      list.push({ id: "game:" + g.id, icon: "☀️", name: g.name + " Star", desc: "Finish " + g.name });
    });
    list.push({ id: SUMMER_GRAND.id, icon: SUMMER_GRAND.icon, name: SUMMER_GRAND.name, desc: SUMMER_GRAND.desc });
    return list;
  }
  var TROPHY_CATALOG = buildTrophyCatalog();

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    screens: {
      home: $("homeScreen"),
      summer: $("summerScreen"),
      play: $("playScreen"),
      match: $("matchScreen"),
      result: $("resultScreen"),
      trophy: $("trophyScreen")
    },
    backBtn: $("backBtn"),
    starCount: $("starCount"),
    scoreBadge: $("scoreBadge"),
    gameGrid: $("gameGrid"),
    trophyBtn: $("trophyBtn"),
    summerBtn: $("summerBtn"),
    summerGrid: $("summerGrid"),
    // play
    gameName: $("gameName"),
    roundNow: $("roundNow"),
    roundTotal: $("roundTotal"),
    playProgress: $("playProgress"),
    stage: $("stage"),
    prompt: $("prompt"),
    replayBtn: $("replayBtn"),
    choices: $("choices"),
    feedback: $("feedback"),
    // match
    matchFound: $("matchFound"),
    matchPairs: $("matchPairs"),
    matchBoard: $("matchBoard"),
    // result
    resultEmoji: $("resultEmoji"),
    resultHeadline: $("resultHeadline"),
    resultStarsEarned: $("resultStarsEarned"),
    resultStars: $("resultStars"),
    rewardUnlock: $("rewardUnlock"),
    playAgainBtn: $("playAgainBtn"),
    resultTrophyBtn: $("resultTrophyBtn"),
    resultHomeBtn: $("resultHomeBtn"),
    // trophy
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid")
  };

  // ---------- Persistence ----------
  function loadStars() { return parseInt(localStorage.getItem("ll_stars") || "0", 10); }
  function saveStars() { localStorage.setItem("ll_stars", String(state.stars)); }
  function loadTrophies() {
    try { return new Set(JSON.parse(localStorage.getItem("ll_trophies") || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveTrophies() { localStorage.setItem("ll_trophies", JSON.stringify(Array.from(state.trophies))); }

  // ---------- Helpers ----------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  // pick `n` distinct items from a pool, always including `must`
  function sampleWith(pool, must, n, keyFn) {
    var key = keyFn || function (x) { return x; };
    var out = [must];
    var rest = shuffle(pool.filter(function (x) { return key(x) !== key(must); }));
    for (var i = 0; i < rest.length && out.length < n; i++) out.push(rest[i]);
    return shuffle(out);
  }

  // ---------- Navigation ----------
  function showScreen(name) {
    stopSpeaking();
    Object.keys(el.screens).forEach(function (k) { el.screens[k].classList.remove("active"); });
    el.screens[name].classList.add("active");
    el.backBtn.hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateStarBadge() {
    el.starCount.textContent = state.stars;
    var icon = el.scoreBadge.querySelector(".star-icon");
    icon.style.animation = "none";
    void icon.offsetWidth;
    icon.style.animation = "pop 0.4s ease";
  }

  // ---------- Read aloud ----------
  function speak(text, opts) {
    if (!("speechSynthesis" in window) || !text) return;
    opts = opts || {};
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.9;
    u.pitch = opts.pitch || 1.2;
    window.speechSynthesis.speak(u);
  }
  function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }

  // ---------- Stars & trophies ----------
  function addStars(n) {
    state.stars += n;
    state.starsThisGame += n;
    saveStars();
    updateStarBadge();
    // milestone trophies
    MILESTONES.forEach(function (m) {
      if (state.stars >= m.need) awardTrophy(m.id, true);
    });
  }

  function awardTrophy(id, quiet) {
    if (state.trophies.has(id)) return false;
    state.trophies.add(id);
    saveTrophies();
    var t = TROPHY_CATALOG.find(function (x) { return x.id === id; });
    if (t && !quiet) showTrophyToast(t);
    if (t && quiet) pendingMilestones.push(t);
    return true;
  }
  var pendingMilestones = [];

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
    el.gameGrid.innerHTML = "";
    GAMES.forEach(function (g) {
      var card = document.createElement("button");
      card.className = "game-card game-" + g.id;
      card.style.setProperty("--accent", g.color);
      var done = state.trophies.has("game:" + g.id);
      card.innerHTML =
        '<span class="game-emoji">' + g.emoji + "</span>" +
        '<span class="game-title">' + g.name + "</span>" +
        '<span class="game-tagline">' + g.tagline + "</span>" +
        (done ? '<span class="game-done">🏅 Done!</span>' : '<span class="game-play">Play →</span>');
      card.addEventListener("click", function () { startGameById(g.id); });
      el.gameGrid.appendChild(card);
    });
  }

  function startGameById(id) {
    state.gameType = id;
    state.starsThisGame = 0;
    pendingMilestones = [];
    if (id === "match") { startMatch(); return; }
    startPickGame(id);
  }

  function buildSummer() {
    el.summerGrid.innerHTML = "";
    SUMMER_GAMES.forEach(function (g) {
      var card = document.createElement("button");
      card.className = "game-card game-" + g.id;
      card.style.setProperty("--accent", g.color);
      var done = state.trophies.has("game:" + g.id);
      card.innerHTML =
        '<span class="game-emoji">' + g.emoji + "</span>" +
        '<span class="game-title">' + g.name + "</span>" +
        '<span class="game-tagline">' + g.tagline + "</span>" +
        (done ? '<span class="game-done">🏅 Done!</span>' : '<span class="game-play">Play →</span>');
      card.addEventListener("click", function () { startGameById(g.id); });
      el.summerGrid.appendChild(card);
    });
  }

  // Award the grand trophy once every game has been finished.
  function checkGrand() {
    var all = GAMES.every(function (g) { return state.trophies.has("game:" + g.id); });
    if (all) awardTrophy(GRAND.id, true);
  }
  function checkSummerGrand() {
    var all = SUMMER_GAMES.every(function (g) { return state.trophies.has("game:" + g.id); });
    if (all) awardTrophy(SUMMER_GRAND.id, true);
  }

  // ---------- Round generators ----------
  // A "picture" choice tile: big emoji with a small word caption.
  function picTile(emoji, word, correct) {
    return {
      html: '<span class="pic"><span class="pic-emoji">' + emoji + '</span>' +
            '<span class="pic-word">' + word + "</span></span>",
      correct: correct
    };
  }

  function makeRound(type) {
    if (type === "letters") {
      var target = pick(LETTERS);
      var opts = sampleWith(LETTERS, target, 3, function (x) { return x.letter; });
      return {
        stage: '<div class="teach"><span class="teach-emoji">' + target.emoji + '</span>' +
               '<span class="teach-cap">' + target.letter + ' is for ' + target.word + '</span></div>',
        prompt: "Find the letter " + target.letter,
        say: "Find the letter " + target.letter + ". " + target.letter + " is for " + target.word,
        choices: opts.map(function (o) {
          return { html: '<span class="big-letter">' + o.letter + "</span>", correct: o.letter === target.letter };
        })
      };
    }
    if (type === "firstsound") {
      var fs = pick(LETTERS);
      var fsOpts = sampleWith(LETTERS, fs, 4, function (x) { return x.letter; });
      return {
        stage: '<div class="teach"><span class="teach-emoji">' + fs.emoji + "</span>" +
               '<span class="teach-cap">' + fs.word + "</span></div>",
        prompt: "Which letter does " + fs.word + " start with?",
        say: fs.word + " starts with...",
        choices: fsOpts.map(function (o) { return { html: '<span class="big-letter">' + o.letter + "</span>", correct: o.letter === fs.letter }; })
      };
    }
    if (type === "readword") {
      var rw = pick(SUMMER_WORDS);
      var rwOpts = sampleWith(SUMMER_WORDS, rw, 3, function (x) { return x.word; });
      return {
        stage: '<div class="teach"><span class="teach-big-letter">' + rw.word + "</span>" +
               '<span class="teach-cap">Read it!</span></div>',
        prompt: "Tap the picture for this word.",
        say: "Read the word, then tap the picture.",
        choices: rwOpts.map(function (o) { return { html: '<span class="big-shape">' + o.emoji + "</span>", correct: o.word === rw.word }; })
      };
    }
    if (type === "sightword") {
      var sw = pick(SIGHT_WORDS);
      var swOpts = sampleWith(SIGHT_WORDS, sw, 4);
      return {
        stage: '<div class="teach sound-teach"><span class="teach-emoji">👀</span>' +
               '<span class="teach-cap">Find the word</span></div>',
        prompt: "Tap the word: " + sw,
        say: "Find the word. " + sw,
        choices: swOpts.map(function (o) { return { html: '<span class="sight-word">' + o + "</span>", correct: o === sw }; })
      };
    }
    if (type === "finishsentence") {
      var ss = pick(SUMMER_SENTENCES);
      var ssOpts = shuffle(ss.options);
      return {
        stage: '<div class="teach"><span class="teach-emoji">' + ss.emoji + "</span></div>",
        prompt: ss.text,
        say: "Finish the sentence. " + ss.say,
        choices: ssOpts.map(function (o) { return { html: '<span class="sight-word">' + o + "</span>", correct: o === ss.answer }; })
      };
    }
    if (type === "phonics") {
      var pt = pick(LETTERS);
      var pOpts = sampleWith(LETTERS, pt, 3, function (x) { return x.letter; });
      return {
        stage: '<div class="teach"><span class="teach-big-letter">' + pt.letter + "</span>" +
               '<span class="teach-cap">Starts with ' + pt.letter + "</span></div>",
        prompt: "Which one starts with " + pt.letter + "?",
        say: "Which one starts with the letter " + pt.letter + "?",
        choices: pOpts.map(function (o) { return picTile(o.emoji, o.word, o.letter === pt.letter); })
      };
    }
    if (type === "rhyme") {
      var group = pick(RHYMES.filter(function (g) { return g.length >= 2; }));
      var cue = pick(group);
      var ans = pick(group.filter(function (x) { return x.word !== cue.word; }));
      var pool = shuffle(RHYMES.filter(function (g) { return g !== group; })
        .reduce(function (a, g) { return a.concat(g); }, []));
      var dz = pool.filter(function (x) { return x.word !== ans.word && x.word !== cue.word; }).slice(0, 2);
      return {
        stage: '<div class="teach"><span class="teach-emoji">' + cue.emoji + "</span>" +
               '<span class="teach-cap">' + cue.word + "</span></div>",
        prompt: "Which one rhymes with " + cue.word + "?",
        say: "Which one rhymes with " + cue.word + "?",
        choices: shuffle([ans].concat(dz)).map(function (x) { return picTile(x.emoji, x.word, x.word === ans.word); })
      };
    }
    if (type === "numbers" || type === "countmatch") {
      var count = 1 + Math.floor(Math.random() * 9);          // 1..9
      var emoji = pick(COUNT_EMOJIS);
      var objs = "";
      for (var i = 0; i < count; i++) objs += '<span class="count-obj">' + emoji + "</span>";
      var nums = shuffle(uniqueNumbers(count, 3));
      return {
        stage: '<div class="count-stage">' + objs + "</div>",
        prompt: "How many? Tap the number.",
        say: "Let's count! How many " + emoji + " do you see?",
        choices: nums.map(function (n) {
          return { html: '<span class="big-letter">' + n + "</span>", correct: n === count };
        })
      };
    }
    if (type === "sequence") {
      var start = 1 + Math.floor(Math.random() * 5);   // 1..5
      var answer = start + 3;
      var train = '<div class="count-stage seq-stage">';
      for (var s = 0; s < 3; s++) train += '<span class="seq-num">' + (start + s) + "</span>";
      train += '<span class="seq-num seq-q">?</span></div>';
      return {
        stage: train,
        prompt: "What number comes next?",
        say: "Look at the number train. What comes next?",
        choices: seqOptions(answer).map(function (n) {
          return { html: '<span class="big-letter">' + n + "</span>", correct: n === answer };
        })
      };
    }
    if (type === "opposites") {
      var pair = pick(OPPOSITES);
      var useA = Math.random() < 0.5;
      var oCue = useA ? pair.a : pair.b;
      var oAns = useA ? pair.b : pair.a;
      var oPool = shuffle(OPPOSITES.filter(function (p) { return p !== pair; })
        .map(function (p) { return Math.random() < 0.5 ? p.a : p.b; }));
      var oDz = oPool.filter(function (x) { return x.word !== oAns.word && x.word !== oCue.word; }).slice(0, 2);
      return {
        stage: '<div class="teach"><span class="teach-emoji">' + oCue.emoji + "</span>" +
               '<span class="teach-cap">' + oCue.word + "</span></div>",
        prompt: "Find the opposite of " + oCue.word + "!",
        say: "Find the opposite of " + oCue.word + "!",
        choices: shuffle([oAns].concat(oDz)).map(function (x) { return picTile(x.emoji, x.word, x.word === oAns.word); })
      };
    }
    if (type === "animals") {
      var at = pick(ANIMAL_SOUNDS);
      var aOpts = sampleWith(ANIMAL_SOUNDS, at, 3, function (x) { return x.animal; });
      return {
        stage: '<div class="teach sound-teach"><span class="teach-emoji">🔊</span>' +
               '<span class="teach-cap">Who says &ldquo;' + at.sound + '&rdquo;?</span></div>',
        prompt: "Who says “" + at.sound + "”?",
        say: "Who says " + at.sound + "? " + at.sound + "!",
        choices: aOpts.map(function (o) { return picTile(o.emoji, o.animal, o.animal === at.animal); })
      };
    }
    if (type === "patterns") {
      var unit = pick(PATTERN_SETS);
      var reps = 2;
      var seqHtml = "";
      for (var pi = 0; pi < unit.length * reps; pi++) seqHtml += '<span class="count-obj">' + unit[pi % unit.length] + "</span>";
      var pAnswer = unit[(unit.length * reps) % unit.length];
      seqHtml += '<span class="count-obj pattern-q">❓</span>';
      var pOpts = unit.slice();
      var dz = shuffle(PATTERN_DISTRACT.filter(function (x) { return unit.indexOf(x) === -1; }));
      for (var di = 0; di < dz.length && pOpts.length < 4; di++) if (pOpts.indexOf(dz[di]) === -1) pOpts.push(dz[di]);
      return {
        stage: '<div class="count-stage">' + seqHtml + "</div>",
        prompt: "What comes next?",
        say: "What comes next in the pattern?",
        choices: shuffle(pOpts).map(function (e) { return { html: '<span class="big-shape">' + e + "</span>", correct: e === pAnswer }; })
      };
    }
    if (type === "oddone") {
      var set = pick(ODD_SETS);
      return {
        stage: "",
        prompt: "Which one is different?",
        say: "Which one is different?",
        choices: shuffle(set.items).map(function (e) { return { html: '<span class="big-shape">' + e + "</span>", correct: e === set.odd }; })
      };
    }
    if (type === "colors") {
      var target2 = pick(COLORS);
      var opts2 = sampleWith(COLORS, target2, 4, function (x) { return x.name; });
      return {
        stage: "",
        prompt: "Tap the " + target2.name + " one!",
        say: "Tap the " + target2.name + " one!",
        choices: opts2.map(function (o) {
          return { html: '<span class="blob" style="background:' + o.hex + '"></span>', correct: o.name === target2.name };
        })
      };
    }
    // shapes
    var target3 = pick(SHAPES);
    var opts3 = sampleWith(SHAPES, target3, 4, function (x) { return x.name; });
    return {
      stage: "",
      prompt: "Tap the " + target3.name + "!",
      say: "Can you find the " + target3.name + "?",
      choices: opts3.map(function (o) {
        return { html: '<span class="big-shape">' + o.emoji + "</span>", correct: o.name === target3.name };
      })
    };
  }

  function uniqueNumbers(must, n) {
    var out = [must];
    var guard = 0;
    while (out.length < n && guard++ < 100) {
      var cand = 1 + Math.floor(Math.random() * 9);
      if (out.indexOf(cand) === -1) out.push(cand);
    }
    return out;
  }

  // Three number choices for "What's Next?": the answer plus near-miss distractors.
  function seqOptions(answer) {
    var near = shuffle([answer - 2, answer - 1, answer + 1, answer + 2].filter(function (n) {
      return n >= 1 && n <= 10 && n !== answer;
    }));
    var out = [answer];
    for (var i = 0; i < near.length && out.length < 3; i++) {
      if (out.indexOf(near[i]) === -1) out.push(near[i]);
    }
    for (var f = 1; f <= 10 && out.length < 3; f++) {
      if (out.indexOf(f) === -1) out.push(f);
    }
    return shuffle(out);
  }

  function startPickGame(type) {
    var g = GAMES.concat(SUMMER_GAMES).find(function (x) { return x.id === type; });
    state.rounds = [];
    for (var i = 0; i < ROUNDS_PER_GAME; i++) state.rounds.push(makeRound(type));
    state.roundIndex = 0;
    el.gameName.textContent = g.emoji + " " + g.name;
    el.roundTotal.textContent = ROUNDS_PER_GAME;
    showScreen("play");
    loadRound();
  }

  function loadRound() {
    var r = state.rounds[state.roundIndex];
    state.busy = false;
    el.roundNow.textContent = state.roundIndex + 1;
    el.playProgress.style.width = (state.roundIndex / ROUNDS_PER_GAME * 100) + "%";
    el.stage.innerHTML = r.stage;
    el.prompt.textContent = r.prompt;
    el.feedback.textContent = "";
    el.feedback.className = "feedback";
    el.choices.innerHTML = "";
    r.choices.forEach(function (c) {
      var tile = document.createElement("button");
      tile.className = "choice-tile";
      tile.innerHTML = c.html;
      tile.addEventListener("click", function () { onChoice(tile, c.correct, r); });
      el.choices.appendChild(tile);
    });
    speak(r.say);
  }

  function onChoice(tile, correct, round) {
    if (state.busy) return;
    if (window.Tracker) Tracker.answer(!!correct, state.gameType);
    if (!correct) {
      tile.classList.add("wrong");
      setTimeout(function () { tile.classList.remove("wrong"); }, 500);
      el.feedback.textContent = "Oops, try again! 💪";
      el.feedback.className = "feedback try";
      speak("Try again!");
      return;
    }
    state.busy = true;
    tile.classList.add("right");
    addStars(1);
    var praise = pick(PRAISE);
    el.feedback.textContent = praise;
    el.feedback.className = "feedback yay";
    speak(praise.replace(/[^\w! ]/g, ""));
    burstConfetti(18);
    setTimeout(nextRound, 1100);
  }

  function nextRound() {
    state.roundIndex++;
    if (state.roundIndex >= ROUNDS_PER_GAME) { finishPickGame(); return; }
    loadRound();
  }

  function finishPickGame() {
    if (window.Tracker) Tracker.complete("game", null, null, { item: state.gameType });
    el.playProgress.style.width = "100%";
    awardTrophy("game:" + state.gameType);
    checkGrand();
    checkSummerGrand();
    showResult();
  }

  // ---------- Memory Match ----------
  function startMatch() {
    var chosen = shuffle(MATCH_EMOJIS).slice(0, MATCH_PAIRS);
    var deck = shuffle(chosen.concat(chosen));
    state.match = { deck: deck, first: null, found: 0, lock: false };
    el.matchPairs.textContent = MATCH_PAIRS;
    el.matchFound.textContent = 0;
    el.matchBoard.innerHTML = "";
    el.matchBoard.style.setProperty("--cols", MATCH_PAIRS >= 4 ? 4 : MATCH_PAIRS);
    deck.forEach(function (emoji, idx) {
      var card = document.createElement("button");
      card.className = "match-card";
      card.dataset.emoji = emoji;
      card.dataset.idx = idx;
      card.innerHTML = '<span class="mc-inner"><span class="mc-front">❓</span>' +
                       '<span class="mc-back">' + emoji + "</span></span>";
      card.addEventListener("click", function () { onMatchCard(card); });
      el.matchBoard.appendChild(card);
    });
    showScreen("match");
    speak("Find the matching pairs!");
  }

  function onMatchCard(card) {
    var m = state.match;
    if (m.lock || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    card.classList.add("flipped");
    if (!m.first) { m.first = card; return; }

    if (m.first.dataset.emoji === card.dataset.emoji) {
      card.classList.add("matched");
      m.first.classList.add("matched");
      m.first = null;
      m.found++;
      el.matchFound.textContent = m.found;
      addStars(1);
      burstConfetti(16);
      speak(pick(PRAISE).replace(/[^\w! ]/g, ""));
      if (m.found === MATCH_PAIRS) { setTimeout(finishMatch, 700); }
    } else {
      m.lock = true;
      var a = m.first, b = card;
      speak("Try again!");
      setTimeout(function () {
        a.classList.remove("flipped");
        b.classList.remove("flipped");
        m.first = null; m.lock = false;
      }, 850);
    }
  }

  function finishMatch() {
    awardTrophy("game:match");
    checkGrand();
    showResult();
  }

  // ---------- Result ----------
  function showResult() {
    // flush any milestone trophies won during this game as toasts
    var wonMilestones = pendingMilestones.slice();
    pendingMilestones = [];

    el.resultEmoji.textContent = pick(["🎉", "🥳", "🌟", "🎈", "🏆"]);
    el.resultHeadline.textContent = pick(["You did it!", "Hooray!", "Amazing!", "Superstar!"]);
    el.resultStarsEarned.textContent = "You earned " + state.starsThisGame + " ⭐";
    el.resultStars.innerHTML = "";
    var n = Math.min(state.starsThisGame, 5);
    for (var i = 0; i < n; i++) {
      var s = document.createElement("span");
      s.className = "pop-star";
      s.textContent = "⭐";
      s.style.animationDelay = (i * 0.12) + "s";
      el.resultStars.appendChild(s);
    }
    if (wonMilestones.length) {
      var t = wonMilestones[wonMilestones.length - 1];
      el.rewardUnlock.hidden = false;
      el.rewardUnlock.textContent = "🎉 New trophy: " + t.icon + " " + t.name + "!";
    } else {
      el.rewardUnlock.hidden = true;
    }
    showScreen("result");
    burstConfetti(60);
    speak("You did it! You earned " + state.starsThisGame + " stars!");
  }

  // ---------- Trophy case ----------
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
    var colors = ["#ff6f91", "#8a7dff", "#33c9dc", "#7ed957", "#ffb84d"];
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
    updateStarBadge();

    el.backBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.summerBtn.addEventListener("click", function () { buildSummer(); showScreen("summer"); });
    el.trophyBtn.addEventListener("click", function () { buildTrophies(); showScreen("trophy"); });
    el.resultTrophyBtn.addEventListener("click", function () { buildTrophies(); showScreen("trophy"); });
    el.resultHomeBtn.addEventListener("click", function () { buildHome(); showScreen("home"); });
    el.playAgainBtn.addEventListener("click", function () {
      state.starsThisGame = 0;
      startGameById(state.gameType);
    });
    el.replayBtn.addEventListener("click", function () {
      var r = state.rounds[state.roundIndex];
      if (r) speak(r.say);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !el.screens.home.classList.contains("active")) {
        buildHome(); showScreen("home");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
