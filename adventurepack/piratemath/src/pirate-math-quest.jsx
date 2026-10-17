import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { Star, Trophy, Gem, Sparkles, RotateCcw, Anchor, Compass, Map, Plus, ArrowLeft, Ship, Microscope, Globe2, Volume2, VolumeX } from "lucide-react";

const STICKER_POOL = ["💎", "🦜", "🐚", "🧭", "⚓", "🌟", "🏆", "🗺️", "🥇", "🔱"];

const CHEERS = [
  "Shiver me timbers, correct!",
  "X marks the spot!",
  "You found the treasure!",
  "Sharp eyes, matey!",
  "Aye, that's the one!",
  "Solid gold answer!",
];

const TRY_AGAIN = [
  "Not quite — but here's the real map.",
  "Close! The treasure was hiding here.",
  "Good guess — the true spot was this one.",
  "Almost, sailor! Here's the right answer.",
];

const TOTAL_QUESTIONS = 10;
const TOTAL_BY_GAME = { rounding: 10, addition: 10, mental: 10, science: 15, social: 18 };

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function roundToTen(n) {
  return Math.round(n / 10) * 10;
}
function roundToHundred(n) {
  return Math.round(n / 100) * 100;
}

function makeOptions(correct, step, count, minVal = 0) {
  const set = new Set([correct]);
  const spread = [-3, -2, -1, 1, 2, 3, -4, 4, -5, 5];
  let i = 0;
  while (set.size < count && i < spread.length) {
    const candidate = correct + spread[i] * step;
    if (candidate >= minVal) set.add(candidate);
    i++;
  }
  while (set.size < count) {
    set.add(correct + randInt(1, 9) * step);
  }
  return shuffle([...set]);
}

// ---------- Rounding question generator ----------
function generateRoundingQuestion(level) {
  const typeRoll = Math.random();
  let unit;
  let number;

  if (level === 1) {
    unit = "ten";
    number = randInt(11, 98);
  } else if (level === 2) {
    unit = Math.random() < 0.5 ? "ten" : "hundred";
    number = randInt(101, 989);
  } else {
    unit = Math.random() < 0.5 ? "ten" : "hundred";
    number = randInt(1001, 9899);
  }

  const isReverse = level >= 2 && typeRoll < 0.28;
  const step = unit === "ten" ? 10 : 100;
  const correct = unit === "ten" ? roundToTen(number) : roundToHundred(number);

  if (!isReverse) {
    return {
      game: "rounding",
      kind: "round",
      unit,
      number,
      correct,
      options: makeOptions(correct, step, 4, 0),
    };
  }

  const target = correct;
  const half = step / 2;
  let candidateNum;
  do {
    const offset = randInt(-(half - 1), half - 1);
    candidateNum = target + offset;
  } while (candidateNum < 1 || (unit === "ten" ? roundToTen(candidateNum) : roundToHundred(candidateNum)) !== target);

  const distractors = new Set();
  const tries = [target - step, target + step, target - step * 2, target + step * 2];
  for (const t of tries) {
    if (distractors.size >= 3) break;
    if (t <= 0) continue;
    const off = randInt(-(half - 1), half - 1);
    let d = t + off;
    if (d < 1) d = 1;
    if ((unit === "ten" ? roundToTen(d) : roundToHundred(d)) !== target) {
      distractors.add(d);
    }
  }
  while (distractors.size < 3) {
    const off = randInt(step, step * 3);
    const d = target + (Math.random() < 0.5 ? off : -off);
    if (d > 0 && (unit === "ten" ? roundToTen(d) : roundToHundred(d)) !== target) {
      distractors.add(d);
    }
  }

  return {
    game: "rounding",
    kind: "reverse",
    unit,
    target,
    correct: candidateNum,
    options: shuffle([candidateNum, ...[...distractors].slice(0, 3)]),
  };
}

// ---------- Addition Patterns question generator ----------
function generateAdditionQuestion(level) {
  const roll = Math.random();

  if (level === 1) {
    // pairs, leaning toward "friendly number" combos like the worksheet (making 10 / making 5)
    const a = randInt(3, 9);
    const b = randInt(3, 9);
    const correct = a + b;
    return {
      game: "addition",
      kind: "sum2",
      a,
      b,
      correct,
      options: makeOptions(correct, 1, 4, 1),
    };
  }

  if (level === 2) {
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    const c = randInt(2, 9);
    const correct = a + b + c;
    return {
      game: "addition",
      kind: "sum3",
      a,
      b,
      c,
      correct,
      options: makeOptions(correct, 1, 4, 3),
    };
  }

  // level 3: missing addend, e.g. 3 + ? = 9
  const total = randInt(10, 18);
  const known = randInt(2, total - 2);
  const correct = total - known;
  return {
    game: "addition",
    kind: "missing",
    known,
    total,
    correct,
    options: makeOptions(correct, 1, 4, 1),
  };
}

// ---------- Mental Addition (number bonds, 2-digit + 2-digit, no regrouping) generator ----------
function generateMentalAdditionQuestion(level) {
  const tensRanges = { 1: [1, 3], 2: [1, 5], 3: [2, 7] };
  const [tLo, tHi] = tensRanges[level];

  // Keep tens-digit sum and ones-digit sum each under 10, matching the worksheet's
  // "split into tens and ones, then add" method (no carrying/regrouping).
  const aTensDigit = randInt(tLo, tHi);
  const maxBTens = Math.min(tHi, 9 - aTensDigit);
  const minBTens = Math.min(tLo, maxBTens);
  const bTensDigit = randInt(minBTens, maxBTens);

  const aOnes = randInt(0, 9);
  const bOnes = randInt(0, 9 - aOnes);

  const aTens = aTensDigit * 10;
  const bTens = bTensDigit * 10;
  const a = aTens + aOnes;
  const b = bTens + bOnes;
  const correct = a + b;

  return {
    game: "mental",
    kind: "twoDigit",
    a,
    b,
    aTens,
    aOnes,
    bTens,
    bOnes,
    correct,
    options: makeOptions(correct, 1, 4, 10),
  };
}

