/* =====================================================================
   SCIENCE TEST PREP — CONTENT PART 1: lessons, vocabulary, sort games
   Topics (from the teacher): motion, force, magnets, electromagnetism.
   To add content: edit the arrays below. Art keys map to SCI_ART in science-art.js.
   ===================================================================== */
const SCI_TOPICS = [
  { id:'motion', title:'Motion', emoji:'🏃', color:'#3b82f6', bg:'#e8f1ff' },
  { id:'forces', title:'Forces', emoji:'💪', color:'#f97316', bg:'#fff1e3' },
  { id:'magnets', title:'Magnets', emoji:'🧲', color:'#ef4444', bg:'#ffeaea' },
  { id:'electro', title:'Electromagnets', emoji:'⚡', color:'#8b5cf6', bg:'#f1eaff' }
];

const SCI_LESSONS = {
  motion: {
    intro: "Motion is all around us! Let’s learn how to talk about things that move.",
    slides: [
      { title:"What is motion?", art:'m_position',
        text:["Motion means an object is moving.","When something moves, its position changes. Position is where an object is.","We tell position by comparing it to something that stays still, like a tree, a door, or a bench."],
        remember:"If an object’s position changes, it is in motion." },
      { title:"Patterns of motion", art:'m_patterns',
        text:["Things move in patterns.","A ball rolling down a hallway moves in a straight line.","A swing moves back and forth. A merry-go-round moves in a circle.","A bouncing ball moves up and down. A zig-zag path turns left, then right, again and again."],
        remember:"Motion can follow a pattern: straight, back and forth, circle, zig-zag, or up and down." },
      { title:"Fast or slow? That is speed!", art:'m_speed',
        text:["Speed tells us how fast something moves.","A fast object goes a long way in a short time.","A slow object goes a short way in the same time.","A cheetah has a high speed. A turtle has a low speed."],
        remember:"In the same amount of time, the faster object travels farther." },
      { title:"Direction", art:'m_direction',
        text:["Direction tells us which way something moves: up, down, left, right, forward, backward, or toward the north.","Every motion has a speed and a direction.","Something can speed up, slow down, or turn. That means its motion changed."],
        remember:"Motion can change in speed (faster or slower) and in direction (a new way)." },
      { title:"Predict the next move!", art:'m_predict',
        text:["When we see a pattern, we can predict what will happen next.","A swing goes forward, then back, then forward again. If it just went forward, what comes next? Back!","Scientists watch patterns and use them to make good predictions."],
        remember:"Patterns help us predict future motion." }
    ]
  },
  forces: {
    intro: "Why do things start moving, stop, or change direction? The answer is FORCES!",
    slides: [
      { title:"A force is a push or a pull", art:'f_pushpull',
        text:["A push moves something away from you. A pull moves something toward you.","Kicking a ball is a push. Pulling a wagon is a pull.","Opening a door can be a push or a pull."],
        remember:"A force is a push or a pull." },
      { title:"What can a force do?", art:'f_effects',
        text:["A force can start something moving, stop it, speed it up, slow it down, or change its direction.","A bigger force changes motion more. A smaller force changes it less.","A force has a strength (how big) and a direction (which way)."],
        remember:"Forces change motion. Bigger forces make bigger changes." },
      { title:"Balanced forces", art:'f_balanced',
        text:["Balanced forces are equal and push or pull in opposite directions.","They cancel each other out, so the motion does not change.","In a tug-of-war where nobody moves, the forces are balanced. A book resting on a table has balanced forces too: gravity pulls it down and the table pushes it up."],
        remember:"Balanced forces = no change in motion." },
      { title:"Unbalanced forces", art:'f_unbalanced',
        text:["Unbalanced forces are not equal. One force is stronger.","The object starts to move, speed up, slow down, or change direction.","In a tug-of-war, the stronger team pulls the rope their way."],
        remember:"Unbalanced forces = the motion changes." },
      { title:"Gravity", art:'f_gravity',
        text:["Gravity is a force that pulls objects toward the center of the Earth.","That is why things fall down when you drop them.","Gravity works without touching. It keeps us on the ground."],
        remember:"Gravity pulls everything down toward Earth." },
      { title:"Friction", art:'f_friction',
        text:["Friction is a force that happens when two surfaces rub together.","Friction slows things down and can stop them.","Rough surfaces (like carpet or sand) have more friction. Smooth surfaces (like ice) have less friction.","Rub your hands together fast. They feel warm. That is friction!"],
        remember:"Friction slows moving things. Rough surfaces = more friction." }
    ]
  },
  magnets: {
    intro: "Magnets seem like magic, but they are science! Let’s find out how they work.",
    slides: [
      { title:"What is a magnet?", art:'g_magnet',
        text:["A magnet is an object that can pull on some metals.","The pull of a magnet is called magnetic force.","Magnetic force can act without touching. A magnet can pull a paper clip from a little distance away."],
        remember:"Magnets pull on certain metals, even without touching." },
      { title:"Poles: North and South", art:'g_poles',
        text:["Every magnet has two poles: a north pole (N) and a south pole (S).","The magnetic force is strongest at the poles, near the ends.","If you break a magnet in half, each piece still has two poles."],
        remember:"Every magnet has a north pole and a south pole." },
      { title:"Attract and repel", art:'g_attract',
        text:["Opposite poles attract. That means N and S pull together.","Same poles repel. That means N and N push apart, and S and S push apart.","Attract = pull together. Repel = push apart."],
        remember:"Opposites attract. Likes repel." },
      { title:"Magnetic or not?", art:'g_materials',
        text:["Magnets attract things made of iron. They also attract nickel and cobalt. Steel has iron in it, so magnets attract steel too.","Magnets do NOT attract wood, plastic, glass, paper, rubber, or cloth.","Careful! Not all metals are magnetic. Aluminum foil, aluminum cans, and copper are NOT attracted to magnets."],
        remember:"Magnets attract iron and steel. Not every metal is magnetic." },
      { title:"Close is strong, far is weak", art:'g_distance',
        text:["The closer a magnet is to an object, the stronger the pull.","Far away, the pull is weak or not noticeable.","Magnetic force can pass through thin things like paper or cloth."],
        remember:"Magnetic force is stronger when the magnet is closer." },
      { title:"Earth is a giant magnet", art:'g_earth',
        text:["The Earth acts like a giant magnet.","A compass has a tiny magnet inside, called a needle. The needle lines up with Earth’s magnetism and points north.","That is how hikers and sailors find their way."],
        remember:"A compass needle is a magnet that points north." }
    ]
  },
  electro: {
    intro: "What happens when electricity and magnets team up? You get an ELECTROMAGNET!",
    slides: [
      { title:"Electricity can make magnetism", art:'e_wire',
        text:["When electric current flows through a wire, the wire makes a magnetic force around it.","A scientist named Hans Christian Ørsted noticed this in 1820.","Electric current is electricity that flows in a loop called a circuit."],
        remember:"Electric current makes a magnetic force." },
      { title:"Build an electromagnet", art:'e_build',
        text:["An electromagnet is a magnet made with electricity.","Wrap wire around an iron nail to make a coil. Connect the ends of the wire to a battery.","The current flows, and the nail becomes a magnet that can pick up paper clips."],
        remember:"Electromagnet = coil of wire + iron core + electric current." },
      { title:"It turns on and off!", art:'e_onoff',
        text:["An electromagnet only works while electric current flows.","Switch the current off, and the paper clips drop. Switch it on, and they stick again.","A regular magnet is always magnetic. You cannot turn it off."],
        remember:"You can turn an electromagnet on and off." },
      { title:"Make it stronger", art:'e_stronger',
        text:["More coils of wire make an electromagnet stronger.","More batteries (more current) make it stronger.","An iron core, like a nail, makes it stronger too."],
        remember:"More coils, more batteries, and an iron core = a stronger electromagnet." },
      { title:"Flip the poles", art:'e_flip',
        text:["An electromagnet has a north pole and a south pole, just like a regular magnet.","If you flip the battery around, the current goes the other way. The north and south poles switch places!","A regular magnet’s poles can never be switched this way."],
        remember:"Change the direction of the current to switch the poles." },
      { title:"Where do we use electromagnets?", art:'e_uses',
        text:["A junkyard crane uses a giant electromagnet to lift old cars. Turn it off and the car drops.","Electromagnets are inside doorbells, electric motors, speakers, and headphones.","Some fast trains float above the track using electromagnets."],
        remember:"Electromagnets help machines work because they can turn on and off." }
    ]
  }
};

