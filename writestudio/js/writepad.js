/* ============================================================
   WritePad — the "think it, say it, write it" writing box
   ------------------------------------------------------------
   WritePad.mount(host, opt) draws one writing prompt and grades it with
   WriteCheck ("two stars and a wish"). Same file in readrocket/js and
   writestudio/js — keep both copies in sync.

   opt = {
     prompt: { p, emoji, show, note, starter, ideas:[...], model, need:{...},
               spin: { who:[], did:[], where:[] } },
     buddy:  "Nova",                    // the mascot's name in messages
     speak(text) → Promise,             // read aloud
     say(msg, mood) → Promise,          // mascot bubble + voice
     sfx: { ding, boop, pop, fanfare },
     listen(opts) | null,               // Listener.start wrapper, null = no mic
     onDone({ text, stars, tries, fixedByMe })   // after the child saves it
     saveLabel: "Save it ▶"
   }
   ============================================================ */
(function () {
  "use strict";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  var CHEER = ["Hooray, you did it!", "Writer power!", "That's a sentence to be proud of!", "Boom! Nailed it!", "Your pencil is on fire! (Not really. Phew!)"];
  var NUDGE = ["Almost there! Let's polish it.", "Good thinking! A tiny fix and it shines.", "Nice work! Let's give it a check-up.", "Great start! Writers always fix things. That's the fun part!"];

  function mount(host, opt) {
    var P = opt.prompt, need = JSON.parse(JSON.stringify(P.need || {})), tries = 0, autoFixes = 0, buddy = opt.buddy || "Nova", spun = null;
    var sfx = opt.sfx || {};
    function noop() {}
    ["ding", "boop", "pop", "fanfare"].forEach(function (k) { if (!sfx[k]) sfx[k] = noop; });

    host.innerHTML =
      '<div class="wp">' +
        '<div class="wp-prompt"><span class="wp-emo">' + (P.emoji || "✏️") + "</span><p>" + esc(P.p) + '</p><button class="mini-btn wp-hear" title="Read it to me">🔊</button></div>' +
        (P.show ? '<div class="wp-show"><small>' + (P.note ? esc(P.note) : "Fix this sentence:") + '</small><b>' + esc(P.show) + "</b></div>" : "") +
        (P.spin ? '<div class="wp-spin"><div class="reels"><span class="reel" data-r="who">WHO?</span><span class="reel" data-r="did">DID WHAT?</span><span class="reel" data-r="where">WHERE?</span></div><button class="big-btn alt small wp-spinbtn">🎰 Spin!</button></div>' : "") +
        (P.ideas && P.ideas.length ? '<div class="wp-bank"><small>Word bank (tap to add):</small>' + P.ideas.map(function (w) { return '<button class="wp-chip" data-w="' + esc(w) + '">' + esc(w) + "</button>"; }).join("") + "</div>" : "") +
        '<textarea class="wp-text" rows="' + (need.sentences > 1 ? 5 : 3) + '" spellcheck="false" autocorrect="off" autocapitalize="none" autocomplete="off" placeholder="Write here, in your own words…">' + esc(P.starter ? P.starter + " " : "") + "</textarea>" +
        '<div class="wp-count"><span class="wp-wc">0 words</span>' + (need.min ? '<span class="wp-goal">goal: ' + need.min + "+ words</span>" : "") + "</div>" +
        '<div class="wp-tools">' +
          (opt.listen ? '<button class="mini-btn wp-say">🎤 Say it first</button>' : "") +
          (P.model ? '<button class="mini-btn wp-idea">💡 Show me an example</button>' : "") +
          '<button class="mini-btn wp-read">🔊 Read my writing</button>' +
          '<button class="big-btn go wp-check">✅ Check my writing</button>' +
        "</div>" +
        '<div class="wp-said" hidden></div>' +
        '<div class="wp-model" hidden></div>' +
        '<div class="wp-fb" hidden></div>' +
      "</div>";

    var q = function (s) { return host.querySelector(s); };
    var ta = q(".wp-text");
    function count() {
      var n = WriteCheck.words(ta.value).length;
      q(".wp-wc").textContent = n + " word" + (n === 1 ? "" : "s");
      q(".wp-count").classList.toggle("met", !!need.min && n >= need.min);
    }
    ta.addEventListener("input", function () { count(); q(".wp-fb").classList.add("stale"); });
    count();
    setTimeout(function () { try { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {} }, 60);

    q(".wp-hear").onclick = function () { opt.speak(P.p + (P.show ? " " + P.show : "")); };
    host.querySelectorAll(".wp-chip").forEach(function (b) {
      b.onclick = function () {
        sfx.pop();
        var v = ta.value, w = b.dataset.w;
        ta.value = v + (v && !/\s$/.test(v) ? " " : "") + w + " ";
        count(); ta.focus();
      };
    });

    // 🎰 Silly Sentence Machine: the WHO and DID WHAT become words to use
    if (P.spin) {
      q(".wp-spinbtn").onclick = function () {
        sfx.pop();
        var reels = host.querySelectorAll(".reel"), n = 0;
        spun = { who: pick(P.spin.who), did: pick(P.spin.did), where: pick(P.spin.where) };
        reels.forEach(function (r) { r.classList.add("rolling"); });
        var timer = setInterval(function () {
          reels.forEach(function (r) { r.textContent = pick(P.spin[r.dataset.r]); });
          if (++n > 12) {
            clearInterval(timer);
            reels.forEach(function (r) { r.classList.remove("rolling"); r.textContent = spun[r.dataset.r]; });
            var whoKey = spun.who.split(" ").slice(-1)[0], didKey = spun.did.split(" ")[0];
            need.useAll = [whoKey, didKey];
            sfx.ding();
            opt.say(spun.who + " " + spun.did + " " + spun.where + "! Ha! Now write it as a sentence. You can change it and add your own ideas!", "wow");
          }
        }, 80);
      };
    }

    // 🎤 say it first: the child hears their own idea, then types it themselves
    if (opt.listen) q(".wp-say").onclick = function () {
      var b = q(".wp-say"); if (b.classList.contains("live")) return;
      b.classList.add("live"); b.textContent = "🎤 Listening…";
      opt.listen({ target: ["zqxzq"], vocab: {}, single: true,   // one utterance; a target that never matches, so it runs until a pause
        onDone: function (res) {
          b.classList.remove("live"); b.textContent = "🎤 Say it first";
          var said = (res.transcript || "").replace(/\s+/g, " ").trim();
          var box = q(".wp-said");
          if (!said) { opt.say("I didn't catch that. Tap the mic and say your idea out loud!", "happy"); return; }
          box.hidden = false;
          box.innerHTML = "💭 Your idea: <b>“" + esc(said) + "”</b><small>Great thinking! Now write it with your own fingers. Remember the capital and the stop sign!</small>";
          opt.say("Ooh, I like that idea! Now write it down.", "happy");
        },
        onError: function () { b.classList.remove("live"); b.textContent = "🎤 Say it first"; opt.say("My ears aren't working. Say your idea to a grown-up, then write it!", "happy"); }
      });
    };
    if (P.model) q(".wp-idea").onclick = function () {
      var m = q(".wp-model"); m.hidden = false;
      m.innerHTML = "💡 Here's how " + esc(buddy) + " might write it: <i>“" + esc(P.model) + "”</i><small>Now use YOUR ideas. Don't copy, make it your own!</small>";
      opt.speak("Here's an example. " + P.model + " Now write your own!");
    };
    q(".wp-read").onclick = function () {
      var t = ta.value.trim();
      if (!t) { opt.say("Your page is empty! Write something, and I'll read it to you.", "happy"); return; }
      opt.speak(t);
    };
    q(".wp-check").onclick = check;

    function check() {
      var text = ta.value.trim(), r = WriteCheck.check(text, need), fb = q(".wp-fb");
      tries++;
      fb.hidden = false; fb.classList.remove("stale");
      var html = "";
      if (r.ok) {
        var stars = tries === 1 ? 3 : 2;
        sfx.fanfare();
        html += '<div class="wp-win"><span class="wp-stars">' + "★★★".slice(0, stars) + '<i>' + "★★★".slice(stars) + "</i></span><b>" + pick(CHEER) + "</b></div>";
        html += r.stars.map(function (s) { return '<p class="wp-star">⭐ ' + esc(s) + "</p>"; }).join("");
        if (r.wishes[0]) html += '<p class="wp-wish">🪄 <b>Super-writer idea:</b> ' + esc(r.wishes[0]) + " <small>(optional)</small></p>";
        html += '<div class="wp-done-row"><button class="big-btn go wp-save">' + esc(opt.saveLabel || "Save it ▶") + "</button>" +
          (r.wishes[0] ? '<button class="mini-btn wp-more">✏️ Keep improving</button>' : "") + "</div>";
        fb.innerHTML = html;
        opt.say(pick(CHEER) + " " + r.stars[0] + (r.wishes[0] ? " Want a challenge? " + r.wishes[0] : ""), "wow");
        q(".wp-save").onclick = function () { done(text, stars); };
        if (q(".wp-more")) q(".wp-more").onclick = function () { ta.focus(); };
        return;
      }
      sfx.boop();
      html += r.stars.slice(0, 1).map(function (s) { return '<p class="wp-star">⭐ ' + esc(s) + "</p>"; }).join("");
      html += '<p class="wp-lead">' + pick(NUDGE) + "</p>";
      html += r.issues.map(function (x, k) {
        return '<div class="wp-issue"><span>🔧 ' + esc(x.msg) + (x.tip ? "<small>" + esc(x.tip) + "</small>" : "") + "</span>" +
          (x.fix ? '<button class="mini-btn wp-fix" data-k="' + k + '">Show me</button>' : "") + "</div>";
      }).join("");
      if (r.more) html += '<p class="wp-more-note">Fix these first. Then check again!</p>';
      if (tries >= 3) html += '<div class="wp-done-row"><button class="mini-btn wp-anyway">💾 Save it as it is</button></div>';
      fb.innerHTML = html;
      opt.say((r.stars[0] ? r.stars[0] + " " : "") + r.issues[0].msg, "happy");
      host.querySelectorAll(".wp-fix").forEach(function (b) {
        b.onclick = function () {
          var x = r.issues[+b.dataset.k];
          ta.value = WriteCheck.applyFix(ta.value, x); autoFixes++;
          count(); sfx.pop();
          b.disabled = true; b.textContent = "Fixed ✔";
          b.parentNode.classList.add("fixed");
          opt.say("See the change? Next time you can catch it yourself!", "happy");
        };
      });
      if (q(".wp-anyway")) q(".wp-anyway").onclick = function () { done(text, 1); };
    }
    function done(text, stars) {
      if (autoFixes && stars > 2) stars = 2;
      opt.onDone({ text: text, stars: stars, tries: tries, fixedByMe: !autoFixes });
    }
    return { check: check, textarea: ta };
  }

  window.WritePad = { mount: mount };
})();
