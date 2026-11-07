# 📄 Printable Worksheets (Pre-K – Grade 5)

Printable worksheets for every grade and Academy subject, each with an answer key. Open them from
the **📄 Worksheets** card in My Academy, or the **📄 Worksheet** button on any Academy unit.
**🖨️ Print / Save PDF** opens the print dialog; choose *Save as PDF* to download. In the Android
app this uses `AndroidBridge.printPage` (system print → Save as PDF), because WebView has no
`window.print()`.

All sheets are original, built from the hub's own syllabus content (no third-party worksheets
are copied), so they line up with the Academy units: US Common Core / NGSS / C3 spine, UK National
Curriculum and Sweden's Lgr22 (`js/syllabus.js`).

| Kind | Where it comes from | Count |
|---|---|---|
| Unit worksheet | `academy/lessons/<grade>-<subject>.js`: Remember box, Parts A–D (circle, true/false, tick two, match), Part E think-and-write (draw it for Pre-K/KG), "I can" stars | 278 (every unit) |
| Whole workbook | every unit of one grade + subject, cover page, keys at the back | 42 |
| Math drill | `js/drills.js` generators, new numbers per version (`&v=`), US CCSS code on each | 48 (4–9 per grade) |
| Spelling | School Spelling Bee lists G1–G5 (`spellingbee/js/words.js`), 5 sheets of 10 words: look-say-cover-write-check, word-bank sentences, unscramble | 25 |
| Handwriting | 4-line guides, Andika font, letters Aa–Zz + words (Pre-K, KG, G1) | 7 |
| From your grown-up | AdHoc topics (Admin → 🎓 Academy) and Spelling Bee word sets (Admin → 🐝) | any |

**Versions:** `&v=n` seeds the shuffle (choices, word order) or the drill numbers, so a printed
sheet and its key always match; 🔀 makes a new version. `&nokey=1` leaves the key page out.

**Scores:** after checking a sheet a grown-up can type the score; it goes to `Tracker.complete`
(Admin, RewardKit) and `ws_log` (per learner; prints are logged too). Admin's Progress card shows
sheets printed and the average score.

`node test/worksheets.js` builds 25 versions of every drill and re-computes the answers.
