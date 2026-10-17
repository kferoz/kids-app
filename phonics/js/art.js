/* ============================================================
   Phonics Pals — illustration kit (hand-made SVG, no images)
   ------------------------------------------------------------
   Every story page describes its picture as data:
     art: { bg: "beach", items: [ [type, x, y, scale, opts], ... ] }
   x / y is where the item stands (its feet / base) inside a
   400 × 260 scene. opts:
     m  mood   happy | sad | mad | wow | sleep
     f  flip   true = face left
     a  anim   bounce | run | float | fly | wiggle | wag | shake | spin
     p  pose   stand | run | sit | up | hold | reach   (people)
     r  rotate degrees
     hold      prop drawn in a person's hand (hotdog | pop | jet | bag | hat | mitt)
   ============================================================ */
(function () {
  "use strict";

  var INK = "#3b2b20";
  var OL = 'stroke="' + INK + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
  var OL2 = 'stroke="' + INK + '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"';
  var uid = 0;

  /* ---------------- faces ---------------- */
  function eye(x, y, r, mood) {
    if (mood === "sleep") return '<path d="M' + (x - r) + ',' + y + ' Q' + x + ',' + (y + r * 1.2) + ' ' + (x + r) + ',' + y + '" fill="none" ' + OL2 + '/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#2b1d14"/>' +
           '<circle cx="' + (x + r * 0.35) + '" cy="' + (y - r * 0.35) + '" r="' + (r * 0.38) + '" fill="#fff"/>';
  }
  function brow(x, y, mood, len, dir) {
    // dir = 1 for the eye on the right, -1 for the left
    len = len || 6; dir = dir || 1;
    if (mood === "mad") return '<path d="M' + (x - len * dir) + ',' + (y + 3) + ' L' + (x + len * 0.7 * dir) + ',' + (y - 3) + '" fill="none" ' + OL2 + '/>';
    if (mood === "sad") return '<path d="M' + (x - len * dir) + ',' + (y - 3) + ' L' + (x + len * 0.7 * dir) + ',' + (y + 2) + '" fill="none" ' + OL2 + '/>';
    return "";
  }
  function mouth(x, y, w, mood) {
    switch (mood) {
      case "sad": return '<path d="M' + (x - w) + ',' + (y + w * 0.55) + ' Q' + x + ',' + (y - w * 0.55) + ' ' + (x + w) + ',' + (y + w * 0.55) + '" fill="none" ' + OL2 + '/>';
      case "mad": return '<path d="M' + (x - w) + ',' + (y + 1) + ' Q' + x + ',' + (y - 2) + ' ' + (x + w) + ',' + (y + 2) + '" fill="none" ' + OL2 + '/>';
      case "wow": return '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="' + (w * 0.45) + '" ry="' + (w * 0.6) + '" fill="#8a2f3b" ' + OL2 + '/>';
      case "sleep": return '<path d="M' + (x - w * 0.5) + ',' + (y + 1) + ' L' + (x + w * 0.5) + ',' + (y + 1) + '" fill="none" ' + OL2 + '/>';
      default: return '<path d="M' + (x - w) + ',' + y + ' Q' + x + ',' + (y + w * 1.2) + ' ' + (x + w) + ',' + y + ' Z" fill="#ff8fa0" ' + OL2 + '/>';
    }
  }
  function tear(x, y) { return '<path class="tear" d="M' + x + ',' + y + ' q-4,7 0,10 q4,-3 0,-10z" fill="#5fc4ff" stroke="#2f8fd0" stroke-width="1"/>'; }
  function cheek(x, y) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="4.5" ry="2.8" fill="#ff8fa0" opacity=".55"/>'; }
  function steam(x, y) { return '<path class="steam" d="M' + x + ',' + y + ' q-4,-6 0,-12 q4,-6 0,-12 M' + (x + 9) + ',' + (y + 2) + ' q-4,-6 0,-12 q4,-6 0,-12" fill="none" stroke="#ff5a5f" stroke-width="2.5" stroke-linecap="round"/>'; }
  function zzz(x, y) {
    return '<g class="zzz"><path d="M' + x + ',' + y + ' h8 l-8,8 h8 M' + (x + 12) + ',' + (y - 14) + ' h6 l-6,6 h6 M' + (x + 22) + ',' + (y - 25) + ' h5 l-5,5 h5" fill="none" stroke="#6b7bd6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  function face2(xl, xr, y, mood, eyeR, mouthY, mouthW) {
    var s = eye(xl, y, eyeR, mood) + eye(xr, y, eyeR, mood) +
            brow(xl, y - eyeR - 4, mood, 5, -1) + brow(xr, y - eyeR - 4, mood, 5, 1) +
            mouth((xl + xr) / 2, mouthY, mouthW, mood);
    if (mood === "sad") s += tear(xl - 1, y + eyeR + 2);
    if (mood === "happy" || !mood) s += cheek(xl - 4, mouthY - 2) + cheek(xr + 4, mouthY - 2);
    return s;
  }

  /* ---------------- characters ---------------- */
  // Al — a big, friendly green dinosaur (about 165 tall)
  function al(o) {
    var m = o.m || "happy", g = "#7bd389", d = "#4fae63", belly = "#dff7cf";
    var s =
      '<path d="M-40,-50 Q-90,-40 -118,-82 Q-84,-60 -38,-76 Z" fill="' + g + '" ' + OL + '/>' +
      '<path d="M20,-84 Q28,-124 52,-142 L76,-132 Q54,-112 46,-64 Z" fill="' + g + '" ' + OL + '/>' +
      '<rect x="-36" y="-32" width="24" height="34" rx="10" fill="' + d + '" ' + OL + '/>' +
      '<rect x="14" y="-32" width="24" height="34" rx="10" fill="' + d + '" ' + OL + '/>' +
      '<ellipse cx="0" cy="-58" rx="54" ry="40" fill="' + g + '" ' + OL + '/>' +
      '<ellipse cx="12" cy="-50" rx="32" ry="23" fill="' + belly + '"/>' +
      '<circle cx="-26" cy="-80" r="6" fill="' + d + '"/><circle cx="-6" cy="-90" r="5" fill="' + d + '"/><circle cx="-40" cy="-62" r="4.5" fill="' + d + '"/><circle cx="14" cy="-88" r="3.5" fill="' + d + '"/>' +
      '<path d="M36,-66 q16,2 20,16" fill="none" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M36,-66 q16,2 20,16" fill="none" stroke="' + d + '" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse cx="74" cy="-144" rx="30" ry="20" fill="' + g + '" ' + OL + '/>' +
      '<circle cx="98" cy="-149" r="2.2" fill="#2b1d14"/>' +
      eye(70, -151, 5, m) + brow(70, -160, m, 7, 1) +
      mouth(88, -136, 8, m);
    if (m === "sad") s += tear(68, -144);
    if (m === "mad") s += steam(58, -168);
    if (m === "sleep") s += zzz(100, -172);
    if (m === "happy") s += cheek(80, -138);
    return s;
  }

  // People. Feet at y=0, about 105 tall.
  var PEOPLE = {
    dot: { skin: "#ffd7b5", hair: "pony", hairC: "#8a4b22", top: "#ff6fa8", dress: true, legs: "#ffd7b5", shoe: "#3b2b20" },
    tom: { skin: "#f3c89f", hair: "short", hairC: "#6b3e1f", top: "#3d8bfd", bottom: "#2f5d3a", shoe: "#3b2b20" },
    bob: { skin: "#ffd7b5", hair: "bowl", hairC: "#1f1a17", top: "#ff8a3d", bottom: "#24427a", shoe: "#3b2b20" },
    man: { skin: "#f1c27d", hair: "bald", hairC: "#3b2b20", top: "#8d6e63", bottom: "#5d4037", shoe: "#2b1d14", tie: "#e63946", mustache: true },
    kid: { skin: "#c68a5a", hair: "short", hairC: "#1f1a17", top: "#2fbf71", bottom: "#24427a", shoe: "#3b2b20" }
  };
  function limb(x1, y1, x2, y2, color, w) {
    return '<path d="M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 + '" stroke="' + INK + '" stroke-width="' + (w + 4) + '" stroke-linecap="round"/>' +
           '<path d="M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2 + '" stroke="' + color + '" stroke-width="' + w + '" stroke-linecap="round"/>';
  }
  function person(kind, o) {
    var P = PEOPLE[kind] || PEOPLE.kid, m = o.m || "happy", pose = o.p || (o.hold ? "hold" : "stand");
    var legC = P.dress ? P.legs : P.bottom, s = "";
    // legs
    if (pose === "run") {
      s += limb(-3, -36, -16, -6, legC, 8) + limb(3, -36, 15, -12, legC, 8) +
           '<ellipse cx="-19" cy="-4" rx="8" ry="4.5" fill="' + P.shoe + '"/><ellipse cx="19" cy="-10" rx="8" ry="4.5" fill="' + P.shoe + '"/>';
    } else if (pose === "sit") {
      s += limb(-4, -34, 20, -30, legC, 9) + limb(4, -34, 26, -30, legC, 9) + limb(22, -30, 24, -4, legC, 8) +
           '<ellipse cx="28" cy="-3" rx="8" ry="4.5" fill="' + P.shoe + '"/>';
    } else if (pose === "bend") {
      s += limb(-6, -40, -8, -4, legC, 9) + limb(4, -40, 4, -4, legC, 9) +
           '<ellipse cx="-6" cy="-3" rx="8" ry="4.5" fill="' + P.shoe + '"/><ellipse cx="7" cy="-3" rx="8" ry="4.5" fill="' + P.shoe + '"/>';
    } else {
      s += limb(-6, -36, -7, -6, legC, 8) + limb(6, -36, 7, -6, legC, 8) +
           '<ellipse cx="-9" cy="-4" rx="8" ry="4.5" fill="' + P.shoe + '"/><ellipse cx="10" cy="-4" rx="8" ry="4.5" fill="' + P.shoe + '"/>';
    }
    // arms (behind body for the far arm)
    var sh = -64, armL, armR;
    if (pose === "run") { armL = [-12, sh, -26, -48]; armR = [12, sh, 26, -76]; }
    else if (pose === "up") { armL = [-12, sh, -24, -92]; armR = [12, sh, 24, -92]; }
    else if (pose === "hold" || pose === "reach") { armL = [-12, sh, -18, -40]; armR = [12, sh, 28, -54]; }
    else if (pose === "sit") { armL = [-12, sh, -16, -40]; armR = [12, sh, 22, -46]; }
    else if (pose === "bend") { armL = [-12, sh, 20, -36]; armR = [12, sh, 30, -34]; }
    else { armL = [-12, sh, -18, -40]; armR = [12, sh, 18, -40]; }
    s += limb(armL[0], armL[1], armL[2], armL[3], P.top, 7) + '<circle cx="' + armL[2] + '" cy="' + armL[3] + '" r="4.5" fill="' + P.skin + '" ' + OL2 + '/>';
    // body
    if (P.dress) s += '<path d="M-12,-70 L12,-70 L22,-32 L-22,-32 Z" fill="' + P.top + '" ' + OL + '/><path d="M-18,-40 L18,-40" stroke="#fff" stroke-width="3" opacity=".6"/>';
    else s += '<rect x="-14" y="-72" width="28" height="40" rx="9" fill="' + P.top + '" ' + OL + '/>' +
              '<rect x="-14" y="-40" width="28" height="9" rx="3" fill="' + P.bottom + '" ' + OL2 + '/>';
    if (P.tie) s += '<path d="M0,-70 l-4,6 l4,18 l4,-18 z" fill="' + P.tie + '" ' + OL2 + '/>';
    s += limb(armR[0], armR[1], armR[2], armR[3], P.top, 7);
    if (o.hold) s += '<g transform="translate(' + (armR[2] + 6) + ',' + (armR[3] - 2) + ') scale(.8)">' + prop(o.hold, { c: o.holdC }) + '</g>';
    s += '<circle cx="' + armR[2] + '" cy="' + armR[3] + '" r="4.5" fill="' + P.skin + '" ' + OL2 + '/>';
    // head
    var hy = -88;
    if (P.hair === "pony") s += '<ellipse cx="-20" cy="' + (hy - 2) + '" rx="9" ry="13" fill="' + P.hairC + '" ' + OL2 + ' transform="rotate(-20 -20 ' + hy + ')"/>' +
                               '<path d="M-17,' + (hy - 14) + ' l-8,-6 l2,10 z M-17,' + (hy - 14) + ' l2,-10 l6,8 z" fill="#ff4f8b" ' + OL2 + '/>';
    s += '<circle cx="0" cy="' + hy + '" r="18" fill="' + P.skin + '" ' + OL + '/>';
    if (P.hair === "pony" || P.hair === "short") s += '<path d="M-18,' + (hy - 2) + ' Q-18,' + (hy - 22) + ' 0,' + (hy - 21) + ' Q18,' + (hy - 22) + ' 18,' + (hy - 2) + ' Q10,' + (hy - 12) + ' -2,' + (hy - 12) + ' Q-12,' + (hy - 10) + ' -18,' + (hy - 2) + ' Z" fill="' + P.hairC + '" ' + OL2 + '/>';
    if (P.hair === "bowl") s += '<path d="M-19,' + (hy - 1) + ' Q-20,' + (hy - 24) + ' 0,' + (hy - 23) + ' Q20,' + (hy - 24) + ' 19,' + (hy - 1) + ' L12,' + (hy - 8) + ' L-12,' + (hy - 8) + ' Z" fill="' + P.hairC + '" ' + OL2 + '/>';
    if (P.hair === "bald") s += '<path d="M-18,' + (hy - 2) + ' q-2,-9 4,-12 M18,' + (hy - 2) + ' q2,-9 -4,-12" stroke="' + P.hairC + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    s += face2(-6, 6, hy - 2, m, 2.6, hy + 7, 5);
    if (P.mustache) s += '<path d="M-7,' + (hy + 5) + ' q7,-5 14,0 q-7,3 -14,0z" fill="' + P.hairC + '"/>';
    if (o.hat) s += '<g transform="translate(0,' + (hy - 14) + ')">' + prop("hat", { c: o.hatC }) + '</g>';
    if (m === "mad") s += steam(-6, hy - 26);
    if (m === "sleep") s += zzz(18, hy - 24);
    return s;
  }

  // Tim — a turtle. ~95 wide, 50 tall. opts.flip=true → stuck on his back
  function turtle(o) {
    var m = o.m || "happy", skin = "#a5d66b", shell = "#5f9e3f";
    var inner =
      '<path d="M-42,-16 l-12,5 l12,3 z" fill="' + skin + '" ' + OL2 + '/>' +
      '<ellipse cx="-26" cy="-7" rx="10" ry="8" fill="' + skin + '" ' + OL + ' class="leg"/>' +
      '<ellipse cx="24" cy="-7" rx="10" ry="8" fill="' + skin + '" ' + OL + ' class="leg"/>' +
      '<path d="M30,-22 Q44,-26 48,-38" fill="none" stroke="' + INK + '" stroke-width="15" stroke-linecap="round"/>' +
      '<path d="M30,-22 Q44,-26 48,-38" fill="none" stroke="' + skin + '" stroke-width="10" stroke-linecap="round"/>' +
      '<ellipse cx="56" cy="-40" rx="15" ry="12" fill="' + skin + '" ' + OL + '/>' +
      '<path d="M-44,-13 Q-42,-62 0,-64 Q42,-62 44,-13 Z" fill="' + shell + '" ' + OL + '/>' +
      '<path d="M-14,-46 L0,-54 L14,-46 L14,-30 L0,-22 L-14,-30 Z" fill="#7fbf54" ' + OL2 + '/>' +
      '<path d="M-14,-46 L-30,-50 M14,-46 L30,-50 M-14,-30 L-36,-24 M14,-30 L36,-24 M0,-22 L0,-14 M0,-54 L0,-62" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M-48,-13 L48,-13" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><path d="M-46,-13 L46,-13" stroke="#e8d27a" stroke-width="2.5" stroke-linecap="round"/>' +
      eye(58, -44, 3.6, m) + brow(58, -51, m, 5, 1) + mouth(64, -35, 5, m) +
      (m === "sad" ? tear(56, -40) : "") + (m === "mad" ? steam(52, -62) : "") + (m === "sleep" ? zzz(66, -62) : "") +
      (m === "happy" ? cheek(62, -38) : "");
    if (o.stuck) return '<g transform="rotate(180 0 -34)" class="stuck">' + inner + '</g>';
    return inner;
  }

  // a little bug (ladybird with wings) centred on its body
  function bug() {
    return '<ellipse class="wing" cx="-6" cy="-12" rx="9" ry="5" fill="#d9f0ff" opacity=".9" ' + OL2 + ' transform="rotate(-35 -6 -12)"/>' +
           '<ellipse class="wing" cx="4" cy="-13" rx="9" ry="5" fill="#d9f0ff" opacity=".9" ' + OL2 + ' transform="rotate(25 4 -13)"/>' +
           '<ellipse cx="0" cy="-4" rx="10" ry="7" fill="#ff5a5f" ' + OL2 + '/>' +
           '<path d="M0,-11 L0,3" stroke="' + INK + '" stroke-width="1.5"/><circle cx="-4" cy="-4" r="1.8" fill="' + INK + '"/><circle cx="4" cy="-2" r="1.8" fill="' + INK + '"/>' +
           '<circle cx="11" cy="-5" r="5" fill="' + INK + '"/><circle cx="12.5" cy="-6.5" r="1.4" fill="#fff"/>' +
           '<path d="M13,-9 q3,-6 7,-6 M11,-10 q1,-6 4,-8" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>';
  }

  // Tag — a puppy
  function pup(o) {
    var m = o.m || "happy", c = "#f2c48d", d = "#a8692f";
    return '<path class="tail" d="M-26,-30 q-14,-8 -12,-22" fill="none" stroke="' + INK + '" stroke-width="8" stroke-linecap="round"/>' +
      '<path class="tail" d="M-26,-30 q-14,-8 -12,-22" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>' +
      '<rect x="-22" y="-22" width="9" height="22" rx="4" fill="' + c + '" ' + OL2 + '/><rect x="12" y="-22" width="9" height="22" rx="4" fill="' + c + '" ' + OL2 + '/>' +
      '<ellipse cx="0" cy="-28" rx="28" ry="15" fill="' + c + '" ' + OL + '/>' +
      '<ellipse cx="-8" cy="-31" rx="8" ry="6" fill="' + d + '" opacity=".5"/>' +
      '<rect x="-12" y="-20" width="8" height="20" rx="4" fill="' + c + '" ' + OL2 + '/><rect x="20" y="-20" width="8" height="20" rx="4" fill="' + c + '" ' + OL2 + '/>' +
      '<circle cx="28" cy="-44" r="16" fill="' + c + '" ' + OL + '/>' +
      '<ellipse cx="42" cy="-38" rx="9" ry="7" fill="#fbe1bf" ' + OL2 + '/><ellipse cx="49" cy="-41" rx="3.5" ry="3" fill="' + INK + '"/>' +
      '<ellipse cx="18" cy="-40" rx="6" ry="12" fill="' + d + '" ' + OL2 + ' transform="rotate(20 18 -46)"/>' +
      eye(32, -49, 3, m) + brow(32, -55, m, 5, 1) +
      (m === "sad" ? mouth(42, -31, 4, "sad") : '<path d="M38,-32 q4,4 8,0" fill="none" ' + OL2 + '/><path d="M41,-31 q1,7 4,6 q2,-1 0,-6z" fill="#ff7b93" ' + OL2 + '/>');
  }

  // Sam — a sitting orange cat
  function cat(o) {
    var m = o.m || "happy", c = "#ffa94d", d = "#e07a1f";
    return '<path class="tail" d="M-16,-6 q-30,4 -26,-30" fill="none" stroke="' + INK + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path class="tail" d="M-16,-6 q-30,4 -26,-30" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-26" rx="21" ry="26" fill="' + c + '" ' + OL + '/>' +
      '<ellipse cx="2" cy="-20" rx="11" ry="15" fill="#ffe0bd"/>' +
      '<path d="M-18,-34 l8,2 M-20,-24 l8,1" stroke="' + d + '" stroke-width="3" stroke-linecap="round"/>' +
      '<ellipse cx="-8" cy="-2" rx="7" ry="4" fill="' + c + '" ' + OL2 + '/><ellipse cx="10" cy="-2" rx="7" ry="4" fill="' + c + '" ' + OL2 + '/>' +
      '<path d="M-12,-68 l-3,-16 l13,8 z M18,-68 l4,-16 l-13,8 z" fill="' + c + '" ' + OL2 + '/>' +
      '<circle cx="3" cy="-60" r="18" fill="' + c + '" ' + OL + '/>' +
      '<path d="M-6,-76 l2,7 M3,-78 l0,7 M12,-76 l-2,7" stroke="' + d + '" stroke-width="2.5" stroke-linecap="round"/>' +
      eye(-4, -62, 3, m) + eye(10, -62, 3, m) + brow(-4, -68, m, 4, -1) + brow(10, -68, m, 4, 1) +
      '<path d="M1,-56 l4,0 l-2,3 z" fill="#ff7b93"/>' +
      (m === "sad" ? mouth(3, -50, 4, "sad") : '<path d="M3,-53 q-3,4 -6,1 M3,-53 q3,4 6,1" fill="none" ' + OL2 + '/>') +
      '<path d="M-6,-55 l-12,-2 M-6,-53 l-12,2 M12,-55 l12,-2 M12,-53 l12,2" stroke="' + INK + '" stroke-width="1.2"/>' +
      (m === "sleep" ? zzz(18, -80) : "");
  }

  // Pip — a pink pig
  function pig(o) {
    var m = o.m || "happy", c = "#ffb3c7", d = "#ff85a6";
    return '<path d="M-32,-32 c-12,-2 -12,-14 -4,-14 c6,0 4,8 -2,6" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="-24" y="-20" width="10" height="20" rx="4" fill="' + d + '" ' + OL2 + '/><rect x="14" y="-20" width="10" height="20" rx="4" fill="' + d + '" ' + OL2 + '/>' +
      '<ellipse cx="0" cy="-30" rx="34" ry="23" fill="' + c + '" ' + OL + '/>' +
      '<rect x="-14" y="-18" width="10" height="18" rx="4" fill="' + c + '" ' + OL2 + '/><rect x="22" y="-18" width="10" height="18" rx="4" fill="' + c + '" ' + OL2 + '/>' +
      '<path d="M22,-60 l-4,-14 l12,8 z M40,-60 l6,-13 l-14,6 z" fill="' + d + '" ' + OL2 + '/>' +
      '<circle cx="32" cy="-46" r="18" fill="' + c + '" ' + OL + '/>' +
      '<ellipse cx="47" cy="-42" rx="9" ry="7" fill="' + d + '" ' + OL2 + '/><ellipse cx="44.5" cy="-42" rx="1.8" ry="2.6" fill="' + INK + '"/><ellipse cx="49.5" cy="-42" rx="1.8" ry="2.6" fill="' + INK + '"/>' +
      eye(29, -52, 3, m) + eye(39, -53, 3, m) + brow(39, -59, m, 4, 1) +
      mouth(38, -33, 4, m === "happy" ? "happy" : m) + (m === "happy" ? cheek(24, -42) : "") + (m === "sad" ? tear(28, -48) : "");
  }

  /* ---------------- props ---------------- */
  function prop(t, o) {
    switch (t) {
      case "hotdog":
        return '<g><ellipse cx="0" cy="0" rx="17" ry="6.5" fill="#e8b56a" ' + OL2 + '/>' +
          '<rect x="-20" y="-6" width="40" height="8" rx="4" fill="#c8553d" ' + OL2 + '/>' +
          '<path d="M-14,-2 q3,-3 6,0 t6,0 t6,0 t6,0" stroke="#ffd23f" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>';
      case "pop":
        return '<g><rect x="-2" y="-6" width="4" height="14" rx="2" fill="#e6c08a" ' + OL2 + '/>' +
          '<rect x="-8" y="-32" width="16" height="28" rx="8" fill="#ff6f91" ' + OL2 + '/>' +
          '<path d="M-8,-22 h16" stroke="#ffd23f" stroke-width="4"/><path d="M-4,-28 v6" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>';
      case "meltpop":
        return '<g><ellipse cx="0" cy="2" rx="16" ry="4" fill="#ff8fab" opacity=".8"/>' +
          '<rect x="-2" y="-6" width="4" height="14" rx="2" fill="#e6c08a" ' + OL2 + '/>' +
          '<path d="M-8,-12 q0,-10 8,-10 q8,0 8,10 l0,6 q-2,6 -4,0 q-2,8 -4,0 q-2,5 -4,0 q-2,7 -4,0 z" fill="#ff6f91" ' + OL2 + '/>' +
          '<path class="drip" d="M4,0 q-2,4 0,6 q2,-2 0,-6z" fill="#ff6f91"/></g>';
      case "hat":
        return '<g><ellipse cx="0" cy="0" rx="22" ry="5" fill="' + (o.c || "#6d4c41") + '" ' + OL2 + '/>' +
          '<path d="M-13,-1 Q-14,-20 0,-20 Q14,-20 13,-1 Z" fill="' + (o.c || "#8d6e63") + '" ' + OL2 + '/>' +
          '<path d="M-13,-6 h26" stroke="#3b2b20" stroke-width="4"/></g>';
      case "bag":
        return '<g><path d="M-10,-30 q10,-16 20,0" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
          '<path d="M-20,-30 h40 l4,30 h-48 z" fill="#c9a26b" ' + OL + '/><path d="M-16,-18 h32" stroke="#a37c45" stroke-width="3"/></g>';
      case "bagcat":
        return '<g><path d="M-8,-36 l-4,-12 l10,6 z M10,-36 l4,-12 l-10,6 z" fill="#ffa94d" ' + OL2 + '/>' +
          '<ellipse cx="1" cy="-34" rx="14" ry="10" fill="#ffa94d" ' + OL2 + '/>' + eye(-4, -36, 2.4, o.m || "sleep") + eye(6, -36, 2.4, o.m || "sleep") +
          '<path d="M-24,-30 h48 l5,30 h-58 z" fill="#c9a26b" ' + OL + '/><path d="M-20,-18 h40" stroke="#a37c45" stroke-width="3"/></g>';
      case "mitt":
        return '<g><path d="M-14,0 q-6,-14 0,-26 q4,-6 8,0 q2,-8 8,-6 q6,2 4,8 q8,-2 8,6 q0,10 -6,18 z" fill="#b5651d" ' + OL + '/>' +
          '<path d="M-6,-6 q6,-10 14,-4" fill="none" stroke="#f2c48d" stroke-width="2.5" stroke-dasharray="3 3"/></g>';
      case "lid":
        return '<g><ellipse cx="0" cy="-4" rx="18" ry="6" fill="#b0bec5" ' + OL2 + '/><rect x="-4" y="-14" width="8" height="7" rx="3" fill="#78909c" ' + OL2 + '/></g>';
      case "jet": // a little tin toy plane, nose to the right
        return '<g><path d="M-30,0 q2,-10 14,-10 h22 q16,0 24,8 q-8,8 -24,8 h-22 q-12,0 -14,-6 z" fill="#e63946" ' + OL + '/>' +
          '<path d="M-26,-4 l-6,-14 h8 l8,12 z" fill="#f2f4f7" ' + OL2 + '/>' +
          '<path d="M-4,-2 l-8,-20 h10 l12,20 z" fill="#f2f4f7" ' + OL2 + '/>' +
          '<path d="M-4,2 l-10,14 h10 l12,-14 z" fill="#c9ced6" ' + OL2 + '/>' +
          '<circle cx="18" cy="-2" r="3.5" fill="#9fe0ff" ' + OL2 + '/><circle cx="8" cy="-2" r="3.5" fill="#9fe0ff" ' + OL2 + '/>' +
          '<g class="prop-spin"><ellipse cx="34" cy="-2" rx="2.5" ry="12" fill="#c9ced6" ' + OL2 + '/></g>' +
          '<circle cx="33" cy="-2" r="3" fill="' + INK + '"/></g>';
      default: return "";
    }
  }

  function bus(o) {
    var win = "", i;
    for (i = 0; i < 4; i++) win += '<rect x="' + (14 + i * 32) + '" y="-74" width="24" height="22" rx="4" fill="#cdeeff" ' + OL2 + '/>';
    var who = o.rider ? '<circle cx="' + (26 + 32 * 2) + '" cy="-60" r="8" fill="#f1c27d" ' + OL2 + '/><path d="M' + (21 + 64) + ',-58 q5,-3 10,0" stroke="#3b2b20" stroke-width="2.5"/>' : "";
    return '<rect x="0" y="-86" width="176" height="70" rx="12" fill="#ffc93c" ' + OL + '/>' + win + who +
      '<rect x="146" y="-74" width="20" height="50" rx="4" fill="#cdeeff" ' + OL2 + '/>' +
      '<path d="M4,-44 h140" stroke="' + INK + '" stroke-width="4"/>' +
      '<circle cx="170" cy="-28" r="5" fill="#fff6b0" ' + OL2 + '/>' +
      '<g class="wheel"><circle cx="38" cy="-14" r="15" fill="#3b3b3b" ' + OL + '/><circle cx="38" cy="-14" r="6" fill="#bbb"/></g>' +
      '<g class="wheel"><circle cx="138" cy="-14" r="15" fill="#3b3b3b" ' + OL + '/><circle cx="138" cy="-14" r="6" fill="#bbb"/></g>';
  }
  function palm() {
    return '<path d="M0,0 Q10,-60 -6,-118" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="M0,0 Q10,-60 -6,-118" fill="none" stroke="#c48a4a" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M3,-20 h8 M5,-45 h8 M3,-70 h8 M-1,-95 h8" stroke="#8a5a2b" stroke-width="2"/>' +
      '<path d="M-6,-118 q-30,-14 -50,6 q24,-6 50,-6z M-6,-118 q30,-16 50,4 q-24,-6 -50,-4z M-6,-118 q-18,-30 -44,-26 q26,6 44,26z M-6,-118 q18,-30 42,-24 q-24,4 -42,24z M-6,-118 q-2,-28 10,-40 q-4,22 -10,40z" fill="#4caf50" ' + OL2 + '/>' +
      '<circle cx="-10" cy="-116" r="5" fill="#8a5a2b"/><circle cx="-2" cy="-114" r="5" fill="#8a5a2b"/>';
  }
  function bush() {
    return '<circle cx="-22" cy="-18" r="18" fill="#5cbf5a" ' + OL + '/><circle cx="20" cy="-18" r="18" fill="#5cbf5a" ' + OL + '/>' +
      '<circle cx="0" cy="-30" r="22" fill="#6cd067" ' + OL + '/><path d="M-38,0 h76" stroke="' + INK + '" stroke-width="3"/>' +
      '<circle cx="-8" cy="-34" r="3" fill="#ff5a7a"/><circle cx="12" cy="-22" r="3" fill="#ff5a7a"/><circle cx="-24" cy="-16" r="3" fill="#ff5a7a"/>';
  }
  function log(o) {
    var end = o.hollow ? '<ellipse cx="64" cy="-24" rx="14" ry="22" fill="#d9a066" ' + OL + '/><ellipse cx="64" cy="-24" rx="9" ry="16" fill="#3b2b20"/>'
                       : '<ellipse cx="64" cy="-24" rx="14" ry="22" fill="#e9b97a" ' + OL + '/><ellipse cx="64" cy="-24" rx="8" ry="13" fill="none" stroke="#b07b45" stroke-width="2"/>';
    return '<rect x="-64" y="-46" width="128" height="44" rx="10" fill="#a0703c" ' + OL + '/>' +
      '<path d="M-50,-34 h40 M-30,-20 h50 M-40,-12 h20" stroke="#7a5229" stroke-width="2.5" stroke-linecap="round"/>' +
      '<path d="M-20,-46 l-6,-14 M-26,-58 l8,-4" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' + end;
  }
  function mud(o) {
    var w = (o.w || 80);
    return '<ellipse cx="0" cy="-4" rx="' + w + '" ry="14" fill="#8b5a2b" ' + OL2 + '/>' +
      '<ellipse cx="' + (-w * 0.4) + '" cy="-7" rx="10" ry="3" fill="#a87443"/><ellipse cx="' + (w * 0.35) + '" cy="-2" rx="14" ry="3" fill="#a87443"/>';
  }
  function sun(o) {
    var c = o.hot ? "#ff9f1c" : "#ffd23f", rays = "", i;
    for (i = 0; i < 10; i++) {
      var a = i * Math.PI / 5;
      rays += '<path d="M' + (Math.cos(a) * 30).toFixed(1) + ',' + (Math.sin(a) * 30).toFixed(1) + ' L' + (Math.cos(a) * 42).toFixed(1) + ',' + (Math.sin(a) * 42).toFixed(1) + '" stroke="' + c + '" stroke-width="5" stroke-linecap="round"/>';
    }
    return '<g class="sun-rays">' + rays + '</g><circle cx="0" cy="0" r="25" fill="' + c + '" ' + OL2 + '/>' +
      '<circle cx="-8" cy="-4" r="2.6" fill="' + INK + '"/><circle cx="8" cy="-4" r="2.6" fill="' + INK + '"/><path d="M-8,6 q8,8 16,0" fill="none" ' + OL2 + '/>' +
      (o.hot ? '<path d="M-20,4 q-3,6 0,8 q3,-2 0,-8z" fill="#5fc4ff"/>' : "");
  }
  function cloud() {
    return '<g fill="#fff" stroke="#c9dcef" stroke-width="2"><circle cx="-22" cy="0" r="14"/><circle cx="0" cy="-10" r="19"/><circle cx="22" cy="-2" r="14"/><rect x="-24" y="-4" width="48" height="16" rx="8" stroke="none"/></g>';
  }
  function mat() {
    return '<ellipse cx="0" cy="-6" rx="58" ry="14" fill="#5c7cfa" ' + OL2 + '/><ellipse cx="0" cy="-6" rx="44" ry="9" fill="none" stroke="#ffd23f" stroke-width="3"/><ellipse cx="0" cy="-6" rx="28" ry="5" fill="#ff6f91"/>';
  }
  function pit() {
    return '<ellipse cx="0" cy="-6" rx="46" ry="13" fill="#2b1d14"/><ellipse cx="0" cy="-8" rx="46" ry="13" fill="none" stroke="#8b5a2b" stroke-width="5"/>' +
      '<path d="M52,0 q12,-26 30,0 z" fill="#a0703c" ' + OL2 + '/>';
  }
  function dirt() {
    return '<g class="dirt"><circle cx="0" cy="-10" r="4" fill="#8b5a2b"/><circle cx="-10" cy="-22" r="3" fill="#a0703c"/><circle cx="8" cy="-28" r="3.5" fill="#8b5a2b"/><circle cx="-4" cy="-36" r="2.5" fill="#a0703c"/></g>';
  }
  function heart() { return '<path class="heart" d="M0,0 c-14,-10 -14,-24 -4,-24 c3,0 4,2 4,4 c0,-2 1,-4 4,-4 c10,0 10,14 -4,24z" fill="#ff5a7a" ' + OL2 + '/>'; }
  function sparkle() { return '<path class="sparkle" d="M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3 Z" fill="#ffd23f" ' + OL2 + '/>'; }
  function string(o) { return '<path d="' + o.d + '" fill="none" stroke="#6b5b4b" stroke-width="1.6" stroke-dasharray="2 0"/>'; }
  function trail(o) { return '<path d="' + o.d + '" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 8" opacity=".9"/>'; }

  /* ---------------- backgrounds ---------------- */
  function bg(name, id) {
    var sky = '<defs><linearGradient id="sky' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient></defs>' +
              '<rect width="400" height="260" fill="url(#sky' + id + ')"/>';
    var c1 = '<g transform="translate(70,48) scale(.8)">' + cloud() + '</g><g transform="translate(300,36) scale(.6)">' + cloud() + '</g>';
    switch (name) {
      case "beach":
        return sky + c1 + '<path d="M0,175 Q60,150 130,168 T260,160 T400,168 V260 H0Z" fill="#9fd7a0"/>' +
          '<rect y="190" width="400" height="70" fill="#ffe2a0"/><path d="M0,190 Q100,184 200,190 T400,190" stroke="#e8c37a" stroke-width="3" fill="none"/>';
      case "park":
        return sky + c1 + '<path d="M0,180 Q90,140 190,172 T400,160 V260 H0Z" fill="#8fd16f"/>' +
          '<rect y="196" width="400" height="64" fill="#a6e07c"/><path d="M0,196 H400" stroke="#7cc35c" stroke-width="3"/>' +
          '<path d="M30,230 l3,-7 l3,7 M120,246 l3,-7 l3,7 M260,236 l3,-7 l3,7 M360,248 l3,-7 l3,7" stroke="#5aa64a" stroke-width="2" fill="none"/>';
      case "road":
        return sky + c1 + '<path d="M0,170 Q90,140 190,165 T400,155 V260 H0Z" fill="#8fd16f"/>' +
          '<rect y="186" width="400" height="74" fill="#a6e07c"/><rect y="204" width="400" height="40" fill="#8a8f98"/>' +
          '<path d="M10,224 H400" stroke="#ffe066" stroke-width="4" stroke-dasharray="24 18"/>';
      case "field":
        return sky + c1 + '<rect y="200" width="400" height="60" fill="#a6e07c"/><path d="M0,200 H400" stroke="#5aa64a" stroke-width="3"/>' +
          '<path d="M0,200 l6,-9 l4,9 l6,-7 l4,7 l6,-10 l4,10 M80,200 l6,-9 l4,9 l6,-7 l4,7 M200,200 l6,-10 l4,10 l6,-7 l4,7 M320,200 l6,-9 l4,9 l6,-8 l4,8" stroke="#5aa64a" stroke-width="2" fill="none"/>';
      case "sky":
        return sky + '<g transform="translate(80,70)">' + cloud() + '</g><g transform="translate(320,190) scale(.9)">' + cloud() + '</g><g transform="translate(230,40) scale(.6)">' + cloud() + '</g>' +
          '<rect y="244" width="400" height="16" fill="#a6e07c"/>';
      case "room":
        return '<rect width="400" height="260" fill="#fff1dc"/>' +
          '<g fill="#ffd8a8">' + dots() + '</g>' +
          '<rect x="260" y="40" width="96" height="78" rx="6" fill="#bfe8ff" ' + OL + '/><path d="M308,40 V118 M260,79 H356" stroke="' + INK + '" stroke-width="3"/>' +
          '<rect y="196" width="400" height="64" fill="#e2a868"/><path d="M0,196 H400" stroke="#b07b45" stroke-width="4"/>' +
          '<path d="M0,222 H400 M0,246 H400" stroke="#cf9356" stroke-width="2"/>';
      case "farm":
        return sky + c1 + '<path d="M0,176 Q100,150 200,170 T400,160 V260 H0Z" fill="#8fd16f"/>' +
          '<g transform="translate(318,184)"><rect x="-34" y="-50" width="68" height="50" fill="#e4572e" ' + OL + '/><path d="M-40,-48 L0,-76 L40,-48 Z" fill="#c0392b" ' + OL + '/><rect x="-10" y="-28" width="20" height="28" fill="#fff" ' + OL2 + '/></g>' +
          '<rect y="196" width="400" height="64" fill="#a6e07c"/><path d="M0,196 H400" stroke="#7cc35c" stroke-width="3"/>' +
          '<path d="M8,198 v-26 M40,198 v-26 M72,198 v-26 M104,198 v-26 M0,180 H112 M0,190 H112" stroke="#b07b45" stroke-width="4" stroke-linecap="round"/>';
      default:
        return sky;
    }
  }
  function dots() {
    var s = "", x, y;
    for (y = 20; y < 190; y += 34) for (x = (y / 34) % 2 ? 18 : 2; x < 400; x += 36) s += '<circle cx="' + x + '" cy="' + y + '" r="3"/>';
    return s;
  }

  /* ---------------- assembling a scene ---------------- */
  var DRAW = {
    al: al, tim: turtle, bug: bug, tag: pup, sam: cat, pip: pig,
    dot: function (o) { return person("dot", o); }, tom: function (o) { return person("tom", o); },
    bob: function (o) { return person("bob", o); }, man: function (o) { return person("man", o); },
    bus: bus, palm: palm, bush: bush, log: log, mud: mud, sun: sun, cloud: cloud, mat: mat, pit: pit, dirt: dirt,
    heart: heart, sparkle: sparkle, string: string, trail: trail,
    hotdog: function (o) { return prop("hotdog", o); }, pop: function (o) { return prop("pop", o); },
    meltpop: function (o) { return prop("meltpop", o); }, hat: function (o) { return prop("hat", o); },
    bag: function (o) { return prop("bag", o); }, bagcat: function (o) { return prop("bagcat", o); },
    mitt: function (o) { return prop("mitt", o); }, lid: function (o) { return prop("lid", o); },
    jet: function (o) { return prop("jet", o); }
  };

  function item(it) {
    var t = it[0], x = it[1] || 0, y = it[2] || 0, sc = it[3] || 1, o = it[4] || {};
    var fn = DRAW[t]; if (!fn) return "";
    var tr = "translate(" + x + "," + y + ")" + (o.r ? " rotate(" + o.r + ")" : "") + " scale(" + (o.f ? -sc : sc) + "," + sc + ")";
    if (t === "string" || t === "trail") tr = "";
    return '<g' + (tr ? ' transform="' + tr + '"' : "") + '><g class="it it-' + t + (o.a ? " a-" + o.a : "") + '">' + fn(o) + "</g></g>";
  }

  function scene(art, extraClass) {
    var id = ++uid;
    var s = '<svg class="scene ' + (extraClass || "") + '" viewBox="0 0 400 260" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice">' +
      bg(art.bg, id) + (art.items || []).map(item).join("") + "</svg>";
    return s;
  }

  // Echo the parrot — the listening buddy who lives in the corner
  function echo(mood) {
    var m = mood || "happy";
    return '<svg class="echo-svg" viewBox="-50 -110 110 120" aria-hidden="true">' +
      '<path d="M-14,-6 l-10,22 l8,-4 l2,10 l6,-12 z" fill="#2f80ed" ' + OL2 + '/>' +
      '<ellipse cx="0" cy="-34" rx="26" ry="32" fill="#ff5a5f" ' + OL + '/>' +
      '<ellipse cx="6" cy="-26" rx="15" ry="20" fill="#ffd23f"/>' +
      '<path class="wing-flap" d="M-22,-44 q-22,14 -12,40 q14,-6 22,-24 z" fill="#2fbf71" ' + OL2 + '/>' +
      '<circle cx="4" cy="-74" r="22" fill="#ff5a5f" ' + OL + '/>' +
      '<path d="M-4,-94 q-6,-14 4,-16 q2,8 2,14 M4,-95 q2,-14 12,-12 q-4,8 -8,14" fill="#ffd23f" ' + OL2 + '/>' +
      '<ellipse cx="12" cy="-76" rx="9" ry="10" fill="#fff" ' + OL2 + '/>' + eye(14, -77, 4, m) +
      '<path d="M22,-70 q16,0 14,14 q-4,-4 -12,-4 z" fill="#ffb020" ' + OL2 + '/>' +
      (m === "listen" ? '<path class="ear-wave" d="M-24,-80 q-8,6 0,12 M-32,-84 q-12,10 0,20" fill="none" stroke="#2f80ed" stroke-width="3" stroke-linecap="round"/>' : "") +
      '<path d="M-6,-2 v8 M6,-2 v8" stroke="#ffb020" stroke-width="4" stroke-linecap="round"/></svg>';
  }

  window.Art = { scene: scene, echo: echo };
})();
