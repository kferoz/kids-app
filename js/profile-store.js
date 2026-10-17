/* ============================================================
   profile-store.js — per-learner progress, transparently
   ------------------------------------------------------------
   Every app saves its scores to localStorage with app-prefixed
   keys (ll_stars, hs_done, tt_mastered, rw_tickets …). All apps
   are file:// pages sharing ONE localStorage, so without this
   shim two siblings' scores would land in the same keys and mix.

   This wraps localStorage so those app keys are silently stored
   under the ACTIVE learner's namespace:  k<kidId>::ll_stars.
   Nothing in the apps changes — they still call localStorage as
   usual. Global hub_* keys (the profile list, active learner and
   the shared action log) always pass through unchanged, and when
   nobody is logged in keys stay un-namespaced (guest = classic).

   Include this ONCE, BEFORE an app's own scripts. Do NOT include
   it on the Hub (index.html) or the Insights page — those use
   KidsDB / explicit namespaces and need raw access.
   ============================================================ */
(function () {
  "use strict";
  if (window.__profileStoreInstalled) return;
  window.__profileStoreInstalled = true;

  var proto = Storage.prototype;
  var raw = {
    get: proto.getItem,
    set: proto.setItem,
    del: proto.removeItem
  };

  // Keys that must stay shared across every learner:
  //   hub_* = the profile registry, active learner & action log
  //   rw_*  = the SHARED Prize Wheel economy (tickets, critters, milestones)
  //           — any sibling's tickets go into one family pot everyone spins.
  function isGlobal(key) {
    if (key == null) return true;
    var k = String(key);
    return k.indexOf("hub_") === 0 || k.indexOf("rw_") === 0;
  }
  // Current learner's namespace prefix (empty when nobody is logged in).
  function ns() {
    var id = raw.get.call(localStorage, "hub_activeKid");
    return id ? "k" + id + "::" : "";
  }
  // Only remap real progress keys on localStorage (never sessionStorage).
  function mapKey(store, key) {
    if (store === localStorage && !isGlobal(key)) return ns() + key;
    return key;
  }

  proto.getItem = function (key) { return raw.get.call(this, mapKey(this, key)); };
  proto.setItem = function (key, val) { return raw.set.call(this, mapKey(this, key), val); };
  proto.removeItem = function (key) { return raw.del.call(this, mapKey(this, key)); };

  // Escape hatch for tools/tests that need raw or cross-learner access.
  window.ProfileStore = {
    ns: ns,
    keyFor: function (id, key) { return (id ? "k" + id + "::" : "") + key; },
    rawGet: function (key) { return raw.get.call(localStorage, key); },
    rawSet: function (key, val) { return raw.set.call(localStorage, key, val); }
  };
})();
