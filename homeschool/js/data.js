/* ============================================================
   Homeschool Academy — Curriculum Data
   ------------------------------------------------------------
   A numbered, unlock-in-order lesson path for Math & English at
   two levels: Kindergarten (ages 4–6) and Grade 3.

   Four TRACKS, each with numbered LESSONS (1, 2, 3 …). Every
   lesson is a list of STEPS. A step has a kind `k`:

     teach : { k:'teach', emoji, title, text, say? }
             Ziggy the robot teaches. Just tap "Got it!".

     pick  : { k:'pick', q, choices:[..], answer, say? }
             Multiple choice. `q` & `choices` may contain emoji.
             `answer` = index of the correct choice (0-based).

     count : { k:'count', emoji, n, say? }
             Shows n copies of emoji and asks "How many?".
             Numeric choices are generated automatically.

     type  : { k:'type', q, answer, say?, hint? }
             Type the answer (numbers or a word). Compared after
             trim + lowercase, so "3" or "three" style answers work
             only if listed — keep answers exact.

   Each lesson also carries a `sticker` (collectible emoji) and a
   short `title`/`emoji`. Finishing every lesson in a track earns
   that track's graduation BADGE.
   ============================================================ */

/* ---------- KINDERGARTEN · MATH ---------- */
const KG_MATH = [
  {
    n: 1, title: "Numbers 1 to 5", emoji: "1️⃣", sticker: "🍎",
    steps: [
      { k: "teach", emoji: "🔢", title: "Meet 1, 2, 3, 4, 5",
        text: "Numbers help us count things! Let's count together: one, two, three, four, five.",
        say: "Numbers help us count things. One, two, three, four, five." },
      { k: "count", emoji: "🍎", n: 3, say: "How many apples?" },
      { k: "count", emoji: "⭐", n: 5, say: "How many stars?" },
      { k: "pick", q: "Tap the group with <b>2</b> hearts.",
        choices: ["❤️", "❤️❤️", "❤️❤️❤️❤️"], answer: 1,
        say: "Tap the group with two hearts." },
      { k: "count", emoji: "🐟", n: 4, say: "How many fish?" }
    ]
  },
  {
    n: 2, title: "Numbers 6 to 10", emoji: "🔟", sticker: "🐝",
    steps: [
      { k: "teach", emoji: "✋", title: "Bigger Numbers",
        text: "After five comes six, seven, eight, nine, ten! Ten is all your fingers.",
        say: "After five comes six, seven, eight, nine, ten. Ten is all your fingers." },
      { k: "count", emoji: "🐝", n: 6, say: "How many bees?" },
      { k: "count", emoji: "🎈", n: 8, say: "How many balloons?" },
      { k: "count", emoji: "🌸", n: 10, say: "How many flowers?" },
      { k: "pick", q: "Which shows <b>7</b> stars?",
        choices: ["⭐⭐⭐⭐⭐", "⭐⭐⭐⭐⭐⭐⭐", "⭐⭐⭐"], answer: 1,
        say: "Which shows seven stars?" }
    ]
  },
  {
    n: 3, title: "Count and Match", emoji: "🧮", sticker: "🐢",
    steps: [
      { k: "teach", emoji: "👀", title: "Count Carefully",
        text: "Touch each thing one time as you count. Don't skip and don't count twice!",
        say: "Touch each thing one time as you count. Don't skip, and don't count twice." },
      { k: "count", emoji: "🐢", n: 7, say: "How many turtles?" },
      { k: "count", emoji: "🍪", n: 9, say: "How many cookies?" },
      { k: "pick", q: "How many? 🦆🦆🦆🦆🦆🦆",
        choices: ["5", "6", "7"], answer: 1, say: "How many ducks?" },
      { k: "count", emoji: "🚗", n: 2, say: "How many cars?" }
    ]
  },
  {
    n: 4, title: "More or Fewer", emoji: "⚖️", sticker: "🐘",
    steps: [
      { k: "teach", emoji: "⚖️", title: "More and Fewer",
        text: "MORE means a bigger group. FEWER means a smaller group. Count both, then compare!",
        say: "More means a bigger group. Fewer means a smaller group. Count both, then compare." },
      { k: "pick", q: "Which group has <b>MORE</b>?",
        choices: ["🍎🍎", "🍎🍎🍎🍎"], answer: 1,
        say: "Which group has more apples?" },
      { k: "pick", q: "Which group has <b>FEWER</b>?",
        choices: ["🐟🐟🐟🐟🐟", "🐟🐟"], answer: 1,
        say: "Which group has fewer fish?" },
      { k: "pick", q: "Which has <b>MORE</b>?",
        choices: ["⭐⭐⭐", "⭐⭐⭐⭐⭐⭐"], answer: 1,
        say: "Which has more stars?" },
      { k: "pick", q: "Are these the <b>SAME</b>? 🐱🐱🐱 and 🐶🐶🐶",
        choices: ["Yes, same! ✅", "No 🚫"], answer: 0,
        say: "Are these the same? Three cats and three dogs." }
    ]
  },
  {
    n: 5, title: "What Comes Next?", emoji: "➡️", sticker: "🚂",
    steps: [
      { k: "teach", emoji: "🚂", title: "Number Order",
        text: "Numbers go in order like a train: 1, 2, 3, 4, 5… Each one is one bigger!",
        say: "Numbers go in order like a train. One, two, three, four, five. Each one is one bigger." },
      { k: "pick", q: "1, 2, 3, __ ?  What comes next?",
        choices: ["4", "6", "2"], answer: 0, say: "One, two, three, what comes next?" },
      { k: "pick", q: "5, 6, 7, __ ?",
        choices: ["9", "8", "5"], answer: 1, say: "Five, six, seven, what comes next?" },
      { k: "pick", q: "Which number is <b>missing</b>? 1, __, 3",
        choices: ["2", "4", "5"], answer: 0, say: "Which number is missing? One, blank, three." },
      { k: "pick", q: "8, 9, __ ?",
        choices: ["7", "10", "11"], answer: 1, say: "Eight, nine, what comes next?" }
    ]
  },
  {
    n: 6, title: "Fun with Shapes", emoji: "🔷", sticker: "⭐",
    steps: [
      { k: "teach", emoji: "🔷", title: "Shapes All Around",
        text: "A circle is round ⭕. A square has 4 equal sides ⬛. A triangle has 3 sides 🔺.",
        say: "A circle is round. A square has four equal sides. A triangle has three sides." },
      { k: "pick", q: "Tap the <b>circle</b>.",
        choices: ["🔺", "⭕", "⬛"], answer: 1, say: "Tap the circle." },
      { k: "pick", q: "Tap the <b>triangle</b>.",
        choices: ["🔺", "⭕", "⬛"], answer: 0, say: "Tap the triangle." },
      { k: "pick", q: "Tap the <b>square</b>.",
        choices: ["⭕", "⬛", "🔺"], answer: 1, say: "Tap the square." },
      { k: "pick", q: "A 🍕 slice looks most like a…",
        choices: ["Circle ⭕", "Triangle 🔺", "Square ⬛"], answer: 1,
        say: "A pizza slice looks most like which shape?" }
    ]
  },
  {
    n: 7, title: "Adding is Fun", emoji: "➕", sticker: "🎁",
    steps: [
      { k: "teach", emoji: "➕", title: "Putting Together",
        text: "Adding means putting groups together to make more. 2 🍎 and 1 more 🍎 makes 3 🍎!",
        say: "Adding means putting groups together to make more. Two apples and one more apple makes three apples." },
      { k: "pick", q: "🍎🍎 ➕ 🍎 = ?",
        choices: ["2", "3", "4"], answer: 1, say: "Two apples plus one apple equals?" },
      { k: "pick", q: "⭐ ➕ ⭐⭐ = ?",
        choices: ["3", "2", "4"], answer: 0, say: "One star plus two stars equals?" },
      { k: "pick", q: "🐟🐟 ➕ 🐟🐟 = ?",
        choices: ["3", "4", "5"], answer: 1, say: "Two fish plus two fish equals?" },
      { k: "pick", q: "3 ➕ 2 = ?",
        choices: ["4", "5", "6"], answer: 1, say: "Three plus two equals?" }
    ]
  },
  {
    n: 8, title: "Taking Away", emoji: "➖", sticker: "🏅",
    steps: [
      { k: "teach", emoji: "➖", title: "Taking Away",
        text: "Subtracting means taking some away, so you have fewer. 3 🍪 take away 1 🍪 leaves 2 🍪.",
        say: "Subtracting means taking some away, so you have fewer. Three cookies take away one cookie leaves two cookies." },
      { k: "pick", q: "🍪🍪🍪 take away 🍪 = ?",
        choices: ["1", "2", "3"], answer: 1, say: "Three cookies take away one cookie equals?" },
      { k: "pick", q: "⭐⭐⭐⭐⭐ take away ⭐⭐ = ?",
        choices: ["3", "4", "2"], answer: 0, say: "Five stars take away two stars equals?" },
      { k: "pick", q: "4 ➖ 4 = ?",
        choices: ["0", "1", "4"], answer: 0, say: "Four take away four equals? All gone!" },
      { k: "pick", q: "5 ➖ 1 = ?",
        choices: ["3", "4", "5"], answer: 1, say: "Five take away one equals?" }
    ]
  },
  {
    n: 9, title: "Teen Numbers 11–20", emoji: "🔢", sticker: "🦖",
    steps: [
      { k: "teach", emoji: "🔢", title: "The Teen Numbers",
        text: "After ten come the teen numbers: 11, 12, 13… all the way to 20! Each one is just one bigger.",
        say: "After ten come the teen numbers. Eleven, twelve, thirteen, all the way to twenty. Each one is just one bigger." },
      { k: "pick", q: "What number comes right after <b>10</b>?",
        choices: ["11", "13", "9"], answer: 0, say: "What number comes right after ten?" },
      { k: "pick", q: "Count on: 11, 12, 13, __ ?",
        choices: ["14", "16", "10"], answer: 0, say: "Eleven, twelve, thirteen, what comes next?" },
      { k: "pick", q: "Tap the number <b>fifteen</b>.",
        choices: ["15", "51", "5"], answer: 0, say: "Tap the number fifteen." },
      { k: "pick", q: "What comes after <b>19</b>?",
        choices: ["18", "20", "21"], answer: 1, say: "What comes after nineteen?" }
    ]
  },
  {
    n: 10, title: "Counting On", emoji: "🐾", sticker: "🐙",
    steps: [
      { k: "teach", emoji: "🐾", title: "Keep Counting",
        text: "Counting on means start at a number and keep going. Start at 5, then say 6, 7, 8!",
        say: "Counting on means start at a number and keep going. Start at five, then say six, seven, eight." },
      { k: "pick", q: "Count on from 6: 7, 8, __ ?",
        choices: ["9", "6", "10"], answer: 0, say: "Count on from six. Seven, eight, what comes next?" },
      { k: "pick", q: "Count on from 12: 13, 14, __ ?",
        choices: ["15", "11", "20"], answer: 0, say: "Thirteen, fourteen, what comes next?" },
      { k: "pick", q: "What is <b>1 more</b> than 9?",
        choices: ["8", "10", "19"], answer: 1, say: "What is one more than nine?" },
      { k: "pick", q: "What is <b>1 more</b> than 14?",
        choices: ["13", "15", "16"], answer: 1, say: "What is one more than fourteen?" }
    ]
  },
  {
    n: 11, title: "Fun Patterns", emoji: "🔁", sticker: "🦋",
    steps: [
      { k: "teach", emoji: "🔁", title: "Patterns Repeat",
        text: "A pattern repeats over and over. 🔴🔵🔴🔵 — red, blue, red, blue. What comes next? Blue… no, red!",
        say: "A pattern repeats over and over. Red, blue, red, blue. Look at what repeats to find what comes next." },
      { k: "pick", q: "🔴🔵🔴🔵 __ ?  What comes next?",
        choices: ["🔴", "🟢", "🟡"], answer: 0, say: "Red, blue, red, blue. What comes next?" },
      { k: "pick", q: "🌞🌙🌞🌙 __ ?",
        choices: ["🌞", "⭐", "🌈"], answer: 0, say: "Sun, moon, sun, moon. What comes next?" },
      { k: "pick", q: "🐶🐱🐶🐱 __ ?",
        choices: ["🐭", "🐶", "🐟"], answer: 1, say: "Dog, cat, dog, cat. What comes next?" },
      { k: "pick", q: "🔺🔺🔵🔺🔺🔵 __ ?",
        choices: ["🔺", "🔵", "⭐"], answer: 0, say: "Triangle, triangle, circle, over and over. What comes next?" }
    ]
  },
  {
    n: 12, title: "Sort & Match", emoji: "🗂️", sticker: "🐢",
    steps: [
      { k: "teach", emoji: "🗂️", title: "Things That Go Together",
        text: "We can sort things into groups by color, shape, or kind. Things that match go together!",
        say: "We can sort things into groups by color, shape, or kind. Things that match go together." },
      { k: "pick", q: "Which one does <b>NOT</b> belong? 🍎 🍎 🍎 🚗",
        choices: ["🍎", "🚗"], answer: 1, say: "Which one does not belong with the apples?" },
      { k: "pick", q: "Which is the <b>SAME</b> as 🔵?",
        choices: ["🔴", "🔵", "🟢"], answer: 1, say: "Which one is the same as the blue circle?" },
      { k: "pick", q: "Which does <b>NOT</b> belong? 🐶 🐱 🐰 🌳",
        choices: ["🐶", "🌳", "🐰"], answer: 1, say: "Which one does not belong with the animals?" },
      { k: "pick", q: "Which one is <b>red</b>?",
        choices: ["🔵", "🟢", "🔴"], answer: 2, say: "Which one is red?" }
    ]
  },
  {
    n: 13, title: "Where Is It?", emoji: "📍", sticker: "🐧",
    steps: [
      { k: "teach", emoji: "📍", title: "Position Words",
        text: "Position words tell WHERE something is: on, in, under, over, next to, above, below.",
        say: "Position words tell where something is. On, in, under, over, next to, above, below." },
      { k: "pick", q: "The ball sits on <b>top</b> of the box. It is…",
        choices: ["on", "under", "in"], answer: 0, say: "The ball sits on top of the box. It is?" },
      { k: "pick", q: "🐱 is <b>inside</b> the basket. It is…",
        choices: ["under", "in", "over"], answer: 1, say: "The cat is inside the basket. It is?" },
      { k: "pick", q: "The dog is <b>below</b> the table. It is…",
        choices: ["under", "on", "above"], answer: 0, say: "The dog is below the table. It is?" },
      { k: "pick", q: "Which word means <b>up high</b>?",
        choices: ["below", "above", "under"], answer: 1, say: "Which word means up high?" }
    ]
  },
  {
    n: 14, title: "Big & Small", emoji: "📏", sticker: "🐘",
    steps: [
      { k: "teach", emoji: "📏", title: "Compare Sizes",
        text: "We compare sizes: tall or short, big or small, long or short, heavy or light.",
        say: "We compare sizes. Tall or short, big or small, long or short, heavy or light." },
      { k: "pick", q: "Which is <b>BIGGER</b>?",
        choices: ["🐜", "🐘"], answer: 1, say: "Which is bigger, the ant or the elephant?" },
      { k: "pick", q: "Which is <b>TALLER</b>?",
        choices: ["🌳", "🌱"], answer: 0, say: "Which is taller, the tree or the sprout?" },
      { k: "pick", q: "Which is <b>LONGER</b>?",
        choices: ["🚂", "🚗"], answer: 0, say: "Which is longer, the train or the car?" },
      { k: "pick", q: "Which is <b>HEAVIER</b>?",
        choices: ["🪶", "🪨"], answer: 1, say: "Which is heavier, the feather or the rock?" }
    ]
  },
  {
    n: 15, title: "Math Star Review", emoji: "🌟", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "🌟", title: "Show What You Know!",
        text: "Wow, you learned so much math! Let's do a fun mix to show off everything you can do.",
        say: "Wow, you learned so much math! Let's do a fun mix to show off everything you can do." },
      { k: "count", emoji: "⭐", n: 7, say: "How many stars?" },
      { k: "pick", q: "3 ➕ 4 = ?",
        choices: ["6", "7", "8"], answer: 1, say: "Three plus four equals?" },
      { k: "pick", q: "Which group has <b>FEWER</b>? 🍎🍎🍎🍎 or 🍎🍎",
        choices: ["🍎🍎🍎🍎", "🍎🍎"], answer: 1, say: "Which group has fewer apples?" },
      { k: "pick", q: "🔺🔺🔵🔺🔺🔵 __ ?",
        choices: ["🔺", "🔵"], answer: 0, say: "What comes next in the pattern?" },
      { k: "pick", q: "What comes after <b>14</b>?",
        choices: ["13", "15", "20"], answer: 1, say: "What comes after fourteen?" }
    ]
  },
  {
    n: 16, title: "Ways to Make 10", emoji: "🔟", sticker: "🍩",
    steps: [
      { k: "teach", emoji: "🤝", title: "Number Buddies",
        text: "Two numbers that add up to 10 are number buddies! 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.",
        say: "Two numbers that add up to ten are number buddies. One and nine. Two and eight. Three and seven. Four and six. Five and five." },
      { k: "pick", q: "🍎🍎🍎🍎🍎🍎 and how many more make <b>10</b>?",
        choices: ["4", "3", "6"], answer: 0, say: "Six apples and how many more make ten?" },
      { k: "pick", q: "7 ➕ __ = 10",
        choices: ["2", "3", "4"], answer: 1, say: "Seven plus what makes ten?" },
      { k: "pick", q: "What is 10's buddy for <b>5</b>?",
        choices: ["5", "6", "4"], answer: 0, say: "Five plus what makes ten?" },
      { k: "pick", q: "8 ➕ __ = 10",
        choices: ["1", "2", "3"], answer: 1, say: "Eight plus what makes ten?" }
    ]
  },
  {
    n: 17, title: "Double It!", emoji: "✌️", sticker: "🐞",
    steps: [
      { k: "teach", emoji: "✌️", title: "Doubles",
        text: "A double is a number added to itself. 2 + 2 = 4. 3 + 3 = 6. Think of two matching hands!",
        say: "A double is a number added to itself. Two plus two is four. Three plus three is six. Think of two matching hands." },
      { k: "pick", q: "2 ➕ 2 = ?", choices: ["3", "4", "5"], answer: 1, say: "Two plus two." },
      { k: "pick", q: "3 ➕ 3 = ?", choices: ["6", "5", "9"], answer: 0, say: "Three plus three." },
      { k: "pick", q: "5 ➕ 5 = ?", choices: ["9", "10", "11"], answer: 1, say: "Five plus five." },
      { k: "pick", q: "Double 4 is…", choices: ["7", "8", "6"], answer: 1, say: "What is double four?" }
    ]
  },
  {
    n: 18, title: "Skip Count by 2s", emoji: "👣", sticker: "🦎",
    steps: [
      { k: "teach", emoji: "👣", title: "Hop by Twos",
        text: "Skip counting by 2 means hop two each time: 2, 4, 6, 8, 10! It's faster than counting one by one.",
        say: "Skip counting by two means hop two each time. Two, four, six, eight, ten. It is faster than counting one by one." },
      { k: "pick", q: "2, 4, 6, __ ?", choices: ["7", "8", "9"], answer: 1, say: "Two, four, six, what comes next?" },
      { k: "pick", q: "4, 6, 8, __ ?", choices: ["10", "9", "12"], answer: 0, say: "Four, six, eight, what comes next?" },
      { k: "pick", q: "Count in pairs: 👣👣👣 = ?", choices: ["4", "6", "3"], answer: 1, say: "Three pairs. Count by twos. How many?" },
      { k: "pick", q: "2, 4, __, 8", choices: ["5", "6", "7"], answer: 1, say: "Two, four, what is missing, then eight?" }
    ]
  },
  {
    n: 19, title: "Count by 10s", emoji: "🔟", sticker: "🐳",
    steps: [
      { k: "teach", emoji: "🔟", title: "All the Way to 100",
        text: "Counting by tens gets us to 100 fast: 10, 20, 30, 40, 50, 60, 70, 80, 90, 100!",
        say: "Counting by tens gets us to one hundred fast. Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety, one hundred." },
      { k: "pick", q: "10, 20, 30, __ ?", choices: ["31", "40", "50"], answer: 1, say: "Ten, twenty, thirty, what comes next?" },
      { k: "pick", q: "50, 60, 70, __ ?", choices: ["80", "71", "90"], answer: 0, say: "Fifty, sixty, seventy, what comes next?" },
      { k: "pick", q: "What comes after <b>90</b> counting by tens?", choices: ["91", "100", "99"], answer: 1, say: "What comes after ninety when counting by tens?" },
      { k: "pick", q: "10, 20, __, 40", choices: ["25", "30", "35"], answer: 1, say: "Ten, twenty, what is missing, then forty?" }
    ]
  },
  {
    n: 20, title: "Measure & Review", emoji: "📏", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📏", title: "Show What You Know!",
        text: "You are a math star! Let's measure and mix everything: sizes, tens, doubles and buddies.",
        say: "You are a math star. Let's measure and mix everything. Sizes, tens, doubles, and buddies." },
      { k: "pick", q: "Which holds <b>MORE</b> water?", choices: ["🥤", "🛁"], answer: 1, say: "Which holds more water, a cup or a bathtub?" },
      { k: "pick", q: "6 ➕ __ = 10", choices: ["3", "4", "5"], answer: 1, say: "Six plus what makes ten?" },
      { k: "pick", q: "Double 5 is…", choices: ["10", "8", "11"], answer: 0, say: "What is double five?" },
      { k: "pick", q: "10, 20, 30, __ ?", choices: ["40", "31", "13"], answer: 0, say: "Ten, twenty, thirty, what comes next?" }
    ]
  }
];

