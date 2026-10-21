/* ============================================================
   Arabic Oasis — data (KG + 3rd grade, total beginners)
   ------------------------------------------------------------
   Standard Arabic (Fusha) letters the way schools and Quran classes
   teach them (alphabet → harakat → joining → words), mixed with
   everyday spoken basics ("Talk Time": greetings, polite words,
   numbers) so kids can USE the language from day one.

   Two tracks, picked by the Hub login's grade (or chosen on the home
   screen when nobody is logged in):
     kg — 3–4 letters a lesson, lots of pictures, Magic Words
     g3 — 7 letters a lesson, letter names, and a Talk Time step
   A phase with no `lessons` shows as "coming soon".
   Lesson kinds: "letters" (meet/game/trace [+talk]), "talk" (KG phrase lesson),
   "harakat" (3rd grade Phase 2: meet the mark / sound game / read words / trace / talk).

   Letter = { ch, name (kid spelling), ar (letter name in Arabic, for
   an Arabic voice), say (what an ENGLISH voice says when the device
   has no Arabic voice), how (Jamal's tip), dots: [count, "above"|"below"|"inside"],
   word: { ar, tr, en, e } }
   ============================================================ */

const LETTERS = {
  "ا": { name: "Alif", ar: "ألف", say: "alif", dots: [0], how: "Alif is one tall straight line, like a pencil standing up! It often says aa.", word: { ar: "أرنب", tr: "arnab", en: "rabbit", e: "🐰" } },
  "ب": { name: "Baa", ar: "باء", say: "baa", dots: [1, "below"], how: "Baa is a little boat with ONE dot underneath, like a ball under the boat. It says b!", word: { ar: "بطة", tr: "batta", en: "duck", e: "🦆" } },
  "ت": { name: "Taa", ar: "تاء", say: "taa", dots: [2, "above"], how: "Taa is the same boat with TWO dots on top, like two eyes peeking out. It says t!", word: { ar: "تفاحة", tr: "tuffaaha", en: "apple", e: "🍎" } },
  "ث": { name: "Thaa", ar: "ثاء", say: "thaa", dots: [3, "above"], how: "Thaa has THREE dots on top, like a tiny pyramid! It says th, like in think. Stick your tongue out a little!", word: { ar: "ثعلب", tr: "thaalab", en: "fox", e: "🦊" } },
  "ج": { name: "Jeem", ar: "جيم", say: "jeem", dots: [1, "inside"], how: "Jeem has a dot inside its tummy, like a jelly bean it swallowed! It says j.", word: { ar: "جمل", tr: "jamal", en: "camel", e: "🐪" } },
  "ح": { name: "Haa (breathy)", ar: "حاء", say: "haa", dots: [0], how: "This Haa looks like Jeem with NO dot. Say it like you are fogging up a mirror: haaa!", word: { ar: "حصان", tr: "hisaan", en: "horse", e: "🐴" } },
  "خ": { name: "Khaa", ar: "خاء", say: "khaa", dots: [1, "above"], how: "Khaa has one dot on its head. Make a sound like a sleepy snore: kh, kh!", word: { ar: "خروف", tr: "kharoof", en: "sheep", e: "🐑" } },
  "د": { name: "Daal", ar: "دال", say: "daal", dots: [0], how: "Daal is small and bent, like an elbow. It says d!", word: { ar: "دب", tr: "dubb", en: "bear", e: "🐻" } },
  "ذ": { name: "Dhaal", ar: "ذال", say: "thaal", dots: [1, "above"], how: "Dhaal is Daal with a dot on top. It says th, like in this!", word: { ar: "ذرة", tr: "dhura", en: "corn", e: "🌽" } },
  "ر": { name: "Raa", ar: "راء", say: "raa", dots: [0], how: "Raa is a little slide going down. Roll your r like a motor: rrr!", word: { ar: "ريشة", tr: "reesha", en: "feather", e: "🪶" } },
  "ز": { name: "Zaay", ar: "زاي", say: "zaay", dots: [1, "above"], how: "Zaay is Raa with a dot on top. Buzz like a bee: zzz!", word: { ar: "زرافة", tr: "zaraafa", en: "giraffe", e: "🦒" } },
  "س": { name: "Seen", ar: "سين", say: "seen", dots: [0], how: "Seen has three little teeth. It says sss, like a snake!", word: { ar: "سمكة", tr: "samaka", en: "fish", e: "🐟" } },
  "ش": { name: "Sheen", ar: "شين", say: "sheen", dots: [3, "above"], how: "Sheen is Seen with three dots on top. Shhh, the baby is sleeping!", word: { ar: "شمس", tr: "shams", en: "sun", e: "☀️" } },
  "ص": { name: "Saad (heavy)", ar: "صاد", say: "saad", dots: [0], how: "Saad has a big round loop. It is a heavy, strong s. Puff up your cheeks a little!", word: { ar: "صقر", tr: "saqr", en: "falcon", e: "🦅" } },
  "ض": { name: "Daad (heavy)", ar: "ضاد", say: "daad", dots: [1, "above"], how: "Daad is Saad with a dot. Arabic is called the language of Daad, because this sound is so special!", word: { ar: "ضفدع", tr: "difdaa", en: "frog", e: "🐸" } },
  "ط": { name: "Taa (heavy)", ar: "طاء", say: "taa", dots: [0], how: "This Taa is a loop with a tall stick, like a flag! It is a heavy t.", word: { ar: "طائرة", tr: "taa-ira", en: "airplane", e: "✈️" } },
  "ظ": { name: "Dhaa (heavy)", ar: "ظاء", say: "thaa", dots: [1, "above"], how: "Dhaa is the flag letter with a dot on top. A heavy th!", word: { ar: "ظرف", tr: "dharf", en: "envelope", e: "✉️" } },
  "ع": { name: "Ayn", ar: "عين", say: "ayn", dots: [0], how: "Ayn looks like a little c sitting on a tail. Squeeze the sound from your throat. It's tricky, and that's okay!", word: { ar: "عين", tr: "ayn", en: "eye", e: "👁️" } },
  "غ": { name: "Ghayn", ar: "غين", say: "ghayn", dots: [1, "above"], how: "Ghayn is Ayn with a dot. Gargle like mouthwash: gh, gh!", word: { ar: "غيمة", tr: "ghayma", en: "cloud", e: "☁️" } },
  "ف": { name: "Faa", ar: "فاء", say: "faa", dots: [1, "above"], how: "Faa has a little loop with ONE dot on top. It says fff!", word: { ar: "فيل", tr: "feel", en: "elephant", e: "🐘" } },
  "ق": { name: "Qaaf", ar: "قاف", say: "qaaf", dots: [2, "above"], how: "Qaaf has TWO dots and a deep bowl. Say k from way down deep in your throat!", word: { ar: "قطة", tr: "qitta", en: "cat", e: "🐱" } },
  "ك": { name: "Kaaf", ar: "كاف", say: "kaaf", dots: [0], how: "Kaaf has a little zigzag inside it. It says k!", word: { ar: "كلب", tr: "kalb", en: "dog", e: "🐶" } },
  "ل": { name: "Laam", ar: "لام", say: "laam", dots: [0], how: "Laam is tall with a hook at the bottom, like a fishing hook! It says l.", word: { ar: "ليمون", tr: "laymoon", en: "lemon", e: "🍋" } },
  "م": { name: "Meem", ar: "ميم", say: "meem", dots: [0], how: "Meem has a little round head and a tail. It says mmm, yummy!", word: { ar: "موز", tr: "mawz", en: "banana", e: "🍌" } },
  "ن": { name: "Noon", ar: "نون", say: "noon", dots: [1, "above"], how: "Noon is a round bowl with one dot, like a marble in a bowl! It says n.", word: { ar: "نحلة", tr: "nahla", en: "bee", e: "🐝" } },
  "ه": { name: "Haa (soft)", ar: "هاء", say: "haa", dots: [0], how: "This Haa is round, like a little face. Breathe out softly: h.", word: { ar: "هدية", tr: "hadiyya", en: "gift", e: "🎁" } },
  "و": { name: "Waaw", ar: "واو", say: "waaw", dots: [0], how: "Waaw has a round head and a tail curling down. It says w, or oo!", word: { ar: "وردة", tr: "warda", en: "rose", e: "🌹" } },
  "ي": { name: "Yaa", ar: "ياء", say: "yaa", dots: [2, "below"], how: "Yaa has TWO dots underneath, like two little feet! It says y, or ee.", word: { ar: "يد", tr: "yad", en: "hand", e: "✋" } }
};