// ---------- Science Discovery Reef (Unit 1 Study Guide: engineering design) ----------
const SCIENCE_BANK = [
  {
    context: "A heavy bench is glued to the ground in a park. Sam's plan: move the bench under a tree. Jordan's plan: set up a patio umbrella next to the bench.",
    prompt: "Which plan actually solves the shade problem, and why?",
    options: [
      "Sam's plan, because the bench is easy to move",
      "Jordan's plan, because the umbrella is light",
      "Sam's plan, because trees give better shade",
      "Jordan's plan, because the bench is glued to the ground",
    ],
    correct: "Jordan's plan, because the bench is glued to the ground",
  },
  {
    context: "Mia wants to keep her desk from sliding on a smooth tile floor without scratching the floor.",
    prompt: "Which material is best for the pads under the desk legs?",
    options: ["A napkin", "Soft fabric pads", "A piece of string", "A large brick"],
    correct: "Soft fabric pads",
  },
  {
    context: "Noah needs to design a fence to keep his dog from running out of the yard.",
    prompt: "What is his criterion — the goal the design must meet?",
    options: [
      "The yard must have green grass",
      "The dog must not run out of the yard",
      "The fence must be painted red",
      "The dog must stay quiet",
    ],
    correct: "The dog must not run out of the yard",
  },
  {
    context: "Ben's thin backpack straps hurt his shoulders, so he plans to add padded covers.",
    prompt: "Why does Ben want to change the backpack?",
    options: [
      "It will earn him a lot of money",
      "It will help him meet his needs",
      "It will make him famous at school",
      "It will meet the demands of everyone in society",
    ],
    correct: "It will help him meet his needs",
  },
  {
    context: "Maya tested how much weight 4 strings could hold: A = 15 lb, B = 40 lb, C = 10 lb, D = 20 lb. She needs the strongest string for a heavy bird feeder.",
    prompt: "Which string should Maya use?",
    options: [
      "String C, because it held 10 pounds",
      "String B, because it held the most weight",
      "String A, because it is made of cotton",
      "String D, because it held less weight than String B",
    ],
    correct: "String B, because it held the most weight",
  },
  {
    context: "Emma is starting a small garden and can choose from a watering can, a trowel, gloves, or a rake.",
    prompt: "Which pair of tools would help her take care of the plants the most?",
    options: [
      "A watering can and a trowel",
      "Gloves and a rake",
      "A trowel and a rake",
      "Gloves and a watering can",
    ],
    correct: "A watering can and a trowel",
  },
  {
    context: "Elena's flashlight stopped working and she needs to fix it.",
    prompt: "What should Elena do FIRST?",
    options: ["Ask her dad for ideas", "Replace the batteries", "Find out why it isn't working", "Try a new idea"],
    correct: "Find out why it isn't working",
  },
  {
    context: "Elena already found out why the flashlight isn't working and asked her dad for ideas.",
    prompt: "What should she try next?",
    options: [
      "Test the flashlight",
      "Replace the old batteries with new ones",
      "Try a completely new idea",
      "Find out why it isn't working",
    ],
    correct: "Replace the old batteries with new ones",
  },
  {
    context: "Elena replaced the batteries and tested the flashlight, but it still doesn't turn on.",
    prompt: "What should Elena do LAST?",
    options: ["Give up", "Try a new idea", "Ask her dad again", "Replace the batteries again"],
    correct: "Try a new idea",
  },
  {
    prompt: "Which renewable energy technology provides electricity from sunlight without producing pollution?",
    options: ["Solar panels", "Hydroelectric dam", "Wind turbines", "A battery"],
    correct: "Solar panels",
  },
  {
    prompt: "Which technology generates electricity from moving water in rivers and streams?",
    options: ["Solar panels", "Hydroelectric dam", "Wind turbines", "A gas generator"],
    correct: "Hydroelectric dam",
  },
  {
    prompt: "Which technology produces electricity from wind using large turbines?",
    options: ["Solar panels", "Hydroelectric dam", "Wind turbines", "A coal plant"],
    correct: "Wind turbines",
  },
  {
    context: "A community wants to collect rainwater for a SMALL garden. System 1 is a small barrel attached to a house gutter. System 2 is a large tank under a big roof structure.",
    prompt: "Which system would be better for a small garden?",
    options: [
      "System 1, because it is smaller and fits the space",
      "System 2, because it holds much more water",
      "System 1, because it needs a big support structure",
      "System 2, because it is easier to build",
    ],
    correct: "System 1, because it is smaller and fits the space",
  },
  {
    context: "A river community upgraded their flood warning siren system so more people could hear it.",
    prompt: "What was the most important criterion for the new warning system?",
    options: [
      "It must be quiet",
      "It must be loud enough for more people to hear",
      "It must be painted a bright color",
      "It must run on solar power",
    ],
    correct: "It must be loud enough for more people to hear",
  },
  {
    context: "The old warning system had one small horn speaker. The new one has many speakers clustered together.",
    prompt: "What improvement was made to the new warning system?",
    options: [
      "They added more sirens and made it louder",
      "They removed the siren completely",
      "They made the siren smaller",
      "They painted the siren red",
    ],
    correct: "They added more sirens and made it louder",
  },
  {
    prompt: "What is the benefit of the new, louder flood warning system?",
    options: [
      "More people can hear it and stay safe during a flood",
      "It uses less electricity",
      "It looks nicer in the town",
      "It costs less money",
    ],
    correct: "More people can hear it and stay safe during a flood",
  },
  {
    context: "A step stool wobbles on an uneven floor. Priya's plan: glue rubber pads under each leg. Diego's plan: saw one leg shorter.",
    prompt: "Which plan is safer to try first, since it can be undone if it doesn't work?",
    options: [
      "Diego's plan, because cutting is permanent",
      "Priya's plan, because rubber pads can be removed and adjusted",
      "Diego's plan, because sawing is faster",
      "Priya's plan, because rubber is expensive",
    ],
    correct: "Priya's plan, because rubber pads can be removed and adjusted",
  },
  {
    context: "Jamal wants to keep his ice cream cold on the walk home without freezing his hands.",
    prompt: "Which material would work best for a cooler sleeve?",
    options: ["A thin paper napkin", "A foam insulated sleeve", "A metal can", "Clear plastic wrap"],
    correct: "A foam insulated sleeve",
  },
  {
    context: "A city needs a crosswalk sign that drivers can still see even in thick fog.",
    prompt: "What is the criterion for the new sign?",
    options: [
      "The sign must be inexpensive",
      "The sign must be visible in fog",
      "The sign must be shaped like a triangle",
      "The sign must be quiet",
    ],
    correct: "The sign must be visible in fog",
  },
  {
    context: "Anna redesigns her bike helmet to add extra padding after noticing it slips during rides.",
    prompt: "Why does Anna want to redesign the helmet?",
    options: [
      "To make it look cooler",
      "To meet her safety need for a helmet that stays in place",
      "To make more money selling helmets",
      "To match her friend's helmet",
    ],
    correct: "To meet her safety need for a helmet that stays in place",
  },
  {
    context: "Four kite strings were tested for strength: String W held 5 lb, X held 12 lb, Y held 8 lb, Z held 3 lb. Leo needs the string least likely to snap in strong wind.",
    prompt: "Which string should Leo choose?",
    options: [
      "String Z, because it is thinnest",
      "String X, because it held the most weight",
      "String W, because it is average",
      "String Y, because it held 8 pounds",
    ],
    correct: "String X, because it held the most weight",
  },
  {
    context: "Carlos is building a birdhouse and can choose from: a hammer, nails, a paintbrush, and sandpaper.",
    prompt: "Which two tools would he need FIRST to put the birdhouse pieces together?",
    options: ["A hammer and nails", "A paintbrush and sandpaper", "Sandpaper and nails", "A hammer and paintbrush"],
    correct: "A hammer and nails",
  },
  {
    context: "A robot vacuum keeps getting stuck under the couch.",
    prompt: "What should the engineer do FIRST to solve the problem?",
    options: [
      "Buy a new couch",
      "Figure out why the vacuum keeps getting stuck",
      "Paint the vacuum a new color",
      "Throw away the vacuum",
    ],
    correct: "Figure out why the vacuum keeps getting stuck",
  },
  {
    context: "After finding out the vacuum's sensor isn't working, the engineer asks a coworker for ideas.",
    prompt: "What should happen next?",
    options: [
      "Try a brand new idea right away",
      "Build and test a possible fix",
      "Give up on the vacuum",
      "Sell the vacuum",
    ],
    correct: "Build and test a possible fix",
  },
  {
    context: "The engineer tests the repaired vacuum and it still gets stuck under the couch.",
    prompt: "What should the engineer do LAST if the first fix doesn't work?",
    options: ["Stop testing forever", "Try a new idea and test it again", "Ignore the problem", "Ask no one for help"],
    correct: "Try a new idea and test it again",
  },
  {
    context: "A farm wants electricity without burning fuel and without a river nearby.",
    prompt: "Which renewable technology would work best for this farm?",
    options: ["Solar panels", "Hydroelectric dam", "A gas generator", "A coal plant"],
    correct: "Solar panels",
  },
  {
    context: "A town near a fast-moving river wants to generate power using the river's flow.",
    prompt: "Which technology should they use?",
    options: ["Solar panels", "Hydroelectric dam", "Wind turbines", "A battery"],
    correct: "Hydroelectric dam",
  },
  {
    context: "A coastal town with strong, steady winds wants clean electricity.",
    prompt: "Which technology is the best match?",
    options: ["Solar panels", "Hydroelectric dam", "Wind turbines", "A candle"],
    correct: "Wind turbines",
  },
  {
    prompt: "What do solar panels, wind turbines, and hydroelectric dams have in common?",
    options: [
      "They all burn fuel",
      "They all produce renewable, clean electricity",
      "They are all found underground",
      "They all need batteries to work",
    ],
    correct: "They all produce renewable, clean electricity",
  },
  {
    context: "Two water bottle designs: Design 1 is a simple bottle with a screw cap. Design 2 has a built-in straw and flip lid for one-handed drinking while biking.",
    prompt: "Which design is better for someone who bikes and needs to drink without stopping?",
    options: [
      "Design 1, because the cap is smaller",
      "Design 2, because it allows one-handed drinking while moving",
      "Design 1, because it is easier to clean",
      "Design 2, because it looks nicer",
    ],
    correct: "Design 2, because it allows one-handed drinking while moving",
  },
  {
    context: "A school upgraded its old paper hall passes to a digital sign-out system so office staff can find students faster.",
    prompt: "What was the most important criterion for the new system?",
    options: [
      "It must look colorful",
      "It must help staff find students quickly",
      "It must cost the least money",
      "It must be made of paper",
    ],
    correct: "It must help staff find students quickly",
  },
  {
    context: "The new digital sign-out system lets teachers see a student's location instantly instead of searching paper logs.",
    prompt: "What improvement was made with the new system?",
    options: [
      "It removed the need for any records",
      "It made finding a student's location instant instead of searching paper",
      "It made the hall passes bigger",
      "It added more paper forms",
    ],
    correct: "It made finding a student's location instant instead of searching paper",
  },
  {
    prompt: "What is a benefit of the new digital hall pass system?",
    options: [
      "Staff can find students faster in an emergency",
      "It uses more paper",
      "It takes longer to check students out",
      "It costs more time to search",
    ],
    correct: "Staff can find students faster in an emergency",
  },
  {
    context: "Sofia wants to design a lunch box that keeps her sandwich from getting squished by other items.",
    prompt: "What is Sofia's criterion for the lunch box design?",
    options: [
      "The lunch box must be pink",
      "The sandwich must not get squished",
      "The lunch box must be the cheapest one available",
      "The lunch box must hold a drink",
    ],
    correct: "The sandwich must not get squished",
  },
  {
    context: "Sofia's lunch box can only be as big as the front pocket of her backpack.",
    prompt: "This size limit is an example of a...",
    options: ["Criterion", "Constraint", "Material", "Test"],
    correct: "Constraint",
  },
  {
    prompt: "In engineering, what is the difference between a criterion and a constraint?",
    options: [
      "A criterion is a goal the design must achieve; a constraint is a limit on the design",
      "A criterion is a limit on the design; a constraint is a goal",
      "They mean exactly the same thing",
      "A criterion is a tool; a constraint is a material",
    ],
    correct: "A criterion is a goal the design must achieve; a constraint is a limit on the design",
  },
  {
    context: "Two paper airplane designs were tested for distance. Plane A flew 8 feet. Plane B flew 15 feet.",
    prompt: "If the goal is to fly the farthest, which plane design is better?",
    options: [
      "Plane A, because it is smaller",
      "Plane B, because it flew farther",
      "Plane A, because it flew 8 feet",
      "Plane B, because it is heavier",
    ],
    correct: "Plane B, because it flew farther",
  },
  {
    context: "A team is designing a raincoat. Testing shows Fabric 1 lets water through, and Fabric 2 keeps the tester completely dry.",
    prompt: "Which fabric should the team choose for the raincoat?",
    options: [
      "Fabric 1, because it feels softer",
      "Fabric 2, because it keeps the wearer dry",
      "Fabric 1, because it lets water through",
      "Fabric 2, because it is more colorful",
    ],
    correct: "Fabric 2, because it keeps the wearer dry",
  },
  {
    context: "An engineer builds a bridge model and tests how much weight it can hold before it bends.",
    prompt: "Why is testing an important step in the design process?",
    options: [
      "It tells the engineer if the design meets the criteria before it's used in real life",
      "It makes the design look better",
      "It is the very last step and is never repeated",
      "Testing is not necessary if the design looks good",
    ],
    correct: "It tells the engineer if the design meets the criteria before it's used in real life",
  },
  {
    context: "After a bridge model test fails, the engineer changes the materials and tries again.",
    prompt: "What is this step in the design process called?",
    options: ["Planning", "Redesigning and improving", "Selling", "Forgetting"],
    correct: "Redesigning and improving",
  },
  {
    context: "A doghouse design keeps rain from getting inside, but the door is too small for the dog to fit through.",
    prompt: "What should the designer do next?",
    options: [
      "Ignore the small door problem",
      "Redesign the door to be bigger while still keeping out rain",
      "Stop building doghouses",
      "Make the whole house smaller",
    ],
    correct: "Redesign the door to be bigger while still keeping out rain",
  },
  {
    context: "A community wants to reduce plastic waste. Option A: reusable cloth bags. Option B: single-use plastic bags.",
    prompt: "Which option better meets a goal of reducing waste?",
    options: [
      "Option B, because plastic is cheaper",
      "Option A, because reusable bags can be used many times",
      "Option B, because it is disposable",
      "Option A, because it is heavier",
    ],
    correct: "Option A, because reusable bags can be used many times",
  },
  {
    context: "A wheelchair ramp is being designed for a library entrance with only 2 feet of space before the door.",
    prompt: "The 2-foot space limit is an example of a...",
    options: ["Criterion", "Constraint", "Test", "Redesign"],
    correct: "Constraint",
  },
  {
    prompt: "Which of these is an example of a criterion — a goal the design must meet?",
    options: [
      "The bridge can use no more than 10 popsicle sticks",
      "The bridge must hold at least 2 pounds without breaking",
      "The bridge must be built in one day",
      "The bridge must cost less than $5",
    ],
    correct: "The bridge must hold at least 2 pounds without breaking",
  },
  {
    prompt: "Which of these is an example of a constraint — a limit on the design?",
    options: [
      "The birdhouse must keep out rain",
      "The birdhouse must attract birds",
      "The birdhouse can use no more than 5 pieces of wood",
      "The birdhouse must have a perch",
    ],
    correct: "The birdhouse can use no more than 5 pieces of wood",
  },
  {
    context: "An egg drop project needs a container that protects the egg AND weighs less than 200 grams. Container A weighs 150g and protects the egg. Container B weighs 250g and also protects the egg.",
    prompt: "Which container meets BOTH the criterion and the constraint?",
    options: [
      "Container B, because it is bigger",
      "Container A, because it protects the egg and meets the weight limit",
      "Container B, because it protects the egg",
      "Container A, because it is colorful",
    ],
    correct: "Container A, because it protects the egg and meets the weight limit",
  },
];

