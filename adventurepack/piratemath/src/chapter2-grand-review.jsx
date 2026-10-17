import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Trophy, Gem, Sparkles, RotateCcw, Anchor, Award, Map } from "lucide-react";

const STICKER_POOL = ["💎", "🦜", "🐚", "🧭", "⚓", "🌟", "🏆", "🗺️", "🥇", "🔱", "⭐", "🎖️"];

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

const ROUND_LENGTH = 32;

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

function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
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

// ---------- Section 1: Add by making 5 or 10 ----------
function genSum2() {
  const a = randInt(3, 9);
  const b = randInt(3, 9);
  const correct = a + b;
  return { kind: "sum2", a, b, correct, options: makeOptions(correct, 1, 4, 1) };
}

// ---------- Section 2: Add three numbers ----------
function genSum3() {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const correct = a + b + c;
  return { kind: "sum3", a, b, c, correct, options: makeOptions(correct, 1, 4, 3) };
}

// ---------- Section 3: Complete the sum (missing pair) ----------
function genMissingPair() {
  const K = randInt(2, 9);
  const total = randInt(K + 4, K + 14);
  const need = total - K;
  const a = randInt(0, need);
  const b = need - a;
  const correctText = `${a} and ${b}`;
  const wrongSet = new Set([correctText]);
  const wrongTexts = [];
  let guard = 0;
  while (wrongTexts.length < 3 && guard < 100) {
    guard++;
    const wa = randInt(0, need + 5);
    const wb = randInt(0, need + 5);
    if (wa + wb === need) continue;
    const t = `${wa} and ${wb}`;
    if (!wrongSet.has(t)) {
      wrongSet.add(t);
      wrongTexts.push(t);
    }
  }
  return { kind: "missingPair", K, total, correct: correctText, options: shuffle([correctText, ...wrongTexts]) };
}

// ---------- Section 4: True or False (number properties) ----------
const TF_TEMPLATES = [
  () => {
    let a = randInt(2, 9);
    let b = randInt(2, 9);
    while (b === a) b = randInt(2, 9);
    return { text: `The sum of ${a} and ${b} is the same as the sum of ${b} and ${a}.`, correct: "True" };
  },
  () => ({ text: "The sum of any number and 0 is always 0.", correct: "False" }),
  () => ({ text: "The sum of any number and 0 is always that same number.", correct: "True" }),
  () => ({ text: "The sum of two even numbers is always even.", correct: "True" }),
  () => ({ text: "The sum of two even numbers is always odd.", correct: "False" }),
  () => ({ text: "The sum of two odd numbers is always even.", correct: "True" }),
  () => ({ text: "The sum of two odd numbers is always odd.", correct: "False" }),
  () => ({ text: "The sum of an odd number and an even number is always odd.", correct: "True" }),
  () => ({ text: "The sum of an odd number and an even number is always even.", correct: "False" }),
];
function genTrueFalse() {
  const { text, correct } = pick(TF_TEMPLATES)();
  return { kind: "trueFalse", prompt: text, correct, options: ["True", "False"] };
}

// ---------- Section 5: Mental addition, 2-digit + 2-digit (regrouping allowed) ----------
function genMental2Digit() {
  const a = randInt(10, 99);
  const b = randInt(10, Math.min(99, 199 - a));
  const correct = a + b;
  return { kind: "mental2digit", a, b, correct, options: makeOptions(correct, 1, 4, 10) };
}

// ---------- Section 6: Column addition, 3-4 digit numbers ----------
function genBigAdd() {
  const a = randInt(100, 8999);
  const b = randInt(10, Math.min(9999 - a, 8999));
  const correct = a + b;
  return { kind: "bigAdd", a, b, correct, options: makeOptions(correct, 10, 4, 0) };
}

// ---------- Section 7: Expanded form ----------
function genExpandedForm() {
  const n1 = randInt(100, 899);
  const n2 = randInt(100, 899);
  const h1 = Math.floor(n1 / 100), t1 = Math.floor((n1 % 100) / 10), o1 = n1 % 10;
  const h2 = Math.floor(n2 / 100), t2 = Math.floor((n2 % 100) / 10), o2 = n2 % 10;
  const correct = `${h1 * 100} + ${h2 * 100} + ${t1 * 10} + ${t2 * 10} + ${o1} + ${o2}`;
  const d1 = `${h1} + ${h2} + ${t1} + ${t2} + ${o1} + ${o2}`;
  const d2 = `${h1 * 10} + ${h2 * 10} + ${t1 * 10} + ${t2 * 10} + ${o1} + ${o2}`;
  const d3 = `${h1 * 100} + ${h2 * 100} + ${t1} + ${t2} + ${o1} + ${o2}`;
  const optSet = new Set([correct, d1, d2, d3]);
  let options = [...optSet];
  let guard = 0;
  while (options.length < 4 && guard < 20) {
    guard++;
    optSet.add(`${h1 * 100} + ${h2 * 10} + ${t1} + ${t2 * 10} + ${o1} + ${o2}${" ".repeat(guard)}`);
    options = [...optSet];
  }
  const final4 = options.includes(correct) ? options.slice(0, 4) : [correct, ...options.filter((o) => o !== correct)].slice(0, 4);
  return { kind: "expandedForm", n1, n2, correct, options: shuffle(final4) };
}