/* ---------- KINDERGARTEN · ENGLISH ---------- */
const KG_ENGLISH = [
  {
    n: 1, title: "The ABC Letters", emoji: "🅰️", sticker: "🦁",
    steps: [
      { k: "teach", emoji: "🔤", title: "Big Letters",
        text: "The alphabet has 26 letters, from A to Z. Big letters are called UPPERCASE.",
        say: "The alphabet has twenty six letters, from A to Z. Big letters are called uppercase." },
      { k: "pick", q: "Tap the letter <b>A</b>.",
        choices: ["A", "M", "S"], answer: 0, say: "Tap the letter A." },
      { k: "pick", q: "Which letter comes <b>first</b> in the alphabet?",
        choices: ["B", "A", "C"], answer: 1, say: "Which letter comes first in the alphabet?" },
      { k: "pick", q: "Tap the letter <b>Z</b>.",
        choices: ["N", "Z", "E"], answer: 1, say: "Tap the letter Z, the last letter." },
      { k: "pick", q: "A, B, C, __ ?",
        choices: ["E", "D", "F"], answer: 1, say: "A, B, C, what comes next?" }
    ]
  },
  {
    n: 2, title: "Little Letters", emoji: "🔡", sticker: "🐭",
    steps: [
      { k: "teach", emoji: "🔡", title: "Small Letters",
        text: "Small letters are called lowercase. Every big letter has a little match: A goes with a!",
        say: "Small letters are called lowercase. Every big letter has a little match. Big A goes with little a." },
      { k: "pick", q: "Which little letter matches big <b>B</b>?",
        choices: ["b", "d", "p"], answer: 0, say: "Which little letter matches big B?" },
      { k: "pick", q: "Which little letter matches big <b>M</b>?",
        choices: ["n", "w", "m"], answer: 2, say: "Which little letter matches big M?" },
      { k: "pick", q: "Which is a <b>lowercase</b> letter?",
        choices: ["T", "s", "R"], answer: 1, say: "Which one is a lowercase, or little, letter?" },
      { k: "pick", q: "Big <b>S</b> matches which little letter?",
        choices: ["s", "z", "c"], answer: 0, say: "Big S matches which little letter?" }
    ]
  },
  {
    n: 3, title: "Beginning Sounds", emoji: "🔊", sticker: "🐶",
    steps: [
      { k: "teach", emoji: "🔊", title: "First Sounds",
        text: "Every word starts with a sound. 'Ball' starts with B: buh! 'Sun' starts with S: sss!",
        say: "Every word starts with a sound. Ball starts with the buh sound. Sun starts with the sss sound." },
      { k: "pick", q: "What sound does 🐶 <b>Dog</b> start with?",
        choices: ["D", "B", "G"], answer: 0, say: "What sound does dog start with? Duh, D." },
      { k: "pick", q: "What sound does 🍎 <b>Apple</b> start with?",
        choices: ["E", "A", "O"], answer: 1, say: "What sound does apple start with? Ah, A." },
      { k: "pick", q: "Which word starts with <b>S</b>?",
        choices: ["🐱 Cat", "☀️ Sun", "🐶 Dog"], answer: 1, say: "Which word starts with the sss sound?" },
      { k: "pick", q: "Which starts with <b>M</b>?",
        choices: ["🌙 Moon", "🐟 Fish", "🎈 Balloon"], answer: 0, say: "Which word starts with the mmm sound?" }
    ]
  },
  {
    n: 4, title: "Rhyming Words", emoji: "🎵", sticker: "🐸",
    steps: [
      { k: "teach", emoji: "🎵", title: "Words That Rhyme",
        text: "Rhyming words end with the same sound. Cat and hat rhyme! Dog and frog rhyme!",
        say: "Rhyming words end with the same sound. Cat and hat rhyme. Dog and frog rhyme." },
      { k: "pick", q: "What rhymes with <b>cat</b>?",
        choices: ["🎩 hat", "🐶 dog", "☀️ sun"], answer: 0, say: "What rhymes with cat?" },
      { k: "pick", q: "What rhymes with <b>bee</b>?",
        choices: ["🚗 car", "🌳 tree", "🍎 apple"], answer: 1, say: "What rhymes with bee?" },
      { k: "pick", q: "What rhymes with <b>star</b>?",
        choices: ["🚗 car", "🐱 cat", "🌙 moon"], answer: 0, say: "What rhymes with star?" },
      { k: "pick", q: "Do <b>frog</b> and <b>log</b> rhyme?",
        choices: ["Yes! 🎵", "No 🚫"], answer: 0, say: "Do frog and log rhyme?" }
    ]
  },
  {
    n: 5, title: "First Sight Words", emoji: "👁️", sticker: "🦄",
    steps: [
      { k: "teach", emoji: "👁️", title: "Words We Just Know",
        text: "Sight words are little words we read fast without sounding out: I, a, the, see.",
        say: "Sight words are little words we read fast, without sounding them out. I, a, the, see." },
      { k: "pick", q: "Tap the word <b>the</b>.",
        choices: ["the", "cat", "run"], answer: 0, say: "Tap the word: the." },
      { k: "pick", q: "Tap the word <b>see</b>.",
        choices: ["big", "see", "and"], answer: 1, say: "Tap the word: see." },
      { k: "pick", q: "'__ can see.' Which word fits?",
        choices: ["I", "at", "of"], answer: 0, say: "I can see. Which word fits the blank?" },
      { k: "pick", q: "Tap the word <b>a</b>.",
        choices: ["an", "a", "am"], answer: 1, say: "Tap the word: a." }
    ]
  },
  {
    n: 6, title: "More Sight Words", emoji: "📖", sticker: "🐬",
    steps: [
      { k: "teach", emoji: "📖", title: "Read Together",
        text: "More sight words to know: we, go, like, my. Practice makes them easy!",
        say: "More sight words to know. We, go, like, my. Practice makes them easy." },
      { k: "pick", q: "Tap the word <b>go</b>.",
        choices: ["go", "get", "got"], answer: 0, say: "Tap the word: go." },
      { k: "pick", q: "'I __ you.' Which word fits?",
        choices: ["like", "look", "long"], answer: 0, say: "I like you. Which word fits?" },
      { k: "pick", q: "Tap the word <b>my</b>.",
        choices: ["me", "my", "man"], answer: 1, say: "Tap the word: my." },
      { k: "pick", q: "'__ can play.' Which word fits?",
        choices: ["We", "Was", "Way"], answer: 0, say: "We can play. Which word fits?" }
    ]
  },
  {
    n: 7, title: "Word Families", emoji: "👨‍👩‍👧", sticker: "🐧",
    steps: [
      { k: "teach", emoji: "🏠", title: "The -at Family",
        text: "Some words are a family with the same ending. The -at family: cat, hat, bat, rat!",
        say: "Some words are a family with the same ending. The at family: cat, hat, bat, rat." },
      { k: "pick", q: "Which is in the <b>-at</b> family?",
        choices: ["mat", "mop", "man"], answer: 0, say: "Which word is in the at family?" },
      { k: "teach", emoji: "🏠", title: "The -an Family",
        text: "The -an family: can, fan, man, pan. They all end with 'an'.",
        say: "The an family: can, fan, man, pan. They all end with an." },
      { k: "pick", q: "Which is in the <b>-an</b> family?",
        choices: ["pan", "pen", "pin"], answer: 0, say: "Which word is in the an family?" },
      { k: "pick", q: "'c' + 'at' spells…",
        choices: ["cat", "cot", "cut"], answer: 0, say: "C plus at spells?" }
    ]
  },
  {
    n: 8, title: "Build a Word", emoji: "🧱", sticker: "🏅",
    steps: [
      { k: "teach", emoji: "🧱", title: "Sounds Make Words",
        text: "Put sounds together to build a word! s + u + n makes 'sun'. You can read!",
        say: "Put sounds together to build a word. Sss, uh, nnn makes sun. You can read!" },
      { k: "pick", q: "What word is this? 🌞  s-u-n",
        choices: ["sun", "sit", "sad"], answer: 0, say: "What word is this? Sun." },
      { k: "pick", q: "What word is this? 🐕  d-o-g",
        choices: ["dig", "dog", "dot"], answer: 1, say: "What word is this? Dog." },
      { k: "pick", q: "What word is this? 🎩  h-a-t",
        choices: ["hot", "hit", "hat"], answer: 2, say: "What word is this? Hat." },
      { k: "pick", q: "Which picture is 🐟 <b>fish</b>?",
        choices: ["🐟", "🐈", "🐦"], answer: 0, say: "Which picture is a fish?" }
    ]
  },
  {
    n: 9, title: "Ending Sounds", emoji: "🔚", sticker: "🐝",
    steps: [
      { k: "teach", emoji: "🔚", title: "Last Sounds",
        text: "Words have ending sounds too! 'Cat' ends with T: /t/. 'Sun' ends with N: /n/.",
        say: "Words have ending sounds too. Cat ends with the tuh sound. Sun ends with the nnn sound." },
      { k: "pick", q: "What sound does 🐶 <b>dog</b> END with?",
        choices: ["D", "G", "O"], answer: 1, say: "What sound does dog end with? Guh, G." },
      { k: "pick", q: "What sound does 🚌 <b>bus</b> END with?",
        choices: ["B", "S", "U"], answer: 1, say: "What sound does bus end with? Sss, S." },
      { k: "pick", q: "Which word <b>ends</b> with <b>T</b>?",
        choices: ["🐱 cat", "🐶 dog", "☀️ sun"], answer: 0, say: "Which word ends with the tuh sound?" },
      { k: "pick", q: "Which word <b>ends</b> with <b>P</b>?",
        choices: ["🗺️ map", "🚗 car", "🐝 bee"], answer: 0, say: "Which word ends with the puh sound?" }
    ]
  },
  {
    n: 10, title: "Meet the Vowels", emoji: "🅰️", sticker: "🦄",
    steps: [
      { k: "teach", emoji: "🅰️", title: "a e i o u",
        text: "Five special letters are vowels: a, e, i, o, u. Every word needs at least one vowel!",
        say: "Five special letters are vowels. A, E, I, O, U. Every word needs at least one vowel." },
      { k: "pick", q: "Which letter is a <b>vowel</b>?",
        choices: ["b", "e", "t"], answer: 1, say: "Which letter is a vowel?" },
      { k: "pick", q: "Which letter is a <b>vowel</b>?",
        choices: ["o", "m", "s"], answer: 0, say: "Which letter is a vowel?" },
      { k: "pick", q: "How many vowels are there?",
        choices: ["3", "5", "7"], answer: 1, say: "How many vowels are there?" },
      { k: "pick", q: "In the word <b>cat</b>, which letter is the vowel?",
        choices: ["c", "a", "t"], answer: 1, say: "In the word cat, which letter is the vowel?" }
    ]
  },
  {
    n: 11, title: "More Word Families", emoji: "🏘️", sticker: "🐬",
    steps: [
      { k: "teach", emoji: "🏘️", title: "The -op and -ig Families",
        text: "More families! The -op family: top, hop, mop, pop. The -ig family: pig, big, dig, wig.",
        say: "More word families. The op family: top, hop, mop, pop. The ig family: pig, big, dig, wig." },
      { k: "pick", q: "Which is in the <b>-op</b> family?",
        choices: ["top", "tap", "tip"], answer: 0, say: "Which word is in the op family?" },
      { k: "pick", q: "Which is in the <b>-ig</b> family?",
        choices: ["bag", "big", "bug"], answer: 1, say: "Which word is in the ig family?" },
      { k: "pick", q: "'h' + 'op' spells…",
        choices: ["hip", "hop", "hat"], answer: 1, say: "H plus op spells?" },
      { k: "pick", q: "Which word <b>rhymes</b> with <b>pig</b>?",
        choices: ["dig", "dog", "bag"], answer: 0, say: "Which word rhymes with pig?" }
    ]
  },
  {
    n: 12, title: "Sight Words 3", emoji: "📕", sticker: "🐭",
    steps: [
      { k: "teach", emoji: "📕", title: "More Fast Words",
        text: "More words to read fast: he, she, it, is, in, on. You know so many now!",
        say: "More words to read fast. He, she, it, is, in, on. You know so many now." },
      { k: "pick", q: "Tap the word <b>she</b>.",
        choices: ["see", "she", "the"], answer: 1, say: "Tap the word: she." },
      { k: "pick", q: "'The cat __ big.' Which word fits?",
        choices: ["is", "in", "it"], answer: 0, say: "The cat is big. Which word fits?" },
      { k: "pick", q: "Tap the word <b>on</b>.",
        choices: ["no", "on", "one"], answer: 1, say: "Tap the word: on." },
      { k: "pick", q: "'__ is my dog.' Which word fits?",
        choices: ["He", "Hat", "How"], answer: 0, say: "He is my dog. Which word fits?" }
    ]
  },
  {
    n: 13, title: "Naming Words", emoji: "🏷️", sticker: "🦁",
    steps: [
      { k: "teach", emoji: "🏷️", title: "Nouns Name Things",
        text: "A naming word (a noun) names a person, animal, place, or thing. Dog, mom, park, ball!",
        say: "A naming word, called a noun, names a person, animal, place, or thing. Dog, mom, park, ball." },
      { k: "pick", q: "Which is a <b>naming word</b> (a thing)?",
        choices: ["🍎 apple", "run", "big"], answer: 0, say: "Which word names a thing?" },
      { k: "pick", q: "Which one names a <b>person</b>?",
        choices: ["👩 mom", "jump", "blue"], answer: 0, say: "Which word names a person?" },
      { k: "pick", q: "Which one names a <b>place</b>?",
        choices: ["🏫 school", "happy", "fast"], answer: 0, say: "Which word names a place?" },
      { k: "pick", q: "Which is a <b>naming word</b>?",
        choices: ["🐱 cat", "sing", "little"], answer: 0, say: "Which one is a naming word?" }
    ]
  },
  {
    n: 14, title: "Action Words", emoji: "🏃", sticker: "🐸",
    steps: [
      { k: "teach", emoji: "🏃", title: "Verbs Are Actions",
        text: "An action word (a verb) is something you DO: run, jump, eat, sing, hop!",
        say: "An action word, called a verb, is something you do. Run, jump, eat, sing, hop." },
      { k: "pick", q: "Which is an <b>action</b> word?",
        choices: ["🏃 run", "🍎 apple", "big"], answer: 0, say: "Which one is an action word?" },
      { k: "pick", q: "What is this bunny doing? 🦘",
        choices: ["jump", "chair", "red"], answer: 0, say: "What is the bunny doing?" },
      { k: "pick", q: "Which is something you <b>DO</b>?",
        choices: ["eat", "hat", "blue"], answer: 0, say: "Which word is something you do?" },
      { k: "pick", q: "Which word is an <b>action</b>?",
        choices: ["sing", "sock", "soft"], answer: 0, say: "Which word is an action?" }
    ]
  },
  {
    n: 15, title: "Read a Sentence!", emoji: "📗", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📗", title: "You Can Read!",
        text: "Now put words together to read a whole sentence: 'I see a cat.' You are a real reader!",
        say: "Now put words together to read a whole sentence. I see a cat. You are a real reader!" },
      { k: "pick", q: "Read: 'I see a ___.' 🐶",
        choices: ["dog", "run", "the"], answer: 0, say: "I see a. Which word finishes the sentence for the dog?" },
      { k: "pick", q: "Which is a <b>real sentence</b>?",
        choices: ["I like the sun.", "cat dog run", "the the the"], answer: 0, say: "Which one is a real sentence?" },
      { k: "pick", q: "Read: 'The dog can ___.' 🏃",
        choices: ["run", "red", "rug"], answer: 0, say: "The dog can. Which word finishes it?" },
      { k: "pick", q: "Finish: 'We go to ___.' 🏫",
        choices: ["school", "chair", "blue"], answer: 0, say: "We go to. Which word finishes it?" }
    ]
  },
  {
    n: 16, title: "Sh and Ch Sounds", emoji: "🤫", sticker: "🐑",
    steps: [
      { k: "teach", emoji: "🤫", title: "Two Letters, One Sound",
        text: "Sometimes two letters make one sound. S and H make 'sh' (like shhh!). C and H make 'ch' (like choo-choo!).",
        say: "Sometimes two letters make one sound. S and H make the shh sound. C and H make the ch sound, like choo choo." },
      { k: "pick", q: "Which starts with <b>sh</b>?", choices: ["🐑 sheep", "🐱 cat", "🐶 dog"], answer: 0, say: "Which word starts with the shh sound?" },
      { k: "pick", q: "Which starts with <b>ch</b>?", choices: ["🧀 cheese", "🌙 moon", "🍎 apple"], answer: 0, say: "Which word starts with the ch sound?" },
      { k: "pick", q: "A boat is a '__ip'. Which sound?", choices: ["sh", "ch", "th"], answer: 0, say: "Ship starts with which sound?" },
      { k: "pick", q: "You sit on a '__air'. Which sound?", choices: ["sh", "ch"], answer: 1, say: "Chair starts with which sound?" }
    ]
  },
  {
    n: 17, title: "Sight Words 4", emoji: "📘", sticker: "🦩",
    steps: [
      { k: "teach", emoji: "📘", title: "Tricky Fast Words",
        text: "These sight words are tricky but important: they, said, was, are, you. Read them fast!",
        say: "These sight words are tricky but important. They, said, was, are, you. Read them fast." },
      { k: "pick", q: "Tap the word <b>said</b>.", choices: ["sad", "said", "side"], answer: 1, say: "Tap the word: said." },
      { k: "pick", q: "'The cats __ soft.' Which fits?", choices: ["are", "am", "is"], answer: 0, say: "The cats are soft. Which word fits?" },
      { k: "pick", q: "Tap the word <b>they</b>.", choices: ["the", "they", "them"], answer: 1, say: "Tap the word: they." },
      { k: "pick", q: "'It __ fun.' (yesterday)", choices: ["was", "were", "is"], answer: 0, say: "It was fun. Which word fits?" }
    ]
  },
  {
    n: 18, title: "Capital Letters", emoji: "🔠", sticker: "🐴",
    steps: [
      { k: "teach", emoji: "🔠", title: "When to Use a Capital",
        text: "A sentence starts with a CAPITAL letter. Names of people start with a capital too: Sam, Mia, Rex!",
        say: "A sentence starts with a capital letter. Names of people start with a capital too. Sam, Mia, Rex." },
      { k: "pick", q: "Which is written <b>correctly</b>?", choices: ["the dog ran.", "The dog ran."], answer: 1, say: "Which sentence is written correctly?" },
      { k: "pick", q: "A name should start with…", choices: ["a small letter", "a CAPITAL letter"], answer: 1, say: "A name should start with which kind of letter?" },
      { k: "pick", q: "Which name is correct?", choices: ["mia", "Mia"], answer: 1, say: "Which name is written correctly?" },
      { k: "pick", q: "Every sentence begins with a…", choices: ["capital letter", "number"], answer: 0, say: "Every sentence begins with a what?" }
    ]
  },
  {
    n: 19, title: "Asking Words", emoji: "❓", sticker: "🦜",
    steps: [
      { k: "teach", emoji: "❓", title: "Who, What, Where",
        text: "Question words help us ask: WHO is a person, WHAT is a thing, WHERE is a place. A question ends with a ? mark.",
        say: "Question words help us ask. Who is a person. What is a thing. Where is a place. A question ends with a question mark." },
      { k: "pick", q: "'__ is that?' (a person)", choices: ["Who", "Where", "What"], answer: 0, say: "Which word asks about a person?" },
      { k: "pick", q: "'__ is my hat?' (a place)", choices: ["Who", "Where", "What"], answer: 1, say: "Which word asks about a place?" },
      { k: "pick", q: "A question ends with which mark?", choices: [". period", "? question mark", "! wow"], answer: 1, say: "A question ends with which mark?" },
      { k: "pick", q: "'__ do you like to eat?' (a thing)", choices: ["What", "Where", "Who"], answer: 0, say: "Which word asks about a thing?" }
    ]
  },
  {
    n: 20, title: "Read More!", emoji: "📚", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📚", title: "Super Reader Review",
        text: "You know sounds, sight words, and capitals. Let's read a little and show it all off!",
        say: "You know sounds, sight words, and capitals. Let's read a little and show it all off." },
      { k: "pick", q: "Read: 'She said, I __ happy.'", choices: ["am", "are", "is"], answer: 0, say: "She said, I am happy. Which word fits?" },
      { k: "pick", q: "Which word starts with <b>sh</b>?", choices: ["🚢 ship", "🐮 cow", "🌟 star"], answer: 0, say: "Which word starts with the shh sound?" },
      { k: "pick", q: "Which is a correct sentence?", choices: ["they are my friends.", "They are my friends."], answer: 1, say: "Which one is a correct sentence?" },
      { k: "pick", q: "Finish: 'Where __ my shoes?'", choices: ["are", "am", "is"], answer: 0, say: "Where are my shoes? Which word fits?" }
    ]
  }
];

