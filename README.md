# 🎒 Kids Learning Apps

A collection of fun, interactive learning apps for **elementary students**.
Each app lives in its own folder and can run on its own — no installation needed,
just open the app's `index.html` in a web browser.

## Apps

The [Learning Hub](./index.html) is organized into a **🎉 Fun Zone** (games & rewards for
everyone) and **📚 Learning Apps** grouped by age level, with filter buttons
(**🐣 Kindergarten** / **🎒 Elementary**).

### 👋 Kid Login

The first time you open the Hub, a friendly **"Who's learning today?"** screen asks the
child to make a learner — pick a name, a buddy avatar, and tap whether they are a
**🐣 Kindergartener** or a **🎒 3rd Grader**. The Hub then greets them by name and
automatically shows the right apps for their grade. Tap **🔄 Switch Learner** any time to
change kids (multiple learners are supported). It's all saved locally — no accounts, no
internet. A logged-in learner only ever sees their own grade's apps.

**🗣️ Voice:** next to the learner's name, pick the read-aloud voice and slide the speed and
pitch, then tap ▶ Try it. The choice is saved per learner and used by **every** app
(`js/voice.js`, loaded on each page right after `profile-store.js`). Speed and pitch scale
each app's own values, so slow "sound it out" reading stays slower than normal speech. On
the Android app the list shows the phone's own English voices.

**Separate progress per learner:** each child gets their own scores, stickers and trophies —
siblings' progress never mixes, even though they share one browser. (The very first learner
you create inherits any progress from before login existed, so nothing is lost.) The **🎁
Prize Wheel tickets are shared** as one family pot, so any child's tickets can be spent on
the wheel.

### 🎒 On every app page

`js/kidbar.js` (with `js/dollars.js`) adds the same three things to every app:
- **🏠 Home**: a floating button back to the Hub whenever the page's own Home link is missing or scrolled out of sight.
- **🎒 My Pocket**: this app's stickers, every sticker from every other app, and the **Dollar Bank** (the $1 challenges here and every dollar earned).
- **💵 A real dollar for a really hard win**: finishing a whole phase or step, passing a Phase Check, a no-mistake run. Everyday wins still earn points and stickers. A big celebration pops up, and grown-ups hand the dollar over and mark it paid in Admin → 💵 Dollars.

### ⚙️ Admin (for grown-ups)

One [Admin page](./admin/index.html) covers **every app** (the **⚙️ Admin** button, top-right of
the Hub; guarded by a grown-up math question, or a PIN you set). Tabs:

