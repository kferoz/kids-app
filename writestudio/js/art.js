/* ============================================================
   Sentence Studio — Penny the Pencil (the writing buddy)
   Art.penny(mood): "happy" | "wow" | "think"
   ============================================================ */
(function () {
  "use strict";
  var OL = 'stroke="#3b2a1a" stroke-width="3" stroke-linejoin="round"';

  function penny(mood) {
    var m = mood || "happy";
    var eyes = m === "happy"
      ? '<path d="M-13,-58 q5,-6 10,0 M3,-58 q5,-6 10,0" fill="none" stroke="#3b2a1a" stroke-width="3.5" stroke-linecap="round"/>'
      : '<circle cx="-8" cy="-58" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/><circle cx="8" cy="-58" r="' + (m === "wow" ? 5.5 : 4.5) + '" fill="#3b2a1a"/>' +
        '<circle cx="-6.5" cy="-60" r="1.6" fill="#fff"/><circle cx="9.5" cy="-60" r="1.6" fill="#fff"/>';
    var mouth = m === "wow" ? '<ellipse cx="0" cy="-44" rx="5" ry="6" fill="#c92a2a" ' + OL + '/>'
      : m === "think" ? '<path d="M-6,-44 h12" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M-9,-46 q9,9 18,0" fill="#ff8787" ' + OL + '/>';
    var extra = m === "think" ? '<text x="26" y="-82" font-size="20">💭</text>' : m === "wow" ? '<text x="22" y="-84" font-size="18">✨</text>' : "";
    return '<svg class="echo-svg penny-svg" viewBox="-46 -112 96 124" aria-hidden="true">' +
      // eraser + metal band
      '<rect x="-20" y="-108" width="40" height="16" rx="7" fill="#ff8fab" ' + OL + '/>' +
      '<rect x="-21" y="-94" width="42" height="10" fill="#ced4da" ' + OL + '/>' +
      // body
      '<rect x="-21" y="-84" width="42" height="64" fill="#ffd43b" ' + OL + '/>' +
      '<path d="M-7,-84 v64 M7,-84 v64" stroke="#f59f00" stroke-width="2.5"/>' +
      // sharpened tip
      '<path d="M-21,-20 L0,10 L21,-20 z" fill="#f4d6a6" ' + OL + '/>' +
      '<path d="M-6,1.5 L0,10 L6,1.5 z" fill="#3b2a1a"/>' +
      // cheeks + face
      '<circle cx="-15" cy="-48" r="4" fill="#ffa8a8" opacity=".8"/><circle cx="15" cy="-48" r="4" fill="#ffa8a8" opacity=".8"/>' +
      eyes + mouth +
      // waving arm
      '<path class="wing-flap" d="M21,-50 q16,-4 20,-20" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M-21,-50 q-14,6 -16,18" fill="none" stroke="#3b2a1a" stroke-width="4" stroke-linecap="round"/>' +
      extra + "</svg>";
  }

  window.Art = { penny: penny };
})();
