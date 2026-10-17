/* ============================================================
   Reading Trail — App Logic
   Vanilla JS. A stage-by-stage learn-to-read journey guided by
   Ollie the Owl. Five activity types (pick, clap, soundout,
   karaoke, story), points, collectible stickers, and trophies.
   Progress saved under the "rd_" key prefix. Kindness-first:
   a wrong answer says "try again" and never ends the stage.
   ============================================================ */

(function () {
  "use strict";

  var state = {
    points: loadPoints(),
    done: loadDone(),          // Set of completed stage ids
    trophies: loadTrophies(),  // Set of trophy ids
    stage: null,
    roundIndex: 0,
    locked: false,
    stageMistakes: 0,
    clapCount: 0
  };

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var el = {
    screens: {
      home: $("homeScreen"),
      play: $("playScreen"),
      stageResult: $("stageResultScreen"),
      sticker: $("stickerScreen"),
      trophy: $("trophyScreen")
    },
    backBtn: $("backBtn"),
    pointCount: $("pointCount"),
    pointsBadge: $("pointsBadge"),
    ollie: $("ollie"),
    ollieSay: $("ollieSay"),
    stickerBtn: $("stickerBtn"),
    trophyBtn: $("trophyBtn"),
    trail: $("trail"),
    // play
    stageName: $("stageName"),
    stepNow: $("stepNow"),
    stepTotal: $("stepTotal"),
    playProgress: $("playProgress"),
    activityBody: $("activityBody"),
    activityFeedback: $("activityFeedback"),
    // result
    resultHeadline: $("resultHeadline"),
    stickerEarned: $("stickerEarned"),
    stickerEarnedName: $("stickerEarnedName"),
    resultPoints: $("resultPoints"),
    rewardUnlock: $("rewardUnlock"),
    nextStageBtn: $("nextStageBtn"),
    resultTrailBtn: $("resultTrailBtn"),
    // sticker book
    stickerCount: $("stickerCount"),
    stickerTotal: $("stickerTotal"),
    stickerGrid: $("stickerGrid"),
    // trophy
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid")
  };

  // ---------- Persistence ----------
  function loadPoints() { return parseInt(localStorage.getItem("rd_points") || "0", 10); }
  function savePoints() { localStorage.setItem("rd_points", String(state.points)); }
  function loadSet(key) { try { return new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch (e) { return new Set(); } }
  function loadDone() { return loadSet("rd_done"); }
  function saveDone() { localStorage.setItem("rd_done", JSON.stringify(Array.from(state.done))); }
  function loadTrophies() { return loadSet("rd_trophies"); }
  function saveTrophies() { localStorage.setItem("rd_trophies", JSON.stringify(Array.from(state.trophies))); }

  // ---------- Helpers ----------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function stopSpeaking() { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); }
  function speak(text, opts) {
    if (!("speechSynthesis" in window) || !text) return;
    opts = opts || {};
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.9; u.pitch = opts.pitch || 1.05;
    window.speechSynthesis.speak(u);
  }
  function speakParts(parts, alsoWhole) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    parts.forEach(function (p) {
      var u = new SpeechSynthesisUtterance(p);
      u.rate = 0.75; u.pitch = 1.05;
      window.speechSynthesis.speak(u);
    });
    if (alsoWhole) {
      var w = new SpeechSynthesisUtterance(alsoWhole);
      w.rate = 0.95; w.pitch = 1.05;
      window.speechSynthesis.speak(w);
    }
  }

  function showScreen(name) {
    stopSpeaking();
    Object.keys(el.screens).forEach(function (k) { el.screens[k].classList.remove("active"); });
    el.screens[name].classList.add("active");
    el.backBtn.hidden = (name === "home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updatePointsBadge() {
    el.pointCount.textContent = state.points;
    var icon = el.pointsBadge.querySelector(".pt-icon");
    icon.style.animation = "none"; void icon.offsetWidth; icon.style.animation = "pop 0.4s ease";
  }
  function addPoints(n) { state.points += n; savePoints(); updatePointsBadge(); }

  function setFeedback(text, cls) { el.activityFeedback.textContent = text; el.activityFeedback.className = "activity-feedback " + (cls || ""); }
  function clearFeedback() { el.activityFeedback.textContent = ""; el.activityFeedback.className = "activity-feedback"; }

  function stepsTotal(stage) { return stage.activity === "story" ? stage.rounds.length + 1 : stage.rounds.length; }

  // ---------- Trophies ----------
  function awardTrophy(id) {
    if (state.trophies.has(id)) return false;
    state.trophies.add(id); saveTrophies();
    var t = READING_TROPHIES.find(function (x) { return x.id === id; });
    if (t) showTrophyToast(t);
    return true;
  }
  function showTrophyToast(trophy) {
    var toast = document.createElement("div");
    toast.className = "trophy-toast";
    toast.innerHTML = '<span class="toast-icon">' + trophy.icon + "</span><span>New trophy: <b>" + trophy.name + "</b>!</span>";
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () { toast.classList.remove("show"); setTimeout(function () { toast.remove(); }, 500); }, 2600);
  }

  // ---------- Trail (home) ----------
  function buildTrail() {
    el.trail.innerHTML = "";
    READING_STAGES.forEach(function (stage, i) {
      var done = state.done.has(stage.id);
      var unlocked = (i === 0) || state.done.has(READING_STAGES[i - 1].id);
      var status = done ? "done" : (unlocked ? "current" : "locked");
      var stop = document.createElement("button");
      stop.className = "trail-stop " + status + (i % 2 ? " right" : " left");
      stop.innerHTML =
        '<span class="stop-num">' + (i + 1) + "</span>" +
        '<span class="stop-emoji">' + (status === "locked" ? "🔒" : stage.emoji) + "</span>" +
        '<span class="stop-info"><span class="stop-name">' + stage.name + "</span>" +
        '<span class="stop-badge">' + (done ? stage.sticker.emoji + " Sticker earned" : (unlocked ? "Tap to start →" : "Locked")) + "</span></span>";
      stop.addEventListener("click", function () {
        if (status === "locked") {
          stop.classList.remove("shake"); void stop.offsetWidth; stop.classList.add("shake");
          sayOllie("Finish the stage before this one to unlock it! 🔒");
          return;
        }
        openStage(stage);
      });
      el.trail.appendChild(stop);
    });
  }

  function sayOllie(text) { el.ollieSay.textContent = text; }

  // ---------- Stage flow ----------
  function openStage(stage) {
    state.stage = stage;
    state.roundIndex = 0;
    state.stageMistakes = 0;
    el.stageName.textContent = stage.emoji + " " + stage.name;
    sayOllie(stage.intro);
    renderRound();
    showScreen("play");
  }

  function updateStep() {
    var total = stepsTotal(state.stage);
    el.stepNow.textContent = Math.min(state.roundIndex + 1, total);
    el.stepTotal.textContent = total;
    el.playProgress.style.width = (state.roundIndex / total * 100) + "%";
  }

  function renderRound() {
    state.locked = false;
    clearFeedback();
    updateStep();
    var stage = state.stage;
    if (stage.activity === "story") {
      if (state.roundIndex === 0) renderPassage(stage);
      else renderPick(stage.rounds[state.roundIndex - 1]);
      return;
    }
    var r = stage.rounds[state.roundIndex];
    if (stage.activity === "pick") renderPick(r);
    else if (stage.activity === "clap") renderClap(r);
    else if (stage.activity === "soundout") renderSoundout(stage, r);
    else if (stage.activity === "karaoke") renderKaraoke(r);
  }

  function nextStep() {
    state.roundIndex++;
    if (state.roundIndex >= stepsTotal(state.stage)) { stageComplete(state.stage); return; }
    renderRound();
  }

  function onAnswer(correct, btn) {
    if (state.locked) return;
    if (window.Tracker) Tracker.answer(!!correct, (state.stage && (state.stage.name || state.stage.title || state.stage.id)));
    if (!correct) {
      state.stageMistakes++;
      btn.classList.add("wrong");
      btn.disabled = true;
      setFeedback("Good try — give it another go! 💪", "try");
      return;
    }
    state.locked = true;
    btn.classList.add("right");
    Array.prototype.forEach.call(el.activityBody.querySelectorAll(".choice"), function (b) { b.disabled = true; });
    addPoints(1);
    setFeedback(pick(OLLIE_CHEERS), "win");
    burstConfetti(14);
    el.playProgress.style.width = ((state.roundIndex + 1) / stepsTotal(state.stage) * 100) + "%";
    setTimeout(nextStep, 1050);
  }

  // ---------- Activity: pick ----------
  function renderPick(r) {
    var body = el.activityBody; body.innerHTML = "";
    if (r.text) {
      var t = document.createElement("div");
      t.className = "big-prompt";
      t.textContent = r.text;
      body.appendChild(t);
    }
    var ask = document.createElement("p");
    ask.className = "ask";
    ask.textContent = r.prompt;
    body.appendChild(ask);

    var say = document.createElement("button");
    say.className = "say-btn";
    say.innerHTML = "🔊 Hear it";
    say.addEventListener("click", function () { speak(r.say || r.text || r.prompt); });
    body.appendChild(say);

    var row = document.createElement("div");
    row.className = "choice-row " + (r.kind === "emoji" ? "emoji-choices" : r.kind === "letter" ? "letter-choices" : "word-choices");
    r.choices.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "choice";
      b.textContent = c.t;
      b.addEventListener("click", function () { if (c.say) speak(c.say); onAnswer(!!c.correct, b); });
      row.appendChild(b);
    });
    body.appendChild(row);
    speak(r.say || r.text || r.prompt);
  }

  // ---------- Activity: clap ----------
  function renderClap(r) {
    var body = el.activityBody; body.innerHTML = "";
    var card = document.createElement("div");
    card.className = "word-card";
    card.innerHTML = '<span class="word-emoji">' + r.emoji + '</span><span class="word-text">' + r.word + "</span>";
    body.appendChild(card);

    var tools = document.createElement("div");
    tools.className = "clap-tools";
    var slow = document.createElement("button");
    slow.className = "say-btn";
    slow.innerHTML = "🐢 Say it slowly";
    slow.addEventListener("click", function () { speakParts(r.parts, r.word); });
    var clap = document.createElement("button");
    clap.className = "clap-btn";
    clap.innerHTML = "👏 Clap!";
    var beats = document.createElement("div");
    beats.className = "beats";
    state.clapCount = 0;
    clap.addEventListener("click", function () {
      state.clapCount = (state.clapCount % 5) + 1;
      beats.innerHTML = "";
      for (var i = 0; i < state.clapCount; i++) { var d = document.createElement("span"); d.className = "beat"; d.textContent = "👏"; beats.appendChild(d); }
      clap.classList.remove("bump"); void clap.offsetWidth; clap.classList.add("bump");
    });
    tools.appendChild(slow);
    tools.appendChild(clap);
    body.appendChild(tools);
    body.appendChild(beats);

    var ask = document.createElement("p");
    ask.className = "ask";
    ask.textContent = "How many beats (syllables)?";
    body.appendChild(ask);

    var row = document.createElement("div");
    row.className = "choice-row letter-choices";
    [1, 2, 3].forEach(function (n) {
      var b = document.createElement("button");
      b.className = "choice";
      b.textContent = n;
      b.addEventListener("click", function () { onAnswer(n === r.syllables, b); });
      row.appendChild(b);
    });
    body.appendChild(row);
    speak(r.word);
  }

  // ---------- Activity: soundout ----------
  function renderSoundout(stage, r) {
    var body = el.activityBody; body.innerHTML = "";
    var chips = document.createElement("div");
    chips.className = "chip-row";
    r.parts.forEach(function (part, i) {
      if (i > 0) { var plus = document.createElement("span"); plus.className = "chip-plus"; plus.textContent = "+"; chips.appendChild(plus); }
      var chip = document.createElement("button");
      chip.className = "chip";
      chip.textContent = part;
      chip.addEventListener("click", function () {
        chip.classList.remove("lit"); void chip.offsetWidth; chip.classList.add("lit");
        speak(part, { rate: 0.75 });
      });
      chips.appendChild(chip);
    });
    body.appendChild(chips);

    var blend = document.createElement("button");
    blend.className = "blend-btn";
    blend.innerHTML = "🔊 Blend it together!";
    blend.addEventListener("click", function () { speakParts(r.parts, r.word); });
    body.appendChild(blend);

    var ask = document.createElement("p");
    ask.className = "ask";
    ask.textContent = "Now read the word — tap the picture!";
    body.appendChild(ask);

    var row = document.createElement("div");
    row.className = "choice-row emoji-choices";
    r.choices.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "choice";
      b.textContent = c.t;
      b.addEventListener("click", function () { onAnswer(!!c.correct, b); });
      row.appendChild(b);
    });
    body.appendChild(row);
    speakParts(r.parts, r.word);
  }

  // ---------- Activity: karaoke ----------
  function renderKaraoke(r) {
    var body = el.activityBody; body.innerHTML = "";
    var phrase = document.createElement("div");
    phrase.className = "phrase";
    r.words.forEach(function (w) {
      var span = document.createElement("span");
      span.className = "phrase-word";
      span.textContent = w;
      phrase.appendChild(span);
    });
    body.appendChild(phrase);

    var play = document.createElement("button");
    play.className = "blend-btn";
    play.innerHTML = "▶️ Read along";
    play.addEventListener("click", function () {
      var words = phrase.querySelectorAll(".phrase-word");
      speak(r.words.join(" "), { rate: 0.85 });
      var i = 0;
      words.forEach(function (w) { w.classList.remove("lit"); });
      var timer = setInterval(function () {
        words.forEach(function (w) { w.classList.remove("lit"); });
        if (i < words.length) { words[i].classList.add("lit"); i++; }
        else clearInterval(timer);
      }, 470);
    });
    body.appendChild(play);

    var ask = document.createElement("p");
    ask.className = "ask";
    ask.textContent = "Now YOU read it out loud, then tap the star!";
    body.appendChild(ask);

    var done = document.createElement("button");
    done.className = "choice read-it";
    done.textContent = "⭐ I read it!";
    done.addEventListener("click", function () {
      if (state.locked) return;
      state.locked = true;
      done.classList.add("right");
      addPoints(1);
      setFeedback(pick(OLLIE_CHEERS), "win");
      burstConfetti(14);
      el.playProgress.style.width = ((state.roundIndex + 1) / stepsTotal(state.stage) * 100) + "%";
      setTimeout(nextStep, 900);
    });
    body.appendChild(done);
  }

  // ---------- Activity: story ----------
  function renderPassage(stage) {
    var body = el.activityBody; body.innerHTML = "";
    var panel = document.createElement("div");
    panel.className = "passage";
    stage.passage.forEach(function (line) {
      var p = document.createElement("p");
      p.className = "passage-line";
      p.textContent = line;
      panel.appendChild(p);
    });
    body.appendChild(panel);

    var say = document.createElement("button");
    say.className = "say-btn";
    say.innerHTML = "🔊 Read the story to me";
    say.addEventListener("click", function () { speak(stage.passage.join(" "), { rate: 0.9 }); });
    body.appendChild(say);

    var go = document.createElement("button");
    go.className = "blend-btn";
    go.innerHTML = "📝 Answer the questions →";
    go.addEventListener("click", nextStep);
    body.appendChild(go);

    speak(stage.passage.join(" "), { rate: 0.9 });
  }

  // ---------- Stage complete ----------
  function stageComplete(stage) {
    state.done.add(stage.id);
    saveDone();

    var allDone = READING_STAGES.every(function (s) { return state.done.has(s.id); });
    var newT = [];
    var checks = [
      ["first-steps", state.done.size >= 1],
      ["sprout", state.done.size >= 3],
      ["wizard", state.done.size >= 6],
      ["perfect", state.stageMistakes === 0],
      ["champion", allDone]
    ];
    checks.forEach(function (c) { if (c[1] && awardTrophy(c[0])) newT.push(c[0]); });

    el.stickerEarned.textContent = stage.sticker.emoji;
    el.stickerEarnedName.textContent = stage.sticker.name;
    el.resultPoints.textContent = "You have " + state.points + " ⭐ reading points!";
    el.resultHeadline.textContent = allDone ? "You finished the trail! 🎉" : "Stage Complete!";

    if (newT.length) {
      var t = READING_TROPHIES.find(function (x) { return x.id === newT[newT.length - 1]; });
      el.rewardUnlock.hidden = false;
      el.rewardUnlock.textContent = "🏆 New trophy: " + t.icon + " " + t.name + "!";
    } else {
      el.rewardUnlock.hidden = true;
    }

    // next-stage button target
    var idx = READING_STAGES.indexOf(stage);
    el.nextStageBtn.hidden = (idx >= READING_STAGES.length - 1);

    showScreen("stageResult");
    burstConfetti(70);
    speak(allDone ? "Hooray! You finished the whole reading trail!" : "Great job! You earned the " + stage.sticker.name + " sticker!");
  }

  // ---------- Sticker book & trophies ----------
  function buildStickerBook() {
    el.stickerGrid.innerHTML = "";
    var earned = 0;
    READING_STAGES.forEach(function (stage) {
      var has = state.done.has(stage.id);
      if (has) earned++;
      var card = document.createElement("div");
      card.className = "sticker-card " + (has ? "earned" : "locked");
      card.innerHTML =
        '<span class="sticker-face">' + (has ? stage.sticker.emoji : "❔") + "</span>" +
        '<span class="sticker-name">' + (has ? stage.sticker.name : "???") + "</span>" +
        '<span class="sticker-stage">' + stage.name + "</span>";
      el.stickerGrid.appendChild(card);
    });
    el.stickerCount.textContent = earned;
    el.stickerTotal.textContent = READING_STAGES.length;
  }

  function buildTrophies() {
    el.trophyGrid.innerHTML = "";
    var earned = 0;
    READING_TROPHIES.forEach(function (t) {
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
    el.trophyTotalCount.textContent = READING_TROPHIES.length;
  }

  // ---------- Confetti ----------
  function burstConfetti(count) {
    var colors = ["#46b06e", "#4aa8e0", "#ffc94d", "#ff8b6a", "#9b6ef0"];
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
    buildTrail();
    updatePointsBadge();

    el.backBtn.addEventListener("click", function () { buildTrail(); showScreen("home"); });
    el.stickerBtn.addEventListener("click", function () { buildStickerBook(); showScreen("sticker"); });
    el.trophyBtn.addEventListener("click", function () { buildTrophies(); showScreen("trophy"); });
    el.resultTrailBtn.addEventListener("click", function () { buildTrail(); showScreen("home"); });
    el.nextStageBtn.addEventListener("click", function () {
      var idx = READING_STAGES.indexOf(state.stage);
      if (idx < READING_STAGES.length - 1) openStage(READING_STAGES[idx + 1]);
      else { buildTrail(); showScreen("home"); }
    });

    document.addEventListener("keydown", function (e) {
      if (!el.screens.play.classList.contains("active") || state.locked) return;
      var n = parseInt(e.key, 10);
      var choices = el.activityBody.querySelectorAll(".choice");
      if (n >= 1 && n <= choices.length) choices[n - 1].click();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