/* consonant sound of each letter, for reading syllables (ba, bi, bu) */
const CONS = { "ب": "b", "ت": "t", "ث": "th", "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r", "ز": "z", "س": "s", "ش": "sh",
  "ص": "s", "ض": "d", "ط": "t", "ظ": "dh", "ع": "'", "غ": "gh", "ف": "f", "ق": "q", "ك": "k", "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y" };

/* the three short vowels (harakat). v = how the syllable is written in English letters,
   fb = what an English voice says for it when there is no Arabic voice */
const HARAKAT = {
  fatha: { mark: "\u064E", name: "Fatha", v: "a", fb: "ah", where: "a little slash ON TOP", how: "Fatha is a little slash on top of the letter. It says a, like in apple. Open your mouth wide, like a hungry lion: ba, ta, ja!", e: "🦁" },
  kasra: { mark: "\u0650", name: "Kasra", v: "i", fb: "ee", where: "a little slash UNDERNEATH", how: "Kasra is a little slash under the letter. It says i, like in sit. Smile wide, like you're taking a photo: bi, ti, ji!", e: "📸" },
  damma: { mark: "\u064F", name: "Damma", v: "u", fb: "oo", where: "a tiny curly waaw ON TOP", how: "Damma looks like a tiny curly waaw on top. It says u, like in put. Make your lips round, like you're blowing a kiss: bu, tu, ju!", e: "😗" }
};

