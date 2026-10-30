/* Unit 2 Test Prep logic now lives in the shared Quiz Kit (js/quizkit/logic.js, QuizLogic).
   U2Logic stays as a name for it so test/unit2-logic.js and older code keep working.
   The page loads ../../js/quizkit/logic.js first; Node requires it. */
const U2Logic = typeof QuizLogic !== "undefined" ? QuizLogic : require("../../../js/quizkit/logic.js");

if (typeof module !== "undefined" && module.exports) module.exports = U2Logic;
