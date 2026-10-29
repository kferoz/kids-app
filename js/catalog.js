/* ============================================================
   catalog.js — every activity, sorted by subject, grade and kind
   ------------------------------------------------------------
   The Hub's map of what to learn. Apps stay where they are; this
   file only says where each one (or each part of one, by a #hash
   deep link) belongs:

     subject  science | math | social | language | fun
     lang     english | tamil | arabic          (language only)
     section  learn | stories | practice | tests | games | rewards
     grades   the grades the content is written for (KidsDB codes)
     app      the data-app id the tracker files activity under

   One app can sit in several places (Sticker Quest is math
   practice AND a Unit 2 test for science and social studies).
   Phase 1's subject Hub reads this; tests check every href.
   ============================================================ */
(function (root) {
  "use strict";

  var SUBJECTS = [
    { id: "science",  name: "Science",        emoji: "🔬", color: "#20c997" },
    { id: "math",     name: "Math",           emoji: "➗", color: "#339af0" },
    { id: "social",   name: "Social Studies", emoji: "🌎", color: "#f08c00" },
    { id: "language", name: "Language",       emoji: "📖", color: "#e64980",
      langs: [
        { id: "english", name: "English", native: "English", emoji: "🔤" },
        { id: "tamil",   name: "Tamil",   native: "தமிழ்",   emoji: "🪷" },
        { id: "arabic",  name: "Arabic",  native: "العربية",  emoji: "🐪" }
      ] },
    { id: "fun",      name: "Fun Zone",       emoji: "🎉", color: "#7950f2" }
  ];
  var SECTIONS = [
    { id: "learn",    name: "Learn",    emoji: "📚" },
    { id: "stories",  name: "Stories",  emoji: "📖" },
    { id: "practice", name: "Practice", emoji: "✏️" },
    { id: "tests",    name: "Tests",    emoji: "📝" },
    { id: "games",    name: "Games",    emoji: "🎮" },
    { id: "rewards",  name: "Rewards",  emoji: "🎁" }
  ];
  var ALL = ["pk", "kg", "g1", "g2", "g3", "g4", "g5"];

  function A(id, title, icon, href, app, subject, section, grades, lang) {
    return { id: id, title: title, icon: icon, href: href, app: app, subject: subject,
             section: section, grades: grades, lang: lang || null };
  }
  var ITEMS = [
    /* ---- Science ---- */
    A("funfacts", "Fun Facts Explorer", "🔍", "funfacts/index.html", "funfacts", "science", "learn", ["kg", "g3"]),
    A("sci-testprep", "Science Test Prep", "🔬", "adventurepack/readingadventures/index.html#science", "readingadventures", "science", "tests", ["g3"]),
    A("sq-unit2-sci", "Unit 2 Test Prep", "🌪️", "adventurepack/stickerquest/index.html#unit2", "stickerquest", "science", "tests", ["g3"]),

    /* ---- Math ---- */
    A("kinder-math", "Little Learners: Numbers & Shapes", "🔢", "kinder/index.html", "kinder", "math", "practice", ["pk", "kg"]),
    A("speedway", "Learning Speedway", "🏎️", "speedway/index.html", "speedway", "math", "games", ["kg"]),
    A("homeschool-kg-math", "Homeschool Academy: Math", "🎓", "homeschool/index.html", "homeschool", "math", "learn", ["kg"]),
    A("homeschool-g3-math", "Homeschool Academy: Math", "🎓", "homeschool/index.html", "homeschool", "math", "learn", ["g3"]),
    A("multiply", "Times Table Takeoff", "✖️", "multiply/index.html", "multiply", "math", "practice", ["g3"]),
    A("grandprix-math", "Turbo Grand Prix", "🏁", "grandprix/index.html", "grandprix", "math", "games", ["g3"]),
    A("piratemath", "Pirate Math Quest", "🏴‍☠️", "adventurepack/piratemath/index.html#ch1", "piratemath", "math", "practice", ["g3"]),
    A("piratemath-exam", "Captain's Grand Review", "🏴‍☠️", "adventurepack/piratemath/index.html#ch2", "piratemath", "math", "tests", ["g3"]),
    A("subtraction", "Subtraction Notebook Quest", "📓", "adventurepack/subtraction/index.html", "subtraction", "math", "practice", ["g3"]),
    A("timesquest", "Times Table Quest", "🦉", "adventurepack/timesquest/index.html", "timesquest", "math", "tests", ["g3"]),
    A("stickerquest", "Sticker Quest", "🧩", "adventurepack/stickerquest/index.html", "stickerquest", "math", "practice", ["g3"]),

    /* ---- Social Studies ---- */
    A("sq-unit2-soc", "Unit 2 Test Prep", "🏛️", "adventurepack/stickerquest/index.html#unit2", "stickerquest", "social", "tests", ["g3"]),
    A("billofrights", "Why We Have the Bill of Rights", "📜", "adventurepack/billofrights/index.html", "billofrights", "social", "stories", ["g3"]),
    A("piratemath-communities", "Pirate Math: Communities Island", "🏝️", "adventurepack/piratemath/index.html#ch1", "piratemath", "social", "practice", ["g3"]),

    /* ---- Language: English ---- */
    A("kinder-letters", "Little Learners: Letters", "🔤", "kinder/index.html", "kinder", "language", "practice", ["pk", "kg"], "english"),
    A("speedway-letters", "Learning Speedway: Letters & Sounds", "🏎️", "speedway/index.html", "speedway", "language", "games", ["kg"], "english"),
    A("phonics", "Phonics Pals", "🦜", "phonics/index.html", "phonics", "language", "stories", ["kg"], "english"),
    A("tracewrite", "Write & Trace", "🖍️", "tracewrite/index.html", "tracewrite", "language", "learn", ["kg"], "english"),
    A("homeschool-kg-eng", "Homeschool Academy: English", "🎓", "homeschool/index.html", "homeschool", "language", "learn", ["kg"], "english"),
    A("homeschool-g3-eng", "Homeschool Academy: English", "🎓", "homeschool/index.html", "homeschool", "language", "learn", ["g3"], "english"),
    A("readingadventures", "Reading Adventures", "📖", "adventurepack/readingadventures/index.html", "readingadventures", "language", "stories", ["kg", "g3"], "english"),
    A("reading", "Reading Trail", "🦉", "reading/index.html", "reading", "language", "learn", ["g3"], "english"),
    A("readrocket", "Read-Aloud Rocket", "🚀", "readrocket/index.html", "readrocket", "language", "stories", ["g3"], "english"),
    A("detectives", "Reading Detectives", "🦝", "detectives/index.html", "detectives", "language", "stories", ["g3"], "english"),
    A("clueisland", "Clue Island", "🧭", "clueisland/index.html", "clueisland", "language", "stories", ["g3"], "english"),
    A("grammar", "Grammar Galaxy", "🪐", "grammar/index.html", "grammar", "language", "practice", ["g3"], "english"),
    A("treasure", "Grammar Treasure Hunt", "🗺️", "treasure/index.html", "treasure", "language", "games", ["g3"], "english"),
    A("writestudio", "Sentence Studio", "✏️", "writestudio/index.html", "writestudio", "language", "learn", ["g3"], "english"),
    A("grandprix-eng", "Turbo Grand Prix", "🏁", "grandprix/index.html", "grandprix", "language", "games", ["g3"], "english"),

    /* ---- Language: Arabic ---- */
    A("arabic-kg", "Arabic Oasis", "🐪", "arabic/index.html", "arabic", "language", "learn", ["pk", "kg"], "arabic"),
    A("arabic-g3", "Arabic Oasis", "🐪", "arabic/index.html", "arabic", "language", "learn", ["g3"], "arabic"),

    /* ---- Language: Tamil (Phase 5 adds the first app) ---- */

    /* ---- Fun Zone ---- */
    A("arcade", "Free Games Arcade", "🎮", "arcade/index.html", "arcade", "fun", "games", ALL),
    A("rewards", "Rewards Center", "🎁", "rewards/index.html", "rewards", "fun", "rewards", ALL)
  ];

  // Activities for a grade, optionally one subject (and one language).
  function forGrade(grade, subject, lang) {
    return ITEMS.filter(function (it) {
      return it.grades.indexOf(grade) >= 0 && (!subject || it.subject === subject) && (!lang || it.lang === lang);
    });
  }
  function subject(id) { for (var i = 0; i < SUBJECTS.length; i++) if (SUBJECTS[i].id === id) return SUBJECTS[i]; return null; }

  var Catalog = { SUBJECTS: SUBJECTS, SECTIONS: SECTIONS, ITEMS: ITEMS, forGrade: forGrade, subject: subject };
  root.Catalog = Catalog;
  if (typeof module !== "undefined" && module.exports) module.exports = Catalog;
})(typeof window !== "undefined" ? window : globalThis);
