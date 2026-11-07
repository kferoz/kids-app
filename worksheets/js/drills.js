/* ============================================================
   Worksheets — math drills (fresh numbers every time)
   ------------------------------------------------------------
   WS_DRILLS = [{ id, grade, emoji, title, std, how, n, cols, make(r) }]
   make(r) returns ONE problem; r = seeded random helpers, so the same
   sheet number (seed) always prints the same problems and answer key.

   Problem kinds (rendered by app.js):
     { k:"h",    t:"7 + 5 =", a:"12" }               written across
     { k:"v",    top:"345", bot:"128", op:"+", a }    stacked in columns
     { k:"cmp",  l:"45", r:"54", a:"<" }              write <, > or =
     { k:"count",e:"🍎", n:7, a:"7" }                 count the pictures
     { k:"more", e:"⭐", l:3, r:5, a:"right" }        circle the bigger group
     { k:"pic",  e:"🍎", x:3, op:"+", y:2, a:"5" }    picture sums
     { k:"bar",  parts:4, shade:3, a:"3/4" }          shaded fraction bar
     { k:"trace",t:"7", a:"" }                        trace and write
     { k:"t",    t:"text with ___", a:"answer" }       any written item
   Standards: US Common Core codes (the Academy's spine, js/syllabus.js).
   ============================================================ */
