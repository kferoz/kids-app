/* ============================================================
   Write & Trace — Scribbles the Crayon (the writing buddy)
   Art.scribbles(mood): "happy" | "wow" | "think"
   ============================================================ */
(function () {
  "use strict";
  var OL = 'stroke="#3b2a1a" stroke-width="3" stroke-linejoin="round"';

  function scribbles(mood) {
    var m = mood || "happy";
    var eyes = m === "happy"
      ? '<path d="M-13,-52 q5,-6 10,0 M3,-52 q5,-6 10,0" fill="none" stroke="#3b2a1a" stroke-width="3.5" stroke-linecap="round"/>'
      : '<circle cx="-8" cy="-52" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/><circle cx="8" cy="-52" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/>' +
        '<circle cx="-6.5" cy="-54" r="1.6" fill="#fff"/><circle cx="9.5" cy="-54" r="1.6" fill="#fff"/>';
    var mouth = m === "wow" ? '<ellipse cx="0" cy="-38" rx="5" ry="6" fill="#862e9c" ' + OL + '/>'
      : m === "think" ? '<path d="M-6,-38 h12" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M-9,-40 q9,9 18,0" fill="#ffc9c9" ' + OL + '/>';
    var extra = m === "think" ? '<text x="24" y="-84" font-size="20">💭</text>' : m === "wow" ? '<text x="22" y="-86" font-size="18">✨</text>' : "";
    return '<svg class="echo-svg scribbles-svg" viewBox="-46 -112 96 124" aria-hidden="true">' +
      // pointy wax tip
      '<path d="M-19,-82 L0,-110 L19,-82 z" fill="#9775fa" ' + OL + '/>' +
      // paper wrapper body with stripes
      '<rect x="-21" y="-84" width="42" height="86" rx="6" fill="#b197fc" ' + OL + '/>' +
      '<rect x="-21" y="-74" width="42" height="56" fill="#fff" ' + OL + '/>' +
      '<path d="M-21,-12 h42 M-21,-4 h42" stroke="#7048e8" stroke-width="3"/>' +
      '<path d="M-14,-24 q14,6 28,0" fill="none" stroke="#e599f7" stroke-width="2.5" stroke-dasharray="3 3"/>' +
      // cheeks + face
      '<circle cx="-14" cy="-42" r="4" fill="#ffa8a8" opacity=".8"/><circle cx="14" cy="-42" r="4" fill="#ffa8a8" opacity=".8"/>' +
      eyes + mouth +
      // arms: one waving
      '<path class="wing-flap" d="M21,-46 q16,-4 20,-20" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-21,-46 q-14,6 -16,18" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/>' +
      extra + "</svg>";
  }

  window.Art = { scribbles: scribbles };
})();
