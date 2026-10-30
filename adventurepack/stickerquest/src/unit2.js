/* Unit 2 Test Prep tab: the shared Quiz Kit (js/quizkit/quizkit.js) with Sticker Quest's own
   owl, pictures, stickers and save slot. Loads after index.html's own script and uses its globals
   ($, save, persist, earn), plus UNIT2_QUESTIONS, UNIT2_TOPICS and the art in unit2Art.js.
   Saved in stickerQuest_v1 as save.unit2: {readToMe, last:{mode:[ids]}, rounds:[…], ends}.
   Sticker ids stay "u2:<question id>" and "u2:end:<n>", Tracker names stay "unit2-<mode>". */
(() => {
  save.unit2 = save.unit2 || {};
  QuizKit.mount($("#unit2"), {
    id: "unit2", title: "Unit 2 Test Prep", skill: "Unit 2",
    topics: UNIT2_TOPICS, questions: UNIT2_QUESTIONS,
    mascot: {name: "Hoot", svg: U2_OWL, hello: "Hoo-hoo! I'm Hoot. Pick a card to start!"},
    endings: ["", "Good try! Every practice makes your brain stronger.",
      "Great work! You're getting so good at this!", "WOW! You're a Unit 2 superstar!"]
  }, {
    store: save.unit2, persist,
    art: u2Picture,
    questionArt: q => U2_PICTURE[q.id] || q.picture,
    earn, prefix: "u2", complete: "unit2",
    prize: () => save.stickers[save.stickers.length - 1]
  });
})();
