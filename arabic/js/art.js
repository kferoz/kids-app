/* ============================================================
   Arabic Oasis — Jamal the Camel (the Arabic buddy)
   Art.jamal(mood): "happy" | "wow" | "think"
   ============================================================ */
(function () {
  "use strict";
  var OL = 'stroke="#3b2a1a" stroke-width="3" stroke-linejoin="round"';

  function jamal(mood) {
    var m = mood || "happy";
    var eyes = m === "happy"
      ? '<path d="M-14,-62 q5,-6 10,0 M6,-62 q5,-6 10,0" fill="none" stroke="#3b2a1a" stroke-width="3.5" stroke-linecap="round"/>'
      : '<circle cx="-9" cy="-62" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/><circle cx="11" cy="-62" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/>' +
        '<circle cx="-7.5" cy="-64" r="1.6" fill="#fff"/><circle cx="12.5" cy="-64" r="1.6" fill="#fff"/>';
    var mouth = m === "wow" ? '<ellipse cx="2" cy="-26" rx="6" ry="6" fill="#862e2e" ' + OL + '/>'
      : m === "think" ? '<path d="M-4,-26 h12" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M-8,-29 q10,10 20,0" fill="#ff8787" ' + OL + '/>';
    var extra = m === "think" ? '<text x="26" y="-90" font-size="20">💭</text>' : m === "wow" ? '<text x="24" y="-92" font-size="18">✨</text>' : "";
    return '<svg class="echo-svg jamal-svg" viewBox="-50 -112 100 124" aria-hidden="true">' +
      // neck + body hint with a hump
      '<path d="M-20,0 q-4,-20 2,-34 L18,-34 q6,14 2,34 z" fill="#d9a066" ' + OL + '/>' +
      '<path d="M-36,10 q6,-26 26,-24 q8,-14 22,-2 q20,-2 26,26 z" fill="#e0b07a" ' + OL + '/>' +
      // ears
      '<ellipse cx="-20" cy="-86" rx="6" ry="10" transform="rotate(-25 -20 -86)" fill="#d9a066" ' + OL + '/>' +
      '<ellipse cx="24" cy="-86" rx="6" ry="10" transform="rotate(25 24 -86)" fill="#d9a066" ' + OL + '/>' +
      // head + long snout
      '<ellipse cx="1" cy="-60" rx="26" ry="27" fill="#e8bd86" ' + OL + '/>' +
      '<ellipse cx="2" cy="-32" rx="20" ry="15" fill="#f3d3a8" ' + OL + '/>' +
      '<path d="M-6,-38 q2,3 0,5 M10,-38 q-2,3 0,5" fill="none" stroke="#3b2a1a" stroke-width="2.5" stroke-linecap="round"/>' +
      // tuft of hair + a tiny keffiyeh-style cap stripe
      '<path d="M-10,-86 q4,-10 10,-2 q4,-10 10,0" fill="#a0703f" ' + OL + '/>' +
      '<circle cx="-18" cy="-50" r="4" fill="#ffa8a8" opacity=".75"/><circle cx="20" cy="-50" r="4" fill="#ffa8a8" opacity=".75"/>' +
      eyes + mouth +
      '<path class="wing-flap" d="M30,4 q14,-10 14,-26" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/>' +
      extra + "</svg>";
  }

  window.Art = { jamal: jamal };
})();
