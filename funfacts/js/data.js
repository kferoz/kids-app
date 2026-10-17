/* ============================================================
   Fun Facts Explorer — Data
   Kid-friendly, verified fun facts + quizzes by category.
   Each category has:  id, name, emoji, color, facts[], quiz[]
   A fact = { emoji, teaser, fact }
   A quiz question = { q, options[], answer (index) }
   ============================================================ */

const CATEGORIES = [
  {
    id: "animals",
    name: "Animals",
    emoji: "🐘",
    color: "#ffb84d",
    facts: [
      { emoji: "🐘", teaser: "How well do elephants remember?", fact: "Elephants have amazing memories! They can remember friends and places for many years, even after being apart for a long time." },
      { emoji: "🐙", teaser: "How many hearts does an octopus have?", fact: "An octopus has THREE hearts! Two pump blood to the gills, and one pumps it to the rest of the body." },
      { emoji: "🦒", teaser: "Does a giraffe have more neck bones than you?", fact: "A giraffe's neck is super long, but it has the SAME number of neck bones as you — just seven! Each one is very big." },
      { emoji: "🐨", teaser: "How much do koalas sleep?", fact: "Koalas sleep up to 20 hours a day! Their leafy food gives them very little energy, so they rest a lot." },
      { emoji: "🦇", teaser: "Are bats blind?", fact: "Bats are NOT blind. They can see, but they also use sound to 'echolocate' and fly in the dark without bumping into things." },
      { emoji: "🐝", teaser: "How do bees talk to each other?", fact: "Bees do a 'waggle dance'! By dancing in special patterns, they tell other bees where to find the best flowers." },
      { emoji: "🦎", teaser: "Can a gecko walk on the ceiling?", fact: "Geckos can walk upside down on ceilings! Their toes have millions of tiny hairs that grip almost any surface." },
      { emoji: "🐧", teaser: "Do penguins have knees?", fact: "Penguins really do have knees! They are hidden inside their bodies under a layer of feathers and fat." },
      { emoji: "🐬", teaser: "Do dolphins sleep?", fact: "Dolphins sleep with only HALF their brain at a time. The other half stays awake so they remember to come up for air!" },
      { emoji: "🐜", teaser: "How strong is an ant?", fact: "Ants are super strong! An ant can carry objects 50 times its own body weight — like you lifting a car!" }
    ],
    quiz: [
      { q: "How many hearts does an octopus have?", options: ["One", "Two", "Three", "Five"], answer: 2 },
      { q: "How many bones are in a giraffe's neck?", options: ["Seven", "Twenty", "Fifty", "One hundred"], answer: 0 },
      { q: "How do bees tell each other where flowers are?", options: ["They sing", "They do a waggle dance", "They roar", "They text"], answer: 1 },
      { q: "About how many hours a day do koalas sleep?", options: ["2 hours", "8 hours", "20 hours", "24 hours"], answer: 2 },
      { q: "How do dolphins sleep safely?", options: ["Half the brain sleeps at a time", "On land", "In caves", "They never sleep"], answer: 0 }
    ]
  },
  {
    id: "plants",
    name: "Plants",
    emoji: "🌻",
    color: "#7ed957",
    facts: [
      { emoji: "🌻", teaser: "Do sunflowers follow the sun?", fact: "Young sunflowers turn to face the sun as it moves across the sky — from east in the morning to west in the evening!" },
      { emoji: "🌳", teaser: "What is the tallest tree?", fact: "The tallest trees are redwoods in California. Some are taller than a 30-floor building — over 100 meters high!" },
      { emoji: "🌵", teaser: "How do cactuses survive the desert?", fact: "A cactus stores water inside its thick stem, and its spines are actually leaves that lose almost no water." },
      { emoji: "🍄", teaser: "Is a mushroom a plant?", fact: "A mushroom is NOT a plant — it's a fungus! Fungi are their own special group, different from plants and animals." },
      { emoji: "🌱", teaser: "What do plants breathe out?", fact: "Plants breathe in the gas we breathe out (carbon dioxide) and give off oxygen — the air we need to live!" },
      { emoji: "🪷", teaser: "Which flower can be huge?", fact: "The giant water lily has leaves so big and strong that a small child could sit on one without sinking!" },
      { emoji: "🌾", teaser: "Can a plant eat bugs?", fact: "Yes! The Venus flytrap snaps its leaves shut to catch and eat insects for extra food." },
      { emoji: "🎋", teaser: "What is the fastest-growing plant?", fact: "Bamboo can grow almost a meter in a single day — you could almost watch it grow!" },
      { emoji: "🌰", teaser: "How does a tree drink water?", fact: "Trees drink through their roots, then pull water all the way up to the top leaves like sipping through a straw." },
      { emoji: "🍁", teaser: "Why do leaves change color?", fact: "In autumn, leaves stop making green 'chlorophyll,' so hidden yellow, orange, and red colors show through!" }
    ],
    quiz: [
      { q: "A mushroom is actually a...", options: ["Plant", "Animal", "Fungus", "Rock"], answer: 2 },
      { q: "What gas do plants give off that we need to breathe?", options: ["Oxygen", "Helium", "Smoke", "Steam"], answer: 0 },
      { q: "Which plant can catch and eat insects?", options: ["Sunflower", "Venus flytrap", "Cactus", "Bamboo"], answer: 1 },
      { q: "What is the fastest-growing plant?", options: ["Oak tree", "Bamboo", "Rose", "Grass"], answer: 1 },
      { q: "Why do leaves turn red and orange in autumn?", options: ["They get painted", "Green chlorophyll fades away", "They get cold", "They get wet"], answer: 1 }
    ]
  },
  {
    id: "universe",
    name: "Universe",
    emoji: "🪐",
    color: "#8a7dff",
    facts: [
      { emoji: "☀️", teaser: "How big is the Sun?", fact: "The Sun is SO big that about one million Earths could fit inside it! It's really a giant ball of glowing gas." },
      { emoji: "🌕", teaser: "Are there footprints on the Moon?", fact: "The footprints astronauts left on the Moon will stay for millions of years — there's no wind up there to blow them away!" },
      { emoji: "🪐", teaser: "Could Saturn float?", fact: "Saturn is so light for its size that if you had a bathtub big enough, the whole planet would FLOAT on water!" },
      { emoji: "⭐", teaser: "How old is starlight?", fact: "When you look at a star, you see light that left it long ago. Some starlight is older than the dinosaurs!" },
      { emoji: "🔴", teaser: "Why is Mars red?", fact: "Mars looks red because its soil is full of rusty iron — it's basically a giant rusty planet!" },
      { emoji: "🌍", teaser: "How fast is Earth moving?", fact: "Even when you sit still, Earth is zooming around the Sun at about 30 kilometers every second!" },
      { emoji: "☄️", teaser: "What is a shooting star?", fact: "A 'shooting star' isn't a star at all — it's a tiny space rock burning up as it zooms into our air!" },
      { emoji: "🌌", teaser: "How many stars in our galaxy?", fact: "Our Milky Way galaxy has more than 100 BILLION stars — way too many to ever count!" },
      { emoji: "🚀", teaser: "Is there sound in space?", fact: "Space is silent! Sound needs air to travel through, and space is empty, so no one could hear you shout." },
      { emoji: "🌑", teaser: "Why does the Moon change shape?", fact: "The Moon doesn't really change shape — we just see different amounts of its sunlit side as it circles Earth." }
    ],
    quiz: [
      { q: "About how many Earths could fit inside the Sun?", options: ["Ten", "One thousand", "One million", "Two"], answer: 2 },
      { q: "Why does Mars look red?", options: ["It is on fire", "Rusty iron in the soil", "It is made of candy", "Red lights"], answer: 1 },
      { q: "A 'shooting star' is really a...", options: ["Real star", "Space rock burning up", "Airplane", "Firework"], answer: 1 },
      { q: "Why can't you hear sound in space?", options: ["It is too far", "There is no air", "It is too cold", "Everyone is quiet"], answer: 1 },
      { q: "Which planet is so light it could float on water?", options: ["Earth", "Mars", "Saturn", "Jupiter"], answer: 2 }
    ]
  },
  {
    id: "body",
    name: "Human Body",
    emoji: "🦴",
    color: "#ff6f91",
    facts: [
      { emoji: "🦴", teaser: "How many bones do babies have?", fact: "Babies are born with about 300 bones! As they grow, some bones join together, so adults have only 206." },
      { emoji: "🧠", teaser: "How busy is your brain?", fact: "Your brain never rests! It works even while you sleep, sending tiny electric signals faster than a race car." },
      { emoji: "❤️", teaser: "How hard does your heart work?", fact: "Your heart beats about 100,000 times every single day, pumping blood all around your body without a break!" },
      { emoji: "🦷", teaser: "Are teeth bones?", fact: "Teeth are NOT bones! They are the hardest part of your body, even tougher than your bones." },
      { emoji: "👅", teaser: "Is your tongue print special?", fact: "Just like fingerprints, everyone's tongue print is unique — no two are exactly the same!" },
      { emoji: "😮‍💨", teaser: "Why do you sneeze?", fact: "A sneeze is your body's way of blasting out dust or germs — and it can shoot out faster than a car on the highway!" },
      { emoji: "💪", teaser: "What is your strongest muscle?", fact: "For its size, the strongest muscle in your body is your jaw muscle, which helps you chew your food!" },
      { emoji: "👀", teaser: "How fast do you blink?", fact: "You blink about 20 times a minute — that's over 10,000 blinks a day to keep your eyes clean and wet!" },
      { emoji: "🩸", teaser: "How long are your blood vessels?", fact: "If you lined up all your blood vessels, they would stretch about 100,000 kilometers — around Earth twice!" },
      { emoji: "👃", teaser: "How many smells can you know?", fact: "Your nose can tell apart around a TRILLION different smells — it's an amazing super-sniffer!" }
    ],
    quiz: [
      { q: "How many bones does an adult human have?", options: ["100", "206", "300", "500"], answer: 1 },
      { q: "Are your teeth bones?", options: ["Yes", "No, they are even harder", "They are muscles", "They are skin"], answer: 1 },
      { q: "About how many times does your heart beat each day?", options: ["100", "1,000", "100,000", "10"], answer: 2 },
      { q: "How many bones are babies born with?", options: ["206", "About 300", "50", "1,000"], answer: 1 },
      { q: "The strongest muscle for its size is your...", options: ["Leg", "Jaw", "Arm", "Tongue"], answer: 1 }
    ]
  },
  {
    id: "ocean",
    name: "Ocean",
    emoji: "🐠",
    color: "#33c9dc",
    facts: [
      { emoji: "🐋", teaser: "What is the biggest animal ever?", fact: "The blue whale is the largest animal that has EVER lived — even bigger than the biggest dinosaurs!" },
      { emoji: "🌊", teaser: "How much of Earth is ocean?", fact: "Oceans cover more than 70% of our planet, yet we have explored only a tiny part of them!" },
      { emoji: "🐡", teaser: "How does a pufferfish protect itself?", fact: "A pufferfish puffs up like a spiky balloon to scare away animals that want to eat it!" },
      { emoji: "🦈", teaser: "How old are sharks?", fact: "Sharks have been swimming in the oceans for over 400 million years — long before the dinosaurs appeared!" },
      { emoji: "🐙", teaser: "Can an octopus change color?", fact: "An octopus can change its color and skin pattern in less than a second to hide from danger!" },
      { emoji: "✨", teaser: "Can the sea glow?", fact: "Some tiny sea creatures glow in the dark! When waves move them, the ocean can sparkle with blue light at night." },
      { emoji: "🐢", teaser: "How do baby turtles find the sea?", fact: "Baby sea turtles hatch on the beach and use the bright horizon over the ocean to crawl the right way to the water!" },
      { emoji: "🪼", teaser: "Does a jellyfish have a brain?", fact: "A jellyfish has NO brain, no heart, and no bones — and it's mostly made of water!" },
      { emoji: "🐚", teaser: "Why does a seashell sound like the sea?", fact: "When you hold a shell to your ear, you don't hear the sea — you hear the sounds around you echoing inside it!" },
      { emoji: "🏔️", teaser: "How tall are underwater mountains?", fact: "The ocean hides mountains taller than any on land! Some underwater mountains are giant and no one has ever climbed them." }
    ],
    quiz: [
      { q: "What is the largest animal that has ever lived?", options: ["T-Rex", "Blue whale", "Elephant", "Shark"], answer: 1 },
      { q: "About how much of Earth do oceans cover?", options: ["10%", "30%", "More than 70%", "100%"], answer: 2 },
      { q: "A jellyfish has no...", options: ["Water", "Brain", "Color", "Body"], answer: 1 },
      { q: "How does a pufferfish protect itself?", options: ["Runs away", "Puffs up like a balloon", "Turns invisible", "Digs a hole"], answer: 1 },
      { q: "How long have sharks lived in the oceans?", options: ["100 years", "1,000 years", "Over 400 million years", "50 years"], answer: 2 }
    ]
  },
  {
    id: "dinosaurs",
    name: "Dinosaurs",
    emoji: "🦕",
    color: "#c58b4d",
    facts: [
      { emoji: "🦖", teaser: "How big were T-Rex teeth?", fact: "Tyrannosaurus rex had teeth as big as bananas — up to 20 centimeters long — perfect for crunching!" },
      { emoji: "🦕", teaser: "How long was the longest dinosaur?", fact: "Some long-necked dinosaurs were longer than three school buses parked in a row!" },
      { emoji: "🥚", teaser: "How big were dinosaur eggs?", fact: "Even the biggest dinosaurs laid eggs only about the size of a football — babies had a lot of growing to do!" },
      { emoji: "🪶", teaser: "Did some dinosaurs have feathers?", fact: "Many dinosaurs had feathers! Scientists think birds today are actually a kind of living dinosaur." },
      { emoji: "🌿", teaser: "Were all dinosaurs meat-eaters?", fact: "No! Many dinosaurs only ate plants. The plant-eaters were often the biggest dinosaurs of all." },
      { emoji: "🧠", teaser: "How big was a Stegosaurus brain?", fact: "The huge Stegosaurus had a brain only about the size of a walnut, even though its body was as big as a bus!" },
      { emoji: "👣", teaser: "How do we know how they walked?", fact: "Scientists find fossil footprints in old rock that show us how dinosaurs walked and how fast they could run!" },
      { emoji: "🦴", teaser: "What is a fossil?", fact: "A fossil is the rocky shape of a bone, tooth, or plant left in the ground for millions of years for us to find." },
      { emoji: "☄️", teaser: "Why did dinosaurs disappear?", fact: "Most scientists think a giant space rock hit Earth long ago, changing the weather and ending the age of dinosaurs." },
      { emoji: "🔬", teaser: "Who studies dinosaurs?", fact: "Scientists who dig up and study dinosaurs are called paleontologists — real-life fossil detectives!" }
    ],
    quiz: [
      { q: "How big were a T-Rex's teeth?", options: ["Like grains of rice", "Like bananas", "Like peas", "Like cars"], answer: 1 },
      { q: "Birds today are related to which animals?", options: ["Fish", "Dinosaurs", "Insects", "Frogs"], answer: 1 },
      { q: "What is a fossil?", options: ["A living animal", "A rocky shape left in the ground", "A type of egg", "A plant"], answer: 1 },
      { q: "A scientist who studies dinosaurs is called a...", options: ["Zoologist", "Paleontologist", "Astronaut", "Chef"], answer: 1 },
      { q: "What do most scientists think ended the age of dinosaurs?", options: ["A big flood", "A giant space rock hit Earth", "They got bored", "Too much rain"], answer: 1 }
    ]
  }
];
