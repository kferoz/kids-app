/* =====================================================================
   SCIENCE TEST PREP — CONTENT PART 3: question bank, true/false, fill-in-the-blank
   Q(topic, level 1-3, question, options, correctIndex, explanation)
   Level 1 = easy recall, 2 = understand, 3 = apply / think.
   ===================================================================== */
const SCI_BANK = [];
function Q(topic, lvl, q, opts, a, why){ SCI_BANK.push({ id: topic + '-' + (SCI_BANK.filter(x=>x.topic===topic).length+1), topic, lvl, q, opts, a, why }); }

/* ---- MOTION ---- */
Q('motion',1,"What is motion?",["Staying in one place","Changing position","Being very heavy","Being very loud"],1,"Motion means an object’s position is changing.");
Q('motion',1,"Position tells us…",["How heavy something is","How loud something is","Where something is","What something is made of"],2,"Position is where an object is.");
Q('motion',1,"Which of these is in motion?",["A parked bike","A rolling ball","A sleeping cat","A closed book"],1,"A rolling ball is changing position.");
Q('motion',1,"A swing moves in which pattern?",["Circle","Zig-zag","Back and forth","Straight line"],2,"A swing goes forward and back again and again.");
Q('motion',1,"A cheetah and a turtle move for the same amount of time. The cheetah goes much farther. Which has the higher speed?",["The turtle","They have the same speed","The cheetah","Neither is moving"],2,"The one that goes farther in the same time is faster.");
Q('motion',2,"What can we use to describe an object’s position?",["A landmark","A rope","A magnet","A battery"],0,"A landmark, like a tree or a door, stays still so we can compare.");
Q('motion',2,"A basketball bounces on the court. Which pattern does it make?",["Up and down","Circle","Zig-zag","Back and forth"],0,"A bouncing ball goes up, then down, again and again.");
Q('motion',2,"Two cars drive for the same time. Car A goes 10 meters. Car B goes 25 meters. Which has the greater speed?",["Car A","Car B","They are the same","You cannot tell"],1,"Car B went farther in the same time.");
Q('motion',2,"A skier goes down a hill turning left, right, left, right. This pattern is called…",["Straight line","Circle","Up and down","Zig-zag"],3,"Turning back and forth along the way makes a zig-zag.");
Q('motion',2,"A merry-go-round moves in a…",["Circle","Straight line","Zig-zag","Back and forth"],0,"It spins around in a circle.");
Q('motion',3,"A pendulum swings right, left, right, left. It just swung left. What will it do next?",["Swing right","Stop forever","Fly up","Swing left again"],0,"The pattern is right, then left, then right. We can predict the next move.");
Q('motion',3,"Which sentence tells BOTH speed and direction?",["The ball is red","The bike moves fast toward the school","The ball is heavy","The wall is tall"],1,"“Fast” is speed and “toward the school” is direction.");
Q('motion',3,"A bus goes past a tree, then a school, then a store. How do you know the bus is moving?",["Its position changed compared to the landmarks","It is yellow","It is large","It is loud"],0,"Position changing compared to a landmark means motion.");
Q('motion',3,"Two runners run for 10 seconds. Runner A stops at the 40 meter line. Runner B stops at the 50 meter line. Which is true?",["Runner A had the higher speed","Runner B had the higher speed","They had the same speed","Neither one moved"],1,"Runner B went farther in the same 10 seconds.");

