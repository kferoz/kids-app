/* ============================================================
   Rewards Center — App Logic
   Reads every app's shared localStorage to total up rewards,
   awards cross-app "hub badges", and runs the Prize Wheel and
   Critter Collection. Its own data is saved under "rw_".
   ============================================================ */

(function () {
  "use strict";

  var el = {};
  var SEG = 360 / WHEEL.length;

  // ---------- storage helpers ----------
  function getNum(key) { return parseInt(localStorage.getItem(key) || "0", 10) || 0; }
  function getArr(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { return []; } }
  function rwTickets() { return getNum("rw_tickets"); }
  function setTickets(n) { localStorage.setItem("rw_tickets", String(Math.max(0, n))); updateTicketBadge(); }
  function rwCritters() { return new Set(getArr("rw_critters")); }
  function saveCritters(s) { localStorage.setItem("rw_critters", JSON.stringify(Array.from(s))); }
  function rwMilestones() { return new Set(getArr("rw_milestones")); }
  function saveMilestones(s) { localStorage.setItem("rw_milestones", JSON.stringify(Array.from(s))); }

  function $(id) { return document.getElementById(id); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  // ---------- totals across all apps ----------
  function computeTotals() {
    var currency = 0, trophies = 0, appsPlayed = 0, per = [];
    REWARD_APPS.forEach(function (a) {
      var cur = getNum(a.cur);
      var tr = getArr(a.troph).length;
      if (cur > 0 || tr > 0) appsPlayed++;
      currency += cur; trophies += tr;
      per.push({ app: a, cur: cur, tr: tr });
    });
    return { currency: currency, trophies: trophies, appsPlayed: appsPlayed, per: per };
  }

  // ---------- Progress tab ----------
  function buildProgress() {
    var t = computeTotals();
    el.totals.innerHTML =
      '<div class="total-chip"><span class="tc-num">' + t.currency + '</span><span class="tc-lab">⭐ rewards earned</span></div>' +
      '<div class="total-chip"><span class="tc-num">' + t.trophies + '</span><span class="tc-lab">🏆 trophies won</span></div>' +
      '<div class="total-chip"><span class="tc-num">' + t.appsPlayed + '/' + REWARD_APPS.length + '</span><span class="tc-lab">🎯 apps played</span></div>';

    el.appRewardGrid.innerHTML = "";
    t.per.forEach(function (row) {
      var a = row.app;
      var card = document.createElement("a");
      card.className = "app-reward-card" + (row.cur > 0 || row.tr > 0 ? " active" : "");
      card.href = a.url;
      card.innerHTML =
        '<span class="ar-emoji">' + a.emoji + "</span>" +
        '<span class="ar-name">' + a.name + "</span>" +
        '<span class="ar-stats"><b>' + row.cur + "</b> " + a.curIcon + " · <b>" + row.tr + "</b> 🏆</span>" +
        '<span class="ar-go">Open →</span>';
      el.appRewardGrid.appendChild(card);
    });

    checkMilestones(t);
  }

  function checkMilestones(t) {
    var earned = rwMilestones();
    var newly = [];
    RW_MILESTONES.forEach(function (m) {
      if (!earned.has(m.id) && m.test(t)) { earned.add(m.id); newly.push(m); }
    });
    if (newly.length) {
      saveMilestones(earned);
      setTickets(rwTickets() + newly.length * 3);   // bonus tickets for new badges!
      showToast(newly[newly.length - 1].icon + " New badge: " + newly[newly.length - 1].name + "!  +" + (newly.length * 3) + " 🎟️");
      burstConfetti(40);
    }
    el.milestoneGrid.innerHTML = "";
    RW_MILESTONES.forEach(function (m) {
      var has = earned.has(m.id);
      var card = document.createElement("div");
      card.className = "milestone-card " + (has ? "earned" : "locked");
      card.innerHTML =
        '<span class="ms-icon">' + (has ? m.icon : "🔒") + "</span>" +
        '<span class="ms-name">' + m.name + "</span>" +
        '<span class="ms-desc">' + m.desc + "</span>";
      el.milestoneGrid.appendChild(card);
    });
  }

  // ---------- Prize Wheel ----------
  var spinning = false;
  var wheelRotation = 0;

  function buildWheel() {
    var stops = [];
    WHEEL.forEach(function (w, i) { stops.push(w.color + " " + (i * SEG) + "deg " + ((i + 1) * SEG) + "deg"); });
    el.wheel.style.background = "conic-gradient(" + stops.join(",") + ")";
    el.wheel.innerHTML = "";
    WHEEL.forEach(function (w, i) {
      var lab = document.createElement("span");
      lab.className = "wheel-label";
      lab.textContent = w.kind === "critter" ? "🐾" : w.kind === "jackpot" ? "🎉" : "🎟️";
      lab.style.transform = "rotate(" + (i * SEG + SEG / 2) + "deg) translateY(-96px)";
      el.wheel.appendChild(lab);
    });
  }

  function spin() {
    if (spinning) return;
    if (rwTickets() < 1) { el.wheelResult.textContent = "No tickets left! Earn more in the Arcade. 🎮"; el.wheelResult.className = "wheel-result none"; return; }
    spinning = true;
    setTickets(rwTickets() - 1);
    el.wheelResult.textContent = "";
    el.wheelResult.className = "wheel-result";

    // choose target segment — favour critters while any remain
    var owned = rwCritters();
    var critterLeft = CRITTERS.some(function (c) { return !owned.has(c.id); });
    var candidates = [];
    WHEEL.forEach(function (w, i) { if (w.kind !== "critter" || critterLeft) candidates.push(i); });
    // weight critter segments a bit higher
    var weighted = [];
    candidates.forEach(function (i) { weighted.push(i); if (WHEEL[i].kind === "critter") weighted.push(i); });
    var target = pick(weighted);

    var landAngle = 360 * 5 - (target * SEG + SEG / 2);   // segment centre under top pointer
    wheelRotation = wheelRotation - (wheelRotation % 360) + landAngle;
    el.wheel.style.transform = "rotate(" + wheelRotation + "deg)";

    setTimeout(function () { grantPrize(WHEEL[target]); spinning = false; }, 3400);
  }

  function grantPrize(seg) {
    if (seg.kind === "critter") {
      var owned = rwCritters();
      var avail = CRITTERS.filter(function (c) { return !owned.has(c.id); });
      if (avail.length) {
        var c = pick(avail);
        owned.add(c.id); saveCritters(owned);
        el.wheelResult.innerHTML = 'You won a new critter: <b>' + c.emoji + " " + c.name + "</b>! 🎉";
      } else {
        setTickets(rwTickets() + 2);
        el.wheelResult.textContent = "All critters collected — here are +2 🎟️ instead!";
      }
    } else {
      setTickets(rwTickets() + seg.n);
      el.wheelResult.textContent = (seg.kind === "jackpot" ? "JACKPOT! " : "You won ") + "+" + seg.n + " 🎟️!";
    }
    el.wheelResult.className = "wheel-result win";
    burstConfetti(50);
    buildCritters();
  }

  // ---------- Critters ----------
  function buildCritters() {
    var owned = rwCritters();
    el.critterGrid.innerHTML = "";
    CRITTERS.forEach(function (c) {
      var has = owned.has(c.id);
      var card = document.createElement("div");
      card.className = "critter-card " + (has ? "owned" : "locked");
      card.innerHTML =
        '<span class="cr-face">' + (has ? c.emoji : "❓") + "</span>" +
        '<span class="cr-name">' + (has ? c.name : "???") + "</span>";
      el.critterGrid.appendChild(card);
    });
    el.critterCount.textContent = owned.size;
    el.critterTotal.textContent = CRITTERS.length;
  }

  // ---------- misc ----------
  function updateTicketBadge() {
    el.ticketCount.textContent = rwTickets();
    var icon = el.ticketBadge.querySelector(".tk-icon");
    icon.style.animation = "none"; void icon.offsetWidth; icon.style.animation = "pop 0.4s ease";
  }
  function showToast(text) {
    var toast = document.createElement("div");
    toast.className = "toast"; toast.textContent = text;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () { toast.classList.remove("show"); setTimeout(function () { toast.remove(); }, 500); }, 2800);
  }
  function burstConfetti(n) {
    var colors = ["#a56bff", "#ff6f91", "#33c9dc", "#ffb020", "#7ed957"];
    for (var i = 0; i < n; i++) {
      var c = document.createElement("div"); c.className = "confetti";
      c.style.left = Math.random() * 100 + "vw"; c.style.background = pick(colors);
      c.style.animationDuration = 1.6 + Math.random() * 1.4 + "s"; c.style.transform = "rotate(" + Math.random() * 360 + "deg)";
      document.body.appendChild(c); setTimeout(function (node) { return function () { node.remove(); }; }(c), 3200);
    }
  }

  // ---------- Sticker album + Dollar Bank (shared js/kidbar.js + js/dollars.js) ----------
  function buildStickers() {
    var html = window.KidBar ? KidBar.albumHtml() : "";
    $("stickerAlbum").innerHTML = html || '<p class="kb-empty">No stickers yet. Finish lessons in the learning apps and they all show up here!</p>';
  }
  function buildDollars() {
    if (!window.DollarBank || !window.KidBar) return;
    DollarBank.sync();
    var t = DollarBank.totals(), apps = [];
    DollarBank.CHALLENGES.forEach(function (c) { if (apps.indexOf(c.app) < 0) apps.push(c.app); });
    var html = '<div class="kb-bank"><div><b>$' + t.earned + '</b><small>earned</small></div><div><b>$' + t.owed +
      '</b><small>to collect</small></div><div><b>$' + t.paid + '</b><small>in my hand</small></div></div>' +
      '<p class="kb-note">💡 A grown-up hands over your dollars from Admin → 💵 Dollars.</p>';
    apps.forEach(function (a) {
      html += '<div class="kb-grp"><h4>' + KidBar.appEmoji(a) + " " + KidBar.appName(a) + "</h4>" + DollarBank.challengesFor(a).map(KidBar.chRow).join("") + "</div>";
    });
    $("dollarBank").innerHTML = html;
  }

  function showTab(name) {
    ["progress", "wheel", "critters", "stickers", "dollars"].forEach(function (t) {
      $(t + "Tab").classList.toggle("active", t === name);
    });
    Array.prototype.forEach.call(el.tabBar.children, function (b) { b.classList.toggle("active", b.dataset.tab === name); });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function init() {
    el = {
      ticketBadge: $("ticketBadge"), ticketCount: $("ticketCount"), tabBar: $("tabBar"),
      totals: $("totals"), appRewardGrid: $("appRewardGrid"), milestoneGrid: $("milestoneGrid"),
      wheel: $("wheel"), spinBtn: $("spinBtn"), wheelResult: $("wheelResult"),
      critterGrid: $("critterGrid"), critterCount: $("critterCount"), critterTotal: $("critterTotal")
    };
    if (localStorage.getItem("rw_tickets") === null) localStorage.setItem("rw_tickets", "5"); // starter tickets

    updateTicketBadge();
    buildProgress();
    buildWheel();
    buildCritters();

    Array.prototype.forEach.call(el.tabBar.children, function (b) {
      b.addEventListener("click", function () {
        showTab(b.dataset.tab);
        if (b.dataset.tab === "progress") buildProgress();
        if (b.dataset.tab === "stickers") buildStickers();
        if (b.dataset.tab === "dollars") buildDollars();
      });
    });
    el.spinBtn.addEventListener("click", spin);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