// ---------- Section 8: Word problems ----------
const NAMES = ["Eric", "Maya", "Liam", "Zoe", "Noah", "Ava", "Priya", "Diego"];
const ITEMS = ["muffins", "cookies", "cupcakes", "pretzels"];
const FRUITS = [
  ["apples", "oranges"],
  ["mangoes", "bananas"],
  ["strawberries", "blueberries"],
];

function genWordProblem() {
  const t = randInt(0, 4);
  if (t === 0) {
    const nameA = pick(NAMES);
    let nameB = pick(NAMES);
    while (nameB === nameA) nameB = pick(NAMES);
    const item = pick(ITEMS);
    const base = randInt(500, 2500);
    const extra = randInt(200, 1500);
    const nameBAmt = base + extra;
    const correct = base + nameBAmt;
    const wrong1 = nameBAmt;
    const wrong2 = base * 2;
    const wrong3 = correct + extra;
    let options = shuffle([...new Set([correct, wrong1, wrong2, wrong3])]);
    while (options.length < 4) options.push(correct + randInt(1, 50) * (options.length + 1));
    return {
      kind: "wordProblem",
      prompt: `${nameA} sold ${base.toLocaleString()} boxes of ${item} during a fair. ${nameB} sold ${extra.toLocaleString()} more boxes than ${nameA}. How many boxes did they sell in all?`,
      correct,
      options: options.slice(0, 4),
    };
  }
  if (t === 1) {
    const [f1, f2] = pick(FRUITS);
    const a = randInt(1000, 6000);
    const b = randInt(500, 3500);
    const correct = a + b;
    return {
      kind: "wordProblem",
      prompt: `There are ${a.toLocaleString()} ${f1} and ${b.toLocaleString()} ${f2} at the store. How many ${f1} and ${f2} are there in all?`,
      correct,
      options: makeOptions(correct, 100, 4, 0),
    };
  }
  if (t === 2) {
    const name = pick(NAMES);
    const a = randInt(20, 90);
    const b = randInt(10, 80);
    const correct = a + b;
    return {
      kind: "wordProblem",
      prompt: `${name} has ${a} pennies in a coin bank and ${b} pennies in a purse. How many pennies does ${name} have in all?`,
      correct,
      options: makeOptions(correct, 1, 4, 1),
    };
  }
  if (t === 3) {
    const name1 = pick(NAMES);
    let name2 = pick(NAMES);
    while (name2 === name1) name2 = pick(NAMES);
    const a = randInt(100, 400);
    const b = randInt(50, 300);
    const correct = a + b;
    return {
      kind: "wordProblem",
      prompt: `${name1} folded ${a} paper cranes. ${name2} folded ${b} more paper cranes than ${name1}. How many paper cranes did ${name2} fold?`,
      correct,
      options: makeOptions(correct, 1, 4, 1),
    };
  }
  const name = pick(NAMES);
  const days = [randInt(10, 40), randInt(10, 40), randInt(10, 40), randInt(10, 40)];
  const correct = days.reduce((s, d) => s + d, 0);
  return {
    kind: "wordProblem",
    prompt: `${name} saved pennies over four days: Day 1 = ${days[0]}, Day 2 = ${days[1]}, Day 3 = ${days[2]}, Day 4 = ${days[3]}. How many pennies did ${name} save in all?`,
    correct,
    options: makeOptions(correct, 1, 4, 1),
  };
}

// ---------- Phase map across the 32-question exam ----------
function generateExamQuestion(qIndex) {
  if (qIndex < 6) return genSum2();
  if (qIndex < 10) return genSum3();
  if (qIndex < 14) return genMissingPair();
  if (qIndex < 17) return genTrueFalse();
  if (qIndex < 21) return genMental2Digit();
  if (qIndex < 25) return genBigAdd();
  if (qIndex < 27) return genExpandedForm();
  return genWordProblem();
}

