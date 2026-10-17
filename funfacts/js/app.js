/* ============================================================
   Fun Facts Explorer — App Logic
   Vanilla JS. No build step. Handles navigation, flashcards,
   quiz flow, star rewards (saved locally), and read-aloud.
   ============================================================ */

(function () {
  "use strict";

  // ---------- State ----------
  const state = {
    category: null,      // current category object
    factIndex: 0,        // index within category.facts
    quizIndex: 0,        // index within category.quiz
    quizScore: 0,        // correct answers this quiz
    quizLocked: false,   // prevent double answers
    stars: loadStars(),  // total stars earned
    learned: loadLearned(), // Set of "categoryId:factIndex" strings
    trophies: loadTrophies(), // Set of trophy ids, e.g. "topic:animals"
    game: null           // active memory-match game state
  };

  // ---------- Trophy catalog ----------
  // Two trophies per topic: a "topic" trophy (learn every fact) and a
  // "quiz" trophy (finish the quiz — gold if a perfect score was ever earned).
  function buildTrophyCatalog() {
    const list = [];
    CATEGORIES.forEach((cat) => {
      list.push({ id: "topic:" + cat.id, icon: "🏅", name: cat.name + " Master", desc: "Learn every fact" });
      list.push({ id: "quiz:" + cat.id, icon: "🏆", name: cat.name + " Quiz", desc: "Finish the quiz" });
    });
    return list;
  }
  const TROPHY_CATALOG = buildTrophyCatalog();

  // ---------- Element helpers ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    screens: {
      home: $("homeScreen"),
      fact: $("factScreen"),
      quiz: $("quizScreen"),
      result: $("resultScreen"),
      trophy: $("trophyScreen"),
      game: $("gameScreen")
    },
    backBtn: $("backBtn"),
    starCount: $("starCount"),
    scoreBadge: $("scoreBadge"),
    categoryGrid: $("categoryGrid"),
    surpriseBtn: $("surpriseBtn"),
    playGameBtn: $("playGameBtn"),
    trophyBtn: $("trophyBtn"),
    gameLockHint: $("gameLockHint"),
    rewardGameBtn: $("rewardGameBtn"),
    rewardUnlock: $("rewardUnlock"),
    // trophy screen
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid"),
    // game screen
    gameMoves: $("gameMoves"),
    gameTagline: $("gameTagline"),
    memoryBoard: $("memoryBoard"),
    newGameBtn: $("newGameBtn"),
    // fact screen
    factCategoryTitle: $("factCategoryTitle"),
    factIndex: $("factIndex"),
    factTotal: $("factTotal"),
    progressFill: $("progressFill"),
    flashcard: $("flashcard"),
    cardEmoji: $("cardEmoji"),
    cardQuestion: $("cardQuestion"),
    cardFact: $("cardFact"),
    readBtn: $("readBtn"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    learnedBtn: $("learnedBtn"),
    startQuizBtn: $("startQuizBtn"),
    // quiz screen
    quizTitle: $("quizTitle"),
    quizIndex: $("quizIndex"),
    quizTotal: $("quizTotal"),
    quizProgressFill: $("quizProgressFill"),
    quizQuestion: $("quizQuestion"),
    quizOptions: $("quizOptions"),
    quizFeedback: $("quizFeedback"),
    // result screen
    resultEmoji: $("resultEmoji"),
    resultHeadline: $("resultHeadline"),
    resultScore: $("resultScore"),
    resultStars: $("resultStars"),
    resultMessage: $("resultMessage"),
    retryQuizBtn: $("retryQuizBtn"),
    backHomeBtn: $("backHomeBtn")
  };

  // ---------- Persistence ----------
  function loadStars() {
    return parseInt(localStorage.getItem("ff_stars") || "0", 10);
  }
  function saveStars() {
    localStorage.setItem("ff_stars", String(state.stars));
  }
  function loadLearned() {
    try {
      return new Set(JSON.parse(localStorage.getItem("ff_learned") || "[]"));
    } catch (e) {
      return new Set();
    }
  }
  function saveLearned() {
    localStorage.setItem("ff_learned", JSON.stringify([...state.learned]));
  }
  function loadTrophies() {
    try {
      return new Set(JSON.parse(localStorage.getItem("ff_trophies") || "[]"));
    } catch (e) {
      return new Set();
    }
  }
  function saveTrophies() {
    localStorage.setItem("ff_trophies", JSON.stringify([...state.trophies]));
  }

  // ---------- Navigation ----------
  function showScreen(name) {
    Object.values(el.screens).forEach((s) => s.classList.remove("active"));
    el.screens[name].classList.add("active");
    el.backBtn.hidden = name === "home";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateStarBadge() {
    el.starCount.textContent = state.stars;
    const icon = el.scoreBadge.querySelector(".star-icon");
    icon.style.animation = "none";
    void icon.offsetWidth; // reflow to restart animation
    icon.style.animation = "pop 0.4s ease";
  }

  // ---------- Game unlock ----------
  // The Memory Game is a reward: it unlocks once the child completes any
  // topic (finishes its quiz or learns all of its facts).
  function isGameUnlocked() {
    for (const id of state.trophies) {
      if (id.indexOf("quiz:") === 0 || id.indexOf("topic:") === 0) return true;
    }
    return false;
  }

  function updateGameLock() {
    const unlocked = isGameUnlocked();
    el.playGameBtn.disabled = !unlocked;
    el.gameLockHint.hidden = unlocked;
  }

  // ---------- Trophies ----------
  function awardTrophy(id) {
    if (state.trophies.has(id)) return false; // already earned
    state.trophies.add(id);
    saveTrophies();
    const t = TROPHY_CATALOG.find((x) => x.id === id);
    if (t) showTrophyToast(t);
    burstConfetti(40);
    updateGameLock();
    return true;
  }

  function showTrophyToast(trophy) {
    const toast = document.createElement("div");
    toast.className = "trophy-toast";
    toast.innerHTML =
      '<span class="toast-icon">' + trophy.icon + "</span>" +
      "<span>New trophy: <b>" + trophy.name + "</b>!</span>";
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 2600);
  }

  function buildTrophies() {
    el.trophyGrid.innerHTML = "";
    let earned = 0;
    TROPHY_CATALOG.forEach((t) => {
      const has = state.trophies.has(t.id);
      if (has) earned++;
      const card = document.createElement("div");
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

  // ---------- Build home ----------
  function buildHome() {
    el.categoryGrid.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "category-card";
      btn.style.setProperty("--c", cat.color);
      btn.innerHTML =
        '<span class="cat-emoji">' + cat.emoji + "</span>" +
        '<span class="cat-name">' + cat.name + "</span>" +
        '<span class="cat-count">' + cat.facts.length + " fun facts</span>";
      btn.addEventListener("click", () => openCategory(cat, 0));
      el.categoryGrid.appendChild(btn);
    });
  }

  // ---------- Fact / flashcard screen ----------
  function openCategory(cat, index) {
    state.category = cat;
    state.factIndex = index || 0;
    el.factCategoryTitle.textContent = cat.name;
    el.factTotal.textContent = cat.facts.length;
    document.documentElement.style.setProperty("--yellow", cat.color);
    renderFact();
    showScreen("fact");
  }

  function renderFact() {
    const cat = state.category;
    const fact = cat.facts[state.factIndex];
    el.flashcard.classList.remove("flipped");

    // slight delay so the card doesn't show the answer while flipping back
    setTimeout(() => {
      el.cardEmoji.textContent = fact.emoji;
      el.cardQuestion.textContent = fact.teaser;
      el.cardFact.textContent = fact.fact;
    }, el.flashcard.classList.contains("flipped") ? 0 : 150);

    el.factIndex.textContent = state.factIndex + 1;
    const pct = ((state.factIndex + 1) / cat.facts.length) * 100;
    el.progressFill.style.width = pct + "%";

    // learned button state
    const key = cat.id + ":" + state.factIndex;
    if (state.learned.has(key)) {
      el.learnedBtn.textContent = "✅ Learned!";
      el.learnedBtn.classList.add("done");
      el.learnedBtn.disabled = true;
    } else {
      el.learnedBtn.textContent = "⭐ I Learned It!";
      el.learnedBtn.classList.remove("done");
      el.learnedBtn.disabled = false;
    }
  }

  function flipCard() {
    el.flashcard.classList.toggle("flipped");
  }

  function nextFact() {
    const cat = state.category;
    state.factIndex = (state.factIndex + 1) % cat.facts.length;
    renderFact();
  }
  function prevFact() {
    const cat = state.category;
    state.factIndex = (state.factIndex - 1 + cat.facts.length) % cat.facts.length;
    renderFact();
  }

  function markLearned() {
    const key = state.category.id + ":" + state.factIndex;
    if (state.learned.has(key)) return;
    state.learned.add(key);
    saveLearned();
    state.stars += 1;
    saveStars();
    updateStarBadge();
    el.learnedBtn.textContent = "✅ Learned!";
    el.learnedBtn.classList.add("done");
    el.learnedBtn.disabled = true;
    burstConfetti(14);

    // Award a topic trophy once every fact in this topic is learned.
    const cat = state.category;
    const allLearned = cat.facts.every((_, i) => state.learned.has(cat.id + ":" + i));
    if (allLearned) {
      setTimeout(() => awardTrophy("topic:" + cat.id), 400);
    }
  }

  // ---------- Read aloud ----------
  function readAloud() {
    if (!("speechSynthesis" in window)) return;
    const fact = state.category.facts[state.factIndex];
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(fact.fact);
    utter.rate = 0.95;
    utter.pitch = 1.15;
    window.speechSynthesis.speak(utter);
  }

  // ---------- Quiz ----------
  function startQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    el.quizTitle.textContent = state.category.name + " Quiz";
    el.quizTotal.textContent = state.category.quiz.length;
    window.speechSynthesis && window.speechSynthesis.cancel();
    renderQuestion();
    showScreen("quiz");
  }

  function renderQuestion() {
    const q = state.category.quiz[state.quizIndex];
    state.quizLocked = false;
    el.quizIndex.textContent = state.quizIndex + 1;
    el.quizQuestion.textContent = q.q;
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quiz-feedback";
    const pct = ((state.quizIndex + 1) / state.category.quiz.length) * 100;
    el.quizProgressFill.style.width = pct + "%";

    el.quizOptions.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => answerQuestion(i, btn));
      el.quizOptions.appendChild(btn);
    });
  }

  function answerQuestion(choice, btn) {
    if (state.quizLocked) return;
    state.quizLocked = true;
    const q = state.category.quiz[state.quizIndex];
    if (window.Tracker) Tracker.answer(choice === q.answer, (state.category && (state.category.name || state.category.title || state.category.id)));
    const buttons = [...el.quizOptions.children];
    buttons.forEach((b) => (b.disabled = true));

    if (choice === q.answer) {
      btn.classList.add("correct");
      state.quizScore += 1;
      el.quizFeedback.textContent = pick(["Yes! 🎉", "Correct! 🌟", "You got it! 👏", "Awesome! ✨"]);
      el.quizFeedback.classList.add("good");
      burstConfetti(10);
    } else {
      btn.classList.add("wrong");
      buttons[q.answer].classList.add("correct");
      el.quizFeedback.textContent = "Good try! The answer is highlighted. 💡";
      el.quizFeedback.classList.add("bad");
    }

    setTimeout(() => {
      state.quizIndex += 1;
      if (state.quizIndex < state.category.quiz.length) {
        renderQuestion();
      } else {
        finishQuiz();
      }
    }, 1500);
  }

  function finishQuiz() {
    const total = state.category.quiz.length;
    const score = state.quizScore;
    if (window.Tracker) Tracker.complete("quiz", score, total, { item: (state.category && (state.category.name || state.category.title || state.category.id)) });
    const earned = score; // 1 star per correct answer
    state.stars += earned;
    saveStars();
    updateStarBadge();

    // Completing a quiz completes the topic — award the quiz trophy and,
    // if this is the first topic completed, reveal that the game is unlocked.
    const wasUnlocked = isGameUnlocked();
    awardTrophy("quiz:" + state.category.id);
    el.rewardUnlock.hidden = wasUnlocked; // show only on the first unlock

    el.resultScore.textContent = "You got " + score + " out of " + total + "!";
    const ratio = score / total;
    let starStr = "";
    const bigStars = Math.round(ratio * 3);
    for (let i = 0; i < 3; i++) starStr += i < bigStars ? "⭐" : "☆";
    el.resultStars.textContent = starStr;

    if (ratio === 1) {
      el.resultEmoji.textContent = "🏆";
      el.resultHeadline.textContent = "Perfect Score!";
      el.resultMessage.textContent = "Wow, you're a Fun Facts Champion! You earned " + earned + " stars.";
      burstConfetti(60);
    } else if (ratio >= 0.6) {
      el.resultEmoji.textContent = "🎉";
      el.resultHeadline.textContent = "Great Job!";
      el.resultMessage.textContent = "You're learning so much! You earned " + earned + " stars.";
      burstConfetti(30);
    } else {
      el.resultEmoji.textContent = "🌱";
      el.resultHeadline.textContent = "Keep Growing!";
      el.resultMessage.textContent = "Every try makes you smarter. You earned " + earned + " stars. Try again!";
    }
    showScreen("result");
  }

  // ---------- Surprise / random fact ----------
  function surpriseMe() {
    const cat = pick(CATEGORIES);
    const idx = Math.floor(Math.random() * cat.facts.length);
    openCategory(cat, idx);
    setTimeout(() => el.flashcard.classList.add("flipped"), 350);
  }

  // ---------- Memory Match game ----------
  const GAME_PAIRS = 6; // 6 pairs = 12 cards (4 x 3)

  function collectGameEmojis() {
    const set = new Set();
    CATEGORIES.forEach((cat) => cat.facts.forEach((f) => set.add(f.emoji)));
    return [...set];
  }

  function startGame() {
    // choose random emojis, duplicate into pairs, then shuffle
    const pool = shuffle(collectGameEmojis()).slice(0, GAME_PAIRS);
    const deck = shuffle(pool.concat(pool)); // each emoji twice
    state.game = { deck: deck, first: null, moves: 0, matched: 0, busy: false };

    el.gameMoves.textContent = "0";
    el.gameTagline.textContent = "Find all the matching pairs! 🧩";
    el.gameTagline.style.color = "";

    const cols = 4;
    el.memoryBoard.style.gridTemplateColumns = "repeat(" + cols + ", 1fr)";
    el.memoryBoard.innerHTML = "";

    deck.forEach((emoji, i) => {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.dataset.emoji = emoji;
      card.dataset.index = i;
      card.setAttribute("aria-label", "memory card");
      card.innerHTML =
        '<div class="memory-card-inner">' +
          '<div class="memory-face memory-front">❓</div>' +
          '<div class="memory-face memory-back">' + emoji + "</div>" +
        "</div>";
      card.addEventListener("click", () => flipMemoryCard(card));
      el.memoryBoard.appendChild(card);
    });
  }

  function flipMemoryCard(card) {
    const g = state.game;
    if (!g || g.busy) return;
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");

    if (!g.first) {
      g.first = card;
      return;
    }

    // second card — count the move
    g.moves += 1;
    el.gameMoves.textContent = g.moves;

    if (g.first.dataset.emoji === card.dataset.emoji) {
      // match!
      g.first.classList.add("matched");
      card.classList.add("matched");
      g.first = null;
      g.matched += 1;
      burstConfetti(6);
      if (g.matched === GAME_PAIRS) winGame();
    } else {
      // no match — flip both back after a short peek
      g.busy = true;
      const firstCard = g.first;
      g.first = null;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        card.classList.remove("flipped");
        g.busy = false;
      }, 850);
    }
  }

  function winGame() {
    const moves = state.game.moves;
    state.stars += 3;
    saveStars();
    updateStarBadge();
    el.gameTagline.innerHTML = "🎉 You won in <b>" + moves + "</b> moves! +3 ⭐";
    el.gameTagline.style.color = "#fff";
    burstConfetti(50);
  }

  // ---------- Helpers ----------
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function burstConfetti(count) {
    const colors = ["#ff6f91", "#8a7dff", "#33c9dc", "#7ed957", "#ffb84d"];
    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = pick(colors);
      c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3200);
    }
  }

  // ---------- Wire up events ----------
  function init() {
    buildHome();
    updateStarBadge();
    updateGameLock();

    el.backBtn.addEventListener("click", () => {
      window.speechSynthesis && window.speechSynthesis.cancel();
      showScreen("home");
    });
    el.surpriseBtn.addEventListener("click", surpriseMe);
    el.trophyBtn.addEventListener("click", () => { buildTrophies(); showScreen("trophy"); });
    el.playGameBtn.addEventListener("click", () => { startGame(); showScreen("game"); });
    el.rewardGameBtn.addEventListener("click", () => { startGame(); showScreen("game"); });
    el.newGameBtn.addEventListener("click", startGame);

    el.flashcard.addEventListener("click", flipCard);
    el.readBtn.addEventListener("click", (e) => { e.stopPropagation(); readAloud(); });
    el.nextBtn.addEventListener("click", nextFact);
    el.prevBtn.addEventListener("click", prevFact);
    el.learnedBtn.addEventListener("click", markLearned);
    el.startQuizBtn.addEventListener("click", startQuiz);

    el.retryQuizBtn.addEventListener("click", startQuiz);
    el.backHomeBtn.addEventListener("click", () => showScreen("home"));

    // Keyboard support (helpful for classroom whiteboards)
    document.addEventListener("keydown", (e) => {
      if (!el.screens.fact.classList.contains("active")) return;
      if (e.key === "ArrowRight") nextFact();
      else if (e.key === "ArrowLeft") prevFact();
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
