/* ============================================================
   WriteCheck — a kind, kid-sized writing checker (offline)
   ------------------------------------------------------------
   WriteCheck.check(text, need) → {
     words, sentences,
     issues: [{ id, msg, tip, fix?: { from, to } }],   // things to fix
     wishes: [string],                                 // gentle "try this" ideas
     stars:  [string],                                 // specific praise
     ok                                                // no issues left
   }
   need = {
     min: 4,              // fewest words
     sentences: 1,        // fewest sentences
     use: ["because"],    // must use ONE of these words
     useAll: [...],       // must use ALL of these words
     marks: ["?", "!"],   // punctuation marks the writing must contain
     end: "?",            // the writing must end with this mark
     adj: 2,              // describing words needed (from ADJ)
     trans: 2,            // order/transition words needed (from TRANS)
     match: "I saw Sam at the park.",  // a fix-it sentence to copy correctly
     useHint: "…",        // friendlier message for a long `use` list
     team: ["ai","ay"],   // must use a word with one of these letter teams (phonics)
     ends: ["ed","ing"],  // …or a word ending like this
     starts: ["un","re"], // …or a word starting like this (prefixes)
     teamN: 2,            // how many different team words (default 1)
     teamHint: "…"        // message when the team words are missing
   }
   Feedback follows "two stars and a wish": praise what works, then one
   next step. Same file in readrocket/js and writestudio/js — keep both
   copies in sync.
   ============================================================ */