/* letters that look alike — the best wrong answers ("dot detective") */
const LOOKALIKE = [["ب", "ت", "ث", "ن", "ي"], ["ج", "ح", "خ"], ["د", "ذ"], ["ر", "ز"], ["س", "ش"], ["ص", "ض"], ["ط", "ظ"], ["ع", "غ"], ["ف", "ق"]];

/* Talk Time phrase packs. q = situation questions: "what would you say?" */
const TALK = {
  greet: { title: "Hello & Goodbye", phrases: [
    { ar: "السلام عليكم", tr: "as-salaamu alaykum", en: "Hello! (Peace be upon you)", e: "👋" },
    { ar: "وعليكم السلام", tr: "wa alaykumus-salaam", en: "Hello back! (And peace upon you too)", e: "🤝" },
    { ar: "صباح الخير", tr: "sabaahul khayr", en: "Good morning", e: "🌅" },
    { ar: "مع السلامة", tr: "maa as-salaama", en: "Goodbye", e: "🚪" } ],
    q: [{ q: "You meet your friend at school in the morning. What do you say?", a: "صباح الخير" },
        { q: "Someone says “as-salaamu alaykum” to you. What do you say back?", a: "وعليكم السلام" },
        { q: "It's time to go home. What do you say to your teacher?", a: "مع السلامة" }] },
  polite: { title: "Magic Polite Words", phrases: [
    { ar: "شكرا", tr: "shukran", en: "Thank you", e: "🙏" },
    { ar: "عفوا", tr: "afwan", en: "You're welcome", e: "😊" },
    { ar: "نعم", tr: "naam", en: "Yes", e: "👍" },
    { ar: "لا", tr: "laa", en: "No", e: "👎" } ],
    q: [{ q: "Grandma gives you a cookie. What do you say?", a: "شكرا" },
        { q: "Your friend says “shukran” to you. What do you say?", a: "عفوا" },
        { q: "Do you want ice cream? Of course! What do you say?", a: "نعم" }] },
  me: { title: "All About Me", phrases: [
    { ar: "ما اسمك؟", tr: "maa ismuk?", en: "What's your name?", e: "❓" },
    { ar: "اسمي…", tr: "ismee…", en: "My name is…", e: "🙋" },
    { ar: "كيف حالك؟", tr: "kayfa haaluk?", en: "How are you?", e: "🤔" },
    { ar: "أنا بخير", tr: "ana bikhayr", en: "I'm fine", e: "😄" } ],
    q: [{ q: "You want to know a new friend's name. What do you ask?", a: "ما اسمك؟" },
        { q: "Someone asks “kayfa haaluk?” and you feel great. What do you say?", a: "أنا بخير" },
        { q: "You want to tell someone your name. How do you start?", a: "اسمي…" }] },
  count: { title: "Count to Five", phrases: [
    { ar: "واحد", tr: "waahid", en: "One", e: "1️⃣" },
    { ar: "اثنان", tr: "ithnaan", en: "Two", e: "2️⃣" },
    { ar: "ثلاثة", tr: "thalaatha", en: "Three", e: "3️⃣" },
    { ar: "أربعة", tr: "arbaa", en: "Four", e: "4️⃣" },
    { ar: "خمسة", tr: "khamsa", en: "Five", e: "5️⃣" } ],
    q: [{ q: "How many eyes do you have? 👀", a: "اثنان" },
        { q: "How many fingers on one hand? ✋", a: "خمسة" },
        { q: "How many noses do you have? 👃", a: "واحد" }] },
  colors: { title: "Colors", phrases: [
    { ar: "أحمر", tr: "ahmar", en: "Red", e: "🔴" },
    { ar: "أزرق", tr: "azraq", en: "Blue", e: "🔵" },
    { ar: "أخضر", tr: "akhdar", en: "Green", e: "🟢" },
    { ar: "أصفر", tr: "asfar", en: "Yellow", e: "🟡" } ],
    q: [{ q: "What color is a banana? 🍌", a: "أصفر" },
        { q: "What color is the sky on a sunny day? ☀️", a: "أزرق" },
        { q: "What color is the grass? 🌱", a: "أخضر" },
        { q: "What color is a strawberry? 🍓", a: "أحمر" }] },
  family: { title: "My Family", phrases: [
    { ar: "أب", tr: "ab", en: "Dad", e: "👨" },
    { ar: "أم", tr: "umm", en: "Mom", e: "👩" },
    { ar: "أخ", tr: "akh", en: "Brother", e: "👦" },
    { ar: "أخت", tr: "ukht", en: "Sister", e: "👧" } ],
    q: [{ q: "Who is the mommy of your family?", a: "أم" },
        { q: "A boy who has the same mom and dad as you is your…", a: "أخ" },
        { q: "A girl who has the same mom and dad as you is your…", a: "أخت" }] },
  food: { title: "Yummy Food", phrases: [
    { ar: "ماء", tr: "maa", en: "Water", e: "💧" },
    { ar: "خبز", tr: "khubz", en: "Bread", e: "🍞" },
    { ar: "حليب", tr: "haleeb", en: "Milk", e: "🥛" },
    { ar: "تمر", tr: "tamr", en: "Dates", e: "🌴" } ],
    q: [{ q: "You are very thirsty after playing. What do you ask for?", a: "ماء" },
        { q: "You want to make a sandwich. What do you need?", a: "خبز" },
        { q: "What comes from a cow and goes on cereal? 🐄", a: "حليب" }] },
  feelings: { title: "How I Feel", phrases: [
    { ar: "سعيد", tr: "saeed", en: "Happy", e: "😄" },
    { ar: "حزين", tr: "hazeen", en: "Sad", e: "😢" },
    { ar: "جائع", tr: "jaai", en: "Hungry", e: "🍽️" },
    { ar: "متعب", tr: "mutaab", en: "Tired", e: "😴" } ],
    q: [{ q: "It's your birthday and you got a puppy! How do you feel?", a: "سعيد" },
        { q: "You stayed up way too late. How do you feel?", a: "متعب" },
        { q: "Your tummy is growling! How do you feel?", a: "جائع" }] },
  magic: { title: "Magic Words", phrases: [
    { ar: "مرحبا", tr: "marhaban", en: "Hello!", e: "👋" },
    { ar: "شكرا", tr: "shukran", en: "Thank you", e: "🙏" },
    { ar: "نعم", tr: "naam", en: "Yes", e: "👍" },
    { ar: "لا", tr: "laa", en: "No", e: "👎" } ],
    q: [{ q: "Mommy gives you a hug. What do you say?", a: "شكرا" },
        { q: "You see your friend. What do you say?", a: "مرحبا" },
        { q: "Do you want to eat a yucky bug? What do you say?", a: "لا" }] }
};

