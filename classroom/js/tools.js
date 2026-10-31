/* ============================================================
   tools.js — Class Corner's toolkit maths (no screen code)
   ------------------------------------------------------------
   Shuffle, balanced groups, and a 0–100 loudness level from
   raw microphone samples. Pure functions, so Node tests them.
   rnd is any () => [0,1) function, Math.random by default.
   ============================================================ */
(function (root) {
  "use strict";

  function shuffle(list, rnd) {
    rnd = rnd || Math.random;
    var a = list.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // At most `size` per group, sizes differ by at most one: 7 by 3 → 3, 2, 2 (not 3, 3, 1).
  // Nobody is left alone: 3 by 2 → one group of 3, not 2 + 1.
  function makeGroups(list, size, rnd) {
    size = Math.max(2, Math.floor(+size) || 2);
    var a = shuffle(list, rnd), count = Math.max(1, Math.ceil(a.length / size));
    if (count > 1 && Math.floor(a.length / count) < 2) count--;
    var groups = [];
    for (var g = 0; g < count; g++) groups.push([]);
    a.forEach(function (x, i) { groups[i % count].push(x); });
    return groups.filter(function (g) { return g.length; });
  }

  // Root-mean-square of samples in [-1, 1] → 0…100 on a decibel scale,
  // where -60 dB (a quiet room) is 0 and 0 dB (the loudest) is 100.
  function level(samples) {
    var n = samples.length, sum = 0;
    if (!n) return 0;
    for (var i = 0; i < n; i++) sum += samples[i] * samples[i];
    var rms = Math.sqrt(sum / n);
    if (rms <= 0) return 0;
    var db = 20 * Math.log10(rms);
    return Math.max(0, Math.min(100, Math.round((db + 60) / 60 * 100)));
  }

  var ClassTools = { shuffle: shuffle, makeGroups: makeGroups, level: level };
  root.ClassTools = ClassTools;
  if (typeof module !== "undefined" && module.exports) module.exports = ClassTools;
})(typeof window !== "undefined" ? window : globalThis);