const SECTION_LABELS = [
  { upto: 6, label: "Making 5 & 10" },
  { upto: 10, label: "Adding Three Numbers" },
  { upto: 14, label: "Complete the Sum" },
  { upto: 17, label: "True or False" },
  { upto: 21, label: "Mental Addition" },
  { upto: 25, label: "Column Addition" },
  { upto: 27, label: "Expanded Form" },
  { upto: 32, label: "Word Problems" },
];
function sectionFor(qIndex) {
  return SECTION_LABELS.find((s) => qIndex < s.upto)?.label || "Review";
}

export default function Chapter2GrandReview() {
  const [screen, setScreen] = useState("start"); // start | play | end
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
  const queueRef = useRef([]);

  useEffect(() => {
    if (screen === "play") {
      setQuestion(queueRef.current[qIndex]);
      setSelected(null);
      setFeedback(null);
    }
  }, [qIndex, screen]);

  const startExam = () => {
    queueRef.current = Array.from({ length: ROUND_LENGTH }, (_, i) => generateExamQuestion(i));
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setCorrectCount(0);
    setStickers([]);
    setQIndex(0);
    setScreen("play");
  };

  const awardSticker = useCallback((count) => {
    if (count % 4 === 0) {
      setStickers((prev) => {
        const idx = prev.length % STICKER_POOL.length;
        return [...prev, STICKER_POOL[idx]];
      });
      setToast("New sticker unlocked!");
      setTimeout(() => setToast(null), 1800);
    }
  }, []);

  const handleAnswer = (opt) => {
    if (feedback) return;
    setSelected(opt);
    const isCorrect = opt === question.correct;
    if (window.Tracker) window.Tracker.answer(isCorrect, "Chapter 2: " + (question.skill || question.type || question.kind || "review"));
    if (isCorrect) {
      setFeedback("correct");
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
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (qIndex + 1 >= ROUND_LENGTH) {
      setScreen("end");
    } else {
      setQIndex((i) => i + 1);
    }
  };

  const cheer = feedback === "correct" ? CHEERS[randInt(0, CHEERS.length - 1)] : TRY_AGAIN[randInt(0, TRY_AGAIN.length - 1)];

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
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
      `}</style>

      {screen === "start" && (
        <div className="parchment rounded-3xl max-w-md w-full p-8 text-center pop relative overflow-hidden">
          <div className="absolute -top-6 -right-6 text-8xl opacity-10 select-none">📜</div>
          <Award className="mx-auto mb-3 float" size={56} color="#8b5a2b" strokeWidth={1.5} />
          <h1 className="text-4xl font-extrabold mb-2" style={{ color: "#3e2a12", letterSpacing: "-0.5px" }}>
            Captain's Chapter 2 Exam
          </h1>
          <p className="text-base mb-4" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
            A full review voyage covering every skill from Chapter 2: Addition Within 10,000 — making 5 and 10, three-number sums, true or false, mental math, column addition, expanded form, and word problems.
          </p>
          <div className="rounded-xl px-4 py-3 mb-6 text-sm font-bold" style={{ background: "#eef6f1", color: "#3d6b58", border: "1px dashed #9cc4ab" }}>
            32 questions · earn points, streaks & stickers
          </div>
          <button
            onClick={startExam}
            className="opt-btn px-8 py-4 rounded-2xl text-xl font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(180deg,#ff8566,#ff6b4f)" }}
          >
            ⚓ Begin the Exam!
          </button>
        </div>
      )}

      {screen === "play" && question && (
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-amber-100/80 text-xs font-bold uppercase tracking-wide">{sectionFor(qIndex)}</p>
          </div>

          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Map size={18} />
              <span>{qIndex + 1} / {ROUND_LENGTH}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Star size={18} fill="#facc15" color="#facc15" />
              <span>{score}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-100 font-bold">
              <Sparkles size={18} color="#5eead4" />
              <span>{streak} streak</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-black/30 mb-4 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(qIndex / ROUND_LENGTH) * 100}%`, background: "linear-gradient(90deg,#facc15,#ff6b4f)" }}
            />
          </div>

          <div className="flex items-center gap-1 mb-4 px-1 min-h-[28px] flex-wrap">
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
              {question.kind === "sum2" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add by making 5 or 10</p>
                  <p className="text-5xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a} + {question.b} = ?</p>
                </>
              )}
              {question.kind === "sum3" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add all three</p>
                  <p className="text-4xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a} + {question.b} + {question.c} = ?</p>
                </>
              )}
              {question.kind === "missingPair" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Complete the sum</p>
                  <p className="text-3xl font-extrabold mb-2" style={{ color: "#3e2a12" }}>? + {question.K} + ? = {question.total}</p>
                  <p className="text-sm" style={{ color: "#6b4f2a" }}>Which pair of numbers completes it?</p>
                </>
              )}
              {question.kind === "trueFalse" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>True or False</p>
                  <p className="text-xl font-extrabold leading-snug" style={{ color: "#3e2a12" }}>{question.prompt}</p>
                </>
              )}
              {question.kind === "mental2digit" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add mentally</p>
                  <p className="text-5xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a} + {question.b} = ?</p>
                </>
              )}
              {question.kind === "bigAdd" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Add. Show your work on paper first!</p>
                  <p className="text-4xl font-extrabold" style={{ color: "#3e2a12" }}>{question.a.toLocaleString()} + {question.b.toLocaleString()} = ?</p>
                </>
              )}
              {question.kind === "expandedForm" && (
                <>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Expanded form</p>
                  <p className="text-xl font-extrabold leading-snug" style={{ color: "#3e2a12" }}>
                    Which expression finds the value of {question.n1} + {question.n2}?
                  </p>
                </>
              )}
              {question.kind === "wordProblem" && (
                <div className="text-left">
                  <p className="text-sm font-bold uppercase tracking-wide mb-2" style={{ color: "#a9772f" }}>Word Problem</p>
                  <p className="text-lg font-bold leading-snug" style={{ color: "#3e2a12" }}>{question.prompt}</p>
                </div>
              )}
            </div>

            <div
              className={
                question.kind === "trueFalse"
                  ? "grid grid-cols-2 gap-3"
                  : question.kind === "expandedForm" || question.kind === "missingPair" || question.kind === "wordProblem"
                  ? "grid grid-cols-1 gap-3"
                  : "grid grid-cols-2 gap-3"
              }
            >
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
                const isLongText = question.kind === "expandedForm" || question.kind === "missingPair" || question.kind === "wordProblem";
                return (
                  <button
                    key={i}
                    disabled={!!feedback}
                    onClick={() => handleAnswer(opt)}
                    className={`opt-btn rounded-xl shadow-md ${isLongText ? "py-3 px-4 text-left text-base font-bold" : "py-4 text-xl font-extrabold"}`}
                    style={{ background: bg, border, color }}
                  >
                    {typeof opt === "number" ? opt.toLocaleString() : opt}
                  </button>
                );
              })}
            </div>

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
                  {qIndex + 1 >= ROUND_LENGTH ? "Claim my medal! 🏅" : "Next question →"}
                </button>
              </div>
            )}
          </div>

          {toast && (
            <div className="fixed top-6 left-1/2 -translate-x-1/2 toast-in z-50">
              <div className="px-5 py-2.5 rounded-full font-bold text-amber-900 shadow-xl flex items-center gap-2" style={{ background: "linear-gradient(90deg,#fde68a,#facc15)" }}>
                <Gem size={18} /> {toast}
              </div>
            </div>
          )}
        </div>
      )}

      {screen === "end" && (
        <div className="parchment rounded-3xl max-w-md w-full p-8 text-center pop relative overflow-hidden">
          <div className="text-7xl mb-2 float">🏅</div>
          <h2 className="text-3xl font-extrabold mb-1" style={{ color: "#3e2a12" }}>Exam Complete!</h2>
          <p className="mb-5" style={{ color: "#6b4f2a", fontFamily: "'Nunito', sans-serif" }}>
            {correctCount === ROUND_LENGTH
              ? "Perfect score! You are ready to ace this chapter test!"
              : correctCount >= ROUND_LENGTH * 0.8
              ? "Excellent work, Captain! You know Chapter 2 inside and out."
              : correctCount >= ROUND_LENGTH * 0.6
              ? "Solid effort! A little more practice and you'll have it mastered."
              : "Good start! Keep practicing — every question makes you stronger."}
          </p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Trophy className="mx-auto mb-1" size={22} color="#b45309" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{score}</p>
              <p className="text-xs font-bold" style={{ color: "#8b6f45" }}>points</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Sparkles className="mx-auto mb-1" size={22} color="#0ea5e9" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{bestStreak}</p>
              <p className="text-xs font-bold" style={{ color: "#8b6f45" }}>best streak</p>
            </div>
            <div className="rounded-2xl p-3" style={{ background: "#fff7e6", border: "2px solid #e8c468" }}>
              <Anchor className="mx-auto mb-1" size={22} color="#166534" />
              <p className="text-2xl font-extrabold" style={{ color: "#3e2a12" }}>{correctCount}/{ROUND_LENGTH}</p>
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

          <button
            onClick={startExam}
            className="opt-btn px-8 py-4 rounded-2xl text-lg font-bold text-white shadow-lg inline-flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(180deg,#ff8566,#ff6b4f)" }}
          >
            <RotateCcw size={20} /> Retake the Exam
          </button>
        </div>
      )}
    </div>
  );
}