const TRACKS = {
  kg: { title: "Little Explorers", sub: "Kindergarten path", emoji: "🐣" },
  g3: { title: "Alphabet Caravan", sub: "3rd-grade path", emoji: "🎒" }
};

const PHASES = {
  kg: [
    { id: "k1", n: 1, title: "Alif, Baa, Taa!", sub: "First letters + Magic Words", emoji: "🌴", color: "#ffd8a8", accent: "#f08c00",
      lessons: [
        { id: "ak1", kind: "letters", title: "ا ب ت ث", letters: ["ا", "ب", "ت", "ث"], sticker: { emoji: "🐰", name: "Arnab the Rabbit" } },
        { id: "ak2", kind: "letters", title: "ج ح خ", letters: ["ج", "ح", "خ"], sticker: { emoji: "🐪", name: "Jamal Jr." } },
        { id: "ak3", kind: "letters", title: "د ذ ر ز", letters: ["د", "ذ", "ر", "ز"], sticker: { emoji: "🦒", name: "Zaraafa the Giraffe" } },
        { id: "ak4", kind: "talk", title: "Magic Words", talk: "magic", sticker: { emoji: "🙏", name: "Shukran Star" } }
      ] },
    { id: "k2", n: 2, title: "More Letters", sub: "س ش ص ض ط ظ + Colors", emoji: "🐟", color: "#a5d8ff", accent: "#1c7ed6",
      lessons: [
        { id: "ak5", kind: "letters", title: "س ش", letters: ["س", "ش"], sticker: { emoji: "☀️", name: "Shams the Sun" } },
        { id: "ak6", kind: "letters", title: "ص ض", letters: ["ص", "ض"], sticker: { emoji: "🐸", name: "Difdaa the Frog" } },
        { id: "ak7", kind: "letters", title: "ط ظ", letters: ["ط", "ظ"], sticker: { emoji: "✈️", name: "Taa-ira the Plane" } },
        { id: "ak8", kind: "talk", title: "Colors", talk: "colors", sticker: { emoji: "🌈", name: "Rainbow Camel" } }
      ] },
    { id: "k3", n: 3, title: "Last Letters", sub: "ع غ ف ق ك ل م ن ه و ي", emoji: "🐘", color: "#b2f2bb", accent: "#2f9e44" },
    { id: "k4", n: 4, title: "Little Vowels", sub: "Fatha, kasra, damma: ba, bi, bu", emoji: "🎵", color: "#d0bfff", accent: "#7048e8" },
    { id: "k5", n: 5, title: "My First Words", sub: "Read short words with pictures", emoji: "🍎", color: "#ffc9c9", accent: "#e03131" },
    { id: "k6", n: 6, title: "Words I Can Write", sub: "Trace and write little words", emoji: "✍️", color: "#fff3bf", accent: "#f59f00" }
  ],
  g3: [
    { id: "g1", n: 1, title: "Alphabet Caravan", sub: "All 28 letters + Talk Time", emoji: "🐪", color: "#ffd8a8", accent: "#f08c00",
      lessons: [
        { id: "ag1", kind: "letters", title: "ا ب ت ث ج ح خ", letters: ["ا", "ب", "ت", "ث", "ج", "ح", "خ"], talk: "greet", sticker: { emoji: "🐪", name: "Caravan Camel" } },
        { id: "ag2", kind: "letters", title: "د ذ ر ز س ش ص", letters: ["د", "ذ", "ر", "ز", "س", "ش", "ص"], talk: "polite", sticker: { emoji: "☀️", name: "Desert Sun" } },
        { id: "ag3", kind: "letters", title: "ض ط ظ ع غ ف ق", letters: ["ض", "ط", "ظ", "ع", "غ", "ف", "ق"], talk: "me", sticker: { emoji: "🦅", name: "Saqr the Falcon" } },
        { id: "ag4", kind: "letters", title: "ك ل م ن ه و ي", letters: ["ك", "ل", "م", "ن", "ه", "و", "ي"], talk: "count", sticker: { emoji: "🌙", name: "Oasis Moon" } }
      ] },
    { id: "g2", n: 2, title: "Harakat Station", sub: "Fatha, kasra, damma: read ba, bi, bu", emoji: "🎵", color: "#a5d8ff", accent: "#1c7ed6",
      // harakat lesson: marks = new mark(s), letters = syllables to practise, words = short words to read
      lessons: [
        { id: "ag5", kind: "harakat", title: "Fatha: ba ta ja", marks: ["fatha"], letters: ["ب", "ت", "ج", "د", "ر", "س", "م"], talk: "colors",
          words: [{ ar: "كَتَبَ", en: "he wrote", e: "✍️" }, { ar: "جَلَسَ", en: "he sat", e: "🪑" }, { ar: "رَسَمَ", en: "he drew", e: "🎨" }, { ar: "فَتَحَ", en: "he opened", e: "🚪" }],
          sticker: { emoji: "🦁", name: "Fatha Lion" } },
        { id: "ag6", kind: "harakat", title: "Kasra: bi ti ji", marks: ["kasra"], letters: ["ب", "ف", "ك", "ل", "ن", "ق", "ش"], talk: "family",
          words: [{ ar: "شَرِبَ", en: "he drank", e: "🥤" }, { ar: "لَعِبَ", en: "he played", e: "⚽" }, { ar: "سَمِعَ", en: "he heard", e: "👂" }, { ar: "ضَحِكَ", en: "he laughed", e: "😂" }],
          sticker: { emoji: "📸", name: "Kasra Smile" } },
        { id: "ag7", kind: "harakat", title: "Damma: bu tu ju", marks: ["damma"], letters: ["ب", "ت", "د", "ك", "ل", "س", "ن"], talk: "food",
          words: [{ ar: "كُتِبَ", en: "it was written", e: "📝" }, { ar: "فُتِحَ", en: "it was opened", e: "📦" }, { ar: "رُسِمَ", en: "it was drawn", e: "🖍️" }, { ar: "حُمِلَ", en: "it was carried", e: "🎒" }],
          sticker: { emoji: "😗", name: "Damma Kiss" } },
        { id: "ag8", kind: "harakat", title: "Harakat Mix", marks: ["fatha", "kasra", "damma"], letters: ["ب", "د", "ر", "س", "ق", "ك", "ل"], talk: "feelings", mix: true,
          words: [{ ar: "كَبُرَ", en: "it grew big", e: "🌳" }, { ar: "صَغُرَ", en: "it got small", e: "🐜" }, { ar: "لَعِبَ", en: "he played", e: "⚽" }, { ar: "كُتِبَ", en: "it was written", e: "📝" }],
          sticker: { emoji: "🎵", name: "Harakat Hero" } }
      ] },
    { id: "g3", n: 3, title: "Sukoon, Shadda & Tanween", sub: "Stop signs, double letters, -an -in -un", emoji: "🛑", color: "#d0bfff", accent: "#7048e8" },
    { id: "g4", n: 4, title: "Letters Hold Hands", sub: "Beginning, middle and end shapes", emoji: "🤝", color: "#b2f2bb", accent: "#2f9e44" },
    { id: "g5", n: 5, title: "Word Market", sub: "Colors, family, food & school words", emoji: "🛍️", color: "#ffc9c9", accent: "#e03131" },
    { id: "g6", n: 6, title: "Sentence Oasis", sub: "Read and write short sentences", emoji: "🌴", color: "#fff3bf", accent: "#f59f00" }
  ]
};

