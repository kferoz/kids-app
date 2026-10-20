/* ============================================================
   HubVoice — each learner's read-aloud voice, speed and pitch
   ------------------------------------------------------------
   Chosen on the Hub (🗣️ Voice button next to the learner's name)
   and applied in EVERY app: speechSynthesis.speak is wrapped so the
   learner's voice replaces whatever voice the app picked, and speed /
   pitch scale the app's own values. An app that reads slowly for
   sounding out stays slower than its normal speech.

   Saved in localStorage "hub_voice" (hub_* keys are shared, not
   per-learner namespaced): { "<kidId>": { voice, rate, pitch } }.
   No choice saved = the app's own defaults, unchanged.
   Load after profile-store.js (and after the Android bridge, which
   the APK build injects at the top of <head>).
   ============================================================ */
(function () {
  "use strict";
  var KEY = "hub_voice";
  var DEFAULTS = { voice: "", rate: 1, pitch: 1 };
  var synth = window.speechSynthesis;

  function readAll() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function kidId() { try { return localStorage.getItem("hub_activeKid") || "_guest"; } catch (e) { return "_guest"; } }
  function get(id) {
    var s = readAll()[id || kidId()];
    return s ? { voice: s.voice || "", rate: +s.rate || 1, pitch: +s.pitch || 1 } : null;
  }
  function set(settings, id) {
    var all = readAll();
    all[id || kidId()] = { voice: settings.voice || "", rate: clamp(+settings.rate || 1, 0.5, 1.6), pitch: clamp(+settings.pitch || 1, 0.5, 1.6) };
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }
  function reset(id) {
    var all = readAll(); delete all[id || kidId()];
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // English voices, best first: local (offline) before network ones
  function voices() {
    if (!synth) return [];
    return synth.getVoices().filter(function (v) { return /^en([-_]|$)/i.test(v.lang); })
      .sort(function (a, b) { return (b.localService === true) - (a.localService === true) || a.name.localeCompare(b.name); });
  }
  function findVoice(id) {
    if (!id) return null;
    var vs = synth ? synth.getVoices() : [];
    for (var i = 0; i < vs.length; i++) if (vs[i].voiceURI === id) return vs[i];
    for (i = 0; i < vs.length; i++) if (vs[i].name === id) return vs[i];
    return null;
  }

  // wrap speak(): apply the learner's choices to every utterance
  if (synth && synth.speak && !synth.__hubVoice) {
    var original = synth.speak.bind(synth);
    synth.speak = function (u) {
      var s = get();
      if (s && u) {
        // the learner's voice is English: never swap it onto another language (Arabic Oasis)
        var v = /^en|^$/i.test(u.lang || "") ? findVoice(s.voice) : null;
        if (v) { u.voice = v; u.lang = v.lang; }
        u.rate = clamp((u.rate || 1) * s.rate, 0.3, 2.2);
        u.pitch = clamp((u.pitch || 1) * s.pitch, 0.3, 2);
      }
      return original(u);
    };
    synth.__hubVoice = true;
  }

  function preview(text, settings) {
    if (!synth || !window.SpeechSynthesisUtterance) return;
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = 0.95; u.pitch = 1.05;
    synth.cancel();
    if (settings) {                       // trying unsaved choices: apply directly, skip the wrapper
      var v = findVoice(settings.voice);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = clamp(u.rate * settings.rate, 0.3, 2.2); u.pitch = clamp(u.pitch * settings.pitch, 0.3, 2);
      return original ? original(u) : synth.speak(u);
    }
    synth.speak(u);
  }

  window.HubVoice = { get: get, set: set, reset: reset, voices: voices, preview: preview, DEFAULTS: DEFAULTS };
})();