/* ---------------- Vocabulary (flashcards, matching, fill-in-the-blank) ---------------- */
const SCI_VOCAB = [
  {w:'motion', s:'mo·tion', t:'motion', d:'When an object changes its position, it is moving.', ex:'A rolling ball is in motion.', e:'🏃'},
  {w:'position', s:'po·si·tion', t:'motion', d:'Where an object is.', ex:'The ball is next to the tree.', e:'📍'},
  {w:'speed', s:'speed', t:'motion', d:'How fast something moves.', ex:'A cheetah has a high speed.', e:'⚡'},
  {w:'direction', s:'di·rec·tion', t:'motion', d:'The way an object moves, like up, down, left, or right.', ex:'The kite moves in an upward direction.', e:'🧭'},
  {w:'pattern', s:'pat·tern', t:'motion', d:'Something that repeats the same way again and again.', ex:'A swing goes back and forth in a pattern.', e:'🔁'},
  {w:'predict', s:'pre·dict', t:'motion', d:'To say what you think will happen next.', ex:'I predict the swing will go back.', e:'🔮'},
  {w:'force', s:'force', t:'forces', d:'A push or a pull.', ex:'Kicking a ball is a force.', e:'💪'},
  {w:'push', s:'push', t:'forces', d:'A force that moves something away from you.', ex:'I push the door open.', e:'👉'},
  {w:'pull', s:'pull', t:'forces', d:'A force that moves something toward you.', ex:'I pull the wagon.', e:'🤏'},
  {w:'balanced', s:'bal·anced', t:'forces', d:'Equal forces from opposite sides that cancel out. Motion does not change.', ex:'A tug-of-war where nobody moves.', e:'⚖️'},
  {w:'unbalanced', s:'un·bal·anced', t:'forces', d:'Forces that are not equal. The motion changes.', ex:'One team pulls the rope their way.', e:'↔️'},
  {w:'gravity', s:'grav·i·ty', t:'forces', d:'A force that pulls things toward the Earth.', ex:'Gravity makes an apple fall.', e:'🍎'},
  {w:'friction', s:'fric·tion', t:'forces', d:'A force when surfaces rub. It slows things down.', ex:'Carpet has more friction than ice.', e:'🧱'},
  {w:'magnet', s:'mag·net', t:'magnets', d:'An object that pulls on some metals.', ex:'A magnet picks up a paper clip.', e:'🧲'},
  {w:'pole', s:'pole', t:'magnets', d:'The north or south end of a magnet, where the force is strongest.', ex:'Every magnet has two poles.', e:'📌'},
  {w:'attract', s:'at·tract', t:'magnets', d:'To pull together.', ex:'North and south poles attract.', e:'🤝'},
  {w:'repel', s:'re·pel', t:'magnets', d:'To push apart.', ex:'Two north poles repel.', e:'🙅'},
  {w:'magnetic', s:'mag·net·ic', t:'magnets', d:'Able to be pulled by a magnet.', ex:'An iron nail is magnetic.', e:'✅'},
  {w:'compass', s:'com·pass', t:'magnets', d:'A tool with a magnetic needle that points north.', ex:'A hiker uses a compass.', e:'🧭'},
  {w:'magnetic force', s:'mag·net·ic force', t:'magnets', d:'The push or pull of a magnet. It works without touching.', ex:'Magnetic force pulls a clip from far away.', e:'🌀'},
  {w:'electric current', s:'e·lec·tric cur·rent', t:'electro', d:'Electricity flowing through a wire.', ex:'Current flows from the battery.', e:'🔌'},
  {w:'circuit', s:'cir·cuit', t:'electro', d:'A complete loop that electricity can flow around.', ex:'A battery, wire, and bulb make a circuit.', e:'🔄'},
  {w:'battery', s:'bat·ter·y', t:'electro', d:'Something that stores energy and makes electric current flow.', ex:'The battery powers the flashlight.', e:'🔋'},
  {w:'coil', s:'coil', t:'electro', d:'Wire wrapped around and around in loops.', ex:'The wire is coiled around the nail.', e:'🌀'},
  {w:'electromagnet', s:'e·lec·tro·mag·net', t:'electro', d:'A magnet made by sending electric current through a coil of wire.', ex:'A crane uses an electromagnet.', e:'⚡'},
  {w:'iron core', s:'i·ron core', t:'electro', d:'An iron piece, like a nail, inside the coil that makes the electromagnet stronger.', ex:'The nail is the iron core.', e:'🔩'}
];

