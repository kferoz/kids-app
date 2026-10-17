/* ============================================================
   Charts — tiny dependency-free SVG charts for the Admin page
   ------------------------------------------------------------
   Follows the house data-viz rules: thin marks (bars ≤ 24px with a
   4px rounded data-end), 2px lines, 2px surface gaps between stacked
   segments, recessive hairline grids, one y-axis, a legend whenever
   there are 2+ series, a hover tooltip on every mark, and a
   "Show data table" view under every chart so nothing is hover-only.
   Colours come from CSS tokens (--s1…--s8, --seq-*) so dark mode is
   handled by the stylesheet, not here.

     Charts.columns(host, { labels, series:[{name, color, values}], stacked, fmt, height })
     Charts.line   (host, { labels, series:[{name, color, values, forecastFrom}], fmt, yMax, height })
     Charts.hbars  (host, rows:[{label, value, color, note}], { fmt, max })
     Charts.heatmap(host, { rows, cols, values:[[...]], fmt })
   ============================================================ */
window.Charts = (function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  /* ---------- shared tooltip ---------- */
  var tip = null;
  function ensureTip() {
    if (tip) return tip;
    tip = document.createElement("div");
    tip.className = "viz-tip"; tip.setAttribute("role", "status");
    document.body.appendChild(tip);
    return tip;
  }
  // lines: [{value, label, color}] — values lead, labels follow; built with textContent.
  function showTip(evt, title, lines) {
    var t = ensureTip(); t.innerHTML = "";
    if (title) { var h = document.createElement("div"); h.className = "viz-tip-h"; h.textContent = title; t.appendChild(h); }
    lines.forEach(function (l) {
      var row = document.createElement("div"); row.className = "viz-tip-row";
      if (l.color) { var k = document.createElement("span"); k.className = "viz-key"; k.style.background = l.color; row.appendChild(k); }
      var v = document.createElement("strong"); v.textContent = l.value; row.appendChild(v);
      if (l.label) { var s = document.createElement("span"); s.textContent = " " + l.label; row.appendChild(s); }
      t.appendChild(row);
    });
    t.style.display = "block";
    var x = evt.clientX, y = evt.clientY, w = t.offsetWidth, h2 = t.offsetHeight;
    var left = x + 14, top = y - h2 - 12;
    if (left + w > window.innerWidth - 8) left = x - w - 14;
    if (top < 8) top = y + 16;
    t.style.left = left + "px"; t.style.top = top + "px";
  }
  function hideTip() { if (tip) tip.style.display = "none"; }
  window.addEventListener("scroll", hideTip, { passive: true });

  /* ---------- helpers ---------- */
  function svg(w, h) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 " + w + " " + h);
    s.setAttribute("width", "100%"); s.setAttribute("height", h);
    s.setAttribute("class", "viz-svg");
    return s;
  }
  function node(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // Axis max = 4 × a clean step, so all five ticks are round numbers.
  function niceMax(v) {
    if (v <= 0) return 1;
    var raw = v / 4, p = Math.pow(10, Math.floor(Math.log10(raw))), n = raw / p;
    var step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : n <= 7.5 ? 7.5 : 10;
    return step * p * 4;
  }
  function fmtNum(v) {
    if (v == null || isNaN(v)) return "—";
    var a = Math.abs(v);
    if (a >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    if (a >= 1e4) return (v / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    return Math.round(v * 10) / 10 + "";
  }
  // Bar path: square at the baseline, 4px rounded data-end on top.
  function colPath(x, y, w, h, r) {
    if (h <= 0) return "";
    r = Math.min(r, w / 2, h);
    return "M" + x + "," + (y + h) + "V" + (y + r) + "Q" + x + "," + y + " " + (x + r) + "," + y +
           "H" + (x + w - r) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) + "V" + (y + h) + "Z";
  }
  function barPath(x, y, w, h, r) { // horizontal: square at left baseline, rounded right end
    if (w <= 0) return "";
    r = Math.min(r, h / 2, w);
    return "M" + x + "," + y + "H" + (x + w - r) + "Q" + (x + w) + "," + y + " " + (x + w) + "," + (y + r) +
           "V" + (y + h - r) + "Q" + (x + w) + "," + (y + h) + " " + (x + w - r) + "," + (y + h) + "H" + x + "Z";
  }
  function legend(series) {
    if (!series || series.length < 2) return null;
    var d = document.createElement("div"); d.className = "viz-legend";
    series.forEach(function (s) {
      var i = document.createElement("span"); i.className = "viz-legend-item";
      var k = document.createElement("span"); k.className = "viz-key" + (s.dashed ? " dashed" : ""); k.style.background = s.color;
      i.appendChild(k); i.appendChild(document.createTextNode(s.name));
      d.appendChild(i);
    });
    return d;
  }
  function table(headers, rows) {
    var det = document.createElement("details"); det.className = "viz-table";
    var sum = document.createElement("summary"); sum.textContent = "Show data table"; det.appendChild(sum);
    var wrap = document.createElement("div"); wrap.className = "viz-table-wrap";
    var t = document.createElement("table");
    var tr = document.createElement("tr");
    headers.forEach(function (h) { var th = document.createElement("th"); th.textContent = h; tr.appendChild(th); });
    var thead = document.createElement("thead"); thead.appendChild(tr); t.appendChild(thead);
    var tb = document.createElement("tbody");
    rows.forEach(function (r) {
      var row = document.createElement("tr");
      r.forEach(function (c) { var td = document.createElement("td"); td.textContent = c; row.appendChild(td); });
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); det.appendChild(wrap);
    return det;
  }
  function empty(host, msg) {
    host.innerHTML = "";
    var p = document.createElement("p"); p.className = "viz-empty"; p.textContent = msg || "No data yet for this view.";
    host.appendChild(p);
  }
  function width(host) { return Math.max(280, host.clientWidth || 600); }
  function yAxis(g, W, top, plotH, left, max, fmt) {
    for (var i = 0; i <= 4; i++) {
      var v = max * i / 4, y = top + plotH - plotH * i / 4;
      node("line", { x1: left, x2: W - 8, y1: y, y2: y, class: i === 0 ? "viz-base" : "viz-grid" }, g);
      var t = node("text", { x: left - 6, y: y + 4, "text-anchor": "end", class: "viz-tick" }, g);
      t.textContent = max < 4 ? (Math.round(v * 10) / 10) + "" : fmt(v);
    }
  }
  function xLabels(g, labels, xAt, y, maxLabels) {
    var every = Math.max(1, Math.ceil(labels.length / maxLabels));
    var last = labels.length - 1;
    labels.forEach(function (l, i) {
      // every Nth label plus the last one — but never one crowding the last
      if (i !== last && (i % every !== 0 || last - i < every)) return;
      var t = node("text", { x: xAt(i), y: y, "text-anchor": i === last && labels.length > 1 ? "end" : "middle", class: "viz-tick" }, g);
      t.textContent = l;
    });
  }

  /* ---------- stacked / grouped columns ---------- */
  function columns(host, o) {
    var series = o.series || [], labels = o.labels || [], fmt = o.fmt || fmtNum;
    var totals = labels.map(function (_, i) { return series.reduce(function (s, se) { return s + (se.values[i] || 0); }, 0); });
    if (!labels.length || !totals.some(function (v) { return v > 0; })) return empty(host, o.empty);
    host.innerHTML = "";
    var W = width(host), H = o.height || 220, left = 44, top = 12, bottom = 26, plotH = H - top - bottom;
    var max = niceMax(Math.max.apply(null, totals));
    var s = svg(W, H), g = node("g", {}, s);
    yAxis(g, W, top, plotH, left, max, fmt);
    var band = (W - left - 8) / labels.length, bw = Math.min(24, band * 0.62);
    var xAt = function (i) { return left + band * i + band / 2; };
    labels.forEach(function (lab, i) {
      var y0 = top + plotH, x = xAt(i) - bw / 2;
      var visible = series.filter(function (se) { return (se.values[i] || 0) > 0; });
      series.forEach(function (se) {
        var v = se.values[i] || 0; if (!v) return;
        var h = plotH * v / max;
        var isTop = visible[visible.length - 1] === se;
        var gap = isTop ? 0 : 2;                         // 2px surface gap between segments
        var p = node("path", { d: isTop ? colPath(x, y0 - h, bw, h, 4) : "M" + x + "," + (y0 - h + gap) + "h" + bw + "v" + (h - gap) + "h-" + bw + "Z",
                               style: "fill:" + se.color, class: "viz-mark", tabindex: "0" }, g);
        y0 -= h;
      });
      // one hit target per column covering the whole band
      var hit = node("rect", { x: left + band * i, y: top, width: band, height: plotH, class: "viz-hit" }, g);
      var show = function (e) {
        showTip(e, lab, series.map(function (se) { return { value: fmt(se.values[i] || 0), label: se.name, color: se.color }; })
          .concat(series.length > 1 ? [{ value: fmt(totals[i]), label: "total" }] : []));
      };
      hit.addEventListener("pointermove", show); hit.addEventListener("pointerleave", hideTip);
    });
    xLabels(g, labels, xAt, H - 8, Math.floor((W - left) / 46));
    host.appendChild(s);
    var lg = legend(series); if (lg) host.appendChild(lg);
    host.appendChild(table([o.xName || "Date"].concat(series.map(function (se) { return se.name; })).concat(series.length > 1 ? ["Total"] : []),
      labels.map(function (l, i) { return [l].concat(series.map(function (se) { return fmt(se.values[i] || 0); })).concat(series.length > 1 ? [fmt(totals[i])] : []); })));
  }

  /* ---------- line (with optional dashed forecast) ---------- */
  function line(host, o) {
    var series = o.series || [], labels = o.labels || [], fmt = o.fmt || fmtNum;
    var all = []; series.forEach(function (se) { se.values.forEach(function (v) { if (v != null) all.push(v); }); });
    if (!labels.length || !all.length) return empty(host, o.empty);
    host.innerHTML = "";
    var W = width(host), H = o.height || 220, left = 44, top = 12, bottom = 26, plotH = H - top - bottom;
    var max = o.yMax || niceMax(Math.max.apply(null, all));
    var s = svg(W, H), g = node("g", {}, s);
    yAxis(g, W, top, plotH, left, max, fmt);
    var step = labels.length > 1 ? (W - left - 18) / (labels.length - 1) : 0;
    var xAt = function (i) { return left + 8 + step * i; };
    var yAt = function (v) { return top + plotH - plotH * Math.min(v, max) / max; };
    series.forEach(function (se) {
      var ff = se.forecastFrom == null ? se.values.length : se.forecastFrom;
      function seg(from, to, dashed) {
        var d = "", started = false;
        for (var i = from; i <= to && i < se.values.length; i++) {
          var v = se.values[i]; if (v == null) { started = false; continue; }
          d += (started ? "L" : "M") + xAt(i) + "," + yAt(v); started = true;
        }
        if (d) node("path", { d: d, class: "viz-line" + (dashed ? " dashed" : ""), style: "stroke:" + se.color }, g);
      }
      seg(0, ff, false);
      if (ff < se.values.length) seg(ff, se.values.length - 1, true);
      // end-dot on the last actual point (ringed in the surface colour)
      for (var i = Math.min(ff, se.values.length - 1); i >= 0; i--) if (se.values[i] != null) {
        node("circle", { cx: xAt(i), cy: yAt(se.values[i]), r: 4.5, class: "viz-dot", style: "fill:" + se.color }, g); break;
      }
    });
    // crosshair + one tooltip for every series at that X
    var cross = node("line", { y1: top, y2: top + plotH, class: "viz-cross", visibility: "hidden" }, g);
    var hit = node("rect", { x: left, y: top, width: W - left, height: plotH, class: "viz-hit" }, g);
    hit.addEventListener("pointermove", function (e) {
      var r = s.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width);
      var i = Math.max(0, Math.min(labels.length - 1, Math.round((px - left - 8) / (step || 1))));
      cross.setAttribute("x1", xAt(i)); cross.setAttribute("x2", xAt(i)); cross.setAttribute("visibility", "visible");
      showTip(e, labels[i], series.filter(function (se) { return se.values[i] != null; }).map(function (se) {
        var fc = se.forecastFrom != null && i > se.forecastFrom;
        return { value: fmt(se.values[i]), label: se.name + (fc ? " (forecast)" : ""), color: se.color };
      }));
    });
    hit.addEventListener("pointerleave", function () { hideTip(); cross.setAttribute("visibility", "hidden"); });
    xLabels(g, labels, xAt, H - 8, Math.floor((W - left) / 52));
    host.appendChild(s);
    var lgSeries = series.slice();
    if (series.some(function (se) { return se.forecastFrom != null && se.forecastFrom < se.values.length - 1; }))
      lgSeries.push({ name: "Forecast (dashed)", color: "var(--ink-muted)", dashed: true });
    var lg = legend(lgSeries); if (lg) host.appendChild(lg);
    host.appendChild(table([o.xName || "Date"].concat(series.map(function (se) { return se.name; })),
      labels.map(function (l, i) { return [l].concat(series.map(function (se) { return se.values[i] == null ? "—" : fmt(se.values[i]) + (se.forecastFrom != null && i > se.forecastFrom ? " (forecast)" : ""); })); })));
  }

  /* ---------- horizontal bars (ranked categories) ---------- */
  function hbars(host, rows, o) {
    o = o || {}; var fmt = o.fmt || fmtNum;
    rows = rows.filter(function (r) { return r.value > 0 || o.keepZero; });
    if (!rows.length) return empty(host, o.empty);
    host.innerHTML = "";
    var W = width(host), rowH = 30, labelW = Math.min(170, W * 0.38), valW = 64, H = rows.length * rowH + 6;
    var max = o.max || Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;
    var s = svg(W, H), g = node("g", {}, s);
    var plotW = W - labelW - valW;
    node("line", { x1: labelW, x2: labelW, y1: 0, y2: H, class: "viz-base" }, g);
    rows.forEach(function (r, i) {
      var y = i * rowH + 6, bh = Math.min(18, rowH - 10);
      var lt = node("text", { x: labelW - 8, y: y + bh / 2 + 4, "text-anchor": "end", class: "viz-label" }, g);
      lt.textContent = r.label.length > 24 ? r.label.slice(0, 23) + "…" : r.label;
      var w = plotW * Math.min(r.value, max) / max;
      node("path", { d: barPath(labelW, y, Math.max(w, 2), bh, 4), style: "fill:" + (r.color || "var(--s1)"), class: "viz-mark" }, g);
      var vt = node("text", { x: labelW + w + 6, y: y + bh / 2 + 4, class: "viz-value" }, g);
      vt.textContent = fmt(r.value);
      var hit = node("rect", { x: 0, y: y - 4, width: W, height: rowH, class: "viz-hit" }, g);
      hit.addEventListener("pointermove", function (e) {
        showTip(e, r.label, [{ value: fmt(r.value), label: o.unit || "", color: r.color || "var(--s1)" }].concat(r.note ? [{ value: "", label: r.note }] : []));
      });
      hit.addEventListener("pointerleave", hideTip);
    });
    host.appendChild(s);
    host.appendChild(table([o.labelName || "Item", o.valueName || "Value"], rows.map(function (r) { return [r.label, fmt(r.value)]; })));
  }

  /* ---------- heatmap (weekday × hour) — sequential, one hue ---------- */
  function heatmap(host, o) {
    var vals = o.values, max = 0;
    vals.forEach(function (row) { row.forEach(function (v) { if (v > max) max = v; }); });
    if (!max) return empty(host, o.empty);
    host.innerHTML = "";
    var W = width(host), left = 40, top = 4, cols = o.cols.length;
    var cw = (W - left - 4) / cols, ch = Math.max(16, Math.min(26, cw)), H = top + ch * o.rows.length + 22;
    var s = svg(W, H), g = node("g", {}, s);
    var steps = ["--seq-1", "--seq-2", "--seq-3", "--seq-4", "--seq-5", "--seq-6"];
    o.rows.forEach(function (rl, r) {
      var t = node("text", { x: left - 6, y: top + ch * r + ch / 2 + 4, "text-anchor": "end", class: "viz-tick" }, g);
      t.textContent = rl;
      o.cols.forEach(function (cl, c) {
        var v = vals[r][c] || 0;
        var idx = v ? Math.min(steps.length - 1, Math.floor((v / max) * (steps.length - 1) + 0.5)) : -1;
        var cell = node("rect", { x: left + cw * c + 1, y: top + ch * r + 1, width: Math.max(1, cw - 2), height: ch - 2, rx: 3,
                                  style: "fill:" + (idx < 0 ? "var(--grid)" : "var(" + steps[idx] + ")"), class: "viz-cell" }, g);
        cell.addEventListener("pointermove", function (e) { showTip(e, rl + " " + o.colTitle(c), [{ value: (o.fmt || fmtNum)(v), label: o.unit || "" }]); });
        cell.addEventListener("pointerleave", hideTip);
      });
    });
    o.cols.forEach(function (cl, c) {
      if (c % 3 !== 0) return;
      var t = node("text", { x: left + cw * c + cw / 2, y: H - 6, "text-anchor": "middle", class: "viz-tick" }, g);
      t.textContent = cl;
    });
    host.appendChild(s);
    var tb = [];
    o.rows.forEach(function (rl, r) { o.cols.forEach(function (cl, c) { if (vals[r][c]) tb.push([rl, o.colTitle(c), (o.fmt || fmtNum)(vals[r][c])]); }); });
    host.appendChild(table(["Day", "Hour", o.unit || "Value"], tb));
  }

  return { columns: columns, line: line, hbars: hbars, heatmap: heatmap, fmtNum: fmtNum, hideTip: hideTip };
})();