/* ---------- GRADE 3 · MATH ---------- */
const G3_MATH = [
  {
    n: 1, title: "Place Value", emoji: "🏠", sticker: "🔢",
    steps: [
      { k: "teach", emoji: "🏠", title: "Ones, Tens, Hundreds",
        text: "In 348, the 3 is 3 hundreds, the 4 is 4 tens, the 8 is 8 ones. Each place is 10× bigger to the left.",
        say: "In the number three hundred forty eight, the three means three hundreds, the four means four tens, and the eight means eight ones." },
      { k: "type", q: "In <b>562</b>, which digit is in the tens place?", answer: "6",
        say: "In five hundred sixty two, which digit is in the tens place?", hint: "Type one digit." },
      { k: "pick", q: "What is the value of the <b>7</b> in 4<b>7</b>3?",
        choices: ["7", "70", "700"], answer: 1, say: "What is the value of the seven in four hundred seventy three?" },
      { k: "type", q: "Write the number: 2 hundreds, 5 tens, 9 ones.", answer: "259",
        say: "Write the number with two hundreds, five tens, and nine ones." },
      { k: "pick", q: "Which number is <b>greater</b>?",
        choices: ["418", "481"], answer: 1, say: "Which number is greater, 418 or 481?" }
    ]
  },
  {
    n: 2, title: "Adding Big Numbers", emoji: "➕", sticker: "🧮",
    steps: [
      { k: "teach", emoji: "➕", title: "Regrouping (Carrying)",
        text: "Add the ones first. If you get 10 or more, carry a ten to the next column. 27 + 15: 7+5=12, write 2, carry 1.",
        say: "Add the ones first. If you get ten or more, carry a ten to the next column. In twenty seven plus fifteen, seven plus five is twelve. Write two, carry one." },
      { k: "type", q: "27 + 15 = ?", answer: "42", say: "Twenty seven plus fifteen." },
      { k: "type", q: "48 + 36 = ?", answer: "84", say: "Forty eight plus thirty six." },
      { k: "type", q: "125 + 47 = ?", answer: "172", say: "One hundred twenty five plus forty seven." },
      { k: "type", q: "236 + 158 = ?", answer: "394", say: "Two hundred thirty six plus one hundred fifty eight." }
    ]
  },
  {
    n: 3, title: "Subtracting Big Numbers", emoji: "➖", sticker: "🎯",
    steps: [
      { k: "teach", emoji: "➖", title: "Borrowing",
        text: "When the top digit is too small, borrow from the next column. In 52 − 18: you can't do 2−8, so borrow: 12−8=4.",
        say: "When the top digit is too small, borrow from the next column. In fifty two minus eighteen, you can't do two minus eight, so borrow. Twelve minus eight is four." },
      { k: "type", q: "52 − 18 = ?", answer: "34", say: "Fifty two minus eighteen." },
      { k: "type", q: "63 − 27 = ?", answer: "36", say: "Sixty three minus twenty seven." },
      { k: "type", q: "140 − 65 = ?", answer: "75", say: "One hundred forty minus sixty five." },
      { k: "type", q: "305 − 128 = ?", answer: "177", say: "Three hundred five minus one hundred twenty eight." }
    ]
  },
  {
    n: 4, title: "Times Tables 2–5", emoji: "✖️", sticker: "🚀",
    steps: [
      { k: "teach", emoji: "✖️", title: "Multiplication is Groups",
        text: "3 × 4 means 3 groups of 4 = 12. Skip count to check: 4, 8, 12. Learn 2s, 3s, 4s, 5s!",
        say: "Three times four means three groups of four, which is twelve. Skip count to check: four, eight, twelve." },
      { k: "type", q: "2 × 6 = ?", answer: "12", say: "Two times six." },
      { k: "type", q: "3 × 7 = ?", answer: "21", say: "Three times seven." },
      { k: "type", q: "4 × 8 = ?", answer: "32", say: "Four times eight." },
      { k: "type", q: "5 × 9 = ?", answer: "45", say: "Five times nine." }
    ]
  },
  {
    n: 5, title: "Times Tables 6–9", emoji: "✖️", sticker: "⚡",
    steps: [
      { k: "teach", emoji: "⚡", title: "The Tricky Tables",
        text: "The 6, 7, 8, 9 tables are trickier — but flipping helps: 8 × 3 is the same as 3 × 8. Same answer!",
        say: "The six, seven, eight, and nine tables are trickier. But flipping helps. Eight times three is the same as three times eight." },
      { k: "type", q: "6 × 7 = ?", answer: "42", say: "Six times seven." },
      { k: "type", q: "8 × 4 = ?", answer: "32", say: "Eight times four." },
      { k: "type", q: "7 × 8 = ?", answer: "56", say: "Seven times eight." },
      { k: "type", q: "9 × 9 = ?", answer: "81", say: "Nine times nine." }
    ]
  },
  {
    n: 6, title: "Division Basics", emoji: "➗", sticker: "🍕",
    steps: [
      { k: "teach", emoji: "➗", title: "Sharing Equally",
        text: "Division shares things into equal groups. 12 ÷ 3 = 4: share 12 into 3 groups, each gets 4. It undoes multiplying!",
        say: "Division shares things into equal groups. Twelve divided by three is four. Share twelve into three groups, and each gets four. Division undoes multiplication." },
      { k: "type", q: "12 ÷ 3 = ?", answer: "4", say: "Twelve divided by three." },
      { k: "type", q: "20 ÷ 4 = ?", answer: "5", say: "Twenty divided by four." },
      { k: "type", q: "18 ÷ 6 = ?", answer: "3", say: "Eighteen divided by six." },
      { k: "pick", q: "3 × 5 = 15, so 15 ÷ 5 = ?",
        choices: ["3", "5", "10"], answer: 0, say: "Three times five is fifteen, so fifteen divided by five is?" }
    ]
  },
  {
    n: 7, title: "Fractions", emoji: "🍰", sticker: "🍰",
    steps: [
      { k: "teach", emoji: "🍰", title: "Parts of a Whole",
        text: "A fraction is equal parts of a whole. 1/2 means 1 of 2 equal parts. 1/4 means 1 of 4 equal parts.",
        say: "A fraction is equal parts of a whole. One half means one of two equal parts. One fourth means one of four equal parts." },
      { k: "pick", q: "🍕 A pizza is cut in 4 equal slices. Each slice is…",
        choices: ["1/2", "1/4", "1/3"], answer: 1, say: "A pizza is cut into four equal slices. Each slice is what fraction?" },
      { k: "pick", q: "Which is <b>bigger</b>?",
        choices: ["1/2", "1/4"], answer: 0, say: "Which is bigger, one half or one fourth?" },
      { k: "type", q: "How many <b>halves</b> make a whole?", answer: "2",
        say: "How many halves make one whole?" },
      { k: "pick", q: "🍫 3 of 4 equal pieces are eaten. What fraction is that?",
        choices: ["3/4", "1/4", "4/3"], answer: 0, say: "Three of four equal pieces. What fraction is that?" }
    ]
  },
  {
    n: 8, title: "Word Problems", emoji: "🧠", sticker: "🏅",
    steps: [
      { k: "teach", emoji: "🧠", title: "Math Detective",
        text: "Word problems tell a story. Find the numbers, spot the action (join = add, take = subtract, groups = multiply), then solve!",
        say: "Word problems tell a story. Find the numbers, spot the action. Joining means add, taking away means subtract, equal groups means multiply. Then solve." },
      { k: "type", q: "Sam has 24 stickers and gets 18 more. How many now?", answer: "42",
        say: "Sam has twenty four stickers and gets eighteen more. How many now?" },
      { k: "type", q: "There are 30 apples. 12 are eaten. How many are left?", answer: "18",
        say: "There are thirty apples. Twelve are eaten. How many are left?" },
      { k: "type", q: "4 boxes hold 6 crayons each. How many crayons in all?", answer: "24",
        say: "Four boxes hold six crayons each. How many crayons in all?" },
      { k: "type", q: "15 cookies shared by 3 kids. Each kid gets how many?", answer: "5",
        say: "Fifteen cookies shared by three kids. Each kid gets how many?" }
    ]
  },
  {
    n: 9, title: "Rounding Numbers", emoji: "🎯", sticker: "🎯",
    steps: [
      { k: "teach", emoji: "🎯", title: "Round Up or Down",
        text: "Rounding makes numbers simpler. To the nearest 10: if the ones digit is 5 or more, round up; if less, round down. 47 → 50, 43 → 40.",
        say: "Rounding makes numbers simpler. To the nearest ten, if the ones digit is five or more, round up. If less, round down. Forty seven rounds to fifty. Forty three rounds to forty." },
      { k: "type", q: "Round <b>68</b> to the nearest 10.", answer: "70", say: "Round sixty eight to the nearest ten." },
      { k: "type", q: "Round <b>34</b> to the nearest 10.", answer: "30", say: "Round thirty four to the nearest ten." },
      { k: "type", q: "Round <b>280</b> to the nearest 100.", answer: "300", say: "Round two hundred eighty to the nearest hundred." },
      { k: "type", q: "Round <b>412</b> to the nearest 100.", answer: "400", say: "Round four hundred twelve to the nearest hundred." }
    ]
  },
  {
    n: 10, title: "Bigger Multiplication", emoji: "✖️", sticker: "🚀",
    steps: [
      { k: "teach", emoji: "✖️", title: "×10 and 2-Digit",
        text: "Multiplying by 10 is easy — just add a zero! 6 × 10 = 60. For a 2-digit number, multiply each part: 12 × 3 = (10×3) + (2×3) = 36.",
        say: "Multiplying by ten is easy. Just add a zero. Six times ten is sixty. For a two digit number, multiply each part. Twelve times three is thirty six." },
      { k: "type", q: "7 × 10 = ?", answer: "70", say: "Seven times ten." },
      { k: "type", q: "12 × 3 = ?", answer: "36", say: "Twelve times three." },
      { k: "type", q: "11 × 6 = ?", answer: "66", say: "Eleven times six." },
      { k: "type", q: "23 × 2 = ?", answer: "46", say: "Twenty three times two." }
    ]
  },
  {
    n: 11, title: "Division & Remainders", emoji: "➗", sticker: "🍕",
    steps: [
      { k: "teach", emoji: "➗", title: "Leftovers",
        text: "Sometimes things don't share evenly and there's a remainder left over. 13 ÷ 4 = 3 remainder 1, because 4 × 3 = 12, with 1 left.",
        say: "Sometimes things don't share evenly and there's a remainder left over. Thirteen divided by four is three remainder one, because four times three is twelve, with one left over." },
      { k: "type", q: "16 ÷ 2 = ?", answer: "8", say: "Sixteen divided by two." },
      { k: "type", q: "24 ÷ 3 = ?", answer: "8", say: "Twenty four divided by three." },
      { k: "pick", q: "7 ÷ 2 = 3 with a remainder of…",
        choices: ["1", "2", "0"], answer: 0, say: "Seven divided by two is three with a remainder of what?" },
      { k: "pick", q: "10 ÷ 3 = 3 with a remainder of…",
        choices: ["1", "2", "3"], answer: 0, say: "Ten divided by three is three with a remainder of what?" }
    ]
  },
  {
    n: 12, title: "Comparing Fractions", emoji: "🍰", sticker: "🍰",
    steps: [
      { k: "teach", emoji: "🍰", title: "Which Piece is Bigger?",
        text: "With same-size wholes, the MORE pieces you cut, the SMALLER each piece. So 1/2 is bigger than 1/4. And 2/4 is the same as 1/2!",
        say: "With same size wholes, the more pieces you cut, the smaller each piece. So one half is bigger than one fourth. And two fourths is the same as one half." },
      { k: "pick", q: "Which is <b>bigger</b>?",
        choices: ["1/3", "1/6"], answer: 0, say: "Which is bigger, one third or one sixth?" },
      { k: "pick", q: "Which is <b>smaller</b>?",
        choices: ["1/2", "1/8"], answer: 1, say: "Which is smaller, one half or one eighth?" },
      { k: "pick", q: "1/2 is the <b>same</b> as…",
        choices: ["2/4", "1/4", "3/4"], answer: 0, say: "One half is the same as which fraction?" },
      { k: "pick", q: "2 of 4 equal slices eaten = what fraction?",
        choices: ["2/4", "4/2", "1/4"], answer: 0, say: "Two of four equal slices. What fraction is eaten?" }
    ]
  },
  {
    n: 13, title: "Telling Time", emoji: "⏰", sticker: "⏰",
    steps: [
      { k: "teach", emoji: "⏰", title: "Reading a Clock",
        text: "A clock has an hour hand (short) and a minute hand (long). Each number is 5 minutes apart, and there are 60 minutes in an hour.",
        say: "A clock has an hour hand, which is short, and a minute hand, which is long. Each number is five minutes apart, and there are sixty minutes in an hour." },
      { k: "pick", q: "Hour hand on 3, minute hand on 12. The time is…",
        choices: ["3:00", "12:03", "3:12"], answer: 0, say: "Hour hand on three, minute hand on twelve. What time is it?" },
      { k: "type", q: "How many minutes are in one hour?", answer: "60", say: "How many minutes are in one hour?" },
      { k: "pick", q: "The minute hand points to <b>6</b>. That means…",
        choices: ["half past (:30)", "o'clock", ":15"], answer: 0, say: "The minute hand points to six. What does that mean?" },
      { k: "pick", q: "Recess is at 10:00. In 1 hour it will be…",
        choices: ["11:00", "9:00", "12:00"], answer: 0, say: "Recess is at ten o'clock. In one hour it will be?" }
    ]
  },
  {
    n: 14, title: "Money & Change", emoji: "💰", sticker: "💰",
    steps: [
      { k: "teach", emoji: "💰", title: "Dollars and Cents",
        text: "Money uses dollars $ and cents ¢. 100 cents = $1. A quarter is 25¢, a dime 10¢, a nickel 5¢, a penny 1¢.",
        say: "Money uses dollars and cents. One hundred cents make one dollar. A quarter is twenty five cents, a dime is ten cents, a nickel is five cents, and a penny is one cent." },
      { k: "type", q: "How many cents make <b>one dollar</b>?", answer: "100", say: "How many cents make one dollar?" },
      { k: "pick", q: "A <b>quarter</b> is worth…",
        choices: ["10¢", "25¢", "5¢"], answer: 1, say: "How much is a quarter worth?" },
      { k: "type", q: "You have 2 quarters. That is how many cents?", answer: "50", say: "You have two quarters. How many cents is that?" },
      { k: "pick", q: "You pay $1 for a 75¢ toy. Your change is…",
        choices: ["25¢", "75¢", "15¢"], answer: 0, say: "You pay one dollar for a seventy five cent toy. How much change do you get?" }
    ]
  },
  {
    n: 15, title: "Area & Perimeter", emoji: "📐", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📐", title: "Around and Inside",
        text: "Perimeter is the distance AROUND a shape — add up all the sides. Area is the space INSIDE — for a rectangle, multiply length × width.",
        say: "Perimeter is the distance around a shape. Add up all the sides. Area is the space inside. For a rectangle, multiply length times width." },
      { k: "pick", q: "Perimeter of a square with sides of 4: 4+4+4+4 =",
        choices: ["8", "16", "12"], answer: 1, say: "A square has four sides of four. Add them up. What is the perimeter?" },
      { k: "type", q: "A rectangle is 5 long and 3 wide. Area = 5 × 3 = ?", answer: "15", say: "A rectangle is five long and three wide. What is the area?" },
      { k: "pick", q: "<b>Perimeter</b> means the distance…",
        choices: ["around", "inside", "under"], answer: 0, say: "Perimeter means the distance where?" },
      { k: "type", q: "A grid is 2 rows by 4 columns. How many squares? (2 × 4)", answer: "8", say: "A grid is two rows by four columns. How many squares in all?" }
    ]
  },
  {
    n: 16, title: "Times Tables 11 & 12", emoji: "✖️", sticker: "🎇",
    steps: [
      { k: "teach", emoji: "✖️", title: "The Biggest Tables",
        text: "Master the last tables! For 11 × a single digit, repeat the digit: 11 × 4 = 44. For 12, multiply by 10 then add two more groups: 12 × 3 = 30 + 6 = 36.",
        say: "Master the last tables. For eleven times a single digit, repeat the digit. Eleven times four is forty four. For twelve, multiply by ten then add two more groups. Twelve times three is thirty six." },
      { k: "type", q: "11 × 6 = ?", answer: "66", say: "Eleven times six." },
      { k: "type", q: "12 × 4 = ?", answer: "48", say: "Twelve times four." },
      { k: "type", q: "11 × 9 = ?", answer: "99", say: "Eleven times nine." },
      { k: "type", q: "12 × 12 = ?", answer: "144", say: "Twelve times twelve." }
    ]
  },
  {
    n: 17, title: "Division Facts", emoji: "➗", sticker: "🍩",
    steps: [
      { k: "teach", emoji: "➗", title: "Use Times Tables Backward",
        text: "Division is multiplication backward. Since 6 × 7 = 42, then 42 ÷ 6 = 7. Know your tables and you know division!",
        say: "Division is multiplication backward. Since six times seven is forty two, then forty two divided by six is seven. Know your tables and you know division." },
      { k: "type", q: "42 ÷ 6 = ?", answer: "7", say: "Forty two divided by six." },
      { k: "type", q: "36 ÷ 4 = ?", answer: "9", say: "Thirty six divided by four." },
      { k: "type", q: "56 ÷ 8 = ?", answer: "7", say: "Fifty six divided by eight." },
      { k: "type", q: "81 ÷ 9 = ?", answer: "9", say: "Eighty one divided by nine." }
    ]
  },
  {
    n: 18, title: "Elapsed Time", emoji: "⏳", sticker: "⏰",
    steps: [
      { k: "teach", emoji: "⏳", title: "How Much Time Passed?",
        text: "Elapsed time is how long something takes — count forward from start to end. From 2:00 to 3:30 is 1 hour and 30 minutes.",
        say: "Elapsed time is how long something takes. Count forward from the start to the end. From two o'clock to three thirty is one hour and thirty minutes." },
      { k: "pick", q: "From 4:00 to 5:00 is how long?", choices: ["30 minutes", "1 hour", "2 hours"], answer: 1, say: "From four o'clock to five o'clock is how long?" },
      { k: "type", q: "A 30-min show starts at 6:00. It ends at 6:__?", answer: "30", say: "A thirty minute show starts at six o'clock. What minutes does it end at?" },
      { k: "pick", q: "From 1:00 to 1:15 is…", choices: ["15 minutes", "1 hour", "50 minutes"], answer: 0, say: "From one o'clock to one fifteen is how long?" },
      { k: "pick", q: "Recess starts 10:00, ends 10:20. It lasts…", choices: ["10 min", "20 min", "1 hour"], answer: 1, say: "Recess starts at ten and ends at ten twenty. How long?" }
    ]
  },
  {
    n: 19, title: "Graphs & Data", emoji: "📊", sticker: "📊",
    steps: [
      { k: "teach", emoji: "📊", title: "Reading a Bar Graph",
        text: "A bar graph shows how many of each thing with tall or short bars. The taller the bar, the more there are. Read the number at the top of each bar.",
        say: "A bar graph shows how many of each thing with tall or short bars. The taller the bar, the more there are. Read the number at the top of each bar." },
      { k: "pick", q: "🍎:5  🍌:8  🍇:3 — which has the MOST?", choices: ["🍎 apples", "🍌 bananas", "🍇 grapes"], answer: 1, say: "Apples five, bananas eight, grapes three. Which has the most?" },
      { k: "pick", q: "🍎:5  🍌:8  🍇:3 — which has the FEWEST?", choices: ["🍎 apples", "🍌 bananas", "🍇 grapes"], answer: 2, say: "Which fruit has the fewest?" },
      { k: "type", q: "🍎:5 and 🍌:8. How many MORE bananas than apples?", answer: "3", say: "Five apples and eight bananas. How many more bananas than apples?" },
      { k: "type", q: "🍎:5, 🍌:8, 🍇:3. How many fruits in all?", answer: "16", say: "Five apples, eight bananas, three grapes. How many fruits in all?" }
    ]
  },
  {
    n: 20, title: "Multi-Step Problems", emoji: "🧠", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "🧠", title: "Two Steps to the Answer",
        text: "Some problems need two steps. Do the first part, then use that answer for the second part. Read slowly and take it one step at a time!",
        say: "Some problems need two steps. Do the first part, then use that answer for the second part. Read slowly and take it one step at a time." },
      { k: "type", q: "5 bags with 4 apples each, then eat 3. How many left?", answer: "17", say: "Five bags with four apples each, then eat three. How many are left?" },
      { k: "type", q: "You have $20 and buy 2 toys at $6 each. Money left?", answer: "8", say: "You have twenty dollars and buy two toys at six dollars each. How much money is left?" },
      { k: "type", q: "3 rows of 6 chairs, then add 5 chairs. Total?", answer: "23", say: "Three rows of six chairs, then add five chairs. What is the total?" },
      { k: "type", q: "24 cookies on 4 plates, then eat 1 plate. Cookies eaten?", answer: "6", say: "Twenty four cookies split onto four plates, then eat one plate. How many cookies eaten?" }
    ]
  }
];

