/* ============================================================
   Read-Aloud Rocket — Nova the robot (the listening buddy)
   Art.nova(mood): "happy" | "listen" | "wow"
   ============================================================ */
(function () {
  "use strict";
  var OL = 'stroke="#1b2140" stroke-width="3" stroke-linejoin="round"';

  function eyes(mood) {
    if (mood === "happy") return '<path d="M-17,-62 q6,-7 12,0 M5,-62 q6,-7 12,0" fill="none" stroke="#7df9ff" stroke-width="4" stroke-linecap="round"/>';
    var r = mood === "wow" ? 7 : 5.5;
    return '<circle cx="-11" cy="-62" r="' + r + '" fill="#7df9ff"/><circle cx="11" cy="-62" r="' + r + '" fill="#7df9ff"/>' +
           '<circle cx="-9" cy="-64" r="2" fill="#fff"/><circle cx="13" cy="-64" r="2" fill="#fff"/>';
  }

  function nova(mood) {
    var m = mood || "happy";
    var mouth = m === "wow" ? '<ellipse cx="0" cy="-47" rx="5" ry="6" fill="#7df9ff"/>'
      : '<path d="M-9,-49 q9,8 18,0" fill="none" stroke="#7df9ff" stroke-width="3.5" stroke-linecap="round"/>';
    var waves = m === "listen"
      ? '<path class="ear-wave" d="M34,-72 q8,10 0,20 M42,-78 q13,16 0,32" fill="none" stroke="#ffd43b" stroke-width="3.5" stroke-linecap="round"/>' : "";
    return '<svg class="echo-svg nova-svg" viewBox="-50 -112 104 122" aria-hidden="true">' +
      // antenna
      '<path d="M0,-90 v-12" stroke="#1b2140" stroke-width="3"/><circle class="nova-blink" cx="0" cy="-104" r="5" fill="#ff6b6b" ' + OL + '/>' +
      // body + thruster
      '<path d="M-10,0 l4,10 h12 l4,-10 z" fill="#ffa94d" ' + OL + '/>' +
      '<rect x="-22" y="-36" width="44" height="38" rx="12" fill="#dbe4ff" ' + OL + '/>' +
      '<circle cx="0" cy="-17" r="8" fill="#ffd43b" ' + OL + '/>' +
      // arms
      '<path class="wing-flap" d="M-22,-28 q-16,4 -18,18" fill="none" stroke="#1b2140" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M22,-28 q16,4 18,18" fill="none" stroke="#1b2140" stroke-width="5" stroke-linecap="round"/>' +
      // head
      '<rect x="-30" y="-90" width="60" height="52" rx="18" fill="#748ffc" ' + OL + '/>' +
      '<rect x="-23" y="-80" width="46" height="34" rx="12" fill="#1b2140"/>' +
      eyes(m) + mouth +
      '<rect x="-36" y="-72" width="7" height="16" rx="3" fill="#ffd43b" ' + OL + '/><rect x="29" y="-72" width="7" height="16" rx="3" fill="#ffd43b" ' + OL + '/>' +
      waves + "</svg>";
  }

  window.Art = { nova: nova };
})();
