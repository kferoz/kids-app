/* ============================================================
   dollars.js — the Dollar Bank: a real $1 for a really hard win
   ------------------------------------------------------------
   Every learning app has a few "$1 challenges": big, hard wins
   like finishing a whole phase, passing a Phase Check, or a
   no-mistake run. Small everyday wins keep earning points and
   stickers; only these earn a dollar.

   Challenges are checked from the apps' own saved progress
   (trophies, lesson lists…), so no app has to call anything.
   A dollar earned is written once to the learner's ledger:

     kb_dollars = [{ id, ch, app, title, lv, amt, cur, ts, seen, paid, off }]   (ch = challenge id)

   Money follows the grown-up settings (js/settings.js, Admin → 💰 Money):
   each challenge pays one reward level (small/big/huge = Bronze/Silver/
   Gold; "big" unless Admin picks another), in the learner's currency
   (USD | INR). A row keeps the amount and currency it was earned at,
   so changing settings never rewrites past money. Old rows without
   `cur` are USD. With money switched off (device or learner) a win is
   still written, as `off` with amt 0, so switching it back on later
   does not back-pay.

   `seen` = the child saw the celebration (js/kidbar.js shows it).
   `paid` = a grown-up handed over the dollar (Admin → 💵 Dollars).
   kb_* keys are per learner (profile-store.js namespaces them).

   Load after tracker.js on app pages; Admin and the Rewards
   Center load it too, with a getter for any learner's keys.
   ============================================================ */