/* ---------- GRADE 3 · ENGLISH ---------- */
const G3_ENGLISH = [
  {
    n: 1, title: "Nouns", emoji: "🏷️", sticker: "🐕",
    steps: [
      { k: "teach", emoji: "🏷️", title: "Naming Words",
        text: "A noun names a person, place, animal, or thing. A PROPER noun is a special name and starts with a capital: Sara, Paris, Rex.",
        say: "A noun names a person, place, animal, or thing. A proper noun is a special name and starts with a capital letter. Sara, Paris, Rex." },
      { k: "pick", q: "Which word is a <b>noun</b>?",
        choices: ["run", "dog", "happy"], answer: 1, say: "Which word is a noun?" },
      { k: "pick", q: "Which is a <b>proper</b> noun?",
        choices: ["city", "London", "river"], answer: 1, say: "Which is a proper noun, a special name?" },
      { k: "pick", q: "Which noun should start with a <b>capital</b>?",
        choices: ["teacher", "Monday", "book"], answer: 1, say: "Which noun should always start with a capital letter?" },
      { k: "type", q: "Type ANY noun (a person, place, or thing).", answer: "*",
        say: "Type any noun. A person, place, or thing.", hint: "Any real noun works!" }
    ]
  },
  {
    n: 2, title: "Verbs & Tenses", emoji: "🏃", sticker: "🐆",
    steps: [
      { k: "teach", emoji: "🏃", title: "Action Words",
        text: "A verb is an action: run, jump, sing. Tense tells WHEN: today I walk (present), yesterday I walked (past).",
        say: "A verb is an action word: run, jump, sing. Tense tells when. Today I walk, present. Yesterday I walked, past." },
      { k: "pick", q: "Which word is a <b>verb</b>?",
        choices: ["table", "jump", "blue"], answer: 1, say: "Which word is a verb, an action?" },
      { k: "pick", q: "Past tense of <b>play</b>?",
        choices: ["played", "playing", "plays"], answer: 0, say: "What is the past tense of play?" },
      { k: "pick", q: "Past tense of <b>run</b>?",
        choices: ["runned", "ran", "running"], answer: 1, say: "What is the past tense of run?" },
      { k: "pick", q: "'She __ to school every day.' (present)",
        choices: ["walked", "walks", "walking"], answer: 1, say: "She blank to school every day. Which present tense verb fits?" }
    ]
  },
  {
    n: 3, title: "Adjectives & Adverbs", emoji: "🎨", sticker: "🦚",
    steps: [
      { k: "teach", emoji: "🎨", title: "Describing Words",
        text: "An adjective describes a noun: a BIG dog. An adverb describes a verb, often ending in -ly: she ran QUICKLY.",
        say: "An adjective describes a noun. A big dog. An adverb describes a verb and often ends in l-y. She ran quickly." },
      { k: "pick", q: "Which is an <b>adjective</b> in 'the fluffy cat'?",
        choices: ["the", "fluffy", "cat"], answer: 1, say: "Which word is the adjective in the fluffy cat?" },
      { k: "pick", q: "Which is an <b>adverb</b>?",
        choices: ["slowly", "happy", "chair"], answer: 0, say: "Which word is an adverb?" },
      { k: "pick", q: "'The __ sun.' Which adjective fits?",
        choices: ["bright", "brightly", "brighten"], answer: 0, say: "The blank sun. Which describing word fits?" },
      { k: "pick", q: "'He sang __.' Which adverb fits?",
        choices: ["loud", "loudly", "louder"], answer: 1, say: "He sang blank. Which adverb fits?" }
    ]
  },
  {
    n: 4, title: "Synonyms & Antonyms", emoji: "🔁", sticker: "🦋",
    steps: [
      { k: "teach", emoji: "🔁", title: "Same and Opposite",
        text: "Synonyms mean the SAME: big and large. Antonyms are OPPOSITES: hot and cold.",
        say: "Synonyms mean the same thing. Big and large. Antonyms are opposites. Hot and cold." },
      { k: "pick", q: "A <b>synonym</b> for <b>happy</b> is…",
        choices: ["sad", "glad", "tall"], answer: 1, say: "A synonym for happy is?" },
      { k: "pick", q: "An <b>antonym</b> for <b>up</b> is…",
        choices: ["down", "high", "top"], answer: 0, say: "An antonym, or opposite, for up is?" },
      { k: "pick", q: "A <b>synonym</b> for <b>fast</b> is…",
        choices: ["slow", "quick", "stop"], answer: 1, say: "A synonym for fast is?" },
      { k: "pick", q: "An <b>antonym</b> for <b>big</b> is…",
        choices: ["large", "huge", "small"], answer: 2, say: "An antonym for big is?" }
    ]
  },
  {
    n: 5, title: "Prefixes & Suffixes", emoji: "🧩", sticker: "🐙",
    steps: [
      { k: "teach", emoji: "🧩", title: "Word Parts",
        text: "A prefix goes at the START: 're' means again (redo). A suffix goes at the END: 'ful' means full of (helpful).",
        say: "A prefix goes at the start of a word. Re means again, like redo. A suffix goes at the end. Ful means full of, like helpful." },
      { k: "pick", q: "<b>un</b> + happy means…",
        choices: ["very happy", "not happy", "happy again"], answer: 1, say: "Unhappy means?" },
      { k: "pick", q: "<b>re</b> + read means…",
        choices: ["read again", "not read", "read fast"], answer: 0, say: "Reread means?" },
      { k: "pick", q: "care + <b>ful</b> means…",
        choices: ["full of care", "no care", "less care"], answer: 0, say: "Careful means?" },
      { k: "pick", q: "Which word has a <b>prefix</b>?",
        choices: ["jumping", "unlock", "kindness"], answer: 1, say: "Which word has a prefix at the start?" }
    ]
  },
  {
    n: 6, title: "Contractions", emoji: "🤝", sticker: "🐬",
    steps: [
      { k: "teach", emoji: "🤝", title: "Squished Words",
        text: "A contraction squishes two words into one with an apostrophe ('). 'do not' becomes 'don't'. 'I am' becomes 'I'm'.",
        say: "A contraction squishes two words into one, using an apostrophe. Do not becomes don't. I am becomes I'm." },
      { k: "pick", q: "<b>do not</b> = ?",
        choices: ["don't", "dont'", "do'nt"], answer: 0, say: "Do not, made into a contraction, is?" },
      { k: "pick", q: "<b>can not</b> = ?",
        choices: ["ca'nt", "can't", "cant"], answer: 1, say: "Can not, made into a contraction, is?" },
      { k: "pick", q: "<b>it is</b> = ?",
        choices: ["its", "it's", "i'ts"], answer: 1, say: "It is, made into a contraction, is?" },
      { k: "pick", q: "<b>I'll</b> stands for…",
        choices: ["I will", "I all", "I well"], answer: 0, say: "What does I'll stand for?" }
    ]
  },
  {
    n: 7, title: "Punctuation", emoji: "❗", sticker: "🦉",
    steps: [
      { k: "teach", emoji: "❗", title: "Sentence Signals",
        text: "A telling sentence ends with a period (.). A question ends with a question mark (?). Excitement ends with (!). Sentences START with a capital.",
        say: "A telling sentence ends with a period. A question ends with a question mark. Excitement ends with an exclamation mark. Every sentence starts with a capital letter." },
      { k: "pick", q: "'What is your name__' needs which mark?",
        choices: [".", "?", "!"], answer: 1, say: "What is your name, needs which mark?" },
      { k: "pick", q: "'Watch out__' (excited!) needs which mark?",
        choices: ["!", ".", "?"], answer: 0, say: "Watch out, said with excitement, needs which mark?" },
      { k: "pick", q: "Which sentence is written <b>correctly</b>?",
        choices: ["the dog ran.", "The dog ran.", "The dog ran"], answer: 1, say: "Which sentence is written correctly?" },
      { k: "pick", q: "A telling sentence ends with a…",
        choices: ["period .", "comma ,", "question mark ?"], answer: 0, say: "A telling sentence ends with which mark?" }
    ]
  },
  {
    n: 8, title: "Reading Time", emoji: "📚", sticker: "🏅",
    steps: [
      { k: "teach", emoji: "📚", title: "Read the Story",
        text: "Read this carefully:\n\n\"Maya planted a tiny seed in a pot. Every day she gave it water and sunlight. After two weeks, a small green leaf popped out. Maya was so proud of her little plant!\"",
        say: "Read this story. Maya planted a tiny seed in a pot. Every day she gave it water and sunlight. After two weeks, a small green leaf popped out. Maya was so proud of her little plant." },
      { k: "pick", q: "What did Maya plant?",
        choices: ["A seed", "A tree", "A flower"], answer: 0, say: "What did Maya plant?" },
      { k: "pick", q: "What did she give it every day?",
        choices: ["Music", "Water and sunlight", "Food"], answer: 1, say: "What did she give it every day?" },
      { k: "pick", q: "What popped out after two weeks?",
        choices: ["A bug", "A green leaf", "A flower"], answer: 1, say: "What popped out after two weeks?" },
      { k: "pick", q: "How did Maya feel at the end?",
        choices: ["Proud", "Sad", "Angry"], answer: 0, say: "How did Maya feel at the end?" }
    ]
  },
  {
    n: 9, title: "Pronouns", emoji: "👉", sticker: "🦊",
    steps: [
      { k: "teach", emoji: "👉", title: "Words That Replace Nouns",
        text: "A pronoun takes the place of a noun. Instead of 'Sara ran', we say 'She ran'. Pronouns: I, you, he, she, it, we, they.",
        say: "A pronoun takes the place of a noun. Instead of Sara ran, we say she ran. Pronouns are I, you, he, she, it, we, they." },
      { k: "pick", q: "Which word is a <b>pronoun</b>?",
        choices: ["dog", "she", "run"], answer: 1, say: "Which word is a pronoun?" },
      { k: "pick", q: "'Tom is tall. __ is tall.' Which pronoun replaces Tom?",
        choices: ["He", "It", "They"], answer: 0, say: "Tom is tall. Which pronoun replaces Tom?" },
      { k: "pick", q: "'The cats are soft. __ are soft.'",
        choices: ["He", "They", "She"], answer: 1, say: "The cats are soft. Which pronoun replaces the cats?" },
      { k: "pick", q: "A pronoun for '<b>Mom and I</b>' is…",
        choices: ["We", "They", "It"], answer: 0, say: "Which pronoun replaces Mom and I?" }
    ]
  },
  {
    n: 10, title: "Complete Sentences", emoji: "✅", sticker: "🦉",
    steps: [
      { k: "teach", emoji: "✅", title: "Subject + Predicate",
        text: "A complete sentence has a subject (who or what) and a predicate (the action). 'The dog barks.' A fragment is missing a part.",
        say: "A complete sentence has a subject, the who or what, and a predicate, the action. The dog barks. A fragment is missing a part." },
      { k: "pick", q: "Which is a <b>complete</b> sentence?",
        choices: ["The bird sings.", "Under the tree.", "Runs fast."], answer: 0, say: "Which one is a complete sentence?" },
      { k: "pick", q: "Which is a <b>fragment</b> (not complete)?",
        choices: ["My cat sleeps.", "In the box.", "We played."], answer: 1, say: "Which one is a fragment, not a complete sentence?" },
      { k: "pick", q: "In 'The boy runs', the <b>subject</b> is…",
        choices: ["The boy", "runs", "the"], answer: 0, say: "In the boy runs, what is the subject?" },
      { k: "pick", q: "In 'Birds fly high', the <b>predicate</b> is…",
        choices: ["Birds", "fly high", "high"], answer: 1, say: "In birds fly high, what is the predicate, the action part?" }
    ]
  },
  {
    n: 11, title: "Compound Words", emoji: "🧲", sticker: "🐙",
    steps: [
      { k: "teach", emoji: "🧲", title: "Two Words, One Word",
        text: "A compound word is two words joined to make one new word: sun + flower = sunflower, rain + bow = rainbow.",
        say: "A compound word is two words joined to make one new word. Sun plus flower makes sunflower. Rain plus bow makes rainbow." },
      { k: "pick", q: "sun + shine = ?",
        choices: ["sunshine", "sunny", "shining"], answer: 0, say: "Sun plus shine makes what word?" },
      { k: "pick", q: "Which one is a <b>compound word</b>?",
        choices: ["football", "running", "happy"], answer: 0, say: "Which one is a compound word?" },
      { k: "pick", q: "cup + cake = ?",
        choices: ["cupcake", "caking", "cups"], answer: 0, say: "Cup plus cake makes what word?" },
      { k: "pick", q: "Break '<b>butterfly</b>' into two words:",
        choices: ["butter + fly", "but + terfly", "butt + erfly"], answer: 0, say: "How do you break butterfly into two words?" }
    ]
  },
  {
    n: 12, title: "Homophones", emoji: "👂", sticker: "🦋",
    steps: [
      { k: "teach", emoji: "👂", title: "Sound Alike, Mean Different",
        text: "Homophones sound the same but mean different things and are spelled differently: to / two / too, and their / there.",
        say: "Homophones sound the same but mean different things and are spelled differently. To, two, and too. Also their and there." },
      { k: "pick", q: "'I have __ dogs.' (the number 2)",
        choices: ["two", "to", "too"], answer: 0, say: "I have how many dogs? The number two. Which spelling?" },
      { k: "pick", q: "'We went __ the park.'",
        choices: ["two", "to", "too"], answer: 1, say: "We went to the park. Which spelling fits?" },
      { k: "pick", q: "'Put it over __.' (that place)",
        choices: ["their", "there", "they're"], answer: 1, say: "Put it over there, that place. Which spelling?" },
      { k: "pick", q: "'It is __ house.' (belongs to them)",
        choices: ["there", "their", "they're"], answer: 1, say: "It is their house, belonging to them. Which spelling?" }
    ]
  },
  {
    n: 13, title: "Plural Nouns", emoji: "➕", sticker: "🐬",
    steps: [
      { k: "teach", emoji: "➕", title: "More Than One",
        text: "Plural means more than one. Usually add -s: cat → cats. Add -es after s, x, ch, sh: box → boxes. Some change: mouse → mice.",
        say: "Plural means more than one. Usually add s. Cat becomes cats. Add e s after s, x, c h, or s h. Box becomes boxes. Some words change, like mouse becomes mice." },
      { k: "pick", q: "Plural of <b>dog</b>?",
        choices: ["dogs", "doges", "dog"], answer: 0, say: "What is the plural of dog?" },
      { k: "pick", q: "Plural of <b>box</b>?",
        choices: ["boxs", "boxes", "boxxes"], answer: 1, say: "What is the plural of box?" },
      { k: "pick", q: "Plural of <b>baby</b>?",
        choices: ["babys", "babies", "babyes"], answer: 1, say: "What is the plural of baby?" },
      { k: "pick", q: "Plural of <b>mouse</b>?",
        choices: ["mouses", "mice", "mouse"], answer: 1, say: "What is the plural of mouse?" }
    ]
  },
  {
    n: 14, title: "Context Clues", emoji: "🔎", sticker: "🦚",
    steps: [
      { k: "teach", emoji: "🔎", title: "Guess from Around It",
        text: "When you meet a new word, use context clues — the other words around it — to figure out what it means.",
        say: "When you meet a new word, use context clues. The other words around it help you figure out what it means." },
      { k: "pick", q: "'The <b>enormous</b> elephant was so huge.' Enormous means…",
        choices: ["very big", "tiny", "fast"], answer: 0, say: "The enormous elephant was so huge. What does enormous mean?" },
      { k: "pick", q: "'She was <b>weary</b> and needed to rest.' Weary means…",
        choices: ["tired", "happy", "hungry"], answer: 0, say: "She was weary and needed to rest. What does weary mean?" },
      { k: "pick", q: "'The <b>vivid</b>, bright colors popped.' Vivid means…",
        choices: ["bright", "dull", "dark"], answer: 0, say: "The vivid, bright colors popped. What does vivid mean?" },
      { k: "pick", q: "'He <b>gazed</b>, looking for a long time.' Gazed means…",
        choices: ["stared", "ran", "ate"], answer: 0, say: "He gazed, looking for a long time. What does gazed mean?" }
    ]
  },
  {
    n: 15, title: "Reading Time 2", emoji: "📖", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📖", title: "Read the Story",
        text: "Read this carefully:\n\n\"Ben found a lost puppy shivering in the rain. He wrapped it in his warm jacket and carried it home. His mom helped him put up signs, and soon the puppy's family called. Ben felt happy that the puppy was safe.\"",
        say: "Read this story. Ben found a lost puppy shivering in the rain. He wrapped it in his warm jacket and carried it home. His mom helped him put up signs, and soon the puppy's family called. Ben felt happy that the puppy was safe." },
      { k: "pick", q: "What did Ben find?",
        choices: ["A lost puppy", "A cat", "A jacket"], answer: 0, say: "What did Ben find?" },
      { k: "pick", q: "Where did he find it?",
        choices: ["In the rain", "At school", "In a box"], answer: 0, say: "Where did he find it?" },
      { k: "pick", q: "What did Ben wrap the puppy in?",
        choices: ["His warm jacket", "A blanket", "A towel"], answer: 0, say: "What did Ben wrap the puppy in?" },
      { k: "pick", q: "How did Ben feel at the end?",
        choices: ["Happy", "Angry", "Bored"], answer: 0, say: "How did Ben feel at the end?" }
    ]
  },
  {
    n: 16, title: "Adjectives & Adverbs", emoji: "🎨", sticker: "🦚",
    steps: [
      { k: "teach", emoji: "🎨", title: "Describing Words",
        text: "An adjective describes a noun (a fluffy cat, a red ball). An adverb describes a verb — how something is done, often ending in -ly (ran quickly, sang softly).",
        say: "An adjective describes a noun. A fluffy cat, a red ball. An adverb describes a verb. How something is done, often ending in l y. Ran quickly, sang softly." },
      { k: "pick", q: "In 'the <b>shiny</b> car', which is the adjective?", choices: ["car", "shiny", "the"], answer: 1, say: "Which word is the adjective?" },
      { k: "pick", q: "Which is an <b>adverb</b>?", choices: ["quickly", "happy", "dog"], answer: 0, say: "Which word is an adverb?" },
      { k: "pick", q: "'She sang __.' (adverb)", choices: ["beautifully", "beautiful", "beauty"], answer: 0, say: "She sang how? Which adverb fits?" },
      { k: "pick", q: "Which word describes a NOUN?", choices: ["slowly", "tall", "loudly"], answer: 1, say: "Which word is an adjective that describes a noun?" }
    ]
  },
  {
    n: 17, title: "Contractions", emoji: "✂️", sticker: "🐆",
    steps: [
      { k: "teach", emoji: "✂️", title: "Squished-Together Words",
        text: "A contraction joins two words with an apostrophe, dropping some letters. do + not = don't. I + am = I'm. it + is = it's.",
        say: "A contraction joins two words with an apostrophe, dropping some letters. Do not becomes don't. I am becomes I'm. It is becomes it's." },
      { k: "pick", q: "<b>do not</b> = ?", choices: ["dont", "don't", "do'nt"], answer: 1, say: "What is the contraction for do not?" },
      { k: "pick", q: "<b>I am</b> = ?", choices: ["I'm", "Im", "I'am"], answer: 0, say: "What is the contraction for I am?" },
      { k: "pick", q: "<b>cannot</b> = ?", choices: ["can't", "cant", "ca'nt"], answer: 0, say: "What is the contraction for cannot?" },
      { k: "pick", q: "'they're' is short for…", choices: ["they were", "they are", "there is"], answer: 1, say: "What is they're short for?" }
    ]
  },
  {
    n: 18, title: "Sentence Parts", emoji: "🧩", sticker: "🦉",
    steps: [
      { k: "teach", emoji: "🧩", title: "Subject and Predicate",
        text: "Every sentence has a SUBJECT (who or what it's about) and a PREDICATE (what they do). 'The dog | ran fast.' Dog = subject, ran fast = predicate.",
        say: "Every sentence has a subject, who or what it is about, and a predicate, what they do. The dog ran fast. Dog is the subject. Ran fast is the predicate." },
      { k: "pick", q: "In 'The cat slept.', the <b>subject</b> is…", choices: ["The cat", "slept"], answer: 0, say: "In the cat slept, what is the subject?" },
      { k: "pick", q: "In 'Birds fly south.', the <b>predicate</b> is…", choices: ["Birds", "fly south"], answer: 1, say: "In birds fly south, what is the predicate?" },
      { k: "pick", q: "Which part tells WHAT they DO?", choices: ["subject", "predicate"], answer: 1, say: "Which part tells what they do?" },
      { k: "pick", q: "'My little brother' is a…", choices: ["subject", "predicate"], answer: 0, say: "Is my little brother a subject or a predicate?" }
    ]
  },
  {
    n: 19, title: "Fun with Language", emoji: "🌈", sticker: "🦩",
    steps: [
      { k: "teach", emoji: "🌈", title: "Similes & Idioms",
        text: "A simile compares using 'like' or 'as': as brave as a lion. An idiom is a fun saying that doesn't mean it word-for-word: 'raining cats and dogs' means raining hard!",
        say: "A simile compares using like or as. As brave as a lion. An idiom is a fun saying that doesn't mean it word for word. Raining cats and dogs means it is raining hard." },
      { k: "pick", q: "Which is a <b>simile</b>?", choices: ["as busy as a bee", "the busy bee"], answer: 0, say: "Which one is a simile?" },
      { k: "pick", q: "'A piece of cake' means…", choices: ["very easy", "a dessert", "very hard"], answer: 0, say: "What does a piece of cake mean?" },
      { k: "pick", q: "'As fast as __' — finish the simile.", choices: ["lightning", "a rock", "a book"], answer: 0, say: "As fast as what?" },
      { k: "pick", q: "'Hit the books' means…", choices: ["study hard", "throw books", "read a comic"], answer: 0, say: "What does hit the books mean?" }
    ]
  },
  {
    n: 20, title: "Reading Time 3", emoji: "📖", sticker: "🏆",
    steps: [
      { k: "teach", emoji: "📖", title: "Read the Story",
        text: "Read this carefully:\n\n\"Maya wanted to help the birds in winter. She saved her coins for three weeks and bought a big bag of seed. Every morning before school she filled the feeder. Soon her yard was full of chirping birds, and Maya smiled every time she looked outside.\"",
        say: "Read this story. Maya wanted to help the birds in winter. She saved her coins for three weeks and bought a big bag of seed. Every morning before school she filled the feeder. Soon her yard was full of chirping birds, and Maya smiled every time she looked outside." },
      { k: "pick", q: "What did Maya want to do?", choices: ["Help the birds", "Buy a toy", "Skip school"], answer: 0, say: "What did Maya want to do?" },
      { k: "pick", q: "How long did she save her coins?", choices: ["Three weeks", "One day", "A year"], answer: 0, say: "How long did she save her coins?" },
      { k: "pick", q: "When did she fill the feeder?", choices: ["Every morning", "At night", "On weekends"], answer: 0, say: "When did she fill the feeder?" },
      { k: "pick", q: "The word <b>chirping</b> tells us the birds were…", choices: ["making sounds", "sleeping", "flying away"], answer: 0, say: "What does chirping tell us the birds were doing?" }
    ]
  }
];

