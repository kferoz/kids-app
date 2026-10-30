/* ============================================================
   rewardkit.js — stars, levels, day streaks and surprise gifts
   ------------------------------------------------------------
   Include on every app page right after tracker.js:
     <script src="../js/settings.js"></script>
     <script src="../js/rewardkit.js"></script>

   It listens to what the apps already report, so apps need no changes:
     Tracker.answer(ok)      correct answer        +1 ⭐
     Tracker.complete(…)     lesson / story done   +5 ⭐ (+5 more at 90%+)
   Stars per day are capped (DAY_CAP) so quick games can't be farmed.

   • Levels   12 named levels; each needs a little more than the last.
   • Streak   days in a row with at least one star (local dates).
   • Gifts    VIRTUAL ONLY: Prize Wheel tickets, surprise stickers,
              critters, dress-up items for the Hub avatar. Every level-up
              and streak milestone gives one; a finished lesson has a
              GIFT_CHANCE of a surprise, at most HubSettings gifts.perDay.

   State lives in kb_rewards (per learner via profile-store; kb_ keys
   are skipped by tracker.js and kidbar's checks). Tickets and critters
   go to the shared rw_ Prize Wheel pot, stickers to kb_album.surprise.
   kidbar.js draws the ⭐ chip and the celebrations from news().
   ============================================================ */
