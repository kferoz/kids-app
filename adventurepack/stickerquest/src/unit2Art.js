/* Unit 2 pictures: inline SVG only, nothing loaded from files or the web.
   Each picture is 120×90. U2_PICTURE says which question gets which picture; any
   question not listed shows its emoji. */
const U2_INK = "#2E2650";
const U2_ART = {
  dam: {label:"A dam holding a lake, with water flowing out and making electricity", body:`
    <rect width="120" height="90" fill="#DFF3FF"/>
    <path d="M0 34 Q14 28 26 34 T52 32 V90 H0Z" fill="#3D8FD6"/>
    <path d="M4 44 q6 -3 12 0 t12 0 M18 58 q6 -3 12 0 t12 0" stroke="#fff" stroke-width="2" fill="none" opacity=".75"/>
    <polygon points="50,24 64,24 74,90 50,90" fill="#A7B1BC" stroke="${U2_INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M66 50 C74 56 76 70 92 77" stroke="#3D8FD6" stroke-width="7" fill="none" stroke-linecap="round"/>
    <rect x="74" y="77" width="46" height="13" fill="#3D8FD6"/>
    <path d="M80 83 q5 -3 10 0 t10 0 t10 0" stroke="#fff" stroke-width="2" fill="none"/>
    <polygon points="96,8 86,30 95,30 89,48 108,22 98,22 104,8" fill="#FFC93C" stroke="${U2_INK}" stroke-width="2" stroke-linejoin="round"/>`},
  turbine: {label:"A wind turbine spinning in the wind", body:`
    <rect width="120" height="90" fill="#DFF3FF"/>
    <rect y="76" width="120" height="14" fill="#7CC36B"/>
    <path d="M6 22 h22 M12 30 h16 M88 52 h24 M94 60 h16" stroke="#9CC9E8" stroke-width="3" stroke-linecap="round"/>
    <polygon points="57,32 63,32 66,78 54,78" fill="#fff" stroke="${U2_INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <g class="u2-spin" fill="#fff" stroke="${U2_INK}" stroke-width="2.5">
      <ellipse cx="60" cy="16" rx="4.5" ry="14"/>
      <ellipse cx="60" cy="16" rx="4.5" ry="14" transform="rotate(120 60 30)"/>
      <ellipse cx="60" cy="16" rx="4.5" ry="14" transform="rotate(240 60 30)"/>
    </g>
    <circle cx="60" cy="30" r="5" fill="#FFC93C" stroke="${U2_INK}" stroke-width="2.5"/>`},
  solar: {label:"The sun shining on a solar panel", body:`
    <rect width="120" height="90" fill="#DFF3FF"/>
    <rect y="78" width="120" height="12" fill="#7CC36B"/>
    <path d="M22 3v4 M22 33v4 M5 20h4 M35 20h4 M10 8l3 3 M31 29l3 3 M34 8l-3 3 M13 29l-3 3" stroke="#F2A900" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="22" cy="20" r="10" fill="#FFC93C" stroke="${U2_INK}" stroke-width="2.5"/>
    <path d="M36 30 L50 40" stroke="#F2A900" stroke-width="2.5" stroke-dasharray="3 4" stroke-linecap="round"/>
    <rect x="68" y="66" width="6" height="12" fill="#6B6590"/>
    <polygon points="46,40 106,40 96,68 36,68" fill="#2B4C9B" stroke="${U2_INK}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M66 40 L56 68 M86 40 L76 68 M41 54 L101 54" stroke="#8FB3FF" stroke-width="2"/>`},
  hurricane: {label:"A hurricane swirl with rain", body:`
    <rect width="120" height="90" fill="#E6EEF6"/>
    <g class="u2-swirl" stroke="#5F7FA6" stroke-width="9" fill="none" stroke-linecap="round">
      <path d="M60 45 C60 26 78 16 96 22"/>
      <path d="M60 45 C60 26 78 16 96 22" transform="rotate(120 60 45)"/>
      <path d="M60 45 C60 26 78 16 96 22" transform="rotate(240 60 45)"/>
    </g>
    <circle cx="60" cy="45" r="7" fill="#E6EEF6" stroke="${U2_INK}" stroke-width="2.5"/>
    <path d="M12 64 l-4 8 M22 72 l-4 8 M100 70 l-4 8 M110 60 l-4 8" stroke="#3D8FD6" stroke-width="3" stroke-linecap="round"/>`},
  fishRack: {label:"Fish drying on a wooden rack", body:`
    <rect width="120" height="90" fill="#FFF1D6"/>
    <rect y="80" width="120" height="10" fill="#C9A26B"/>
    <path d="M18 80 L24 18 M102 80 L96 18 M14 22 H106" stroke="#8B5A2B" stroke-width="5" stroke-linecap="round"/>
    ${[38, 60, 82].map(x => `<path d="M${x} 22 v10" stroke="${U2_INK}" stroke-width="1.5"/>
    <g transform="translate(${x} 44) rotate(90)" stroke="${U2_INK}" stroke-width="2" stroke-linejoin="round">
      <ellipse rx="12" ry="6" fill="#F08A5D"/><polygon points="11,0 19,-6 19,6" fill="#F08A5D"/>
      <circle cx="-7" cy="-1.5" r="1.5" fill="${U2_INK}" stroke="none"/></g>`).join("")}`},
  recycle: {label:"Trash going into a recycling bin", body:`
    <rect width="120" height="90" fill="#E8F7EF"/>
    <polygon points="38,30 82,30 76,84 44,84" fill="#2E7BD6" stroke="${U2_INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="34" y="22" width="52" height="9" rx="3" fill="#1F5FAF" stroke="${U2_INK}" stroke-width="3"/>
    <text x="60" y="68" font-size="28" text-anchor="middle" fill="#fff">♻︎</text>
    <path d="M88 26 Q76 12 64 16" stroke="#6B6590" stroke-width="2" stroke-dasharray="3 3" fill="none"/>
    <circle cx="96" cy="22" r="8" fill="#fff" stroke="${U2_INK}" stroke-width="2"/>
    <path d="M91 20 l5 3 l4 -4" stroke="${U2_INK}" stroke-width="1.5" fill="none"/>
    <rect x="12" y="60" width="14" height="22" rx="3" fill="#E0424E" stroke="${U2_INK}" stroke-width="2"/>`},
  tornado: {label:"A tornado funnel touching the ground", body:`
    <rect width="120" height="90" fill="#E9E6F2"/>
    <rect y="80" width="120" height="10" fill="#9BCB7A"/>
    <g class="u2-sway" fill="#8E8AA8" stroke="${U2_INK}" stroke-width="2">
      <ellipse cx="60" cy="14" rx="42" ry="8"/><ellipse cx="62" cy="27" rx="33" ry="7"/>
      <ellipse cx="58" cy="39" rx="25" ry="6"/><ellipse cx="62" cy="50" rx="18" ry="5"/>
      <ellipse cx="58" cy="60" rx="12" ry="4"/><ellipse cx="61" cy="69" rx="7" ry="3"/>
      <ellipse cx="59" cy="76" rx="4" ry="2"/>
    </g>
    <rect x="86" y="58" width="7" height="4" fill="#8B5A2B" transform="rotate(20 89 60)"/>
    <circle cx="30" cy="62" r="2.5" fill="#6B6590"/><circle cx="92" cy="40" r="2" fill="#6B6590"/>`},
  lostHome: {label:"Tree stumps where a forest was, and a bird with no home", body:`
    <rect width="120" height="90" fill="#EAF6E4"/>
    <rect y="74" width="120" height="16" fill="#9BCB7A"/>
    <circle cx="40" cy="30" r="20" fill="none" stroke="#6B6590" stroke-width="2.5" stroke-dasharray="5 5"/>
    <path d="M40 50 V64" stroke="#6B6590" stroke-width="2.5" stroke-dasharray="4 4"/>
    <rect x="32" y="64" width="16" height="12" fill="#A9743F" stroke="${U2_INK}" stroke-width="2.5"/>
    <ellipse cx="40" cy="64" rx="8" ry="3" fill="#E0B27A" stroke="${U2_INK}" stroke-width="2"/>
    <rect x="8" y="68" width="12" height="8" fill="#A9743F" stroke="${U2_INK}" stroke-width="2"/>
    <ellipse cx="14" cy="68" rx="6" ry="2.5" fill="#E0B27A" stroke="${U2_INK}" stroke-width="2"/>
    <ellipse cx="86" cy="62" rx="12" ry="10" fill="#E0424E" stroke="${U2_INK}" stroke-width="2.5"/>
    <circle cx="90" cy="58" r="1.8" fill="${U2_INK}"/>
    <polygon points="97,60 104,62 97,64" fill="#FFC93C" stroke="${U2_INK}" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M78 62 q6 6 12 0 M84 72 v4 M89 72 v4" stroke="${U2_INK}" stroke-width="2" fill="none"/>
    <circle cx="102" cy="30" r="12" fill="#fff" stroke="${U2_INK}" stroke-width="2.5"/>
    <text x="102" y="36" font-size="17" font-weight="700" text-anchor="middle" fill="${U2_INK}">?</text>`},
};

