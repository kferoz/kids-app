import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import PirateMathQuest from "./pirate-math-quest.jsx";
import Chapter2GrandReview from "./chapter2-grand-review.jsx";

/* Kids Learning Hub wrapper: Chapter 1 (the quest) and Chapter 2 (grand review)
   are two separate components; a floating switcher picks one via the URL hash. */
function currentChapter() { return location.hash === "#ch2" ? "ch2" : "ch1"; }

function App() {
  const [ch, setCh] = useState(currentChapter());
  useEffect(() => {
    const on = () => setCh(currentChapter());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return (
    <>
      {ch === "ch2" ? <Chapter2GrandReview key="ch2" /> : <PirateMathQuest key="ch1" />}
      <nav className="hub-switch" aria-label="Chapters">
        <a href="../../index.html" title="Back to the Learning Hub">🎒 Hub</a>
        <a href="#ch1" className={ch === "ch1" ? "on" : ""}>🏴‍☠️ Chapter 1</a>
        <a href="#ch2" className={ch === "ch2" ? "on" : ""}>📜 Ch 2 Review</a>
      </nav>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
