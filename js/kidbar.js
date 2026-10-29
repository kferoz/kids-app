/* ============================================================
   kidbar.js — Home button, 🎒 pocket and the $1 party, everywhere
   ------------------------------------------------------------
   Include on every app page after dollars.js:
     <script src="../js/dollars.js"></script>
     <script src="../js/kidbar.js"></script>

   • 🏠  A floating Home button appears whenever the page's own link
         back to the Hub is missing or scrolled out of sight.
   • 🎒  "My Pocket": this app's stickers + every sticker from every
         app, and the Dollar Bank (the $1 challenges here and what
         you've earned). data-pocket="off" hides it (Rewards Center).
   • 💵  When a $1 challenge is won (DollarBank.sync finds a new
         dollar), a big celebration pops up on whatever page it is.

   Stickers live in each app's own keys and many store only ids, so
   the pictures come from the app's data. On an app's page its
   stickers are copied into kb_album (per learner) so the pocket and
   the Rewards Center can show every app's stickers anywhere.
   ============================================================ */
(function () {
  "use strict";
  if (window.KidBar) return;
  var script = document.currentScript;
  var HUB = new URL("../index.html", script ? script.src : location.href).href;
  var POCKET = !(script && script.getAttribute("data-pocket") === "off");
  var APP = (window.Tracker && Tracker.app) || (location.pathname.split("/").slice(-2, -1)[0] || "app");
  var ALBUM = "kb_album";

  var APPS = {
    phonics: ["Phonics Pals", "🦜"], tracewrite: ["Write & Trace", "🖍️"], arabic: ["Arabic Oasis", "🐪"],
    speedway: ["Learning Speedway", "🏎️"], kinder: ["Little Learners", "🐣"], reading: ["Reading Trail", "🦉"],
    homeschool: ["Homeschool Academy", "🎓"], readingadventures: ["Reading Adventures", "📖"],
    readrocket: ["Read-Aloud Rocket", "🚀"], writestudio: ["Sentence Studio", "✏️"], detectives: ["Reading Detectives", "🔍"],
    clueisland: ["Clue Island", "🧭"], grandprix: ["Turbo Grand Prix", "🏁"], multiply: ["Times Table Takeoff", "✖️"],
    grammar: ["Grammar Galaxy", "🌌"], funfacts: ["Fun Facts Explorer", "🔭"], treasure: ["Grammar Treasure Hunt", "🗺️"],
    subtraction: ["Subtraction Notebook", "📓"], billofrights: ["Bill of Rights", "📜"], piratemath: ["Pirate Math Quest", "🏴‍☠️"],
    timesquest: ["Times Table Quest", "🦉"], stickerquest: ["Sticker Quest", "🧩"],
    arcade: ["Free Games Arcade", "🎮"]
  };
  function appName(id) { return (APPS[id] || [id])[0]; }
  function appEmoji(id) { return (APPS[id] || [0, "📦"])[1]; }

  /* ---------- tiny helpers ---------- */
  function get(k) { try { var v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function glob(name) { try { return new Function("return typeof " + name + " !== 'undefined' ? " + name + " : null;")(); } catch (e) { return null; } }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function el(tag, cls, html) { var d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; return d; }

  /* ---------- stickers ---------- */
  // id → {e, n} from an app's data: lessons/books with .sticker ("l:"/"b:"+id),
  // phases with .badge ("p:"+id), and fun stickers listed by their own id.
  function stickerMap(roots) {
    var map = {}, seen = [];
    function walk(o, d) {
      if (!o || typeof o !== "object" || d > 5 || seen.indexOf(o) >= 0) return;
      seen.push(o);
      if (o.id != null && o.sticker && o.sticker.emoji) { var s = { e: o.sticker.emoji, n: o.sticker.name || "" }; map["l:" + o.id] = map["b:" + o.id] = s; }
      if (o.id != null && o.badge && o.badge.emoji) map["p:" + o.id] = { e: o.badge.emoji, n: o.badge.name || "" };
      Object.keys(o).forEach(function (k) { if (k !== "sticker" && k !== "badge") walk(o[k], d + 1); });
    }
    roots.forEach(function (r) {
      var v = glob(r); if (!v) return;
      if (r === "FUN_STICKERS") arr(v).forEach(function (f) { map[f.id] = { e: f.emoji, n: f.name }; });
      else walk(v, 0);
    });
    return map;
  }
  function fromIds(key, roots) {
    var map = stickerMap(roots);
    return arr(get(key)).map(function (id) { return map[id]; }).filter(Boolean);
  }
  // This page's stickers (null when the app has none of its own).
  var LOCAL = {
    arabic: function () { return fromIds("ar_stickers", ["PHASES"]); },
    tracewrite: function () { return fromIds("tw_stickers", ["PHASES"]); },
    readrocket: function () { return fromIds("rr_stickers", ["PHASES"]); },
    writestudio: function () { return fromIds("ws_stickers", ["LESSONS"]); },
    phonics: function () { return fromIds("ph_stickers", ["BOOKS", "FUN_STICKERS", "PHASES"]); },
    homeschool: function () { return arr(get("hs_stickers")).map(function (e) { return { e: e, n: "" }; }); },
    detectives: function () { return arr(get("rc_stickers")).map(function (e) { return { e: e, n: "" }; }); },
    stickerquest: function () { return arr((get("stickerQuest_v1") || {}).stickers).map(function (e) { return { e: e, n: "" }; }); },
    timesquest: function () {
      var B = arr(glob("BADGES")), mine = arr((get("timesTableQuest_v2") || {}).badges);
      return B.filter(function (b) { return mine.indexOf(b.id) >= 0; }).map(function (b) { return { e: b.icon, n: b.name }; });
    },
    reading: function () {
      var st = arr(glob("READING_STAGES")), done = arr(get("rd_done"));
      return st.filter(function (s) { return done.indexOf(s.id) >= 0 && s.sticker; }).map(function (s) { return { e: s.sticker.emoji, n: s.sticker.name }; });
    },
    speedway: function () {
      var cars = arr(glob("CAR_GARAGE")), mine = arr(get("sw_cars"));
      return cars.filter(function (c) { return mine.indexOf(c.id) >= 0; }).map(function (c) { return { e: c.emoji, n: c.name }; });
    },
    clueisland: function () {
      var isl = arr(glob("ISLANDS")), mine = arr(get("ci_chests"));
      return isl.filter(function (i) { return mine.indexOf(i.id) >= 0 && i.chest; }).map(function (i) { return { e: i.chest.icon, n: i.chest.name }; });
    },
    readingadventures: function () {
      var G = glob("GRADES"), all = glob("allEarnedStickers"); if (!G || !all) return [];
      return all().map(function (x) {
        var s = arr((G[x.gradeId] || {}).stories).filter(function (st) { return String(st.id) === String(x.storyId); })[0];
        return s && s.sticker ? { e: s.sticker.emoji, n: s.sticker.name || s.title } : null;
      }).filter(Boolean);
    }
  };
  function localStickers() { try { return LOCAL[APP] ? LOCAL[APP]() : null; } catch (e) { return null; } }
  // Copy this app's stickers into the shared album (per learner).
  function mirror() {
    var mine = localStickers(); if (!mine) return;
    var al = get(ALBUM) || {}, now = JSON.stringify(mine);
    if (JSON.stringify(al[APP] || []) !== now) { al[APP] = mine; put(ALBUM, al); }
  }
  // Every app's stickers: { app: [{e, n}] }, with the emoji-only apps read directly.
  function album(g) {
    g = g || get;
    var al = g(ALBUM) || {}, out = {};
    Object.keys(al).forEach(function (a) { if (arr(al[a]).length) out[a] = al[a]; });
    if (!out.homeschool && arr(g("hs_stickers")).length) out.homeschool = arr(g("hs_stickers")).map(function (e) { return { e: e, n: "" }; });
    if (!out.detectives && arr(g("rc_stickers")).length) out.detectives = arr(g("rc_stickers")).map(function (e) { return { e: e, n: "" }; });
    return out;
  }
  // Apps whose stickers we can count but not picture until the app is opened once.
  function unseenCounts(g) {
    g = g || get;
    var al = g(ALBUM) || {}, out = {};
    [["arabic", "ar_stickers"], ["tracewrite", "tw_stickers"], ["readrocket", "rr_stickers"], ["writestudio", "ws_stickers"],
     ["phonics", "ph_stickers"], ["speedway", "sw_cars"], ["clueisland", "ci_chests"], ["reading", "rd_done"]].forEach(function (p) {
      var n = arr(g(p[1])).length; if (n && !arr(al[p[0]]).length) out[p[0]] = n;
    });
    return out;
  }
  function albumHtml(g, skip) {
    var al = album(g), un = unseenCounts(g), html = "";
    Object.keys(al).forEach(function (a) {
      if (a === skip) return;
      html += '<div class="kb-grp"><h4>' + appEmoji(a) + " " + esc(appName(a)) + " <small>" + al[a].length + "</small></h4><div class=\"kb-stk\">" +
        al[a].map(function (s) { return '<span title="' + esc(s.n) + '">' + s.e + "</span>"; }).join("") + "</div></div>";
    });
    Object.keys(un).forEach(function (a) {
      if (a === skip) return;
      html += '<div class="kb-grp"><h4>' + appEmoji(a) + " " + esc(appName(a)) + " <small>" + un[a] + '</small></h4><p class="kb-note">Open ' + esc(appName(a)) + " once to see these stickers here.</p></div>";
    });
    return html;
  }

  /* ---------- styles ---------- */
  var CSS =
    ".kb-home{position:fixed;left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));z-index:9990;width:48px;height:48px;border-radius:16px;display:grid;place-items:center;font-size:26px;text-decoration:none;background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.28);border:3px solid #ffd43b;transition:transform .15s}" +
    ".kb-home:active{transform:scale(.92)}.kb-home[hidden]{display:none}" +
    ".kb-pocket{position:fixed;right:max(10px,env(safe-area-inset-right));bottom:max(10px,env(safe-area-inset-bottom));z-index:9990;width:50px;height:50px;border-radius:50%;border:3px solid #fff;background:linear-gradient(135deg,#7950f2,#e64980);color:#fff;font-size:24px;box-shadow:0 4px 14px rgba(0,0,0,.3);cursor:pointer;padding:0;opacity:.94}" +
    ".kb-pocket b{position:absolute;top:-8px;right:-10px;background:#2b8a3e;color:#fff;font:800 12px/1 system-ui,sans-serif;padding:4px 6px;border-radius:999px;border:2px solid #fff}" +
    ".kb-pocket b:empty{display:none}" +
    ".kb-veil{position:fixed;inset:0;z-index:10000;background:rgba(20,16,40,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Fredoka','Baloo 2',system-ui,sans-serif}" +
    ".kb-card{background:#fffdf7;color:#2b2540;border-radius:24px;width:min(540px,100%);max-height:88vh;overflow:auto;box-shadow:0 18px 50px rgba(0,0,0,.35);padding:16px 16px 20px;position:relative}" +
    ".kb-x{position:absolute;right:10px;top:10px;width:40px;height:40px;border-radius:50%;border:0;background:#f1f0f7;font-size:20px;cursor:pointer}" +
    ".kb-card h3{margin:2px 48px 10px 4px;font-size:22px}.kb-tabs{display:flex;gap:8px;margin-bottom:12px}" +
    ".kb-tabs button{flex:1;border:0;border-radius:14px;padding:10px;font:600 17px inherit;font-family:inherit;background:#efeafd;color:#4b3c8c;cursor:pointer}" +
    ".kb-tabs button.on{background:#7950f2;color:#fff}" +
    ".kb-grp{background:#fff;border:2px solid #eee6ff;border-radius:16px;padding:8px 10px;margin:8px 0}.kb-grp h4{margin:0 0 6px;font-size:16px}.kb-grp h4 small{background:#efeafd;border-radius:999px;padding:1px 8px;font-size:13px;color:#5f3dc4}" +
    ".kb-stk{display:flex;flex-wrap:wrap;gap:6px;font-size:30px}.kb-stk span{width:44px;height:44px;display:grid;place-items:center;background:#fff8e1;border-radius:12px}" +
    ".kb-note{margin:4px 0;color:#6b6585;font-size:15px}.kb-empty{text-align:center;color:#6b6585;padding:10px}" +
    ".kb-bank{display:flex;gap:8px;margin-bottom:10px}.kb-bank div{flex:1;background:#ebfbee;border-radius:16px;padding:8px;text-align:center}.kb-bank b{display:block;font-size:28px;color:#2b8a3e}.kb-bank small{color:#4d5f52}" +
    ".kb-ch{display:flex;align-items:center;gap:10px;background:#fff;border:2px solid #e6f4ea;border-radius:14px;padding:8px 10px;margin:6px 0}.kb-ch.got{border-color:#8ce99a;background:#f4fff6}" +
    ".kb-ch .kb-ic{font-size:26px}.kb-ch .kb-t{flex:1;font-size:16px}.kb-ch .kb-t small{display:block;color:#6b6585;font-size:13px}" +
    ".kb-bar{height:8px;background:#eee;border-radius:99px;margin-top:4px;overflow:hidden}.kb-bar i{display:block;height:100%;background:linear-gradient(90deg,#51cf66,#2b8a3e)}" +
    ".kb-party{text-align:center}.kb-party .kb-big{font-size:86px;display:inline-block;animation:kbBounce 1s ease-in-out infinite}" +
    ".kb-party h2{margin:4px 0;font-size:34px;color:#2b8a3e}.kb-party ul{list-style:none;padding:0;margin:8px 0;font-size:18px}.kb-party li{background:#ebfbee;border-radius:12px;padding:6px 10px;margin:4px 0}" +
    ".kb-party p{font-size:17px;color:#4d4766;margin:8px 0}.kb-ok{border:0;border-radius:18px;background:linear-gradient(135deg,#40c057,#2b8a3e);color:#fff;font:700 22px inherit;font-family:inherit;padding:12px 28px;cursor:pointer;box-shadow:0 5px 0 #237032}" +
    ".kb-rain{position:fixed;inset:0;pointer-events:none;z-index:10001;overflow:hidden}.kb-rain span{position:absolute;top:-60px;font-size:34px;animation:kbFall linear forwards}" +
    "@keyframes kbBounce{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-14px) rotate(6deg)}}" +
    "@keyframes kbFall{to{transform:translateY(115vh) rotate(540deg)}}" +
    "@media (max-width:520px){.kb-home{width:42px;height:42px;font-size:22px;border-radius:14px}.kb-pocket{width:44px;height:44px;font-size:21px}.kb-party .kb-big{font-size:70px}}";

  /* ---------- 🏠 floating Home ---------- */
  var homeBtn = null;
  function hubLinks() {
    return Array.prototype.filter.call(document.querySelectorAll("a[href]"), function (a) { return a !== homeBtn && a.href === HUB; });
  }
  function onScreen(a) {
    var r = a.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.bottom < 2 || r.top > innerHeight - 2 || r.right < 2 || r.left > innerWidth - 2) return false;
    var cs = getComputedStyle(a); return cs.visibility !== "hidden" && +cs.opacity > 0.2;
  }
  function checkHome() {
    if (!homeBtn) return;
    homeBtn.hidden = hubLinks().some(onScreen);
  }

  /* ---------- 🎒 pocket ---------- */
  var pocketBtn = null, veil = null;
  function updateBadge() {
    if (!pocketBtn || !window.DollarBank) return;
    var t = DollarBank.totals();
    pocketBtn.querySelector("b").textContent = t.earned ? "$" + t.earned : "";
  }
  function closeVeil() { if (veil) { veil.remove(); veil = null; } }
  function openPocket(tab) {
    closeVeil(); mirror();
    veil = el("div", "kb-veil");
    var card = el("div", "kb-card");
    card.innerHTML = '<button class="kb-x" title="Close">✖</button><h3>🎒 My Pocket</h3>' +
      '<div class="kb-tabs"><button data-t="stk">🎟️ Stickers</button><button data-t="bank">💵 Dollar Bank</button></div><div class="kb-body"></div>';
    veil.appendChild(card); document.body.appendChild(veil);
    veil.addEventListener("click", function (e) { if (e.target === veil || e.target.closest(".kb-x")) closeVeil(); });
    card.querySelectorAll(".kb-tabs button").forEach(function (b) { b.addEventListener("click", function () { show(b.getAttribute("data-t")); }); });
    function show(t) {
      card.querySelectorAll(".kb-tabs button").forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-t") === t); });
      card.querySelector(".kb-body").innerHTML = t === "stk" ? stickersHtml() : bankHtml();
    }
    show(tab || "stk");
  }
  function stickersHtml() {
    var mine = localStickers(), html = "";
    if (mine) {
      html += '<div class="kb-grp"><h4>' + appEmoji(APP) + " Here in " + esc(appName(APP)) + " <small>" + mine.length + "</small></h4>" +
        (mine.length ? '<div class="kb-stk">' + mine.map(function (s) { return '<span title="' + esc(s.n) + '">' + s.e + "</span>"; }).join("") + "</div>"
          : '<p class="kb-note">No stickers here yet. Finish a lesson to win your first one!</p>') + "</div>";
    }
    var rest = albumHtml(null, APP);
    html += rest ? "<h4 style=\"margin:12px 4px 2px\">🌈 From all my apps</h4>" + rest
      : (mine ? "" : '<p class="kb-empty">No stickers yet. Every lesson you finish in the learning apps adds one here!</p>');
    return html;
  }
  function chRow(c) {
    var p = c.progress, got = c.dollars > 0, bar = "", sub = "";
    if (c.repeat) {
      sub = got ? "You earned $" + c.dollars + " here so far! Keep going for more." : "Every time = $1";
      if (p && c.every) { bar = '<div class="kb-bar"><i style="width:' + Math.round(100 * p.have / p.need) + '%"></i></div>'; sub += " · " + p.have + " of " + p.need + " " + esc(c.unit || "") + " toward the next $1"; }
    } else {
      sub = got ? "Done! You earned $1 🎉" : "Not yet. You can do it!";
      if (!got && p && p.need > 1) bar = '<div class="kb-bar"><i style="width:' + Math.round(100 * p.have / p.need) + '%"></i></div>';
    }
    return '<div class="kb-ch' + (got && !c.repeat ? " got" : "") + '"><span class="kb-ic">' + (got && !c.repeat ? "✅" : "💵") + '</span><span class="kb-t">' + esc(c.title) + "<small>" + sub + "</small>" + bar + "</span></div>";
  }
  function bankHtml() {
    if (!window.DollarBank) return "";
    var t = DollarBank.totals(), here = DollarBank.challengesFor(APP), html = "";
    html += '<div class="kb-bank"><div><b>$' + t.earned + "</b><small>earned</small></div><div><b>$" + t.owed + "</b><small>to collect</small></div><div><b>$" + t.paid + "</b><small>in my hand</small></div></div>";
    html += '<p class="kb-note">💡 Big, hard wins earn a <b>real dollar</b>! A grown-up hands it over from Admin → 💵 Dollars.</p>';
    if (here.length) html += '<h4 style="margin:12px 4px 2px">' + appEmoji(APP) + " $1 challenges in " + esc(appName(APP)) + "</h4>" + here.map(chRow).join("");
    else html += '<p class="kb-note">This one is just for fun, so there are no $1 challenges here. Try a learning app!</p>';
    var L = DollarBank.ledger().slice().reverse();
    if (L.length) {
      html += '<h4 style="margin:12px 4px 2px">🏦 My dollars</h4>' + L.map(function (e) {
        return '<div class="kb-ch got"><span class="kb-ic">' + (e.paid ? "🤑" : "💵") + '</span><span class="kb-t">$' + (e.amt || 1) + " · " + esc(e.title) +
          "<small>" + appEmoji(e.app) + " " + esc(appName(e.app)) + " · " + new Date(e.ts).toLocaleDateString() + (e.paid ? " · in your hand ✓" : " · ask a grown-up!") + "</small></span></div>";
      }).join("");
    }
    return html;
  }

  /* ---------- 💵 the party ---------- */
  var partyOpen = false;
  function rain() {
    var r = el("div", "kb-rain"), pics = ["💵", "💰", "🤑", "⭐", "🎉", "💵"];
    for (var i = 0; i < 26; i++) {
      var s = el("span", "", pics[i % pics.length]);
      s.style.left = Math.random() * 100 + "vw"; s.style.animationDuration = (2.2 + Math.random() * 2) + "s"; s.style.animationDelay = Math.random() * 0.8 + "s";
      r.appendChild(s);
    }
    document.body.appendChild(r); setTimeout(function () { r.remove(); }, 5200);
  }
  function say(t) {
    try { var u = new SpeechSynthesisUtterance(t); u.lang = "en-US"; u.rate = 1; u.pitch = 1.15; speechSynthesis.speak(u); } catch (e) {}
  }
  function party() {
    if (partyOpen || !window.DollarBank) return;
    var news = DollarBank.ledger().filter(function (e) { return !e.seen; });
    if (!news.length) return;
    partyOpen = true; closeVeil();
    var sum = news.reduce(function (a, e) { return a + (e.amt || 1); }, 0);
    veil = el("div", "kb-veil");
    var card = el("div", "kb-card kb-party");
    var JOKES = ["Cha-ching! 🤑", "Money, money, honey! 🍯", "You're rich! Well… a little bit rich! 😄", "Ka-boom! That was a BIG win!"];
    card.innerHTML = '<div class="kb-big">💵</div><h2>+$' + sum + "!</h2><p><b>" + JOKES[Math.floor(Math.random() * JOKES.length)] + "</b><br>That was really hard, and you did it. You earned a <b>real " + (sum > 1 ? "$" + sum : "dollar") + "</b>!</p>" +
      "<ul>" + news.map(function (e) { return "<li>" + appEmoji(e.app) + " " + esc(e.title) + "</li>"; }).join("") + "</ul>" +
      "<p>🏦 It's saved in your Dollar Bank. Show a grown-up!</p><button class=\"kb-ok\">Yay! 🎉</button>";
    veil.appendChild(card); document.body.appendChild(veil); rain();
    say("Wow! You earned " + (sum > 1 ? sum + " dollars" : "one whole dollar") + "! " + news[0].title + ". That was really hard, and you did it! Show a grown-up!");
    try { window.Tracker && Tracker.log("reward", "dollar", { amount: sum, items: news.map(function (e) { return e.id; }) }); } catch (e) {}
    card.querySelector(".kb-ok").addEventListener("click", function () {
      DollarBank.markSeen(news.map(function (e) { return e.id; }));
      partyOpen = false; closeVeil(); updateBadge();
    });
  }

  /* ---------- checking for new dollars ---------- */
  var timer = 0;
  function check() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!window.DollarBank) return;
      DollarBank.sync(); mirror(); updateBadge();
      setTimeout(party, 900);   // let the app's own "well done" screen show first
    }, 500);
  }
  var proto = Storage.prototype, origSet = proto.setItem;
  proto.setItem = function (k) {
    var r = origSet.apply(this, arguments);
    if (this === localStorage && !/^(hub_|kb_)/.test(String(k).replace(/^k[^:]*::/, ""))) check();
    return r;
  };

  function mount() {
    var st = el("style"); st.textContent = CSS; document.head.appendChild(st);
    homeBtn = el("a", "kb-home", "🏠"); homeBtn.href = HUB; homeBtn.title = "Back to the Learning Hub"; homeBtn.hidden = true;
    document.body.appendChild(homeBtn);
    if (POCKET) {
      pocketBtn = el("button", "kb-pocket", "🎒<b></b>"); pocketBtn.title = "My Pocket: stickers & dollars";
      pocketBtn.addEventListener("click", function () { openPocket(); });
      document.body.appendChild(pocketBtn);
    }
    var t = 0, again = function () { clearTimeout(t); t = setTimeout(checkHome, 120); };
    ["scroll", "resize", "click", "hashchange"].forEach(function (ev) { window.addEventListener(ev, again, { passive: true, capture: true }); });
    setInterval(checkHome, 1500);
    setTimeout(checkHome, 300);
    updateBadge(); check();
  }
  if (document.body) mount(); else document.addEventListener("DOMContentLoaded", mount);

  window.KidBar = { apps: APPS, appName: appName, appEmoji: appEmoji, album: album, albumHtml: albumHtml,
    unseenCounts: unseenCounts, openPocket: openPocket, check: check, mirror: mirror, chRow: chRow };
})();
