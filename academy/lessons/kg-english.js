/* Academy lessons: Kindergarten English (js/syllabus.js kg.english). Format: academy/js/lessons.js. Read aloud: short sentences.
   Sounds are named by example words ("the s in sun"), never /s/, so read-aloud says them well. */
AcademyLessons.add("kg-english", {
  1: { learn: [
      ["Every letter has a sound", "🔤", ["The s in sun.", "The m in moon.", "The t in top."], "Quill said the letter sounds: the s in sun, the m in moon, the t in top."],
      ["First sounds", "👂", ["Listen to the start of a word.", "Dog starts with the d sound."], "Ben heard dog. The first sound was d, like in duck!"]
    ], q: [
      ["e", "mc", "☀️", "Sun starts with which letter?", ["S", "T", "M"], "Sun starts with S."],
      ["e", "mc", "🐶", "Dog starts with which letter?", ["D", "B", "G"], "Dog starts with D."],
      ["e", "tf", "🎩", "Hat starts with H.", true, "Hat starts with the h sound."],
      ["e", "mc", "🍎", "Apple starts with which letter?", ["A", "E", "P"], "Apple starts with A."],
      ["m", "mc", "🐟", "Which word starts like fan?", ["Fish", "Van", "Pan"], "Fan and fish both start with F."],
      ["m", "mc", "🐱", "Which word starts like cat?", ["Cup", "Hat", "Bat"], "Cat and cup both start with C."],
      ["m", "match", "🔠", "Match the letter to the word.", [["B", "Ball"], ["R", "Rain"], ["N", "Nest"]], "Each word starts with that letter."],
      ["m", "tf", "🌙", "Moon starts with N.", false, "Moon starts with M."]
    ] },
  2: { learn: [
      ["Blend the sounds", "🧩", ["Say each sound, then push them together.", "c, a, t makes cat.", "s, u, n makes sun."], "Quill said the sounds slowly: p, i, g. Faster! Pig!"],
      ["Split the word", "✂️", ["Words break into sounds.", "Map has three sounds: m, a, p."], "Ava tapped one finger for each sound in map. Three taps!"]
    ], q: [
      ["e", "mc", "🐷", "Blend p, i, g. What word?", ["Pig", "Peg", "Pin"], "p, i, g makes pig."],
      ["e", "mc", "🐱", "Blend c, a, t. What word?", ["Cat", "Cut", "Cap"], "c, a, t makes cat."],
      ["e", "tf", "☀️", "s, u, n makes sun.", true, "Sun has the sounds s, u, n."],
      ["e", "mc", "🛏️", "Blend b, e, d. What word?", ["Bed", "Bad", "Bud"], "b, e, d makes bed."],
      ["m", "mc", "🗺️", "How many sounds in map?", ["3", "2", "4"], "m, a, p: three sounds."],
      ["m", "mc", "🦊", "Blend f, o, x. What word?", ["Fox", "Fix", "Box"], "f, o, x makes fox."],
      ["m", "mc", "🪣", "What is the middle sound in cup?", ["u, like in up", "a, like in apple", "o, like in on"], "Cup has the u sound in the middle."],
      ["m", "tf", "🚌", "Bus starts with the sound in ball.", true, "Bus and ball both start with b."]
    ] },
  3: { learn: [
      ["Words to know by sight", "👀", ["Some words we just know.", "the, and, is, I, a, to."], "Ben read: I see the dog. He knew I and the right away!"],
      ["Find them in books", "📖", ["Sight words are in every book.", "Spot them and read faster."], "Ava found the word the five times on one page!"]
    ], q: [
      ["e", "mc", "👀", "Which is the word the?", ["the", "ten", "tea"], "This word is the.", "Which word says the? t h e, t e n, or t e a?"],
      ["e", "mc", "👀", "Which is the word and?", ["and", "ant", "an"], "This word is and.", "Which word says and? a n d, a n t, or a n?"],
      ["e", "tf", "👀", "I is a word all by itself.", true, "I is a word: I like cake."],
      ["e", "mc", "👀", "Which is the word is?", ["is", "it", "in"], "This word is is.", "Which word says is? i s, i t, or i n?"],
      ["m", "mc", "📖", "I ___ a dog. Which word fits?", ["see", "the", "and"], "I see a dog.", "I blank a dog. Which word fits?"],
      ["m", "mc", "📖", "The cat ___ big. Which word fits?", ["is", "to", "a"], "The cat is big.", "The cat blank big. Which word fits?"],
      ["m", "c2", "👀", "Which two are sight words?", ["the", "said"], ["zebra", "rocket"], "The and said are words we read by sight."],
      ["m", "tf", "👀", "We sound out every sight word slowly.", false, "We learn sight words so we know them fast."]
    ] },
  4: { learn: [
      ["Two letters, one sound", "🐚", ["sh as in ship.", "ch as in chip.", "th as in thumb."], "Quill said: shh! The ship is sailing. Sh is one sound made by two letters."],
      ["ck at the end", "🦆", ["ck says the k sound.", "duck, sock, back."], "The duck lost its sock on the dock!"]
    ], q: [
      ["e", "mc", "🚢", "Ship starts with…", ["sh", "ch", "th"], "Ship starts with sh.", "Ship starts with which two letters? s h, c h, or t h?"],
      ["e", "mc", "🧀", "Cheese starts with…", ["ch", "sh", "th"], "Cheese starts with ch.", "Cheese starts with which two letters? c h, s h, or t h?"],
      ["e", "tf", "👍", "Thumb starts with th.", true, "Thumb starts with t h."],
      ["e", "mc", "🦆", "Duck ends with…", ["ck", "sh", "ch"], "Duck ends with c k.", "Duck ends with which two letters? c k, s h, or c h?"],
      ["m", "mc", "🐟", "Which word has sh?", ["Fish", "Fit", "Fan"], "Fish ends with sh."],
      ["m", "mc", "🍫", "Which word has ch?", ["Lunch", "Lamp", "Lip"], "Lunch ends with ch."],
      ["m", "match", "🔤", "Match the sound to a word.", [["sh", "Shell"], ["ch", "Chair"], ["th", "Three"]], "Each word starts with those two letters."],
      ["m", "tf", "🧦", "Sock ends with sh.", false, "Sock ends with c k."]
    ] },
  5: { learn: [
      ["Story parts", "📖", ["Characters: who is in the story.", "Setting: where and when it happens.", "Events: what happens."], "In the story, a bear (character) went to the woods (setting) to find honey (event)."],
      ["Retell in order", "🔢", ["First, next, then, last.", "Tell the story in order."], "First the hen found seeds. Next she planted them. Last, she baked bread!"]
    ], q: [
      ["e", "mc", "🐻", "A bear goes to the woods. Who is the character?", ["The bear", "The woods", "The honey"], "The bear is the character."],
      ["e", "mc", "🏖️", "Kim played at the beach. Where is the setting?", ["The beach", "Kim", "Play"], "The setting is the beach."],
      ["e", "tf", "📖", "Characters are the people or animals in a story.", true, "Characters are who the story is about."],
      ["e", "mc", "🔢", "Which word tells what happens at the end?", ["Last", "First", "Next"], "Last tells the end."],
      ["m", "mc", "🐔", "The hen planted seeds, then baked bread. What came first?", ["Planting seeds", "Baking bread", "Eating bread"], "She planted seeds first."],
      ["m", "mc", "🌙", "The story happens at night in a castle. That is the…", ["Setting", "Character", "Title"], "Where and when is the setting.", "The story happens at night in a castle. Is that the setting or a character?"],
      ["m", "tf", "🔢", "Retelling means telling a story in order.", true, "We tell what happened first, next and last."],
      ["m", "c2", "🦊", "A fox and a hen meet. Which two are characters?", ["The fox", "The hen"], ["The farm", "The barn"], "The fox and the hen are characters."]
    ] },
  6: { learn: [
      ["Fact books", "🔍", ["Fact books teach true things.", "They have photos and labels."], "Ava read a fact book about frogs. She learned frogs start as tadpoles!"],
      ["Ask and answer", "❓", ["Ask: what, where, why, how.", "Find answers in the book."], "Ben asked: what do frogs eat? The book said: bugs!"]
    ], q: [
      ["e", "tf", "🔍", "Fact books tell true things.", true, "Fact books teach real facts."],
      ["e", "mc", "🐸", "A book about real frogs is a…", ["Fact book", "Fairy tale", "Joke book"], "It teaches facts about frogs.", "A book about real frogs is what kind of book?"],
      ["e", "mc", "🏷️", "A label on a picture tells…", ["What a part is called", "A joke", "The page number"], "Labels name parts of a picture.", "What does a label on a picture tell you?"],
      ["e", "mc", "❓", "Which word starts a question?", ["What", "Dog", "Red"], "What is a question word."],
      ["m", "mc", "🦈", "A book called All About Sharks is mostly about…", ["Sharks", "Cats", "Cars"], "The title tells the topic.", "A book called All About Sharks is mostly about what?"],
      ["m", "tf", "🐉", "A story about a talking dragon is a fact book.", false, "Dragons are pretend, so it is a story."],
      ["m", "c2", "❓", "Which two are question words?", ["Where", "Why"], ["Blue", "Jump"], "Where and why ask questions."],
      ["m", "mc", "📷", "Fact books often use…", ["Real photos", "Magic spells", "Talking toys"], "Real photos show real things.", "What do fact books often use?"]
    ] },
  7: { learn: [
      ["Neat letters", "🖍️", ["Start letters at the top.", "Small letters sit on the line."], "Quill wrote a, b, c. Each letter sat nicely on the line."],
      ["Write the sounds", "✏️", ["Say the word slowly.", "Write a letter for each sound.", "c, a, t: cat."], "Ben said sun slowly. s, u, n. He wrote s, u, n!"]
    ], q: [
      ["e", "tf", "✏️", "Most letters start at the top.", true, "We start most letters at the top."],
      ["e", "mc", "☀️", "Which letters spell sun?", ["s, u, n", "s, a, n", "z, u, n"], "Sun is s, u, n."],
      ["e", "mc", "🐱", "Which letters spell cat?", ["c, a, t", "k, i, t", "c, u, t"], "Cat is c, a, t."],
      ["e", "mc", "🖍️", "Small letters sit…", ["On the line", "In the sky", "Upside down"], "Letters sit on the line.", "Where do small letters sit?"],
      ["m", "mc", "🐶", "Which letters spell dog?", ["d, o, g", "b, o, g", "d, a, g"], "Dog is d, o, g."],
      ["m", "mc", "🛏️", "Bed has how many sounds to write?", ["3", "2", "5"], "b, e, d: three sounds."],
      ["m", "tf", "🐷", "Pig is spelled p, e, g.", false, "Pig is p, i, g."],
      ["m", "mc", "🗺️", "Which letter is missing? m _ p (map)", ["a", "o", "i"], "Map is m, a, p.", "Which letter is missing from map? m, blank, p."]
    ] },
  8: { learn: [
      ["A sentence", "✏️", ["A sentence tells a whole idea.", "It starts with a capital letter.", "It ends with a full stop."], "Ava wrote: The dog ran. Capital T at the start. A dot at the end!"],
      ["Spaces", "⬜", ["Leave a space between words.", "Then words are easy to read."], "Ben put a finger space between each word. Now everyone could read it!"]
    ], q: [
      ["e", "tf", "🔠", "A sentence starts with a capital letter.", true, "Capital letters start sentences."],
      ["e", "mc", "⚫", "A sentence ends with a…", ["Full stop", "Capital letter", "Space"], "A full stop ends it.", "What does a sentence end with?"],
      ["e", "mc", "✏️", "Which is a sentence?", ["The cat sat.", "cat the", "sat."], "The cat sat. is a whole idea."],
      ["e", "mc", "⬜", "What goes between words?", ["A space", "A full stop", "A number"], "Spaces keep words apart."],
      ["m", "mc", "✏️", "Which is written correctly?", ["I like jam.", "i like jam", "I likejam."], "Capital I, spaces, and a full stop."],
      ["m", "tf", "🔤", "This is written correctly: the sun is hot.", false, "The should start with a capital T.", "This is written correctly: the sun is hot, with a small t."],
      ["m", "c2", "✏️", "Which two are sentences?", ["We can run.", "A bird sings."], ["big red", "run the"], "They each tell a whole idea."],
      ["m", "mc", "🐸", "The frog ___. Which word makes a sentence?", ["jumps", "green", "the"], "The frog jumps.", "The frog blank. Which word makes a sentence?"]
    ] }
});
