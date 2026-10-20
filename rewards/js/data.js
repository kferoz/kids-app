/* ============================================================
   Rewards Center — Data
   A hub app that gathers every reward earned across ALL the
   learning apps (they share the same file:// localStorage), and
   adds fun gadgets: a Prize Wheel and a Critter Collection.
   ============================================================ */

/* Each learning app + where it stores its reward currency / trophies.
   `cur` = points/stars/coins key, `troph` = trophy-list key. */
const REWARD_APPS = [
  { id: "funfacts", name: "Fun Facts Explorer",   emoji: "🔍", url: "../funfacts/index.html", cur: "ff_stars",  curIcon: "⭐", troph: "ff_trophies" },
  { id: "grammar",  name: "Grammar Galaxy",       emoji: "🚀", url: "../grammar/index.html",  cur: "gg_stars",  curIcon: "⭐", troph: "gg_trophies" },
  { id: "kinder",   name: "Little Learners",      emoji: "🐣", url: "../kinder/index.html",   cur: "ll_stars",  curIcon: "⭐", troph: "ll_trophies" },
  { id: "treasure", name: "Grammar Treasure Hunt",emoji: "🗺️", url: "../treasure/index.html", cur: "th_coins",  curIcon: "🪙", troph: "th_trophies" },
  { id: "reading",  name: "Reading Trail",        emoji: "🦉", url: "../reading/index.html",  cur: "rd_points", curIcon: "⭐", troph: "rd_trophies" },
  { id: "multiply", name: "Times Table Takeoff",  emoji: "🚀", url: "../multiply/index.html", cur: "tt_points", curIcon: "⭐", troph: "tt_trophies" },
  { id: "homeschool",name: "Homeschool Academy",  emoji: "🎓", url: "../homeschool/index.html", cur: "hs_points", curIcon: "⭐", troph: "hs_trophies" },
  { id: "detectives",name: "Reading Detectives",  emoji: "🔍", url: "../detectives/index.html", cur: "rc_points", curIcon: "⭐", troph: "rc_trophies" },
  { id: "readrocket",name: "Read-Aloud Rocket",   emoji: "🚀", url: "../readrocket/index.html", cur: "rr_points", curIcon: "⭐", troph: "rr_trophies" },
  { id: "writestudio",name: "Sentence Studio",    emoji: "✏️", url: "../writestudio/index.html", cur: "ws_points", curIcon: "⭐", troph: "ws_trophies" },
  { id: "speedway", name: "Learning Speedway",    emoji: "🏎️", url: "../speedway/index.html", cur: "sw_points", curIcon: "⭐", troph: "sw_trophies" },
  { id: "grandprix",name: "Turbo Grand Prix",     emoji: "🏁", url: "../grandprix/index.html", cur: "gp_points", curIcon: "🏅", troph: "gp_trophies" },
  { id: "tracewrite",name: "Write & Trace",      emoji: "🖍️", url: "../tracewrite/index.html", cur: "tw_points", curIcon: "⭐", troph: "tw_trophies" },
  { id: "arabic",   name: "Arabic Oasis",         emoji: "🐪", url: "../arabic/index.html", cur: "ar_points", curIcon: "⭐", troph: "ar_trophies" },
  { id: "phonics",  name: "Phonics Pals",         emoji: "🦜", url: "../phonics/index.html", cur: "ph_points", curIcon: "⭐", troph: "ph_trophies" },
  { id: "clueisland",name: "Clue Island",         emoji: "🧭", url: "../clueisland/index.html", cur: "ci_gems", curIcon: "💎", troph: "ci_trophies" }
];

/* Cross-app milestone badges (earned by playing across the whole hub). */
const RW_MILESTONES = [
  { id: "getting-started", icon: "🌟", name: "Getting Started", desc: "Earn a reward in any app",     test: function (t) { return t.appsPlayed >= 1; } },
  { id: "explorer",        icon: "🧭", name: "Explorer",        desc: "Play 3 different apps",         test: function (t) { return t.appsPlayed >= 3; } },
  { id: "collector",       icon: "🏅", name: "Trophy Collector",desc: "Win 10 trophies in all",       test: function (t) { return t.trophies >= 10; } },
  { id: "all-star",        icon: "🌈", name: "All-Star",        desc: "Earn a reward in every app",   test: function (t) { return t.appsPlayed >= REWARD_APPS.length; } },
  { id: "reward-legend",   icon: "👑", name: "Reward Legend",   desc: "Collect 100 rewards in all",   test: function (t) { return t.currency >= 100; } }
];

/* Collectible "critters" you win from the Prize Wheel. */
const CRITTERS = [
  { id: "unicorn", emoji: "🦄", name: "Sparkle" },
  { id: "dragon",  emoji: "🐉", name: "Ember" },
  { id: "dino",    emoji: "🦖", name: "Rex" },
  { id: "owl",     emoji: "🦉", name: "Hoot" },
  { id: "fox",     emoji: "🦊", name: "Rusty" },
  { id: "octopus", emoji: "🐙", name: "Inky" },
  { id: "bee",     emoji: "🐝", name: "Buzz" },
  { id: "turtle",  emoji: "🐢", name: "Shelly" },
  { id: "whale",   emoji: "🐳", name: "Splash" },
  { id: "frog",    emoji: "🐸", name: "Hopper" },
  { id: "cat",     emoji: "🐱", name: "Whiskers" },
  { id: "penguin", emoji: "🐧", name: "Waddle" }
];

/* Prize Wheel segments. Each spin costs one 🎟️ ticket. */
const WHEEL = [
  { label: "New Critter!", kind: "critter", color: "#a56bff" },
  { label: "+2 Tickets",   kind: "tickets", n: 2, color: "#33c9dc" },
  { label: "New Critter!", kind: "critter", color: "#ff6f91" },
  { label: "Jackpot 🎉",   kind: "jackpot", n: 5, color: "#ffb020" },
  { label: "New Critter!", kind: "critter", color: "#7ed957" },
  { label: "+1 Ticket",    kind: "tickets", n: 1, color: "#ff8a3d" }
];
