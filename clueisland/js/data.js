/* ============================================================
   Clue Island — Data
   A drag-the-explorer reading-comprehension adventure for Grade 3.

   Mira the Mapmaker 🧭 follows her grandmother's maps across five
   islands. Each island is a trail of six STOPS. To move, the child
   DRAGS Mira onto the next stop — which opens a short passage and
   two comprehension questions. Answer them and the trail lights up;
   miss one and Mira slides back so the passage can be re-read.

   Shapes
     island : { id, n, name, emoji, blurb, theme, chest, start, stops[6] }
     stop   : { name, emoji, x, y, passage:{title,text}, qs[2] }
     q      : { skill, q, a, wrong[], why, lookFor }
   `a` is the correct answer TEXT (never an index), so shuffling the
   choices can never desync the answer.
   x / y are percentages of the map box — the trail is drawn from them.
   `start` is the landing point: Mira stands there before stop 1, so the
   very first drag is a real journey rather than a drop onto herself.
   ============================================================ */

var ISLANDS = [

/* ============================================================
   1 — SANDY COVE · key details & sequence
   ============================================================ */
{
  id: "cove", n: 1, name: "Sandy Cove", emoji: "🏝️", theme: "t-cove",
  blurb: "Mira lands on the island and picks up her grandmother's trail.",
  chest: { icon: "🧭", name: "The Brass Compass" },
  start: { x: 5, y: 90 },            /* where Mira's boat lands */
  stops: [
    {
      name: "Landing Beach", emoji: "🏖️", x: 10, y: 74,
      passage: {
        title: "The Landing",
        text: "Mira's boat bumped against the sand at sunrise. She pulled it above the tide line and tied it to a grey log so the sea could not carry it away. In her pack were three things: her grandmother's map, a brass compass, and a notebook. The map showed six marks across the island and a red X at the end."
      },
      qs: [
        { skill: "Key Details", q: "How many things were in Mira's pack?",
          a: "Three", wrong: ["Two", "Four", "Six"],
          why: "The passage lists exactly three: the map, the compass and the notebook.",
          lookFor: "Find the sentence that begins “In her pack were…” and count the things after the colon." },
        { skill: "Sequence", q: "What did Mira do right AFTER she pulled the boat above the tide line?",
          a: "She tied it to a grey log", wrong: ["She opened her notebook", "She checked the map", "She pushed it back into the sea"],
          why: "The sentence says she pulled it up and tied it to a grey log so the sea could not carry it away.",
          lookFor: "Read the second sentence again and look for the word “tied”." }
      ]
    },
    {
      name: "Driftwood Camp", emoji: "🪵", x: 27, y: 58,
      passage: {
        title: "Cold Ashes",
        text: "At the camp Mira found a ring of stones with ashes inside. She held her hand above them. The ashes were cold, so whoever built this fire had left long before today. Beside the ring lay a wooden spoon and a torn page. On the page was a drawing of a shell with seven thin lines across it."
      },
      qs: [
        { skill: "Cause & Effect", q: "How did Mira know the campers had left long ago?",
          a: "The ashes were cold", wrong: ["The spoon was broken", "The stones were wet", "The page was torn"],
          why: "A fire that has just burned is still warm. Cold ashes mean a lot of time has passed.",
          lookFor: "Look for what happened when Mira held her hand above the ashes." },
        { skill: "Key Details", q: "What was drawn on the torn page?",
          a: "A shell with seven thin lines", wrong: ["A boat with seven oars", "A map with seven islands", "A bird with seven feathers"],
          why: "The last sentence describes a drawing of a shell with seven thin lines across it.",
          lookFor: "Read the very last sentence of the passage." }
      ]
    },
    {
      name: "Tide Pools", emoji: "🐚", x: 43, y: 70,
      passage: {
        title: "Seven Lines",
        text: "The tide pools were shallow bowls of water left behind when the sea went out. Tiny crabs scuttled sideways every time Mira's shadow fell across the water. In the third pool she found a shell with seven thin lines — exactly like the drawing. Under the shell, pressed into the wet sand, was an arrow pointing toward the cliff."
      },
      qs: [
        { skill: "Vocabulary", q: "In this passage, “scuttled” means the crabs…",
          a: "moved away quickly", wrong: ["fell fast asleep", "grew much larger", "made a loud noise"],
          why: "The crabs moved sideways the moment a shadow fell on them — they were hurrying away.",
          lookFor: "Read what the crabs did whenever Mira's shadow crossed the water." },
        { skill: "Cause & Effect", q: "Why did the crabs move?",
          a: "Mira's shadow fell across the water", wrong: ["The tide was coming back in", "Mira picked up a shell", "A gull landed in the pool"],
          why: "The passage says they moved every time her shadow fell across the water.",
          lookFor: "Find the word “whenever” or “every time” — it usually points at a cause." }
      ]
    },
    {
      name: "Gull Cliff", emoji: "🐦", x: 59, y: 50,
      passage: {
        title: "The White Cloud",
        text: "Hundreds of gulls nested on the cliff. When Mira climbed too close, they rose all at once in a screaming white cloud, and she had to back away with her arms over her head. She sat on a rock and waited until the birds settled again. Then she chose a different route along the low rocks, where no nests were."
      },
      qs: [
        { skill: "Cause & Effect", q: "Why did Mira climb a different route?",
          a: "The gulls flew up at her when she came near their nests",
          wrong: ["The first route was too steep to climb", "She had lost her map", "The tide had covered the first route"],
          why: "She backed away from the screaming gulls, waited, then picked a route with no nests on it.",
          lookFor: "What happened right before she chose a new way up?" },
        { skill: "Inference", q: "What does this part show about Mira?",
          a: "She is patient and solves problems calmly",
          wrong: ["She is afraid of the whole island", "She gives up easily", "She likes to frighten animals"],
          why: "She did not panic or quit — she waited for the birds to settle and then found another way.",
          lookFor: "Think about what she did after she backed away." }
      ]
    },
    {
      name: "Old Jetty", emoji: "⚓", x: 75, y: 62,
      passage: {
        title: "Soft Boards",
        text: "The jetty's boards were soft with rot, so Mira pressed each one with her foot before she trusted it. Halfway along, a board cracked and her leg plunged into cold water. She pulled it out, then lay flat and spread her weight across three boards at once, the way her grandmother had taught her, and crawled the rest of the way."
      },
      qs: [
        { skill: "Inference", q: "Why did Mira lie flat and crawl instead of walking?",
          a: "Spreading her weight kept the weak boards from breaking",
          wrong: ["She was too tired to stand up", "She was hiding from the gulls", "The jetty was too low to stand on"],
          why: "When your weight is spread across three boards, no single board has to hold all of it.",
          lookFor: "Look at what she spread across three boards at once, and why that might help." },
        { skill: "Key Details", q: "Who taught Mira the crawling trick?",
          a: "Her grandmother", wrong: ["A park ranger", "Her older brother", "A sailor at the jetty"],
          why: "The passage says she did it “the way her grandmother had taught her.”",
          lookFor: "Find the phrase “the way her grandmother…” near the end." }
      ]
    },
    {
      name: "Cove Cave", emoji: "🕳️", x: 89, y: 36,
      passage: {
        title: "Not Gold",
        text: "The cave behind the jetty smelled of salt and cold stone. Mira raised her lantern and saw the seven-lined shell carved above a low opening. She squeezed through and found a small wooden chest wedged under a ledge. Inside was not gold, but a second map showing a jungle, and a note in her grandmother's handwriting that said: Keep going."
      },
      qs: [
        { skill: "Main Idea", q: "What is this passage MOSTLY about?",
          a: "Mira finds a chest that holds a new map instead of treasure",
          wrong: ["Mira explores a cave that smells of salt", "Mira carves a shell above an opening", "Mira loses her lantern in the dark"],
          why: "Every sentence builds to the chest and what was really inside it — a map, not gold.",
          lookFor: "Ask yourself what the whole passage is building towards, not just one detail." },
        { skill: "Predicting", q: "What will Mira MOST LIKELY do next?",
          a: "Follow the new map into the jungle",
          wrong: ["Sail home with the empty chest", "Put the shell back in the tide pool", "Rebuild the old jetty"],
          why: "The note says “Keep going,” and the new map shows a jungle.",
          lookFor: "Read the note at the end and the picture on the new map." }
      ]
    }
  ]
},

/* ============================================================
   2 — PALM JUNGLE · main idea & vocabulary in context
   ============================================================ */
{
  id: "jungle", n: 2, name: "Palm Jungle", emoji: "🌴", theme: "t-jungle",
  blurb: "Thick green paths, loud birds, and a shrine nobody has swept in years.",
  chest: { icon: "🦜", name: "The Parrot Feather" },
  start: { x: 4, y: 86 },            /* where Mira's boat lands */
  stops: [
    {
      name: "Vine Gate", emoji: "🌿", x: 8, y: 66,
      passage: {
        title: "The Green Wall",
        text: "Where the beach ended, the jungle began like a green wall. Vines hung so thickly that Mira could not see three steps ahead. She used a flat stick to part them instead of cutting, because her grandmother's note said: leave the island the way you found it. Slowly, a narrow path appeared beneath her feet."
      },
      qs: [
        { skill: "Cause & Effect", q: "Why did Mira part the vines instead of cutting them?",
          a: "Her grandmother's note asked her to leave the island as she found it",
          wrong: ["She had forgotten to bring a knife", "The vines were too thick to cut", "She was trying to move quietly"],
          why: "The passage gives the reason directly: the note said to leave the island the way she found it.",
          lookFor: "Look for the word “because” — it almost always points to a reason." },
        { skill: "Main Idea", q: "What is this passage mostly about?",
          a: "Mira carefully finds a way into the thick jungle",
          wrong: ["Mira builds a gate out of vines", "Mira gets lost and turns back", "Mira takes a nap on the beach"],
          why: "The whole passage is about her getting through the green wall without damaging it.",
          lookFor: "Which sentence would you keep if you could only keep one?" }
      ]
    },
    {
      name: "Parrot Hollow", emoji: "🦜", x: 24, y: 48,
      passage: {
        title: "Borrowed Words",
        text: "In the hollow, green parrots repeated every sound they heard. One bird said a whole sentence in a voice that was not Mira's: “The stone remembers.” Mira went very still. Parrots only copy what they have heard before, so someone had stood in this hollow and said those three words out loud."
      },
      qs: [
        { skill: "Inference", q: "What can you tell from the parrot's sentence?",
          a: "A person once stood in the hollow and said those words",
          wrong: ["The parrot invented a new sentence", "Mira had said the words earlier that day", "The stone can really talk"],
          why: "The passage explains that parrots only copy sounds they have already heard.",
          lookFor: "Read the last sentence — it tells you how parrots learn words." },
        { skill: "Vocabulary", q: "In this passage, “went very still” means Mira…",
          a: "stopped moving completely", wrong: ["started to run", "spoke very loudly", "fell down in the mud"],
          why: "She froze in surprise at hearing a stranger's voice come out of a bird.",
          lookFor: "Picture what a person does the instant they hear something startling." }
      ]
    },
    {
      name: "Rope Bridge", emoji: "🌉", x: 41, y: 62,
      passage: {
        title: "One at a Time",
        text: "A rope bridge crossed a gorge with a river far below. A wooden sign hung from the first post. It read: ONE AT A TIME. MIND THE THIRD PLANK. Mira was travelling alone, so the first rule was easy. She counted planks as she went and stepped right over the third one, which was split from end to end."
      },
      qs: [
        { skill: "Text Features", q: "Why did the sign matter to Mira?",
          a: "It warned her about a broken plank before she stepped on it",
          wrong: ["It told her the name of the river", "It showed her how far the jungle went", "It said who built the bridge"],
          why: "The sign's warning is exactly why she counted planks and skipped the third one.",
          lookFor: "Compare what the sign said with what Mira then did." },
        { skill: "Main Idea", q: "The best title for this passage is…",
          a: "Reading the Sign Before Crossing", wrong: ["Building a Rope Bridge", "Fishing in the River", "Losing Count of the Planks"],
          why: "The passage is about how reading the warning kept her safe on the crossing.",
          lookFor: "A good title covers the whole passage, not one small detail." }
      ]
    },
    {
      name: "Fern Hollow", emoji: "🌱", x: 58, y: 44,
      passage: {
        title: "Ferns That Point",
        text: "Ferns grew everywhere in the hollow, but one narrow line of them had been trampled flat long ago and never grew back straight. The bent ferns made a path as clear as an arrow. Mira followed the crooked line rather than the easy open ground, because a trail that people once used is a trail that leads somewhere."
      },
      qs: [
        { skill: "Inference", q: "Why did Mira follow the bent ferns?",
          a: "Bent ferns showed that people had walked that way before",
          wrong: ["The bent ferns were easier to walk on", "The open ground was flooded", "The ferns smelled better there"],
          why: "She reasoned that a path people once used must lead somewhere useful.",
          lookFor: "Read the reason after the word “because” at the end." },
        { skill: "Vocabulary", q: "In this passage, “trampled” means the ferns were…",
          a: "stepped on and crushed down", wrong: ["planted in neat rows", "watered every morning", "picked and carried away"],
          why: "Something trampled has been walked on hard enough to flatten it.",
          lookFor: "The passage says the line of ferns was flattened and never grew back straight." }
      ]
    },
    {
      name: "Waterfall", emoji: "💦", x: 74, y: 58,
      passage: {
        title: "Behind the Water",
        text: "The waterfall was loud enough that Mira had to shout to hear herself. Spray soaked her sleeves. She almost turned back, then noticed that the ferns kept going — right up to the falling water and no further. She put one hand on the wet rock, stepped sideways behind the curtain of water, and found dry ground."
      },
      qs: [
        { skill: "Drawing Conclusions", q: "Why did Mira decide to step behind the waterfall?",
          a: "The fern trail led to the water and stopped there",
          wrong: ["She wanted to wash off the mud", "She heard the parrot again", "She was looking for a drink"],
          why: "A trail that ends at a wall of water suggests the way through is behind it.",
          lookFor: "What did she notice about the ferns just before she moved?" },
        { skill: "Key Details", q: "Why did Mira have to shout?",
          a: "The waterfall was very loud", wrong: ["Someone was calling her name", "She was far from the path", "The parrots were sleeping"],
          why: "The first sentence says the waterfall was loud enough that she had to shout to hear herself.",
          lookFor: "Read the opening sentence again." }
      ]
    },
    {
      name: "Hidden Shrine", emoji: "🛕", x: 90, y: 34,
      passage: {
        title: "The Stone Remembers",
        text: "Behind the water stood a small stone shrine, dry and cool. Carved across its face were three words worn smooth by time: THE STONE REMEMBERS. Beneath them, a shallow bowl held a key made of green metal. Mira copied every mark into her notebook before she touched anything, exactly as a good mapmaker should."
      },
      qs: [
        { skill: "Main Idea", q: "What is the most important thing that happens here?",
          a: "Mira finds the carved words from the parrot and a green key",
          wrong: ["Mira dries off behind the waterfall", "Mira draws a picture of a bowl", "Mira decides to go home"],
          why: "The shrine matches the parrot's sentence and holds the key she will need next.",
          lookFor: "Which detail connects back to something earlier in her journey?" },
        { skill: "Author's Purpose", q: "Why does the author mention Mira's notebook?",
          a: "To show that Mira records things carefully before acting",
          wrong: ["To show that Mira was bored", "To explain how the shrine was built", "To prove the key was valuable"],
          why: "Copying the marks first “as a good mapmaker should” shows her careful habits.",
          lookFor: "Ask what the notebook detail tells you about the kind of person Mira is." }
      ]
    }
  ]
},

/* ============================================================
   3 — STONE RUINS · inference & cause and effect
   ============================================================ */
{
  id: "ruins", n: 3, name: "Stone Ruins", emoji: "🗿", theme: "t-ruins",
  blurb: "An old city of arches and statues, with a door that needs a green key.",
  chest: { icon: "🗝️", name: "The Green Key" },
  start: { x: 5, y: 88 },            /* where Mira's boat lands */
  stops: [
    {
      name: "Broken Arch", emoji: "🏛️", x: 12, y: 70,
      passage: {
        title: "What the Arch Says",
        text: "The arch at the city gate had fallen in the middle, but both halves still stood. Carved birds ran along the stone, and every single bird faced left. Mira had read that builders carved birds facing the way visitors were meant to walk. She turned left, even though the wider road went right."
      },
      qs: [
        { skill: "Inference", q: "Why did Mira turn left?",
          a: "The carved birds all faced left, showing the way visitors should go",
          wrong: ["The left road was wider and easier", "The right road was blocked by the arch", "She heard a noise on the left"],
          why: "She knew carved birds pointed the visitor's direction, so she trusted them over the wider road.",
          lookFor: "Notice what Mira had read about carved birds." },
        { skill: "Cause & Effect", q: "What was the EFFECT of Mira knowing about carved birds?",
          a: "She chose the correct road instead of the easy one",
          wrong: ["She repaired the broken arch", "She drew every bird in her notebook", "She waited until morning to move"],
          why: "Her knowledge changed what she did — she took the narrow left road on purpose.",
          lookFor: "An effect is what happens because of something. What did she do differently?" }
      ]
    },
    {
      name: "Statue Row", emoji: "🗿", x: 28, y: 52,
      passage: {
        title: "Nine Statues",
        text: "Nine stone figures lined the road. Eight of them held their hands open and empty. The ninth held a stone bowl, and its base was worn shiny, as if thousands of hands had touched that one spot. Mira pressed the bowl. Somewhere under the road, something heavy slid."
      },
      qs: [
        { skill: "Inference", q: "Why was only the ninth statue's base worn shiny?",
          a: "Many people had touched that statue over many years",
          wrong: ["It was carved from softer stone", "It stood in bright sunlight", "It was newer than the others"],
          why: "Stone is polished by being touched again and again — that statue was the one people used.",
          lookFor: "What did the passage compare the worn spot to?" },
        { skill: "Cause & Effect", q: "What happened AFTER Mira pressed the bowl?",
          a: "Something heavy slid under the road", wrong: ["The statue fell over", "A door opened in the arch", "The other statues turned"],
          why: "The last sentence says something heavy slid somewhere under the road.",
          lookFor: "Read the final sentence of the passage." }
      ]
    },
    {
      name: "Sun Dial", emoji: "☀️", x: 45, y: 66,
      passage: {
        title: "Waiting for Noon",
        text: "In the square stood a sundial with a crack across its face. Its shadow fell on a worn mark near the crack. Mira checked her watch: it was almost noon. She sat down and waited eleven minutes, and at exactly noon the shadow lined up with an arrow cut into the stone, pointing at a stairway she had walked straight past."
      },
      qs: [
        { skill: "Cause & Effect", q: "Why did Mira sit and wait eleven minutes?",
          a: "The sundial's clue only worked at exactly noon",
          wrong: ["She was tired from the climb", "She was waiting for the rain to stop", "Her watch had stopped working"],
          why: "At noon the shadow lined up with the arrow — before then it pointed nowhere useful.",
          lookFor: "What happened at exactly noon that had not happened before?" },
        { skill: "Inference", q: "Why had Mira missed the stairway before?",
          a: "Nothing pointed it out until the shadow moved",
          wrong: ["The stairway was underwater", "She had not reached the square yet", "The statues were in the way"],
          why: "She had walked straight past it because there was no sign showing it mattered.",
          lookFor: "Read the very end — what had she walked past?" }
      ]
    },
    {
      name: "Collapsed Stair", emoji: "🪜", x: 62, y: 48,
      passage: {
        title: "Three Missing Steps",
        text: "The stairway went down into the dark, but three steps near the bottom had crumbled away. Mira lowered her pack on a rope first, then climbed down using cracks in the wall. She landed in dust that had not been disturbed for a very long time — except for one shape: a single old boot print, much bigger than her own."
      },
      qs: [
        { skill: "Inference", q: "What does the boot print tell Mira?",
          a: "Someone else came down here a long time ago",
          wrong: ["The stairs broke this morning", "An animal lives in the dark", "Her own boots left the mark"],
          why: "The dust was undisturbed except for that print, and it was bigger than hers — so it was someone else's, left long before.",
          lookFor: "Compare the size of the print with Mira's own boots." },
        { skill: "Sequence", q: "What did Mira do FIRST?",
          a: "Lowered her pack on a rope", wrong: ["Climbed down the wall cracks", "Measured the boot print", "Repaired the broken steps"],
          why: "She lowered the pack first, then climbed down using the cracks.",
          lookFor: "Look for the words “first” and “then” in the passage." }
      ]
    },
    {
      name: "Echo Hall", emoji: "🔊", x: 78, y: 62,
      passage: {
        title: "Counting Echoes",
        text: "In the long hall, Mira clapped once and heard four echoes come back. She clapped near the left wall and heard only two. More echoes meant more open space ahead, so she followed the direction where the echoes multiplied. The hall opened into a chamber so wide her lantern could not reach the far side."
      },
      qs: [
        { skill: "Cause & Effect", q: "Why did Mira follow the direction with MORE echoes?",
          a: "More echoes meant there was more open space that way",
          wrong: ["More echoes meant the way was safer", "She was following the sound of voices", "Fewer echoes meant a dead end behind her"],
          why: "The passage states the rule directly: more echoes, more open space ahead.",
          lookFor: "Find the sentence that explains what more echoes mean." },
        { skill: "Drawing Conclusions", q: "What can you conclude about the chamber?",
          a: "It is very large", wrong: ["It is full of water", "It is brightly lit", "It is completely sealed"],
          why: "Her lantern could not reach the far side, which means the space is huge.",
          lookFor: "Think about what it means when a light cannot reach the other wall." }
      ]
    },
    {
      name: "Sealed Door", emoji: "🚪", x: 90, y: 32,
      passage: {
        title: "The Green Lock",
        text: "At the far side stood a door with no handle, only a round hole rimmed in green metal — the same green as the key from the shrine. Mira fitted the key and turned. The door did not open. She turned it the other way instead, and the stone swung inward, letting warm air and the smell of ash pour through."
      },
      qs: [
        { skill: "Problem & Solution", q: "How did Mira solve the problem of the door?",
          a: "She turned the key the opposite way",
          wrong: ["She pushed the door with her shoulder", "She found a second key", "She climbed through the round hole"],
          why: "When turning one way failed, she tried the other direction and the door opened.",
          lookFor: "What did she do after the door did not open the first time?" },
        { skill: "Predicting", q: "The smell of ash suggests that the next place is…",
          a: "somewhere that has burned, like a volcano",
          wrong: ["a cold underwater cave", "another quiet jungle", "the beach where she landed"],
          why: "Ash and warm air are clues that fire or a volcano is ahead.",
          lookFor: "Two clues come through the open door — heat and a smell. What makes both?" }
      ]
    }
  ]
},

/* ============================================================
   4 — EMBER PEAK · author's purpose, fact vs opinion, compare
   ============================================================ */
{
  id: "peak", n: 4, name: "Ember Peak", emoji: "🌋", theme: "t-peak",
  blurb: "A sleeping volcano, a ranger's notice board, and a signal fire.",
  chest: { icon: "🔥", name: "The Ember Stone" },
  start: { x: 4, y: 87 },            /* where Mira's boat lands */
  stops: [
    {
      name: "Ash Field", emoji: "🌋", x: 10, y: 68,
      passage: {
        title: "Grey Snow",
        text: "The field was covered in soft grey ash that puffed up at every step. Nothing grew there except one small green shoot pushing through near a warm rock. Mira wrote in her notebook: “Ash is not empty. It is the beginning of new soil.” She drew the shoot carefully and marked its place on her map."
      },
      qs: [
        { skill: "Fact & Opinion", q: "Which sentence from the passage is a FACT?",
          a: "The field was covered in soft grey ash",
          wrong: ["Ash is the beginning of new soil", "Ash fields are the best places to explore", "The shoot was the prettiest plant on the island"],
          why: "A fact can be checked by looking. The other statements are what someone believes or feels.",
          lookFor: "A fact can be proven true. An opinion is what a person thinks." },
        { skill: "Inference", q: "Why did Mira mark the shoot's place on her map?",
          a: "So she could record where new life was growing",
          wrong: ["So she could come back and pick it", "So she would not get lost", "So the rangers could remove it"],
          why: "She is a mapmaker recording what she finds — the shoot mattered enough to write about.",
          lookFor: "Read what she wrote in her notebook just before she drew it." }
      ]
    },
    {
      name: "Steam Vents", emoji: "♨️", x: 26, y: 50,
      passage: {
        title: "Two Kinds of Steam",
        text: "Steam rose from cracks all over the slope. Some vents breathed out slow, thin steam that smelled of nothing at all. Others hissed thick white clouds that stung Mira's nose. She kept well away from the hissing ones and walked between the quiet vents, checking each crack before she crossed it."
      },
      qs: [
        { skill: "Compare & Contrast", q: "How were the two kinds of vents DIFFERENT?",
          a: "Quiet vents gave off thin, odourless steam; hissing vents gave off thick steam that stung",
          wrong: ["Quiet vents were hot and hissing vents were cold", "Quiet vents were new and hissing vents were old", "Quiet vents were on the slope and hissing vents were in the field"],
          why: "The passage contrasts slow thin steam with no smell against thick hissing steam that stung.",
          lookFor: "Find the sentence starting “Some vents…” and the one starting “Others…”" },
        { skill: "Cause & Effect", q: "Why did Mira walk between the quiet vents?",
          a: "The hissing vents were dangerous to be near",
          wrong: ["The quiet vents were warmer to walk on", "The path was marked that way", "She wanted to reach the ash field"],
          why: "Steam that stings is a warning, so she stayed away from those and used the safe gaps.",
          lookFor: "What did the thick steam do to her nose?" }
      ]
    },
    {
      name: "Ranger Hut", emoji: "🏚️", x: 43, y: 64,
      passage: {
        title: "Notice Board",
        text: "An empty ranger hut stood on the ridge. On its notice board, under cracked glass, was a printed sheet: “EMBER PEAK HAS NOT ERUPTED FOR 240 YEARS. Steam vents are normal. Do not climb the crater rim in high wind. Report any new cracks to the station at Blue Bay.” Mira copied the whole notice into her notebook."
      },
      qs: [
        { skill: "Author's Purpose", q: "Why was the notice written?",
          a: "To give visitors information and keep them safe",
          wrong: ["To tell an exciting story about a volcano", "To convince people to move to the island", "To sell tickets to the crater"],
          why: "It gives facts and rules — that is writing meant to inform and protect.",
          lookFor: "Notices with rules and facts are usually written to inform, not to entertain." },
        { skill: "Key Details", q: "According to the notice, when should visitors avoid the crater rim?",
          a: "In high wind", wrong: ["At night", "After rain", "In summer"],
          why: "The notice says: do not climb the crater rim in high wind.",
          lookFor: "Read the third sentence of the notice." }
      ]
    },
    {
      name: "Lava Tube", emoji: "🕳️", x: 60, y: 46,
      passage: {
        title: "A River That Left",
        text: "A lava tube is a long tunnel made when the outside of a lava river hardens while the hot middle keeps flowing and drains away. This one was smooth, round and cool, and wide enough to walk through upright. Mira noticed that the walls were ribbed like the inside of a shell, marking the level of the lava as it slowly emptied."
      },
      qs: [
        { skill: "Main Idea", q: "This passage mostly explains…",
          a: "how a lava tube forms and what it looks like inside",
          wrong: ["why Mira was afraid of the dark", "how far the tunnel goes", "who built the tunnel and when"],
          why: "The first sentence defines a lava tube and the rest describes this one.",
          lookFor: "In an informational passage, the first sentence often states the topic." },
        { skill: "Cause & Effect", q: "What causes the ribs on a lava tube's walls?",
          a: "The lava level dropping a little at a time as it drained",
          wrong: ["Water dripping from the ceiling", "People carving lines into the stone", "Shells stuck in the rock"],
          why: "Each rib marks where the surface of the lava paused as it emptied out.",
          lookFor: "The last sentence says what the ribs mark." }
      ]
    },
    {
      name: "Crater Rim", emoji: "🌡️", x: 77, y: 60,
      passage: {
        title: "Wind on the Rim",
        text: "At the rim the wind pushed hard enough to make Mira lean into it. She remembered the ranger's notice and stopped where she was. From there she could still see what she needed: far below on the black rock, someone had arranged pale stones into a huge arrow pointing east, towards the cliffs."
      },
      qs: [
        { skill: "Drawing Conclusions", q: "Why did Mira stop instead of walking along the rim?",
          a: "The ranger's notice warned against the rim in high wind",
          wrong: ["She could not see anything from there", "She had run out of water", "The rim was too hot to stand on"],
          why: "She remembered the safety notice she had copied and obeyed it.",
          lookFor: "What did she remember right before she stopped?" },
        { skill: "Inference", q: "What does the stone arrow tell Mira?",
          a: "A person put it there on purpose to point the way east",
          wrong: ["The wind blew the stones into a line", "The volcano threw the stones out", "The arrow marks a danger to avoid"],
          why: "Pale stones “arranged” into a huge arrow is something only a person would do deliberately.",
          lookFor: "The word “arranged” is a clue about who made the shape." }
      ]
    },
    {
      name: "Signal Fire", emoji: "🔥", x: 90, y: 30,
      passage: {
        title: "Still Warm",
        text: "Where the arrow pointed, Mira found a ring of blackened stones on the cliff top — a signal fire, built to be seen from the sea. She held her hand above the ashes. This time they were warm. Mira looked out at the empty water, then back at the fire, and wrote one line in her notebook: “I am not alone here.”"
      },
      qs: [
        { skill: "Compare & Contrast", q: "How are these ashes different from the ones at Driftwood Camp?",
          a: "These ashes are warm, so this fire burned recently",
          wrong: ["These ashes are grey instead of black", "These ashes are inside a cave", "These ashes are much older"],
          why: "Cold ashes meant a fire long ago; warm ashes mean someone was here very recently.",
          lookFor: "Remember what cold ashes told Mira on the first island." },
        { skill: "Character", q: "Why does Mira write “I am not alone here”?",
          a: "She realises another person is on the island right now",
          wrong: ["She is glad the parrots followed her", "She has decided to give up", "She can see a ship on the water"],
          why: "A warm fire means someone lit it recently — and the water is empty, so they are still on the island.",
          lookFor: "Put together the warm ashes and the empty sea." }
      ]
    }
  ]
},

/* ============================================================
   5 — CRYSTAL CAVES · drawing conclusions & summarising
   ============================================================ */
{
  id: "caves", n: 5, name: "Crystal Caves", emoji: "💎", theme: "t-caves",
  blurb: "The last map. Still water, glittering stone, and whoever lit that fire.",
  chest: { icon: "💎", name: "The Mapmaker's Chest" },
  start: { x: 4, y: 85 },            /* where Mira's boat lands */
  stops: [
    {
      name: "Cave Mouth", emoji: "🕳️", x: 9, y: 64,
      passage: {
        title: "Two Sets of Prints",
        text: "The cave mouth opened behind a curtain of hanging roots. In the mud outside were two sets of boot prints: one going in, one coming out, both the same large size. The set coming out was pressed on top of the set going in. Mira crouched, studied them, and understood that whoever it was had already been inside and left again."
      },
      qs: [
        { skill: "Drawing Conclusions", q: "How does Mira know the person came out AFTER going in?",
          a: "The prints coming out were pressed on top of the prints going in",
          wrong: ["The prints coming out were deeper", "The prints coming out were fresher mud", "There were more prints coming out"],
          why: "Whichever print sits on top was made last — so the outward trip came second.",
          lookFor: "Read the sentence about which set was pressed on top." },
        { skill: "Inference", q: "Whose boot prints are these most likely?",
          a: "The same person who left the big print in the ruins",
          wrong: ["Mira's own prints from earlier", "A ranger from Blue Bay", "Her grandmother, many years ago"],
          why: "Both prints were much larger than Mira's, and the signal fire showed someone is here now.",
          lookFor: "Think back to the boot print in the dust at the Collapsed Stair." }
      ]
    },
    {
      name: "Mirror Lake", emoji: "🪞", x: 25, y: 46,
      passage: {
        title: "Still Water",
        text: "An underground lake lay so still that it copied the ceiling perfectly. Mira almost stepped straight into it, because the reflection looked exactly like more cave floor. She tossed a pebble; rings spread out and the illusion broke. After that she tested the ground ahead with her stick at every step."
      },
      qs: [
        { skill: "Cause & Effect", q: "Why did Mira almost step into the lake?",
          a: "The water was so still it looked like solid floor",
          wrong: ["Her lantern had gone out", "She was running from something", "The water was hidden by roots"],
          why: "A perfect reflection made the surface look like more cave floor.",
          lookFor: "Read the reason given after the word “because”." },
        { skill: "Problem & Solution", q: "What did Mira change after the pebble broke the illusion?",
          a: "She tested the ground ahead with her stick at every step",
          wrong: ["She walked much faster to save time", "She turned back to the cave mouth", "She put out her lantern to see better"],
          why: "The last sentence tells you the new habit she adopted for the rest of the cave.",
          lookFor: "What does the final sentence say she did from then on?" }
      ]
    },
    {
      name: "Crystal Forest", emoji: "💎", x: 42, y: 62,
      passage: {
        title: "Stone That Grew",
        text: "Thousands of clear crystals rose from the cave floor like a forest of glass. A sign on a rusted stake read: PLEASE DO NOT BREAK. THESE TOOK 10,000 YEARS TO GROW. Mira did not touch a single one. She drew three of them instead, and noted that the biggest crystals grew where water still dripped from above."
      },
      qs: [
        { skill: "Cause & Effect", q: "Where did the biggest crystals grow?",
          a: "Where water still dripped from above",
          wrong: ["Closest to the cave entrance", "Where the floor was driest", "Beside the rusted sign"],
          why: "The last sentence links the biggest crystals to the places water still dripped.",
          lookFor: "Read Mira's final note in the passage." },
        { skill: "Author's Purpose", q: "Why did someone put up the sign?",
          a: "To persuade visitors to protect something that took ages to form",
          wrong: ["To explain how crystals are made", "To entertain visitors with a story", "To show the way out of the cave"],
          why: "“Please do not break” plus a reason is writing meant to persuade people to act a certain way.",
          lookFor: "Is the sign giving an instruction, telling a story, or asking you to do something?" }
      ]
    },
    {
      name: "Narrow Squeeze", emoji: "↔️", x: 59, y: 44,
      passage: {
        title: "Pack First",
        text: "The passage narrowed until Mira had to take off her pack and push it ahead of her. She breathed out to make herself thinner and inched through sideways. On the other side she sat down, shaking a little, and drank some water before going on. Her grandmother's note came back to her: slow is not the same as stuck."
      },
      qs: [
        { skill: "Character", q: "How did Mira feel after the squeeze?",
          a: "Shaken but determined to keep going",
          wrong: ["Angry at her grandmother", "Bored and ready to sleep", "Certain she should turn back"],
          why: "She was shaking a little, rested, drank water, and then went on anyway.",
          lookFor: "Look at what she did after sitting down." },
        { skill: "Summarising", q: "Which sentence best SUMMARISES this passage?",
          a: "Mira squeezes through a very tight passage and keeps going",
          wrong: ["Mira takes a long rest beside a lake", "Mira decides the cave is too dangerous", "Mira remembers her grandmother's whole letter"],
          why: "A summary covers the main event — getting through the squeeze and carrying on.",
          lookFor: "A summary keeps the big thing that happened and leaves out small details." }
      ]
    },
    {
      name: "Underground River", emoji: "🌊", x: 76, y: 58,
      passage: {
        title: "Following the Sound",
        text: "Mira heard running water long before she saw it. An underground river cut across the cave, shallow at one end and deep and fast at the other. Floating on the shallow side was a paper boat, folded from a page of a notebook exactly like hers. It had not been in the water long — the paper was barely wet."
      },
      qs: [
        { skill: "Drawing Conclusions", q: "What does the barely-wet paper boat tell Mira?",
          a: "Someone folded and floated it very recently",
          wrong: ["The river is slowly drying up", "The boat has been there for years", "She dropped it herself earlier"],
          why: "Paper soaks quickly, so a barely-wet boat must have been placed there a short time ago.",
          lookFor: "Why would the paper still be dry if the boat had been there a long time?" },
        { skill: "Inference", q: "Why is it important that the paper matches her own notebook?",
          a: "It suggests the other person is connected to her family",
          wrong: ["It proves the river flows to the sea", "It means the notebook was stolen", "It shows the cave is used by rangers"],
          why: "The same kind of notebook links this stranger to her grandmother's expeditions.",
          lookFor: "Whose notebook does Mira carry, and who gave her the maps?" }
      ]
    },
    {
      name: "Treasure Chamber", emoji: "💰", x: 90, y: 30,
      passage: {
        title: "What Was in the Chest",
        text: "The chamber glittered from floor to ceiling. In the middle sat a chest, already unlocked, with a lantern burning beside it. Inside were forty notebooks — one for every expedition her grandmother had ever made — and on top, a new blank one with Mira's name on the cover. Behind her, a voice said kindly, “You read your way here. That is the whole trick.”"
      },
      qs: [
        { skill: "Main Idea", q: "What was the real treasure?",
          a: "Her grandmother's forty notebooks and a blank one for Mira",
          wrong: ["A chest of gold coins from her grandmother's voyages",
                  "The burning lantern someone had left beside the chest",
                  "The glittering crystals covering the chamber walls"],
          why: "The chest held the record of every expedition, plus an empty notebook for Mira's own.",
          lookFor: "Read what was actually inside the chest." },
        { skill: "Summarising", q: "Which sentence best summarises Mira's whole journey?",
          a: "Mira followed written clues across five islands and found her grandmother's life's work",
          wrong: ["Mira sailed a boat and got her feet wet", "Mira met some parrots and crabs on an island", "Mira climbed a volcano and then went home"],
          why: "A summary of the whole story keeps the reading, the five islands and what she finally found.",
          lookFor: "A good summary covers the beginning, the middle and the end — not one island." }
      ]
    }
  ]
},

];