function prepareScienceQuestion(item) {
  return {
    game: "science",
    kind: "mc",
    context: item.context || null,
    prompt: item.prompt,
    correct: item.correct,
    options: shuffle(item.options),
  };
}

// ---------- Communities Cove (Unit 1 Study Guide: rural/urban/suburban, maps, climate) ----------
const SOCIAL_BANK = [
  // --- Community types: rural / urban / suburban ---
  { prompt: "A small town with farms, fields, and few buildings is called a ___ community.", options: ["Urban", "Rural", "Suburban"], correct: "Rural" },
  { prompt: "A city with skyscrapers, busy streets, and many people is called a ___ community.", options: ["Suburban", "Rural", "Urban"], correct: "Urban" },
  { prompt: "A neighborhood with houses, schools, and stores near a city is called a ___ community.", options: ["Rural", "Urban", "Suburban"], correct: "Suburban" },
  { prompt: "Which type of community has the most people packed into a small area, with tall buildings?", options: ["Rural", "Urban", "Suburban"], correct: "Urban" },
  { prompt: "Which type of community has farms and fields, with plenty of open land?", options: ["Urban", "Suburban", "Rural"], correct: "Rural" },
  { prompt: "Which type of community sits between a city and the countryside, with houses and local schools?", options: ["Rural", "Suburban", "Urban"], correct: "Suburban" },
  { prompt: "Where would you expect to find the most skyscrapers?", options: ["A rural community", "An urban community", "A suburban community"], correct: "An urban community" },
  { prompt: "Where would you expect to find the fewest buildings and the most farmland?", options: ["An urban community", "A suburban community", "A rural community"], correct: "A rural community" },

  // --- Map types ---
  { prompt: "Which type of map shows the elevation (how high or low the land is) of a community?", options: ["A climate map", "A political map", "A physical map", "A vegetation map"], correct: "A physical map" },
  { prompt: "Which type of map would you use to see how and where plants grow in a region?", options: ["A physical map", "A climate map", "A political map", "A vegetation map"], correct: "A vegetation map" },
  { prompt: "Which type of map shows the borders between states or countries?", options: ["A physical map", "A vegetation map", "A political map", "A climate map"], correct: "A political map" },
  { prompt: "Which type of map shows weather patterns, like temperature and rainfall, across a region?", options: ["A political map", "A vegetation map", "A climate map", "A physical map"], correct: "A climate map" },
  { prompt: "If you wanted to know whether a community is mostly mountains or flat land, which map would you check?", options: ["A political map", "A physical map", "A climate map", "A vegetation map"], correct: "A physical map" },
  { prompt: "If you wanted to know which crops or forests grow in an area, which map would you check?", options: ["A vegetation map", "A political map", "A physical map", "A climate map"], correct: "A vegetation map" },
  { prompt: "If you wanted to see where one state ends and another begins, which map would you check?", options: ["A climate map", "A vegetation map", "A physical map", "A political map"], correct: "A political map" },
  { prompt: "If you wanted to know how much rain a region usually gets each year, which map would you check?", options: ["A physical map", "A climate map", "A political map", "A vegetation map"], correct: "A climate map" },

  // --- Growth of communities (sequence) ---
  { prompt: "What happened FIRST as communities began to form?", options: ["Cities developed", "People began growing food", "Populations increased", "Communities were built"], correct: "People began growing food" },
  { prompt: "After people began growing food, what happened next?", options: ["Cities developed", "Communities were built", "Populations increased", "People began growing food"], correct: "Communities were built" },
  { prompt: "What happened right after communities were built?", options: ["People began growing food", "Cities developed", "Populations increased", "Communities were built"], correct: "Populations increased" },
  { prompt: "What was the LAST step as small communities grew?", options: ["People began growing food", "Communities were built", "Populations increased", "Cities developed"], correct: "Cities developed" },
  { prompt: "Which step came right before populations increased?", options: ["Cities developed", "Communities were built", "People began growing food", "None of these"], correct: "Communities were built" },
  { prompt: "Which step came after communities were built but before cities developed?", options: ["People began growing food", "Cities developed", "Populations increased", "Communities were built"], correct: "Populations increased" },

  // --- Vocabulary ---
  { prompt: "Which word means the weather conditions of a place over a long period of time?", options: ["Community", "Climate", "Region", "Population"], correct: "Climate" },
  { prompt: "Which word means a place where people live, work, and play?", options: ["Climate", "Region", "Community", "Population"], correct: "Community" },
  { prompt: "Which word means an area of land with particular features?", options: ["Population", "Community", "Climate", "Region"], correct: "Region" },
  { prompt: "Which word means the number of people who live in one place?", options: ["Region", "Climate", "Population", "Community"], correct: "Population" },
  { prompt: "What does \"climate\" mean?", options: ["A place where people live, work, and play", "The weather conditions of a place over a long period of time", "The number of people who live in one place", "An area of land with particular features"], correct: "The weather conditions of a place over a long period of time" },
  { prompt: "What does \"population\" mean?", options: ["An area of land with particular features", "The weather conditions of a place over a long period of time", "The number of people who live in one place", "A place where people live, work, and play"], correct: "The number of people who live in one place" },
  { prompt: "What does \"region\" mean?", options: ["A place where people live, work, and play", "The number of people who live in one place", "An area of land with particular features", "The weather conditions of a place over a long period of time"], correct: "An area of land with particular features" },
  { prompt: "What does \"community\" mean?", options: ["An area of land with particular features", "A place where people live, work, and play", "The weather conditions of a place over a long period of time", "The number of people who live in one place"], correct: "A place where people live, work, and play" },

  // --- Climate & regions ---
  {
    context: "Read: the Southwest region gets hot, humid summers.",
    prompt: "Why is a humid summer beneficial to the Southwest?",
    options: [
      "It can lead to tornadoes and hurricanes.",
      "It improves farming and agriculture throughout the region.",
      "It makes the air feel hotter than the actual temperature.",
      "It contributes to the large numbers of native trees.",
    ],
    correct: "It improves farming and agriculture throughout the region.",
  },
  { prompt: "Which climate causes little precipitation and very dry conditions?", options: ["Cold winters", "Humid summers", "Dry and desert climate", "Coastal climate"], correct: "Dry and desert climate" },
  { prompt: "Which climate causes snow and strong winds?", options: ["Dry and desert climate", "Cold winters", "Humid summers", "Coastal climate"], correct: "Cold winters" },
  { prompt: "Which climate causes hurricanes and tornadoes?", options: ["Cold winters", "Dry and desert climate", "Humid summers", "Coastal climate"], correct: "Humid summers" },
  { prompt: "A desert region would most likely have...", options: ["Snow and strong winds", "Hurricanes and tornadoes", "Little precipitation and very dry conditions", "Heavy fog every morning"], correct: "Little precipitation and very dry conditions" },
  { prompt: "A region with cold winters would most likely experience...", options: ["Little precipitation and very dry conditions", "Snow and strong winds", "Hurricanes and tornadoes", "Warm ocean breezes"], correct: "Snow and strong winds" },
  { prompt: "A region with humid summers is at greater risk of...", options: ["Snow and strong winds", "Little precipitation and very dry conditions", "Hurricanes and tornadoes", "Frost and ice storms"], correct: "Hurricanes and tornadoes" },

  // --- Harbors & tourism ---
  { prompt: "How can a harbor be helpful to a community?", options: ["It keeps the water warmer year-round.", "It allows ships to unload goods for trade and businesses.", "It stops storms from reaching the coast.", "It grows fresh vegetables for local markets."], correct: "It allows ships to unload goods for trade and businesses." },
  { prompt: "Why is tourism important to communities?", options: ["It lowers the population of a city.", "It reduces the need for harbors.", "It provides money and jobs for local businesses.", "It changes the community's climate."], correct: "It provides money and jobs for local businesses." },
  { prompt: "A community near the ocean builds a harbor. What is the main benefit?", options: ["Ships can dock and unload goods for trade.", "The town gets colder winters.", "The population automatically doubles.", "It replaces the need for roads."], correct: "Ships can dock and unload goods for trade." },
  { prompt: "Visitors from other places come to spend money at local shops and hotels. This is an example of how...", options: ["Climate affects a region", "Maps show elevation", "Tourism benefits a community", "Communities became rural"], correct: "Tourism benefits a community" },

  // --- Extra practice: mixed review ---
  { prompt: "Suburban communities are usually located...", options: ["Between a city and rural farmland", "In the middle of the ocean", "Deep in the desert", "On top of a mountain range"], correct: "Between a city and rural farmland" },
  { prompt: "Which community type would most likely have shopping malls and family neighborhoods close to a big city?", options: ["Rural", "Urban", "Suburban"], correct: "Suburban" },
  { prompt: "A vegetation map would NOT be very helpful for showing...", options: ["The types of plants in an area", "The elevation of the land", "Where forests are located", "Where crops are grown"], correct: "The elevation of the land" },
  { prompt: "Which step in community growth happens when farmers grow enough food to support more people living there?", options: ["Cities developed", "Populations increased", "People began growing food", "Communities were built"], correct: "Populations increased" },
  { prompt: "The word that describes an area of land with certain features, like mountains or coastlines, is...", options: ["Climate", "Population", "Region", "Community"], correct: "Region" },
  { prompt: "A region with hot, humid summers benefits farmers because...", options: ["Crops get more moisture to help them grow", "It keeps insects away completely", "It stops all rain from falling", "It makes the soil freeze"], correct: "Crops get more moisture to help them grow" },
  { prompt: "Which of these communities would most likely rely on tourism for jobs?", options: ["A landlocked farm town with no visitors", "A coastal community with beaches and hotels", "A closed factory town", "An empty research station"], correct: "A coastal community with beaches and hotels" },
  { prompt: "A community without a harbor would have a harder time...", options: ["Growing crops", "Building roads", "Bringing in goods by ship", "Having schools"], correct: "Bringing in goods by ship" },
  { prompt: "What is one way a community's population can grow over time?", options: ["The region gets renamed", "More people move in or are born there", "The climate changes", "A new map is drawn"], correct: "More people move in or are born there" },
  { prompt: "Rural, suburban, and urban are all types of...", options: ["Climates", "Maps", "Communities", "Regions"], correct: "Communities" },
];