/* ---- FORCES ---- */
Q('forces',1,"A force is a…",["Color","Push or pull","Kind of metal","Sound"],1,"A force is a push or a pull.");
Q('forces',1,"Which is a push?",["Pulling a wagon","Kicking a ball","Tugging a rope","Opening a drawer by its handle"],1,"Kicking pushes the ball away from you.");
Q('forces',1,"Which is a pull?",["Closing a door","Throwing a ball","Pulling a sled","Pressing a button"],2,"Pulling a sled brings it toward you.");
Q('forces',1,"Which force pulls objects toward the Earth?",["Friction","Magnetism","Gravity","Wind"],2,"Gravity pulls things down toward the Earth.");
Q('forces',1,"A force can…",["Only start motion","Only stop motion","Start, stop, or change motion","Never change motion"],2,"Forces can start, stop, speed up, slow down, or turn things.");
Q('forces',2,"Equal forces pushing in opposite directions are called…",["Balanced forces","Unbalanced forces","Friction","Magnetic force"],0,"Equal forces from opposite sides cancel out. They are balanced.");
Q('forces',2,"When forces on an object are unbalanced, the object’s motion…",["Does not change","Changes","Disappears","Always stops"],1,"Unbalanced forces change motion.");
Q('forces',2,"Which surface has the LEAST friction?",["Sandpaper","Carpet","Grass","Ice"],3,"Smooth surfaces like ice have the least friction.");
Q('forces',2,"Friction is a force that…",["Speeds things up","Pulls things into the sky","Slows or stops things that slide","Makes things float"],2,"Friction happens when surfaces rub, and it slows motion.");
Q('forces',2,"A book sits still on a table. The forces on it are…",["Unbalanced","Balanced","Zero because gravity is off","Only friction"],1,"Gravity pulls down and the table pushes up equally.");
Q('forces',3,"You stop pedaling on a flat road and your bike slowly slows down. Which force helps slow it?",["Magnetism","Friction","Electric current","A push from gravity"],1,"Friction between the tires and the road (and air) slows the bike.");
Q('forces',3,"Mia pushes a toy car with a small force, and then with a big force. What happens with the big force?",["It changes the motion more","It changes the motion less","The car does not move","The car floats"],0,"A bigger force changes motion more.");
Q('forces',3,"Team A pulls a rope with 50 units of force. Team B pulls the other way with 80 units. What happens?",["The rope stays still","The rope moves toward Team B","The rope moves toward Team A","The rope disappears"],1,"The forces are unbalanced and the bigger force wins.");
Q('forces',3,"Which change would make it HARDER for a box to slide across the floor?",["A smoother floor","A rougher floor","Oil on the floor","Pushing with more force"],1,"A rougher floor has more friction.");

/* ---- MAGNETS ---- */
Q('magnets',1,"Every magnet has…",["One pole","Two poles","No poles","Three poles"],1,"Every magnet has a north pole and a south pole.");
Q('magnets',1,"A magnet will attract…",["A wooden spoon","An iron nail","A plastic cup","A glass jar"],1,"Magnets attract iron.");
Q('magnets',1,"Which two poles attract each other?",["North and north","South and south","North and south","None of them"],2,"Opposite poles attract.");
Q('magnets',1,"Which two poles repel each other?",["North and south","North and north","Neither pair","All poles attract"],1,"The same poles repel (push apart).");
Q('magnets',1,"The pull or push of a magnet is called…",["Magnetic force","Gravity","Friction","Electric current"],0,"That pull or push is magnetic force.");
Q('magnets',2,"Which metal is NOT attracted to a magnet?",["Iron","Steel","Aluminum","Nickel"],2,"Aluminum is a metal, but it is not magnetic.");
Q('magnets',2,"A magnet pulls a paper clip. What happens when you move the magnet farther away?",["The pull gets stronger","The pull gets weaker","The pull stays exactly the same","The clip turns to gold"],1,"Magnetic force is weaker when the magnet is farther away.");
Q('magnets',2,"Which can magnetic force pass through?",["A thin piece of paper","Nothing at all","Only water","Only thick walls"],0,"Magnetic force can pass through thin things like paper.");
Q('magnets',2,"If you cut a bar magnet in half, you get…",["One north piece and one south piece","Two magnets, each with two poles","Two pieces that are not magnets","One magnet and one rock"],1,"Each piece has its own north and south pole.");
Q('magnets',2,"A compass needle points…",["East","South","Toward the sun","North"],3,"The needle lines up with Earth’s magnetism and points north.");
Q('magnets',3,"You hold the north poles of two magnets close together. What happens?",["They pull together","They push apart","Nothing happens","They stop being magnets"],1,"Same poles repel.");
Q('magnets',3,"Which statement is true?",["All metals are magnetic","Magnets attract iron and steel","Magnets attract wood","Magnetic force only works by touching"],1,"Magnets attract iron and steel. Magnetic force works at a distance.");
Q('magnets',3,"Why does a compass work?",["It uses a battery","The Earth acts like a giant magnet","It has a tiny sun inside","Wind pushes the needle"],1,"The compass needle is a magnet that lines up with Earth’s magnetic force.");
Q('magnets',3,"A student tests objects with a magnet. Which result is MOST likely?",["A plastic ruler sticks","A steel screw sticks","A glass marble sticks","A wooden block sticks"],1,"Steel has iron, so it sticks.");

