/* ============================================================
   syllabus.js — the Academy's PreK–5 scope and sequence
   ------------------------------------------------------------
   One combined syllabus built from three national curricula:
     US  Common Core (math, English), NGSS (science), C3 (social
         studies), CSTA (computing), NHES (health); Head Start
         ELOF for Pre-K
     UK  National Curriculum for England (EYFS, KS1, KS2),
         Relationships & Health Education
     SE  Sweden's Lgr22 (förskoleklass and years 1–6) and Lpfö 18
         (preschool)
   Grades line up by age: Pre-K 4–5 = UK Reception = SE förskola;
   KG 5–6 = UK Year 1 = SE förskoleklass; Grade n = UK Year n+1 =
   SE year n.

   How they are combined: US grade-by-grade standards set the
   spine and the order; the UK adds its earlier fluency targets
   (systematic phonics, all times tables to 12 by Grade 3, ancient
   history); Sweden adds outdoor and hands-on inquiry, problem
   solving, democracy and children's rights, sustainability,
   source criticism and programming from the start.

   Data: SUBJECTS (the Academy's subjects) and UNITS[grade][subject]
   = numbered units. A unit is
     [emoji, title, ["I can …" goals], US ref, UK ref, SE ref, acts?]
   where acts lists catalog ids (js/catalog.js) whose apps already
   practise that unit. Lessons are added unit by unit later; the
   Hub shows a unit's goals and its apps until then.
   ============================================================ */