/* ---------- TRACKS (the four numbered curricula) ---------- */
const TRACKS = [
  { id: "kg-math",    grade: "Kindergarten", subject: "Math",    emoji: "🐣", theme: "pink",
    name: "Kindergarten Math", blurb: "Count, compare, shapes, adding & taking away.",
    badge: { icon: "🎓", name: "Kinder Math Star" }, lessons: KG_MATH },
  { id: "kg-english", grade: "Kindergarten", subject: "English", emoji: "🐣", theme: "purple",
    name: "Kindergarten English", blurb: "Letters, sounds, rhymes, sight words & first reading.",
    badge: { icon: "🎓", name: "Kinder Reading Star" }, lessons: KG_ENGLISH },
  { id: "g3-math",    grade: "Grade 3",      subject: "Math",    emoji: "🎒", theme: "blue",
    name: "Grade 3 Math", blurb: "Place value, regrouping, times tables, division & fractions.",
    badge: { icon: "🎓", name: "Grade 3 Math Whiz" }, lessons: G3_MATH },
  { id: "g3-english", grade: "Grade 3",      subject: "English", emoji: "🎒", theme: "green",
    name: "Grade 3 English", blurb: "Nouns, verbs, synonyms, prefixes, punctuation & reading.",
    badge: { icon: "🎓", name: "Grade 3 Word Wizard" }, lessons: G3_ENGLISH }
];