/* ---------------- Sort-it games (tap one of two buttons) ---------------- */
const SCI_SORTS = {
  pushpull: {
    title:'Push or Pull?', emoji:'🚪', blurb:'Is it a push or a pull?', labels:['Push','Pull'], colors:['#f97316','#3b82f6'],
    items:[
      {t:'Kicking a soccer ball', e:'⚽', a:0, why:'Your foot pushes the ball away from you.'},
      {t:'Pulling a wagon', e:'🛒', a:1, why:'You pull the wagon toward you as you walk.'},
      {t:'Tugging on a rope', e:'🪢', a:1, why:'Tugging brings the rope toward you. That is a pull.'},
      {t:'Pushing a shopping cart', e:'🛍️', a:0, why:'The cart moves away from you.'},
      {t:'Opening a drawer by the handle', e:'🗄️', a:1, why:'You pull the drawer toward you.'},
      {t:'Pressing a doorbell', e:'🔔', a:0, why:'Your finger pushes the button.'},
      {t:'Throwing a ball', e:'🤾', a:0, why:'Your hand pushes the ball away.'},
      {t:'Stretching a rubber band', e:'➰', a:1, why:'You pull the ends apart.'},
      {t:'Closing a door', e:'🚪', a:0, why:'You push the door shut.'},
      {t:'Zipping a zipper up', e:'🧥', a:1, why:'You pull the zipper tab up.'}
    ]
  },
  magnetic: {
    title:'Magnetic or Not?', emoji:'🧲', blurb:'Would a magnet stick to it?', labels:['Magnetic','Not magnetic'], colors:['#ef4444','#64748b'],
    items:[
      {t:'Iron nail', e:'🔩', a:0, why:'Iron is magnetic.'},
      {t:'Wooden pencil', e:'✏️', a:1, why:'Wood is not magnetic.'},
      {t:'Steel paper clip', e:'📎', a:0, why:'Steel has iron in it, so magnets attract it.'},
      {t:'Plastic spoon', e:'🥄', a:1, why:'Plastic is not magnetic.'},
      {t:'Aluminum foil', e:'🧻', a:1, why:'Aluminum is a metal, but it is NOT magnetic.'},
      {t:'Steel food can (like a soup can)', e:'🥫', a:0, why:'The can is made of steel, which has iron.'},
      {t:'Glass marble', e:'🔮', a:1, why:'Glass is not magnetic.'},
      {t:'Steel screw', e:'🔧', a:0, why:'Steel screws have iron, so they are magnetic.'},
      {t:'Rubber eraser', e:'🧽', a:1, why:'Rubber is not magnetic.'},
      {t:'Copper wire', e:'🧵', a:1, why:'Copper is a metal, but it is NOT magnetic.'},
      {t:'Aluminum soda can', e:'🥤', a:1, why:'Aluminum cans are not magnetic.'},
      {t:'Piece of paper', e:'📄', a:1, why:'Paper is not magnetic.'}
    ]
  },
  balance: {
    title:'Balanced or Unbalanced?', emoji:'⚖️', blurb:'Does the motion stay the same, or change?', labels:['Balanced','Unbalanced'], colors:['#10b981','#f59e0b'],
    items:[
      {t:'A tug-of-war where nobody moves', e:'🪢', a:0, why:'Equal pulls from both sides cancel out.'},
      {t:'A soccer ball being kicked', e:'⚽', a:1, why:'The kick is a bigger force, so the ball starts moving.'},
      {t:'A book resting on a table', e:'📘', a:0, why:'Gravity pulls down and the table pushes up equally.'},
      {t:'A car speeding up', e:'🚗', a:1, why:'Speeding up means the motion is changing.'},
      {t:'A parked car', e:'🅿️', a:0, why:'It is not changing its motion. The forces are balanced.'},
      {t:'A bike slowing down when the rider brakes', e:'🚲', a:1, why:'Slowing down is a change in motion.'},
      {t:'A toy boat floating still on a pond', e:'⛵', a:0, why:'Gravity down and water pushing up are balanced.'},
      {t:'An apple falling from a tree', e:'🍎', a:1, why:'Gravity is stronger than any force holding it, so it falls.'},
      {t:'A team that wins a tug-of-war', e:'🏆', a:1, why:'One team pulls harder, so the rope moves.'},
      {t:'A box sitting still on the floor', e:'📦', a:0, why:'Gravity pulls it down and the floor pushes it up equally.'}
    ]
  }
};

