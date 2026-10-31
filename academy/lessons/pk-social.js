/* Academy lessons: Pre-K Social Studies (js/syllabus.js pk.social). Format: academy/js/lessons.js. Read aloud: short sentences. */
AcademyLessons.add("pk-social", {
  1: { learn: [
      ["My family", "👪", ["A family cares for each other.", "Families can be big or small."], "Marco lives with his mum and grandma. Ava lives with her two dads and a baby."],
      ["About me", "🙋", ["I have a name.", "I can say how old I am."], "Ben said, my name is Ben and I am four!"]
    ], q: [
      ["e", "tf", "👪", "Families can be big or small.", true, "Every family is different."],
      ["e", "mc", "💛", "What does a family do?", ["Cares for each other", "Flies planes", "Fixes roads"], "Families care for each other."],
      ["e", "mc", "👵", "Your mum's mum is your…", ["Grandma", "Sister", "Baby"], "Your mum's mum is your grandma.", "What do we call your mum's mum?"],
      ["m", "tf", "🏡", "All families look the same.", false, "Families look different, and that is okay."],
      ["m", "mc", "🎂", "What do we celebrate each year on our birthday?", ["Getting a year older", "Bedtime", "Rain"], "A birthday means we are a year older."],
      ["m", "mc", "🤗", "Your sister and brother are your…", ["Siblings", "Teachers", "Neighbours"], "Brothers and sisters are siblings.", "Your sister and brother are your what?"]
    ] },
  2: { learn: [
      ["Places near home", "🏘️", ["A shop sells things.", "A park is for playing.", "A library has books."], "Marco walked past the shop, the park and the library."],
      ["A map", "🗺️", ["A map is a picture from above.", "It shows where things are."], "Ava drew her room from above. Bed here, toys there!"]
    ], q: [
      ["e", "mc", "📚", "Where can you borrow books?", ["A library", "A pool", "A farm"], "A library lends books."],
      ["e", "mc", "🛝", "Where do you go to play on swings?", ["A park", "A bank", "A shop"], "Parks have swings."],
      ["e", "tf", "🗺️", "A map shows where things are.", true, "Maps help us find places."],
      ["m", "mc", "🦅", "A map shows a place as seen from…", ["Above", "Under the ground", "Inside a box"], "A map is like a bird's view from above.", "A map shows a place as seen from where?"],
      ["m", "mc", "🍞", "Where do you buy bread?", ["A shop", "A library", "A park"], "Shops sell food like bread."],
      ["m", "tf", "🏥", "A hospital is a place to buy toys.", false, "A hospital helps sick people."]
    ] },
  3: { learn: [
      ["Helpers", "🚒", ["Firefighters put out fires.", "Doctors help sick people.", "Teachers help us learn."], "When Ben hurt his arm, the doctor helped it get better."],
      ["More helpers", "👮", ["Police officers keep us safe.", "Farmers grow our food."], "The farmer grew carrots. The truck took them to the shop."]
    ], q: [
      ["e", "mc", "🔥", "Who puts out fires?", ["Firefighter", "Baker", "Pilot"], "Firefighters put out fires."],
      ["e", "mc", "🤒", "Who helps when you are sick?", ["Doctor", "Painter", "Farmer"], "Doctors help sick people."],
      ["e", "tf", "🍎", "Farmers grow food.", true, "Farmers grow fruit and vegetables."],
      ["m", "match", "🧑‍🚒", "Match the helper to the job.", [["Teacher", "Helps us learn"], ["Police officer", "Keeps us safe"], ["Vet", "Helps animals"]], "Every helper has a job."],
      ["m", "mc", "✉️", "Who brings letters to your home?", ["Mail carrier", "Dentist", "Chef"], "A mail carrier brings letters."],
      ["m", "mc", "🦷", "Who looks after your teeth?", ["Dentist", "Pilot", "Farmer"], "A dentist checks teeth."]
    ] },
  4: { learn: [
      ["Rules help us", "📏", ["Rules keep us safe and fair.", "We walk inside.", "We use kind hands."], "In Ava's class the rule is: kind hands. Nobody gets hurt."],
      ["Taking turns", "🔄", ["Taking turns is fair.", "Everyone gets a go."], "Ben had the red truck. Then Marco had a turn. Fair!"]
    ], q: [
      ["e", "tf", "📏", "Rules help keep us safe.", true, "Rules keep everyone safe."],
      ["e", "mc", "🏫", "Inside the classroom we…", ["Walk", "Run fast", "Shout"], "We walk inside to stay safe.", "Inside the classroom, do we walk or run?"],
      ["e", "mc", "🛝", "Two kids want the slide. What is fair?", ["Take turns", "Push", "Cry"], "Taking turns is fair."],
      ["m", "tf", "✋", "Kind hands means we never hit.", true, "Kind hands help, not hurt."],
      ["m", "mc", "🧱", "A friend is using the blocks. You should…", ["Wait or ask to share", "Grab them", "Hide them"], "We ask nicely or wait."],
      ["m", "tf", "🔄", "Only one child should ever get a turn.", false, "Everyone gets a turn."]
    ] },
  5: { learn: [
      ["Celebrations", "🎉", ["People celebrate special days.", "Birthdays, weddings and holidays."], "Ava's family lit candles for a holiday. Ben's family had a big dinner."],
      ["Different ways", "🪔", ["Families celebrate in different ways.", "We can learn about each other."], "Marco shared a festival with lights. Everyone tried his yummy sweets."]
    ], q: [
      ["e", "mc", "🎂", "What do many people have on a birthday?", ["A cake", "A tractor", "Homework"], "Birthday cakes are a fun tradition."],
      ["e", "tf", "🎉", "People celebrate special days.", true, "Celebrations mark special days."],
      ["e", "mc", "🎁", "At a party, you might get…", ["A present", "A broom", "A test"], "Presents are often given at parties.", "At a party, what might you get?"],
      ["m", "tf", "🌍", "Every family celebrates in the same way.", false, "Families celebrate in many different ways."],
      ["m", "mc", "🙂", "A friend shares a new holiday. You should…", ["Listen and be kind", "Laugh at it", "Walk away"], "Learning about others is kind."],
      ["m", "mc", "🎶", "Celebrations often have music and…", ["Food", "Homework", "Tests"], "Food and music are part of many celebrations.", "Celebrations often have music and what?"]
    ] }
});