/* ---------- Grand trophies (cross-track achievements) ---------- */
const HS_TROPHIES = [
  { id: "first-lesson", icon: "🌟", name: "First Lesson!",   desc: "Finish your very first lesson" },
  { id: "ten-lessons",  icon: "📚", name: "Bookworm",        desc: "Finish 10 lessons in all" },
  { id: "half-star",    icon: "⭐", name: "Rising Star",      desc: "Earn 150 points" },
  { id: "graduate",     icon: "🎓", name: "Class Graduate",  desc: "Finish a whole track" },
  { id: "valedictorian",icon: "👑", name: "Valedictorian",   desc: "Finish EVERY lesson in EVERY track" }
];

/* ---------- Milestone badges (earned by total lessons done) ---------- */
const HS_BADGES = [
  { id: "b5",  icon: "🥉", name: "Bronze Scholar",   need: 5,  desc: "5 lessons done" },
  { id: "b15", icon: "🥈", name: "Silver Scholar",   need: 15, desc: "15 lessons done" },
  { id: "b30", icon: "🥇", name: "Gold Scholar",     need: 30, desc: "30 lessons done" },
  { id: "b45", icon: "💎", name: "Diamond Scholar",  need: 45, desc: "45 lessons done" },
  { id: "b60", icon: "🏅", name: "Platinum Scholar", need: 60, desc: "60 lessons done" },
  { id: "b80", icon: "🏆", name: "Master Scholar",   need: 80, desc: "All 80 lessons done" }
];