/* ---------------- Motion-pattern matching ---------------- */
const SCI_PATTERNS = [
  {t:'A child on a swing', e:'🛝', a:'back and forth'},
  {t:'A ball rolling down a hallway', e:'⚽', a:'straight line'},
  {t:'A merry-go-round', e:'🎠', a:'circle'},
  {t:'A basketball bouncing', e:'🏀', a:'up and down'},
  {t:'A skier going down a hill, turning left then right', e:'⛷️', a:'zig-zag'},
  {t:'A ceiling fan blade', e:'🌀', a:'circle'},
  {t:'A clock pendulum', e:'🕰️', a:'back and forth'},
  {t:'A yo-yo going down and coming back up', e:'🪀', a:'up and down'}
];
const SCI_PATTERN_CHOICES = ['straight line','back and forth','circle','up and down','zig-zag'];

/* ---------------- Cheat sheet ---------------- */
const SCI_CHEAT = {
  motion:[ 'Motion = changing position.', 'Position = where something is (compare to a landmark).', 'Patterns: straight, back and forth, circle, up and down, zig-zag.', 'Faster object = farther in the same time.', 'Patterns help us predict.' ],
  forces:[ 'Force = a push or a pull.', 'Forces can start, stop, speed up, slow down, or turn things.', 'Balanced forces = no change in motion.', 'Unbalanced forces = motion changes.', 'Gravity pulls down. Friction slows things; rough = more friction.' ],
  magnets:[ 'Every magnet has a north and a south pole.', 'Opposites attract. Likes repel.', 'Magnets attract iron and steel (not wood, plastic, glass, paper, aluminum, copper).', 'Closer = stronger pull. Works without touching.', 'A compass needle points north.' ],
  electro:[ 'Electric current makes magnetic force.', 'Electromagnet = coil of wire + iron core + battery.', 'It can turn on and off.', 'Stronger: more coils, more batteries, iron core.', 'Flip the battery and the poles switch.' ]
};