(function () {
  "use strict";
  function R(seed) {
    var s = seed >>> 0 || 1;
    function next() { s += 0x6D2B79F5; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
    var r = {
      f: next,
      i: function (a, b) { return a + Math.floor(next() * (b - a + 1)); },
      pick: function (a) { return a[Math.floor(next() * a.length)]; },
      shuffle: function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(next() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
    };
    return r;
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  function frac(n, d) { var g = gcd(n, d); n /= g; d /= g; if (d === 1) return String(n); if (n > d) return Math.floor(n / d) + " " + (n % d) + "/" + d; return n + "/" + d; }
  function dec(x, p) { return String(parseFloat(x.toFixed(p))); }   // 2.50 → "2.5", 3.00 → "3"
  var PICS = ["🍎", "⭐", "🐟", "🌸", "🚗", "🐞", "🍪", "🎈", "🐥", "⚽"];
  function D(grade, id, emoji, title, std, how, n, cols, make) { return { id: grade + "-" + id, grade: grade, emoji: emoji, title: title, std: std, how: how, n: n, cols: cols, make: make }; }
  function h(t, a) { return { k: "h", t: t, a: String(a) }; }
  function v(x, op, y, a) { return { k: "v", top: String(x), bot: String(y), op: op, a: String(a) }; }

  var LIST = [
    /* ---------- Pre-K ---------- */
    D("pk", "count5", "🍎", "Count to 5", "K.CC.4 (Pre-K readiness)", "Count the pictures. Write how many.", 10, 2,
      function (r) { var n = r.i(1, 5); return { k: "count", e: r.pick(PICS), n: n, a: String(n) }; }),
    D("pk", "count10", "⭐", "Count to 10", "K.CC.5 (Pre-K readiness)", "Count the pictures. Write how many.", 10, 2,
      function (r) { var n = r.i(3, 10); return { k: "count", e: r.pick(PICS), n: n, a: String(n) }; }),
    D("pk", "more", "⚖️", "Which has more?", "K.CC.6 (Pre-K readiness)", "Circle the group that has MORE.", 8, 1,
      function (r) { var l = r.i(1, 6), m = r.i(1, 6); while (m === l) m = r.i(1, 6); return { k: "more", e: r.pick(PICS), l: l, r: m, a: l > m ? "left" : "right" }; }),
    D("pk", "trace", "✏️", "Trace numbers 0–10", "K.CC.3 (Pre-K readiness)", "Trace the gray numbers, then write your own.", 11, 1,
      function (r, i) { return { k: "trace", t: String(i), a: "" }; }),

    /* ---------- Kindergarten ---------- */
    D("kg", "count20", "🔢", "Count to 20", "K.CC.5", "Count the pictures. Write how many.", 10, 2,
      function (r) { var n = r.i(6, 20); return { k: "count", e: r.pick(PICS), n: n, a: String(n) }; }),
    D("kg", "add5", "➕", "Picture adding to 5", "K.OA.1", "Count both groups. Write the total.", 10, 2,
      function (r) { var x = r.i(1, 4), y = r.i(1, 5 - x); return { k: "pic", e: r.pick(PICS), x: x, op: "+", y: y, a: String(x + y) }; }),
    D("kg", "add10", "➕", "Add within 10", "K.OA.2", "Add. Use your fingers or draw dots.", 20, 4,
      function (r) { var x = r.i(0, 9), y = r.i(0, 10 - x); return h(x + " + " + y + " =", x + y); }),
    D("kg", "sub10", "➖", "Take away within 10", "K.OA.2", "Subtract. Cross out to help.", 20, 4,
      function (r) { var x = r.i(1, 10), y = r.i(0, x); return h(x + " − " + y + " =", x - y); }),
    D("kg", "bonds10", "🔟", "Make 10", "K.OA.4", "What number makes 10?", 20, 4,
      function (r) { var x = r.i(0, 10); return h(x + " + ___ = 10", 10 - x); }),
    D("kg", "seq", "🐾", "Missing numbers to 20", "K.CC.2", "Write the missing numbers.", 12, 2,
      function (r) { var s = r.i(0, 16), gap = r.i(1, 3), parts = []; for (var j = 0; j < 5; j++) parts.push(j === gap ? "___" : String(s + j)); return h(parts.join(", "), s + gap); }),
    D("kg", "cmp", "🐊", "Compare numbers to 10", "K.CC.7", "Write <, > or =. The crocodile eats the bigger number!", 20, 4,
      function (r) { var a = r.i(0, 10), b = r.f() < 0.15 ? a : r.i(0, 10); return { k: "cmp", l: String(a), r: String(b), a: a < b ? "<" : a > b ? ">" : "=" }; }),

    /* ---------- Grade 1 ---------- */
    D("g1", "add20", "➕", "Add within 20", "1.OA.6", "Add. Try making a ten first.", 30, 5,
      function (r) { var x = r.i(2, 10), y = r.i(2, 10); return h(x + " + " + y + " =", x + y); }),
    D("g1", "sub20", "➖", "Subtract within 20", "1.OA.6", "Subtract. Think: what do I add?", 30, 5,
      function (r) { var x = r.i(5, 20), y = r.i(1, Math.min(10, x)); return h(x + " − " + y + " =", x - y); }),
    D("g1", "missing", "❓", "Find the missing number", "1.OA.8", "What number makes it true?", 24, 4,
      function (r) { var x = r.i(1, 10), y = r.i(1, 10), s = x + y; return r.f() < 0.5 ? h(x + " + ___ = " + s, y) : h(s + " − ___ = " + x, y); }),
    D("g1", "tens", "🧱", "Tens and ones", "1.NBT.2", "Write the tens and ones.", 16, 2,
      function (r) { var n = r.i(11, 99); return h(n + " = ___ tens and ___ ones", Math.floor(n / 10) + " tens, " + (n % 10) + " ones"); }),
    D("g1", "cmp100", "🐊", "Compare 2-digit numbers", "1.NBT.3", "Write <, > or =.", 24, 4,
      function (r) { var a = r.i(10, 99), b = r.f() < 0.1 ? a : r.i(10, 99); return { k: "cmp", l: String(a), r: String(b), a: a < b ? "<" : a > b ? ">" : "=" }; }),
    D("g1", "add100", "💯", "Add within 100", "1.NBT.4", "Add the tens, then the ones.", 24, 4,
      function (r) { if (r.f() < 0.5) { var x = r.i(1, 8) * 10, y = r.i(1, 9 - x / 10) * 10; return h(x + " + " + y + " =", x + y); } var a = r.i(10, 89), b = r.i(1, 9); return h(a + " + " + b + " =", a + b); }),

    /* ---------- Grade 2 ---------- */
    D("g2", "addv", "➕", "2-digit addition (regrouping)", "2.NBT.5", "Add the ones first. Carry a ten if you need to.", 20, 5,
      function (r) { var x, y, k = 0; do { x = r.i(15, 79); y = r.i(12, 99 - x); } while (x % 10 + y % 10 < 10 && k++ < 50); return v(x, "+", y, x + y); }),   // ones always carry
    D("g2", "subv", "➖", "2-digit subtraction (regrouping)", "2.NBT.5", "Subtract the ones first. Trade a ten if you need to.", 20, 5,
      function (r) { var x, y, k = 0; do { x = r.i(30, 99); y = r.i(11, x - 5); } while (x % 10 >= y % 10 && k++ < 50); return v(x, "−", y, x - y); }),   // ones always trade
    D("g2", "add1000", "🏗️", "3-digit addition", "2.NBT.7", "Line up hundreds, tens and ones. Add.", 15, 5,
      function (r) { var x = r.i(105, 699), y = r.i(101, 999 - x); return v(x, "+", y, x + y); }),
    D("g2", "sub1000", "🏚️", "3-digit subtraction", "2.NBT.7", "Line up the places. Subtract.", 15, 5,
      function (r) { var x = r.i(300, 999), y = r.i(101, x - 50); return v(x, "−", y, x - y); }),
    D("g2", "skip", "🦘", "Skip counting", "2.NBT.2", "Fill in the missing numbers.", 12, 1,
      function (r) { var by = r.pick([2, 5, 10, 100]), s = by * r.i(0, by === 100 ? 4 : 15), gap = r.i(1, 4), parts = []; for (var j = 0; j < 6; j++) parts.push(j === gap ? "____" : String(s + j * by)); return h("Count by " + by + "s: " + parts.join(", "), s + gap * by); }),
    D("g2", "place", "🏠", "Hundreds, tens and ones", "2.NBT.3", "Write the number in expanded form.", 16, 2,
      function (r) { var n = r.i(101, 999); return h(n + " = ____ + ____ + ____", Math.floor(n / 100) * 100 + " + " + Math.floor(n % 100 / 10) * 10 + " + " + n % 10); }),
    D("g2", "groups", "🍪", "Equal groups", "2.OA.4", "Add the equal groups.", 16, 2,
      function (r) { var g = r.i(2, 5), s = r.i(2, 5), p = []; for (var j = 0; j < g; j++) p.push(s); return h(p.join(" + ") + " = ____  (" + g + " groups of " + s + ")", g * s); }),

    /* ---------- Grade 3 ---------- */
    D("g3", "mult10", "✖️", "Times tables 0–10", "3.OA.7", "Multiply. Know them by heart!", 40, 5,
      function (r) { var x = r.i(0, 10), y = r.i(1, 10); return h(x + " × " + y + " =", x * y); }),
    D("g3", "mult12", "🚀", "Times tables to 12 × 12", "3.OA.7 (UK: all tables by Year 4)", "Multiply. Beat your best time!", 40, 5,
      function (r) { var x = r.i(2, 12), y = r.i(2, 12); return h(x + " × " + y + " =", x * y); }),
    D("g3", "div", "➗", "Division facts", "3.OA.7", "Divide. Think of the times table.", 40, 5,
      function (r) { var x = r.i(2, 10), y = r.i(1, 10); return h(x * y + " ÷ " + x + " =", y); }),
    D("g3", "missfac", "❓", "Missing factors", "3.OA.4", "What number makes it true?", 30, 3,
      function (r) { var x = r.i(2, 10), y = r.i(2, 10); return h(x + " × ___ = " + x * y, y); }),
    D("g3", "round", "🎯", "Round to 10 and 100", "3.NBT.1", "Round each number.", 20, 2,
      function (r) { var n = r.i(11, 989), to = r.f() < 0.5 ? 10 : 100; return h("Round " + n + " to the nearest " + to + ": ____", Math.round(n / to) * to); }),
    D("g3", "addsub", "🏗️", "Add and subtract within 1000", "3.NBT.2", "Line up the places. Watch the sign!", 20, 5,
      function (r) { var x = r.i(150, 899), y = r.i(101, 899); if (r.f() < 0.5 && x + y < 1000) return v(x, "+", y, x + y); if (y > x) { var t = x; x = y; y = t; } return v(x, "−", y, x - y); }),
    D("g3", "fracbar", "🍫", "Name the fraction", "3.NF.1", "What fraction of the bar is shaded?", 12, 2,
      function (r) { var p = r.pick([2, 3, 4, 6, 8]), s = r.i(1, p - 1); return { k: "bar", parts: p, shade: s, a: s + "/" + p }; }),
    D("g3", "area", "🟩", "Area of rectangles", "3.MD.7", "Area = length × width. Write the units.", 12, 2,
      function (r) { var l = r.i(2, 12), w = r.i(2, 9), u = r.pick(["cm", "m", "in", "ft"]); return h("A rectangle is " + l + " " + u + " long and " + w + " " + u + " wide. Area = ______", l * w + " square " + u); }),

    /* ---------- Grade 4 ---------- */
    D("g4", "mult21", "✖️", "Multiply by 1 digit", "4.NBT.5", "Multiply. Carry when you need to.", 20, 5,
      function (r) { var x = r.i(12, 999), y = r.i(2, 9); return v(x, "×", y, x * y); }),
    D("g4", "mult22", "🧮", "2-digit × 2-digit", "4.NBT.5", "Use partial products or the column method.", 15, 5,
      function (r) { var x = r.i(12, 99), y = r.i(11, 99); return v(x, "×", y, x * y); }),
    D("g4", "divr", "➗", "Divide with remainders", "4.NBT.6", "Divide. Write the remainder with R.", 20, 4,
      function (r) { var d = r.i(2, 9), q = r.i(11, 199), rem = r.i(0, d - 1), n = d * q + rem; return h(n + " ÷ " + d + " =", q + (rem ? " R " + rem : "")); }),
    D("g4", "equiv", "🟰", "Equivalent fractions", "4.NF.1", "Fill in the missing number.", 20, 4,
      function (r) { var d = r.pick([2, 3, 4, 5, 6, 8, 10]), n = r.i(1, d - 1), k = r.i(2, 5); return r.f() < 0.5 ? h(n + "/" + d + " = ___/" + d * k, n * k) : h(n + "/" + d + " = " + n * k + "/___", d * k); }),
    D("g4", "addfrac", "➕", "Add and subtract fractions", "4.NF.3", "Same denominators: add or subtract the tops.", 20, 4,
      function (r) { var d = r.pick([3, 4, 5, 6, 8, 10, 12]), a = r.i(1, d - 1), b = r.i(1, d - 1); if (r.f() < 0.5) return h(a + "/" + d + " + " + b + "/" + d + " =", frac(a + b, d)); if (b > a) { var t = a; a = b; b = t; } return h(a + "/" + d + " − " + b + "/" + d + " =", a === b ? "0" : frac(a - b, d)); }),
    D("g4", "round", "🎯", "Round big numbers", "4.NBT.3", "Round each number.", 20, 2,
      function (r) { var n = r.i(1000, 99999), to = r.pick([10, 100, 1000]); return h("Round " + n.toLocaleString("en-US") + " to the nearest " + to.toLocaleString("en-US") + ": ______", (Math.round(n / to) * to).toLocaleString("en-US")); }),
    D("g4", "deccmp", "🐊", "Compare decimals", "4.NF.7", "Write <, > or =.", 24, 4,
      function (r) { var a = r.i(1, 99) / 100, b = r.f() < 0.5 ? r.i(1, 9) / 10 : r.i(1, 99) / 100; return { k: "cmp", l: dec(a, 2), r: dec(b, 2), a: a < b ? "<" : a > b ? ">" : "=" }; }),
    D("g4", "factors", "🔍", "Factors and multiples", "4.OA.4", "List all the factors.", 12, 2,
      function (r) { var n = r.i(6, 60), f = []; for (var j = 1; j <= n; j++) if (n % j === 0) f.push(j); return h("Factors of " + n + ": ______________", f.join(", ")); }),

    /* ---------- Grade 5 ---------- */
    D("g5", "decadd", "➕", "Add and subtract decimals", "5.NBT.7", "Line up the decimal points.", 20, 5,
      function (r) { var x = r.i(110, 9999) / 100, y = r.i(110, 9999) / 100; if (r.f() < 0.5) return v(x.toFixed(2), "+", y.toFixed(2), (x + y).toFixed(2)); if (y > x) { var t = x; x = y; y = t; } return v(x.toFixed(2), "−", y.toFixed(2), (x - y).toFixed(2)); }),
    D("g5", "dec10", "🔟", "Multiply and divide by 10, 100, 1000", "5.NBT.2", "Move the digits, not the point!", 24, 3,
      function (r) { var x = r.i(1, 9999) / 100, p = r.pick([10, 100, 1000]); return r.f() < 0.5 ? h(dec(x, 2) + " × " + p + " =", dec(x * p, 2)) : h(dec(x, 2) + " ÷ " + p + " =", dec(x / p, 5)); }),
    D("g5", "mult32", "🧮", "Multi-digit multiplication", "5.NBT.5", "Use the standard algorithm.", 15, 5,
      function (r) { var x = r.i(102, 999), y = r.i(11, 99); return v(x, "×", y, x * y); }),
    D("g5", "div2", "➗", "Divide by 2-digit numbers", "5.NBT.6", "Divide. Write any remainder with R.", 16, 4,
      function (r) { var d = r.i(11, 39), q = r.i(12, 99), rem = r.f() < 0.5 ? 0 : r.i(1, d - 1); return h(d * q + rem + " ÷ " + d + " =", q + (rem ? " R " + rem : "")); }),
    D("g5", "fracunlike", "🍕", "Add and subtract unlike fractions", "5.NF.1", "Find a common denominator. Simplify.", 20, 4,
      function (r) { var b = r.pick([2, 3, 4, 5, 6, 8]), d = r.pick([2, 3, 4, 5, 6, 8]); while (d === b) d = r.pick([2, 3, 4, 5, 6, 8]); var a = r.i(1, b - 1), c = r.i(1, d - 1), L = b * d / gcd(b, d), n1 = a * L / b, n2 = c * L / d; if (r.f() < 0.5 || n1 < n2) return h(a + "/" + b + " + " + c + "/" + d + " =", frac(n1 + n2, L)); return h(a + "/" + b + " − " + c + "/" + d + " =", n1 === n2 ? "0" : frac(n1 - n2, L)); }),
    D("g5", "fracmult", "✖️", "Multiply fractions", "5.NF.4", "Multiply the tops and the bottoms. Simplify.", 20, 4,
      function (r) { var b = r.i(2, 9), d = r.i(2, 9), a = r.i(1, b - 1), c = r.i(1, d - 1); if (r.f() < 0.3) { var w = r.i(2, 12); return h(w + " × " + a + "/" + b + " =", frac(w * a, b)); } return h(a + "/" + b + " × " + c + "/" + d + " =", frac(a * c, b * d)); }),
    D("g5", "ops", "🧩", "Order of operations", "5.OA.1", "Brackets first, then × and ÷, then + and −.", 20, 2,
      function (r) { var a = r.i(2, 9), b = r.i(2, 9), c = r.i(2, 9), t = r.i(0, 3); if (t === 0) return h("(" + a + " + " + b + ") × " + c + " =", (a + b) * c); if (t === 1) return h(a + " + " + b + " × " + c + " =", a + b * c); if (t === 2) return h(a * c + " ÷ " + c + " + " + b + " =", a + b); return h(a + " × (" + (b + c) + " − " + c + ") =", a * b); }),
    D("g5", "volume", "📦", "Volume of boxes", "5.MD.5", "Volume = length × width × height.", 12, 2,
      function (r) { var l = r.i(2, 12), w = r.i(2, 9), ht = r.i(2, 9), u = r.pick(["cm", "m", "in", "ft"]); return h("A box is " + l + " × " + w + " × " + ht + " " + u + ". Volume = ______", l * w * ht + " cubic " + u); })
  ];

  // problems for one sheet: n items, no repeats when possible
  function build(drill, seed) {
    var r = R(seed), out = [], seen = {};
    for (var i = 0, tries = 0; out.length < drill.n && tries < drill.n * 40; tries++) {
      var p = drill.make(r, out.length), key = JSON.stringify(p);
      if (seen[key] && tries < drill.n * 30) continue;
      seen[key] = 1; out.push(p); i++;
    }
    return out;
  }
  window.WS_DRILLS = { list: LIST, build: build, rng: R, forGrade: function (g) { return LIST.filter(function (d) { return d.grade === g; }); },
                       get: function (id) { return LIST.filter(function (d) { return d.id === id; })[0] || null; } };
})();
