/* Kids Learning Hub — Android bridge (injected at the top of every page's
   <head> by build-apk.mjs; never shipped in the browser version).
   Android WebView has no working Web Speech API, so this rebuilds
   window.speechSynthesis and window.webkitSpeechRecognition on top of the
   native TextToSpeech / SpeechRecognizer exposed as window.AndroidBridge.
   The apps keep using the standard browser APIs unchanged. */
(function () {
  "use strict";
  var B = window.AndroidBridge;
  if (!B) return;
  window.APP_PLATFORM = "android";

  function later(fn) { setTimeout(fn, 0); }
  function emitter(obj) {
    obj._l = {};
    obj.addEventListener = function (t, f) { (this._l[t] = this._l[t] || []).push(f); };
    obj.removeEventListener = function (t, f) {
      var a = this._l[t]; if (!a) return;
      var i = a.indexOf(f); if (i >= 0) a.splice(i, 1);
    };
    return obj;
  }
  function fire(target, type, ev) {
    ev.type = type; ev.target = target;
    var all = [];
    if (typeof target["on" + type] === "function") all.push(target["on" + type]);
    all = all.concat(target._l[type] || []);
    all.forEach(function (f) {
      try { f.call(target, ev); } catch (e) { setTimeout(function () { throw e; }); }
    });
  }

  /* ---------------------------------------------------- read-aloud (TTS) */
  var VOICE = { name: "Android English", lang: "en-US", voiceURI: "", localService: true, "default": true };
  var queue = [], byId = {}, current = null, seq = 0, voiceList = null;

  // the phone's installed English voices, with friendly names ("English (US) · voice 2")
  function loadVoices() {
    var raw = [];
    try { raw = JSON.parse(B.ttsVoices ? B.ttsVoices() : "[]"); } catch (e) {}
    if (!raw.length) return [VOICE];
    var region = null;
    try { region = new Intl.DisplayNames(["en"], { type: "region" }); } catch (e) {}
    var count = {};
    return raw.sort(function (a, b) { return (a.net - b.net) || a.lang.localeCompare(b.lang) || a.name.localeCompare(b.name); })
      .map(function (v, i) {
        var rg = v.lang.split("-")[1] || "", label = rg ? (rg === "US" ? "US" : rg === "GB" ? "UK" : (region && region.of(rg)) || rg) : "";
        count[label] = (count[label] || 0) + 1;
        return { name: "English" + (label ? " (" + label + ")" : "") + " · voice " + count[label] + (v.net ? " (online)" : ""),
                 lang: v.lang.replace("_", "-"), voiceURI: v.name, localService: !v.net, "default": i === 0 };
      });
  }

  function Utterance(text) {
    emitter(this);
    this.text = text == null ? "" : String(text);
    this.lang = "en-US"; this.voice = null;
    this.rate = 1; this.pitch = 1; this.volume = 1;
    this.onstart = this.onend = this.onerror = this.onboundary = this.onpause = this.onresume = this.onmark = null;
  }

  function uttEvent(u, extra) {
    var ev = { utterance: u, charIndex: 0, charLength: 0, elapsedTime: 0, name: "" };
    for (var k in extra) ev[k] = extra[k];
    return ev;
  }

  function settle() {
    synth.speaking = queue.length > 0;
    synth.pending = queue.length > 1 || (queue.length === 1 && current !== queue[0]);
  }

  var synth = emitter({
    speaking: false, pending: false, paused: false, onvoiceschanged: null,
    getVoices: function () {
      if (!voiceList || (voiceList.length === 1 && B.ttsReady())) voiceList = B.ttsReady() ? loadVoices() : [VOICE];
      return voiceList.slice();
    },
    speak: function (u) {
      if (!(u instanceof Utterance)) return;
      u._id = "u" + (++seq) + "_" + Date.now();
      byId[u._id] = u;
      queue.push(u);
      settle();
      var num = function (v, d) { v = +v; return isFinite(v) ? v : d; };
      var vname = u.voice && u.voice.voiceURI ? u.voice.voiceURI : "";
      if (B.ttsVoices) B.ttsSpeak(u._id, u.text, num(u.rate, 1), num(u.pitch, 1), num(u.volume, 1), vname);
      else B.ttsSpeak(u._id, u.text, num(u.rate, 1), num(u.pitch, 1), num(u.volume, 1));
    },
    cancel: function () {
      var dropped = queue.slice(), was = current;
      queue = []; byId = {}; current = null;
      settle();
      B.ttsStop();
      // like Chrome: dropped utterances report an error asynchronously
      dropped.forEach(function (u) {
        later(function () { fire(u, "error", uttEvent(u, { error: u === was ? "interrupted" : "canceled" })); });
      });
    },
    pause: function () {}, resume: function () {}
  });

  window.__androidTTS = function (type, id, a, b) {
    var u = byId[id];
    if (!u) return;
    if (type === "start") { current = u; settle(); fire(u, "start", uttEvent(u, {})); return; }
    if (type === "boundary") { fire(u, "boundary", uttEvent(u, { name: "word", charIndex: a, charLength: b })); return; }
    delete byId[id];
    var i = queue.indexOf(u); if (i >= 0) queue.splice(i, 1);
    if (current === u) current = null;
    settle();
    fire(u, type, uttEvent(u, type === "error" ? { error: "synthesis-failed" } : { charIndex: u.text.length }));
  };
  window.__androidTTSReady = function () { voiceList = null; fire(synth, "voiceschanged", {}); };

  try {
    Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true, writable: true });
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Utterance, configurable: true, writable: true });
  } catch (e) {
    window.speechSynthesis = synth;
    window.SpeechSynthesisUtterance = Utterance;
  }
  // pages that wait for voices before speaking
  window.addEventListener("load", function () { if (B.ttsReady()) later(window.__androidTTSReady); });

  /* --------------------------------------------- microphone (recognition) */
  var srOk = false;
  try { srOk = B.srAvailable(); } catch (e) {}
  if (!srOk) { window.SpeechRecognition = window.webkitSpeechRecognition = undefined; return; }

  var live = null, liveToken = null, tokSeq = 0;

  function Recognition() {
    emitter(this);
    this.lang = "en-US"; this.continuous = false; this.interimResults = false; this.maxAlternatives = 1;
    this.onstart = this.onresult = this.onerror = this.onend = this.onaudiostart = this.onspeechend = this.onnomatch = null;
    this._finals = [];
  }
  Recognition.prototype.start = function () {
    if (live === this) throw new Error("InvalidStateError: recognition has already started");
    live = this;
    liveToken = "r" + (++tokSeq);
    this._finals = [];
    B.srStart(liveToken, this.lang || "en-US", !!this.interimResults, Math.max(1, this.maxAlternatives | 0));
  };
  Recognition.prototype.stop = function () { if (live === this) B.srStop(); };
  Recognition.prototype.abort = function () { if (live === this) B.srAbort(); };

  function result(alts, isFinal) {
    var r = alts.map(function (t) { return { transcript: t, confidence: isFinal ? 0.9 : 0.5 }; });
    r.isFinal = isFinal;
    r.item = function (i) { return r[i]; };
    return r;
  }
  function list(arr) { arr.item = function (i) { return arr[i]; }; return arr; }

  window.__androidSR = function (type, data, token) {
    var r = live;
    if (!r || token !== liveToken) return;          // event from an older session
    if (type === "start") { fire(r, "start", {}); fire(r, "audiostart", {}); return; }
    if (type === "partial") {
      if (!r.interimResults || !data || !data.length) return;
      fire(r, "result", { resultIndex: r._finals.length, results: list(r._finals.concat([result([data[0]], false)])) });
      return;
    }
    if (type === "final") {
      if (!data || !data.length) { fire(r, "nomatch", {}); return; }
      r._finals.push(result(data.slice(0, Math.max(1, r.maxAlternatives | 0)), true));
      fire(r, "result", { resultIndex: r._finals.length - 1, results: list(r._finals.slice()) });
      return;
    }
    if (type === "error") { fire(r, "error", { error: data || "error", message: "" }); return; }
    if (type === "end") {
      live = null; liveToken = null;            // cleared first: onend may call start() again
      fire(r, "end", {});
    }
  };

  window.SpeechRecognition = window.webkitSpeechRecognition = Recognition;
})();
