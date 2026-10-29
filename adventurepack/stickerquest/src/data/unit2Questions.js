/* Unit 2 Study Guide question bank (Grade 3 social studies / science).
   Q1–Q8 are the study guide's practice questions with its answer key; the rest are extra
   practice on the same study facts so a quiz can mix different sets.

   Plain script, no modules: index.html runs from file:// (and the APK), where ES modules
   don't load. It defines one global, UNIT2_QUESTIONS, and also exports it for Node tests.

   Shapes by type:
     multiple_choice      options [{id,text}], correctAnswer "B"
     true_false_sentence  options True/False,  correctAnswer "T" | "F"
     choose_two           options [{id,text}], correctAnswers ["A","B"]
     matching             items [{id,text}] to match with options [{id,text}],
                          correctAnswers {itemId: optionId}
   audioText is what 🔊 reads. It has no option letters, so the page can shuffle choices. */
const UNIT2_QUESTIONS = (() => {
  const TF = [{id:"T", text:"True"}, {id:"F", text:"False"}];
  const opts = (...texts) => texts.map((text, i) => ({id: "ABCDE"[i], text}));
  // "Prompt. First choice? Or second choice? Or third choice?"
  const readOut = (prompt, options) => prompt + " " + options.map((o, i) => (i ? "Or, " : "") + o.text.replace(/[.?]$/, "") + "?").join(" ");

  const Q = [
    /* ---------- From the study guide (answer key) ---------- */
    {id:"sg1", topic:2, difficulty:"easy", type:"multiple_choice", picture:"🌳",
      prompt:"What is part of an ecosystem?",
      options:opts("Plants, animals, and people living in one place", "Only the weather", "Only endangered animals"),
      correctAnswer:"A",
      explanation:"An ecosystem is all the plants, animals, and people living in one place."},
    {id:"sg2", topic:3, difficulty:"medium", type:"choose_two", picture:"💧",
      prompt:"How do hydroelectric dams help people? Choose TWO.",
      options:opts("Make electricity", "Provide dependable fresh water", "Prevent all pollution"),
      correctAnswers:["A","B"],
      explanation:"Dams use moving water to make electricity. They also store fresh water that people can count on."},
    {id:"sg3", topic:4, difficulty:"easy", type:"multiple_choice", picture:"🛶",
      prompt:"How did Native Americans adapt to their environment?",
      options:opts("They used water for travel, trade, and food", "They used solar panels", "They stopped using natural resources"),
      correctAnswer:"A",
      explanation:"They used the water nearby to travel, to trade, and to catch fish and shellfish."},
    {id:"sg4", topic:5, difficulty:"easy", type:"multiple_choice", picture:"🏛️",
      prompt:"What do governments do during natural disasters?",
      options:opts("Make every disaster disappear", "Provide aid to communities", "Stop all storms"),
      correctAnswer:"B",
      explanation:"Governments can't stop storms, but they help. They rescue people, open shelters, and give aid."},
    {id:"sg5", topic:6, difficulty:"medium", type:"matching", picture:"⚡",
      prompt:"Match each energy source to what it does.",
      items:[
        {id:"fossil", text:"Fossil Fuels"},
        {id:"nuclear", text:"Nuclear Plants"},
        {id:"solar", text:"Solar Panels"},
        {id:"wind", text:"Wind Farms"},
      ],
      options:opts("Oil, coal, and natural gas",
        "Produce radioactive waste and a large amount of electricity",
        "Turn energy from the sun into electric power",
        "Use turbines to provide renewable electricity"),
      correctAnswers:{fossil:"A", nuclear:"B", solar:"C", wind:"D"},
      explanation:"Fossil fuels are oil, coal, and gas. Nuclear plants make lots of power and waste, solar uses the sun, and wind farms use turbines.",
      audioText:"Match each energy source to what it does. Fossil fuels. Nuclear plants. Solar panels. Wind farms."},
    {id:"sg6", topic:2, difficulty:"easy", type:"multiple_choice", picture:"♻️",
      prompt:"How can people reduce pollution from littering?",
      options:opts("Drive less", "Use public garbage and recycling bins", "Build more roads"),
      correctAnswer:"B",
      explanation:"Littering means trash on the ground. Putting trash in garbage and recycling bins keeps it off the ground."},
    {id:"sg7", topic:2, difficulty:"medium", type:"multiple_choice", picture:"🐺",
      prompt:"Which sentence shows that clearing land can endanger animals?",
      options:opts("Erosion wears away soil.", "The mammoth is extinct.", "Gray wolves and red wolves are endangered because of habitat loss."),
      correctAnswer:"C",
      explanation:"When land is cleared, wolves lose their homes. That habitat loss puts them in danger."},
    {id:"sg8", topic:1, difficulty:"medium", type:"choose_two", picture:"🌪️",
      prompt:"Which TWO events are natural disasters?",
      options:opts("Flooding", "A bridge collapsing", "Deforestation (clearing of trees from land)", "Littering", "Tornadoes"),
      correctAnswers:["A","E"],
      explanation:"Floods and tornadoes come from nature. People cause the other three."},

    /* ---------- Extra practice on the same facts ---------- */
    {id:"x1", topic:1, difficulty:"easy", type:"multiple_choice", picture:"🌎",
      prompt:"Which one is a natural disaster?",
      options:opts("An earthquake", "A birthday party", "A school bus"),
      correctAnswer:"A",
      explanation:"An earthquake is a sudden shaking of the ground. Nature causes it."},
    {id:"x2", topic:1, difficulty:"medium", type:"matching", picture:"🌊",
      prompt:"Match each natural disaster to what it is.",
      items:[
        {id:"flood", text:"Flood"},
        {id:"wildfire", text:"Wildfire"},
        {id:"hurricane", text:"Hurricane"},
        {id:"earthquake", text:"Earthquake"},
      ],
      options:opts("Sudden shaking of the ground",
        "Too much water covers land",
        "A strong storm with heavy rain and wind",
        "A fire that burns land and forests"),
      correctAnswers:{flood:"B", wildfire:"D", hurricane:"C", earthquake:"A"},
      explanation:"Floods are water, wildfires are fire, and hurricanes are big storms. Earthquakes shake the ground.",
      audioText:"Match each natural disaster to what it is. Flood. Wildfire. Hurricane. Earthquake."},
    {id:"x3", topic:1, difficulty:"medium", type:"multiple_choice", picture:"🌀",
      prompt:"Which one is a strong storm with heavy rain and wind?",
      options:opts("A wildfire", "A hurricane", "An earthquake"),
      correctAnswer:"B",
      explanation:"A hurricane is a strong storm. It brings heavy rain and wind."},
    {id:"x4", topic:1, difficulty:"easy", type:"true_false_sentence", picture:"🔥",
      prompt:"A wildfire is a fire that burns land and forests.",
      options:TF, correctAnswer:"T",
      explanation:"True! Wildfires burn land and forests."},
    {id:"x5", topic:2, difficulty:"easy", type:"multiple_choice", picture:"🦣",
      prompt:"Which animal is extinct?",
      options:opts("The gray wolf", "The mammoth", "The red wolf"),
      correctAnswer:"B",
      explanation:"Extinct means no longer exists. There are no mammoths left, but there are still gray wolves and red wolves."},
    {id:"x6", topic:2, difficulty:"medium", type:"multiple_choice", picture:"⚠️",
      prompt:"What does endangered mean?",
      options:opts("No longer exists", "At risk of becoming extinct", "Lives in the water"),
      correctAnswer:"B",
      explanation:"Endangered animals are at risk. If we don't help them, they could become extinct."},
    {id:"x7", topic:2, difficulty:"easy", type:"true_false_sentence", picture:"🦴",
      prompt:"Extinct means an animal no longer exists.",
      options:TF, correctAnswer:"T",
      explanation:"True! When an animal is extinct, there are none left anywhere."},
    {id:"x8", topic:2, difficulty:"medium", type:"true_false_sentence", picture:"🚜",
      prompt:"Clearing land for buildings and farms can destroy animal habitats.",
      options:TF, correctAnswer:"T",
      explanation:"True! When land is cleared, animals lose their homes, and that is called habitat loss."},
    {id:"x9", topic:2, difficulty:"medium", type:"multiple_choice", picture:"🤔",
      prompt:"What are unintended consequences?",
      options:opts("Changes people planned on purpose", "Changes people did not mean to cause", "Changes that only happen in winter"),
      correctAnswer:"B",
      explanation:"Unintended means not meant. They are changes people did not mean to cause."},
    {id:"x10", topic:4, difficulty:"medium", type:"multiple_choice", picture:"🔧",
      prompt:"What does adapt mean?",
      options:opts("Use or change things to meet your needs", "Move far away from water", "Stop using natural resources"),
      correctAnswer:"A",
      explanation:"To adapt is to use or change things so they meet your needs."},
    {id:"x11", topic:4, difficulty:"medium", type:"choose_two", picture:"🐟",
      prompt:"How did Native Americans use the water nearby for food? Choose TWO.",
      options:opts("They ate fish and shellfish", "They preserved fish to eat in winter", "They used wind farms", "They stopped fishing"),
      correctAnswers:["A","B"],
      explanation:"They caught fish and shellfish to eat. They also saved fish so they had food in winter."},
    {id:"x12", topic:5, difficulty:"medium", type:"choose_two", picture:"⛺",
      prompt:"How do governments help when a disaster happens? Choose TWO.",
      options:opts("They open shelters", "They stop all storms", "They give money to help communities recover", "They make earthquakes disappear"),
      correctAnswers:["A","C"],
      explanation:"Governments open shelters where people can stay safe. They give money so towns can fix things."},
    {id:"x13", topic:6, difficulty:"medium", type:"choose_two", picture:"🛢️",
      prompt:"Which TWO are fossil fuels?",
      options:opts("Coal", "Sunlight", "Natural gas", "Wind"),
      correctAnswers:["A","C"],
      explanation:"Coal and natural gas are fossil fuels, and so is oil. Sunlight and wind are not."},
    {id:"x14", topic:6, difficulty:"easy", type:"multiple_choice", picture:"☀️",
      prompt:"Which one uses the sun to make electricity?",
      options:opts("Solar panels", "Wind farms", "Coal"),
      correctAnswer:"A",
      explanation:"Solar panels catch sunlight and turn it into electricity."},
    {id:"x15", topic:6, difficulty:"medium", type:"true_false_sentence", picture:"🌬️",
      prompt:"Solar panels use the wind to make electricity.",
      options:TF, correctAnswer:"F",
      explanation:"False! Solar panels use the sun, and wind farms use the wind."},
  ];

  Q.forEach(q => {
    if (q.audioText) return;
    q.audioText = q.type === "true_false_sentence"
      ? "True or false? " + q.prompt
      : readOut(q.prompt, q.options);
  });
  return Q;
})();

if (typeof module !== "undefined" && module.exports) module.exports = UNIT2_QUESTIONS;
