/* ============================================================
   media.js — Class Corner's pictures (drawings and photos)
   ------------------------------------------------------------
   Pictures are too big for localStorage, so they live in their
   own IndexedDB database, ClassCornerMedia, one record per
   picture {id, blob, t}. Submissions in cc_data keep only the
   id. Nothing here is ever deleted, like the rest of Class
   Corner. Photos are shrunk before saving (longest side 1280px).
   ============================================================ */
(function (root) {
  "use strict";
  var NAME = "ClassCornerMedia", STORE = "media", dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!root.indexedDB) { rej(new Error("This browser can't store pictures.")); return; }
      var r = indexedDB.open(NAME, 1);
      r.onupgradeneeded = function () { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE, { keyPath: "id" }); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { dbp = null; rej(r.error || new Error("Could not open picture storage.")); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(STORE, mode), out;
        t.oncomplete = function () { res(out); };
        t.onerror = t.onabort = function () { rej(t.error || new Error("Picture storage failed.")); };
        out = fn(t.objectStore(STORE));
      });
    });
  }
  function put(blob) {
    var id = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    return tx("readwrite", function (s) { s.put({ id: id, blob: blob, t: Date.now() }); return id; });
  }
  function get(id) {
    var req;
    return tx("readonly", function (s) { req = s.get(id); }).then(function () { return req.result ? req.result.blob : null; });
  }
  function all() {
    var req;
    return tx("readonly", function (s) { req = s.getAll(); }).then(function () { return req.result || []; });
  }

  // A photo file → a smaller JPEG blob.
  function shrink(file, max) {
    max = max || 1280;
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k));
        var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function (b) { b ? res(b) : rej(new Error("Could not read that photo.")); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("That file is not a picture.")); };
      img.src = url;
    });
  }
  function dataURL(blob) {
    return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(r.error); }; r.readAsDataURL(blob); });
  }
  // Ask the browser not to clear this storage when space runs low (best effort).
  function persist() { try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {} }

  root.ClassMedia = { put: put, get: get, all: all, shrink: shrink, dataURL: dataURL, persist: persist };
})(window);
