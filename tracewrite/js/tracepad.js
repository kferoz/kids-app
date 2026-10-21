/* ============================================================
   TracePad — finger tracing on a canvas, checked kindly
   ------------------------------------------------------------
   Shared by tracewrite/ (KG handwriting) and arabic/ (Arabic letters).
   The two copies must stay IDENTICAL: edit one, then cp it over.

   TracePad.mount(host, opts) → pad
   Two ways to describe what to trace:
   • strokes — opts.strokes = [{ d: "M.. C.." } | { dot: [x, y] }] in
     viewBox units (opts.w × opts.h). Each stroke has a start dot and an
     arrow; the child traces them in order (opts.order, default true
     unless guide is "none"). One long stroke may cover several guide
     strokes, the way kids really write "a" without lifting.
   • glyph — opts.glyph = { text, family, rtl } draws a font letter.
     There is no stroke data, so the check compares ink with the letter's
     shape: ink must stay ON the letter, cover its body, and touch every
     separate piece (the dots of ب ت ث are separate pieces).
   opts.guide: "full" (dotted path + start dots + arrows) | "faint" (a ghost) | "none"
   opts.lines: { top, mid, base, desc } draws handwriting lines (y values)
   opts.onStroke(info) after each finger lift: { ok, reason, startOK, reversed, left }
   opts.onDone({ fails }) when the whole letter / word is traced
   pad.demo() → Promise (animates the strokes), pad.clear(), pad.destroy()
   ============================================================ */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg", sampler = null;

  function samplePath(d, step) {
    if (!sampler) {
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("width", "0"); svg.setAttribute("height", "0");
      svg.style.cssText = "position:absolute;left:-9999px;top:0";
      sampler = document.createElementNS(NS, "path");
      svg.appendChild(sampler); document.body.appendChild(svg);
    }
    sampler.setAttribute("d", d);
    var len = sampler.getTotalLength(), n = Math.max(2, Math.ceil(len / (step || 2))), pts = [];
    for (var i = 0; i <= n; i++) { var p = sampler.getPointAtLength(len * i / n); pts.push({ x: p.x, y: p.y }); }
    return pts;
  }
  function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.sqrt(dx * dx + dy * dy); }
  function near(p, pts, tol) { for (var i = 0; i < pts.length; i++) if (dist(p, pts[i]) <= tol) return true; return false; }
  function pathLen(pts) { var s = 0; for (var i = 1; i < pts.length; i++) s += dist(pts[i - 1], pts[i]); return s; }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function mount(host, opts) {
    var W = opts.w, H = opts.h, guide = opts.guide || "full";
    var ordered = opts.order != null ? opts.order : guide !== "none";
    var free = guide === "none";
    var tol = opts.tol || H * (free ? 0.11 : guide === "faint" ? 0.095 : 0.085);
    var brush = opts.brush || H * 0.06;
    var ink = opts.ink || "#7048e8";
    var glyph = opts.glyph || null;

    host.innerHTML = "";
    var wrap = document.createElement("div");
    wrap.className = "tp-wrap" + (glyph ? " tp-glyph" : "");
    wrap.style.aspectRatio = W + " / " + H;
    var gC = document.createElement("canvas"), iC = document.createElement("canvas");
    gC.className = "tp-guide"; iC.className = "tp-ink";
    var hand = document.createElement("span"); hand.className = "tp-hand"; hand.textContent = "✏️"; hand.hidden = true;
    wrap.appendChild(gC); wrap.appendChild(iC); wrap.appendChild(hand);
    host.appendChild(wrap);

    var g = gC.getContext("2d"), ic = iC.getContext("2d"), scale = 1, dpr = Math.min(2, window.devicePixelRatio || 1);
    var strokes = [], done = [], kept = [], cur = null, busy = false, finished = false, fails = 0, alive = true;

    if (!glyph) {
      strokes = opts.strokes.map(function (s) {
        if (s.dot) return { dot: { x: s.dot[0], y: s.dot[1] }, pts: [{ x: s.dot[0], y: s.dot[1] }], len: 0 };
        var pts = samplePath(s.d, H / 70);
        return { d: s.d, pts: pts, len: pathLen(pts) };
      });
      done = strokes.map(function () { return false; });
    }
    var allPts = [];
    strokes.forEach(function (s) { allPts = allPts.concat(s.pts); });
    wrap.__tp = { w: W, h: H, strokes: strokes };   // read by the automated tests

    /* ---------- glyph shape masks (low resolution is plenty) ---------- */
    var M = null;
    function buildMask() {
      var mh = 140, mw = Math.round(mh * W / H), k = mh / H;
      function draw(extra) {
        var c = document.createElement("canvas"); c.width = mw; c.height = mh;
        var x = c.getContext("2d"); x.scale(k, k); glyphText(x, extra); return x.getImageData(0, 0, mw, mh).data;
      }
      var core = draw(0), zone = draw(tol * 2.2);
      var on = new Uint8Array(mw * mh), inZone = new Uint8Array(mw * mh);
      for (var i = 0; i < mw * mh; i++) { on[i] = core[i * 4 + 3] > 110 ? 1 : 0; inZone[i] = zone[i * 4 + 3] > 40 ? 1 : 0; }
      // connected pieces of the letter: the body and each dot
      var lab = new Int32Array(mw * mh), parts = [], stack = [];
      for (i = 0; i < mw * mh; i++) {
        if (!on[i] || lab[i]) continue;
        var id = parts.length + 1, cells = [];
        stack.push(i); lab[i] = id;
        while (stack.length) {
          var j = stack.pop(), px = j % mw, py = (j / mw) | 0; cells.push(j);
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var nx = px + d[0], ny = py + d[1], n = ny * mw + nx;
            if (nx >= 0 && ny >= 0 && nx < mw && ny < mh && on[n] && !lab[n]) { lab[n] = id; stack.push(n); }
          });
        }
        if (cells.length >= 4) parts.push(cells);
      }
      parts.sort(function (a, b) { return b.length - a.length; });
      // centre line of every piece (Zhang-Suen thinning): coverage is measured ALONG the letter,
      // so a fat blob (the head of م) can't outweigh a thin tail
      var sk = thin(on, mw, mh);
      var skel = parts.map(function (cells) { return cells.filter(function (j) { return sk[j]; }); });
      M = { w: mw, h: mh, k: k, zone: inZone, parts: parts, skel: skel };
    }
    // for the automated tests: each letter piece as row runs [y, x0, x1] in viewBox units
    wrap.__tp.pieces = function () {
      if (!M) buildMask();
      return M.parts.map(function (cells) {
        var rows = {};
        cells.forEach(function (j) { var x = j % M.w, y = (j / M.w) | 0; var r = rows[y] || (rows[y] = [x, x]); r[0] = Math.min(r[0], x); r[1] = Math.max(r[1], x); });
        return Object.keys(rows).map(function (y) { return [(+y + 0.5) / M.k, rows[y][0] / M.k, (rows[y][1] + 1) / M.k]; });
      });
    };
    wrap.__tp.skeleton = function () {
      if (!M) buildMask();
      return M.skel.map(function (line) { return line.map(function (j) { return [(j % M.w + 0.5) / M.k, ((j / M.w | 0) + 0.5) / M.k]; }); });
    };
    function thin(src, w, h) {
      var img = Uint8Array.from(src), changed = true;
      while (changed) {
        changed = false;
        for (var step = 0; step < 2; step++) {
          var del = [];
          for (var y = 1; y < h - 1; y++) for (var x = 1; x < w - 1; x++) {
            var i = y * w + x; if (!img[i]) continue;
            var p = [img[i - w], img[i - w + 1], img[i + 1], img[i + w + 1], img[i + w], img[i + w - 1], img[i - 1], img[i - w - 1]];
            var b = p[0] + p[1] + p[2] + p[3] + p[4] + p[5] + p[6] + p[7]; if (b < 2 || b > 6) continue;
            var a = 0; for (var q = 0; q < 8; q++) if (!p[q] && p[(q + 1) % 8]) a++;
            if (a !== 1) continue;
            if (step === 0 ? (p[0] * p[2] * p[4] || p[2] * p[4] * p[6]) : (p[0] * p[2] * p[6] || p[0] * p[4] * p[6])) continue;
            del.push(i);
          }
          for (var d = 0; d < del.length; d++) img[del[d]] = 0;
          if (del.length) changed = true;
        }
      }
      return img;
    }
    function fitFont(x) {
      var px = H * 0.62;
      x.font = (glyph.weight || "700") + " " + px + "px " + glyph.family;
      var m = x.measureText(glyph.text);
      var gw = (m.actualBoundingBoxLeft || 0) + (m.actualBoundingBoxRight || m.width), gh = (m.actualBoundingBoxAscent || px * 0.7) + (m.actualBoundingBoxDescent || 0);
      var f = Math.min(H * 0.74 / (gh || 1), W * 0.84 / (gw || 1));
      px = px * f;
      x.font = (glyph.weight || "700") + " " + px + "px " + glyph.family;
      m = x.measureText(glyph.text);
      var asc = m.actualBoundingBoxAscent || px * 0.6, desc = m.actualBoundingBoxDescent || 0;
      var left = m.actualBoundingBoxLeft || 0, right = m.actualBoundingBoxRight || m.width;
      return { x: W / 2 + (left - right) / 2, y: H / 2 + (asc - desc) / 2 };
    }
    function glyphText(x, extra, style) {
      x.save();
      x.textAlign = "left"; x.textBaseline = "alphabetic";
      try { x.direction = "ltr"; } catch (e) {}
      var at = fitFont(x);
      if (style) style(x, at);
      else {
        x.fillStyle = "#000"; x.fillText(glyph.text, at.x, at.y);
        if (extra) { x.lineJoin = "round"; x.lineWidth = extra; x.strokeStyle = "#000"; x.strokeText(glyph.text, at.x, at.y); }
      }
      x.restore();
    }

    /* ---------- drawing ---------- */
    function size() {
      var r = wrap.getBoundingClientRect();
      if (!r.width) return;
      scale = r.width / W;
      [gC, iC].forEach(function (c) { c.width = Math.round(r.width * dpr); c.height = Math.round(r.height * dpr); });
      drawGuide(); redrawInk();
    }
    function toPx(x) { x.setTransform(scale * dpr, 0, 0, scale * dpr, 0, 0); }
    function drawLines() {
      var L = opts.lines; if (!L) return;
      g.lineCap = "round";
      function line(y, color, dash, wd) { g.beginPath(); g.setLineDash(dash || []); g.strokeStyle = color; g.lineWidth = wd || 1.4; g.moveTo(2, y); g.lineTo(W - 2, y); g.stroke(); }
      if (L.top != null) line(L.top, "#4dabf7", [], 1.6);
      if (L.mid != null) line(L.mid, "#91a7ff", [5, 5], 1.4);
      if (L.base != null) line(L.base, "#ff6b6b", [], 2);
      if (L.desc != null) line(L.desc, "#ced4da", [3, 6], 1.2);
      g.setLineDash([]);
    }
    function nextIndex() { for (var i = 0; i < done.length; i++) if (!done[i]) return i; return -1; }
    function arrowAt(pts, color) {
      var i = Math.min(pts.length - 2, Math.max(1, Math.round(pts.length * 0.35))), a = pts[i], b = pts[Math.min(pts.length - 1, i + 2)];
      var ang = Math.atan2(b.y - a.y, b.x - a.x), s = H * 0.045;
      g.save(); g.translate(a.x, a.y); g.rotate(ang);
      g.beginPath(); g.moveTo(s, 0); g.lineTo(-s * 0.7, -s * 0.75); g.lineTo(-s * 0.7, s * 0.75); g.closePath();
      g.fillStyle = color; g.fill(); g.restore();
    }
    function drawGuide() {
      toPx(g); g.clearRect(0, 0, W, H);
      drawLines();
      if (glyph) {
        if (guide === "none") return;
        glyphText(g, 0, function (x, at) {
          x.fillStyle = finished ? "rgba(47,191,113,.18)" : guide === "faint" ? "rgba(112,72,232,.08)" : "rgba(112,72,232,.12)";
          x.fillText(glyph.text, at.x, at.y);
          if (guide === "full") {
            x.setLineDash([H * 0.02, H * 0.02]); x.lineWidth = H * 0.008; x.strokeStyle = "rgba(112,72,232,.55)";
            x.strokeText(glyph.text, at.x, at.y); x.setLineDash([]);
          }
        });
        if (guide === "full" && glyph.rtl && !finished) {
          g.font = "700 " + H * 0.08 + "px sans-serif"; g.fillStyle = "#2fbf71"; g.textAlign = "right";
          g.fillText("start ➜", W - H * 0.04, H * 0.1);
        }
        return;
      }
      var nx = ordered ? nextIndex() : -1;
      g.lineCap = "round"; g.lineJoin = "round";
      strokes.forEach(function (s, i) {
        if (guide === "none" && !done[i]) return;
        var isNow = i === nx, col = done[i] ? "rgba(47,191,113,.35)" : guide === "faint" ? "rgba(73,80,87,.13)" : isNow ? "rgba(112,72,232,.55)" : "rgba(73,80,87,.28)";
        if (s.dot) {
          g.beginPath(); g.arc(s.dot.x, s.dot.y, H * 0.03, 0, Math.PI * 2);
          g.fillStyle = col; g.fill();
        } else {
          g.beginPath(); g.setLineDash(guide === "full" && !done[i] ? [H * 0.012, H * 0.03] : []);
          g.lineWidth = guide === "full" ? H * 0.035 : H * 0.05; g.strokeStyle = col;
          g.stroke(new Path2D(s.d)); g.setLineDash([]);
          if (guide === "full" && isNow) arrowAt(s.pts, "rgba(112,72,232,.85)");
        }
      });
      // start dot (green) with the stroke number
      var showStart = guide !== "none" ? (ordered ? [nx] : strokes.map(function (_, i) { return done[i] ? -1 : i; })) : [];
      showStart.forEach(function (i) {
        if (i < 0) return;
        var p = strokes[i].pts[0], r = H * 0.042;
        g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.fillStyle = "#2fbf71"; g.fill();
        g.lineWidth = H * 0.008; g.strokeStyle = "#fff"; g.stroke();
        g.fillStyle = "#fff"; g.font = "800 " + r * 1.3 + "px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(String(i + 1), p.x, p.y + r * 0.05);
      });
    }
    function strokePts(ctx, pts, color, wd) {
      if (!pts.length) return;
      ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = color; ctx.lineWidth = wd || brush;
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) ctx.lineTo(pts[0].x + 0.01, pts[0].y);
      for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    }
    function redrawInk() {
      toPx(ic); ic.clearRect(0, 0, W, H);
      kept.forEach(function (k) { strokePts(ic, k, finished ? "#2fbf71" : ink); });
      if (cur) strokePts(ic, cur, ink);
    }

    /* ---------- checking ---------- */
    function checkStrokes(u) {
      var len = pathLen(u), cands = [];
      if (ordered) { for (var i = nextIndex(); i >= 0 && i < strokes.length; i++) { if (done[i]) continue; cands.push(i); if (i === nextIndex() && strokes[i].dot) break; } }
      else strokes.forEach(function (_, i) { if (!done[i]) cands.push(i); });
      var covMin = free ? 0.6 : guide === "faint" ? 0.66 : 0.7;
      var prec = u.filter(function (p) { return near(p, allPts, tol * 1.5); }).length / u.length;
      var hit = [], best = 0, need = 0;
      for (var c = 0; c < cands.length; c++) {
        var s = strokes[cands[c]], ok;
        if (s.dot) ok = !hit.length && len < H * 0.22 && u.some(function (p) { return dist(p, s.dot) <= tol * 1.7; });
        else {
          // an extra stroke must be followed closely: a line that only CROSSES it (the stem of t
          // through its crossbar) covers part of it at normal tolerance, but not at half
          var tt = hit.length ? tol * 0.55 : tol;
          var cov = s.pts.filter(function (p) { return near(p, u, tt); }).length / s.pts.length;
          best = Math.max(best, cov); ok = cov >= covMin;
          // one finger stroke may finish several guide strokes ("a" without lifting), but only if
          // it is long enough to have drawn them all: the c of "a" touches its stem, yet is no stem
          need += s.len;
          if (ok && hit.length && len < need * 0.75) ok = false;
        }
        if (ok) hit.push(cands[c]);
        else if (ordered) break;                // in order: stop at the first stroke not covered
      }
      if (!hit.length || prec < (free ? 0.55 : 0.62)) {
        return { ok: false, reason: prec < 0.4 ? "off" : best > 0.3 ? "short" : len < H * 0.08 ? "tiny" : "off" };
      }
      var s0 = strokes[hit[0]], startOK = true, reversed = false;
      if (!s0.dot) {
        var a = s0.pts[0], z = s0.pts[s0.pts.length - 1];
        startOK = dist(u[0], a) <= tol * 2.2;
        reversed = !startOK && dist(u[0], z) < dist(u[0], a) && dist(a, z) > tol * 2;
      }
      hit.forEach(function (i) { done[i] = true; });
      return { ok: true, startOK: startOK, reversed: reversed, strokes: hit };
    }
    function checkGlyph() {
      if (!M) buildMask();
      var all = [];
      kept.forEach(function (k) { all = all.concat(k); });
      var last = kept[kept.length - 1] || [];
      function zoneHit(p) { var x = Math.round(p.x * M.k), y = Math.round(p.y * M.k); return x >= 0 && y >= 0 && x < M.w && y < M.h && M.zone[y * M.w + x]; }
      var inside = last.filter(zoneHit).length / Math.max(1, last.length);
      if (inside < 0.6) return { ok: false, reason: "off" };
      // how much of each letter piece the ink covers
      var c = document.createElement("canvas"); c.width = M.w; c.height = M.h;
      var x = c.getContext("2d"); x.scale(M.k, M.k);
      kept.forEach(function (k) { strokePts(x, k, "#000", Math.max(brush * 1.3, tol * 1.1)); });
      var d = x.getImageData(0, 0, M.w, M.h).data;
      // body: share of its centre line under the ink; small pieces (dots): any real touch
      var covs = M.parts.map(function (cells, n) {
        var line = M.skel[n].length >= 6 ? M.skel[n] : cells;
        return line.filter(function (j) { return d[j * 4 + 3] > 60; }).length / line.length;
      });
      var bodyOK = covs.length && covs[0] >= (free ? 0.75 : 0.82);
      var piecesOK = covs.slice(1).every(function (v) { return v >= 0.34; });
      if (bodyOK && piecesOK) return { ok: true, complete: true };
      return { ok: true, complete: false, missing: bodyOK ? "dots" : "body", left: M.parts.length };
    }

    /* ---------- pointer input ---------- */
    function pt(e) { var r = iC.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
    function down(e) {
      if (finished) return;
      if (busy) { demoToken++; busy = false; hand.hidden = true; }   // a touch stops "show me" so the child can draw
      e.preventDefault();
      try { iC.setPointerCapture(e.pointerId); } catch (err) {}
      cur = [pt(e)]; redrawInk();
    }
    function move(e) {
      if (!cur) return;
      e.preventDefault();
      var p = pt(e), q = cur[cur.length - 1];
      if (dist(p, q) < H * 0.006) return;
      cur.push(p);
      toPx(ic); strokePts(ic, [q, p], ink);
    }
    function up() {
      if (!cur) return;
      var u = cur; cur = null;
      if (glyph) {
        kept.push(u);
        var r = checkGlyph();
        if (!r.ok) { kept.pop(); fails++; redrawInk(); wobble(); }
        if (opts.onStroke) opts.onStroke(r);
        if (r.ok && r.complete) win();
        return;
      }
      var res = checkStrokes(u);
      wrap.__tp.last = res; wrap.__tp.lastU = u.length;
      if (res.ok) { kept.push(u); res.left = done.filter(function (x) { return !x; }).length; }
      else { fails++; wobble(); }
      redrawInk(); drawGuide();
      if (opts.onStroke) opts.onStroke(res);
      if (res.ok && !res.left) win();
    }
    function wobble() { wrap.classList.remove("tp-wobble"); void wrap.offsetWidth; wrap.classList.add("tp-wobble"); }
    function win() {
      finished = true; wrap.classList.add("tp-done");
      redrawInk(); drawGuide();
      if (opts.onDone) setTimeout(function () { if (alive) opts.onDone({ fails: fails }); }, 350);
    }
    iC.addEventListener("pointerdown", down);
    iC.addEventListener("pointermove", move);
    iC.addEventListener("pointerup", up);
    iC.addEventListener("pointercancel", up);
    var ro = window.ResizeObserver ? new ResizeObserver(size) : null;
    if (ro) ro.observe(wrap); else window.addEventListener("resize", size);
    size();
    // the pad captures the finger, so a child can't scroll by dragging on it: bring it fully into view
    setTimeout(function () {
      var r = wrap.getBoundingClientRect();
      if (alive && (r.bottom > window.innerHeight || r.top < 0)) wrap.scrollIntoView({ block: r.height < window.innerHeight ? "end" : "start" });
    }, 0);

    /* ---------- show me how ---------- */
    function demo() {
      if (busy) return Promise.resolve(false);
      busy = true;
      var my = ++demoToken;
      toPx(ic);
      var chain = Promise.resolve(true);
      if (glyph) {
        chain = chain.then(function () {
          var steps = 18;
          var p = Promise.resolve();
          for (var i = 1; i <= steps; i++) (function (i) {
            p = p.then(function () {
              if (my !== demoToken) return;
              redrawInk(); toPx(ic);
              ic.save(); ic.beginPath();
              var wv = W * i / steps;
              if (glyph.rtl) ic.rect(W - wv, 0, wv, H); else ic.rect(0, 0, wv, H);
              ic.clip();
              glyphText(ic, 0, function (x, at) { x.fillStyle = "rgba(255,138,61,.55)"; x.fillText(glyph.text, at.x, at.y); });
              ic.restore();
              return wait(55);
            });
          })(i);
          return p.then(function () { return wait(500); });
        });
      } else {
        var todo = strokes.map(function (_, i) { return i; }).filter(function (i) { return !done[i]; });
        todo.forEach(function (i) {
          chain = chain.then(function () {
            if (my !== demoToken) return;
            var s = strokes[i], n = s.pts.length, step = Math.max(1, Math.round(n / 28)), k = 1;
            hand.hidden = false;
            return new Promise(function (res) {
              (function tick() {
                if (my !== demoToken || !alive) return res();
                k = Math.min(n, k + step);
                toPx(ic); strokePts(ic, s.pts.slice(0, k), "rgba(255,138,61,.75)", brush * 0.9);
                var p = s.pts[k - 1];
                hand.style.left = (p.x / W * 100) + "%"; hand.style.top = (p.y / H * 100) + "%";
                if (k >= n) return setTimeout(res, 260);
                setTimeout(tick, 28);
              })();
            });
          });
        });
        chain = chain.then(function () { return wait(400); });
      }
      return chain.then(function () {
        hand.hidden = true; busy = false;
        if (alive) redrawInk();
        return my === demoToken;
      });
    }
    var demoToken = 0;

    return {
      demo: demo,
      clear: function () { demoToken++; busy = false; hand.hidden = true; kept = []; cur = null; finished = false; fails = 0; wrap.classList.remove("tp-done"); done = strokes.map(function () { return false; }); redrawInk(); drawGuide(); },
      isDone: function () { return finished; },
      fails: function () { return fails; },
      destroy: function () { alive = false; demoToken++; if (ro) ro.disconnect(); host.innerHTML = ""; }
    };
  }

  /* make sure a web font is ready before measuring a glyph with it */
  function ready(family) {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.race([document.fonts.load("700 80px " + family).catch(function () {}), wait(1500)]);
  }

  window.TracePad = { mount: mount, ready: ready };
})();