function prepareSocialQuestion(item) {
  return {
    game: "social",
    kind: "mc",
    context: item.context || null,
    prompt: item.prompt,
    correct: item.correct,
    options: shuffle(item.options),
  };
}

// ---------- Communities Cove: matching, ordering & free-response (exact worksheet formats) ----------
const SOCIAL_MATCH_SETS = [
  {
    title: "Match each word to its meaning",
    pairs: [
      { term: "Community", def: "A place where people live, work, and play" },
      { term: "Climate", def: "The weather conditions of a place over a long period of time" },
      { term: "Region", def: "An area of land with particular features" },
      { term: "Population", def: "The number of people who live in one place" },
    ],
  },
  {
    title: "Match each map type to what it shows",
    pairs: [
      { term: "Physical map", def: "Shows the elevation and landforms of an area" },
      { term: "Political map", def: "Shows the borders between states or countries" },
      { term: "Climate map", def: "Shows weather patterns like temperature and rainfall" },
      { term: "Vegetation map", def: "Shows where plants and crops grow" },
    ],
  },
  {
    title: "Match each climate to what it causes",
    pairs: [
      { term: "Dry and desert climate", def: "Little precipitation and very dry conditions" },
      { term: "Cold winters", def: "Snow and strong winds" },
      { term: "Humid summers", def: "Hurricanes and tornadoes" },
      { term: "Coastal climate", def: "Warm ocean breezes and mild temperatures" },
    ],
  },
  {
    title: "Match each community type to its description",
    pairs: [
      { term: "Rural", def: "Farms, fields, and open land with few buildings" },
      { term: "Urban", def: "A busy city with skyscrapers and many people" },
      { term: "Suburban", def: "Houses and schools located between a city and the country" },
    ],
  },
];

function prepareMatchQuestion(set) {
  const pairs = set.pairs.map((p, i) => ({ id: i, term: p.term, def: p.def }));
  return {
    game: "social",
    kind: "match",
    title: set.title,
    terms: shuffle(pairs.map((p) => ({ id: p.id, text: p.term }))),
    defs: shuffle(pairs.map((p) => ({ id: p.id, text: p.def }))),
  };
}

const SOCIAL_ORDER_SETS = [
  {
    prompt: "Put these steps of community growth in the correct order.",
    events: ["People began growing food", "Communities were built", "Populations increased", "Cities developed"],
  },
  {
    prompt: "Put these steps of how a coastal town grows in the correct order.",
    events: [
      "A harbor is built for ships",
      "Goods and trade bring in money",
      "More people move to the town for jobs",
      "The town grows into a busy city",
    ],
  },
];

function prepareOrderQuestion(set) {
  return {
    game: "social",
    kind: "order",
    prompt: set.prompt,
    correctOrder: set.events,
    events: shuffle(set.events),
  };
}

const SOCIAL_FREE_SETS = [
  {
    prompt: "How can a harbor be helpful to a community? Explain your answer.",
    keywords: ["ship", "trade", "dock", "goods", "business", "import", "export"],
    sampleAnswer: "A harbor lets ships dock and unload goods, which helps the community trade and grow its businesses.",
  },
  {
    prompt: "Why is tourism important to a community? Explain your answer.",
    keywords: ["money", "jobs", "business", "visit", "tourist", "spend"],
    sampleAnswer: "Tourism brings visitors who spend money at local shops, hotels, and restaurants, which creates jobs and helps the community earn money.",
  },
  {
    prompt: "Describe one way that climate can affect the people living in a region.",
    keywords: ["farm", "crop", "cloth", "cold", "hot", "rain", "grow", "wear", "build", "storm"],
    sampleAnswer: "Climate affects what people wear, how they build their homes, and what crops farmers can grow in that region.",
  },
];

function prepareFreeQuestion(set) {
  return {
    game: "social",
    kind: "free",
    context: set.context || null,
    prompt: set.prompt,
    keywords: set.keywords,
    sampleAnswer: set.sampleAnswer,
  };
}

// ---------- Communities Cove story intro: hand-built illustrated scenes (no external images) ----------
function SceneEarth() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="spaceGrad" cx="50%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#132a52" />
          <stop offset="100%" stopColor="#050b1a" />
        </radialGradient>
        <radialGradient id="earthGrad" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5fb8e8" />
          <stop offset="55%" stopColor="#1f7fc4" />
          <stop offset="100%" stopColor="#0d4c86" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#spaceGrad)" />
      {[...Array(28)].map((_, i) => (
        <circle key={i} cx={(i * 53 + 17) % 400} cy={(i * 37 + 11) % 220} r={i % 5 === 0 ? 1.6 : 0.9} fill="#fff" opacity={0.3 + (i % 4) * 0.15} />
      ))}
      <circle cx="205" cy="130" r="80" fill="url(#earthGrad)" />
      <path d="M150 90 Q170 75 195 85 Q210 95 200 115 Q185 125 165 118 Q148 108 150 90Z" fill="#3fae5c" opacity="0.9" />
      <path d="M210 130 Q245 118 265 140 Q270 160 245 168 Q220 165 212 148Z" fill="#4bc26a" opacity="0.9" />
      <path d="M165 150 Q190 145 200 165 Q192 182 170 178 Q155 168 165 150Z" fill="#3fae5c" opacity="0.85" />
      <circle cx="205" cy="130" r="80" fill="none" stroke="#bfe6ff" strokeOpacity="0.35" strokeWidth="2" />
      <circle cx="320" cy="45" r="14" fill="#fff7d6" opacity="0.9" />
      <circle cx="320" cy="45" r="20" fill="#fff7d6" opacity="0.15" />
    </svg>
  );
}

function SceneRural() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="ruralSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe6f5" />
          <stop offset="100%" stopColor="#fdf3d0" />
        </linearGradient>
        <linearGradient id="fieldFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9d97a" />
          <stop offset="100%" stopColor="#a9c25a" />
        </linearGradient>
        <linearGradient id="fieldNear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c468" />
          <stop offset="100%" stopColor="#d1a63f" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#ruralSky)" />
      <circle cx="335" cy="55" r="30" fill="#ffe9a3" />
      {[...Array(5)].map((_, i) => (
        <ellipse key={i} cx={40 + i * 80} cy={45 + (i % 2) * 8} rx="26" ry="9" fill="#fff" opacity="0.85" />
      ))}
      <path d="M0 150 Q100 130 200 148 T400 140 V250 H0Z" fill="url(#fieldFar)" />
      <path d="M0 185 Q120 160 240 182 T400 175 V250 H0Z" fill="url(#fieldNear)" />
      {[...Array(10)].map((_, i) => (
        <line key={i} x1={i * 42} y1="200" x2={i * 42 - 20} y2="248" stroke="#b8892e" strokeWidth="2" opacity="0.5" />
      ))}
      <g transform="translate(60,165)">
        <rect x="-22" y="-24" width="44" height="30" fill="#c1443b" rx="2" />
        <polygon points="-26,-24 0,-42 26,-24" fill="#7a2c26" />
        <rect x="-6" y="-14" width="12" height="20" fill="#fff3d6" />
      </g>
      <g transform="translate(300,150)">
        <rect x="-3" y="-46" width="6" height="46" fill="#8a6a3c" />
        <circle cx="0" cy="-50" r="4" fill="#5c4326" />
        <line x1="-24" y1="-50" x2="24" y2="-50" stroke="#5c4326" strokeWidth="3" />
        <line x1="0" y1="-74" x2="0" y2="-26" stroke="#5c4326" strokeWidth="3" />
      </g>
    </svg>
  );
}

function SceneUrban() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2350" />
          <stop offset="55%" stopColor="#7a4a72" />
          <stop offset="100%" stopColor="#f0a35d" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#duskSky)" />
      <circle cx="330" cy="55" r="22" fill="#fdf1c8" opacity="0.9" />
      {[...Array(18)].map((_, i) => (
        <circle key={i} cx={(i * 61 + 9) % 400} cy={(i * 29 + 5) % 90} r={0.8} fill="#fff" opacity={0.5} />
      ))}
      {[
        [10, 90, 34, 130, "#2c2f4a"],
        [50, 60, 40, 160, "#33375a"],
        [96, 100, 30, 120, "#2c2f4a"],
        [132, 40, 46, 180, "#3b3f66"],
        [184, 75, 34, 145, "#2c2f4a"],
        [224, 20, 40, 200, "#3b3f66"],
        [270, 95, 32, 125, "#2c2f4a"],
        [308, 55, 42, 165, "#33375a"],
        [356, 85, 34, 135, "#2c2f4a"],
      ].map(([x, y, w, h, color], i) => (
        <g key={i}>
          <rect x={x} y={250 - h} width={w} height={h} fill={color} />
          {[...Array(Math.floor(h / 18))].map((_, r) =>
            [...Array(Math.floor(w / 12))].map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={x + 4 + c * 12}
                y={250 - h + 6 + r * 18}
                width="5"
                height="7"
                fill={(r + c + i) % 3 === 0 ? "#ffe08a" : "#7d6a3a"}
                opacity={(r + c + i) % 3 === 0 ? 0.95 : 0.35}
              />
            ))
          )}
        </g>
      ))}
      <rect x="222" y="10" width="4" height="12" fill="#3b3f66" />
    </svg>
  );
}

