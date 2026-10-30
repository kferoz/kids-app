/* QuizPacks — the list of Quiz Kit packs. Each file in quiz/packs/ calls QuizPacks.add(pack).
   Node tests load the pack files with this same registry (see test/phase4-quizkit.js). */
(function (root) {
  "use strict";
  var list = [];
  root.QuizPacks = {
    add: function (p) { list.push(p); return p; },
    all: function () { return list.slice(); },
    get: function (id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  };
})(typeof window !== "undefined" ? window : globalThis);
