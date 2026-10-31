/* Academy lessons: Grade 1 Social Studies (js/syllabus.js g1.social). Format: academy/js/lessons.js. Read aloud by default. */
AcademyLessons.add("g1-social", {
  1: { learn: [
      ["City, town, countryside", "🏙️", ["A city has many people and tall buildings.", "A town is smaller.", "The countryside has farms and fields."], "Marco visited the city: busy streets! Then the countryside: quiet fields and cows."],
      ["Places in a community", "🏘️", ["Schools, shops, parks, libraries.", "Each place meets a need."], "Ava's town has a library, a clinic and a big park."]
    ], q: [
      ["e", "mc", "🏙️", "Where are there tall buildings and busy streets?", ["A city", "A farm", "A forest"], "Cities are big and busy."],
      ["e", "mc", "🐄", "Where would you find farms and fields?", ["The countryside", "A city centre", "A mall"], "Farms are in the countryside."],
      ["e", "tf", "🏫", "A school is a place in a community.", true, "Schools serve the community."],
      ["e", "mc", "🏥", "Where do people go when they are sick?", ["A clinic or hospital", "A park", "A shop"], "Clinics help sick people."],
      ["m", "mc", "🏘️", "A town is usually…", ["Smaller than a city", "Bigger than a city", "Under the sea"], "Towns are smaller than cities.", "Is a town usually smaller or bigger than a city?"],
      ["m", "match", "🏛️", "Match the place to its use.", [["Library", "Borrow books"], ["Park", "Play outside"], ["Bank", "Keep money safe"]], "Places meet different needs."],
      ["m", "tf", "🚜", "Cities have more farms than the countryside.", false, "The countryside has more farms."],
      ["m", "c2", "🏙️", "Which two are found in most cities?", ["Buses", "Tall buildings"], ["Wild bears", "Wheat fields"], "Cities have buses and tall buildings."]
    ] },
  2: { learn: [
      ["Map keys", "🗝️", ["A key explains the map's symbols.", "A tree picture might mean a park."], "On Ava's map, a blue line meant a river. The key told her!"],
      ["Directions", "🧭", ["North, south, east, west.", "A compass shows directions.", "North is usually at the top of a map."], "Marco walked north to the lake, then east to the hill."]
    ], q: [
      ["e", "mc", "🗝️", "A map key tells you…", ["What the symbols mean", "The time", "The weather"], "The key explains symbols.", "What does a map key tell you?"],
      ["e", "mc", "🧭", "Which tool shows directions?", ["A compass", "A spoon", "A ruler"], "A compass points north."],
      ["e", "tf", "⬆️", "North is usually at the top of a map.", true, "Most maps put north at the top."],
      ["e", "mc", "🌅", "The opposite of north is…", ["South", "East", "West"], "North and south are opposites.", "What is the opposite of north?"],
      ["m", "mc", "🌊", "On a map, a blue line often shows a…", ["River", "Road", "School"], "Blue usually means water.", "On a map, what does a blue line often show?"],
      ["m", "mc", "🧭", "The opposite of east is…", ["West", "North", "South"], "East and west are opposites.", "What is the opposite of east?"],
      ["m", "tf", "🗺️", "Every map uses the same symbols.", false, "Symbols change, so check the key."],
      ["m", "match", "🗝️", "Match the symbol to its meaning.", [["🌳", "Park"], ["🏫", "School"], ["⛪", "Place of worship"]], "A key matches symbols to places.", "Match the symbol to its meaning: a tree, a school building, a place of worship."]
    ] },
  3: { learn: [
      ["Seven continents", "🌍", ["Africa, Antarctica, Asia, Australia.", "Europe, North America, South America."], "Marco the penguin lives in Antarctica, the coldest continent!"],
      ["Five oceans", "🌊", ["Pacific, Atlantic, Indian.", "Southern and Arctic.", "The Pacific is the biggest."], "A whale swam across the huge Pacific Ocean."]
    ], q: [
      ["e", "mc", "🌍", "How many continents are there?", ["7", "5", "10"], "There are 7 continents."],
      ["e", "mc", "🌊", "How many oceans are there?", ["5", "7", "2"], "There are 5 oceans."],
      ["e", "tf", "🐧", "Antarctica is a very cold continent.", true, "It is covered in ice."],
      ["e", "mc", "🌊", "Which is the biggest ocean?", ["Pacific", "Arctic", "Indian"], "The Pacific is the largest."],
      ["m", "c2", "🌍", "Which two are continents?", ["Africa", "Asia"], ["Pacific", "Atlantic"], "Pacific and Atlantic are oceans."],
      ["m", "mc", "🦘", "Kangaroos live wild on which continent?", ["Australia", "Europe", "Antarctica"], "Kangaroos live in Australia."],
      ["m", "tf", "🌊", "The Atlantic is a continent.", false, "The Atlantic is an ocean."],
      ["m", "mc", "🐘", "India is on which continent?", ["Asia", "Africa", "Europe"], "India is in Asia."]
    ] },
  4: { learn: [
      ["Timelines", "⏳", ["A timeline shows events in order.", "Past, present, future."], "Ben made a timeline: born, first steps, started school, today!"],
      ["Then and now", "📺", ["Old phones had cords.", "Toys and schools change over time."], "Grandpa's school had chalk boards. Ben's has screens."]
    ], q: [
      ["e", "mc", "⏳", "A timeline shows events in…", ["Order", "Colour", "Size"], "Timelines show order.", "What does a timeline show events in?"],
      ["e", "tf", "📞", "Phones long ago often had cords.", true, "Old phones plugged into the wall."],
      ["e", "mc", "🕰️", "Yesterday is in the…", ["Past", "Future", "Present"], "Yesterday has already happened.", "Is yesterday in the past or the future?"],
      ["e", "mc", "🔮", "Tomorrow is in the…", ["Future", "Past", "Present"], "Tomorrow has not happened yet.", "Is tomorrow in the past or the future?"],
      ["m", "mc", "👶", "Which comes first on a life timeline?", ["Being born", "Starting school", "Turning 6"], "Being born is first."],
      ["m", "match", "🕰️", "Match then and now.", [["Chalk board", "Screen"], ["Letter", "Email"], ["Wooden toys", "Video games"]], "Each pair shows change over time."],
      ["m", "tf", "🏫", "Schools have never changed.", false, "Schools change over time."],
      ["m", "mc", "📸", "How can we learn about the past?", ["Old photos and stories", "Guessing only", "Tomorrow's news"], "Photos and stories tell us about the past."]
    ] },
  5: { learn: [
      ["Voting", "🗳️", ["Voting lets everyone choose.", "The choice with the most votes wins."], "Ava's class voted on a class pet. Fish got 12 votes. Hamster got 8. Fish won!"],
      ["Being fair", "⚖️", ["Every vote counts the same.", "We accept the result kindly."], "Ben wanted the hamster, but he said: okay, fish it is!"]
    ], q: [
      ["e", "tf", "🗳️", "Voting lets everyone have a say.", true, "Everyone gets one vote."],
      ["e", "mc", "🗳️", "Fish: 12 votes. Hamster: 8 votes. Which wins?", ["Fish", "Hamster", "A tie"], "12 is more than 8."],
      ["e", "mc", "✋", "In a class vote, each person gets…", ["One vote", "Ten votes", "No votes"], "Fair voting means one vote each.", "In a class vote, how many votes does each person get?"],
      ["e", "mc", "🙂", "Your choice did not win. You should…", ["Accept it kindly", "Shout", "Quit"], "Good citizens accept the result."],
      ["m", "mc", "⚖️", "Red: 9. Blue: 9. What is the result?", ["A tie", "Red wins", "Blue wins"], "Equal votes make a tie."],
      ["m", "tf", "👑", "In a fair vote, the oldest child chooses for everyone.", false, "Everyone's vote counts the same."],
      ["m", "c2", "🗳️", "Which two are fair ways to choose?", ["Vote", "Take turns choosing"], ["Grab it first", "The loudest wins"], "Voting and turns are fair."],
      ["m", "mc", "🏛️", "Grown-ups vote to choose…", ["Leaders", "Their shoes", "The weather"], "Adults vote for leaders.", "What do grown-ups vote to choose?"]
    ] },
  6: { learn: [
      ["Goods and services", "🏪", ["Goods: things you can hold, like bread.", "Services: work done for you, like a haircut."], "Marco bought bread (goods) and got his bike fixed (a service)."],
      ["Saving", "🐷", ["Saving means keeping money for later.", "Save up for something special."], "Ava saved a coin every week. Soon she bought a kite!"]
    ], q: [
      ["e", "mc", "🍞", "Bread is…", ["Goods", "A service", "A job"], "You can hold bread, so it is goods.", "Is bread goods or a service?"],
      ["e", "mc", "💇", "A haircut is a…", ["Service", "Goods", "Toy"], "Someone does work for you.", "Is a haircut goods or a service?"],
      ["e", "tf", "🐷", "Saving means keeping money for later.", true, "We save to buy things later."],
      ["e", "mc", "🪙", "Where can you keep saved coins?", ["A piggy bank", "A rubbish bin", "A puddle"], "A piggy bank keeps coins safe."],
      ["m", "c2", "🛍️", "Which two are goods?", ["A toy car", "A banana"], ["A doctor's check-up", "A bus ride"], "Goods are things you can hold."],
      ["m", "mc", "🚌", "A bus driver gives a…", ["Service", "Goods", "Gift"], "Driving people is a service.", "Does a bus driver give goods or a service?"],
      ["m", "tf", "🎁", "If you spend all your money, you are saving.", false, "Saving means keeping some money."],
      ["m", "mc", "🪁", "A kite costs 5 coins. You save 1 coin a week. How many weeks?", ["5", "1", "10"], "1 coin each week for 5 weeks."]
    ] },
  7: { learn: [
      ["Celebrations around the world", "🎊", ["Diwali is a festival of lights.", "Lunar New Year has dragons and red lanterns.", "Eid ends with a big celebration."], "Marco's friends shared Diwali lamps, New Year dumplings and Eid sweets."],
      ["Respect", "🤝", ["People believe different things.", "We can learn and be kind."], "Ben asked Ava about her holiday and listened carefully."]
    ], q: [
      ["e", "mc", "🪔", "Which festival is known as a festival of lights?", ["Diwali", "Halloween", "Easter"], "Diwali celebrates light."],
      ["e", "tf", "🏮", "Lunar New Year often has red lanterns.", true, "Red is a lucky colour for many families."],
      ["e", "mc", "🤝", "When friends celebrate differently, we…", ["Show respect", "Make fun", "Ignore them"], "Respect is kind."],
      ["e", "mc", "🌍", "People around the world celebrate…", ["In many different ways", "Only one holiday", "Never"], "Celebrations are many and varied."],
      ["m", "mc", "🌙", "Eid is celebrated by many…", ["Muslims", "Penguins", "Robots"], "Eid is a Muslim celebration.", "Eid is celebrated by many people of which faith?"],
      ["m", "tf", "🎉", "Everyone in the world celebrates the same holidays.", false, "Holidays differ around the world."],
      ["m", "c2", "🎊", "Which two are kind ways to learn about a holiday?", ["Ask questions", "Listen carefully"], ["Laugh at it", "Say it is wrong"], "Asking and listening show respect."],
      ["m", "mc", "🐉", "Dragon dances are part of…", ["Lunar New Year", "Bedtime", "Sports day"], "Dragon dances bring luck at New Year.", "Dragon dances are part of which celebration?"]
    ] }
});