/* ============================================================
   REWARDS
   ============================================================ */
var CI_TROPHIES = [
  { id: "first-stop",  icon: "👣", name: "First Steps",       desc: "Reach your first stop on a map" },
  { id: "first-chest", icon: "🧰", name: "Chest Opener",       desc: "Finish a whole island" },
  { id: "sharp-eyes",  icon: "👁️", name: "Sharp Eyes",         desc: "Clear an island with no re-reads" },
  { id: "half-way",    icon: "🗺️", name: "Halfway There",      desc: "Finish 3 islands" },
  { id: "gem-hunter",  icon: "💎", name: "Gem Hunter",         desc: "Collect 60 gems" },
  { id: "all-skills",  icon: "🧠", name: "Skill Collector",    desc: "Answer a question in 12 different skills" },
  { id: "mapmaker",    icon: "🧭", name: "Mapmaker",           desc: "Finish every island on Clue Island" }
];

/* what Mira says when a stop is cleared */
var CI_CHEERS = [
  "Good reading!", "You found it!", "That's the clue!", "Nice thinking!",
  "The trail opens!", "Exactly right!"
];
var CI_RETRIES = [
  "Not quite — read it once more.",
  "Close! The answer is hiding in the passage.",
  "Let's check the passage again.",
  "Good try — the clue is in there."
];

/* how many gems each thing is worth */
var CI_GEM_FIRST_TRY = 5;   // correct on the first try
var CI_GEM_RETRY = 2;       // correct after a re-read