(function () {
  "use strict";
  if (window.DollarBank) return;

  var LEDGER = "kb_dollars", STREAK = "kb_streak", PERFECT = "kb_perfect";

  /* ---------- challenge builders ---------- */
  function arr(v) { return Array.isArray(v) ? v : []; }
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function has(list, id) { return arr(list).indexOf(id) >= 0; }
  // one dollar when a hard trophy is won
  function trophy(app, key, tid, title) {
    var id = app + ":" + tid;
    return { app: app, id: id, title: title,
      items: function (g) { return has(g(key), tid) ? [{ id: id, title: title }] : []; },
      progress: function (g) { return { have: has(g(key), tid) ? 1 : 0, need: 1 }; } };
  }
  // one dollar for every `n` of something (lessons, perfect problems…)
  function every(app, slug, n, title, unit, count) {
    return { app: app, id: app + ":" + slug, title: title, every: n, unit: unit,
      items: function (g) {
        var c = count(g), out = [];
        for (var i = 1; i <= Math.floor(c / n); i++) out.push({ id: app + ":" + slug + "#" + i, title: i === 1 ? title : title + " (" + i * n + " " + unit + " in all)" });
        return out;
      },
      progress: function (g) { var c = count(g); return { have: c % n, need: n, total: c }; } };
  }
  function topicsMastered(key) {
    return function (g) {
      var t = arr(g(key));
      return t.filter(function (x) { return /^topic:/.test(x) && t.indexOf("quiz:" + x.slice(6)) >= 0; }).length;
    };
  }

  var CHALLENGES = [
    /* ---- Kindergarten ---- */
    trophy("phonics", "ph_trophies", "letter-pro", "Finish every Letter Sounds lesson"),
    trophy("phonics", "ph_trophies", "sight-star", "Finish every Sight Words lesson"),
    trophy("phonics", "ph_trophies", "team-champ", "Finish every Sh, Ch, Th lesson"),
    trophy("phonics", "ph_trophies", "blend-champ", "Finish every Blends lesson"),
    trophy("phonics", "ph_trophies", "magic-champ", "Finish every Magic e lesson"),
    trophy("phonics", "ph_trophies", "all-books", "Read all 5 storybooks"),
    trophy("tracewrite", "tw_trophies", "phase-1", "Finish all of Phase 1"),
    trophy("tracewrite", "tw_trophies", "phase-2", "Finish all of Phase 2"),
    trophy("tracewrite", "tw_trophies", "phase-3", "Finish all of Phase 3"),
    trophy("arabic", "ar_trophies", "phase-1", "Finish all of Phase 1"),
    trophy("arabic", "ar_trophies", "phase-2", "Finish all of Phase 2"),
    trophy("arabic", "ar_trophies", "phase-3", "Finish all of Phase 3"),
    trophy("speedway", "sw_trophies", "english-ace", "Finish every English Street race"),
    trophy("speedway", "sw_trophies", "math-ace", "Finish every Math Motorway race"),
    trophy("speedway", "sw_trophies", "grand-prix", "Finish every race in the game"),
    trophy("kinder", "ll_trophies", "champion", "Win all 10 games"),
    trophy("kinder", "ll_trophies", "summer-champ", "Finish all Summer School games"),
    trophy("kinder", "ll_trophies", "stars:100", "Earn 100 stars"),
    trophy("reading", "rd_trophies", "perfect", "Finish a stage with no mistakes"),
    trophy("reading", "rd_trophies", "wizard", "Finish 6 stages"),
    trophy("reading", "rd_trophies", "champion", "Finish the whole trail"),
    every("homeschool", "lessons", 10, "Finish 10 lessons", "lessons", function (g) {
      var d = obj(g("hs_done")), n = 0; Object.keys(d).forEach(function (k) { n += arr(d[k]).length; }); return n;
    }),
    { app: "readingadventures", id: "readingadventures:stories", title: "Read stories perfectly on the first try (a grown-up sets how many)", quiet: true,
      items: function (g) {
        var r = obj(g("readingAdventuresRewards_v2")), out = [];
        ["kinder", "grade3"].forEach(function (gid) {
          arr(obj(r[gid]).events).forEach(function (e) {
            out.push({ id: "readingadventures:" + gid + "#" + e.milestoneNumber, amt: +e.amount || 1,
              title: e.storiesRequired + " perfect stories in a row" });
          });
        });
        return out;
      } },
    /* ---- 3rd grade ---- */
    { app: "readrocket", id: "readrocket:checks", title: "Pass a Phase Check (each one!)",
      items: function (g) {
        var c = obj(g("rr_checks"));
        return Object.keys(c).filter(function (k) { return obj(c[k]).passed; }).map(function (k) {
          return { id: "readrocket:check-" + k, title: "Passed the Phase " + k.replace(/\D/g, "") + " Check" };
        });
      },
      progress: function (g) { var c = obj(g("rr_checks")); return { have: Object.keys(c).filter(function (k) { return obj(c[k]).passed; }).length, need: 5, count: true }; } },
    trophy("writestudio", "ws_trophies", "perfect-5", "Get 3 stars on 5 pieces of writing"),
    trophy("writestudio", "ws_trophies", "story", "Write your own story"),
    trophy("writestudio", "ws_trophies", "all-levels", "Finish all the lessons"),
    trophy("detectives", "rc_trophies", "perfect", "Solve a case with no mistakes"),
    trophy("detectives", "rc_trophies", "cluewiz", "Get a perfect score in Clue Hunt"),
    trophy("detectives", "rc_trophies", "chief", "Solve all 15 cases"),
    trophy("clueisland", "ci_trophies", "sharp-eyes", "Clear an island with no re-reads"),
    trophy("clueisland", "ci_trophies", "half-way", "Finish 3 islands"),
    trophy("clueisland", "ci_trophies", "mapmaker", "Finish every island"),
    trophy("grandprix", "gp_trophies", "clean-sheet", "Answer all 10 right in one race"),
    trophy("grandprix", "gp_trophies", "season-champ", "Finish the season with 60+ points"),
    trophy("grandprix", "gp_trophies", "track-master", "Win all 8 Grands Prix"),
    trophy("multiply", "tt_trophies", "halfway", "Master 6 times tables"),
    trophy("multiply", "tt_trophies", "fluent", "Score 10+ on a Fluency Blast-off"),
    trophy("multiply", "tt_trophies", "champion", "Master every table to 12×12"),
    every("grammar", "topics", 2, "Master 2 topics (every lesson + the quiz)", "topics", topicsMastered("gg_trophies")),
    trophy("grammar", "gg_trophies", "super-reader", "Finish every rescue story"),
    every("funfacts", "topics", 2, "Master 2 topics (every fact + the quiz)", "topics", topicsMastered("ff_trophies")),
    every("treasure", "maps", 2, "Dig up the treasure on 2 maps", "maps", function (g) {
      return arr(g("th_trophies")).filter(function (x) { return /^map:/.test(x); }).length;
    }),
    trophy("treasure", "th_trophies", "master", "Finish every map"),
    every("subtraction", "clean", 15, "Solve 15 problems with no mistakes", "problems", function (g) {
      var s = obj(obj(g("numberExplorersProgress_v1")).stars);
      return Object.keys(s).filter(function (k) { return s[k] >= 2; }).length;
    }),
    { app: "timesquest", id: "timesquest:exam18", title: "Score 18 or more of 20 in Exam Mode",
      items: function (g) { return (obj(g("timesTableQuest_v2")).examBest || 0) >= 18 ? [{ id: "timesquest:exam18", title: "18+ of 20 in Exam Mode" }] : []; },
      progress: function (g) { return { have: Math.min(18, obj(g("timesTableQuest_v2")).examBest || 0), need: 18 }; } },
    { app: "timesquest", id: "timesquest:exam20", title: "Get all 20 right in Exam Mode",
      items: function (g) { return (obj(g("timesTableQuest_v2")).examBest || 0) >= 20 ? [{ id: "timesquest:exam20", title: "A perfect 20 in Exam Mode" }] : []; },
      progress: function (g) { return { have: obj(g("timesTableQuest_v2")).examBest || 0, need: 20 }; } },
    { app: "stickerquest", id: "stickerquest:all", title: "Finish the whole quest: every fact family, 3 ways for every equal-groups problem, and the reading",
      items: function (g) {
        var c = obj(obj(g("stickerQuest_v1")).completed), gr = obj(c.groups);
        var n = arr(c.facts).length + Object.keys(gr).filter(function (k) { return arr(gr[k]).length >= 3; }).length + (c.reading ? 1 : 0);
        return n >= 15 ? [{ id: "stickerquest:all", title: "Finished all of Sticker Quest" }] : [];
      },
      progress: function (g) {
        var c = obj(obj(g("stickerQuest_v1")).completed), gr = obj(c.groups);
        return { have: arr(c.facts).length + Object.keys(gr).filter(function (k) { return arr(gr[k]).length >= 3; }).length + (c.reading ? 1 : 0), need: 15 };
      } },
    { app: "billofrights", id: "billofrights:perfect", title: "Build the whole answer with every check right",
      items: function (g) { return (obj(g(PERFECT)).billofrights || 0) >= 1 ? [{ id: "billofrights:perfect", title: "Built the whole answer" }] : []; },
      progress: function (g) { return { have: Math.min(1, obj(g(PERFECT)).billofrights || 0), need: 1 }; } },
    { app: "piratemath", id: "piratemath:streak15", title: "Answer 15 in a row right",
      items: function (g) { return (obj(g(STREAK)).piratemath || 0) >= 15 ? [{ id: "piratemath:streak15", title: "15 right in a row" }] : []; },
      progress: function (g) { return { have: Math.min(15, obj(g(STREAK)).piratemath || 0), need: 15 }; } },
    { app: "piratemath", id: "piratemath:streak30", title: "Answer 30 in a row right",
      items: function (g) { return (obj(g(STREAK)).piratemath || 0) >= 30 ? [{ id: "piratemath:streak30", title: "30 right in a row" }] : []; },
      progress: function (g) { return { have: Math.min(30, obj(g(STREAK)).piratemath || 0), need: 30 }; } }
  ];

  /* ---------- reading & writing a learner's keys ---------- */
  // getter(key) → parsed JSON (or null). Default: this page's learner.
  function localGetter(key) {
    try { var v = localStorage.getItem(key); return v == null ? null : JSON.parse(v); } catch (e) { return null; }
  }
  function localSetter(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }

  function ledger(g) { return arr((g || localGetter)(LEDGER)); }

  /* ---------- money settings (HubSettings) ---------- */
  // Which learner a getter belongs to: forKid() getters carry .kid; otherwise this page's learner.
  function kidOf(g) {
    if (g && g.kid != null) return g.kid;
    try { return (window.ProfileStore ? ProfileStore.rawGet("hub_activeKid") : localStorage.getItem("hub_activeKid")) || ""; } catch (e) { return ""; }
  }
  var HS = function () { return window.HubSettings || null; };
  function money(kid) {
    return HS() ? HS().moneyFor(kid) : { enabled: true, currency: "USD", levels: [{ id: "big", amounts: { USD: 1, INR: 100 } }] };
  }
  function on(kid) { return money(kid == null ? kidOf() : kid).enabled; }
  // The reward level a challenge pays: Admin's choice, else the challenge's own, else Silver ("big").
  function levelOf(c) {
    var pick = HS() ? HS().get().money.levelOf : null;
    return (pick && pick[c.id]) || c.lv || "big";
  }
  function amountOf(lv, kid) {
    var m = money(kid), L = m.levels.filter(function (l) { return l.id === lv; })[0];
    return { value: L ? Number(L.amounts[m.currency]) || 0 : 0, cur: m.currency };
  }
  function fmt(value, cur) {
    cur = cur || "USD";
    if (HS()) return HS().format(value, cur);
    return (cur === "INR" ? "₹" : "$") + (Math.round(value) === value ? value : value.toFixed(2));
  }
  // Rows → "$3" or "$1 + ₹200" (a family that switched currency).
  function sumText(rows) {
    var by = {}, order = [];
    rows.forEach(function (e) { if (e.off) return; var c = e.cur || "USD"; if (!(c in by)) { by[c] = 0; order.push(c); } by[c] += e.amt == null ? 1 : e.amt; });
    if (!order.length) return fmt(0, money(kidOf()).currency);
    return order.map(function (c) { return fmt(Math.round(by[c] * 100) / 100, c); }).join(" + ");
  }
  function bankName(kid) { return money(kid == null ? kidOf() : kid).currency === "INR" ? "Rupee Bank" : "Dollar Bank"; }

  // Every dollar this learner has earned, by the challenges' rules.
  function earnedNow(g) {
    var out = [];
    CHALLENGES.forEach(function (c) {
      var items = []; try { items = c.items(g); } catch (e) {}
      items.forEach(function (it) { out.push({ id: it.id, ch: c.id, app: c.app, title: it.title, lv: levelOf(c), times: it.amt || 1, quiet: !!c.quiet }); });
    });
    return out;
  }
  // Add any newly earned dollars to the ledger. Returns the new entries.
  function sync(g, s) {
    g = g || localGetter; s = s || localSetter;
    var L = ledger(g), ids = {}, fresh = [], kid = kidOf(g), live = on(kid);
    L.forEach(function (e) { ids[e.id] = 1; });
    earnedNow(g).forEach(function (e) {
      if (ids[e.id]) return;
      // `times` = how many of the level's amount (Reading Adventures sets its own count)
      var a = amountOf(e.lv, kid);
      var row = { id: e.id, ch: e.ch, app: e.app, title: e.title, lv: e.lv, amt: live ? Math.round(a.value * e.times * 100) / 100 : 0, cur: a.cur,
                  ts: Date.now(), seen: live ? e.quiet : true, paid: 0 };
      if (!live) row.off = true;
      L.push(row); fresh.push(row); ids[e.id] = 1;
    });
    if (fresh.length) s(LEDGER, L);
    return fresh;
  }
  // earned / paid / owed: numbers for the learner's current currency; text: every currency ("$3 + ₹200").
  function totals(g) {
    var cur = money(kidOf(g)).currency, L = ledger(g).filter(function (e) { return !e.off; });
    var t = { earned: 0, paid: 0, owed: 0, count: L.length, cur: cur };
    L.forEach(function (e) {
      if ((e.cur || "USD") !== cur) return;
      var a = e.amt == null ? 1 : e.amt; t.earned += a; if (e.paid) t.paid += a;
    });
    t.owed = Math.round((t.earned - t.paid) * 100) / 100;
    var unpaid = L.filter(function (e) { return !e.paid; }), paid = L.filter(function (e) { return e.paid; });
    t.text = { earned: sumText(L), paid: sumText(paid), owed: sumText(unpaid) };
    t.owedCount = unpaid.length;
    return t;
  }
  function markSeen(ids, g, s) {
    g = g || localGetter; s = s || localSetter;
    var L = ledger(g); L.forEach(function (e) { if (!ids || ids.indexOf(e.id) >= 0) e.seen = true; }); s(LEDGER, L);
  }
  function setPaid(id, paid, g, s) {
    var L = ledger(g); L.forEach(function (e) { if (id === "*" ? !e.paid && !e.off : e.id === id) e.paid = paid ? Date.now() : 0; }); s(LEDGER, L);
  }
  // Challenges for one app, with where the learner stands.
  function challengesFor(app, g) {
    g = g || localGetter;
    var kid = kidOf(g);
    return CHALLENGES.filter(function (c) { return c.app === app; }).map(function (c) {
      var got = ledger(g).filter(function (e) { return e.ch === c.id && !e.off; });
      var p = null; try { p = c.progress ? c.progress(g) : null; } catch (e) {}
      var lv = levelOf(c), a = amountOf(lv, kid);
      return { id: c.id, title: c.title, every: c.every, unit: c.unit, repeat: !!(c.every || c.app === "readrocket" || c.quiet),
        lv: lv, amountText: fmt(a.value, a.cur), earnedText: sumText(got),
        dollars: got.length, progress: p, done: got.length > 0 };
    });
  }

  /* ---------- streaks & perfect runs (for apps without trophies) ---------- */
  var run = 0;
  function bump(key, app, val, max) {
    var m = obj(localGetter(key)), old = m[app] || 0, nv = max ? Math.max(old, val) : old + val;
    if (nv !== old) { m[app] = nv; localSetter(key, m); }
  }
  function hookTracker() {
    var T = window.Tracker; if (!T || T.__bank) return; T.__bank = true;
    var ans = T.answer, done = T.complete;
    T.answer = function (ok) {
      run = ok ? run + 1 : 0;
      if (ok && run >= 5) bump(STREAK, T.app, run, true);
      return ans.apply(T, arguments);
    };
    T.complete = function (what, score, total) {
      if (typeof score === "number" && total >= 3 && score >= total) bump(PERFECT, T.app, 1, false);
      return done.apply(T, arguments);
    };
  }
  hookTracker();

  window.DollarBank = {
    CHALLENGES: CHALLENGES, LEDGER: LEDGER,
    sync: sync, totals: totals, ledger: ledger, markSeen: markSeen, setPaid: setPaid,
    challengesFor: challengesFor, earnedNow: earnedNow,
    on: on, levelOf: levelOf, amountOf: amountOf, fmt: fmt, sumText: sumText, bankName: bankName,
    // getter/setter pair for another learner's raw keys (Admin): id "" = guest
    forKid: function (id) {
      var ns = id ? "k" + id + "::" : "";
      var raw = window.ProfileStore ? ProfileStore.rawGet : function (k) { return localStorage.getItem(k); };
      var rawSet = window.ProfileStore ? ProfileStore.rawSet : function (k, v) { localStorage.setItem(k, v); };
      var g = function (k) { try { var v = raw(ns + k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } };
      g.kid = id || "";   // so sync/totals use this learner's money settings
      return { id: id || "", g: g, s: function (k, v) { try { rawSet(ns + k, JSON.stringify(v)); } catch (e) {} } };
    }
  };
})();
