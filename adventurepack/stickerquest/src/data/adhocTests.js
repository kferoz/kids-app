/* Ad-hoc Math Tests shown on the 5th tab. Each test is a recipe for src/engine/mathQuestions.js:
     id          stable id (results and the $1 challenge are saved under it)
     date        "YYYY-MM-DD" (the list groups by it, newest first)
     title       what the child sees
     difficulty  "easy" | "medium" | "hard" | "mixed"
     count       number of questions (default 10)
     types       optional list of question types (default: all)
     seed        optional: the same numbers every first try (a class test); "Try again" always uses new numbers
   Grown-ups can add more later; the page also reads extra tests from localStorage "hub_adhocTests"
   (hub_ keys are shared by every learner). Plain script so it loads from file:// and the APK. */
const ADHOC_TESTS = [
  { id: "ch5-check", date: "2026-11-11", title: "Chapter 5 Multiplication Check", difficulty: "mixed", count: 10 },
  { id: "ch5-area", date: "2026-11-11", title: "Area Models and Breaking Apart", difficulty: "medium", count: 6,
    types: ["area_model", "fill_blanks_decompose"] },
  { id: "ch5-warmup", date: "2026-11-10", title: "Times Table Warm-Up", difficulty: "easy", count: 8,
    types: ["single_multiply", "word_multiply", "true_false_equations", "choose_correct_ways"] },
  { id: "ch5-big", date: "2026-11-09", title: "Big Number Challenge", difficulty: "hard", count: 8 }
];
if (typeof module !== "undefined" && module.exports) module.exports = ADHOC_TESTS;