const PRAISE = {
  right: ["Mumtaaz! That means excellent!", "Ahsant! Well done!", "Yes! You're a desert star!", "Correct! My hump is dancing!", "Shaatir! That means clever!", "Raa-i! That means wonderful!"],
  oops: ["Good try! Look again, carefully.", "Hmm, so close! Try another one.", "Not quite. Check the dots!"],
  trace: ["Beautiful writing! Jameel!", "Wow, a real Arabic writer!", "Mumtaaz! That letter looks perfect!", "Ahsant! My hump is so proud!"],
  traceOff: ["Oopsie! Stay on the letter, like a camel on the path.", "Whoa, that wandered into the desert! Try again."],
  dots: ["Great body! Now don't forget the dots!", "Almost! The dots are part of the letter, too!"],
  mark: ["Great letter! Now don't forget the little mark!", "Almost! The haraka is part of the sound, so trace it too!"],
  read: ["You read Arabic! That's amazing!", "Wow, a real Arabic reader!", "Mumtaaz! Every sound was in the right place!"],
  said: ["I heard you! Beautiful Arabic!", "Wow, you sound like a real Arabic speaker!", "Ahsant! Say it again tomorrow and you'll never forget it!"]
};

const JOKES = [
  "My name is Jamal, and jamal means camel. So I'm Camel the Camel!",
  "Why do camels love Arabic? Because it has so many dots to count on the long trip!",
  "I can walk for days without water, but I can't go one minute without learning!",
  "What do you call a camel with three humps? Humphrey! Ha ha!",
  "Arabic goes from right to left. I go from left to right. We meet in the middle for snacks!",
  "Baa, taa, thaa! No, I'm not a sheep. Those are letters!"
];

const AR_TROPHIES = [
  { id: "first-letter", icon: "🔤", name: "First Letter", desc: "Meet your first Arabic letter" },
  { id: "first-lesson", icon: "🐪", name: "Caravan Start", desc: "Finish your first lesson" },
  { id: "dot-detective", icon: "🔍", name: "Dot Detective", desc: "Answer 5 dot questions right" },
  { id: "writer", icon: "✍️", name: "Arabic Writer", desc: "Trace 10 letters" },
  { id: "talker", icon: "🗣️", name: "Chatterbox", desc: "Say 10 Arabic words out loud" },
  { id: "all-letters", icon: "👑", name: "Alphabet Champion", desc: "Meet all 28 letters" },
  { id: "phase-1", icon: "🏅", name: "Oasis Star", desc: "Finish Phase 1" },
  { id: "phase-2", icon: "🎵", name: "Oasis Explorer", desc: "Finish Phase 2" },
  { id: "reader", icon: "📖", name: "Arabic Reader", desc: "Read 8 Arabic words with harakat" }
];