/* ---- ELECTROMAGNETS ---- */
Q('electro',1,"An electromagnet is a magnet made using…",["Wood","Electricity","Water","Paper"],1,"An electromagnet uses electric current.");
Q('electro',1,"To make an electromagnet you need a battery, wire, and…",["An iron nail","A plastic straw","A wooden stick","A piece of cloth"],0,"The iron nail is the core that becomes magnetic.");
Q('electro',1,"Can you turn an electromagnet off?",["Yes, by stopping the electric current","No, never","Only with water","Only at night"],0,"No current means no magnetic force.");
Q('electro',1,"A regular magnet…",["Can be turned on and off","Is always magnetic","Needs a battery","Only works on Tuesdays"],1,"A regular magnet cannot be switched off.");
Q('electro',1,"Electric current is…",["Water flowing","Electricity flowing through a wire","Air moving","Heat from the sun"],1,"Current is electricity flowing through a wire.");
Q('electro',2,"How can you make an electromagnet stronger?",["Use fewer coils","Remove the battery","Add more coils or more batteries","Use a plastic nail"],2,"More coils and more current make it stronger.");
Q('electro',2,"What happens to the paper clips when the electric current stops?",["They stay stuck","They fall","They get bigger","They glow"],1,"The electromagnet turns off and lets go.");
Q('electro',2,"Wire wrapped around and around a nail is called a…",["Coil","Compass","Pole","Landmark"],0,"Wire wrapped in loops is a coil.");
Q('electro',2,"Where do we use electromagnets?",["A junkyard crane","A glass window","A wooden chair","A paper airplane"],0,"Cranes, doorbells, motors, and speakers use electromagnets.");
Q('electro',2,"What does an electric circuit need so current can flow?",["A complete loop","A gap in the wire","Only a nail","A bar magnet"],0,"Current needs a complete loop to flow.");
Q('electro',3,"What happens if you flip the battery around in an electromagnet?",["The poles switch","Nothing ever changes","It stops being a coil","The nail melts"],0,"The current flows the other way, so the poles swap.");
Q('electro',3,"Sam’s electromagnet picks up 4 clips. Which change picks up the MOST clips?",["Take away the nail","One battery and 5 coils","Two batteries and 20 coils","Disconnect the battery"],2,"More coils and more batteries make a stronger electromagnet.");
Q('electro',3,"Why is an electromagnet useful on a junkyard crane?",["It is always on","It can drop the car when switched off","It lifts aluminum cans","It needs no electricity"],1,"Turning it off lets go of the car.");
Q('electro',3,"Which statement about magnets is true?",["Both kinds can be turned off","An electromagnet needs electric current; a regular magnet does not","A regular magnet needs a battery","Neither has poles"],1,"Electromagnets need current. Regular magnets are always magnetic.");

