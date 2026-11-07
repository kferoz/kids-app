/* ============================================================
   ReadLevel — reading levels for the read-aloud apps
   ------------------------------------------------------------
   Kids found the listener too strict: one wobbly sound and they
   heard "Close!" or "Good try!" instead of a win. Each learner now
   reads at a level, from forgiving to grade level:

     1 🐣 Brave Beginner  close words count, a 2nd brave try counts
     2 🧭 Word Explorer   sound-alike words count
     3 ⭐ Super Reader    small slips count, every word must be there
     4 🏆 Expert Reader   grade level: the strict listener (as before)

   Listener.start({ level }) does the matching for every level at
   once (res.levels[0..3]); this file decides what counts, keeps the
   score and hands out level-ups and Brave badges.

   Level up: earn ⚡ power by reading as well as the NEXT level wants
   (a page/paragraph read ≥ 90% at the next level's rules = +4, a
   word right first time at the next level = +1). 16 ⚡ = level up.
   Levels never drop by themselves; the child (any unlocked level)
   or a grown-up (Admin → 🎤 Reading Levels) can change it.

   Storage: rl_<app> per learner (profile-store namespaces it):
     { lv, max, fuel, brave, badges:[id], ups:[time] }
   Prize Wheel tickets go to the shared rw_tickets.
   ============================================================ */