function SceneSuburban() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="suburbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fd8f2" />
          <stop offset="100%" stopColor="#e8f6ea" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#suburbSky)" />
      <circle cx="335" cy="50" r="24" fill="#fff4c2" />
      {[[40, 40], [140, 30], [250, 45]].map(([x, y], i) => (
        <g key={i} opacity="0.9">
          <ellipse cx={x} cy={y} rx="26" ry="12" fill="#fff" />
          <ellipse cx={x + 22} cy={y + 4} rx="20" ry="10" fill="#fff" />
          <ellipse cx={x - 20} cy={y + 5} rx="18" ry="9" fill="#fff" />
        </g>
      ))}
      <rect x="0" y="175" width="400" height="75" fill="#8fcf7e" />
      <path d="M0 190 Q200 165 400 190 L400 250 L0 250Z" fill="#79bf68" />
      <rect x="0" y="205" width="400" height="14" fill="#c9c4b0" />
      <line x1="0" y1="212" x2="400" y2="212" stroke="#fff" strokeWidth="2" strokeDasharray="14 10" opacity="0.7" />
      {[
        [30, "#e6a24a", "#8b5a2b"],
        [115, "#e0776b", "#7a2c26"],
        [205, "#7fb2d6", "#3d5f7a"],
        [295, "#e6c25a", "#8b6a1f"],
      ].map(([x, wallColor, roofColor], i) => (
        <g key={i} transform={`translate(${x},150)`}>
          <rect x="0" y="20" width="56" height="34" fill={wallColor} />
          <polygon points="-6,20 28,-6 62,20" fill={roofColor} />
          <rect x="10" y="30" width="12" height="12" fill="#fff8e0" />
          <rect x="34" y="30" width="12" height="12" fill="#fff8e0" />
          <rect x="24" y="40" width="10" height="14" fill="#5c4326" />
          <circle cx={-14} cy={54} r="10" fill="#4f9a53" />
          <rect x={-15.5} y={54} width="3" height="12" fill="#6b4a2b" />
        </g>
      ))}
    </svg>
  );
}