(function (root) {
  "use strict";

  var SUBJECTS = [
    { id: "math",      name: "Math",               emoji: "➗", color: "#339af0", catalog: "math",
      about: "Numbers, operations, fractions, measurement, shapes and data, with fluency first and problem solving every week." },
    { id: "english",   name: "English",            emoji: "📖", color: "#e64980", catalog: "language", lang: "english",
      about: "Speaking and listening, phonics, reading for meaning, writing, grammar and spelling." },
    { id: "science",   name: "Science",            emoji: "🔬", color: "#20c997", catalog: "science",
      about: "Living things, matter, forces and energy, Earth and space, learned by asking, testing and observing." },
    { id: "social",    name: "Social Studies",     emoji: "🌎", color: "#f08c00", catalog: "social",
      about: "Me and my community, maps and places, history, how we govern ourselves, money and trade, beliefs and rights." },
    { id: "computing", name: "Computing",          emoji: "💻", color: "#5c7cfa",
      about: "Algorithms and coding, how computers and the internet work, data, and staying safe and kind online." },
    { id: "health",    name: "Health & Life Skills", emoji: "💚", color: "#40c057",
      about: "Feelings, friendships, healthy bodies, safety, growing up, and money sense." }
  ];
  // Kept from the Hub: Tamil and Arabic (Sweden's mother-tongue tuition idea), the grown-ups' AdHoc subject, the Fun Zone.
  var EXTRAS = [
    { id: "languages", name: "World Languages", emoji: "🗣️", color: "#cc5de8", catalog: "language", langs: ["tamil", "arabic"] },
    // A card that opens its own app (href) for the listed grades only.
    { id: "spellingbee", name: "Spelling Bee", emoji: "🐝", color: "#f59f00", href: "spellingbee/index.html", grades: ["g3"],
      note: "Bee words, honeycombs and contests" },
    // Printable worksheets for every grade and subject (worksheets/)
    { id: "worksheets", name: "Worksheets", emoji: "📄", color: "#495057", href: "worksheets/index.html",
      note: "Print or save as PDF, with answer keys" },
    { id: "adhoc",     name: "AdHoc",           emoji: "🧪", color: "#868e96", setting: "adhoc" }
  ];
  var GRADES = ["pk", "kg", "g1", "g2", "g3", "g4", "g5"];
  var MATCH = {
    pk: { us: "Pre-K (age 4–5)", uk: "Reception (EYFS)", se: "Förskola (Lpfö 18)" },
    kg: { us: "Kindergarten (5–6)", uk: "Year 1", se: "Förskoleklass" },
    g1: { us: "Grade 1 (6–7)", uk: "Year 2", se: "Year 1" },
    g2: { us: "Grade 2 (7–8)", uk: "Year 3", se: "Year 2" },
    g3: { us: "Grade 3 (8–9)", uk: "Year 4", se: "Year 3" },
    g4: { us: "Grade 4 (9–10)", uk: "Year 5", se: "Year 4" },
    g5: { us: "Grade 5 (10–11)", uk: "Year 6", se: "Year 5" }
  };
  var PRINCIPLES = [
    ["🧱", "Fluency first", "Number facts, phonics and handwriting are practised until they are automatic (UK mastery), so thinking time goes to problems."],
    ["🔎", "Learn by finding out", "Every science and social studies unit starts with a question to investigate, often outdoors (Sweden)."],
    ["🪜", "Small steps, in order", "Each grade builds on the one before, following the US grade-by-grade standards."],
    ["🗳️", "Fairness and rights", "Children learn how rules, voting and rights work, including the UN Convention on the Rights of the Child (Sweden)."],
    ["🌱", "Care for the planet", "Sustainability shows up in science, social studies and health every year."],
    ["🧐", "Check your sources", "From Grade 2, children ask who made a text or website and whether to trust it (Sweden's source criticism)."],
    ["🤖", "Code from the start", "Step-by-step instructions in KG, block coding by Grade 1, variables and data by Grade 5 (all three countries)."]
  ];

  function U(e, t, g, us, uk, se, acts) { return { emoji: e, title: t, goals: g, us: us, uk: uk, se: se, acts: acts || [] }; }

  var UNITS = {
    /* ================= PRE-K ================= */
    pk: {
      math: [
        U("🔢", "Counting 1 to 10", ["I can count objects one at a time.", "I can say numbers in order to 10.", "I know the last number I say is how many."], "ELOF Math: counting", "EYFS Mathematics: number", "Lpfö 18: number sense", ["kinder-math"]),
        U("⚖️", "More, Fewer, Same", ["I can tell which group has more.", "I can match groups that have the same amount."], "ELOF Math: comparing", "EYFS Mathematics: comparing quantities", "Lpfö 18: quantity"),
        U("🔺", "Shapes Around Me", ["I can name a circle, square, triangle and rectangle.", "I can find shapes in my room."], "ELOF Math: geometry", "EYFS Mathematics: shape", "Lpfö 18: shape and space", ["kinder-math"]),
        U("🔁", "Patterns and Sorting", ["I can sort things by colour, size or shape.", "I can copy and continue a pattern."], "ELOF Math: patterns", "EYFS Mathematics: pattern", "Lpfö 18: patterns"),
        U("📏", "Big and Small, Long and Short", ["I can compare size, length and weight.", "I can put things in order from smallest to biggest."], "ELOF Math: measurement", "EYFS Mathematics: measures", "Lpfö 18: measurement")
      ],
      english: [
        U("👂", "Listen and Talk", ["I can listen to a story and talk about it.", "I can answer who and what questions."], "ELOF Language & communication", "EYFS Communication & language", "Lpfö 18: language"),
        U("🎵", "Rhymes and Sounds", ["I can hear words that rhyme.", "I can clap the beats in my name."], "ELOF Literacy: phonological awareness", "EYFS Literacy: phase 1 phonics", "Lpfö 18: language play"),
        U("🔤", "Letters and Their Sounds", ["I can say some letter names and sounds.", "I can find the first letter of my name."], "ELOF Literacy: alphabet knowledge", "EYFS Literacy: phase 2 phonics", "Lpfö 18: written language", ["kinder-letters", "speedway-letters"]),
        U("📚", "How Books Work", ["I can hold a book and turn pages.", "I know we read words from left to right."], "ELOF Literacy: print concepts", "EYFS Literacy: comprehension", "Lpfö 18: books and stories", ["phonics"]),
        U("🖍️", "Marks, Lines and My Name", ["I can hold a crayon well.", "I can trace lines and try writing my name."], "ELOF Literacy: emergent writing", "EYFS Physical development: fine motor; Literacy: writing", "Lpfö 18: creating with text", ["tracewrite"])
      ],
      science: [
        U("👀", "My Five Senses", ["I can name my five senses.", "I can describe what I see, hear, smell, taste and touch."], "ELOF Science: inquiry", "EYFS Understanding the world", "Lpfö 18: natural science", ["quiz-senses"]),
        U("🌦️", "Weather and Seasons", ["I can say if it is sunny, rainy, windy or snowy.", "I can name the four seasons."], "ELOF Science: earth", "EYFS Understanding the world: natural world", "Lpfö 18: nature through the year"),
        U("🌱", "Plants Grow", ["I know a seed needs water and light to grow.", "I can name roots, stem, leaves and flowers."], "ELOF Science: life", "EYFS Understanding the world: plants", "Lpfö 18: living things"),
        U("🐣", "Animals and Their Babies", ["I can match animal babies to their parents.", "I can say where some animals live."], "ELOF Science: life", "EYFS Understanding the world: animals", "Lpfö 18: living things"),
        U("🛝", "Push, Pull, Sink, Float", ["I can push and pull things to make them move.", "I can guess if something will sink or float, then test it."], "ELOF Science: physical", "EYFS Understanding the world: exploring", "Lpfö 18: simple physics")
      ],
      social: [
        U("👪", "Me and My Family", ["I can say my name and who is in my family.", "I know families can look different."], "ELOF Social studies: self and family", "EYFS PSED; Understanding the world: past and present", "Lpfö 18: identity"),
        U("🏠", "My Home and Neighbourhood", ["I can name places near my home.", "I can draw a simple map of my room."], "ELOF Social studies: geography", "EYFS Understanding the world: people and communities", "Lpfö 18: local area"),
        U("🚒", "People Who Help Us", ["I can name helpers like firefighters, doctors and teachers.", "I know how each one helps."], "ELOF Social studies: community", "EYFS Understanding the world: people who help us", "Lpfö 18: society", ["quiz-helpers"]),
        U("🤝", "Rules and Taking Turns", ["I can follow class rules.", "I can wait for my turn."], "ELOF Social studies: civics", "EYFS PSED: managing self", "Lpfö 18: democracy and values"),
        U("🎉", "Celebrations", ["I can talk about a celebration in my family.", "I can learn about celebrations of others."], "ELOF Social studies: culture", "EYFS Understanding the world: festivals", "Lpfö 18: cultural diversity")
      ],
      computing: [
        U("📱", "Devices Around Me", ["I can name a tablet, a computer and a phone.", "I know screen time has limits."], "CSTA (pre-K): computing systems", "EYFS Understanding the world: technology", "Lpfö 18: digital tools"),
        U("👣", "Step by Step", ["I can follow steps in order, like washing my hands.", "I can tell a friend steps to follow."], "CSTA (pre-K): algorithms", "EYFS: following instructions", "Lpfö 18: step-by-step instructions"),
        U("🤖", "Robot Games", ["I can move like a robot: forward, back, turn.", "I can fix a step that went wrong."], "CSTA (pre-K): unplugged programming", "EYFS: directional language", "Lpfö 18: programming play"),
        U("🙋", "Ask a Grown-Up", ["I ask a grown-up before I go online.", "I tell a grown-up if something online upsets me."], "CSTA (pre-K): safety", "EYFS PSED: keeping safe", "Lpfö 18: digital safety")
      ],
      health: [
        U("😊", "My Feelings", ["I can name happy, sad, angry and scared.", "I can show a feeling on my face."], "NHES: emotional health", "EYFS PSED: self-regulation", "Lpfö 18: emotions"),
        U("🧼", "Clean Hands, Healthy Me", ["I can wash my hands the right way.", "I cover my cough and sneeze."], "NHES: healthy behaviours", "EYFS Physical development: self-care", "Lpfö 18: health and wellbeing"),
        U("🍎", "Food That Helps Me Grow", ["I can name healthy foods.", "I know water is a great drink."], "NHES: nutrition", "EYFS Physical development: healthy eating", "Lpfö 18: health"),
        U("🧸", "Being a Friend", ["I can share and play kindly.", "I can say sorry and make up."], "NHES: interpersonal skills", "EYFS PSED: building relationships", "Lpfö 18: values"),
        U("🚦", "Staying Safe", ["I hold a grown-up's hand near roads.", "I know my grown-up's name."], "NHES: safety", "EYFS PSED: keeping safe", "Lpfö 18: safety")
      ]
    },

    /* ================= KINDERGARTEN ================= */
    kg: {
      math: [
        U("💯", "Count to 100", ["I can count to 100 by ones and by tens.", "I can count on from any number."], "CCSS K.CC", "Y1 Number: place value", "Lgr22 Ma: understanding numbers", ["kinder-math", "homeschool-kg-math"]),
        U("✍️", "Numbers 0 to 20", ["I can read and write numbers 0 to 20.", "I can show a number with objects."], "CCSS K.CC", "Y1 Number: place value", "Lgr22 Ma: understanding numbers", ["kinder-math"]),
        U("⚖️", "Compare Numbers", ["I can tell which number is greater or less.", "I can compare two groups."], "CCSS K.CC", "Y1 Number: comparing", "Lgr22 Ma: understanding numbers"),
        U("➕", "Adding and Subtracting to 10", ["I can add and take away within 10.", "I can solve a story problem with objects."], "CCSS K.OA", "Y1 Addition & subtraction", "Lgr22 Ma: number operations", ["speedway", "homeschool-kg-math"]),
        U("🔟", "Make 10", ["I can find the number that makes 10 with another.", "I can split numbers to 10 in different ways."], "CCSS K.OA.4", "Y1 Number bonds to 10", "Lgr22 Ma: number operations"),
        U("🧱", "Teen Numbers: Ten and Some More", ["I can show 11 to 19 as ten and some ones.", "I can build teen numbers with blocks."], "CCSS K.NBT", "Y1 Place value", "Lgr22 Ma: place value"),
        U("📏", "Measure and Sort", ["I can compare length and weight.", "I can sort and count objects in groups."], "CCSS K.MD", "Y1 Measurement", "Lgr22 Ma: measurement"),
        U("🧊", "Flat and Solid Shapes", ["I can name 2D and 3D shapes.", "I can say where something is: above, below, beside."], "CCSS K.G", "Y1 Geometry: shape and position", "Lgr22 Ma: geometry", ["kinder-math"])
      ],
      english: [
        U("🔤", "Letter Sounds", ["I know the sound of every letter.", "I can hear the first sound in a word."], "CCSS RF.K.3", "Y1 Phonics: phase 2–3", "Lgr22 Sv: reading and writing", ["kinder-letters", "speedway-letters", "phonics"]),
        U("🧩", "Blend and Read CVC Words", ["I can blend sounds to read words like cat and sun.", "I can split a word into its sounds."], "CCSS RF.K.2", "Y1 Phonics: blending", "Lgr22 Sv: reading strategies", ["phonics", "homeschool-kg-eng"]),
        U("👀", "Sight Words", ["I can read common words like the, and, is.", "I can find sight words in a book."], "CCSS RF.K.3c", "Y1 Common exception words", "Lgr22 Sv: reading", ["homeschool-kg-eng"]),
        U("🐚", "Two Letters, One Sound", ["I can read sh, ch, th and ck.", "I can read words with these sounds."], "CCSS RF.K.3", "Y1 Phonics: phase 3 digraphs", "Lgr22 Sv: sound and letter", ["phonics"]),
        U("📖", "Story Time", ["I can retell a story in order.", "I can name the characters and the setting."], "CCSS RL.K", "Y1 Reading: comprehension", "Lgr22 Sv: narrative texts", ["readingadventures"]),
        U("🔍", "Fact Books", ["I can say what a fact book is about.", "I can ask and answer questions about it."], "CCSS RI.K", "Y1 Reading: non-fiction", "Lgr22 Sv: factual texts"),
        U("🖍️", "Write Letters and Words", ["I can write my letters the right way.", "I can write words using their sounds."], "CCSS L.K.1a; W.K", "Y1 Handwriting; spelling", "Lgr22 Sv: handwriting", ["tracewrite"]),
        U("✏️", "My First Sentences", ["I can write a sentence with a capital letter and a full stop.", "I can leave spaces between words."], "CCSS L.K.2; W.K.3", "Y1 Writing: composition", "Lgr22 Sv: writing")
      ],
      science: [
        U("🌱", "What Living Things Need", ["I know plants and animals need food, water and air.", "I can tell living from non-living."], "NGSS K-LS1-1", "Y1 Plants; Animals incl. humans", "Lgr22 NO: the year round in nature", ["funfacts"]),
        U("🐾", "Animals and Their Bodies", ["I can name animal groups like birds, fish and mammals.", "I can name parts of my body."], "NGSS K-LS1", "Y1 Animals incl. humans", "Lgr22 NO: body and health", ["funfacts"]),
        U("👀", "Using My Senses", ["I can use my senses to observe.", "I can describe what I notice."], "NGSS K-2 practices", "Y1 Animals incl. humans: senses", "Lgr22 NO: methods and ways of working", ["quiz-senses"]),
        U("⛅", "Weather Watch", ["I can record the weather each day.", "I can describe weather in each season."], "NGSS K-ESS2-1; K-ESS3-2", "Y1 Seasonal changes", "Lgr22 NO: the year round in nature"),
        U("☀️", "Sunlight Warms the Earth", ["I know sunlight warms sand, water and rocks.", "I can build a shade to stay cool."], "NGSS K-PS3", "Y1 Seasonal changes", "Lgr22 NO: force and motion"),
        U("🛝", "Pushes and Pulls", ["I can make things move faster, slower or change direction.", "I can test a push."], "NGSS K-PS2", "Y1 Working scientifically", "Lgr22 NO: force and motion"),
        U("🪵", "Everyday Materials", ["I can name wood, plastic, glass, metal and fabric.", "I can sort things by what they are made of."], "NGSS K-2 (with 2-PS1)", "Y1 Everyday materials", "Lgr22 NO: materials and substances")
      ],
      social: [
        U("📏", "Rules and Being Fair", ["I know why we have rules.", "I can help make a fair class rule."], "C3 Civics K-2", "Citizenship: rules", "Lgr22 SO: living together"),
        U("👪", "Families Then and Now", ["I can compare life long ago and today.", "I can ask an older person about their childhood."], "C3 History K-2", "KS1 History: changes within living memory", "Lgr22 SO: living in the local area"),
        U("🚒", "Community Helpers", ["I can name jobs that help my community.", "I know how to get help in an emergency."], "C3 Civics K-2", "KS1: people who help us", "Lgr22 SO: living together", ["quiz-helpers"]),
        U("🛒", "Needs and Wants", ["I can tell a need from a want.", "I know people work to earn money."], "C3 Economics K-2", "KS1 Citizenship: money", "Lgr22 SO: living together"),
        U("🗺️", "Maps and Globes", ["I know a map is a drawing of a place from above.", "I can find land and water on a globe."], "C3 Geography K-2", "KS1 Geography: simple maps", "Lgr22 SO: living in the world"),
        U("🎆", "Symbols and Celebrations", ["I can name symbols like flags.", "I can share how families celebrate."], "C3 History K-2", "KS1: events beyond living memory", "Lgr22 SO: beliefs and celebrations")
      ],
      computing: [
        U("🖥️", "What Is a Computer?", ["I can name parts: screen, keyboard, mouse.", "I can turn a device on and off safely."], "CSTA 1A-CS", "KS1 Computing: using technology", "Lgr22 Technology: technical solutions"),
        U("📝", "Instructions in Order", ["I can give clear step-by-step instructions.", "I know an algorithm is a list of steps."], "CSTA 1A-AP", "KS1 Computing: algorithms", "Lgr22 Ma: step-by-step instructions"),
        U("🐝", "Program a Robot", ["I can plan moves to reach a target.", "I can test my plan."], "CSTA 1A-AP", "KS1 Computing: simple programs", "Lgr22 Ma: programming"),
        U("🐞", "Find the Bug", ["I can find the wrong step.", "I can fix it and try again."], "CSTA 1A-AP", "KS1 Computing: debugging", "Lgr22 Ma: programming"),
        U("🔒", "My Private Information", ["I keep my name, address and passwords private.", "I tell a grown-up if I see something worrying."], "CSTA 1A-NI", "KS1 Computing: use technology safely", "Lgr22: digital competence")
      ],
      health: [
        U("😌", "Feelings and Calming Down", ["I can name how I feel.", "I can use deep breaths to calm down."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22 PE & health: health and lifestyle"),
        U("🥦", "Healthy Habits", ["I can choose healthy snacks.", "I know I need sleep and exercise."], "NHES: healthy behaviours", "Health Ed: healthy eating", "Lgr22 PE & health: health and lifestyle"),
        U("🤝", "Sharing and Friendship", ["I can share, take turns and include others.", "I can solve a small problem with a friend."], "NHES: interpersonal skills", "Relationships Ed: caring friendships", "Lgr22 SO: living together"),
        U("🙅", "My Body Belongs to Me", ["I know my body belongs to me.", "I can tell a trusted adult if something feels wrong."], "NHES: safety", "Relationships Ed: being safe", "Lgr22: consent and relationships"),
        U("🔥", "Road and Fire Safety", ["I stop, look and listen at the road.", "I know what to do if a smoke alarm rings."], "NHES: safety", "Health Ed: basic first aid; safety", "Lgr22 PE & health: safety"),
        U("🏡", "Every Family Is Different", ["I know families come in many kinds.", "I can show respect for every family."], "NHES: interpersonal skills", "Relationships Ed: families", "Lgr22 SO: living together")
      ]
    },

    /* ================= GRADE 1 ================= */
    g1: {
      math: [
        U("➕", "Add and Subtract to 20", ["I know my facts to 10 by heart.", "I can add and subtract within 20."], "CCSS 1.OA.6", "Y2 Addition & subtraction: facts to 20", "Lgr22 Ma: number operations", ["quiz-numbers"]),
        U("📖", "Story Problems", ["I can solve add and take-away story problems.", "I can draw a picture to show my thinking."], "CCSS 1.OA.1", "Y2 Problem solving", "Lgr22 Ma: problem solving", ["quiz-numbers"]),
        U("🔗", "Fact Families", ["I can see how adding and subtracting are linked.", "I can find the missing number in 8 + ? = 12."], "CCSS 1.OA.4; 1.OA.8", "Y2 Inverse operations", "Lgr22 Ma: algebra"),
        U("🧱", "Tens and Ones to 120", ["I can read and write numbers to 120.", "I can show a number as tens and ones."], "CCSS 1.NBT.1–3", "Y2 Place value", "Lgr22 Ma: place value", ["quiz-numbers"]),
        U("💯", "Adding Within 100", ["I can add tens to a number.", "I can find 10 more and 10 less."], "CCSS 1.NBT.4–6", "Y2 Addition with 2-digit numbers", "Lgr22 Ma: number operations"),
        U("📏", "Measure Length", ["I can measure with same-size units.", "I can order three objects by length."], "CCSS 1.MD.1–2", "Y2 Measurement: length", "Lgr22 Ma: measurement"),
        U("🕐", "Tell Time", ["I can tell time to the hour and half hour.", "I can order the days of the week."], "CCSS 1.MD.3", "Y2 Time", "Lgr22 Ma: time"),
        U("🍕", "Shapes, Halves and Quarters", ["I can name shapes by their sides and corners.", "I can split a shape into halves and quarters."], "CCSS 1.G", "Y2 Fractions; Geometry", "Lgr22 Ma: geometry; parts of a whole")
      ],
      english: [
        U("🧩", "Blends and Longer Words", ["I can read words with blends like st, fl, tr.", "I can read words with two syllables."], "CCSS RF.1.3", "Y2 Phonics: phase 4", "Lgr22 Sv: reading strategies", ["quiz-words"]),
        U("✨", "Magic e and Vowel Teams", ["I can read words with magic e, like cake.", "I can read ai, ee, oa and other vowel teams."], "CCSS RF.1.3c", "Y2 Phonics: phase 5", "Lgr22 Sv: sound and letter", ["quiz-words"]),
        U("🏃", "Read Smoothly", ["I can read aloud with expression.", "I can reread to fix a mistake."], "CCSS RF.1.4", "Y2 Reading: fluency", "Lgr22 Sv: reading"),
        U("📖", "Characters, Setting, Events", ["I can describe characters, setting and main events.", "I can retell a story with key details."], "CCSS RL.1.2–3", "Y2 Reading: comprehension", "Lgr22 Sv: narrative texts"),
        U("🔍", "Fact Text Features", ["I can use headings, labels and pictures to learn.", "I can tell the main topic."], "CCSS RI.1.5", "Y2 Reading: non-fiction", "Lgr22 Sv: factual texts"),
        U("✏️", "Write Stories and Facts", ["I can write a story with a beginning, middle and end.", "I can write facts about a topic."], "CCSS W.1.2–3", "Y2 Writing: composition", "Lgr22 Sv: writing"),
        U("🧱", "Nouns, Verbs, Adjectives", ["I can find naming, doing and describing words.", "I can use them in a sentence."], "CCSS L.1.1", "Y2 Grammar: word classes", "Lgr22 Sv: use of language"),
        U("❓", "Punctuation Power", ["I can end sentences with . ? or !", "I use capitals for names and I."], "CCSS L.1.2", "Y2 Punctuation", "Lgr22 Sv: writing rules")
      ],
      science: [
        U("💡", "Light and Shadows", ["I know we need light to see.", "I can make a shadow and change its size."], "NGSS 1-PS4-2–3", "Y3 Light (early)", "Lgr22 NO: force and motion", ["funfacts"]),
        U("🔊", "Sound and Vibrations", ["I know sound comes from vibrations.", "I can make loud and soft sounds."], "NGSS 1-PS4-1", "Y4 Sound (early)", "Lgr22 NO: force and motion"),
        U("🦒", "Animal and Plant Parts", ["I can say how body parts help animals survive.", "I can name the parts of a plant."], "NGSS 1-LS1-1", "Y2 Living things & habitats", "Lgr22 NO: the year round in nature", ["quiz-living"]),
        U("👶", "Parents and Young", ["I know young animals look like their parents.", "I know how parents help their young survive."], "NGSS 1-LS1-2; 1-LS3-1", "Y2 Animals incl. humans: offspring", "Lgr22 NO: body and health", ["quiz-living"]),
        U("🌙", "Sun, Moon and Stars", ["I can describe how the Sun seems to move.", "I know daylight is longer in summer."], "NGSS 1-ESS1", "Y5 Earth & space (early)", "Lgr22 NO: narratives about nature"),
        U("🌳", "Habitats Outdoors", ["I can find living things in a habitat near me.", "I can draw a simple food chain."], "NGSS 2-LS4 (early)", "Y2 Living things & habitats", "Lgr22 NO: the year round in nature", ["quiz-living"]),
        U("🧪", "Ask and Test", ["I can ask a question and make a prediction.", "I can record what happened."], "NGSS K-2 practices", "Y2 Working scientifically", "Lgr22 NO: methods and ways of working")
      ],
      social: [
        U("🏘️", "My Community", ["I can compare city, town and countryside.", "I can name places in my community."], "C3 Geography K-2", "KS1 Geography: local area", "Lgr22 SO: living in the local area", ["quiz-community"]),
        U("🧭", "Maps, Keys and Directions", ["I can use a map key.", "I can use north, south, east and west."], "C3 Geography K-2", "KS1 Geography: compass directions", "Lgr22 SO: living in the world", ["quiz-community"]),
        U("🌍", "Continents and Oceans", ["I can name the seven continents.", "I can name the five oceans."], "C3 Geography K-2", "KS1 Geography: continents and oceans", "Lgr22 SO: living in the world", ["quiz-community"]),
        U("⏳", "Past and Present", ["I can put events on a timeline.", "I can compare toys or schools long ago and now."], "C3 History K-2", "KS1 History: changes within living memory", "Lgr22 SO: investigating reality"),
        U("🗳️", "Fair Choices and Voting", ["I can vote to make a group choice.", "I know everyone's voice counts."], "C3 Civics K-2", "Citizenship: democracy", "Lgr22 SO: living together"),
        U("🏪", "Goods and Services", ["I can tell goods from services.", "I can explain why people save money."], "C3 Economics K-2", "KS1 Citizenship: money", "Lgr22 SO: living together", ["quiz-community"]),
        U("🎊", "Cultures and Celebrations", ["I can describe celebrations from different cultures.", "I can show respect for different beliefs."], "C3 History K-2", "KS1 RE: celebrations", "Lgr22 SO: beliefs and celebrations")
      ],
      computing: [
        U("📝", "Algorithms Everywhere", ["I can write an algorithm for a daily task.", "I know order matters."], "CSTA 1A-AP-08", "KS1 Computing: algorithms", "Lgr22 Ma: step-by-step instructions"),
        U("🧩", "Block Coding", ["I can snap blocks together to make a program.", "I can make a character move."], "CSTA 1A-AP-10", "KS1 Computing: create programs", "Lgr22 Ma: programming"),
        U("🔁", "Repeat It: Loops", ["I can use a repeat block.", "I can spot patterns that repeat."], "CSTA 1A-AP-10", "KS1 Computing: programs", "Lgr22 Ma: programming"),
        U("🐞", "Debugging", ["I can test my program step by step.", "I can fix a bug."], "CSTA 1A-AP-14", "KS1 Computing: debugging", "Lgr22 Ma: programming"),
        U("💬", "Kind and Safe Online", ["I use kind words online.", "I know who my trusted adults are."], "CSTA 1A-IC", "KS1 Computing: e-safety", "Lgr22: digital competence")
      ],
      health: [
        U("💗", "Feelings and Empathy", ["I can notice how others feel.", "I can show I care."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22: values"),
        U("🍽️", "Food Groups", ["I can sort foods into groups.", "I can build a balanced plate."], "NHES: nutrition", "Health Ed: healthy eating", "Lgr22 PE & health: health and lifestyle"),
        U("🦠", "Germs and Hygiene", ["I know how germs spread.", "I can keep myself clean."], "NHES: healthy behaviours", "Health Ed: health and prevention", "Lgr22 NO: body and health"),
        U("🏃", "Move Every Day", ["I know exercise keeps my heart strong.", "I can play active games."], "NHES: physical activity", "Health Ed: physical health and fitness", "Lgr22 PE & health: movement"),
        U("🛡️", "Kindness and Bullying", ["I can tell teasing from bullying.", "I know how to get help."], "NHES: interpersonal skills", "Relationships Ed: respectful relationships", "Lgr22: equal treatment"),
        U("🪙", "Coins and Saving", ["I can name coins.", "I can save up for something I want."], "Jump$tart (financial literacy) K-2", "Citizenship: money", "Lgr22 Ma: money")
      ]
    },

    /* ================= GRADE 2 ================= */
    g2: {
      math: [
        U("⚡", "Fast Facts to 20", ["I know my add and subtract facts to 20 by heart.", "I can tell even numbers from odd ones."], "CCSS 2.OA.2–3", "Y3 Mental methods", "Lgr22 Ma: number operations", ["quiz-numbers"]),
        U("🧱", "Place Value to 1,000", ["I can read and write numbers to 1,000.", "I can skip count by 5s, 10s and 100s."], "CCSS 2.NBT.1–4", "Y3 Place value to 1,000", "Lgr22 Ma: place value", ["quiz-numbers"]),
        U("➕", "Add and Subtract to 100", ["I can add and subtract 2-digit numbers.", "I can regroup tens and ones."], "CCSS 2.NBT.5", "Y3 Column methods", "Lgr22 Ma: written methods", ["quiz-numbers"]),
        U("💯", "Add and Subtract to 1,000", ["I can add and subtract 3-digit numbers.", "I can check with the inverse."], "CCSS 2.NBT.7", "Y3 Addition & subtraction", "Lgr22 Ma: number operations"),
        U("✖️", "Arrays and the 2, 5, 10 Tables", ["I can show equal groups in rows and columns.", "I know my 2, 5 and 10 times tables."], "CCSS 2.OA.4; 2.G.2", "Y2–Y3 Multiplication tables", "Lgr22 Ma: multiplication"),
        U("📏", "Inches and Centimetres", ["I can measure with a ruler.", "I can estimate length."], "CCSS 2.MD.1–4", "Y3 Measurement: length", "Lgr22 Ma: measurement"),
        U("💰", "Time and Money", ["I can tell time to 5 minutes.", "I can count coins and notes."], "CCSS 2.MD.7–8", "Y3 Time; Money", "Lgr22 Ma: time and money"),
        U("📊", "Picture and Bar Graphs", ["I can make a bar graph.", "I can answer questions from a graph."], "CCSS 2.MD.10", "Y3 Statistics", "Lgr22 Ma: statistics")
      ],
      english: [
        U("🐯", "Tricky Vowels", ["I can read ar, or, er, ir and ur words.", "I can read longer words by syllables."], "CCSS RF.2.3", "Y3 Spelling patterns", "Lgr22 Sv: reading strategies", ["quiz-words"]),
        U("🧩", "Prefixes and Suffixes", ["I can read and use un-, re-, -ful, -less.", "I know how they change a word."], "CCSS L.2.4", "Y3 Prefixes and suffixes", "Lgr22 Sv: words and meaning", ["quiz-words"]),
        U("🦊", "Fables and Morals", ["I can tell the lesson of a fable.", "I can compare two versions of a story."], "CCSS RL.2.2; RL.2.9", "Y3 Reading: fables and myths", "Lgr22 Sv: narrative texts"),
        U("📰", "Reading to Learn", ["I can find the main idea of a paragraph.", "I can use a glossary and index."], "CCSS RI.2.2; RI.2.5", "Y3 Reading: non-fiction", "Lgr22 Sv: factual texts"),
        U("✏️", "Write a Paragraph", ["I can write a topic sentence and details.", "I can use linking words like first, next, then."], "CCSS W.2.2", "Y3 Writing: paragraphs", "Lgr22 Sv: writing"),
        U("⏪", "Past Tense and Plurals", ["I can use past tense, including went and saw.", "I can spell plurals like boxes and children."], "CCSS L.2.1", "Y3 Grammar: tense", "Lgr22 Sv: use of language"),
        U("🔣", "Apostrophes and Commas", ["I can write contractions like can't.", "I can use commas in a list."], "CCSS L.2.2", "Y2 Punctuation: apostrophes, commas in lists", "Lgr22 Sv: writing rules"),
        U("🎤", "Poems and Speaking", ["I can read a poem aloud with rhythm.", "I can speak clearly to a group."], "CCSS RL.2.4; SL.2", "Y3 Poetry; spoken language", "Lgr22 Sv: speaking and listening")
      ],
      science: [
        U("🧊", "Materials and Their Properties", ["I can describe materials: hard, soft, bendy, waterproof.", "I can choose the best material for a job."], "NGSS 2-PS1-1–2", "Y2 Uses of everyday materials", "Lgr22 NO: materials and substances", ["quiz-living"]),
        U("🔥", "Heating and Cooling", ["I know some changes can be undone and some cannot.", "I can melt and freeze water."], "NGSS 2-PS1-4", "Y4 States of matter (early)", "Lgr22 NO: materials and substances"),
        U("🌻", "What Plants Need", ["I can test what plants need to grow.", "I know how seeds spread."], "NGSS 2-LS2-1–2", "Y3 Plants", "Lgr22 NO: the year round in nature", ["quiz-living"]),
        U("🐠", "Habitats Around the World", ["I can compare living things in different habitats.", "I can explain why habitats matter."], "NGSS 2-LS4-1", "Y2 Living things & habitats", "Lgr22 NO: the year round in nature", ["quiz-living"]),
        U("🏔️", "Land and Water", ["I can name landforms like mountains and valleys.", "I can find water on a map."], "NGSS 2-ESS2-2–3", "Y3 Rocks (early)", "Lgr22 NO: the Earth"),
        U("🌋", "Earth Changes", ["I know some changes are fast, like volcanoes.", "I know some are slow, like erosion."], "NGSS 2-ESS1-1; 2-ESS2-1", "Y3 Rocks and soils", "Lgr22 NO: the Earth"),
        U("🧲", "Forces and Magnets", ["I know magnets attract some metals.", "I can test which things a magnet picks up."], "NGSS 3-PS2 (early)", "Y3 Forces and magnets", "Lgr22 NO: force and motion")
      ],
      social: [
        U("🌏", "Communities Around the World", ["I can compare my community with one far away.", "I know people everywhere have needs."], "C3 Geography K-2", "KS1 Geography: compare a non-European place", "Lgr22 SO: living in the world", ["quiz-community"]),
        U("🌡️", "Weather, Climate and Where People Live", ["I can name hot and cold places on a globe.", "I know climate changes how people live."], "C3 Geography K-2", "KS1 Geography: hot and cold areas", "Lgr22 SO: living in the world"),
        U("🌟", "People Who Changed the World", ["I can tell about a famous person's life.", "I can explain why they are remembered."], "C3 History K-2", "KS1 History: significant individuals", "Lgr22 SO: investigating reality"),
        U("📅", "Timelines and Sources", ["I can make a timeline of my life.", "I can learn from old photos and objects."], "C3 History K-2", "KS1 History: sources", "Lgr22 SO: investigating reality"),
        U("⚖️", "Leaders and Laws", ["I know who leads a town and a country.", "I know why we need laws."], "C3 Civics K-2", "Citizenship: rules and laws", "Lgr22 SO: living together", ["quiz-community"]),
        U("🏭", "Producers and Consumers", ["I can tell producers from consumers.", "I can follow a product from farm to shop."], "C3 Economics K-2", "Citizenship: money", "Lgr22 SO: living together", ["quiz-community"]),
        U("♻️", "Caring for Our Planet", ["I can reduce, reuse and recycle.", "I know what pollution is."], "C3 Geography K-2", "KS1 Geography: human features", "Lgr22 SO: sustainability")
      ],
      computing: [
        U("🔁", "Loops and Patterns", ["I can use loops to shorten a program.", "I can predict what a program will do."], "CSTA 1A-AP-10", "KS1 Computing: logical reasoning", "Lgr22 Ma: programming"),
        U("👆", "Events: When Clicked", ["I can make something happen when I tap.", "I can make two characters talk."], "CSTA 1A-AP-10", "KS1 Computing: programs", "Lgr22 Ma: programming"),
        U("📊", "Sorting Data", ["I can sort data into groups.", "I can make a pictogram on a computer."], "CSTA 1A-DA-06", "KS1 Computing: organise data", "Lgr22 Ma: statistics"),
        U("🌐", "What Is the Internet?", ["I know the internet connects computers.", "I know websites are made by people."], "CSTA 1A-NI", "KS2 Computing: networks (early)", "Lgr22 Technology: technical solutions"),
        U("🔑", "Passwords and Privacy", ["I can make a strong password.", "I keep passwords secret."], "CSTA 1A-NI-04", "KS1 Computing: keep personal information private", "Lgr22: digital competence"),
        U("👣", "My Digital Footprint", ["I know what I post can stay online.", "I can think before I share."], "CSTA 1A-IC", "KS1 Computing: e-safety", "Lgr22: digital competence")
      ],
      health: [
        U("🌱", "I Can Learn Anything", ["I know mistakes help my brain grow.", "I can keep trying when it's hard."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22: values"),
        U("🥗", "Smart Food Choices", ["I can choose foods for energy.", "I know sugar is a sometimes food."], "NHES: nutrition", "Health Ed: healthy eating", "Lgr22 PE & health: health and lifestyle"),
        U("🦷", "Teeth and Sleep", ["I brush my teeth twice a day.", "I know sleep helps me learn."], "NHES: healthy behaviours", "Health Ed: health and prevention", "Lgr22 NO: body and health"),
        U("🗣️", "Solving Friendship Problems", ["I can use I-messages.", "I can find a fair solution."], "NHES: interpersonal skills", "Relationships Ed: caring friendships", "Lgr22 SO: living together"),
        U("🚸", "Safe at Home and Outside", ["I know safe and unsafe places.", "I know my emergency number."], "NHES: safety", "Health Ed: basic first aid", "Lgr22 PE & health: safety"),
        U("🐷", "Needs, Wants and Saving", ["I can plan to save for a goal.", "I can choose between two things to buy."], "Jump$tart K-2", "Citizenship: money", "Lgr22 SO: personal finances")
      ]
    },

    /* ================= GRADE 3 ================= */
    g3: {
      math: [
        U("✖️", "Multiplication Meaning", ["I can show multiplication as equal groups and arrays.", "I can use the commutative property."], "CCSS 3.OA.1; 3.OA.5", "Y4 Multiplication", "Lgr22 Ma: multiplication", ["multiply", "homeschool-g3-math"]),
        U("🧠", "Times Tables to 12", ["I know every times table to 12 by heart.", "I can use facts I know to work out new ones."], "CCSS 3.OA.7", "Y4 Times tables to 12 × 12", "Lgr22 Ma: number operations", ["multiply", "timesquest", "grandprix-math", "stickerquest"]),
        U("➗", "Division", ["I can share equally and make equal groups.", "I can use multiplication to divide."], "CCSS 3.OA.2; 3.OA.6", "Y4 Division facts", "Lgr22 Ma: division", ["homeschool-g3-math"]),
        U("🔢", "Rounding and 3-Digit Numbers", ["I can round to the nearest 10 and 100.", "I can add and subtract within 1,000."], "CCSS 3.NBT.1–2", "Y4 Place value; rounding", "Lgr22 Ma: place value", ["subtraction", "piratemath"]),
        U("🧩", "Two-Step Word Problems", ["I can solve problems with two steps.", "I can check if my answer makes sense."], "CCSS 3.OA.8", "Y4 Problem solving", "Lgr22 Ma: problem solving", ["piratemath", "piratemath-exam"]),
        U("🍰", "Fractions", ["I can name unit fractions like 1/4.", "I can place fractions on a number line and find equal ones."], "CCSS 3.NF", "Y4 Fractions", "Lgr22 Ma: rational numbers"),
        U("⏱️", "Time, Mass and Volume", ["I can tell time to the minute and find elapsed time.", "I can measure grams, kilograms and litres."], "CCSS 3.MD.1–2", "Y4 Time; Measurement", "Lgr22 Ma: measurement", ["homeschool-g3-math"]),
        U("⬛", "Area, Perimeter and Graphs", ["I can find area by counting squares and multiplying.", "I can find the perimeter of a shape.", "I can read scaled bar graphs."], "CCSS 3.MD.3–8; 3.G", "Y4 Area; perimeter; statistics", "Lgr22 Ma: geometry; statistics")
      ],
      english: [
        U("🔠", "Decode Long Words", ["I can split long words into syllables.", "I can read common prefixes and suffixes."], "CCSS RF.3.3", "Y4 Word reading", "Lgr22 Sv: reading strategies", ["reading", "homeschool-g3-eng"]),
        U("🚀", "Reading Fluency", ["I can read aloud smoothly and with expression.", "I can read at a good pace."], "CCSS RF.3.4", "Y4 Reading: fluency", "Lgr22 Sv: reading", ["readrocket"]),
        U("🕵️", "Main Idea and Details", ["I can find the main idea.", "I can pick details that support it."], "CCSS RI.3.2", "Y4 Reading: comprehension", "Lgr22 Sv: factual texts", ["readgym", "detectives", "clueisland", "readingadventures"]),
        U("🎭", "Characters and Point of View", ["I can describe a character's traits and feelings.", "I can tell my view from the narrator's."], "CCSS RL.3.3; RL.3.6", "Y4 Reading: inference", "Lgr22 Sv: narrative texts", ["readgym", "detectives", "readrocket"]),
        U("🔗", "Text Structure: Cause and Effect", ["I can find cause and effect.", "I can compare two texts on one topic."], "CCSS RI.3.8–9", "Y4 Reading: non-fiction", "Lgr22 Sv: factual texts", ["readgym", "clueisland"]),
        U("✍️", "Opinion and Story Writing", ["I can give my opinion with reasons.", "I can write a story with dialogue."], "CCSS W.3.1; W.3.3", "Y4 Writing: composition", "Lgr22 Sv: writing", ["writestudio"]),
        U("🪐", "Grammar: Adjectives, Adverbs, Conjunctions", ["I can use adjectives and adverbs.", "I can join ideas with and, but, because."], "CCSS L.3.1", "Y4 Grammar; fronted adverbials", "Lgr22 Sv: use of language", ["grammar", "treasure", "grandprix-eng"]),
        U("💬", "Speech Marks and Figurative Language", ["I can punctuate speech.", "I can understand similes and idioms."], "CCSS L.3.2c; L.3.5", "Y4 Inverted commas", "Lgr22 Sv: words and meaning", ["homeschool-g3-eng"])
      ],
      science: [
        U("🏋️", "Forces and Motion", ["I can tell balanced from unbalanced forces.", "I can predict how something will move."], "NGSS 3-PS2-1–2", "Y3 Forces", "Lgr22 NO: force and motion"),
        U("🧲", "Magnets and Static", ["I can investigate magnetic forces.", "I can make static electricity."], "NGSS 3-PS2-3–4", "Y3 Forces and magnets", "Lgr22 NO: force and motion"),
        U("🦋", "Life Cycles", ["I can compare the life cycles of a frog, a butterfly and a plant.", "I know all living things grow and reproduce."], "NGSS 3-LS1-1", "Y5 Life cycles (early)", "Lgr22 NO: the year round in nature", ["funfacts"]),
        U("🧬", "Traits and Inheritance", ["I know offspring inherit traits from parents.", "I know the environment can change traits too."], "NGSS 3-LS3", "Y6 Inheritance (early)", "Lgr22 NO: body and health"),
        U("🦴", "Fossils and Adaptation", ["I can tell what fossils show about the past.", "I can explain how adaptations help animals survive."], "NGSS 3-LS4", "Y6 Evolution & inheritance; Y3 Rocks", "Lgr22 NO: narratives about nature", ["sci-testprep"]),
        U("🌪️", "Weather, Climate and Hazards", ["I can use data to describe the weather in a season.", "I can design ways to stay safe in a storm."], "NGSS 3-ESS2; 3-ESS3", "Y4 Geography link: climate", "Lgr22 NO: the Earth", ["sq-unit2-sci"]),
        U("🔌", "Electric Circuits", ["I can build a simple circuit.", "I know conductors and insulators."], "NGSS 4-PS3 (early)", "Y4 Electricity", "Lgr22 NO: force and motion; Technology"),
        U("🍽️", "Teeth, Digestion and Food Chains", ["I can name the parts of my digestive system.", "I can build a food chain."], "NGSS 5-LS2 (early)", "Y4 Animals incl. humans; living things", "Lgr22 NO: body and health")
      ],
      social: [
        U("🏙️", "How Communities Change", ["I can explain how my area changed over time.", "I can use sources to find out."], "C3 History 3-5", "KS2 History: local history study", "Lgr22 SO: living in the local area", ["piratemath-communities"]),
        U("🗺️", "Map Skills and Regions", ["I can use a map scale and a grid.", "I can describe physical and human features."], "C3 Geography 3-5", "KS2 Geography: maps and fieldwork", "Lgr22 SO: living in the world", ["sq-unit2-soc"]),
        U("🛖", "Stone Age to Vikings", ["I can describe life in the Stone Age.", "I can tell how the Vikings lived and travelled."], "C3 History 3-5", "KS2 History: Stone Age to Iron Age; Vikings", "Lgr22 History: the Nordic past"),
        U("🏛️", "How Government Works", ["I can name the parts of government.", "I know what local government does."], "C3 Civics 3-5", "Citizenship: democracy", "Lgr22 SO: living together", ["sq-unit2-soc"]),
        U("📜", "Rights and the Bill of Rights", ["I know what rights are.", "I can explain why some rights are protected by law."], "C3 Civics 3-5", "Citizenship: rights and responsibilities", "Lgr22 SO: children's rights", ["billofrights"]),
        U("⚖️", "Scarcity and Choices", ["I can explain scarcity.", "I know every choice has a cost."], "C3 Economics 3-5", "Citizenship: money", "Lgr22 SO: personal finances"),
        U("🧳", "Cultures and Moving Places", ["I can explain why people move to new places.", "I can share traditions from different cultures."], "C3 History 3-5", "KS2 History: migration", "Lgr22 SO: living in the world")
      ],
      computing: [
        U("🔀", "If This, Then That", ["I can use if/then blocks.", "I can make a program react to choices."], "CSTA 1B-AP-10", "KS2 Computing: selection", "Lgr22 Ma: programming"),
        U("🏆", "Variables: Keeping Score", ["I can use a variable to keep score.", "I can change a variable in my program."], "CSTA 1B-AP-09", "KS2 Computing: variables", "Lgr22 Ma: programming"),
        U("🌐", "Networks and the Internet", ["I can explain how data travels on the internet.", "I know the internet and the web are different."], "CSTA 1B-NI", "KS2 Computing: networks", "Lgr22 Technology: technical solutions"),
        U("🔎", "Search Smart", ["I can choose good search words.", "I can tell ads from results."], "CSTA 1B-IC", "KS2 Computing: use search technologies", "Lgr22: source criticism"),
        U("⌨️", "Typing and Making Documents", ["I can type with both hands.", "I can make and save a document."], "CSTA 1B-CS", "KS2 Computing: use software", "Lgr22 Sv: writing with digital tools")
      ],
      health: [
        U("🧘", "Handling Big Feelings", ["I can name what makes me stressed.", "I know ways to calm down."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22 PE & health: health and lifestyle"),
        U("⚡", "Food for Energy", ["I can read a simple food label.", "I can plan a balanced meal."], "NHES: nutrition", "Health Ed: healthy eating", "Lgr22 PE & health: health and lifestyle"),
        U("🩹", "First Aid Basics", ["I can call the emergency number and say where I am.", "I can help with a small cut."], "NHES: safety", "Health Ed: basic first aid", "Lgr22 PE & health: safety"),
        U("🤗", "Respect in Friendships", ["I can respect differences.", "I can ask before I borrow or touch."], "NHES: interpersonal skills", "Relationships Ed: respectful relationships", "Lgr22: consent and relationships"),
        U("🙅", "Saying No to Peer Pressure", ["I can say no in a strong, kind way.", "I can walk away and tell an adult."], "NHES: decision-making", "Relationships Ed: being safe", "Lgr22: values"),
        U("💵", "Earning, Spending, Saving", ["I can explain how people earn money.", "I can split money into spend, save and share."], "Jump$tart 3-5", "Citizenship: money", "Lgr22 SO: personal finances")
      ]
    },

    /* ================= GRADE 4 ================= */
    g4: {
      math: [
        U("🔢", "Big Numbers to a Million", ["I can read, write and compare numbers to 1,000,000.", "I can round large numbers."], "CCSS 4.NBT.1–3", "Y5 Place value to 1,000,000", "Lgr22 Ma: place value", ["quiz-mathlab"]),
        U("➕", "Multi-Digit Add and Subtract", ["I can use the column method.", "I can estimate to check."], "CCSS 4.NBT.4", "Y5 Addition & subtraction", "Lgr22 Ma: written methods", ["quiz-mathlab"]),
        U("✖️", "Multiply Bigger Numbers", ["I can multiply up to 4 digits by 1 digit.", "I can multiply two 2-digit numbers."], "CCSS 4.NBT.5", "Y5 Multiplication", "Lgr22 Ma: number operations", ["quiz-mathlab", "multiply"]),
        U("➗", "Divide With Remainders", ["I can divide up to 4 digits by 1 digit.", "I can explain what a remainder means."], "CCSS 4.NBT.6", "Y5 Division", "Lgr22 Ma: number operations", ["quiz-mathlab"]),
        U("🔍", "Factors, Multiples and Primes", ["I can find factors and multiples.", "I can tell prime from composite numbers."], "CCSS 4.OA.4", "Y5 Factors, multiples, primes", "Lgr22 Ma: number theory"),
        U("🍕", "Equivalent Fractions and Adding Them", ["I can find equivalent fractions and compare them.", "I can add fractions with the same denominator."], "CCSS 4.NF.1–4", "Y5 Fractions", "Lgr22 Ma: rational numbers", ["quiz-mathlab"]),
        U("🔟", "Decimals and Negative Numbers", ["I can write tenths and hundredths as decimals.", "I can use negative numbers on a number line."], "CCSS 4.NF.6–7", "Y5 Decimals; negative numbers", "Lgr22 Ma: rational and negative numbers", ["quiz-mathlab"]),
        U("📐", "Angles, Lines and Symmetry", ["I can measure angles with a protractor.", "I can find lines of symmetry."], "CCSS 4.MD.5–7; 4.G", "Y5 Geometry: angles", "Lgr22 Ma: geometry")
      ],
      english: [
        U("🎯", "Theme and Summary", ["I can find the theme of a story.", "I can write a short summary."], "CCSS RL.4.2", "Y5 Reading: comprehension", "Lgr22 Sv: narrative texts", ["quiz-readinglab"]),
        U("🔎", "Inference With Evidence", ["I can make inferences.", "I can quote the text to support them."], "CCSS RL.4.1; RI.4.1", "Y5 Reading: inference", "Lgr22 Sv: reading strategies", ["quiz-readinglab"]),
        U("📰", "Firsthand and Secondhand Accounts", ["I can compare an eyewitness account with a report.", "I can explain how they differ."], "CCSS RI.4.6", "Y5 Reading: non-fiction", "Lgr22 Sv: factual texts"),
        U("🏛️", "Greek and Latin Roots", ["I can use roots to work out new words.", "I can use a dictionary and thesaurus."], "CCSS L.4.4", "Y5 Spelling: roots", "Lgr22 Sv: words and meaning", ["quiz-readinglab"]),
        U("🌈", "Figurative Language", ["I can explain similes, metaphors and idioms.", "I can use them in my writing."], "CCSS L.4.5", "Y5 Reading: language", "Lgr22 Sv: use of language", ["quiz-readinglab"]),
        U("📝", "Essays With Paragraphs", ["I can write an essay with an introduction, body and conclusion.", "I can use linking words between paragraphs."], "CCSS W.4.1–2", "Y5 Writing: composition", "Lgr22 Sv: writing"),
        U("🧱", "Grammar: Relative Clauses and Modal Verbs", ["I can use who, which and that clauses.", "I can use might, could and should."], "CCSS L.4.1", "Y5 Grammar: relative clauses; modal verbs", "Lgr22 Sv: use of language"),
        U("🎤", "Presentations", ["I can give a short talk with notes.", "I can listen and ask good questions."], "CCSS SL.4.4", "Y5 Spoken language", "Lgr22 Sv: speaking and listening")
      ],
      science: [
        U("⚡", "Energy", ["I can describe energy in motion, sound, light and heat.", "I know energy moves from place to place."], "NGSS 4-PS3", "Y6 Electricity; Y4 Sound", "Lgr22 NO 4–6: energy", ["quiz-sciencelab"]),
        U("🌊", "Waves and Information", ["I can describe waves by size and spacing.", "I can explain how codes send messages."], "NGSS 4-PS4", "Y4 Sound; Y6 Light", "Lgr22 NO 4–6: sound and light", ["quiz-sciencelab"]),
        U("👁️", "Senses and Body Structures", ["I can explain how eyes see objects.", "I can describe how body parts help survival."], "NGSS 4-LS1", "Y6 Animals incl. humans", "Lgr22 Bio 4–6: the human body", ["quiz-sciencelab"]),
        U("🪨", "Rocks, Layers and Fossils", ["I can read rock layers like a history book.", "I can explain how fossils form."], "NGSS 4-ESS1", "Y3 Rocks; Y6 Evolution", "Lgr22 NO 4–6: the Earth", ["quiz-sciencelab"]),
        U("🏞️", "Weathering and Erosion", ["I can show how water and wind shape land.", "I can design a way to slow erosion."], "NGSS 4-ESS2", "Y3 Rocks and soils", "Lgr22 NO 4–6: the Earth", ["quiz-sciencelab"]),
        U("🧊", "States of Matter", ["I can describe solids, liquids and gases.", "I can explain the water cycle."], "NGSS 5-PS1 (early)", "Y4 States of matter", "Lgr22 Chem 4–6: matter", ["quiz-sciencelab"]),
        U("🔋", "Resources and Sustainable Energy", ["I can tell renewable from non-renewable energy.", "I can suggest ways to save energy."], "NGSS 4-ESS3", "Y6 Geography link: energy", "Lgr22 NO 4–6: sustainable development", ["quiz-sciencelab"])
      ],
      social: [
        U("🌐", "Latitude, Longitude and Regions", ["I can find places using latitude and longitude.", "I can describe regions by climate and land."], "C3 Geography 3-5", "KS2 Geography: locational knowledge", "Lgr22 Geography 4–6: maps", ["quiz-worldlab"]),
        U("🏺", "Early Civilisations", ["I can describe ancient Egypt and the Indus Valley.", "I can explain why rivers mattered."], "C3 History 3-5", "KS2 History: earliest civilisations", "Lgr22 History 4–6", ["quiz-worldlab"]),
        U("🏛️", "Ancient Greece", ["I can describe life in ancient Greece.", "I can explain how democracy began."], "C3 History 3-5", "KS2 History: Ancient Greece", "Lgr22 History 4–6", ["quiz-worldlab"]),
        U("⛵", "Explorers and Trade Routes", ["I can trace an explorer's journey.", "I can explain why people traded."], "C3 History 3-5", "KS2 History: beyond 1066", "Lgr22 History 4–6", ["quiz-worldlab"]),
        U("🗳️", "Governments Compared", ["I can compare how the US, UK, Sweden and India are governed.", "I know what a constitution is."], "C3 Civics 3-5", "Citizenship: democracy", "Lgr22 Civics 4–6: democracy", ["quiz-worldlab"]),
        U("🏦", "Money and Banks", ["I can explain what banks do.", "I can make a simple budget."], "C3 Economics 3-5", "Citizenship: money", "Lgr22 Civics 4–6: personal finances", ["quiz-worldlab"]),
        U("🧒", "Rights of the Child", ["I can name rights in the UN Convention on the Rights of the Child.", "I know rights come with responsibilities."], "C3 Civics 3-5", "Citizenship: rights", "Lgr22 Civics 4–6: human rights")
      ],
      computing: [
        U("🔄", "Nested Loops and Functions", ["I can put a loop inside a loop.", "I can make my own block (function)."], "CSTA 1B-AP-11", "KS2 Computing: decompose problems", "Lgr22 Ma: programming"),
        U("📊", "Spreadsheets and Charts", ["I can enter data in a spreadsheet.", "I can make a chart from it."], "CSTA 1B-DA-06", "KS2 Computing: collect and present data", "Lgr22 Ma: statistics"),
        U("0️⃣", "Binary: How Computers Store Data", ["I can count in binary.", "I know pictures are made of pixels."], "CSTA 1B-DA-05", "KS2 Computing: how computers work", "Lgr22 Technology"),
        U("🛑", "Cyberbullying and Getting Help", ["I can spot cyberbullying.", "I know how to block, report and tell."], "CSTA 1B-IC", "KS2 Computing: report concerns", "Lgr22: digital competence"),
        U("🎬", "Create Media", ["I can make a slideshow or video.", "I can credit images I use."], "CSTA 1B-IC-21", "KS2 Computing: create content", "Lgr22: digital tools")
      ],
      health: [
        U("🧠", "Mental Health Matters", ["I know mental health is as important as physical health.", "I can name people I can talk to."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22 PE & health: health and lifestyle"),
        U("❤️", "Heart and Exercise", ["I can measure my heart rate.", "I know how exercise helps my heart."], "NHES: physical activity", "Health Ed: physical health; Y6 circulation", "Lgr22 PE & health: movement"),
        U("🌱", "Growing Up", ["I know bodies change as we grow.", "I know who to ask my questions."], "NHES: growth and development", "Health Ed: changing adolescent body", "Lgr22 Bio 4–6: puberty"),
        U("🙋", "Asking Permission", ["I ask before I share photos of others.", "I respect when someone says no."], "NHES: interpersonal skills", "Relationships Ed: boundaries", "Lgr22: consent and relationships"),
        U("🧭", "Making Good Decisions", ["I can use steps to make a decision.", "I can think about consequences."], "NHES: decision-making", "Health Ed: safety", "Lgr22: values"),
        U("📋", "Budgets and Choices", ["I can plan a budget for a goal.", "I can compare prices."], "Jump$tart 3-5", "Citizenship: money", "Lgr22 Home & consumer: personal finances")
      ]
    },

    /* ================= GRADE 5 ================= */
    g5: {
      math: [
        U("🔟", "Powers of Ten and Decimals", ["I can multiply and divide by 10, 100 and 1,000.", "I can read and compare decimals to thousandths."], "CCSS 5.NBT.1–4", "Y6 Place value; decimals", "Lgr22 Ma: rational numbers", ["quiz-mathlab"]),
        U("✖️", "Multi-Digit Multiplication and Division", ["I can multiply multi-digit numbers.", "I can divide by a 2-digit number."], "CCSS 5.NBT.5–6", "Y6 Long multiplication and division", "Lgr22 Ma: written methods", ["quiz-mathlab"]),
        U("💲", "Decimal Operations", ["I can add, subtract, multiply and divide decimals.", "I can solve money problems."], "CCSS 5.NBT.7", "Y6 Decimals", "Lgr22 Ma: rational numbers", ["quiz-mathlab"]),
        U("🍰", "Adding Unlike Fractions", ["I can add and subtract fractions with different denominators.", "I can work with mixed numbers."], "CCSS 5.NF.1–2", "Y6 Fractions", "Lgr22 Ma: rational numbers", ["quiz-mathlab"]),
        U("✂️", "Multiply and Divide Fractions", ["I can multiply a fraction by a fraction.", "I can divide unit fractions and whole numbers."], "CCSS 5.NF.3–7", "Y6 Fractions", "Lgr22 Ma: rational numbers"),
        U("💯", "Percentages and Ratios", ["I can link fractions, decimals and percentages.", "I can solve simple ratio problems."], "CCSS 6.RP (early)", "Y6 Ratio and proportion", "Lgr22 Ma: percent; relationships and change"),
        U("🧊", "Volume and Expressions", ["I can find the volume of a box.", "I can use brackets and order of operations."], "CCSS 5.MD.3–5; 5.OA.1–2", "Y6 Volume; algebra", "Lgr22 Ma: algebra; geometry"),
        U("📈", "Graphs, Averages and Chance", ["I can plot points on a coordinate grid.", "I can find the mean.", "I can describe probability."], "CCSS 5.G.1–2", "Y6 Statistics: mean; coordinates", "Lgr22 Ma: probability and statistics")
      ],
      english: [
        U("👥", "Compare Characters and Themes", ["I can compare characters in a story.", "I can compare themes across two books."], "CCSS RL.5.3; RL.5.9", "Y6 Reading: comprehension", "Lgr22 Sv: narrative texts", ["quiz-readinglab"]),
        U("🗣️", "Quote Accurately", ["I can quote the text exactly.", "I can explain how a quote proves my point."], "CCSS RL.5.1; RI.5.1", "Y6 Reading: evidence", "Lgr22 Sv: reading strategies", ["quiz-readinglab"]),
        U("📚", "Research From Several Sources", ["I can combine facts from several sources.", "I can take notes in my own words."], "CCSS RI.5.9; W.5.7", "Y6 Reading: non-fiction", "Lgr22 Sv: factual texts"),
        U("🧐", "Can I Trust This Source?", ["I can check who made a text and why.", "I can tell facts from opinions and ads."], "CCSS RI.5.8", "Y6 Reading: fact and opinion", "Lgr22 Sv: source criticism"),
        U("⚖️", "Argument Writing and Debate", ["I can write an argument with evidence.", "I can debate politely."], "CCSS W.5.1; SL.5.1", "Y6 Writing; spoken language", "Lgr22 Sv: argumentative texts"),
        U("📖", "Story Writing Techniques", ["I can use dialogue, pacing and description.", "I can edit to improve my writing."], "CCSS W.5.3", "Y6 Writing: composition", "Lgr22 Sv: writing"),
        U("🧱", "Grammar: Perfect Tenses and Passive Voice", ["I can use perfect tenses.", "I can change active to passive."], "CCSS L.5.1", "Y6 Grammar: passive voice", "Lgr22 Sv: use of language", ["quiz-readinglab"]),
        U("✒️", "Advanced Punctuation", ["I can use commas, colons and semicolons.", "I can use brackets and dashes."], "CCSS L.5.2", "Y6 Punctuation", "Lgr22 Sv: writing rules")
      ],
      science: [
        U("⚛️", "Matter Is Made of Particles", ["I can explain that matter is made of tiny particles.", "I know mass stays the same when things change."], "NGSS 5-PS1-1–2", "Y5 Properties and changes of materials", "Lgr22 Chem 4–6: particles", ["quiz-sciencelab"]),
        U("🧪", "Mixtures and New Substances", ["I can separate mixtures.", "I can tell a reversible change from a new substance."], "NGSS 5-PS1-3–4", "Y5 Properties and changes of materials", "Lgr22 Chem 4–6: mixtures and solutions", ["quiz-sciencelab"]),
        U("🌍", "Gravity and Friction", ["I know gravity pulls things down to Earth.", "I can test friction and air resistance."], "NGSS 5-PS2-1", "Y5 Forces", "Lgr22 Phys 4–6: forces", ["quiz-sciencelab"]),
        U("🌿", "Plants Make Food", ["I know plants get what they need from air, water and light.", "I can trace energy from the Sun to me."], "NGSS 5-LS1-1; 5-PS3-1", "Y6 Living things", "Lgr22 Bio 4–6: photosynthesis", ["quiz-sciencelab"]),
        U("🕸️", "Ecosystems and Food Webs", ["I can build a food web.", "I can explain what decomposers do."], "NGSS 5-LS2-1", "Y6 Living things & habitats", "Lgr22 Bio 4–6: ecosystems", ["quiz-sciencelab"]),
        U("🪐", "Earth, Sun, Moon and Stars", ["I can explain day, night and seasons.", "I can describe the solar system."], "NGSS 5-ESS1", "Y5 Earth and space", "Lgr22 Phys 4–6: the solar system", ["quiz-sciencelab"]),
        U("🫀", "Body Systems", ["I can describe the heart, lungs and blood.", "I know how lifestyle affects my body."], "NGSS (MS-LS1 early)", "Y6 Animals incl. humans: circulation", "Lgr22 Bio 4–6: the human body"),
        U("🌎", "Protecting Earth", ["I can explain how people affect land, water and air.", "I can design a solution to protect a habitat."], "NGSS 5-ESS2; 5-ESS3", "Y6 Geography link: sustainability", "Lgr22 NO 4–6: sustainable development", ["quiz-sciencelab"])
      ],
      social: [
        U("🏕️", "First Peoples", ["I can describe how Native peoples lived with the land.", "I can compare first peoples in different places, like the Sámi."], "C3 History 3-5 (US G5)", "KS2 History: non-European society", "Lgr22 History 4–6: the Sámi", ["quiz-worldlab"]),
        U("🏛️", "Romans and Anglo-Saxons", ["I can explain the Roman Empire's impact.", "I can describe Anglo-Saxon life."], "C3 History 3-5", "KS2 History: Roman Empire; Anglo-Saxons", "Lgr22 History 4–6"),
        U("🗽", "Colonies to a New Nation", ["I can explain why colonies broke away.", "I can describe how the US Constitution was made."], "C3 History 3-5 (US G5)", "KS2 History: theme beyond 1066", "Lgr22 History 4–6", ["quiz-worldlab"]),
        U("🕊️", "World Beliefs and Religions", ["I can describe the main world religions.", "I can show respect for different beliefs."], "C3 (NCSS culture)", "Religious Education (KS2)", "Lgr22 Religion 4–6", ["quiz-worldlab"]),
        U("🗳️", "Democracy and Human Rights", ["I can explain how elections work.", "I can name human rights and why they matter."], "C3 Civics 3-5", "Citizenship: democracy; rule of law", "Lgr22 Civics 4–6: democracy and human rights", ["quiz-worldlab"]),
        U("🚢", "Trade and the Global Economy", ["I can trace where everyday things come from.", "I can explain imports and exports."], "C3 Economics 3-5", "KS2 Geography: trade links", "Lgr22 Geography 4–6: trade", ["quiz-worldlab"]),
        U("🌱", "Sustainability and Climate", ["I can explain climate change simply.", "I can plan an action to help."], "C3 Geography 3-5", "KS2 Geography: human impact", "Lgr22 Geography 4–6: sustainable development"),
        U("📺", "News and Media Literacy", ["I can tell news from opinion.", "I can check a story with more than one source."], "C3 Inquiry: evaluating sources", "Citizenship: media", "Lgr22 Civics 4–6: media and source criticism")
      ],
      computing: [
        U("🎮", "Make a Game", ["I can use variables, conditions and loops together.", "I can plan, build and test a game."], "CSTA 1B-AP-12", "KS2 Computing: design programs", "Lgr22 Ma: programming"),
        U("🔍", "Searching and Sorting", ["I can sort a list step by step.", "I can explain why some algorithms are faster."], "CSTA 1B-AP-08", "KS2 Computing: logical reasoning", "Lgr22 Ma: algorithms"),
        U("📈", "Collect and Analyse Data", ["I can run a survey and chart the results.", "I can draw conclusions from data."], "CSTA 1B-DA-07", "KS2 Computing: evaluate data", "Lgr22 Ma: statistics"),
        U("🤖", "What Is AI?", ["I can explain that AI learns from examples.", "I know AI can be wrong or unfair."], "CSTA 1B-IC (AI4K12 ideas)", "KS2 Computing: how technology works", "Lgr22: digital competence"),
        U("🧐", "Misinformation and Privacy", ["I can spot fake or edited content.", "I can protect my privacy settings."], "CSTA 1B-NI; 1B-IC", "KS2 Computing: evaluate content; e-safety", "Lgr22: source criticism")
      ],
      health: [
        U("🌦️", "Resilience and Wellbeing", ["I can bounce back from setbacks.", "I can help a friend who is struggling."], "NHES: emotional health", "Health Ed: mental wellbeing", "Lgr22 PE & health: health and lifestyle"),
        U("🌱", "Puberty and Changing Bodies", ["I know the changes of puberty are normal.", "I know where to find trusted information."], "NHES: growth and development", "Health Ed: changing adolescent body", "Lgr22 Bio 4–6: puberty"),
        U("🏷️", "Nutrition Labels", ["I can compare food labels.", "I can plan healthy meals for a day."], "NHES: nutrition", "Health Ed: healthy eating", "Lgr22 Home & consumer: food and health"),
        U("🚭", "Medicines, Smoking and Alcohol", ["I know medicines must be used safely.", "I know the risks of smoking, vaping and alcohol."], "NHES: alcohol, tobacco and drugs", "Health Ed: drugs, alcohol and tobacco", "Lgr22 PE & health: health and lifestyle"),
        U("💬", "Healthy Relationships Online and Off", ["I can tell healthy from unhealthy friendships.", "I know online friends may not be who they say."], "NHES: interpersonal skills", "Relationships Ed: online relationships", "Lgr22: consent and relationships"),
        U("🏦", "Smart Money: Interest and Scams", ["I can explain interest.", "I can spot a scam."], "Jump$tart 3-5", "Citizenship: money", "Lgr22 Home & consumer: personal finances")
      ]
    }
  };

  // Every unit gets a stable id like "g3-math-2" and its number.
  GRADES.forEach(function (g) {
    SUBJECTS.forEach(function (s) {
      (UNITS[g][s.id] || []).forEach(function (u, i) { u.n = i + 1; u.id = g + "-" + s.id + "-" + u.n; u.grade = g; u.subject = s.id; });
    });
  });

  function units(grade, subject) { return (UNITS[grade] && UNITS[grade][subject]) || []; }
  function subject(id) {
    var all = SUBJECTS.concat(EXTRAS);
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  }
  // Catalog items that belong to an Academy subject (Language splits into English and World Languages).
  function catalogMatch(subj, item) {
    if (!subj.catalog || item.subject !== subj.catalog) return false;
    if (subj.lang) return item.lang === subj.lang;
    if (subj.langs) return subj.langs.indexOf(item.lang) >= 0;
    return true;
  }

  var Syllabus = { SUBJECTS: SUBJECTS, EXTRAS: EXTRAS, GRADES: GRADES, MATCH: MATCH, PRINCIPLES: PRINCIPLES,
                   UNITS: UNITS, units: units, subject: subject, catalogMatch: catalogMatch };
  root.Syllabus = Syllabus;
  if (typeof module !== "undefined" && module.exports) module.exports = Syllabus;
})(typeof window !== "undefined" ? window : globalThis);