(function () {
  "use strict";

  var LEVELS = [
    { n: 1, id: "starter", emoji: "🐣", name: "Brave Beginner", tag: "Easy", color: "#40c057",
      say: "Close words count, and a brave second try always counts!", acc: [0.7, 0.4], speed: 0.6, practice: 1 },
    { n: 2, id: "explorer", emoji: "🧭", name: "Word Explorer", tag: "Medium", color: "#1c7ed6",
      say: "Words that sound close still count. Say each word clearly!", acc: [0.85, 0.6], speed: 0.75, practice: 2 },
    { n: 3, id: "super", emoji: "⭐", name: "Super Reader", tag: "Hard", color: "#f08c00",
      say: "Small slips are OK, but read every word.", acc: [0.95, 0.75], speed: 0.9, practice: 3 },
    { n: 4, id: "expert", emoji: "🏆", name: "Expert Reader", tag: "Expert", color: "#e03131",
      say: "Grade-level reading: say every word just right.", acc: null, speed: 1, practice: 3 }
  ];
  var NEED = 16, READ_FUEL = 4, WORD_FUEL = 1, GREAT = 0.9;
  var BADGES = [
    { n: 3, id: "brave-3", emoji: "💪", name: "Brave Try" },
    { n: 10, id: "brave-10", emoji: "🦁", name: "Lion Heart" },
    { n: 25, id: "brave-25", emoji: "🌈", name: "Never Give Up" },
    { n: 50, id: "brave-50", emoji: "🦸", name: "Reading Hero" },
    { n: 100, id: "brave-100", emoji: "🌟", name: "Brave Legend" }
  ];
  var PRAISE = {
    close: ["So close! I'll count that one!", "Nearly perfect! That counts!", "Brave try! You earned it!",
            "Good enough for a star! Keep going!", "That was close, and close counts today!"],
    brave: ["Good try! Brave readers keep going!", "What a brave try! You'll get it next time!",
            "Great effort! Every try makes you stronger!", "Brave reading! Let's keep going!"]
  };

  function key(app) { return "rl_" + app; }
  function load(app) {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(key(app)) || "null"); } catch (e) {}
    if (!s || typeof s !== "object") s = {};
    s.lv = clamp(s.lv || 1); s.max = Math.max(clamp(s.max || 1), s.lv);
    s.fuel = +s.fuel || 0; s.brave = +s.brave || 0;
    s.badges = Array.isArray(s.badges) ? s.badges : []; s.ups = Array.isArray(s.ups) ? s.ups : [];
    return s;
  }
  function save(app, s) { try { localStorage.setItem(key(app), JSON.stringify(s)); } catch (e) {} }
  function clamp(n) { n = Math.round(+n) || 1; return Math.max(1, Math.min(4, n)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ticket(n) {
    try { var t = parseInt(localStorage.getItem("rw_tickets") || "0", 10) || 0; localStorage.setItem("rw_tickets", String(t + (n || 1))); } catch (e) {}
  }
  function count(a) { var n = 0; for (var i = 0; i < a.length; i++) if (a[i]) n++; return n; }

  function level(app) { return LEVELS[load(app).lv - 1]; }
  function set(app, n) { var s = load(app); n = clamp(n); if (n > s.max) return false; s.lv = n; save(app, s); return true; }

  // +fuel toward the next level; returns the new LEVEL on a level-up
  function addFuel(s, n) {
    if (s.max >= 4 || !n) return null;
    s.fuel += n;
    if (s.fuel < NEED) return null;
    s.fuel = 0; s.max++; s.lv = s.max; s.ups.push(Date.now());
    ticket(1);
    return LEVELS[s.lv - 1];
  }
  function addBrave(s) {
    s.brave++;
    for (var i = 0; i < BADGES.length; i++) {
      var b = BADGES[i];
      if (s.brave >= b.n && s.badges.indexOf(b.id) < 0) { s.badges.push(b.id); ticket(1); return b; }
    }
    return null;
  }

  /* A whole page / paragraph. res = Listener result, cut = the app's own
     Expert star cut-offs [3★, 2★]. Words read at this level but not at
     Expert come back as `close` so the app can colour them softly. */
  function read(app, res, cut) {
    var s = load(app), L = LEVELS[s.lv - 1], hits = res.hits, total = hits.length;
    var lv = res.levels || [hits, hits, hits, hits];
    var n = count(hits), acc = L.acc || cut || [1, 0.85];
    var ratio = total ? n / total : 0;
    var stars = n === 0 ? 0 : ratio >= acc[0] ? 3 : ratio >= acc[1] ? 2 : 1;
    var close = [], missed = [];
    for (var i = 0; i < total; i++) { if (hits[i] && !lv[3][i]) close.push(i); if (!hits[i]) missed.push(i); }
    var ev = { stars: stars, n: n, total: total, close: close, missed: missed, level: L, up: null, badge: null, great: false };
    if (!n) return ev;
    if (s.lv < 4 && s.lv === s.max && total >= 3 && count(lv[s.lv]) / total >= GREAT) { ev.great = true; ev.up = addFuel(s, READ_FUEL); }
    if (stars < 3) ev.badge = addBrave(s);
    save(app, s);
    return ev;
  }

  /* One word said into the mic. tries = misses so far on this word.
     → "yes" | "close" (accepted brave try) | "retry" | "miss" */
  function judge(app, res, tries) {
    var lv = load(app).lv, L = res.levels;
    if (res.hits && res.hits[0]) return "yes";
    if (tries < 1) return "retry";
    if (!res.heardAny) return "miss";
    if (lv === 1) return "close";
    if (lv === 2 && L && L[0][0]) return "close";
    if (lv === 3 && L && L[1][0]) return "close";
    return "miss";
  }
  // bookkeeping after judge(): ⚡ for a first-time word at the next level, 💪 for a brave try
  function word(app, res, verdict, tries) {
    var s = load(app), ev = { up: null, badge: null, level: LEVELS[s.lv - 1] };
    if (verdict === "yes" && !tries && s.lv < 4 && s.lv === s.max && res.levels && res.levels[s.lv][0]) ev.up = addFuel(s, WORD_FUEL);
    if ((verdict === "close" || verdict === "miss") && res.heardAny) ev.badge = addBrave(s);
    save(app, s);
    return ev;
  }
  // a short phrase or sentence (sentence builders): accepted at this level?
  function sentenceOK(app, res) {
    var L = level(app), n = count(res.hits), t = res.hits.length;
    return t > 0 && n / t >= (L.acc ? L.acc[0] : 1);
  }

  /* ---------------- UI ---------------- */
  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var st = document.createElement("style");
    st.textContent =
      ".rl-chip{display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:6px 12px;font:inherit;font-weight:800;font-size:.95rem;color:#fff;background:var(--rl,#40c057);box-shadow:0 3px 0 rgba(0,0,0,.18);cursor:pointer}" +
      ".rl-chip small{font-weight:700;opacity:.9}.rl-chip .rl-mini{display:inline-block;width:46px;height:8px;border-radius:9px;background:rgba(255,255,255,.35);overflow:hidden}" +
      ".rl-chip .rl-mini i{display:block;height:100%;background:#fff}" +
      ".rl-veil{position:fixed;inset:0;z-index:9000;background:rgba(20,24,40,.55);display:flex;align-items:center;justify-content:center;padding:16px;animation:rlIn .2s}" +
      ".rl-card{background:#fff;color:#222;border-radius:24px;max-width:460px;width:100%;max-height:92vh;overflow:auto;padding:20px 18px;box-shadow:0 18px 50px rgba(0,0,0,.3);text-align:center}" +
      ".rl-card h2{margin:4px 0 6px;font-size:1.4rem}.rl-card p{margin:6px 0;line-height:1.4}" +
      ".rl-lv{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:3px solid #e9ecef;background:#f8f9fa;border-radius:16px;padding:10px 12px;margin:8px 0;font:inherit;cursor:pointer;color:#222}" +
      ".rl-lv .rl-e{font-size:1.9rem}.rl-lv b{display:block}.rl-lv small{color:#555}" +
      ".rl-lv.on{border-color:var(--rl);background:#fff;box-shadow:0 0 0 3px color-mix(in srgb,var(--rl) 25%,transparent)}" +
      ".rl-lv[disabled]{opacity:.55;cursor:default}" +
      ".rl-bar{height:14px;border-radius:9px;background:#e9ecef;overflow:hidden;margin:8px 0}.rl-bar i{display:block;height:100%;background:linear-gradient(90deg,#ffd43b,#fab005)}" +
      ".rl-badges{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:8px 0}" +
      ".rl-badge{display:flex;flex-direction:column;align-items:center;width:74px;font-size:.72rem;font-weight:700;color:#444}" +
      ".rl-badge span{font-size:1.8rem}.rl-badge.off{opacity:.3;filter:grayscale(1)}" +
      ".rl-ok{border:0;border-radius:999px;padding:12px 26px;font:inherit;font-weight:800;font-size:1.1rem;background:#40c057;color:#fff;margin-top:10px;cursor:pointer;box-shadow:0 4px 0 #2f9e44}" +
      ".rl-big{font-size:4.2rem;animation:rlPop .6s}" +
      ".rl-note{font-size:.82rem;color:#666}" +
      "@keyframes rlIn{from{opacity:0}}@keyframes rlPop{0%{transform:scale(.3)}70%{transform:scale(1.2)}}" +
      "@media (prefers-color-scheme: dark){.rl-card,.rl-lv.on{background:#1f2430;color:#eee}.rl-lv{background:#262b38;border-color:#343a4a;color:#eee}.rl-lv small,.rl-note,.rl-badge{color:#bbb}.rl-bar{background:#343a4a}}";
    document.head.appendChild(st);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function veil(html) {
    css();
    var d = document.createElement("div");
    d.className = "rl-veil"; d.innerHTML = '<div class="rl-card">' + html + "</div>";
    document.body.appendChild(d);
    d.addEventListener("click", function (e) { if (e.target === d) close(d); });
    return d;
  }
  function close(d) { if (d && d.parentNode) d.parentNode.removeChild(d); }

  function chip(app) {
    css();
    var s = load(app), L = LEVELS[s.lv - 1], pct = s.max >= 4 ? 100 : Math.round(100 * s.fuel / NEED);
    return '<button class="rl-chip" data-rl-chip="' + app + '" style="--rl:' + L.color + '" title="Reading level">' + L.emoji + " " + esc(L.tag) +
      ' <span class="rl-mini"><i style="width:' + pct + '%"></i></span></button>';
  }
  // wire every chip in `root`; onChange(level) after the child picks a level
  function bind(root, app, onChange) {
    (root || document).querySelectorAll('[data-rl-chip="' + app + '"]').forEach(function (b) {
      b.onclick = function (e) { e.stopPropagation(); sheet(app, onChange); };
    });
  }
  function sheet(app, onChange) {
    var s = load(app), next = LEVELS[s.max] || null;
    var rows = LEVELS.map(function (L) {
      var open = L.n <= s.max;
      return '<button class="rl-lv' + (L.n === s.lv ? " on" : "") + '" data-lv="' + L.n + '" style="--rl:' + L.color + '"' + (open ? "" : " disabled") + ">" +
        '<span class="rl-e">' + (open ? L.emoji : "🔒") + "</span><span><b>" + esc(L.tag) + " · " + esc(L.name) + "</b><small>" + esc(L.say) + "</small></span></button>";
    }).join("");
    var bar = next
      ? "<p><b>⚡ " + s.fuel + " / " + NEED + "</b> power to unlock " + next.emoji + " " + esc(next.name) + '</p><div class="rl-bar"><i style="width:' + Math.round(100 * s.fuel / NEED) + '%"></i></div>' +
        '<p class="rl-note">Read a page really well, or say a word just right the first time, to fill the bar.</p>'
      : "<p><b>🏆 You reached the top level!</b> You read like a real grade-level reader.</p>";
    var badges = BADGES.map(function (b) {
      var got = s.badges.indexOf(b.id) >= 0;
      return '<span class="rl-badge' + (got ? "" : " off") + '"><span>' + b.emoji + "</span>" + esc(b.name) + "<em>" + (got ? "✓" : b.n + " tries") + "</em></span>";
    }).join("");
    var d = veil("<h2>🎤 My reading level</h2>" + rows + bar +
      "<h2 style=\"margin-top:14px\">💪 Brave Badges</h2><p>Every brave try counts! You have made <b>" + s.brave + "</b> brave tries.</p>" +
      '<div class="rl-badges">' + badges + "</div>" +
      '<p class="rl-note">Grown-ups can change the level in Admin → 🎤 Reading Levels.</p><button class="rl-ok">OK!</button>');
    d.querySelectorAll("[data-lv]").forEach(function (b) {
      b.onclick = function () { if (set(app, +b.dataset.lv)) { close(d); if (onChange) onChange(level(app)); } };
    });
    d.querySelector(".rl-ok").onclick = function () { close(d); };
  }
  // big celebration for a level-up or a new Brave badge
  function celebrate(ev, buddy) {
    if (!ev) return null;
    var html = null;
    if (ev.up) html = '<div class="rl-big">' + ev.up.emoji + "</div><h2>Level up! " + esc(ev.up.name) + "!</h2><p>" + esc(buddy || "You") +
      " says: amazing reading! You are now on <b>" + esc(ev.up.tag) + "</b> level.</p><p>" + esc(ev.up.say) + "</p><p>🎟️ +1 Prize Wheel ticket</p>";
    else if (ev.badge) html = '<div class="rl-big">' + ev.badge.emoji + "</div><h2>New Brave Badge!</h2><p><b>" + esc(ev.badge.name) +
      "</b>: you made " + ev.badge.n + " brave tries. Never give up!</p><p>🎟️ +1 Prize Wheel ticket</p>";
    if (!html) return null;
    var d = veil(html + '<button class="rl-ok">Yay!</button>');
    d.querySelector(".rl-ok").onclick = function () { close(d); };
    setTimeout(function () { close(d); }, 6000);
    return d;
  }

  window.ReadLevel = {
    LEVELS: LEVELS, BADGES: BADGES, NEED: NEED,
    get: load, level: level, set: set,
    read: read, judge: judge, word: word, sentenceOK: sentenceOK,
    praise: function (kind) { return pick(PRAISE[kind] || PRAISE.close); },
    chip: chip, bind: bind, sheet: sheet, celebrate: celebrate
  };
})();