function SceneMap() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="parchGrad" cx="45%" cy="40%" r="75%">
          <stop offset="0%" stopColor="#f3e3bd" />
          <stop offset="100%" stopColor="#d9bd82" />
        </radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#parchGrad)" />
      <rect x="6" y="6" width="388" height="238" fill="none" stroke="#8b6a3a" strokeWidth="3" opacity="0.6" />
      <path d="M40 190 Q60 120 110 100 Q150 85 130 130 Q160 150 200 120 Q230 95 270 110 Q310 100 330 140" fill="none" stroke="#8b5a2b" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" opacity="0.8" />
      <path d="M90 60 Q130 40 170 65 Q160 90 120 85 Q95 78 90 60Z" fill="#b7a06a" opacity="0.55" />
      <path d="M230 150 Q270 130 300 160 Q290 190 250 185 Q225 175 230 150Z" fill="#b7a06a" opacity="0.55" />
      <g transform="translate(200,55)">
        <circle r="26" fill="none" stroke="#7a4a1f" strokeWidth="2" opacity="0.8" />
        <polygon points="0,-26 6,-6 0,0 -6,-6" fill="#a5341f" />
        <polygon points="0,26 6,6 0,0 -6,6" fill="#7a4a1f" />
        <polygon points="26,0 6,6 0,0 6,-6" fill="#7a4a1f" />
        <polygon points="-26,0 -6,6 0,0 -6,-6" fill="#7a4a1f" />
      </g>
      <g transform="translate(330,175)">
        <path d="M-10,-10 L10,10 M10,-10 L-10,10" stroke="#a5341f" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function SceneHarbor() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="harborSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b6fa8" />
          <stop offset="55%" stopColor="#e5895f" />
          <stop offset="100%" stopColor="#fbd08a" />
        </linearGradient>
        <linearGradient id="harborSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8a56b" />
          <stop offset="100%" stopColor="#2f6f8f" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#harborSky)" />
      <circle cx="330" cy="80" r="28" fill="#fff0c4" />
      <rect y="150" width="400" height="100" fill="url(#harborSea)" />
      {[...Array(6)].map((_, i) => (
        <ellipse key={i} cx={40 + i * 65} cy={158 + (i % 3) * 8} rx="30" ry="3" fill="#fff" opacity="0.35" />
      ))}
      <rect x="0" y="205" width="120" height="16" fill="#8a6a3c" />
      {[...Array(6)].map((_, i) => (
        <rect key={i} x={10 + i * 18} y="205" width="6" height="30" fill="#6b4f2a" />
      ))}
      {[[150, 175, "#f4f4f4", "#c1443b"], [220, 190, "#eee6d0", "#3d5f7a"], [280, 178, "#f4f4f4", "#8b6a1f"]].map(([x, y, hull, sail], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <polygon points="-24,10 24,10 16,22 -16,22" fill={hull} />
          <line x1="0" y1="10" x2="0" y2="-26" stroke="#5c4326" strokeWidth="2" />
          <polygon points="0,-26 0,4 20,6" fill={sail} opacity="0.9" />
        </g>
      ))}
      <path d="M60 60 Q66 54 72 60" fill="none" stroke="#3b3f66" strokeWidth="2" strokeLinecap="round" />
      <path d="M90 45 Q96 39 102 45" fill="none" stroke="#3b3f66" strokeWidth="2" strokeLinecap="round" />
      <path d="M115 62 Q121 56 127 62" fill="none" stroke="#3b3f66" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SceneShip() {
  return (
    <svg viewBox="0 0 400 250" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="shipSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2c55" />
          <stop offset="45%" stopColor="#c65a4e" />
          <stop offset="100%" stopColor="#ffcf7a" />
        </linearGradient>
        <linearGradient id="shipSea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb15e" />
          <stop offset="100%" stopColor="#1c3f57" />
        </linearGradient>
      </defs>
      <rect width="400" height="250" fill="url(#shipSky)" />
      <circle cx="200" cy="120" r="46" fill="#ffe6a0" opacity="0.95" />
      <circle cx="200" cy="120" r="60" fill="#ffe6a0" opacity="0.25" />
      <rect y="140" width="400" height="110" fill="url(#shipSea)" />
      {[...Array(7)].map((_, i) => (
        <path key={i} d={`M0 ${152 + i * 12} Q50 ${146 + i * 12} 100 ${152 + i * 12} T200 ${152 + i * 12} T300 ${152 + i * 12} T400 ${152 + i * 12}`} fill="none" stroke="#ffdca0" strokeOpacity={0.25 - i * 0.02} strokeWidth="2" />
      ))}
      <g transform="translate(200,165)">
        <path d="M-70,20 Q0,42 70,20 L58,42 Q0,58 -58,42 Z" fill="#3b2a1a" />
        <rect x="-4" y="-90" width="8" height="90" fill="#2a1c10" />
        <polygon points="-4,-88 -4,-16 -58,-4" fill="#e9dfc4" opacity="0.95" />
        <polygon points="4,-90 4,-10 56,4" fill="#f4ecd6" opacity="0.95" />
        <rect x="-4" y="-92" width="30" height="6" fill="#1c1006" />
        <path d="M40,-4 Q54,-14 66,-2" fill="none" stroke="#1c1006" strokeWidth="2" />
      </g>
      <path d="M40 90 Q48 82 56 90" fill="none" stroke="#2a1c30" strokeWidth="2" opacity="0.6" />
      <path d="M330 70 Q338 62 346 70" fill="none" stroke="#2a1c30" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

const STORY_SCENES = {
  earth: SceneEarth,
  rural: SceneRural,
  urban: SceneUrban,
  suburban: SceneSuburban,
  map: SceneMap,
  harbor: SceneHarbor,
  ship: SceneShip,
};

// ---------- Communities Cove story intro (played before questions begin) ----------
const STORY_BEATS = [
  {
    emoji: "🗺️",
    sceneKey: "earth",
    title: "Welcome to Communities Cove!",
    text: "Ahoy, explorer! Every place people live is called a community. Some communities are busy cities, some are quiet farms, and some are in between. Let's explore them before we set sail!",
  },
  {
    emoji: "🌾",
    sceneKey: "rural",
    title: "Rural Communities",
    text: "A rural community has lots of farms, fields, and open land. There aren't many buildings — just wide open skies and tractors at work.",
  },
  {
    emoji: "🏙️",
    sceneKey: "urban",
    title: "Urban Communities",
    text: "An urban community is a big city with tall skyscrapers, busy streets, and lots of people living close together.",
  },
  {
    emoji: "🏡",
    sceneKey: "suburban",
    title: "Suburban Communities",
    text: "A suburban community sits between the city and the countryside. It has houses, schools, and shops all nearby.",
  },
  {
    emoji: "🧭",
    sceneKey: "map",
    title: "Reading Maps",
    text: "Sailors use different kinds of maps! A physical map shows mountains and land. A political map shows borders. A climate map shows the weather. A vegetation map shows where plants grow.",
  },
  {
    emoji: "⛴️",
    sceneKey: "harbor",
    title: "Harbors & Tourism",
    text: "A harbor lets ships bring in goods to trade. When visitors come to a town for tourism, they spend money that helps the whole community grow.",
  },
  {
    emoji: "⚓",
    sceneKey: "ship",
    title: "Ready to Set Sail?",
    text: "Now it's your turn! Let's see how much you remember about communities, maps, and climate. Good luck, matey!",
  },
];

function generateQuestion(game, level) {
  if (game === "rounding") return generateRoundingQuestion(level);
  if (game === "addition") return generateAdditionQuestion(level);
  return generateMentalAdditionQuestion(level);
}

// ---------- Text-to-speech: what to say out loud for each question shape ----------
function getSpokenText(q) {
  if (!q) return "";
  if (q.game === "rounding" && q.kind === "round") {
    return `Round ${q.number} to the nearest ${q.unit}.`;
  }
  if (q.game === "rounding" && q.kind === "reverse") {
    return `Which number rounds to ${q.target}, to the nearest ${q.unit}?`;
  }
  if (q.game === "addition" && q.kind === "sum2") {
    return `What is ${q.a} plus ${q.b}?`;
  }
  if (q.game === "addition" && q.kind === "sum3") {
    return `What is ${q.a} plus ${q.b} plus ${q.c}?`;
  }
  if (q.game === "addition" && q.kind === "missing") {
    return `${q.known} plus what number equals ${q.total}?`;
  }
  if (q.game === "mental" && q.kind === "twoDigit") {
    return `What is ${q.a} plus ${q.b}?`;
  }
  if ((q.game === "science" || q.game === "social") && q.kind === "mc") {
    return q.context ? `${q.context} ${q.prompt}` : q.prompt;
  }
  if (q.game === "social" && q.kind === "match") {
    return `${q.title}. Tap a word, then tap its matching meaning.`;
  }
  if (q.game === "social" && q.kind === "order") {
    return `${q.prompt} Tap the events in the correct order.`;
  }
  if (q.game === "social" && q.kind === "free") {
    return q.context ? `${q.context} ${q.prompt}` : q.prompt;
  }
  return "";
}

const GAME_META = {
  rounding: {
    title: "Rounding Treasure Hunt",
    tagline: "Round each number to find the treasure.",
    icon: Compass,
  },
  addition: {
    title: "Addition Island",
    tagline: "Add the numbers to unlock the cove.",
    icon: Plus,
  },
  mental: {
    title: "Mental Addition Bay",
    tagline: "Split into tens and ones, then add.",
    icon: Ship,
  },
  science: {
    title: "Science Discovery Reef",
    tagline: "Engineering design practice for your Unit 1 test.",
    icon: Microscope,
  },
  social: {
    title: "Communities Cove",
    tagline: "Rural, urban, suburban, maps & climate practice.",
    icon: Globe2,
  },
};

export default function PirateMathQuest() {
  const [screen, setScreen] = useState("menu"); // menu | play | end
  const [game, setGame] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [stickers, setStickers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [burst, setBurst] = useState(false);
  const [toast, setToast] = useState(null);
  const [audioOn, setAudioOn] = useState(true);
  const [storyIndex, setStoryIndex] = useState(0);
  const [matchSelTerm, setMatchSelTerm] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [matchWrongPulse, setMatchWrongPulse] = useState(null);
  const [orderPicks, setOrderPicks] = useState([]);
  const [orderWrongFlash, setOrderWrongFlash] = useState(false);
  const [freeText, setFreeText] = useState("");
  const sciQueueRef = useRef([]);
  const socQueueRef = useRef([]);
  const audioOnRef = useRef(true);
  const audioCtxRef = useRef(null);
  const femaleVoiceRef = useRef(null);
  const stageRef = useRef(null);
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);

  const level = qIndex < 3 ? 1 : qIndex < 7 ? 2 : 3;
  const totalQuestions = game ? TOTAL_BY_GAME[game] || TOTAL_QUESTIONS : TOTAL_QUESTIONS;

  // Auto-fit the whole screen's content to the available viewport so nothing
  // ever needs to scroll, while filling as much of a big screen as possible.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    if (!stage || !viewport) return;

    const recompute = () => {
      const contentW = stage.offsetWidth;
      const contentH = stage.offsetHeight;
      if (!contentW || !contentH) return;
      const availW = viewport.clientWidth;
      const availH = viewport.clientHeight;
      if (!availW || !availH) return;
      const next = Math.min((availW * 0.96) / contentW, (availH * 0.96) / contentH, 3.4);
      setScale(Math.max(0.3, Math.min(next, 3.4)));
    };

    recompute();
    window.addEventListener("resize", recompute);
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(recompute);
      ro.observe(stage);
      ro.observe(viewport);
    }
    return () => {
      window.removeEventListener("resize", recompute);
      if (ro) ro.disconnect();
    };
  }, [screen, qIndex, storyIndex, question, feedback, stickers.length, matchedIds.length, orderPicks.length, freeText]);

  useEffect(() => {
    audioOnRef.current = audioOn;
    if (!audioOn && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioOn]);

  useEffect(() => {
    // Stop any speech when the component goes away.
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const femaleNamePattern = /zira|samantha|victoria|karen|moira|tessa|fiona|susan|allison|ava|serena|aria|jenny|salli|joanna|kimberly|kendra|ivy|nicole|female|woman|girl/i;
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      const enVoices = voices.filter((v) => /en/i.test(v.lang || ""));
      const pool = enVoices.length ? enVoices : voices;
      const match = pool.find((v) => femaleNamePattern.test(v.name || ""));
      femaleVoiceRef.current = match || null;
    };
    pickVoice();
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pickVoice);
  }, []);

  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtxRef.current) audioCtxRef.current = new AC();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
    return audioCtxRef.current;
  };

  const speak = useCallback((text) => {
    if (!audioOnRef.current || !text) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.15;
    if (femaleVoiceRef.current) utter.voice = femaleVoiceRef.current;
    window.speechSynthesis.speak(utter);
  }, []);

  const playChime = useCallback((kind) => {
    if (!audioOnRef.current) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    const notes = kind === "correct" ? [1046.5, 1318.5, 1568] : [392, 330];
    const noteDuration = 0.13;
    const gap = 0.03;
    let t = ctx.currentTime;
    notes.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.0001, t);
      gainNode.gain.exponentialRampToValueAtTime(kind === "correct" ? 0.22 : 0.14, t + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, t + noteDuration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + noteDuration + 0.02);
      t += noteDuration + gap;
    });
  }, []);

  useEffect(() => {
    if (screen === "play" && game) {
      let q;
      if (game === "science") {
        q = sciQueueRef.current[qIndex];
      } else if (game === "social") {
        q = socQueueRef.current[qIndex];
      } else {
        q = generateQuestion(game, level);
      }
      setQuestion(q);
      setSelected(null);
      setFeedback(null);
      setMatchSelTerm(null);
      setMatchedIds([]);
      setMatchWrongPulse(null);
      setOrderPicks([]);
      setOrderWrongFlash(false);
      setFreeText("");
      speak(getSpokenText(q));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, screen, game]);

  useEffect(() => {
    if (screen === "story") {
      speak(STORY_BEATS[storyIndex].text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, storyIndex]);

  const startGame = (chosenGame) => {
    setGame(chosenGame);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setStickers([]);
    setQIndex(0);
    if (chosenGame === "science") {
      const count = TOTAL_BY_GAME.science;
      sciQueueRef.current = shuffle(SCIENCE_BANK).slice(0, count).map(prepareScienceQuestion);
    }
    if (chosenGame === "social") {
      const count = TOTAL_BY_GAME.social;
      const specials = [
        prepareMatchQuestion(shuffle(SOCIAL_MATCH_SETS)[0]),
        prepareOrderQuestion(shuffle(SOCIAL_ORDER_SETS)[0]),
        prepareFreeQuestion(shuffle(SOCIAL_FREE_SETS)[0]),
      ];
      const mcCount = Math.max(0, count - specials.length);
      const mcQuestions = shuffle(SOCIAL_BANK).slice(0, mcCount).map(prepareSocialQuestion);
      socQueueRef.current = shuffle([...specials, ...mcQuestions]);
      setStoryIndex(0);
      setScreen("story");
      return;
    }
    setScreen("play");
  };

  const awardSticker = useCallback((count) => {
    if ([2, 4, 6, 8, 10, 12, 14, 16, 18].includes(count)) {
      setStickers((prev) => {
        const idx = prev.length % STICKER_POOL.length;
        return [...prev, STICKER_POOL[idx]];
      });
      setToast("New sticker unlocked!");
      setTimeout(() => setToast(null), 1800);
    }
  }, []);

  const applyResult = (isCorrect) => {
    if (window.Tracker) window.Tracker.answer(!!isCorrect, "Pirate: " + game);
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    if (isCorrect) {
      setFeedback("correct");
      playChime("correct");
      const gained = 10 + streak * 2;
      setScore((s) => s + gained);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      setCorrectCount((c) => {
        const next = c + 1;
        awardSticker(next);
        return next;
      });
      setBurst(true);
      setTimeout(() => setBurst(false), 700);
    } else {
      setFeedback("wrong");
      playChime("wrong");
      setStreak(0);
    }
  };

  const handleAnswer = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const isCorrect = opt === question.correct;
    applyResult(isCorrect);
  };

  const handleMatchTermTap = (id) => {
    if (feedback || matchedIds.includes(id)) return;
    setMatchSelTerm(id);
  };

  const handleMatchDefTap = (id) => {
    if (feedback || matchedIds.includes(id) || matchSelTerm === null) return;
    if (matchSelTerm === id) {
      const nextMatched = [...matchedIds, id];
      setMatchedIds(nextMatched);
      setMatchSelTerm(null);
      if (nextMatched.length === question.terms.length) {
        applyResult(true);
      }
    } else {
      setMatchWrongPulse(id);
      setMatchSelTerm(null);
      setTimeout(() => setMatchWrongPulse(null), 450);
    }
  };

  const handleOrderTap = (evt) => {
    if (feedback || orderPicks.includes(evt)) return;
    const next = [...orderPicks, evt];
    setOrderPicks(next);
    if (next.length === question.events.length) {
      const isCorrect = next.every((e, i) => e === question.correctOrder[i]);
      if (isCorrect) {
        applyResult(true);
      } else {
        if (window.Tracker) window.Tracker.answer(false, "Pirate: " + game + " (order)");
        setOrderWrongFlash(true);
        setTimeout(() => {
          setOrderWrongFlash(false);
          setOrderPicks([]);
        }, 900);
      }
    }
  };

  const handleFreeSubmit = () => {
    if (feedback || !freeText.trim()) return;
    const lower = freeText.toLowerCase();
    const isCorrect = question.keywords.some((k) => lower.includes(k.toLowerCase()));
    applyResult(isCorrect);
  };

  const handleStoryNext = () => {
    if (storyIndex + 1 >= STORY_BEATS.length) {
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
      setScreen("play");
    } else {
      setStoryIndex((i) => i + 1);
    }
  };

  const skipStory = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setScreen("play");
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= totalQuestions) {
      setScreen("end");
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const backToMenu = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    setScreen("menu");
    setGame(null);
  };

  const cheer = feedback === "correct" ? CHEERS[randInt(0, CHEERS.length - 1)] : TRY_AGAIN[randInt(0, TRY_AGAIN.length - 1)];
  const meta = game ? GAME_META[game] : null;

  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top, #14524d 0%, #0b3d3a 45%, #0a2f3a 100%)",
        fontFamily: "'Baloo 2', 'Nunito', ui-rounded, system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Nunito:wght@400;600;700;800&display=swap');
        .parchment {
          background: linear-gradient(180deg, #f4e9d8 0%, #ecdcbd 100%);
          box-shadow: 0 20px 60px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(139,105,58,0.25);
        }
        .compass-spin { animation: spin 12s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
        .pop { animation: pop 0.35s ease; }
        @keyframes pop { 0% { transform: scale(0.9); opacity: 0;} 60% { transform: scale(1.05);} 100% { transform: scale(1); opacity: 1;} }
        .float { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-6px);} }
        .sparkle-burst { animation: sparkleburst 0.7s ease forwards; }
        @keyframes sparkleburst {
          0% { transform: scale(0.4) rotate(0deg); opacity: 1; }
          100% { transform: scale(2.2) rotate(40deg); opacity: 0; }
        }
        .toast-in { animation: toastin 0.3s ease; }
        @keyframes toastin { from { transform: translateY(-16px); opacity: 0;} to { transform: translateY(0); opacity: 1;} }
        .opt-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .opt-btn:not(:disabled):hover { transform: translateY(-2px) scale(1.02); }
        .opt-btn:not(:disabled):active { transform: translateY(0) scale(0.98); }
        .game-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .game-card:hover { transform: translateY(-4px); }
      `}</style>

      <button
        onClick={() => setAudioOn((v) => !v)}
        className="fixed top-4 right-4 z-40 rounded-full p-3 shadow-lg flex items-center gap-2"
        style={{ background: audioOn ? "linear-gradient(180deg,#38bdf8,#0ea5e9)" : "linear-gradient(180deg,#94a3b8,#64748b)" }}
        title={audioOn ? "Turn off reading & sounds" : "Turn on reading & sounds"}
      >
        {audioOn ? <Volume2 size={20} color="#fff" /> : <VolumeX size={20} color="#fff" />}
      </button>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 toast-in z-50">
          <div className="px-5 py-2.5 rounded-full font-bold text-amber-900 shadow-xl flex items-center gap-2" style={{ background: "linear-gradient(90deg,#fde68a,#facc15)" }}>
            <Gem size={18} /> {toast}
          </div>
        </div>
      )}

      <div ref={viewportRef} className="h-full w-full flex items-center justify-center p-3 overflow-hidden">
        <div ref={stageRef} style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
      {screen === "menu" && (
        <div className="w-[480px] text-center pop">
          <Anchor className="mx-auto mb-2 float" size={52} color="#e8c468" />
          <h1 className="text-4xl font-extrabold mb-1 text-amber-100" style={{ letterSpacing: "-0.5px" }}>
            Pirate Math Quest
          </h1>
          <p className="text-amber-100/80 mb-1">Choose your voyage!</p>
          <p className="text-amber-100/50 text-xs mb-6">
            {audioOn ? "🔊 Questions are read aloud" : "🔇 Reading & sounds are off"}
          </p>

          <div className="grid grid-cols-1 gap-4">
            <button onClick={() => startGame("rounding")} className="game-card parchment rounded-3xl p-6 text-left flex items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#e8c468" }}>
                <Compass size={34} color="#3e2a12" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#3e2a12" }}>Rounding Treasure Hunt</p>
                <p className="text-sm" style={{ color: "#6b4f2a" }}>Round to the nearest ten & hundred</p>
              </div>
            </button>

            <button onClick={() => startGame("addition")} className="game-card parchment rounded-3xl p-6 text-left flex items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#8fd3c7" }}>
                <Plus size={34} color="#0b3d3a" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#3e2a12" }}>Addition Island</p>
                <p className="text-sm" style={{ color: "#6b4f2a" }}>Make 10, make 5 & add three numbers</p>
              </div>
            </button>

            <button onClick={() => startGame("mental")} className="game-card parchment rounded-3xl p-6 text-left flex items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#a7c7e7" }}>
                <Ship size={34} color="#0b3d3a" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#3e2a12" }}>Mental Addition Bay</p>
                <p className="text-sm" style={{ color: "#6b4f2a" }}>Add two 2-digit numbers using tens & ones</p>
              </div>
            </button>

            <button onClick={() => startGame("science")} className="game-card parchment rounded-3xl p-6 text-left flex items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#f0b8c8" }}>
                <Microscope size={34} color="#3e2a12" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#3e2a12" }}>Science Discovery Reef</p>
                <p className="text-sm" style={{ color: "#6b4f2a" }}>Unit 1 Study Guide: engineering design practice</p>
              </div>
            </button>

            <button onClick={() => startGame("social")} className="game-card parchment rounded-3xl p-6 text-left flex items-center gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#bcd6a5" }}>
                <Globe2 size={34} color="#3e2a12" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: "#3e2a12" }}>Communities Cove</p>
                <p className="text-sm" style={{ color: "#6b4f2a" }}>Rural, urban, suburban, maps & climate practice</p>
              </div>
            </button>
          </div>

          <p className="mt-6 text-sm text-amber-100/60">10-18 questions each · earn points, streaks & stickers</p>
        </div>
      )}

      {screen === "story" && (
        <div className="w-[480px] text-center pop">
          <div className="parchment rounded-3xl p-8 relative" key={storyIndex}>
            <div className="relative w-full rounded-2xl overflow-hidden mb-4 pop" style={{ aspectRatio: "16 / 10", background: "#e4d4ac" }}>
              {(() => {
                const Scene = STORY_SCENES[STORY_BEATS[storyIndex].sceneKey];
                return Scene ? <Scene /> : null;
              })()}
              <span
                className="absolute bottom-2 right-2 text-3xl rounded-full p-1"
                style={{ background: "rgba(244,233,216,0.9)", lineHeight: 1 }}
              >
                {STORY_BEATS[storyIndex].emoji}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold mb-3" style={{ color: "#3e2a12" }}>
              {STORY_BEATS[storyIndex].title}
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
              {STORY_BEATS[storyIndex].text}
            </p>
            <div className="flex items-center justify-center gap-2 mb-5">
              {STORY_BEATS.map((_, i) => (
                <span
                  key={i}
                  className="rounded-full"
                  style={{ width: 8, height: 8, background: i === storyIndex ? "#0ea5e9" : "#d8c39a", display: "inline-block" }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleStoryNext}
                className="opt-btn px-8 py-3 rounded-2xl text-lg font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(180deg,#38bdf8,#0ea5e9)" }}
              >
                {storyIndex + 1 >= STORY_BEATS.length ? "Start the Voyage! ⛵" : "Next →"}
              </button>
              <button onClick={skipStory} className="text-sm font-bold" style={{ color: "#a9772f" }}>
                Skip Intro
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "play" && question && (
        <div className="w-[640px]">
          <div className="flex items-center justify-between mb-2 px-1">
            <button onClick={backToMenu} className="text-amber-100/80 hover:text-amber-100 flex items-center gap-1 text-sm font-bold">
              <ArrowLeft size={16} /> Menu
            </button>
            <p className="text-amber-100 font-bold text-sm">{meta.title}</p>
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Map size={20} />
              <span>{qIndex + 1} / {totalQuestions}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Star size={20} fill="#facc15" color="#facc15" />
              <span>{score}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Sparkles size={20} color="#5eead4" />
              <span>{streak} streak</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-black/30 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(qIndex / totalQuestions) * 100}%`, background: "linear-gradient(90deg,#facc15,#ff6b4f)" }}
            />
          </div>

          <div className="flex items-center gap-1 mb-4 px-1 min-h-[28px]">
            {stickers.length === 0 && (
              <span className="text-xs text-amber-100/60">Your treasure chest is empty — answer correctly to fill it!</span>
            )}
            {stickers.map((s, i) => (
              <span key={i} className="text-xl pop">{s}</span>
            ))}
          </div>

          <div className="parchment rounded-3xl p-6 relative pop" key={qIndex}>
            {burst && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="sparkle-burst text-6xl">✨</span>
              </div>
            )}

            <div className="text-center mb-5">
              {question.game === "rounding" && question.kind === "round" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "#a9772f" }}>
                    Round to the nearest {question.unit}
                  </p>
                  <p className="text-5xl font-extrabold" style={{ color: "#3e2a12" }}>{question.number.toLocaleString()}</p>
                </>
              )}
              {question.game === "rounding" && question.kind === "reverse" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-1" style={{ color: "#a9772f" }}>
                    Which number rounds to {question.target.toLocaleString()}?
                  </p>
                  <p className="text-sm" style={{ color: "#6b4f2a" }}>(nearest {question.unit})</p>
                </>
              )}
              {question.game === "addition" && question.kind === "sum2" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add the numbers</p>
                  <p className="text-5xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a} + {question.b} = ?</p>
                </>
              )}
              {question.game === "addition" && question.kind === "sum3" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add all three</p>
                  <p className="text-4xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a} + {question.b} + {question.c} = ?</p>
                </>
              )}
              {question.game === "addition" && question.kind === "missing" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Find the missing number</p>
                  <p className="text-4xl font-extrabold" style={{ color: "#3e2a12" }}>{question.known} + ? = {question.total}</p>
                </>
              )}
              {question.game === "mental" && question.kind === "twoDigit" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add mentally</p>
                  <p className="text-5xl font-extrabold mb-3" style={{ color: "#3e2a12" }}>{question.a} + {question.b} = ?</p>
                  <div className="rounded-xl px-3 py-2 inline-block text-xs font-bold" style={{ background: "#eef6f1", color: "#3d6b58", border: "1px dashed #9cc4ab" }}>
                    💡 {question.aTens}+{question.bTens}={question.aTens + question.bTens}, then {question.aOnes}+{question.bOnes}={question.aOnes + question.bOnes}
                  </div>
                </>
              )}
              {question.game === "science" && question.kind === "mc" && (
                <div className="text-left">
                  {question.context && (
                    <p className="text-sm mb-3 leading-snug" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
                      {question.context}
                    </p>
                  )}
                  <p className="text-xl font-extrabold leading-snug" style={{ color: "#3e2a12" }}>{question.prompt}</p>
                </div>
              )}
              {question.game === "social" && question.kind === "match" && (
                <div className="text-left">
                  <p className="text-sm font-bold uppercase tracking-wide mb-1 text-center" style={{ color: "#a9772f" }}>
                    {question.title}
                  </p>
                  <p className="text-xs text-center mb-4" style={{ color: "#6b4f2a" }}>
                    Tap a word, then tap its matching meaning.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      {question.terms.map((t) => {
                        const isMatched = matchedIds.includes(t.id);
                        const isSel = matchSelTerm === t.id;
                        return (
                          <button
                            key={t.id}
                            disabled={isMatched}
                            onClick={() => handleMatchTermTap(t.id)}
                            className="opt-btn rounded-xl py-3 px-3 text-sm font-bold shadow-md text-left"
                            style={{
                              background: isMatched
                                ? "linear-gradient(180deg,#86efac,#4ade80)"
                                : isSel
                                ? "linear-gradient(180deg,#bae6fd,#7dd3fc)"
                                : "linear-gradient(180deg,#fff,#f1e4c8)",
                              border: isMatched ? "2px solid #16a34a" : "2px solid #d8c39a",
                              color: "#3e2a12",
                            }}
                          >
                            {t.text}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-2">
                      {question.defs.map((d) => {
                        const isMatched = matchedIds.includes(d.id);
                        const isWrongFlash = matchWrongPulse === d.id;
                        return (
                          <button
                            key={d.id}
                            disabled={isMatched}
                            onClick={() => handleMatchDefTap(d.id)}
                            className="opt-btn rounded-xl py-3 px-3 text-xs font-bold shadow-md text-left"
                            style={{
                              background: isMatched
                                ? "linear-gradient(180deg,#86efac,#4ade80)"
                                : isWrongFlash
                                ? "linear-gradient(180deg,#fca5a5,#f87171)"
                                : "linear-gradient(180deg,#fff,#f1e4c8)",
                              border: isMatched ? "2px solid #16a34a" : isWrongFlash ? "2px solid #dc2626" : "2px solid #d8c39a",
                              color: "#3e2a12",
                            }}
                          >
                            {d.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
              {question.game === "social" && question.kind === "order" && (
                <div className="text-left">
                  <p className="text-sm font-bold uppercase tracking-wide mb-2 text-center" style={{ color: "#a9772f" }}>
                    Put the events in order
                  </p>
                  <p className="text-lg font-extrabold text-center mb-3" style={{ color: "#3e2a12" }}>
                    {question.prompt}
                  </p>
                  {orderWrongFlash && (
                    <p className="text-center text-sm font-bold mb-2" style={{ color: "#dc2626" }}>
                      Not quite that order — try again!
                    </p>
                  )}
                  {orderPicks.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {orderPicks.map((evt, i) => (
                        <div
                          key={i}
                          className="rounded-xl py-2 px-3 text-sm font-bold"
                          style={{ background: "#eef6f1", border: "1px dashed #9cc4ab", color: "#3d6b58" }}
                        >
                          {i + 1}. {evt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    {question.events
                      .filter((e) => !orderPicks.includes(e))
                      .map((evt) => (
                        <button
                          key={evt}
                          onClick={() => handleOrderTap(evt)}
                          className="opt-btn rounded-xl py-3 px-3 text-sm font-bold shadow-md text-left"
                          style={{ background: "linear-gradient(180deg,#fff,#f1e4c8)", border: "2px solid #d8c39a", color: "#3e2a12" }}
                        >
                          {evt}
                        </button>
                      ))}
                  </div>
                </div>
              )}
              {question.game === "social" && question.kind === "free" && (
                <div className="text-left">
                  {question.context && (
                    <p className="text-sm mb-3 leading-snug" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
                      {question.context}
                    </p>
                  )}
                  <p className="text-xl font-extrabold leading-snug mb-3" style={{ color: "#3e2a12" }}>
                    {question.prompt}
                  </p>
                  {!feedback && (
                    <>
                      <textarea
                        value={freeText}
                        onChange={(e) => setFreeText(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl p-3 text-sm mb-3"
                        style={{ border: "2px solid #d8c39a", color: "#3e2a12", background: "#fffdf7" }}
                        placeholder="Type your answer here..."
                      />
                      <button
                        onClick={handleFreeSubmit}
                        disabled={!freeText.trim()}
                        className="opt-btn px-6 py-3 rounded-xl font-bold text-white shadow-lg"
                        style={{ background: "linear-gradient(180deg,#38bdf8,#0ea5e9)", opacity: freeText.trim() ? 1 : 0.6 }}
                      >
                        Submit Answer
                      </button>
                    </>
                  )}
                  {feedback && (
                    <div className="rounded-xl p-3 text-sm" style={{ background: "#eef6f1", border: "1px dashed #9cc4ab", color: "#3d6b58" }}>
                      <p className="font-bold mb-1">Your answer: "{freeText}"</p>
                      <p>
                        <span className="font-bold">Great answer example:</span> {question.sampleAnswer}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {question.game === "social" && question.kind === "mc" && (
                <div className="text-left">
                  {question.context && (
                    <p className="text-sm mb-3 leading-snug" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
                      {question.context}
                    </p>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xl font-extrabold leading-snug" style={{ color: "#3e2a12" }}>{question.prompt}</p>
                    {audioOn && (
                      <button
                        onClick={() => speak(getSpokenText(question))}
                        className="opt-btn shrink-0 rounded-full p-2 shadow-md"
                        style={{ background: "linear-gradient(180deg,#38bdf8,#0ea5e9)" }}
                        title="Repeat the question"
                      >
                        <Volume2 size={18} color="#fff" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {question.options && (
              <div className={question.game === "science" || question.game === "social" ? "grid grid-cols-1 gap-3" : "grid grid-cols-2 gap-3"}>
                {question.options.map((opt, i) => {
                  const isSelected = selected === opt;
                  const isCorrectOpt = opt === question.correct;
                  let bg = "linear-gradient(180deg,#fff,#f1e4c8)";
                  let border = "2px solid #d8c39a";
                  let color = "#3e2a12";
                  if (feedback && isCorrectOpt) {
                    bg = "linear-gradient(180deg,#86efac,#4ade80)";
                    border = "2px solid #16a34a";
                  } else if (feedback && isSelected && !isCorrectOpt) {
                    bg = "linear-gradient(180deg,#fca5a5,#f87171)";
                    border = "2px solid #dc2626";
                  }
                  const isSci = question.game === "science" || question.game === "social";
                  return (
                    <button
                      key={i}
                      disabled={!!feedback}
                      onClick={() => handleAnswer(opt)}
                      className={`opt-btn rounded-xl shadow-md ${isSci ? "py-3 px-4 text-left text-base font-bold" : "py-4 text-xl font-extrabold"}`}
                      style={{ background: bg, border, color }}
                    >
                      {opt.toLocaleString()}
                    </button>
                  );
                })}
              </div>
            )}

            {feedback && (
              <div className="mt-5 text-center pop">
                <p className="font-bold text-lg mb-3" style={{ color: feedback === "correct" ? "#166534" : "#92400e" }}>
                  {feedback === "correct" ? `🎉 ${cheer}` : cheer}
                </p>
                <button
                  onClick={nextQuestion}
                  className="opt-btn px-6 py-3 rounded-xl font-bold text-white shadow-lg"
                  style={{ background: "linear-gradient(180deg,#38bdf8,#0ea5e9)" }}
                >
                  {qIndex + 1 >= totalQuestions ? "See my treasure! 🏆" : "Next question →"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {screen === "end" && (
        <div className="parchment rounded-3xl w-[480px] p-8 text-center pop relative overflow-hidden">
          <div className="text-7xl mb-2 float">🏴‍☠️</div>
          <h2 className="text-3xl font-extrabold mb-1" style={{ color: "#3e2a12" }}>Treasure Found!</h2>
          <p className="mb-5" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
            {correctCount === totalQuestions
              ? "A perfect voyage! You got every question right!"
              : correctCount >= totalQuestions * 0.7
              ? "Great sailing! You've got a strong feel for this."
              : "Nice work exploring! Every question made you sharper."}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Trophy className="mx-auto mb-1" size={26} color="#b45309" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{score}</p>
              <p className="text-xs font-bold" style={{ color: "#8b6f45" }}>points</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Sparkles className="mx-auto mb-1" size={26} color="#0ea5e9" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{bestStreak}</p>
              <p className="text-xs font-bold" style={{ color: "#8b6f45" }}>best streak</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Anchor className="mx-auto mb-1" size={26} color="#166534" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{correctCount}/{totalQuestions}</p>
              <p className="text-xs font-bold" style={{ color: "#8b6f45" }}>correct</p>
            </div>
          </div>

          <p className="text-sm font-bold mb-2" style={{ color: "#a9772f" }}>Your sticker collection</p>
          <div className="flex flex-wrap justify-center gap-2 mb-6 min-h-[36px]">
            {stickers.length > 0 ? (
              stickers.map((s, i) => (
                <span key={i} className="text-3xl pop" style={{ animationDelay: `${i * 0.08}s` }}>{s}</span>
              ))
            ) : (
              <span className="text-sm text-amber-800/60">Play again to earn stickers!</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame(game)}
              className="opt-btn px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-lg inline-flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(180deg,#ff8566,#ff6b4f)" }}
            >
              <RotateCcw size={20} /> Sail Again
            </button>
            <button
              onClick={backToMenu}
              className="opt-btn px-8 py-3 rounded-2xl text-base font-bold shadow-md"
              style={{ background: "#fff", border: "2px solid #d8c39a", color: "#3e2a12" }}
            >
              Choose Another Voyage
            </button>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