(function () {
  "use strict";

  /* common 3rd-grade misspellings → correct word */
  var SPELL = {
    becuase: "because", becaus: "because", beacuse: "because", becase: "because", bcause: "because", cuz: "because",
    frend: "friend", freind: "friend", frends: "friends", freinds: "friends", wuz: "was", woz: "was", sed: "said", siad: "said",
    thay: "they", thier: "their", wen: "when", wat: "what", whut: "what", wich: "which", wher: "where", were: null, whent: "went", wnet: "went",
    alot: "a lot", realy: "really", relly: "really", verry: "very", vary: null, skool: "school", scool: "school", shcool: "school",
    prity: "pretty", purty: "pretty", beutiful: "beautiful", butiful: "beautiful", beautifull: "beautiful", favrit: "favorite", favorit: "favorite",
    favrite: "favorite", tomorow: "tomorrow", tommorow: "tomorrow", tommorrow: "tomorrow", togehter: "together", togather: "together",
    agian: "again", agan: "again", aganst: "against", allways: "always", alwas: "always", allso: "also", aslo: "also", befor: "before",
    becuz: "because", coud: "could", cud: "could", shud: "should", shoud: "should", wud: "would", woud: "would", dident: "didn't",
    didnt: "didn't", dont: "don't", cant: "can't", wont: "won't", isnt: "isn't", im: "I'm", ive: "I've", ill: null, its: null,
    evry: "every", everthing: "everything", evrything: "everything", evryone: "everyone", enuf: "enough", enugh: "enough",
    finaly: "finally", frist: "first", fisrt: "first", furst: "first", gril: "girl", gurl: "girl", grate: null, hapy: "happy",
    happey: "happy", hafe: "have", haf: "have", hav: "have", heer: "here", hous: "house", howse: "house", insted: "instead",
    intresting: "interesting", knwo: "know", kno: "know", lauf: "laugh", laff: "laugh", libary: "library", liberry: "library",
    lik: "like", liek: "like", littel: "little", litle: "little", lov: "love", luv: "love", mabe: "maybe", mabey: "maybe",
    meny: "many", mony: "money", muther: "mother", mom: null, nite: "night", nigt: "night", nise: "nice", noone: "no one",
    ofen: "often", ohter: "other", peple: "people", poeple: "people", pepul: "people", pleez: "please", plese: "please",
    probly: "probably", realley: "really", rite: null, sayed: "said", sez: "says", scard: "scared", scaird: "scared",
    sumthing: "something", somthing: "something", sometime: null, sumtimes: "sometimes", somtimes: "sometimes", stoped: "stopped",
    shoping: "shopping", runing: "running", swiming: "swimming", siting: "sitting", geting: "getting", hiting: "hitting",
    stoppd: "stopped", suprise: "surprise", surprize: "surprise", teecher: "teacher", techer: "teacher", thru: "through",
    tho: "though", thot: "thought", thout: "thought", tryed: "tried", trys: "tries", untill: "until", vacashun: "vacation",
    wanna: "want to", gonna: "going to", gota: "got to", wach: "watch", watter: "water", wated: "waited", whale: null,
    wierd: "weird", wiht: "with", wif: "with", wont: null, writting: "writing", ryte: "write", yur: "your", yor: "your",
    yuo: "you", u: "you", ur: "your", r: "are", becomeing: "becoming", hopeing: "hoping", makeing: "making", takeing: "taking",
    comeing: "coming", haveing: "having", giveing: "giving", writeing: "writing", bak: "back", birthday: null, brithday: "birthday",
    berthday: "birthday", chocolat: "chocolate", choclate: "chocolate", dinosour: "dinosaur", dinasaur: "dinosaur",
    elefant: "elephant", animul: "animal", aminal: "animal", monkee: "monkey", piza: "pizza", pizzza: "pizza", sandwitch: "sandwich",
    samwich: "sandwich", brekfast: "breakfast", breakfest: "breakfast", diner: null, lunsh: "lunch", ate: null, eated: "ate",
    goed: "went", runned: "ran", throwed: "threw", catched: "caught", buyed: "bought", bringed: "brought", thinked: "thought",
    teached: "taught", maked: "made", taked: "took", seed: null, sayd: "said", gived: "gave", falled: "fell", drawed: "drew",
    swimmed: "swam", winned: "won", hurted: "hurt", feeled: "felt", sleeped: "slept", knowed: "knew", growed: "grew",
    mouses: "mice", foots: "feet", tooths: "teeth", childs: "children", mans: "men", womans: "women", sheeps: "sheep",
    fishs: "fish", wolfs: "wolves", leafs: "leaves", babys: "babies", partys: "parties", storys: "stories", puppys: "puppies",
    plaid: null, playd: "played", jumpt: "jumped", lookt: "looked", likt: "liked", wantid: "wanted", gost: "ghost", goast: "ghost",
    dragen: "dragon", draggon: "dragon", castel: "castle", rocit: "rocket", rockit: "rocket", planit: "planet", aliun: "alien",
    allien: "alien", monstur: "monster", monstor: "monster", princes: null, wizzard: "wizard", majic: "magic", magick: "magic",
    secrit: "secret", treshure: "treasure", tresure: "treasure", advenchure: "adventure", adventur: "adventure", beech: null,
    oshun: "ocean", ocian: "ocean", mountin: "mountain", montain: "mountain", forist: "forest", jungel: "jungle", desart: null,
    wether: null, wheather: "weather", sumer: "summer", wintur: "winter", spirng: "spring", autum: "autumn", holaday: "holiday",
    famly: "family", familly: "family", brother: null, bruther: "brother", sistr: "sister", sistur: "sister", grandma: null,
    grama: "grandma", granpa: "grandpa", dady: "daddy", cusin: "cousin", cuzin: "cousin", naybor: "neighbor", nabor: "neighbor"
  };
  /* tired words → juicier ones */
  var TIRED = {
    good: ["awesome", "terrific", "amazing", "delicious", "excellent"],
    nice: ["kind", "friendly", "lovely", "cheerful", "gentle"],
    bad: ["awful", "terrible", "horrible", "gross", "nasty"],
    big: ["huge", "giant", "enormous", "gigantic", "massive"],
    small: ["tiny", "little", "teeny", "miniature"],
    fun: ["exciting", "thrilling", "awesome", "a blast"],
    happy: ["joyful", "thrilled", "cheerful", "delighted"],
    sad: ["upset", "gloomy", "heartbroken", "unhappy"],
    said: ["shouted", "whispered", "giggled", "asked", "cried"],
    went: ["raced", "zoomed", "strolled", "dashed", "tiptoed"],
    cool: ["awesome", "amazing", "incredible"],
    pretty: ["beautiful", "gorgeous", "sparkly", "lovely"]
  };
  /* describing words a 3rd grader is likely to use */
  var ADJ = ("big small little tiny huge giant enormous gigantic tall short long fat thin skinny wide round flat square " +
    "red orange yellow green blue purple pink brown black white gray grey golden silver rainbow colorful sparkly shiny dark bright " +
    "hot cold warm cool icy chilly freezing wet dry soft hard smooth rough bumpy fuzzy fluffy furry hairy sticky slimy squishy crunchy " +
    "crispy juicy sweet sour salty spicy yummy delicious tasty gross stinky smelly fresh loud quiet noisy silent " +
    "happy sad mad angry glad grumpy silly funny goofy scared afraid brave shy proud kind mean nice friendly gentle polite rude " +
    "lazy busy sleepy tired hungry thirsty excited nervous calm curious clever smart wise strong weak fast slow quick " +
    "old new young ancient beautiful pretty ugly cute adorable lovely gorgeous messy clean neat dirty muddy dusty empty full " +
    "heavy light awesome amazing terrific wonderful fantastic great good bad terrible awful horrible best worst favorite special " +
    "magic magical mysterious secret spooky creepy scary weird strange wild huge cozy comfy fancy plain wiggly giggly " +
    "joyful cheerful gloomy thrilled delighted upset stormy sunny cloudy rainy windy snowy foggy").split(" ");
  var TRANS = ["first", "next", "then", "after", "afterward", "later", "finally", "last", "lastly", "second", "third",
               "before", "meanwhile", "suddenly", "also", "another", "one day", "at last", "in the end", "because", "so"];
  var QWORDS = /^(who|what|where|when|why|how|which|can|could|do|does|did|is|are|am|was|were|will|would|should|have|has)\b/i;

  function words(t) { return (String(t).match(/[A-Za-z][A-Za-z'’-]*/g) || []); }
  function lower(w) { return w.toLowerCase().replace(/’/g, "'"); }
  function splitSentences(t) {
    var s = String(t).replace(/\s+/g, " ").trim();
    if (!s) return [];
    var out = [];
    s.match(/[^.!?]+[.!?]*["”’)]*/g).forEach(function (x) {
      x = x.trim(); if (!x) return;
      // “Stop!” she yelled. → one sentence, not two
      if (out.length && /[!?,]["”’]$/.test(out[out.length - 1]) && /^[a-z]/.test(x)) out[out.length - 1] += " " + x;
      else out.push(x);
    });
    return out;
  }
  function capFirst(s) { return s.replace(/^(["“‘(]*)([a-z])/, function (_, q, c) { return q + c.toUpperCase(); }); }
  function hasWord(list, set) { for (var i = 0; i < list.length; i++) if (set.indexOf(list[i]) >= 0) return list[i]; return null; }
  function has(text, phrase) { return new RegExp("\\b" + phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(text); }

  function check(text, need) {
    need = need || {};
    var t = String(text || "").replace(/\s+/g, " ").trim();
    var ws = words(t), lw = ws.map(lower), sents = splitSentences(t);
    var issues = [], wishes = [], stars = [];
    var min = need.min || 4;

    // --- copy-it-right (Fix-It Doctor) ---
    if (need.match) {
      var want = need.match.replace(/\s+/g, " ").trim();
      if (t === want) stars.push("You fixed every mistake. Doctor-level editing!");
      else {
        var tw = words(t), ww = words(want);
        for (var i = 0; i < ww.length; i++) {
          if (tw[i] === ww[i]) continue;
          if (tw[i] && lower(tw[i]) === lower(ww[i])) { issues.push({ id: "case", msg: "Check the capital letters on “" + tw[i] + "”.", tip: "Names, the word I, and the first word of a sentence get capitals." }); break; }
          issues.push({ id: "match", msg: "Look again near “" + (tw[i] || "the end") + "”.", tip: "Compare your sentence with the one in the box, word by word." }); break;
        }
        if (!issues.length && tw.length > ww.length) issues.push({ id: "match", msg: "You have an extra word at the end.", tip: "Compare word by word." });
        if (!issues.length && t.slice(-1) !== want.slice(-1)) issues.push({ id: "end", msg: "Check the mark at the very end.", tip: "Is it telling (.), asking (?) or WOW (!)?" });
        if (!issues.length) issues.push({ id: "match", msg: "So close! Check the spaces and marks.", tip: "Compare your sentence with the one in the box." });
      }
      return { words: ws.length, sentences: sents.length, issues: issues, wishes: [], stars: stars, ok: !issues.length };
    }

    if (ws.length === 0) {
      issues.push({ id: "empty", msg: "Your page is empty! Every great writer starts with one word.", tip: "Think it, say it, then write it." });
      return { words: 0, sentences: 0, issues: issues, wishes: wishes, stars: stars, ok: false };
    }

    // --- spelling ---
    var seenSp = {};
    ws.forEach(function (w) {
      var k = lower(w), fix = SPELL[k];
      if (fix && !seenSp[k]) {
        seenSp[k] = true;
        if (k === "u" || k === "r" || k === "ur" || k === "cuz") issues.push({ id: "spell", msg: "Write “" + fix + "” instead of “" + w + "”. Texting words don't go in sentences!", fix: { from: w, to: fix } });
        else if (/ed$/.test(k) && fix.indexOf("ed") < 0) issues.push({ id: "spell", msg: "“" + w + "” is a tricky one! We say “" + fix + "”.", tip: "Some action words change instead of adding -ed.", fix: { from: w, to: fix } });
        else issues.push({ id: "spell", msg: "Spelling check: “" + w + "” is spelled “" + fix + "”.", fix: { from: w, to: fix } });
      }
    });
    // lowercase i on its own
    if (/(^|[^A-Za-z'’])i([^A-Za-z'’]|$)/.test(t) || /(^|\s)i['’](m|ve|ll|d)\b/.test(t))
      issues.push({ id: "i", msg: "When you write about yourself, “I” is always a capital letter.", fix: { from: "i", to: "I" } });
    // doubled words
    for (var d = 1; d < lw.length; d++) if (lw[d] === lw[d - 1] && lw[d] !== "very" && lw[d] !== "ha" && lw[d] !== "no") {
      issues.push({ id: "double", msg: "Oops, “" + ws[d] + " " + ws[d] + "”: the same word twice in a row.", fix: { from: ws[d] + " " + ws[d], to: ws[d] } }); break;
    }
    // capitals at the start of each sentence
    var lowStart = sents.filter(function (s) { return /^["“‘(]*[a-z]/.test(s); });
    if (lowStart.length) issues.push({ id: "cap", msg: lowStart.length === sents.length && sents.length === 1 ? "Start your sentence with a capital letter." : "Each sentence starts with a capital letter. Look at “" + words(lowStart[0])[0] + "”.", fix: { from: "cap", to: "cap" } });
    // missing space after a mark
    if (/[a-z][.!?,][A-Za-z]/.test(t)) issues.push({ id: "space", msg: "Leave a space after a period or comma, so the words can breathe.", fix: { from: "space", to: "space" } });
    // end mark
    if (!/[.!?]["”’)]*$/.test(t)) issues.push({ id: "end", msg: "Every sentence needs a stop sign at the end: a period (.), a question mark (?) or an exclamation mark (!).", fix: { from: "end", to: "end" } });
    else if (need.end && t.replace(/["”’)]+$/, "").slice(-1) !== need.end)
      issues.push({ id: "endtype", msg: need.end === "?" ? "This one should be an asking sentence. End it with a question mark (?)." : need.end === "!" ? "Make it a WOW sentence! End it with an exclamation mark (!)." : "End it with a period (.).", fix: { from: "endtype", to: need.end } });
    // asking words but a period → a gentle wish, not an error
    if (!need.end && ws.length > 2 && sents.some(function (x) { return QWORDS.test(x.replace(/^["“‘(]+/, "")) && /\.$/.test(x); }))
      wishes.push("One sentence starts like a question. Should it end with a question mark (?)");

    // --- length & sentence count ---
    if (ws.length < min) issues.push({ id: "short", msg: ws.length < 3 ? "That's a start! Tell me more: who did what?" : "Add " + (min - ws.length) + " more word" + (min - ws.length > 1 ? "s" : "") + ". Tell me where, when, or how!", tip: "Try adding a describing word, or where it happened." });
    var needS = need.sentences || 1;
    if (sents.length < needS) issues.push({ id: "sents", msg: "Write " + needS + " sentences. You have " + sents.length + " so far.", tip: "End each sentence with a mark, then start the next with a capital." });
    // run-on: too many ands, or one very long sentence
    sents.forEach(function (s) {
      var sw = words(s).map(lower), ands = sw.filter(function (w) { return w === "and"; }).length;
      if ((ands >= 3 || sw.length > 30) && wishes.length < 3) wishes.push("“" + words(s).slice(0, 4).join(" ") + "…” is a run-on train! Try ending it and starting a new sentence.");
    });

    // --- the lesson's goal ---
    if (need.use && need.use.length) {
      var used = need.use.filter(function (u) { return has(t, u); })[0];
      var spelt = issues.filter(function (x) { return x.id === "spell" && need.use.indexOf(x.fix.to) >= 0; }).length;
      if (!used && !spelt) issues.push({ id: "use", msg: need.useHint ? need.useHint : need.use.length === 1 ? "Use the word “" + need.use[0] + "” in your writing." : "Use one of these words: " + need.use.join(", ") + "." });
      else if (used) stars.push("You used “" + used + "”, just like a pro writer!");
    }
    if (need.team || need.ends || need.starts) {
      var tw2 = lw.filter(function (w, i) {
        return lw.indexOf(w) === i && ((need.team || []).some(function (x) { return w.indexOf(x) >= 0; }) ||
          (need.ends || []).some(function (x) { return w.length > x.length + 1 && w.slice(-x.length) === x; }) ||
          (need.starts || []).some(function (x) { return w.length > x.length + 2 && w.indexOf(x) === 0 && !NOT_PREFIX[w]; }));
      }), tn = need.teamN || 1;
      if (tw2.length < tn) issues.push({ id: "team", msg: need.teamHint || "Use a word with " + (need.team || need.ends || need.starts).join(" or ") + " in it." });
      else stars.push("“" + tw2.slice(0, tn).join("” and “") + "”: great spelling-pattern words!");
    }
    if (need.useAll) need.useAll.forEach(function (u) { if (!has(t, u)) issues.push({ id: "use", msg: "Don't forget to use “" + u + "”." }); });
    if (need.marks) {   // punctuation the writing must use, e.g. ["?", "!"]
      var NAMES = { "?": "a question mark (?)", "!": "an exclamation mark (!)", ",": "a comma (,)" };
      var miss = need.marks.filter(function (m) { return t.indexOf(m) < 0; });
      if (miss.length) issues.push({ id: "use", msg: "Use " + miss.map(function (m) { return NAMES[m] || m; }).join(" and ") + "." });
      else stars.push("Great punctuation! Your reader will hear your voice.");
    }
    var adjs = lw.filter(function (w, i) { return ADJ.indexOf(w) >= 0 && lw.indexOf(w) === i; })
      .sort(function (a, b) { return (TIRED[a] ? 1 : 0) - (TIRED[b] ? 1 : 0); });   // praise the juicy ones first
    if (need.adj) {
      if (adjs.length < need.adj) issues.push({ id: "adj", msg: "Add " + (need.adj - adjs.length) + " more describing word" + (need.adj - adjs.length > 1 ? "s" : "") + ". How does it look, feel, smell, taste or sound?", tip: "Describing words paint a picture in the reader's mind." });
      else stars.push("Describing words like “" + adjs.slice(0, 2).join("” and “") + "” paint a picture!");
    }
    var trans = TRANS.filter(function (w) { return has(t, w); });
    if (need.trans) {
      if (trans.length < need.trans) issues.push({ id: "trans", msg: "Use " + need.trans + " order words like First, Next, Then, or Finally.", tip: "Order words help the reader follow along." });
      else stars.push("Order words like “" + trans.slice(0, 2).join("” and “") + "” make it easy to follow!");
    }

    // --- stars: specific, honest praise ---
    if (!issues.some(function (x) { return x.id === "cap" || x.id === "end"; }) && ws.length >= 3) stars.push(sents.length > 1 ? "Every sentence has a capital and a stop sign!" : "Capital at the start, stop sign at the end. Perfect sentence shape!");
    if (ws.length >= 12 && sents.length === 1) stars.push("What a long, detailed sentence!");
    else if (ws.length >= 8 && !need.adj) stars.push("Lots of detail. I can picture it!");
    var fresh = adjs.filter(function (a) { return !TIRED[a]; });
    if (!need.adj && fresh.length && stars.length < 3) stars.push("“" + fresh[0] + "” is a great describing word.");
    var glue = ["because", "but", "so", "when", "if", "while", "after", "before"].filter(function (g) { return lw.indexOf(g) >= 0; })[0];
    if (glue && !(need.use && need.use.indexOf(glue) >= 0) && stars.length < 3) stars.push("Nice glue word: “" + glue + "”!");
    if (/!/.test(t) && stars.length < 3) stars.push("That exclamation mark shows real feeling!");
    if (/["“]/.test(t) && stars.length < 3) stars.push("Talking marks! Your characters speak!");
    if (!stars.length) stars.push("You put your own ideas into words. That's what writers do!");

    // --- wishes: one next step, not a pile of red ink ---
    var tired = lw.filter(function (w) { return TIRED[w]; })[0];
    if (tired && !need.match) wishes.push("“" + tired + "” is a tired word. Could you try " + TIRED[tired].slice(0, 3).join(", ") + "?");
    if (sents.length >= 3) {
      var firsts = sents.map(function (s) { return lower(words(s)[0] || ""); });
      var same = firsts.filter(function (f) { return f === firsts[0]; }).length;
      if (same >= 3) wishes.push("Lots of sentences start with “" + words(sents[0])[0] + "”. Try starting one with First, Then, Suddenly or After that.");
    }
    if (!need.adj && !adjs.length && ws.length >= 4 && wishes.length < 2) wishes.push("Add a describing word to paint a picture: big, sparkly, stinky, cozy…");

    // fix the big things first, and never more than three notes at once
    var ORDER = ["empty", "short", "sents", "use", "team", "adj", "trans", "endtype", "cap", "end", "i", "spell", "double", "space"];
    issues.sort(function (a, b) { return ORDER.indexOf(a.id) - ORDER.indexOf(b.id); });
    return { words: ws.length, sentences: sents.length, issues: issues.slice(0, 3), more: Math.max(0, issues.length - 3), wishes: wishes.slice(0, 2), stars: stars.slice(0, 2), ok: !issues.length };
  }

  // apply one automatic fix to the text (used by the 🔧 button)
  function applyFix(text, issue) {
    var f = issue.fix; if (!f) return text;
    var t = String(text);
    if (issue.id === "cap") return t.replace(/(^|[.!?]\s+)(["“‘(]*)([a-z])/g, function (_, a, q, c) { return a + q + c.toUpperCase(); });
    if (issue.id === "space") return t.replace(/([a-z])([.!?,])([A-Za-z])/g, "$1$2 $3");
    if (issue.id === "end") return t.replace(/\s+$/, "") + (QWORDS.test(t.trim()) ? "?" : ".");
    if (issue.id === "endtype") return t.replace(/\s+$/, "").replace(/[.!?]+(["”’)]*)$/, f.to + "$1");
    if (issue.id === "i") return t.replace(/(^|[^A-Za-z'’])i(?=[^A-Za-z]|$)/g, "$1I").replace(/(^|\s)i(['’])/g, "$1I$2");
    var re = new RegExp("\\b" + f.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g");
    return t.replace(re, function (m) { return /^[A-Z]/.test(m) && f.to !== "I" ? capFirst(f.to) : f.to; });
  }

  // words that only LOOK like they start with a prefix (un-, re-)
  var NOT_PREFIX = {};
  ("under understand uncle uncles until unit units universe unicorn unicorns uniform unique union unless " +
   "read reads reading ready real really red rest reason recess record recipe report reptile region remember rescue reach").split(" ")
    .forEach(function (w) { NOT_PREFIX[w] = 1; });

  window.WriteCheck = { check: check, applyFix: applyFix, words: words, sentences: splitSentences, ADJ: ADJ, TIRED: TIRED };
})();
