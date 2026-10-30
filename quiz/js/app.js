/* ============================================================
   Quiz Corner — runs any Quiz Kit pack (js/quizkit/quizkit.js)
   ------------------------------------------------------------
   quiz/index.html#senses opens the "senses" pack; with no (or an
   unknown) hash it shows every pack for the learner's grade.
   Packs are classic scripts in quiz/packs/ that call
   QuizPacks.add({...}) (see quiz/packs/README.md).

   Saved per learner (profile-store.js):
     qk_<pack>     the Quiz Kit's own record (readToMe, last, rounds, ends)
     qk_stickers   {got: [sticker ids], stickers: [emoji]} for every pack
   ============================================================ */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var STICKERS = ["🌞", "🌈", "🦄", "🐝", "🍓", "🚀", "🐳", "🌻", "🎈", "🦊", "🍩", "🐢", "⭐", "🦋", "🍉", "🐙"];
  var KEY = "qk_stickers";

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function load() {
    var s = null; try { s = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    s = s && typeof s === "object" ? s : {};
    s.got = Array.isArray(s.got) ? s.got : []; s.stickers = Array.isArray(s.stickers) ? s.stickers : [];
    return s;
  }
  var book = load();
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(book)); } catch (e) {} }
  // One sticker per id, never twice.
  function earn(msg, id) {
    if (book.got.indexOf(id) >= 0) return;
    book.got.push(id);
    book.stickers.push(STICKERS[book.stickers.length % STICKERS.length]);
    persist();
    toast(book.stickers[book.stickers.length - 1] + " " + msg);
  }
  var toastT;
  function toast(t) {
    var el = $("#toast"); el.textContent = t; el.classList.remove("off");
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.add("off"); }, 1800);
  }

  // The learner's grade and band, read the way every app does (hub_* keys pass through profile-store).
  function learner() {
    var id = localStorage.getItem("hub_activeKid"), grade = "";
    try { (JSON.parse(localStorage.getItem("hub_kids")) || []).forEach(function (k) { if (k.id === id) grade = k.grade; }); } catch (e) {}
    var band = { pk: "kg", kg: "kg", g1: "g3", g2: "g3", g3: "g3", g4: "g3", g5: "g3" }[grade] || "";   // keep in step with KidsDB
    return { grade: grade, band: band };
  }
  function fits(p, who) {
    return !who.grade || p.grades.indexOf(who.grade) >= 0 || p.grades.indexOf(who.band) >= 0;
  }

  function picker() {
    var who = learner(), list = QuizPacks.all().filter(function (p) { return fits(p, who); });
    if (!list.length) list = QuizPacks.all();
    document.title = "Quiz Corner 🧠";
    $("#title").textContent = "🧠 Quiz Corner";
    $("#stage").innerHTML = '<p class="lead">Pick a quiz. Every right answer wins a ⭐!</p><div class="packs">' +
      list.map(function (p) {
        return '<a class="pack" href="#' + p.id + '"><span class="pack-icon">' + p.icon + '</span><span class="pack-name">' + esc(p.title) +
          '</span><span class="pack-sub">' + esc(p.blurb || "") + "</span></a>";
      }).join("") + "</div>";
  }

  function open(p) {
    document.title = p.title + " " + p.icon;
    $("#title").textContent = p.icon + " " + p.title;
    var host = document.createElement("section");
    host.className = "quiz-card";
    $("#stage").innerHTML = "";
    $("#stage").appendChild(host);
    QuizKit.mount(host, p, {
      earn: earn,
      prize: function () { return book.stickers[book.stickers.length - 1]; }
    });
  }

  function route() {
    try { speechSynthesis.cancel(); } catch (e) {}
    var p = QuizPacks.get(location.hash.replace(/^#/, ""));
    if (p) open(p); else picker();
    $("#packsLink").hidden = !p || QuizPacks.all().length < 2;
  }
  addEventListener("hashchange", route);
  document.addEventListener("DOMContentLoaded", route);
})();