const U2_PICTURE = {
  sg2:"dam", sg3:"fishRack", sg5:"turbine", sg6:"recycle", sg7:"lostHome", sg8:"tornado",
  x3:"hurricane", x8:"lostHome", x11:"fishRack", x14:"solar", x15:"solar",
};

// An SVG picture by key, or the emoji itself. Emoji are decoration: the words carry the meaning.
function u2Picture(key){
  const a = U2_ART[key];
  if (a) return `<svg viewBox="0 0 120 90" role="img" aria-label="${a.label}">${a.body}</svg>`;
  return `<span class="u2-emoji" aria-hidden="true">${key || "⭐"}</span>`;
}

// Hoot the owl. Mood classes on the wrapper swap the eyes (open / happy) and move the pupils.
const U2_OWL = `<svg viewBox="0 0 100 112" aria-hidden="true">
  <path d="M22 32 L28 8 L42 24 Z M78 32 L72 8 L58 24 Z" fill="#7A5AF8" stroke="${U2_INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="16" cy="66" rx="9" ry="20" fill="#5B3FD6" stroke="${U2_INK}" stroke-width="3"/>
  <ellipse cx="84" cy="66" rx="9" ry="20" fill="#5B3FD6" stroke="${U2_INK}" stroke-width="3"/>
  <ellipse cx="50" cy="60" rx="35" ry="42" fill="#7A5AF8" stroke="${U2_INK}" stroke-width="3"/>
  <ellipse cx="50" cy="76" rx="21" ry="22" fill="#FFE7A8"/>
  <path d="M41 72 q4 4 8 0 M51 72 q4 4 8 0 M46 82 q4 4 8 0" fill="none" stroke="#E0B95A" stroke-width="2"/>
  <circle cx="35" cy="44" r="14" fill="#fff" stroke="${U2_INK}" stroke-width="3"/>
  <circle cx="65" cy="44" r="14" fill="#fff" stroke="${U2_INK}" stroke-width="3"/>
  <g class="owl-open"><g class="owl-pupils">
    <circle cx="37" cy="46" r="6" fill="${U2_INK}"/><circle cx="63" cy="46" r="6" fill="${U2_INK}"/>
    <circle cx="39" cy="43" r="2" fill="#fff"/><circle cx="65" cy="43" r="2" fill="#fff"/></g></g>
  <path class="owl-happy" d="M27 47 q8 -10 16 0 M57 47 q8 -10 16 0" fill="none" stroke="${U2_INK}" stroke-width="4" stroke-linecap="round"/>
  <circle class="owl-cheek" cx="22" cy="58" r="4" fill="#FF8FA3"/><circle class="owl-cheek" cx="78" cy="58" r="4" fill="#FF8FA3"/>
  <path d="M45 55 L55 55 L50 64 Z" fill="#FF9F1C" stroke="${U2_INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M40 101 l-4 7 M40 101 v8 M40 101 l4 7 M60 101 l-4 7 M60 101 v8 M60 101 l4 7" stroke="#FF9F1C" stroke-width="3" stroke-linecap="round"/>
</svg>`;
