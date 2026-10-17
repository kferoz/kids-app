/* ============================================================
   Times Table Takeoff — Data / Config
   A summer multiplication-fluency app for INCOMING 3rd graders,
   built from the 2nd-grade teachers' summer letter: master the
   multiplication facts to 12 × 12, with skip counting as the
   foundation, so students enter 3rd grade fluent in their tables.

   Multiplication facts are generated in app.js — this file holds
   the phases, the tables to master, trophies and cheer lines.
   ============================================================ */

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];   // tables to master
const MAX_FACTOR = 12;

/* The learning journey, in order. Each phase builds fluency. */
const PHASES = [
  { id: "skip",     name: "Skip Counting",    emoji: "🪜", blurb: "Count by 2s, 5s, 10s… the secret to fast facts!" },
  { id: "learn",    name: "Learn a Table",    emoji: "📖", blurb: "See and hear a whole times table." },
  { id: "practice", name: "Fact Practice",    emoji: "✍️", blurb: "Practice one table until you master it." },
  { id: "fluency",  name: "Fluency Blast-off", emoji: "🚀", blurb: "Mixed facts to 12×12 — show your speed!" }
];

const TT_TROPHIES = [
  { id: "blastoff", icon: "🚀", name: "Blast Off!",        desc: "Master your first table" },
  { id: "skip-star", icon: "🪜", name: "Skip-Count Star",  desc: "Finish skip counting for every number" },
  { id: "halfway",  icon: "🌗", name: "Halfway to the Stars", desc: "Master 6 tables" },
  { id: "fluent",   icon: "⚡", name: "Fluent Flyer",      desc: "Score 10+ on a Fluency Blast-off" },
  { id: "champion", icon: "🏆", name: "Times Table Champion", desc: "Master every table to 12×12" }
];

const TT_CHEERS = ["Blast off! 🚀", "Correct! ⭐", "You've got it! 🎯", "Nice work! 💪", "Zoom! 🌟", "Yes! 🎉"];
