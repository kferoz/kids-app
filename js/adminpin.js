/* ============================================================
   adminpin.js — the parent PIN that guards every /admin page
   ------------------------------------------------------------
   One 4-digit PIN for grown-ups, set on first use. Stored only as
   a salted, stretched SHA-256 hash (never the PIN itself):
     hub_adminPin2 = {v:1, iter, salt, hash, set}
     hub_adminLock = {fails, until}   5 wrong tries → locked 2 minutes
   (hub_* keys are shared by every learner on this device.)
   An older Admin PIN (hub_adminPin, a plain djb2 hash, 4–8 digits)
   still opens the gate once; a 4-digit one is re-saved the new way,
   a longer one asks for a new 4-digit PIN.

   SHA-256 is written out here (no crypto.subtle): it must work the
   same from file://, http://localhost and the Android WebView.
   A 4-digit PIN keeps children out; it is not strong against an
   adult with the device, and it is not meant to be.

     AdminPin.gate({title, back, onOpen})   lock screen, calls onOpen when right
     AdminPin.changeDialog(onDone)          "Change PIN" overlay
     AdminPin.lock()                        end this grown-up session
     AdminPin.isSet() / set(pin) / verify(pin) / change(old, new) / lockState()
   ============================================================ */
(function () {
  "use strict";
  if (window.AdminPin) return;

  var KEY = "hub_adminPin2", LOCK = "hub_adminLock", OLD = "hub_adminPin", SESSION = "adm_ok";
  var MAX_TRIES = 5, LOCK_MS = 2 * 60 * 1000, ITER = 2000;

  /* ---------- SHA-256 (FIPS 180-4) over UTF-8 text → hex ---------- */
  var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function utf8(str) {
    var out = [], s = unescape(encodeURIComponent(str));
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }
  function sha256(str) {
    var bytes = utf8(str), bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var s = 56; s >= 0; s -= 8) bytes.push(s >= 32 ? 0 : (bitLen >>> s) & 0xff);
    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);
    for (var off = 0; off < bytes.length; off += 64) {
      for (var t = 0; t < 16; t++) w[t] = (bytes[off + 4 * t] << 24) | (bytes[off + 4 * t + 1] << 16) | (bytes[off + 4 * t + 2] << 8) | bytes[off + 4 * t + 3];
      for (t = 16; t < 64; t++) {
        var x = w[t - 15], y = w[t - 2];
        var s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        var s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (t = 0; t < 64; t++) {
        var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        var t1 = (hh + S1 + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0;
        var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        var t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }
    return h.map(function (v) { return ("00000000" + (v >>> 0).toString(16)).slice(-8); }).join("");
  }
  function derive(pin, salt, iter) {
    var x = sha256(salt + ":" + pin);
    for (var i = 1; i < iter; i++) x = sha256(salt + x);
    return x;
  }
  function randomSalt() {
    var a = new Uint8Array(16);
    try { crypto.getRandomValues(a); } catch (e) { for (var i = 0; i < 16; i++) a[i] = Math.floor(Math.random() * 256); }
    return Array.prototype.map.call(a, function (v) { return ("0" + v.toString(16)).slice(-2); }).join("");
  }
  function oldHash(s) { var h = 5381; for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return "h" + (h >>> 0).toString(36); }

  /* ---------- storage ---------- */
  function read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function record() { var r = read(KEY); return r && r.v === 1 && r.salt && r.hash ? r : null; }
  function isSet() { return !!record() || !!localStorage.getItem(OLD); }
  function set(pin) {
    pin = String(pin);
    if (!/^\d{4}$/.test(pin)) throw new Error("The PIN must be 4 digits.");
    var salt = randomSalt();
    write(KEY, { v: 1, iter: ITER, salt: salt, hash: derive(pin, salt, ITER), set: Date.now() });
    try { localStorage.removeItem(OLD); } catch (e) {}
  }
  function lockState() {
    var l = read(LOCK) || {}, now = Date.now(), fails = l.fails || 0, until = l.until || 0;
    if (until && until <= now) { fails = 0; until = 0; write(LOCK, { fails: 0, until: 0 }); }
    return { locked: until > now, wait: Math.max(0, until - now), left: MAX_TRIES - fails };
  }
  // {ok} | {ok:false, locked, wait, left}. Right answers reset the count; the 5th wrong one locks for 2 minutes.
  function verify(pin) {
    var st = lockState();
    if (st.locked) return { ok: false, locked: true, wait: st.wait, left: 0 };
    pin = String(pin == null ? "" : pin);
    var r = record(), ok = false, needsNew = false;
    if (r) ok = derive(pin, r.salt, r.iter || ITER) === r.hash;
    else if (localStorage.getItem(OLD)) {
      ok = oldHash(pin) === localStorage.getItem(OLD);
      if (ok) { if (/^\d{4}$/.test(pin)) set(pin); else needsNew = true; }
    }
    if (ok) { write(LOCK, { fails: 0, until: 0 }); return { ok: true, needsNew: needsNew }; }
    var fails = Math.min(MAX_TRIES, (read(LOCK) || {}).fails + 1 || 1), until = fails >= MAX_TRIES ? Date.now() + LOCK_MS : 0;
    write(LOCK, { fails: fails, until: until });
    return { ok: false, locked: !!until, wait: until ? LOCK_MS : 0, left: MAX_TRIES - fails };
  }
  function change(oldPin, newPin) {
    if (!/^\d{4}$/.test(String(newPin))) return { ok: false, msg: "The new PIN must be 4 digits." };
    var v = verify(oldPin);
    if (!v.ok) return v;
    set(newPin);
    return { ok: true };
  }
  function isOpen() { try { return sessionStorage.getItem(SESSION) === "1"; } catch (e) { return false; } }
  function open() { try { sessionStorage.setItem(SESSION, "1"); } catch (e) {} }
  function lock() { try { sessionStorage.removeItem(SESSION); } catch (e) {} }

  /* ---------- screens ---------- */
  var CSS = ".ap-veil{position:fixed;inset:0;z-index:9999;background:#F4F1FB;display:grid;place-items:center;padding:16px;overflow:auto;font-family:'Trebuchet MS','Segoe UI',system-ui,sans-serif;color:#2E2650}" +
    ".ap-card{background:#fff;border:3px solid #2E2650;border-radius:22px;box-shadow:0 6px 0 #2E2650;padding:24px;max-width:380px;width:100%;display:flex;flex-direction:column;gap:12px;text-align:center}" +
    ".ap-card h1{margin:0;font-size:24px}.ap-icon{font-size:44px}.ap-card p{margin:0}" +
    ".ap-card label{display:flex;flex-direction:column;gap:4px;text-align:left;font-weight:700}" +
    ".ap-card input{font:700 28px/1 inherit;font-family:inherit;letter-spacing:.4em;text-align:center;min-height:56px;border:3px solid #2E2650;border-radius:14px;padding:4px 8px}" +
    ".ap-card button{min-height:52px;border:3px solid #2E2650;border-radius:14px;background:#1FA596;color:#fff;font:700 19px inherit;font-family:inherit;cursor:pointer}" +
    ".ap-card button.ghost{background:#fff;color:#2E2650}.ap-card button:disabled{opacity:.5;cursor:not-allowed}" +
    ".ap-msg{min-height:1.4em;font-weight:700;color:#B42318}.ap-msg.good{color:#1B7F45}.ap-card a{color:#4B3BB3}" +
    ".ap-card input:focus,.ap-card button:focus-visible{outline:4px solid #FFC93C;outline-offset:2px}";
  function style() {
    if (document.getElementById("apStyle")) return;
    var s = document.createElement("style"); s.id = "apStyle"; s.textContent = CSS; document.head.appendChild(s);
  }
  function el(html) { var d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function mmss(ms) { var s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  var PIN_INPUT = 'type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off"';

  function gate(opts) {
    opts = opts || {};
    if (isOpen()) { opts.onOpen && opts.onOpen(); return; }
    style();
    var first = !isSet();
    var v = el('<div class="ap-veil" role="dialog" aria-modal="true" aria-labelledby="apTitle"><form class="ap-card" novalidate>' +
      '<div class="ap-icon" aria-hidden="true">🔒</div><h1 id="apTitle">' + esc(opts.title || "Grown-ups only") + "</h1>" +
      (first
        ? '<p>Set a 4-digit parent PIN. You will need it every time you open Admin.</p>' +
          '<label>New PIN<input id="apPin" ' + PIN_INPUT + "></label>" +
          '<label>Type it again<input id="apPin2" ' + PIN_INPUT + "></label>" +
          '<button type="submit">Save PIN and open</button>'
        : '<p>Enter the 4-digit parent PIN.</p>' +
          '<label>PIN<input id="apPin" ' + PIN_INPUT + "></label>" +
          '<button type="submit">Open</button>') +
      '<p class="ap-msg" role="alert"></p>' +
      '<a href="' + esc(opts.back || "../index.html") + '">← Back to the Hub</a></form></div>');
    document.body.appendChild(v);
    var form = v.querySelector("form"), pin = v.querySelector("#apPin"), pin2 = v.querySelector("#apPin2");
    var msg = v.querySelector(".ap-msg"), btn = v.querySelector("button"), timer = null;
    function done() {
      open(); clearInterval(timer); v.remove();
      opts.onOpen && opts.onOpen();
    }
    function showLock() {
      var st = lockState();
      pin.disabled = btn.disabled = st.locked;
      clearInterval(timer);
      if (!st.locked) return false;
      var tick = function () {
        var s = lockState();
        if (!s.locked) { clearInterval(timer); pin.disabled = btn.disabled = false; msg.textContent = "You can try again now."; pin.focus(); return; }
        msg.textContent = "Too many wrong tries. Try again in " + mmss(s.wait) + ".";
      };
      tick(); timer = setInterval(tick, 1000);
      return true;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = pin.value.trim();
      if (first) {
        if (!/^\d{4}$/.test(p)) { msg.textContent = "Use exactly 4 digits."; return; }
        if (p !== pin2.value.trim()) { msg.textContent = "The two PINs don't match."; pin2.value = ""; pin2.focus(); return; }
        set(p); done(); return;
      }
      var r = verify(p);
      pin.value = "";
      if (r.ok) {
        if (r.needsNew) { open(); v.remove(); changeDialog(function () { opts.onOpen && opts.onOpen(); }, "Your old PIN was longer than 4 digits. Please choose a new 4-digit PIN."); return; }
        done(); return;
      }
      if (!showLock()) msg.textContent = "That PIN is not right. " + r.left + (r.left === 1 ? " try" : " tries") + " left.";
      pin.focus();
    });
    if (!first) showLock();
    if (!pin.disabled) pin.focus();
  }

  function changeDialog(onDone, note) {
    style();
    var forced = !!note;
    var v = el('<div class="ap-veil" role="dialog" aria-modal="true" aria-labelledby="apChTitle"><form class="ap-card" novalidate>' +
      '<div class="ap-icon" aria-hidden="true">🔑</div><h1 id="apChTitle">Change PIN</h1>' +
      (note ? "<p>" + esc(note) + "</p>" : '<label>Current PIN<input id="apOld" ' + PIN_INPUT.replace('maxlength="4"', 'maxlength="8"') + "></label>") +
      '<label>New 4-digit PIN<input id="apNew" ' + PIN_INPUT + "></label>" +
      '<label>Type it again<input id="apNew2" ' + PIN_INPUT + "></label>" +
      '<button type="submit">Save new PIN</button>' +
      (forced ? "" : '<button type="button" class="ghost" data-cancel>Cancel</button>') +
      '<p class="ap-msg" role="alert"></p></form></div>');
    document.body.appendChild(v);
    var q = function (s) { return v.querySelector(s); }, msg = q(".ap-msg");
    if (q("[data-cancel]")) q("[data-cancel]").addEventListener("click", function () { v.remove(); });
    q("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var n = q("#apNew").value.trim();
      if (!/^\d{4}$/.test(n)) { msg.textContent = "The new PIN must be 4 digits."; return; }
      if (n !== q("#apNew2").value.trim()) { msg.textContent = "The new PINs don't match."; return; }
      if (forced) { set(n); v.remove(); onDone && onDone(); return; }
      var r = change(q("#apOld").value.trim(), n);
      if (!r.ok) {
        q("#apOld").value = "";
        msg.textContent = r.locked ? "Too many wrong tries. Try again in " + mmss(r.wait) + "." : (r.msg || "The current PIN is not right. " + r.left + " tries left.");
        return;
      }
      msg.className = "ap-msg good"; msg.textContent = "PIN changed.";
      setTimeout(function () { v.remove(); onDone && onDone(); }, 700);
    });
    (q("#apOld") || q("#apNew")).focus();
  }

  window.AdminPin = {
    gate: gate, changeDialog: changeDialog, lock: lock, isOpen: isOpen,
    isSet: isSet, set: set, verify: verify, change: change, lockState: lockState,
    MAX_TRIES: MAX_TRIES, LOCK_MS: LOCK_MS, KEYS: [KEY, LOCK], _sha256: sha256
  };
})();
