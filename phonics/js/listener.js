/* ============================================================
   Phonics Pals — the Listener
   ------------------------------------------------------------
   Uses the browser's speech recognition (Chrome / Edge / Safari)
   to hear the child read, then lines the heard words up against
   the page text so each word can be marked read / not yet read.

   Kid speech + names like "Al" trip recognisers up, so matching
   is deliberately forgiving: exact words, known sound-alikes and
   one-letter slips that keep the first sound all count. What is
   left over is a word the child genuinely skipped or swapped —
   those become gentle "let's practise" words, never "wrong".

   Listener.supported()                 → bool
   Listener.tokens(text)                → ["al","is","big", ...]
   Listener.align(targetTokens, heard)  → { hits:[bool], heardAny }
   Listener.start({ target, onUpdate, onDone, onError, single, level })
     level 1–4 = the reading level (../js/readlevel.js); 4 = Expert, the
     strict rules. onDone gets { hits (at that level), levels:[l1..l4],
     heardAny, transcript }.
   Listener.stop()
   ============================================================ */
(function () {
  "use strict";
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  // sound-alikes the recogniser tends to return for these story words
  var ALIKE = {
    al: ["all", "owl", "hal", "el", "ale", "l", "ow", "ali", "allen", "ol", "awl", "elle", "alle", "out", "oh"],
    dot: ["dott", "dots", "dawt", "dought", "da"],
    tom: ["tommy", "thom", "tum", "tam", "tomb"],
    tim: ["team", "tin", "tem", "kim", "jim", "tym", "timmy"],
    tag: ["tack", "tad", "tagg"],
    bob: ["bop", "bobby", "bub", "rob", "bobb"],
    sam: ["sammy", "some", "psalm", "sim"],
    pip: ["pep", "pick", "pipp", "peep"],
    pep: ["pip", "pet", "pepp", "peb", "hep"],
    jet: ["jeff", "jett", "chet", "jed", "jets"],
    get: ["git", "gets", "gat"],
    hot: ["hut", "hat", "hop", "har"],
    dog: ["dogs", "dock", "dawg"],
    pop: ["pup", "pops", "bop", "pap"],
    pup: ["pop", "pub", "puppy", "pups"],
    mud: ["mug", "mutt", "mood"],
    tug: ["tog", "tuck", "dug"],
    bug: ["bag", "book", "bugs", "buck"],
    nip: ["nap", "nipp", "knit", "nick"],
    tip: ["tap", "tipp", "type", "dip"],
    dip: ["deep", "dipp", "tip", "dib"],
    tin: ["ten", "tim", "teen", "thin"],
    mitt: ["mit", "mid", "meet", "mint", "mitts", "met"],
    pit: ["pet", "pitt", "pete", "bit"],
    lid: ["lead", "lit", "led", "kid"],
    mat: ["matt", "mad", "map", "met"],
    pat: ["pet", "patt", "pad", "pot"],
    nap: ["knap", "nab", "map", "snap"],
    has: ["hes", "haz"],
    his: ["hiss", "he's"],
    had: ["head", "hadd"],
    hid: ["hit", "head", "hide", "kid", "hood"],
    hit: ["hid", "heat", "hip"],
    hat: ["that", "hats", "hut"],
    sad: ["said", "sed"],
    sat: ["set", "sap", "sa"],
    sit: ["set", "seat", "sid"],
    fit: ["fat", "feet", "fist", "fid"],
    big: ["bag", "bigg"],
    pig: ["pick", "peg"],
    dig: ["deg", "dick"],
    digs: ["dig", "dicks", "digg"],
    dug: ["dog", "doug", "duck"],
    ran: ["rann", "ron", "rain"],
    runs: ["rums", "rons"],
    run: ["won", "rum"],
    got: ["god", "gut", "goat", "gotta"],
    not: ["knot", "nod", "nut", "night"],
    top: ["tap", "tops", "stop"],
    can: ["kin", "ken", "cam", "can't"],
    man: ["men", "mann", "mon"],
    mad: ["matt", "mat", "made"],
    bus: ["buss", "boss", "bust", "plus"],
    fun: ["fan", "fund", "phone", "son"],
    sun: ["son", "some", "sum"],
    up: ["op", "app", "upp"],
    on: ["an", "own"],
    of: ["off", "uh", "love"],
    to: ["two", "too", "do"],
    the: ["duh", "thee", "da"],
    a: ["uh", "ah"],
    and: ["n", "end"],
    is: ["as", "it's", "its"],
    it: ["eat", "its"],
    in: ["end"],
    was: ["is", "wuz", "what's", "does"],
    at: ["add", "that"],
    no: ["know", "now", "noh"],
    go: ["goes", "goh", "girl"],
    bit: ["but", "bid", "beat", "pit"],
    him: ["hymn", "em", "them", "hem"],
    pal: ["pow", "pull", "pail", "pell", "pals", "paul", "pale"],
    lot: ["lots", "light", "lad"],
    cat: ["kat", "cut", "kit", "caught"],
    bag: ["back", "beg", "big", "bug"],
    log: ["lug", "logs", "dog"],
    red: ["read", "rad", "ret"],
    lost: ["last", "loss", "lust"],
    "—": []
  };
  var COMPOUND = { hotdog: ["hot", "dog"], hotdogs: ["hot", "dog"], cannot: ["can", "not"], "can't": ["can", "not"], cant: ["can", "not"],
                   tinjet: ["tin", "jet"], alot: ["a", "lot"], "it's": ["it", "is"], "tim's": ["tim", "is"], "al's": ["al", "is"] };

  function norm(w) { return String(w).toLowerCase().replace(/[’]/g, "'").replace(/[^a-z']/g, "").replace(/^'+|'+$/g, ""); }
  function tokens(text) { return String(text).split(/\s+/).map(norm).filter(Boolean); }
  function expand(list) {
    var out = [];
    list.forEach(function (w) { if (COMPOUND[w]) out.push.apply(out, COMPOUND[w]); else out.push(w.replace(/'s$/, "")); });
    return out;
  }
  function lev(a, b) {
    var m = a.length, n = b.length, d = [], i, j;
    for (i = 0; i <= m; i++) { d[i] = [i]; }
    for (j = 1; j <= n; j++) d[0][j] = j;
    for (i = 1; i <= m; i++) for (j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[m][n];
  }
  // spelling-to-sound key ("cat" = "kat", "phone" = "fone", vowels ignored).
  // Used only on the easier reading levels.
  function soundKey(w) {
    w = String(w).replace(/'/g, "")
      .replace(/^kn/, "n").replace(/^wr/, "r").replace(/^wh/, "w")
      .replace(/ph/g, "f").replace(/tch/g, "ch").replace(/ck/g, "k").replace(/gh/g, "").replace(/dg/g, "j")
      .replace(/c(?=[eiy])/g, "s").replace(/[cq]/g, "k").replace(/x/g, "ks").replace(/z/g, "s")
      .replace(/(.)\1+/g, "$1");
    if (!w) return "";
    return (/[aeiouy]/.test(w[0]) ? "a" : w[0]) + w.slice(1).replace(/[aeiouy]/g, "");
  }
  var ENDS = ["s", "es", "ed", "d", "ing", "er", "y"];
  function endingSlip(t, h) { for (var i = 0; i < ENDS.length; i++) if (h === t + ENDS[i] || t === h + ENDS[i]) return true; return false; }

  // vocab = every word in the book: hearing a DIFFERENT story word (dog for
  // Dot, had for hat) is a real swap, so the fuzzy rule must not excuse it.
  // lv = reading level: 4 Expert (these strict rules), 3 small slips anywhere
  // and word endings, 2 + sound-alikes and two slips in long words, 1 + the
  // right start and about half the word.
  function same(target, heard, vocab, lv) {
    lv = lv || 4;
    if (target === heard) return true;
    if (heard === target + "s" || target === heard + "s") return true;
    var a = ALIKE[target];
    if (a && a.indexOf(heard) >= 0) return true;
    var d = lev(target, heard), first = heard[0] === target[0];
    if (lv >= 4) {
      if (vocab && vocab[heard]) return false;
      // one-letter slip that keeps the first sound (kid speech / accent)
      return target.length >= 3 && heard.length >= 2 && first && d <= 1;
    }
    if (endingSlip(target, heard)) return true;
    var keyEq = soundKey(target) === soundKey(heard);
    if (vocab && vocab[heard] && !(lv === 1 && (first || keyEq)) && !(lv === 2 && keyEq)) return false;
    if (target.length >= 3 && heard.length >= 2 && d <= 1) return true;
    if (lv >= 3) return false;
    if (keyEq && target.length >= (lv === 1 ? 2 : 4)) return true;
    if (target.length >= 5 && d <= 2) return true;
    if (lv >= 2) return false;
    if (first && d <= Math.max(1, Math.floor(target.length / 2))) return true;
    return target.length <= 3 && first && heard.length <= 4;
  }
  // easy levels: a little word the recogniser dropped between two words the
  // child did read counts too (level 1 any word of 1–3 letters, level 2 only
  // the, a, of, to …)
  var LITTLE = { a: 1, an: 1, the: 1, of: 1, to: 1, and: 1, is: 1, in: 1, on: 1, at: 1, it: 1, i: 1 };
  function fillGaps(target, hits, lv) {
    if (lv > 2) return hits;
    for (var i = 1; i < target.length - 1; i++)
      if (!hits[i] && hits[i - 1] && hits[i + 1] && (lv === 1 ? target[i].length <= 3 : LITTLE[target[i]])) hits[i] = true;
    return hits;
  }

  /* Longest-common-subsequence alignment (target vs heard).
     Returns which target words were heard, in order. */
  function align(target, heardList, vocab, lv, memo) {
    lv = lv || 4; memo = memo || {};
    function eq(t, h) { var k = lv + " " + t + " " + h; if (!(k in memo)) memo[k] = same(t, h, vocab, lv); return memo[k]; }
    var heard = expand(heardList.map(norm).filter(Boolean));
    var m = target.length, n = heard.length, L = [], i, j;
    for (i = 0; i <= m; i++) { L[i] = []; for (j = 0; j <= n; j++) L[i][j] = 0; }
    for (i = m - 1; i >= 0; i--) for (j = n - 1; j >= 0; j--)
      L[i][j] = eq(target[i], heard[j]) ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
    var hits = target.map(function () { return false; });
    i = 0; j = 0;
    while (i < m && j < n) {
      if (eq(target[i], heard[j]) && L[i][j] === 1 + L[i + 1][j + 1]) { hits[i] = true; i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) i++;
      else j++;
    }
    if (n > 0) fillGaps(target, hits, lv);
    return { hits: hits, heardAny: n > 0, heard: heard };
  }

  /* ---------------- live session ---------------- */
  var rec = null, active = null;

  function stop() {
    if (rec) { try { rec.stop(); } catch (e) {} }
  }

  function start(opt) {
    if (!SR) { opt.onError && opt.onError("unsupported"); return; }
    if (rec) { rec._dead = true; try { rec.abort(); } catch (e) {} rec = null; }
    var target = opt.target;                 // normalised tokens
    var single = !!opt.single;
    var r = new SR();
    r.lang = "en-US";
    r.continuous = !single;
    r.interimResults = true;
    r.maxAlternatives = 5;
    rec = r;

    var finals = [];          // array of arrays of alternatives (strings)
    var interim = "";
    var lvl = Math.max(1, Math.min(4, Math.round(opt.level) || 4)), memo = {};
    var bestL = [1, 2, 3, 4].map(function () { return target.map(function () { return false; }); });
    var best = bestL[lvl - 1];
    var lastHeard = 0, started = Date.now(), done = false, timer = null, errored = null;
    var maxMs = single ? 6000 : 7000 + target.length * 1200;

    function evaluate() {
      // union of hits across every alternative of every final chunk + interim
      var base = finals.map(function (alts) { return alts[0] || ""; });
      var cands = [base.concat([interim]).join(" ")];
      finals.forEach(function (alts, k) {
        for (var a = 1; a < alts.length; a++) {
          var c = base.slice(); c[k] = alts[a]; cands.push(c.concat([interim]).join(" "));
        }
      });
      var any = false;
      cands.forEach(function (c) {
        var words = c.split(/\s+/);
        for (var L = 1; L <= 4; L++) {
          var res = align(target, words, opt.vocab, L, memo);
          if (res.heardAny) any = true;
          res.hits.forEach(function (h, i) { if (h) bestL[L - 1][i] = true; });
        }
      });
      return any;
    }
    function allHit() { return best.every(Boolean); }
    function finish() {
      if (done) return; done = true;
      clearInterval(timer);
      if (active === r) active = null;
      var heardAny = evaluate() || finals.length > 0;
      if (errored && !heardAny) { opt.onError && opt.onError(errored); return; }
      opt.onDone && opt.onDone({ hits: best.slice(), levels: bestL.map(function (b) { return b.slice(); }), level: lvl, heardAny: heardAny, transcript: finals.map(function (a) { return a[0]; }).join(" ") + " " + interim });
    }

    r.onresult = function (ev) {
      if (r._dead) return;
      interim = "";
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        var res = ev.results[i];
        if (res.isFinal) {
          var alts = [];
          for (var a = 0; a < res.length; a++) alts.push(res[a].transcript);
          finals.push(alts);
        } else interim += " " + res[0].transcript;
      }
      lastHeard = Date.now();
      evaluate();
      opt.onUpdate && opt.onUpdate(best.slice(), (finals.map(function (a) { return a[0]; }).join(" ") + " " + interim).trim());
      if (allHit()) setTimeout(stop, single ? 150 : 500);
    };
    r.onerror = function (e) { errored = e.error || "error"; };
    r.onend = function () {
      if (r._dead) { done = true; clearInterval(timer); if (active === r) active = null; return; }
      // Chrome sometimes ends early on a pause — keep listening if the child
      // hasn't finished and we are still inside the time budget.
      if (!done && !single && !errored && !allHit() && Date.now() - started < maxMs && active === r && !r._stopAsked) {
        try { r.start(); return; } catch (e) {}
      }
      finish();
    };
    var origStop = r.stop.bind(r);
    r.stop = function () { r._stopAsked = true; origStop(); };

    timer = setInterval(function () {
      var now = Date.now();
      var quiet = lastHeard ? now - lastHeard : now - started;
      if (now - started > maxMs || (lastHeard && quiet > (single ? 1300 : 2600)) || (!lastHeard && quiet > (single ? 5000 : 8000))) {
        clearInterval(timer); r.stop();
      }
    }, 250);

    active = r;
    try { r.start(); opt.onStart && opt.onStart(); }
    catch (e) { done = true; clearInterval(timer); opt.onError && opt.onError("start"); }
  }

  window.Listener = {
    supported: function () { return !!SR; },
    tokens: tokens,
    norm: norm,
    align: align,
    same: same,
    start: start,
    stop: stop,
    isActive: function () { return !!active; }
  };
})();
