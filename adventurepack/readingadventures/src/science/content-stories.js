/* =====================================================================
   SCIENCE TEST PREP — CONTENT PART 2: practice stories
   Story shape: {id, topic, level(1-3), title, icon(ICONS key), cast, blurb, sticker, lines[], tricky[], questions[{q,opts,a,why}]}
   Easy -> harder order. Add new stories by pushing to the array.
   ===================================================================== */
const SCI_STORIES = [
  { id:'s1', topic:'motion', level:1, title:"Sonic and Tails Describe Position", icon:'speedster', cast:'Sonic, Tails',
    blurb:'Landmarks, position, and who has the faster speed.', sticker:{emoji:'📍', name:'Position Pro'},
    lines:[
      "Sonic and Tails were playing at the park.",
      "Tails wanted to describe Sonic’s position, or where he was.",
      "“A position needs a landmark,” said Tails. “A landmark is something that does not move.”",
      "First, Sonic stood next to the big tree.",
      "Then he zoomed to the bench, and his position changed.",
      "Next, he raced to the fountain.",
      "Each time his position changed, Tails knew Sonic was in motion.",
      "Then the friends raced from the tree to the fountain.",
      "Sonic ran it in five seconds, and Tails ran it in ten seconds.",
      "They ran the same distance, but Sonic took less time.",
      "“You have a higher speed,” Tails said with a smile.",
      "Now the friends can describe motion using position, landmarks, and speed."
    ],
    tricky:[
      {word:'position', syll:'po·si·tion', note:'where an object is'},
      {word:'landmark', syll:'land·mark', note:'something that stays still, used to describe where things are'},
      {word:'describe', syll:'de·scribe', note:'to tell about something'},
      {word:'motion', syll:'mo·tion', note:'moving, or changing position'},
      {word:'fountain', syll:'foun·tain', note:'water shooting up in a park'},
      {word:'distance', syll:'dis·tance', note:'how far apart two places are'}
    ],
    questions:[
      {q:"What is a landmark?", opts:["Something that does not move","Something that runs fast","A kind of race","A tall person"], a:0, why:"A landmark stays still, so we can say where something is compared to it."},
      {q:"How did Tails know Sonic was in motion?", opts:["Sonic was wearing shoes","Sonic’s position changed","Sonic was loud","It was a sunny day"], a:1, why:"If an object’s position changes, it is in motion."},
      {q:"Who ran faster from the tree to the fountain?", opts:["Tails","They ran the same speed","Sonic","Nobody ran"], a:2, why:"Sonic ran the same distance in less time (5 seconds vs. 10 seconds)."},
      {q:"Which words describe Sonic’s position at the start?", opts:["Running in a circle","Next to the big tree","Ten seconds","Very fast"], a:1, why:"A position tells where something is, using a landmark such as a tree."},
      {q:"If two runners go the same distance, but one takes less time, that runner has…", opts:["A higher speed","A lower speed","No motion","A heavier body"], a:0, why:"Less time for the same distance means a higher speed."}
    ] },

  { id:'s2', topic:'motion', level:1, title:"Owlet’s Swing Pattern", icon:'catowl', cast:'Owlet, Catboy, Gekko',
    blurb:'Back-and-forth motion and how patterns help us predict.', sticker:{emoji:'🛝', name:'Pattern Spotter'},
    lines:[
      "Owlet sat on a swing at the playground.",
      "She pushed off and swung forward.",
      "Then the swing came back, and she swung backward.",
      "Forward, back, forward, back: the swing moved back and forth.",
      "Catboy counted each trip and saw a pattern.",
      "“The swing always goes forward and then back,” he said.",
      "Gekko asked, “Can we predict what comes next?”",
      "To predict means to say what will happen.",
      "Owlet was at the front of her swing, so she knew she would go back next.",
      "A rolling ball moved in a straight line, and a bouncing ball moved up and down.",
      "The merry-go-round moved in a circle.",
      "The friends learned that patterns of motion help us predict what happens next."
    ],
    tricky:[
      {word:'playground', syll:'play·ground', note:'a place outside with swings and slides'},
      {word:'forward', syll:'for·ward', note:'toward the front'},
      {word:'backward', syll:'back·ward', note:'toward the back'},
      {word:'pattern', syll:'pat·tern', note:'something that repeats in the same way'},
      {word:'predict', syll:'pre·dict', note:'to say what will happen next'},
      {word:'circle', syll:'cir·cle', note:'a round shape'}
    ],
    questions:[
      {q:"What pattern of motion does a swing make?", opts:["Straight line","Back and forth","Zig-zag","Circle"], a:1, why:"A swing goes forward and back again and again."},
      {q:"What does predict mean?", opts:["To run very fast","To say what will happen next","To count loudly","To draw a circle"], a:1, why:"To predict is to say what you think will happen next."},
      {q:"Owlet is at the front of her swing. What comes next?", opts:["She goes back","She flies away","The swing stops forever","She goes in a circle"], a:0, why:"The pattern is forward, then back."},
      {q:"How does a rolling ball move?", opts:["Up and down","In a circle","In a straight line","Back and forth"], a:2, why:"A ball rolling on flat ground goes in a straight line."},
      {q:"Why are patterns of motion useful?", opts:["They help us predict what happens next","They make things heavier","They stop all motion","They make the playground bigger"], a:0, why:"When motion repeats, we can predict the next move."}
    ] },

  { id:'s3', topic:'forces', level:1, title:"Tayo Pushes and Pulls", icon:'bus', cast:'Tayo, Rogi, Gani',
    blurb:'Tayo learns that a force is a push or a pull.', sticker:{emoji:'🚌', name:'Force Finder'},
    lines:[
      "Tayo the little bus was helping at the school fair.",
      "First, he needed to move a big box of books.",
      "Tayo pushed the box with his front bumper, and the box slid away from him.",
      "“A push moves things away,” said Rogi.",
      "Next, Tayo needed to bring a wagon to the gate.",
      "He hooked a rope to the wagon and pulled it toward him.",
      "“A pull moves things closer,” said Gani.",
      "Pushes and pulls are forces.",
      "Tayo gave the empty wagon a small push, and it rolled slowly.",
      "Then he gave it a big push, and it rolled much faster.",
      "A bigger force changed the motion more.",
      "Tayo learned that forces can start, stop, speed up, or slow down moving things."
    ],
    tricky:[
      {word:'bumper', syll:'bump·er', note:'the part at the front of a vehicle'},
      {word:'wagon', syll:'wag·on', note:'a cart with four wheels'},
      {word:'toward', syll:'to·ward', note:'in the direction of'},
      {word:'forces', syll:'for·ces', note:'pushes and pulls'},
      {word:'slowly', syll:'slow·ly', note:'not fast'},
      {word:'bigger', syll:'big·ger', note:'larger'}
    ],
    questions:[
      {q:"What is a force?", opts:["A push or a pull","A loud noise","A kind of bus","A fast car"], a:0, why:"A force is a push or a pull."},
      {q:"How did Tayo move the box away from him?", opts:["He pulled it","He pushed it","He lifted it","He called it"], a:1, why:"A push moves things away from you."},
      {q:"What does a pull do?", opts:["Moves something away","Makes something disappear","Moves something toward you","Makes something heavy"], a:2, why:"A pull moves things closer to you."},
      {q:"What happened when Tayo gave the wagon a big push?", opts:["It rolled slowly","It rolled much faster","It did not move","It broke"], a:1, why:"A bigger force changes motion more."},
      {q:"What can forces do to moving things?", opts:["Only make them stop","Only make them heavier","Start, stop, speed up, or slow them down","Nothing at all"], a:2, why:"Forces can change motion in all of these ways."}
    ] },

  { id:'s4', topic:'forces', level:2, title:"Greg and Rowley’s Tug-of-War", icon:'artist', cast:'Greg, Rowley, Eesa, Maahi',
    blurb:'Balanced and unbalanced forces in a tug-of-war.', sticker:{emoji:'🪢', name:'Tug-of-War Scientist'},
    lines:[
      "Greg and Rowley held a rope for a tug-of-war.",
      "Each boy pulled with the same strength, and the rope did not move.",
      "“The forces are balanced,” said Eesa, who was the judge.",
      "Balanced forces are equal and pull in opposite directions, so the motion does not change.",
      "Then Maahi joined Rowley’s side of the rope.",
      "Now Rowley’s team pulled with a bigger force than Greg.",
      "The forces were unbalanced, and the rope began to move toward Rowley’s team.",
      "Greg slid forward a few steps in the grass.",
      "“Unbalanced forces change motion,” said Maahi.",
      "Greg asked for help, and Eesa joined his side.",
      "Now both teams had the same pull again, and the rope stopped moving.",
      "The friends learned that balanced forces keep motion the same, and unbalanced forces change it."
    ],
    tricky:[
      {word:'balanced', syll:'bal·anced', note:'equal forces that cancel out'},
      {word:'unbalanced', syll:'un·bal·anced', note:'forces that are not equal'},
      {word:'opposite', syll:'op·po·site', note:'on the other side, going the other way'},
      {word:'directions', syll:'di·rec·tions', note:'the ways something can go'},
      {word:'motion', syll:'mo·tion', note:'moving, or changing position'},
      {word:'strength', syll:'strength', note:'how strong something is'}
    ],
    questions:[
      {q:"Why did the rope not move at first?", opts:["The rope was too heavy","Nobody was pulling","The forces were balanced","It was too windy"], a:2, why:"Both boys pulled with equal strength, so the forces cancelled out."},
      {q:"What changed when Maahi joined Rowley’s side?", opts:["Rowley’s team pulled with a bigger force","The rope got longer","Greg let go","The grass got slippery"], a:0, why:"More pulling on one side makes the forces unbalanced."},
      {q:"What happened to the rope when the forces were unbalanced?", opts:["It disappeared","It moved toward Rowley’s team","It stayed still","It moved toward Greg"], a:1, why:"The stronger force wins and the motion changes."},
      {q:"How did the rope stop moving again?", opts:["Everyone went home","Rowley let go","The judge took the rope","Eesa joined Greg’s side and the forces became equal"], a:3, why:"Equal forces on both sides are balanced, so the rope stopped changing."},
      {q:"Which sentence is true?", opts:["Unbalanced forces change motion","Balanced forces always make things speed up","Forces cannot be balanced","Only heavy things have forces"], a:0, why:"Unbalanced forces change motion. Balanced forces do not."}
    ] },

  { id:'s5', topic:'forces', level:2, title:"Maahi’s Toy Car Test", icon:'science', cast:'Maahi, Eesa',
    blurb:'A fair test shows how friction changes how far a car rolls.', sticker:{emoji:'🚗', name:'Friction Detective'},
    lines:[
      "Maahi wanted to know which floor lets a toy car roll the farthest.",
      "Maahi set up a ramp and let the same car roll onto three surfaces: tile, carpet, and sandpaper.",
      "Eesa measured how far the car rolled each time.",
      "On the tile, the car rolled 120 centimeters.",
      "On the carpet, it rolled only 40 centimeters.",
      "On the sandpaper, it rolled just 15 centimeters.",
      "“Why did the car stop sooner on the sandpaper?” Eesa asked.",
      "“Friction!” said Maahi. “Rough surfaces have more friction, and friction slows things down.”",
      "To make it a fair test, they used the same car and the same ramp every time.",
      "Only the surface was changed.",
      "Maahi predicted that a smooth plastic sheet would let the car roll even farther, and it rolled 150 centimeters.",
      "The friends learned that less friction means a longer roll."
    ],
    tricky:[
      {word:'friction', syll:'fric·tion', note:'a force when surfaces rub; it slows things down'},
      {word:'measured', syll:'meas·ured', note:'found out how big or how far'},
      {word:'centimeters', syll:'cen·ti·me·ters', note:'small units used to measure length'},
      {word:'sandpaper', syll:'sand·pa·per', note:'rough paper used to smooth wood'},
      {word:'surfaces', syll:'sur·fac·es', note:'the tops of things, like floors'},
      {word:'predicted', syll:'pre·dict·ed', note:'said what would happen before it did'}
    ],
    questions:[
      {q:"Of the tile, carpet, and sandpaper, which let the car roll the farthest?", opts:["Carpet","Sandpaper","Tile","They were all the same"], a:2, why:"Tile: 120 cm. Carpet: 40 cm. Sandpaper: 15 cm."},
      {q:"Why did the car stop sooner on the sandpaper?", opts:["The car got tired","Sandpaper has more friction","Sandpaper is cold","Gravity turned off"], a:1, why:"Rough surfaces have more friction, and friction slows things down."},
      {q:"Why did they use the same car and ramp every time?", opts:["They only had one car","To make it a fair test","To make the car go faster","Because the ramp was new"], a:1, why:"In a fair test, you change only one thing (here, the surface)."},
      {q:"What did the smooth plastic sheet have?", opts:["More friction than sandpaper","The same friction as carpet","Less friction","No gravity"], a:2, why:"The car rolled farthest on plastic, so it has the least friction."},
      {q:"Which surface has the MOST friction?", opts:["Sandpaper","Tile","Plastic sheet","They are all equal"], a:0, why:"The car rolled the shortest distance on sandpaper."}
    ] },

  { id:'s6', topic:'magnets', level:2, title:"Umair and Aaqil and the Mystery Magnet Box", icon:'treasure', cast:'Umair, Aaqil',
    blurb:'Which things does a magnet attract? A surprise about foil!', sticker:{emoji:'🧲', name:'Magnet Tester'},
    lines:[
      "Umair and Aaqil found a box of mystery objects and a strong magnet.",
      "They wanted to test which objects a magnet attracts.",
      "The paper clip jumped to the magnet right away.",
      "The iron nail stuck to it too.",
      "The wooden block, the plastic cup, and the glass marble did not move.",
      "Then Aaqil tried a piece of aluminum foil.",
      "“Foil is a metal, so the magnet must pick it up,” he said.",
      "But the foil did not move at all.",
      "“Not every metal is magnetic,” said Umair. “Magnets attract iron and steel.”",
      "Next, they slid a thin piece of paper between the magnet and the clip, and the clip still stuck.",
      "Magnetic force can pass through thin things like paper.",
      "The boys wrote down their results and felt like real scientists."
    ],
    tricky:[
      {word:'mystery', syll:'mys·ter·y', note:'something you do not know yet'},
      {word:'attracts', syll:'at·tracts', note:'pulls toward itself'},
      {word:'aluminum', syll:'a·lu·mi·num', note:'a light, silver metal used for cans and foil'},
      {word:'magnetic', syll:'mag·net·ic', note:'able to be pulled by a magnet'},
      {word:'scientists', syll:'sci·en·tists', note:'people who study the world'},
      {word:'results', syll:'re·sults', note:'what you find out from a test'}
    ],
    questions:[
      {q:"Which two things stuck to the magnet?", opts:["Paper clip and iron nail","Wooden block and glass marble","Foil and plastic cup","Plastic cup and paper clip"], a:0, why:"Magnets attract iron and steel."},
      {q:"What did Aaqil think about the foil?", opts:["It was too small","It must be magnetic because it is a metal","It was too heavy","It was a paper clip"], a:1, why:"Aaqil believed all metals are magnetic."},
      {q:"Was Aaqil right?", opts:["Yes, all metals are magnetic","Yes, but only shiny metals","No, not every metal is magnetic","No, foil is made of plastic"], a:2, why:"Aluminum is a metal, but it is not attracted to magnets."},
      {q:"What did the paper test show?", opts:["Paper is magnetic","Magnets only work on paper","Magnets stop working outside","Magnetic force can pass through thin things"], a:3, why:"The clip stuck even with paper in between."},
      {q:"Magnets attract things made of…", opts:["Iron and steel","Wood and plastic","Glass and rubber","Paper and cloth"], a:0, why:"Iron (and steel, which has iron) is magnetic."}
    ] },

  { id:'s7', topic:'magnets', level:2, title:"Aahid and Rayhan’s Magnet Trains", icon:'inventor', cast:'Aahid, Rayhan',
    blurb:'North and south poles attract. Same poles repel.', sticker:{emoji:'🚂', name:'Pole Expert'},
    lines:[
      "Aahid and Rayhan built two toy trains with a magnet on each end.",
      "When they pushed the trains together, the first pair of ends snapped together.",
      "“They attract!” said Rayhan.",
      "Aahid turned one train around and tried again.",
      "This time, the trains pushed apart before they even touched.",
      "“They repel!” said Aahid. “The same poles are facing each other.”",
      "Rayhan marked the poles on each magnet with N for north and S for south.",
      "A north pole attracts a south pole, but a north pole repels another north pole.",
      "They lined up the trains so every north pole faced a south pole.",
      "Now the trains could link together and roll down the track.",
      "The trains did not need to touch, because magnetic force works from a distance.",
      "The boys learned that opposites attract and likes repel."
    ],
    tricky:[
      {word:'magnet', syll:'mag·net', note:'an object that pulls on some metals'},
      {word:'attract', syll:'at·tract', note:'to pull together'},
      {word:'repel', syll:'re·pel', note:'to push apart'},
      {word:'opposites', syll:'op·po·sites', note:'things that are completely different, like north and south'},
      {word:'together', syll:'to·geth·er', note:'with each other'},
      {word:'distance', syll:'dis·tance', note:'how far apart two things are'}
    ],
    questions:[
      {q:"What happened when the first pair of ends met?", opts:["They snapped together","They pushed apart","They broke","Nothing happened"], a:0, why:"Opposite poles attract, so they snapped together."},
      {q:"Why did the trains push apart after Aahid turned one around?", opts:["The track was bumpy","The same poles were facing each other","The magnets ran out of power","The trains got heavier"], a:1, why:"Same poles repel each other."},
      {q:"What does repel mean?", opts:["Pull together","Spin around","Push apart","Break in half"], a:2, why:"Repel means push apart."},
      {q:"How did the boys link all the train cars?", opts:["With glue","With rope","By lining up north poles facing south poles","By painting them"], a:2, why:"North and south poles attract, so the cars stuck together."},
      {q:"Which rule did the boys learn?", opts:["Likes attract, opposites repel","Opposites attract, likes repel","Magnets only work when touching","All poles repel"], a:1, why:"Opposite poles attract. Same poles repel."}
    ] },

  { id:'s8', topic:'magnets', level:3, title:"Sheriff Labrador and the Compass", icon:'sheriffdog', cast:'Sheriff Labrador, Biscuit',
    blurb:'Fog on the mountain! Can a tiny magnet show the way?', sticker:{emoji:'🧭', name:'Compass Captain'},
    lines:[
      "Sheriff Labrador led a hike up Pawtown Mountain with his friend Biscuit.",
      "Thick fog covered the trail, and they could not see the town.",
      "“Do not worry,” said the Sheriff. “I have my compass.”",
      "Inside the compass was a tiny magnet called a needle.",
      "The needle can spin freely, and it lines up with the magnetic force of the Earth.",
      "“The Earth acts like a giant magnet,” the Sheriff explained.",
      "The red end of the needle pointed north.",
      "Biscuit put his steel toy next to the compass, and the needle jumped toward it.",
      "“Magnets attract steel because it has iron,” said the Sheriff. “Keep metal away from a compass.”",
      "Using the compass, they walked in the right direction down the trail.",
      "Soon, the fog cleared, and the friends saw the lights of Pawtown.",
      "Biscuit wagged his tail, thankful for a tiny magnet that pointed the way."
    ],
    tricky:[
      {word:'compass', syll:'com·pass', note:'a tool with a magnet that points north'},
      {word:'needle', syll:'nee·dle', note:'the thin magnet inside a compass'},
      {word:'magnetic', syll:'mag·net·ic', note:'having to do with magnets'},
      {word:'mountain', syll:'moun·tain', note:'a very tall hill'},
      {word:'explained', syll:'ex·plained', note:'told how something works'},
      {word:'direction', syll:'di·rec·tion', note:'the way you go'}
    ],
    questions:[
      {q:"What is inside a compass?", opts:["A tiny light","A tiny magnet called a needle","A battery","A small rock"], a:1, why:"The needle of a compass is a small magnet."},
      {q:"Why does a compass needle point north?", opts:["The Earth acts like a giant magnet","The needle likes cold weather","The needle is painted red","The Sheriff turns it north"], a:0, why:"The needle lines up with the magnetic force of the Earth."},
      {q:"Which direction did the red end of the needle point?", opts:["South","East","West","North"], a:3, why:"The red end of the needle points north."},
      {q:"Why did the needle jump toward Biscuit’s steel toy?", opts:["The toy was loud","The toy was a battery","Steel has iron, so the magnet attracts it","The toy was alive"], a:2, why:"Magnets attract iron and steel."},
      {q:"Why should metal be kept away from a compass?", opts:["Metal makes it heavy","It can pull the needle and give a wrong direction","Metal makes it too bright","Metal makes it louder"], a:1, why:"Magnetic metal can pull on the needle, so the compass may point the wrong way."}
    ] },

  { id:'s9', topic:'electro', level:3, title:"Doby Builds an Electromagnet", icon:'elf', cast:'Doby',
    blurb:'Nail, wire, and battery: Doby makes a magnet you can turn off!', sticker:{emoji:'🔋', name:'Electromagnet Builder'},
    lines:[
      "Doby wanted to build an electromagnet for the science fair, and a grown-up helped him.",
      "He gathered an iron nail, a long piece of insulated wire, and a battery.",
      "First, Doby wrapped the wire around the nail to make a coil.",
      "Then he connected both ends of the wire to the battery.",
      "Electric current flowed through the wire, and the nail turned into a magnet!",
      "The nail picked up five paper clips.",
      "Doby disconnected one wire, the current stopped, and all the clips fell.",
      "“An electromagnet works only when current flows,” he said.",
      "To make it stronger, Doby wrapped more coils around the nail.",
      "This time, the nail picked up twelve paper clips.",
      "He also tried two batteries, and the electromagnet became even stronger.",
      "Doby learned that more coils and more current make a stronger electromagnet."
    ],
    tricky:[
      {word:'electromagnet', syll:'e·lec·tro·mag·net', note:'a magnet made with electricity'},
      {word:'insulated', syll:'in·su·lat·ed', note:'covered so electricity stays in the wire'},
      {word:'battery', syll:'bat·ter·y', note:'makes electric current flow'},
      {word:'coil', syll:'coil', note:'wire wrapped around and around'},
      {word:'electric', syll:'e·lec·tric', note:'having to do with electricity'},
      {word:'current', syll:'cur·rent', note:'electricity flowing through a wire'}
    ],
    questions:[
      {q:"Which three things did Doby gather?", opts:["Iron nail, insulated wire, and a battery","Wood stick, string, and a bulb","Plastic spoon, wire, and a rock","Magnet, paper, and tape"], a:0, why:"An electromagnet needs an iron core (nail), a coil of wire, and a battery."},
      {q:"What made the nail turn into a magnet?", opts:["Rubbing it on carpet","Electric current flowing through the coil","Putting it in water","Painting it red"], a:1, why:"Electric current makes a magnetic force."},
      {q:"Why did the paper clips fall?", opts:["The wire got too long","Gravity got stronger","The current stopped","The nail got smaller"], a:2, why:"An electromagnet only works while current flows."},
      {q:"How did Doby make the electromagnet stronger?", opts:["Used less wire","Took away the nail","Turned off the battery","Added more coils and more batteries"], a:3, why:"More coils and more current make a stronger electromagnet."},
      {q:"Which statement is true?", opts:["An electromagnet can be turned on and off","An electromagnet is always on","Electromagnets do not need electricity","Electromagnets only work with wood"], a:0, why:"You can switch an electromagnet on and off by controlling the current."}
    ] },

  { id:'s10', topic:'electro', level:3, title:"Captain Underpants and the Junkyard Crane", icon:'capeHero', cast:'Captain Underpants',
    blurb:'A giant electromagnet lifts cars, then lets go!', sticker:{emoji:'🏗️', name:'Crane Commander'},
    lines:[
      "Captain Underpants visited the junkyard, where giant piles of old cars sat in rows.",
      "A worker named Ms. Lopez sat in a crane with a huge round electromagnet.",
      "“How does it lift a car?” asked the Captain.",
      "“When I switch on the electric current, the electromagnet becomes strongly magnetic,” she said.",
      "The crane swung over a steel car, and the car stuck to the magnet with a loud clang.",
      "Ms. Lopez lifted the car and moved it to a new pile.",
      "Then she switched the current off, and the car dropped down.",
      "“A regular magnet would hold on forever,” said the Captain. “But an electromagnet lets go when you want.”",
      "Next, the Captain pointed to a pile of aluminum cans.",
      "“The magnet will not lift those,” said Ms. Lopez. “Aluminum is not magnetic.”",
      "She used a different machine to move the cans.",
      "The Captain cheered. “Electromagnets are super helpful!”"
    ],
    tricky:[
      {word:'junkyard', syll:'junk·yard', note:'a place where old cars and metal are kept'},
      {word:'electromagnet', syll:'e·lec·tro·mag·net', note:'a magnet made with electricity'},
      {word:'electric', syll:'e·lec·tric', note:'having to do with electricity'},
      {word:'magnetic', syll:'mag·net·ic', note:'able to be pulled by a magnet'},
      {word:'aluminum', syll:'a·lu·mi·num', note:'a light metal used in cans'},
      {word:'regular', syll:'reg·u·lar', note:'normal, always the same'}
    ],
    questions:[
      {q:"What does the crane use to lift cars?", opts:["A giant rope","A giant electromagnet","A giant spring","A giant balloon"], a:1, why:"The crane has a huge electromagnet."},
      {q:"How does Ms. Lopez make the electromagnet strong?", opts:["She paints it","She switches on the electric current","She blows on it","She makes it wet"], a:1, why:"The electromagnet is strongly magnetic only when current flows."},
      {q:"What happens when Ms. Lopez switches the current off?", opts:["The car gets lighter","The car turns red","The car drops","The car floats away"], a:2, why:"With no current, the electromagnet is no longer magnetic."},
      {q:"Why is an electromagnet better than a regular magnet for this job?", opts:["It is smaller","It never uses electricity","It can lift paper","It can be turned off to let go of the car"], a:3, why:"A regular magnet cannot be turned off."},
      {q:"Why can the crane not lift aluminum cans?", opts:["Aluminum is not magnetic","The cans are too heavy","The cans are too round","The crane is too small"], a:0, why:"Magnets do not attract aluminum, even with electricity."}
    ] }
];