(function (root) {
  "use strict";

  var KEY = "kb_rewards";
  var DAY_CAP = 300, GIFT_CHANCE = 0.25;
  var STREAK_GIFTS = [3, 7, 14, 30, 60, 100];
  var LEVELS = [
    { name: "Seedling", emoji: "🌱" }, { name: "Sprout", emoji: "🌿" }, { name: "Bloom", emoji: "🌸" },
    { name: "Explorer", emoji: "🧭" }, { name: "Adventurer", emoji: "🎒" }, { name: "Climber", emoji: "🏔️" },
    { name: "Star Pilot", emoji: "🚀" }, { name: "Comet", emoji: "☄️" }, { name: "Moon Walker", emoji: "🌙" },
    { name: "Galaxy Hero", emoji: "🌌" }, { name: "Super Nova", emoji: "🌟" }, { name: "Legend", emoji: "👑" }
  ];
  // Same ids as CRITTERS in rewards/js/data.js (the Prize Wheel's collection).
  var CRITTERS = [
    { id: "unicorn", e: "🦄", n: "Sparkle" }, { id: "dragon", e: "🐉", n: "Ember" }, { id: "dino", e: "🦖", n: "Rex" },
    { id: "owl", e: "🦉", n: "Hoot" }, { id: "fox", e: "🦊", n: "Rusty" }, { id: "octopus", e: "🐙", n: "Inky" },
    { id: "bee", e: "🐝", n: "Buzz" }, { id: "turtle", e: "🐢", n: "Shelly" }, { id: "whale", e: "🐳", n: "Splash" },
    { id: "frog", e: "🐸", n: "Hopper" }, { id: "cat", e: "🐱", n: "Whiskers" }, { id: "penguin", e: "🐧", n: "Waddle" }
  ];
  var STICKERS = [
    { e: "🌈", n: "Rainbow" }, { e: "🦄", n: "Unicorn" }, { e: "🍕", n: "Pizza Party" }, { e: "🎈", n: "Balloon" },
    { e: "🐳", n: "Happy Whale" }, { e: "🍩", n: "Donut" }, { e: "🚀", n: "Rocket" }, { e: "🦖", n: "Dino" },
    { e: "🌻", n: "Sunflower" }, { e: "🍦", n: "Ice Cream" }, { e: "🐼", n: "Panda" }, { e: "⚡", n: "Zap" },
    { e: "🎸", n: "Rock Star" }, { e: "🪁", n: "Kite" }, { e: "🐙", n: "Octopus" }, { e: "🧁", n: "Cupcake" },
    { e: "🌋", n: "Volcano" }, { e: "🦋", n: "Butterfly" }, { e: "🛸", n: "UFO" }, { e: "🐢", n: "Turtle" },
    { e: "🍉", n: "Watermelon" }, { e: "🎯", n: "Bullseye" }, { e: "🏰", n: "Castle" }, { e: "🐝", n: "Busy Bee" }
  ];
  var ITEMS = [
    { id: "crown", e: "👑", n: "Crown" }, { id: "tophat", e: "🎩", n: "Top Hat" }, { id: "shades", e: "🕶️", n: "Cool Shades" },
    { id: "bow", e: "🎀", n: "Bow" }, { id: "cap", e: "🧢", n: "Cap" }, { id: "wand", e: "🪄", n: "Magic Wand" },
    { id: "gradcap", e: "🎓", n: "Smart Cap" }, { id: "headphones", e: "🎧", n: "Headphones" }, { id: "goggles", e: "🥽", n: "Goggles" },
    { id: "flower", e: "🌻", n: "Flower" }, { id: "medal", e: "🏅", n: "Medal" }, { id: "scarf", e: "🧣", n: "Scarf" }
  ];

  /* ---------- levels ---------- */
  // Stars needed to REACH level n (1-based): 0, 40, 100, 180, 280, 400 … (+20 more each step).
  function starsFor(n) { var t = 0; for (var i = 1; i < n; i++) t += 20 + 20 * i; return t; }
  function levelOf(stars) {
    var n = 1; while (starsFor(n + 1) <= stars) n++;
    var info = LEVELS[Math.min(n, LEVELS.length) - 1];
    var from = starsFor(n), to = starsFor(n + 1);
    return { n: n, name: info.name + (n > LEVELS.length ? " " + (n - LEVELS.length + 1) : ""), emoji: info.emoji,
             have: stars - from, need: to - from, next: to };
  }

  /* ---------- dates ---------- */
  function dayOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function daysBetween(a, b) {   // "2026-10-29" → "2026-10-30" = 1 (calendar days, DST-safe)
    var pa = a.split("-"), pb = b.split("-");
    return Math.round((Date.UTC(+pb[0], pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], pa[1] - 1, +pa[2])) / 864e5);
  }

  /* ---------- state ---------- */
  function fresh() {
    return { v: 1, stars: 0, day: "", dayStars: 0, streak: 0, best: 0, lastDay: "",
             level: 1, giftDay: "", giftsToday: 0, gifts: [], items: [], wear: "", news: [] };
  }
  function clean(s) {
    var f = fresh();
    if (!s || typeof s !== "object") return f;
    Object.keys(f).forEach(function (k) { if (s[k] === undefined || typeof s[k] !== typeof f[k] || Array.isArray(f[k]) !== Array.isArray(s[k])) s[k] = f[k]; });
    return s;
  }
  // The current streak as of today: it's broken if the last star day is before yesterday.
  function streakNow(s, now) {
    if (!s.lastDay) return 0;
    return daysBetween(s.lastDay, dayOf(now)) <= 1 ? s.streak : 0;
  }

  /* ---------- gifts ---------- */
  function pick(list, rand) { return list[Math.floor(rand() * list.length) % list.length]; }
  // One virtual gift. ctx = {critters: owned ids, rand}. Returns {kind, e, n, id?, amount?}.
  function makeGift(s, ctx) {
    var rand = ctx.rand, r = rand();
    var critLeft = CRITTERS.filter(function (c) { return ctx.critters.indexOf(c.id) < 0; });
    var itemLeft = ITEMS.filter(function (it) { return s.items.indexOf(it.id) < 0; });
    if (r < 0.15 && critLeft.length) { var c = pick(critLeft, rand); return { kind: "critter", id: c.id, e: c.e, n: c.n }; }
    if (r < 0.30 && itemLeft.length) { var it = pick(itemLeft, rand); return { kind: "item", id: it.id, e: it.e, n: it.n }; }
    if (r < 0.65) { var st = pick(STICKERS, rand); return { kind: "sticker", e: st.e, n: st.n }; }
    var amt = 1 + Math.floor(rand() * 3);
    return { kind: "tickets", amount: amt, e: "🎟️", n: amt + (amt === 1 ? " Prize Wheel ticket" : " Prize Wheel tickets") };
  }
  function giveGift(s, why, ctx, now) {
    var g = makeGift(s, ctx);
    g.why = why; g.ts = now; g.app = ctx.app || "";
    s.gifts.push(g);
    if (s.gifts.length > 200) s.gifts = s.gifts.slice(-200);
    if (g.kind === "item") { s.items.push(g.id); s.wear = g.id; }
    if (g.kind === "critter") ctx.critters.push(g.id);
    s.news.push({ type: "gift", gift: g });
    (ctx.effects = ctx.effects || []).push(g);
    return g;
  }

  /* ---------- the one rule book (pure: easy to test) ---------- */
  // ev = {type: "answer", ok} | {type: "complete", score, total}. Returns stars added.
  function apply(s, ev, now, ctx) {
    var day = dayOf(now), add = 0;
    if (s.day !== day) { s.day = day; s.dayStars = 0; }
    if (s.giftDay !== day) { s.giftDay = day; s.giftsToday = 0; }
    if (ev.type === "answer" && ev.ok) add = 1;
    if (ev.type === "complete") {
      add = 5;
      if (typeof ev.score === "number" && ev.total > 0 && ev.score / ev.total >= 0.9) add += 5;
    }
    add = Math.max(0, Math.min(add, DAY_CAP - s.dayStars));
    if (!add) return 0;
    s.stars += add; s.dayStars += add;

    // streak: first star of a new day
    if (s.lastDay !== day) {
      s.streak = s.lastDay && daysBetween(s.lastDay, day) === 1 ? s.streak + 1 : 1;
      s.lastDay = day;
      if (s.streak > s.best) s.best = s.streak;
      if (STREAK_GIFTS.indexOf(s.streak) >= 0) {
        s.news.push({ type: "streak", days: s.streak });
        giveGift(s, s.streak + "-day streak", ctx, now);
      }
    }
    // level-ups (a big lesson can jump more than one)
    var lv = levelOf(s.stars).n;
    while (s.level < lv) {
      s.level++;
      var L = levelOf(starsFor(s.level));
      s.news.push({ type: "level", n: s.level, name: L.name, emoji: L.emoji });
      giveGift(s, "Level " + s.level, ctx, now);
    }
    // surprise after a finished lesson, capped per day by the grown-up setting
    if (ev.type === "complete" && s.giftsToday < ctx.perDay && ctx.rand() < GIFT_CHANCE) {
      s.giftsToday++;
      giveGift(s, "Surprise!", ctx, now);
    }
    if (s.news.length > 30) s.news = s.news.slice(-30);
    return add;
  }

  /* ---------- storage (this page's learner) ---------- */
  function get(k) { try { var v = root.localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } }
  function put(k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function state() { return clean(get(KEY)); }
  function perDay() {
    try { return root.HubSettings ? HubSettings.get().gifts.perDay : 3; } catch (e) { return 3; }
  }
  var listeners = [];
  function emit(info) { listeners.forEach(function (fn) { try { fn(info); } catch (e) {} }); }

  function record(ev) {
    var s = state(), now = Date.now();
    var ctx = { rand: Math.random, perDay: perDay(), critters: [].concat(get("rw_critters") || []), app: (root.Tracker && Tracker.app) || "" };
    var added = apply(s, ev, now, ctx);
    if (!added) return 0;
    put(KEY, s);
    (ctx.effects || []).forEach(deliver);
    emit({ added: added, ev: ev, state: s });
    return added;
  }
  // Put a gift where the rest of the Hub already looks for it.
  function deliver(g) {
    if (g.kind === "tickets") {
      var t = parseInt(root.localStorage.getItem("rw_tickets") || "0", 10) || 0;
      root.localStorage.setItem("rw_tickets", String(t + g.amount));
    } else if (g.kind === "critter") {
      var c = get("rw_critters") || [];
      if (c.indexOf(g.id) < 0) { c.push(g.id); put("rw_critters", c); }
    } else if (g.kind === "sticker") {
      var al = get("kb_album") || {};
      (al.surprise = al.surprise || []).push({ e: g.e, n: g.n });
      put("kb_album", al);
    }
  }

  // A read-only summary for screens (Hub, pocket, Rewards Center).
  function summary(s, now) {
    s = clean(s); now = now || Date.now();
    var lv = levelOf(s.stars), wear = ITEMS.filter(function (it) { return it.id === s.wear; })[0] || null;
    return { stars: s.stars, today: s.day === dayOf(now) ? s.dayStars : 0, level: lv, streak: streakNow(s, now), best: s.best,
             gifts: s.gifts.slice(), items: ITEMS.filter(function (it) { return s.items.indexOf(it.id) >= 0; }), wear: wear };
  }

  /* ---------- hook the Tracker ---------- */
  function hook() {
    var T = root.Tracker;
    if (!T || T.__rewardKit) return;
    T.__rewardKit = true;
    var answer = T.answer, complete = T.complete;
    T.answer = function (ok) {
      var r = answer.apply(T, arguments);
      try { record({ type: "answer", ok: !!ok }); } catch (e) {}
      return r;
    };
    T.complete = function (what, score, total) {
      var r = complete.apply(T, arguments);
      try { record({ type: "complete", score: score, total: total }); } catch (e) {}
      return r;
    };
  }
  if (root.document) hook();

  var RewardKit = {
    KEY: KEY, DAY_CAP: DAY_CAP, GIFT_CHANCE: GIFT_CHANCE, STREAK_GIFTS: STREAK_GIFTS,
    LEVELS: LEVELS, CRITTERS: CRITTERS, STICKERS: STICKERS, ITEMS: ITEMS,
    starsFor: starsFor, levelOf: levelOf, dayOf: dayOf, daysBetween: daysBetween, fresh: fresh, clean: clean, apply: apply,
    state: state, record: record, summary: function () { return summary(state()); }, summaryOf: summary,
    onChange: function (fn) { listeners.push(fn); },
    // Celebrations waiting to be shown; seen() drops them once shown.
    news: function () { return state().news.slice(); },
    seen: function (n) { var s = state(); s.news = s.news.slice(n); put(KEY, s); },
    wear: function (id) { var s = state(); if (!id || s.items.indexOf(id) >= 0) { s.wear = id || ""; put(KEY, s); } },
    // Another learner's summary from raw keys (the Hub, which has no profile-store). id "" = guest.
    forKid: function (id) {
      var raw = root.ProfileStore ? ProfileStore.rawGet : function (k) { return root.localStorage.getItem(k); };
      var s = null; try { s = JSON.parse(raw((id ? "k" + id + "::" : "") + KEY)); } catch (e) {}
      return summary(s);
    }
  };
  root.RewardKit = RewardKit;
  if (typeof module !== "undefined" && module.exports) module.exports = RewardKit;
})(typeof window !== "undefined" ? window : globalThis);
