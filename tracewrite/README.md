# 🖍️ Write & Trace (Kindergarten handwriting)

Scribbles the Crayon teaches a Kindergartener to write with a finger on the screen: warm-up lines first, then letters, then first words. It follows Phonics Pals' letter order (s a t p i n first), so the letters a child can say are the letters they learn to write.

Open `index.html`. No build step, works offline.

## Phases

| Phase | Name | What | Status |
|---|---|---|---|
| 1 | Warm-up & First Letters | Wiggle Warm-up (lines, slant, circle, zig-zag, bunny hops) · s a t · p i n · My First Words | ✅ built |
| 2 | Round Letters | m d g o c k | coming soon |
| 3 | Tall Letters | e u r h b f | coming soon |
| 4 | Tricky Letters | l j v w x y z q | coming soon |
| 5 | Capitals & My Name | | coming soon |
| 6 | My First Sentences | capital, finger spaces, period | coming soon |

Each lesson has 3 steps:
1. **👀 Watch & Trace**: Scribbles draws the letter first (a crayon moves along the path), then the child traces dotted strokes. A numbered green dot shows where each stroke starts, with an arrow for direction.
2. **✍️ Your Turn**: the same shapes with only a faint shadow, then one round **all by myself** with no guide at all.
3. **🧩 Picture Words**: hear a word, spell it with letter tiles, then write it on the lines. The warm-up lesson has **🎨 Magic Drawing** instead.

## How tracing is checked (`js/tracepad.js`)

Shapes are SVG paths on 4 handwriting lines: top 20, dashed middle 60, red base 100, tail 130. They live in `SHAPES` in `js/data.js`.

- A finger stroke counts when it covers about 70% of the guide stroke and stays near the letter. Scribbling over the box is refused.
- One stroke may finish several guide strokes, like writing "a" without lifting. It only counts if it is long enough. A line that only crosses another stroke does not finish it (the stem of t through its crossbar).
- Kind feedback: wrong start or direction gets a "start at the green dot" tip but still counts. Two misses in a row replay the demo.

`tracepad.js` and `css/tracepad.css` are shared with `arabic/`. Keep the copies identical.

## Data

- Saved per learner (`tw_` keys): `tw_lessons`, `tw_points`, `tw_stickers`, `tw_trophies`, `tw_clean` (perfect traces), `tw_built` (words spelled).
- Hub tile: Kindergarten. Admin subject: Grammar & Writing. Also listed in the Rewards Center.
- To add a phase, add letter shapes to `SHAPES` and `LETTER_SAY`, give the phase `lessons`, and raise the Admin total.
