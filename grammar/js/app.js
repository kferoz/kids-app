/* ============================================================
   Grammar Galaxy — App Logic
   Vanilla JS. Lesson flashcards, quizzes, star rewards,
   trophies, read-aloud, and the "Word Detective" reward game.
   Progress is saved locally under the "gg_" key prefix.
   ============================================================ */

(function () {
  "use strict";

  const state = {
    topic: null,
    lessonIndex: 0,
    quizIndex: 0,
    quizScore: 0,
    quizLocked: false,
    stars: loadStars(),
    learned: loadLearned(),   // Set of "topicId:lessonIndex"
    trophies: loadTrophies(),  // Set of "topic:<id>" / "quiz:<id>"
    game: null,
    story: null
  };

  // ---------- Trophy catalog ----------
  const SUPER_READER = { id: "super-reader", icon: "🦸", name: "Super Reader", desc: "Finish every rescue story" };

  function buildTrophyCatalog() {
    const list = [];
    TOPICS.forEach((t) => {
      list.push({ id: "topic:" + t.id, icon: "🏅", name: t.name + " Master", desc: "Learn every lesson" });
      list.push({ id: "quiz:" + t.id, icon: "🏆", name: t.name + " Quiz", desc: "Finish the quiz" });
    });
    STORIES.forEach((s) => {
      list.push({ id: "story:" + s.id, icon: "📖", name: s.title, desc: "Read & answer" });
    });
    list.push(SUPER_READER);
    return list;
  }
  const TROPHY_CATALOG = buildTrophyCatalog();

  // ---------- Elements ----------
  const $ = (id) => document.getElementById(id);
  const el = {
    screens: {
      home: $("homeScreen"),
      fact: $("factScreen"),
      quiz: $("quizScreen"),
      result: $("resultScreen"),
      trophy: $("trophyScreen"),
      game: $("gameScreen"),
      story: $("storyScreen"),
      read: $("readScreen"),
      storyQuiz: $("storyQuizScreen"),
      storyResult: $("storyResultScreen")
    },
    backBtn: $("backBtn"),
    starCount: $("starCount"),
    scoreBadge: $("scoreBadge"),
    categoryGrid: $("categoryGrid"),
    surpriseBtn: $("surpriseBtn"),
    playGameBtn: $("playGameBtn"),
    trophyBtn: $("trophyBtn"),
    gameLockHint: $("gameLockHint"),
    // lesson
    factCategoryTitle: $("factCategoryTitle"),
    factIndex: $("factIndex"),
    factTotal: $("factTotal"),
    progressFill: $("progressFill"),
    flashcard: $("flashcard"),
    cardEmoji: $("cardEmoji"),
    cardQuestion: $("cardQuestion"),
    cardRule: $("cardRule"),
    cardExamples: $("cardExamples"),
    readBtn: $("readBtn"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    learnedBtn: $("learnedBtn"),
    startQuizBtn: $("startQuizBtn"),
    // quiz
    quizTitle: $("quizTitle"),
    quizIndex: $("quizIndex"),
    quizTotal: $("quizTotal"),
    quizProgressFill: $("quizProgressFill"),
    quizQuestion: $("quizQuestion"),
    quizOptions: $("quizOptions"),
    quizFeedback: $("quizFeedback"),
    // result
    resultEmoji: $("resultEmoji"),
    resultHeadline: $("resultHeadline"),
    resultScore: $("resultScore"),
    resultStars: $("resultStars"),
    resultMessage: $("resultMessage"),
    rewardUnlock: $("rewardUnlock"),
    rewardGameBtn: $("rewardGameBtn"),
    retryQuizBtn: $("retryQuizBtn"),
    backHomeBtn: $("backHomeBtn"),
    // trophy
    trophyEarned: $("trophyEarned"),
    trophyTotalCount: $("trophyTotalCount"),
    trophyGrid: $("trophyGrid"),
    // game
    gameRound: $("gameRound"),
    gameTotal: $("gameTotal"),
    gameTagline: $("gameTagline"),
    detectivePrompt: $("detectivePrompt"),
    detectiveSentence: $("detectiveSentence"),
    gameFeedback: $("gameFeedback"),
    newGameBtn: $("newGameBtn"),
    // story rescue
    storyBtn: $("storyBtn"),
    storyGrid: $("storyGrid"),
    readTitle: $("readTitle"),
    pageNow: $("pageNow"),
    pageTotal: $("pageTotal"),
    readProgress: $("readProgress"),
    storyScene: $("storyScene"),
    storyText: $("storyText"),
    storyReadBtn: $("storyReadBtn"),
    storyDots: $("storyDots"),
    readPrevBtn: $("readPrevBtn"),
    readNextBtn: $("readNextBtn"),
    readQuizBtn: $("readQuizBtn"),
    sqTitle: $("sqTitle"),
    sqIndex: $("sqIndex"),
    sqTotal: $("sqTotal"),
    sqProgress: $("sqProgress"),
    sqQuestion: $("sqQuestion"),
    sqOptions: $("sqOptions"),
    sqFeedback: $("sqFeedback"),
    srEmoji: $("srEmoji"),
    srHeadline: $("srHeadline"),
    srScore: $("srScore"),
    srStars: $("srStars"),
    srMessage: $("srMessage"),
    srUnlock: $("srUnlock"),
    srMoreBtn: $("srMoreBtn"),
    srAgainBtn: $("srAgainBtn"),
    srHomeBtn: $("srHomeBtn")
  };

  // ---------- Persistence ----------
  function loadStars() { return parseInt(localStorage.getItem("gg_stars") || "0", 10); }
  function saveStars() { localStorage.setItem("gg_stars", String(state.stars)); }
  function loadLearned() {
    try { return new Set(JSON.parse(localStorage.getItem("gg_learned") || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveLearned() { localStorage.setItem("gg_learned", JSON.stringify([...state.learned])); }
  function loadTrophies() {
    try { return new Set(JSON.parse(localStorage.getItem("gg_trophies") || "[]")); }
    catch (e) { return new Set(); }
  }
  function saveTrophies() { localStorage.setItem("gg_trophies", JSON.stringify([...state.trophies])); }

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
    void icon.offsetWidth;
    icon.style.animation = "pop 0.4s ease";
  }

  // ---------- Game unlock ----------
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
    if (state.trophies.has(id)) return false;
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

  // ---------- Home ----------
  function buildHome() {
    el.categoryGrid.innerHTML = "";
    TOPICS.forEach((topic) => {
      const btn = document.createElement("button");
      btn.className = "category-card";
      btn.style.setProperty("--c", topic.color);
      btn.innerHTML =
        '<span class="cat-emoji">' + topic.emoji + "</span>" +
        '<span class="cat-name">' + topic.name + "</span>" +
        '<span class="cat-count">' + topic.lessons.length + " lessons</span>";
      btn.addEventListener("click", () => openTopic(topic, 0));
      el.categoryGrid.appendChild(btn);
    });
  }

  // ---------- Lesson flashcards ----------
  function openTopic(topic, index) {
    state.topic = topic;
    state.lessonIndex = index || 0;
    el.factCategoryTitle.textContent = topic.name;
    el.factTotal.textContent = topic.lessons.length;
    document.documentElement.style.setProperty("--yellow", topic.color);
    renderLesson();
    showScreen("fact");
  }

  function renderLesson() {
    const topic = state.topic;
    const lesson = topic.lessons[state.lessonIndex];
    const wasFlipped = el.flashcard.classList.contains("flipped");
    el.flashcard.classList.remove("flipped");

    setTimeout(() => {
      el.cardEmoji.textContent = lesson.emoji;
      el.cardQuestion.textContent = lesson.teaser;
      el.cardRule.textContent = lesson.rule;
      el.cardExamples.innerHTML = "";
      lesson.examples.forEach((ex) => {
        const li = document.createElement("li");
        li.textContent = ex;
        el.cardExamples.appendChild(li);
      });
    }, wasFlipped ? 300 : 0);

    el.factIndex.textContent = state.lessonIndex + 1;
    const pct = ((state.lessonIndex + 1) / topic.lessons.length) * 100;
    el.progressFill.style.width = pct + "%";

    const key = topic.id + ":" + state.lessonIndex;
    if (state.learned.has(key)) {
      el.learnedBtn.textContent = "✅ Got It!";
      el.learnedBtn.classList.add("done");
      el.learnedBtn.disabled = true;
    } else {
      el.learnedBtn.textContent = "⭐ I Got It!";
      el.learnedBtn.classList.remove("done");
      el.learnedBtn.disabled = false;
    }
  }

  function flipCard() { el.flashcard.classList.toggle("flipped"); }
  function nextLesson() {
    const t = state.topic;
    state.lessonIndex = (state.lessonIndex + 1) % t.lessons.length;
    renderLesson();
  }
  function prevLesson() {
    const t = state.topic;
    state.lessonIndex = (state.lessonIndex - 1 + t.lessons.length) % t.lessons.length;
    renderLesson();
  }

  function markLearned() {
    const key = state.topic.id + ":" + state.lessonIndex;
    if (state.learned.has(key)) return;
    state.learned.add(key);
    saveLearned();
    state.stars += 1;
    saveStars();
    updateStarBadge();
    el.learnedBtn.textContent = "✅ Got It!";
    el.learnedBtn.classList.add("done");
    el.learnedBtn.disabled = true;
    burstConfetti(14);

    const topic = state.topic;
    const allLearned = topic.lessons.every((_, i) => state.learned.has(topic.id + ":" + i));
    if (allLearned) setTimeout(() => awardTrophy("topic:" + topic.id), 400);
  }

  // ---------- Read aloud ----------
  function readAloud() {
    if (!("speechSynthesis" in window)) return;
    const lesson = state.topic.lessons[state.lessonIndex];
    const text = lesson.rule + ". For example: " + lesson.examples.join(". ");
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.1;
    window.speechSynthesis.speak(utter);
  }

  // ---------- Quiz ----------
  function startQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    el.quizTitle.textContent = state.topic.name + " Quiz";
    el.quizTotal.textContent = state.topic.quiz.length;
    window.speechSynthesis && window.speechSynthesis.cancel();
    renderQuestion();
    showScreen("quiz");
  }

  function renderQuestion() {
    const q = state.topic.quiz[state.quizIndex];
    state.quizLocked = false;
    el.quizIndex.textContent = state.quizIndex + 1;
    el.quizQuestion.textContent = q.q;
    el.quizFeedback.textContent = "";
    el.quizFeedback.className = "quiz-feedback";
    const pct = ((state.quizIndex + 1) / state.topic.quiz.length) * 100;
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
    const q = state.topic.quiz[state.quizIndex];
    if (window.Tracker) Tracker.answer(choice === q.answer, (state.topic && (state.topic.name || state.topic.title || state.topic.id)));
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
      if (state.quizIndex < state.topic.quiz.length) renderQuestion();
      else finishQuiz();
    }, 1500);
  }

  function finishQuiz() {
    const total = state.topic.quiz.length;
    const score = state.quizScore;
    if (window.Tracker) Tracker.complete("quiz", score, total, { item: (state.topic && (state.topic.name || state.topic.title || state.topic.id)) });
    state.stars += score;
    saveStars();
    updateStarBadge();

    const wasUnlocked = isGameUnlocked();
    awardTrophy("quiz:" + state.topic.id);
    el.rewardUnlock.hidden = wasUnlocked;

    el.resultScore.textContent = "You got " + score + " out of " + total + "!";
    const ratio = score / total;
    let starStr = "";
    const bigStars = Math.round(ratio * 3);
    for (let i = 0; i < 3; i++) starStr += i < bigStars ? "⭐" : "☆";
    el.resultStars.textContent = starStr;

    if (ratio === 1) {
      el.resultEmoji.textContent = "🏆";
      el.resultHeadline.textContent = "Perfect Score!";
      el.resultMessage.textContent = "Wow, you're a Grammar Champion! You earned " + score + " stars.";
      burstConfetti(60);
    } else if (ratio >= 0.6) {
      el.resultEmoji.textContent = "🎉";
      el.resultHeadline.textContent = "Great Job!";
      el.resultMessage.textContent = "Your grammar is getting strong! You earned " + score + " stars.";
      burstConfetti(30);
    } else {
      el.resultEmoji.textContent = "🌱";
      el.resultHeadline.textContent = "Keep Practicing!";
      el.resultMessage.textContent = "Every try makes you better. You earned " + score + " stars. Try again!";
    }
    showScreen("result");
  }

  // ---------- Surprise lesson ----------
  function surpriseMe() {
    const topic = pick(TOPICS);
    const idx = Math.floor(Math.random() * topic.lessons.length);
    openTopic(topic, idx);
    setTimeout(() => el.flashcard.classList.add("flipped"), 350);
  }

  // ---------- Word Detective game ----------
  const GAME_ROUNDS = 6;

  function startGame() {
    const rounds = shuffle(WORD_GAME).slice(0, GAME_ROUNDS);
    state.game = { rounds: rounds, index: 0, locked: false };
    el.gameTotal.textContent = rounds.length;
    el.gameTagline.textContent = "Tap the correct word in the sentence! 🔍";
    el.gameTagline.style.color = "";
    renderRound();
  }

  function renderRound() {
    const g = state.game;
    const round = g.rounds[g.index];
    g.locked = false;
    el.gameRound.textContent = g.index + 1;
    el.gameFeedback.textContent = "";
    el.gameFeedback.className = "quiz-feedback";
    el.detectivePrompt.textContent = "Find the " + round.type + " (" + round.label + ")";

    el.detectiveSentence.innerHTML = "";
    round.words.forEach((word, i) => {
      const btn = document.createElement("button");
      btn.className = "detective-word";
      btn.textContent = word;
      btn.addEventListener("click", () => answerRound(i, btn));
      el.detectiveSentence.appendChild(btn);
    });
  }

  function answerRound(choice, btn) {
    const g = state.game;
    if (g.locked) return;
    g.locked = true;
    const round = g.rounds[g.index];
    if (window.Tracker) Tracker.answer(choice === round.answer, "Word Detective");
    const buttons = [...el.detectiveSentence.children];
    buttons.forEach((b) => (b.disabled = true));

    if (choice === round.answer) {
      btn.classList.add("correct");
      el.gameFeedback.textContent = pick(["Nice detective work! 🕵️", "Correct! 🌟", "You found it! 🎉"]);
      el.gameFeedback.classList.add("good");
      burstConfetti(10);
    } else {
      btn.classList.add("wrong");
      buttons[round.answer].classList.add("correct");
      el.gameFeedback.textContent = "Good try! The correct word is highlighted. 💡";
      el.gameFeedback.classList.add("bad");
    }

    setTimeout(() => {
      g.index += 1;
      if (g.index < g.rounds.length) renderRound();
      else winGame();
    }, 1400);
  }

  function winGame() {
    state.stars += 3;
    saveStars();
    updateStarBadge();
    el.detectivePrompt.textContent = "🎉 You solved every clue!";
    el.detectiveSentence.innerHTML = "";
    el.gameFeedback.textContent = "";
    el.gameTagline.innerHTML = "Great job, detective! +3 ⭐";
    el.gameTagline.style.color = "#fff";
    burstConfetti(50);
  }

  // ---------- Superhero Story Rescue ----------
  function buildStoryPicker() {
    el.storyGrid.innerHTML = "";
    STORIES.forEach((s) => {
      const done = state.trophies.has("story:" + s.id);
      const btn = document.createElement("button");
      btn.className = "story-card" + (done ? " read" : "");
      btn.innerHTML =
        '<span class="story-emoji">' + s.emoji + "</span>" +
        '<span class="story-name">' + s.title + "</span>" +
        '<span class="story-heroes">' + s.heroes + "</span>" +
        (done ? '<span class="story-badge">✅ Read!</span>' : '<span class="story-go">Read →</span>');
      btn.addEventListener("click", () => openStory(s));
      el.storyGrid.appendChild(btn);
    });
  }

  function openStory(story) {
    state.story = { data: story, page: 0, qIndex: 0, score: 0, locked: false };
    el.readTitle.textContent = story.emoji + " " + story.title;
    el.pageTotal.textContent = story.pages.length;
    renderPage();
    showScreen("read");
  }

  function renderPage() {
    const st = state.story;
    const page = st.data.pages[st.page];
    el.storyScene.textContent = page.emoji;
    // restart the scene bounce
    el.storyScene.style.animation = "none";
    void el.storyScene.offsetWidth;
    el.storyScene.style.animation = "";
    el.storyText.textContent = page.text;
    el.pageNow.textContent = st.page + 1;
    el.readProgress.style.width = ((st.page + 1) / st.data.pages.length) * 100 + "%";

    // page dots
    el.storyDots.innerHTML = "";
    st.data.pages.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "story-dot" + (i === st.page ? " active" : "");
      el.storyDots.appendChild(dot);
    });

    const last = st.page === st.data.pages.length - 1;
    el.readPrevBtn.disabled = st.page === 0;
    el.readNextBtn.hidden = last;
    el.readQuizBtn.hidden = !last;

    readStoryPage();
  }

  function readStoryPage() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(state.story.data.pages[state.story.page].text);
    utter.rate = 0.92;
    utter.pitch = 1.05;
    window.speechSynthesis.speak(utter);
  }

  function storyNext() {
    const st = state.story;
    if (st.page < st.data.pages.length - 1) { st.page++; renderPage(); }
  }
  function storyPrev() {
    const st = state.story;
    if (st.page > 0) { st.page--; renderPage(); }
  }

  function startStoryQuiz() {
    const st = state.story;
    st.qIndex = 0;
    st.score = 0;
    st.locked = false;
    window.speechSynthesis && window.speechSynthesis.cancel();
    el.sqTitle.textContent = st.data.title;
    el.sqTotal.textContent = st.data.questions.length;
    renderStoryQuestion();
    showScreen("storyQuiz");
  }

  function renderStoryQuestion() {
    const st = state.story;
    const q = st.data.questions[st.qIndex];
    st.locked = false;
    el.sqIndex.textContent = st.qIndex + 1;
    el.sqQuestion.textContent = q.q;
    el.sqFeedback.textContent = "";
    el.sqFeedback.className = "quiz-feedback";
    el.sqProgress.style.width = ((st.qIndex + 1) / st.data.questions.length) * 100 + "%";

    el.sqOptions.innerHTML = "";
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = opt;
      btn.addEventListener("click", () => answerStoryQuestion(i, btn));
      el.sqOptions.appendChild(btn);
    });
  }

  function answerStoryQuestion(choice, btn) {
    const st = state.story;
    if (st.locked) return;
    st.locked = true;
    const q = st.data.questions[st.qIndex];
    if (window.Tracker) Tracker.answer(choice === q.answer, "Story: " + (st.data && (st.data.title || st.data.id)));
    const buttons = [...el.sqOptions.children];
    buttons.forEach((b) => (b.disabled = true));

    if (choice === q.answer) {
      btn.classList.add("correct");
      st.score += 1;
      el.sqFeedback.textContent = pick(["Yes! 🎉", "Correct! 🌟", "Great reading! 👏", "You got it! ✨"]);
      el.sqFeedback.classList.add("good");
      burstConfetti(10);
    } else {
      btn.classList.add("wrong");
      buttons[q.answer].classList.add("correct");
      el.sqFeedback.textContent = "Good try! The answer is highlighted. 💡";
      el.sqFeedback.classList.add("bad");
    }

    setTimeout(() => {
      st.qIndex += 1;
      if (st.qIndex < st.data.questions.length) renderStoryQuestion();
      else finishStory();
    }, 1500);
  }

  function finishStory() {
    const st = state.story;
    const total = st.data.questions.length;
    const score = st.score;
    if (window.Tracker) Tracker.complete("story", score, total, { item: (st.data && (st.data.name || st.data.title || st.data.id)) });
    state.stars += score;
    saveStars();
    updateStarBadge();

    awardTrophy("story:" + st.data.id);
    // grand trophy when every story is read
    const allRead = STORIES.every((s) => state.trophies.has("story:" + s.id));
    let earnedSuper = false;
    if (allRead && !state.trophies.has(SUPER_READER.id)) earnedSuper = awardTrophy(SUPER_READER.id);

    el.srScore.textContent = "You got " + score + " out of " + total + "!";
    const ratio = score / total;
    let starStr = "";
    const bigStars = Math.round(ratio * 3);
    for (let i = 0; i < 3; i++) starStr += i < bigStars ? "⭐" : "☆";
    el.srStars.textContent = starStr;

    if (ratio === 1) {
      el.srEmoji.textContent = "🦸";
      el.srHeadline.textContent = "Rescue Complete!";
      el.srMessage.textContent = "You read like a superhero! You earned " + score + " stars.";
      burstConfetti(60);
    } else if (ratio >= 0.6) {
      el.srEmoji.textContent = "🎉";
      el.srHeadline.textContent = "Great Reading!";
      el.srMessage.textContent = "You understood the story well! You earned " + score + " stars.";
      burstConfetti(30);
    } else {
      el.srEmoji.textContent = "🌱";
      el.srHeadline.textContent = "Keep Reading!";
      el.srMessage.textContent = "Read it once more and try again — you earned " + score + " stars.";
    }

    el.srUnlock.hidden = !earnedSuper;
    if (earnedSuper) el.srUnlock.textContent = "🦸 You unlocked the Super Reader trophy!";
    showScreen("storyResult");
  }

  // ---------- Helpers ----------
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
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

  // ---------- Init ----------
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
    el.nextBtn.addEventListener("click", nextLesson);
    el.prevBtn.addEventListener("click", prevLesson);
    el.learnedBtn.addEventListener("click", markLearned);
    el.startQuizBtn.addEventListener("click", startQuiz);

    el.retryQuizBtn.addEventListener("click", startQuiz);
    el.backHomeBtn.addEventListener("click", () => showScreen("home"));

    // Story Rescue
    el.storyBtn.addEventListener("click", () => { buildStoryPicker(); showScreen("story"); });
    el.storyReadBtn.addEventListener("click", readStoryPage);
    el.readNextBtn.addEventListener("click", storyNext);
    el.readPrevBtn.addEventListener("click", storyPrev);
    el.readQuizBtn.addEventListener("click", startStoryQuiz);
    el.srMoreBtn.addEventListener("click", () => { buildStoryPicker(); showScreen("story"); });
    el.srAgainBtn.addEventListener("click", () => openStory(state.story.data));
    el.srHomeBtn.addEventListener("click", () => showScreen("home"));

    document.addEventListener("keydown", (e) => {
      if (el.screens.fact.classList.contains("active")) {
        if (e.key === "ArrowRight") nextLesson();
        else if (e.key === "ArrowLeft") prevLesson();
        else if (e.key === " " || e.key === "Enter") { e.preventDefault(); flipCard(); }
      } else if (el.screens.read.classList.contains("active")) {
        if (e.key === "ArrowRight") storyNext();
        else if (e.key === "ArrowLeft") storyPrev();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
