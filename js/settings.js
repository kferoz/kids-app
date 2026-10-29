/* ============================================================
   settings.js — grown-up settings for the whole Hub (HubSettings)
   ------------------------------------------------------------
   One localStorage key, hub_settings (hub_* keys are shared by all
   learners; profile-store.js passes them through). Only what a
   grown-up changed is stored; everything else comes from DEFAULTS,
   so new settings can be added later without touching saved data.

   money   enabled (on/off for this device), currency USD | INR,
           three reward levels with an amount per currency, and
           per-learner overrides: perKid[id] = {enabled?, currency?}
   gifts   surprise gifts are virtual only (stickers, critters,
           avatar items, bonus tickets), capped per day

   Phase 3's Admin page edits these and the Dollar Bank reads them.
   Until then nothing reads them, so behaviour is unchanged
   (existing $1 challenges = the "big" level = $1).
   ============================================================ */
(function (root) {
  "use strict";

  var KEY = "hub_settings";
  var CURRENCIES = {
    USD: { code: "USD", symbol: "$", name: "US dollar", decimals: 2 },
    INR: { code: "INR", symbol: "₹", name: "Indian rupee", decimals: 0 }
  };
  var DEFAULTS = {
    version: 1,
    money: {
      enabled: true,
      currency: "USD",
      levels: [
        { id: "small", name: "Bronze", emoji: "🥉", when: "Finish a unit", amounts: { USD: 0.25, INR: 25 } },
        { id: "big",   name: "Silver", emoji: "🥈", when: "Pass a test with 3 stars", amounts: { USD: 1, INR: 100 } },
        { id: "huge",  name: "Gold",   emoji: "🥇", when: "Finish a whole grade's course", amounts: { USD: 5, INR: 500 } }
      ],
      perKid: {}
    },
    gifts: { virtualOnly: true, perDay: 3 }
  };

  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  // Saved values on top of the defaults. Arrays (levels) are replaced whole, objects merge.
  function merge(base, over) {
    if (!isObj(over)) return base;
    Object.keys(over).forEach(function (k) {
      base[k] = isObj(base[k]) && isObj(over[k]) ? merge(base[k], over[k]) : clone(over[k]);
    });
    return base;
  }
  function store() { return root.localStorage; }
  function saved() {
    try { var v = JSON.parse(store().getItem(KEY)); return isObj(v) ? v : {}; } catch (e) { return {}; }
  }

  function get() {
    var s = merge(clone(DEFAULTS), saved());
    if (!CURRENCIES[s.money.currency]) s.money.currency = DEFAULTS.money.currency;
    s.gifts.virtualOnly = true;              // real-world gifts are not offered
    return s;
  }
  // Save only the changed parts: set({money: {currency: "INR"}}).
  function set(patch) {
    var next = merge(saved(), patch);
    try { store().setItem(KEY, JSON.stringify(next)); } catch (e) {}
    return get();
  }
  function reset() { try { store().removeItem(KEY); } catch (e) {} return get(); }

  // Money as one learner sees it: the device switch AND their own switch, and their currency.
  function moneyFor(kidId) {
    var m = get().money, own = (kidId && m.perKid[kidId]) || {};
    var currency = CURRENCIES[own.currency] ? own.currency : m.currency;
    return { enabled: m.enabled !== false && own.enabled !== false, currency: currency, levels: m.levels };
  }
  // The amount for a reward level, e.g. amount("big", kid) → {value: 1, currency: "USD", text: "$1"}.
  function amount(levelId, kidId) {
    var m = moneyFor(kidId), cur = CURRENCIES[m.currency];
    var lv = m.levels.filter(function (l) { return l.id === levelId; })[0];
    if (!lv) return null;
    var value = Number(lv.amounts && lv.amounts[m.currency]) || 0;
    return { level: lv.id, value: value, currency: cur.code, symbol: cur.symbol, text: format(value, cur.code) };
  }
  function format(value, code) {
    var cur = CURRENCIES[code] || CURRENCIES.USD;
    var whole = Math.round(value) === value;
    return cur.symbol + (whole ? String(value) : value.toFixed(cur.decimals));
  }

  var HubSettings = { KEY: KEY, CURRENCIES: CURRENCIES, DEFAULTS: DEFAULTS, get: get, set: set, reset: reset,
                      moneyFor: moneyFor, amount: amount, format: format };
  root.HubSettings = HubSettings;
  if (typeof module !== "undefined" && module.exports) module.exports = HubSettings;
})(typeof window !== "undefined" ? window : globalThis);