| Tab | What it shows |
| --- | --- |
| 📊 Overview | Learning time, questions answered, accuracy, finished lessons, active days, streak (each vs. the previous period) + charts: time per day by subject, accuracy per day, most-used apps, a weekday × hour heatmap, subject balance and weakest skills |
| 👧 Students | **Add new students** (name, avatar, grade), edit, remove, set who is logged in, private notes |
| 📈 Progress | App-by-app completion (from each app's saved progress), time, answers, accuracy, last used, plus a per-skill breakdown |
| 💡 Suggestions | What each child should practise next (weak skills, ready-for-harder, untried apps, best time of day, near-finish nudges) and **ideas to improve the apps** (too hard/too easy, kids leaving quickly, favourites to grow, content that's run out) |
| 🔮 Forecast | Weekly time and accuracy with a dashed 4-week trend forecast, and estimated finish dates per app |
| 🧾 Activity Log | The full audit trail — every session, answer, finish, score change, login and admin change — filterable, searchable, exportable to CSV |
| 💵 Dollars | The **Dollar Bank**: every real $1 a child earned for a really hard win (a whole phase, a Phase Check, a no-mistake run…), with **Mark paid**, plus the list of $1 challenges per app |
| 💾 Data | Database size, **backup / restore** (JSON), trimming old events, clearing history, admin PIN |

Every chart has a "Show data table" view and works in light and dark mode.

**The database.** Activity is stored in **IndexedDB** — the database built into every browser.
It works offline and from `file://`, needs no server or install, and nothing is uploaded
(database `KidsLearningHub`; tables `events`, `students`, `meta`). Code: `js/activitydb.js`.
Each app page loads `js/tracker.js`, which records sessions and active time (idle time
isn't counted), every answered question (right/wrong + skill), finished lessons/stories/levels
and every change to the app's saved points/trophies/stickers. Download a backup from the
Data tab now and then: clearing the browser's site data would erase it.

**Updates never erase data.** New versions of any app (and new APKs) keep every student,
their progress and the activity log. Database changes are additive only, and the page asks the
browser for persistent storage, so phones and tablets don't clear it when space runs low.
Each device (PC browser, phone, tablet) keeps its **own** database. To move or combine data,
use Admin → Data → Download backup, then Restore on the other device. On Android, backups
are saved to `Downloads/KidsLearningHub`. The only way to wipe a device is Admin → Data →
**Reset everything…**, which saves a backup file first.

### 📱 Android app (APK)

`apk/KidsLearningHub.apk` is the whole hub packaged as an Android app (Android 7+, phones and
tablets), fully offline. It's rebuilt automatically after every change (a Claude Code Stop hook
runs `node android/build-apk.mjs --if-changed`), or by hand with `node android/build-apk.mjs`.
Each build bumps the version (shown in the Hub footer on the phone) and installs **over** the
previous one, keeping the kids' logins, progress and activity log. Details: [android/README.md](./android/README.md).

### 🎉 Fun Zone (for everyone)

| App | Folder | What it is |
| --- | --- | --- |
| 🎮 **Free Games Arcade** | [`arcade/`](./arcade) | Quick educational mini-games (Quick Math, Word Scramble, Memory Match, Odd One Out) that earn 🎟️ tickets. |
| 🎁 **Rewards Center** | [`rewards/`](./rewards) | Gathers every sticker & trophy from all apps in one place, plus a **Prize Wheel** and collectible **critters**. Earning cross-app **hub badges** grants bonus tickets. |

_The apps all share the browser's local storage (as `file://` pages), so the Rewards
Center can total up rewards from every app, and tickets earned in the Arcade can be spent
on the Prize Wheel._

### 🐣 Kindergarten (ages 4–6)

| App | Folder | What it teaches |
| --- | --- | --- |
| 🐣 **Little Learners** | [`kinder/`](./kinder) | A game-first app for the youngest learners — letters, numbers, colors, shapes, matching, **patterns & odd-one-out**. Picture-and-sound driven with stars and trophies, no reading required. Includes a **☀️ Summer School** to get ready for Kindergarten (beginning sounds, reading words, sight words, counting & finishing sentences). |
| 🏎️ **Learning Speedway** | [`speedway/`](./speedway) | A **car game** for the littlest learners — Rev the race car drives a 3-lane road and the child steers into the right **gate** to answer. **16 roads** across 🔤 English Street (letters, upper/lowercase, beginning sounds, rhymes, sight words, reading CVC words, alphabet order) and 🔢 Math Motorway (numerals, counting, shapes, colors, adding, taking away, bigger/smaller, number order, patterns), plus a free-drive **🌈 Highway Dash**. Finish a road, win one of **17 collectible cars**. |
| 🦜 **Phonics Pals** | [`phonics/`](./phonics) | A **step-by-step learn-to-read path** for Kindergarten. Step 1 **Letter Sounds** (4 lessons covering all 26 letters: meet the letters, sound game, picture quiz). Step 3 **Sight Words** (4 lessons: meet the words, word game, and 🧩 build-a-sentence from word tiles, read back to Echo). Step 2 **Story Books**: read-aloud phonics storybooks built from the child's school readers, **5 books** (Al – short o, Tim – short u, The Jet – short e, plus two bonus stories for short a and short i). Each book: a 🔤 **Sound Warm-up**, a 📖 **picture-book reader** (hand-drawn SVG scenes) where **Echo the parrot listens through the mic**, lights each word green as it's read and gently practises any skipped or swapped word, then a ❓ **story quiz**. Points, page stars, book + perfect-reading **stickers**, trophies and a Prize Wheel ticket per book. |
| 🎓 **Homeschool Academy** | [`homeschool/`](./homeschool) | Numbered lessons **1, 2, 3…** with Ziggy the robot 🤖 (**20 lessons per track**). The **Kindergarten** tracks teach Math (counting, shapes, adding, ways-to-make-10, doubles, skip counting) & English (letters, sounds, sight words, sh/ch, capitals, question words). _Also has Grade 3 tracks — see below._ |

### 🎒 Elementary (grades 1–4)

| App | Folder | What it teaches |
| --- | --- | --- |
| 🔍 **Fun Facts Explorer** | [`funfacts/`](./funfacts) | Amazing facts about animals, plants, the universe, the human body, oceans & dinosaurs — with flashcards, read-aloud, and quizzes. |
| 🚀 **Grammar Galaxy** | [`grammar/`](./grammar) | English grammar — 13 topics incl. nouns, verbs, adjectives, punctuation, **synonyms & antonyms** — with lesson cards, quizzes, a Word Detective game, and 10 **Superhero Story Rescue** reading-comprehension stories. |
| 🗺️ **Grammar Treasure Hunt** | [`treasure/`](./treasure) | A pirate treasure-map adventure — sail an island route and solve a grammar clue at each stop to dig up the treasure, collecting gold coins and trophies. |
| 🦉 **Reading Trail** | [`reading/`](./reading) | A stage-by-stage learn-to-read journey with Ollie the Owl — letter sounds, syllable clapping & chunking, blending, sight words, fluency and story comprehension, with points, stickers and trophies. |
| 🚀 **Times Table Takeoff** | [`multiply/`](./multiply) | A summer math mission for incoming 3rd graders — master the multiplication facts to 12×12 in four phases (skip counting, learn a table, fact practice, fluency blast-off), built from the teacher's summer letter. |
| 🎓 **Homeschool Academy** | [`homeschool/`](./homeschool) | A numbered lesson path (1, 2, 3…) hosted by Ziggy the robot 🤖 (**20 lessons per track**). The **Grade 3** tracks cover Math (place value, regrouping, times tables to 12, division, fractions, elapsed time, bar graphs, multi-step problems) & English (nouns, verbs, synonyms, prefixes, contractions, sentence parts, figurative language, reading). Earns points, collectible stickers, badges & trophies. _Also has Kindergarten tracks — see above._ |
| 🧭 **Clue Island** | [`clueisland/`](./clueisland) | A **drag-the-explorer treasure-map adventure** for **reading comprehension** — drag Mira the Mapmaker along a dashed trail across **5 island maps**, where every stop is locked by a short story. Read the passage, solve the clue, and the trail opens towards the ❌. **30 passages, 60 questions, 15 comprehension skills** (main idea, inference, cause & effect, vocabulary in context, author's purpose, fact vs opinion, summarising and more) telling one continuous story. A wrong answer keeps the passage on screen and points to *where* the answer is hiding. |
| 🏁 **Turbo Grand Prix** | [`grandprix/`](./grandprix) | A **car game for older kids** — race three rivals through an **8-race championship season**. Correct answers push your car down the track, fast answers earn a speed bonus and streaks trigger 🔥 turbo. Covers times tables, division with remainders, place value & rounding, fractions, parts of speech, prefixes/suffixes, punctuation, homophones, word problems, elapsed time, area & figurative language. Spend 🔧 parts in the **Garage** on engine, tire and nitro upgrades, plus pressure-free **Time Trials**. |
| 🚀 **Read-Aloud Rocket** | [`readrocket/`](./readrocket) | **Phased read-aloud lessons for 3rd grade up to 4th-grade level** (6 phases × 4 lessons + a Phase Check each; Phases 1–2 built). Word Lab with chunked long words, stories read out loud to **Nova the robot**, who marks every word and practises the tricky ones, a ⚡ **reading-speed meter** (words a minute vs. the phase goal), Check-ups with “why” explanations, and ✏️ **Write It**: answer in your own sentences, checked kindly. |
| ✏️ **Sentence Studio** | [`writestudio/`](./writestudio) | **A 3rd-grade writing course with Penny the Pencil**: 10 lessons in 3 levels, from *what is a sentence* to end marks, who + did what, stretching sentences, juicy describing words, glue words, Fix-It Doctor editing, hamburger paragraphs, how-to writing and an original story. Each lesson has 💡 Learn It, 🎮 Practice (build sentences from tiles, pick end marks, glue sentences, order paragraphs) and ✏️ Write It. The WritePad offers a word bank, *say it first* speech-to-text, read-back, and **two stars and a wish** feedback with *Show me* fixes. Plus ✨ Free Write with Story Sparks and a 📓 Writing Book. |
| 🔍 **Reading Detectives** | [`detectives/`](./detectives) | A **Grade 3 reading-comprehension** journey with Roco the Raccoon 🦝 — 15 story "cases" from beginner to expert (characters, main idea, inferences, cause & effect, context clues, author's purpose, problem/solution, text features, theme & more), with detective ranks, stickers, trophies, a Detective Kit and a **Clue Hunt** vocabulary game. |

### 🧳 Adventure Pack

Imported from `kids-learning-apps.zip` — see [`adventurepack/README.md`](./adventurepack/README.md).

| App | Folder | Grade | What it teaches |
| --- | --- | --- | --- |
| 📖 **Reading Adventures** | [`adventurepack/readingadventures/`](./adventurepack/readingadventures) | KG & G3 | 30 character stories (15 per grade) with tricky words, quizzes, stickers & a 🚗 car-sticker garage. |
| 🏴‍☠️ **Pirate Math Quest** | [`adventurepack/piratemath/`](./adventurepack/piratemath) | G3 | Rounding, addition, mental math, science & communities islands + a Chapter 2 review exam. |
| 📓 **Subtraction Notebook Quest** | [`adventurepack/subtraction/`](./adventurepack/subtraction) | G3 | Multi-digit subtraction with regrouping, tricky wording & word problems, plus printable worksheets. |
| 📜 **Why We Have the Bill of Rights** | [`adventurepack/billofrights/`](./adventurepack/billofrights) | G3 | A guided history reading on author's purpose, compare & contrast and cause & effect. |

_More apps coming soon — each will be added under its age group as its own folder._

## Design principles

- **Kid-first UI/UX** — big buttons, bright colors, friendly fonts, playful animations
- **No setup** — plain HTML/CSS/JS, works offline by opening `index.html`
- **Encouraging** — positive feedback, star rewards, and progress that's saved locally
- **Responsive** — works on phones, tablets, laptops, and classroom whiteboards
