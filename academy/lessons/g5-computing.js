/* Academy lessons: Grade 5 Computing (js/syllabus.js g5.computing). Format: academy/js/lessons.js. */
AcademyLessons.add("g5-computing", {
  1: { learn: [
      ["Game design", "🎮", ["Plan: goal, rules, controls.", "Use variables (score), conditions (if) and loops (forever).", "Test with friends and improve."], "Bit's game: catch falling apples; if caught, score + 1; forever repeat."],
      ["Iterate", "🔁", ["Build a small version first.", "Test, get feedback, improve.", "Repeat."], "Ava's first version was too hard. She slowed the apples down."]
    ], q: [
      ["e", "mc", "🎮", "Which keeps track of points in a game?", ["A variable", "A sound", "A background"], "Score is stored in a variable."],
      ["e", "tf", "🔁", "Testing and improving a game in rounds is called iterating.", true, "Build, test, improve, repeat."],
      ["e", "mc", "♾️", "To keep a game running, use a…", ["Forever loop", "Stop block", "Delete block"], "Forever repeats continuously.", "To keep a game running, which loop do you use?"],
      ["m", "mc", "🍎", "If apple touches basket then…", ["Change score by 1", "End the universe", "Delete the basket"], "Catching scores a point.", "If the apple touches the basket, what should happen?"],
      ["m", "tf", "🎯", "You should build the whole game before testing anything.", false, "Test small pieces as you go."],
      ["m", "c2", "🎮", "Which two make a game fair and fun?", ["Clear rules", "Feedback from testers"], ["Hidden rules", "Never testing"], "Clarity and testing help."]
    ] },
  2: { learn: [
      ["Searching", "🔍", ["Linear search checks one by one.", "Binary search halves a sorted list each time.", "Binary is faster for big sorted lists."], "Ben guessed a number 1–100 by halving: 50, 25, 37… found it in 7 guesses!"],
      ["Sorting", "📶", ["Sorting puts items in order.", "Bubble sort swaps neighbours until sorted."], "Ava sorted cards by swapping pairs until they were smallest to largest."]
    ], q: [
      ["e", "mc", "🔍", "Checking items one at a time is a…", ["Linear search", "Binary search", "Bubble wrap"], "Linear goes in a line.", "What is checking items one at a time called?"],
      ["e", "tf", "📶", "Sorting puts items in order.", true, "Like smallest to largest."],
      ["e", "mc", "🔍", "Binary search needs the list to be…", ["Sorted", "Shuffled", "Empty"], "Halving only works on sorted lists.", "What must the list be for binary search?"],
      ["m", "mc", "🔢", "Guess 1–100 by halving. First guess?", ["50", "1", "100"], "Start in the middle."],
      ["m", "tf", "🐢", "Linear search is always faster than binary search on big sorted lists.", false, "Binary search is faster on big sorted lists."],
      ["m", "mc", "🫧", "Bubble sort works by…", ["Swapping neighbours that are out of order", "Deleting items", "Guessing"], "Repeated swaps sort the list.", "How does bubble sort work?"]
    ] },
  3: { learn: [
      ["Collect data", "📋", ["Plan a question.", "Use a survey or sensor.", "Record data neatly."], "The class surveyed 30 pupils on how they travel to school."],
      ["Analyse", "📈", ["Chart the data.", "Look for patterns.", "Draw conclusions with evidence."], "Most walked; few came by car. They suggested a walking bus."]
    ], q: [
      ["e", "mc", "📋", "A set of questions to collect data is a…", ["Survey", "Song", "Story"], "Surveys gather data.", "What is a set of questions to collect data called?"],
      ["e", "tf", "📈", "Charts help us see patterns in data.", true, "Visuals reveal trends."],
      ["e", "mc", "🚶", "Walk: 18, car: 5, bike: 7. Most common?", ["Walk", "Car", "Bike"], "18 is the most."],
      ["m", "mc", "🔢", "Walk: 18, car: 5, bike: 7. Total surveyed?", ["30", "25", "18"], "18 + 5 + 7 = 30."],
      ["m", "tf", "🎯", "A conclusion should be supported by the data.", true, "Evidence backs conclusions."],
      ["m", "c2", "📋", "Which two make a survey more reliable?", ["Asking many people", "Clear questions"], ["Asking only one friend", "Confusing questions"], "Size and clarity matter."]
    ] },
  4: { learn: [
      ["What AI is", "🤖", ["AI is software that learns patterns from examples.", "It can recognise pictures, voices and text.", "It does not think like a person."], "Bit was shown 1,000 cat photos. Then it could spot new cats!"],
      ["AI can be wrong", "⚠️", ["AI learns from data, so bad data gives bad results.", "It can be unfair or make things up.", "Always check important answers."], "An AI said a dog was a muffin! Ava laughed and checked again."]
    ], q: [
      ["e", "mc", "🤖", "AI learns by…", ["Finding patterns in examples", "Reading minds", "Magic"], "AI is trained on data.", "How does AI learn?"],
      ["e", "tf", "⚠️", "AI can make mistakes.", true, "Always check important answers."],
      ["e", "mc", "🗣️", "A voice assistant understanding you uses…", ["AI", "A calculator only", "A paper map"], "Speech recognition is AI."],
      ["m", "mc", "📊", "If an AI is trained on unfair data, it may…", ["Give unfair results", "Become perfect", "Stop working forever"], "Data shapes AI behaviour."],
      ["m", "tf", "🧠", "AI thinks and feels exactly like a human.", false, "It finds patterns; it does not feel."],
      ["m", "c2", "🤖", "Which two are smart ways to use AI?", ["Checking its answers with other sources", "Knowing it can be wrong"], ["Trusting everything it says", "Sharing private data freely"], "Use AI carefully."]
    ] },
  5: { learn: [
      ["Misinformation", "🧐", ["False information can spread fast online.", "Photos and videos can be edited or faked.", "Check before sharing."], "A viral post showed a shark on a flooded road. It was fake!"],
      ["Privacy settings", "🔐", ["Set accounts to private.", "Share less personal information.", "Review app permissions."], "Ben turned off location sharing on his game."]
    ], q: [
      ["e", "tf", "🧐", "Photos online can be edited or faked.", true, "Check before believing."],
      ["e", "mc", "🔐", "A private account means…", ["Only approved people see your posts", "Everyone sees everything", "No password needed"], "Private limits who sees.", "What does a private account mean?"],
      ["e", "mc", "📍", "To protect privacy, you can turn off…", ["Location sharing", "Your brain", "The Moon"], "Location reveals where you are.", "To protect privacy, what can you turn off?"],
      ["m", "mc", "🦈", "A shocking photo is going viral. Before sharing, you…", ["Check if trusted sources report it", "Share instantly", "Add more drama"], "Verify first."],
      ["m", "tf", "📱", "Apps should get every permission they ask for.", false, "Only allow what's needed."],
      ["m", "c2", "🔐", "Which two protect your privacy?", ["Strong passwords", "Private account settings"], ["Posting your address", "Sharing passwords"], "Lock down your info."]
    ] }
});