/* ---- True / False ---- */
const SCI_TF = [
  {t:"Position tells where an object is.", a:true, topic:'motion', why:"Position means where something is."},
  {t:"An object that is in motion does not change position.", a:false, topic:'motion', why:"Motion means position changes."},
  {t:"A swing moves back and forth.", a:true, topic:'motion', why:"A swing’s pattern is back and forth."},
  {t:"In the same time, a slower object travels farther than a faster object.", a:false, topic:'motion', why:"The faster object goes farther."},
  {t:"Patterns of motion help us predict what happens next.", a:true, topic:'motion', why:"Repeating patterns let us predict."},
  {t:"A force is a push or a pull.", a:true, topic:'forces', why:"That is what a force is."},
  {t:"Gravity pushes things up into the sky.", a:false, topic:'forces', why:"Gravity pulls things down toward Earth."},
  {t:"Friction can slow a moving object.", a:true, topic:'forces', why:"Friction slows or stops sliding things."},
  {t:"Balanced forces change an object’s motion.", a:false, topic:'forces', why:"Balanced forces cancel, so motion does not change."},
  {t:"Ice has more friction than sandpaper.", a:false, topic:'forces', why:"Ice is smooth (less friction). Sandpaper is rough (more)."},
  {t:"A bigger force changes motion more than a smaller force.", a:true, topic:'forces', why:"Bigger force, bigger change."},
  {t:"Opposite poles of magnets attract.", a:true, topic:'magnets', why:"North and south attract."},
  {t:"A magnet only works if it touches something.", a:false, topic:'magnets', why:"Magnetic force works from a distance."},
  {t:"Magnets attract aluminum foil.", a:false, topic:'magnets', why:"Aluminum is not magnetic."},
  {t:"Magnets attract objects made of iron and steel.", a:true, topic:'magnets', why:"Iron and steel are magnetic."},
  {t:"Every magnet has a north pole and a south pole.", a:true, topic:'magnets', why:"Every magnet has two poles."},
  {t:"A compass needle points north.", a:true, topic:'magnets', why:"The needle lines up with Earth’s magnetism."},
  {t:"The same poles of two magnets repel each other.", a:true, topic:'magnets', why:"Same poles push apart."},
  {t:"All metals are magnetic.", a:false, topic:'magnets', why:"Aluminum and copper are metals that are not magnetic."},
  {t:"An electromagnet needs electric current to work.", a:true, topic:'electro', why:"No current, no electromagnet."},
  {t:"You can turn an electromagnet off.", a:true, topic:'electro', why:"Stop the current and it turns off."},
  {t:"A regular magnet can be turned off with a switch.", a:false, topic:'electro', why:"A regular magnet is always magnetic."},
  {t:"More coils make an electromagnet stronger.", a:true, topic:'electro', why:"More coils, stronger magnet."},
  {t:"An electromagnet cannot have poles.", a:false, topic:'electro', why:"It has a north pole and a south pole."},
  {t:"Flipping the battery switches an electromagnet’s poles.", a:true, topic:'electro', why:"The current flows the other way."}
];

/* ---- Fill in the blank (word is a SCI_VOCAB key) ---- */
const SCI_CLOZE = [
  {s:"A ____ is a push or a pull.", a:'force'},
  {s:"____ tells how fast something moves.", a:'speed'},
  {s:"Two north poles will ____ each other.", a:'repel'},
  {s:"A north pole and a south pole ____ each other.", a:'attract'},
  {s:"____ is a force that slows things down when surfaces rub together.", a:'friction'},
  {s:"A ____ has a needle that points north.", a:'compass'},
  {s:"Wire wrapped around a nail is called a ____.", a:'coil'},
  {s:"____ pulls objects toward the Earth.", a:'gravity'},
  {s:"Equal forces that cancel out are ____ forces.", a:'balanced'},
  {s:"A ____ stores energy and makes electric current flow.", a:'battery'},
  {s:"A magnet made with electric current is an ____.", a:'electromagnet'},
  {s:"Where an object is located is its ____.", a:'position'},
  {s:"A ____ is a complete loop that electric current can flow around.", a:'circuit'},
  {s:"To say what will happen next is to ____.", a:'predict'}
];
