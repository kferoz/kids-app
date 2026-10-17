#!/usr/bin/env node
/* Builds apk/KidsLearningHub.apk from the hub's web files — no Gradle, no npm
   packages: aapt2 → javac → d8 → zipalign → apksigner, straight from the
   Android build-tools.

     node android/build-apk.mjs              build (always)
     node android/build-apk.mjs --if-changed build only if a web/Android file changed

   Every build bumps versionCode, so the new APK installs over the old one and
   keeps the kids' logins, progress and activity log. That only works while the
   SAME keystore signs every build: keep android/kidsapp-release.keystore.

   Toolchain (portable JDK 17 + Android SDK) lives in ANDROID_TOOLS, default
   D:\_projects\androidtools — see android/README.md to recreate it. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const TOOLS = process.env.ANDROID_TOOLS || "D:/_projects/androidtools";
const BUILD = path.join(HERE, "build");
const OUT = path.join(ROOT, "apk");
const STATE = path.join(HERE, "version.json");
const KEYSTORE = path.join(HERE, "kidsapp-release.keystore");
// Signing password lives OUTSIDE git: env KIDSAPP_KEY_PASS or android/signing.local.json {"pass": "..."}
const SIGNING = path.join(HERE, "signing.local.json");
const KEY = { alias: "kidsapp", pass: process.env.KIDSAPP_KEY_PASS ||
  (fs.existsSync(SIGNING) ? JSON.parse(fs.readFileSync(SIGNING, "utf8")).pass : "") };
const KEEP_OLD = 3;                                      // versioned APKs kept in apk/

// web files that are not part of the app
const SKIP_DIRS = new Set(["android", "apk", "docs", "SummerPacket", "test", "node_modules", ".claude", ".git"]);
const SKIP_EXT = new Set([".md", ".zip", ".pdf", ".psd", ".log"]);

const ifChanged = process.argv.includes("--if-changed");
const hook = process.argv.includes("--hook");       // Claude Code Stop hook: quiet, JSON notice when built
const quiet = hook || process.argv.includes("--quiet");
const log = (...a) => { if (!quiet) console.log(...a); };

// ------------------------------------------------------------- toolchain
const jdk = fs.readdirSync(TOOLS).filter((d) => d.startsWith("jdk")).map((d) => path.join(TOOLS, d))[0];
const BT = path.join(TOOLS, "sdk", "build-tools", "34.0.0");
const ANDROID_JAR = path.join(TOOLS, "sdk", "platforms", "android-34", "android.jar");
for (const p of [jdk, BT, ANDROID_JAR]) {
  if (!p || !fs.existsSync(p)) { console.error("Android toolchain missing (" + p + "). See android/README.md."); process.exit(1); }
}
const env = { ...process.env, JAVA_HOME: jdk, PATH: path.join(jdk, "bin") + path.delimiter + process.env.PATH };
function run(tool, args) {
  const isBat = tool.endsWith(".bat");
  try {
    return execFileSync(isBat ? "cmd.exe" : tool, isBat ? ["/d", "/s", "/c", tool, ...args] : args,
      { env, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", windowsHide: true });
  } catch (e) {
    console.error("✗ " + path.basename(tool) + " failed:\n" + (e.stdout || "") + (e.stderr || e.message));
    process.exit(1);
  }
}
const bt = (name) => path.join(BT, name);
const jbin = (name) => path.join(jdk, "bin", name + ".exe");

// --------------------------------------------------------- collect files
function walk(dir, rel = "", out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) {
      if (!(rel === "" && SKIP_DIRS.has(e.name)) && !e.name.startsWith(".")) walk(path.join(dir, e.name), r, out);
    } else if (!SKIP_EXT.has(path.extname(e.name).toLowerCase()) && !e.name.startsWith(".")) out.push(r);
  }
  return out;
}
const webFiles = walk(ROOT).sort();
const androidFiles = ["AndroidManifest.xml", "bridge.js", "build-apk.mjs", ...walk(path.join(HERE, "src")).map((f) => "src/" + f),
  ...walk(path.join(HERE, "res")).map((f) => "res/" + f)];

const hash = crypto.createHash("sha1");
for (const f of webFiles) hash.update(f).update(fs.readFileSync(path.join(ROOT, f)));
for (const f of androidFiles) hash.update(f).update(fs.readFileSync(path.join(HERE, f)));
const digest = hash.digest("hex");

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, "utf8")) : { versionCode: 0 };
const latestApk = path.join(OUT, "KidsLearningHub.apk");
if (ifChanged && state.hash === digest && fs.existsSync(latestApk)) {
  log("APK is up to date (v" + state.versionName + ").");
  process.exit(0);
}

const versionCode = state.versionCode + 1;
const versionName = "1.0." + versionCode;
const stamp = new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
log("Building Kids Learning Hub v" + versionName + " (" + webFiles.length + " files)…");

// ------------------------------------------------------- stage the assets
fs.rmSync(BUILD, { recursive: true, force: true });
const WWW = path.join(BUILD, "assets", "www");
const bridge = fs.readFileSync(path.join(HERE, "bridge.js"), "utf8");
const inject = "<script>window.APP_VERSION=" + JSON.stringify({ name: versionName, code: versionCode, built: stamp }) +
  ";</script>\n<script>" + bridge + "</script>\n";
for (const f of webFiles) {
  const dst = path.join(WWW, f);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (f.endsWith(".html")) {
    let html = fs.readFileSync(path.join(ROOT, f), "utf8");
    const head = html.match(/<head[^>]*>/i);
    html = head ? html.replace(head[0], head[0] + "\n" + inject) : inject + html;
    fs.writeFileSync(dst, html);
  } else fs.copyFileSync(path.join(ROOT, f), dst);
}

// -------------------------------------------------------------- compile
const manifest = fs.readFileSync(path.join(HERE, "AndroidManifest.xml"), "utf8")
  .replace("<manifest ", '<manifest android:versionCode="' + versionCode + '" android:versionName="' + versionName + '" ');
fs.writeFileSync(path.join(BUILD, "AndroidManifest.xml"), manifest);

const compiled = path.join(BUILD, "res.zip");
run(bt("aapt2.exe"), ["compile", "--dir", path.join(HERE, "res"), "-o", compiled]);
const gen = path.join(BUILD, "gen");
const unsigned = path.join(BUILD, "unsigned.apk");
run(bt("aapt2.exe"), ["link", "-o", unsigned, "-I", ANDROID_JAR, "--manifest", path.join(BUILD, "AndroidManifest.xml"),
  "--java", gen, "--min-sdk-version", "24", "--target-sdk-version", "34", compiled]);

const classes = path.join(BUILD, "classes");
const javaSrc = [...walk(path.join(HERE, "src")).map((f) => path.join(HERE, "src", f)), ...walk(gen).map((f) => path.join(gen, f))];
run(jbin("javac"), ["-nowarn", "-Xlint:-options", "-source", "8", "-target", "8", "-encoding", "UTF-8",
  "-bootclasspath", ANDROID_JAR + path.delimiter + bt("core-lambda-stubs.jar"), "-d", classes, ...javaSrc]);

const dexDir = path.join(BUILD, "dex");
fs.mkdirSync(dexDir, { recursive: true });
const classFiles = walk(classes).map((f) => path.join(classes, f));
run(bt("d8.bat"), ["--release", "--min-api", "24", "--lib", ANDROID_JAR, "--output", dexDir, ...classFiles]);
// assets + dex go in with jar: aapt2 -A on Windows writes "assets/www\x\y" entry names, which Android can't open
run(jbin("jar"), ["-u", "-M", "-f", unsigned, "-C", BUILD, "assets", "-C", dexDir, "classes.dex"]);

const aligned = path.join(BUILD, "aligned.apk");
run(bt("zipalign.exe"), ["-f", "-p", "4", unsigned, aligned]);

// ----------------------------------------------------------------- sign
if (!fs.existsSync(KEYSTORE)) {
  if (!KEY.pass) { KEY.pass = crypto.randomBytes(12).toString("base64url"); fs.writeFileSync(SIGNING, JSON.stringify({ pass: KEY.pass })); }
  log("Creating signing key (keep android/kidsapp-release.keystore — updates need it)…");
  run(jbin("keytool"), ["-genkeypair", "-keystore", KEYSTORE, "-alias", KEY.alias, "-keyalg", "RSA", "-keysize", "2048",
    "-validity", "10000", "-storepass", KEY.pass, "-keypass", KEY.pass, "-dname", "CN=Kids Learning Hub, O=Family"]);
}
if (!KEY.pass) throw new Error("Signing password missing: set KIDSAPP_KEY_PASS or create android/signing.local.json (see android/README.md)");
fs.mkdirSync(OUT, { recursive: true });
run(bt("apksigner.bat"), ["sign", "--ks", KEYSTORE, "--ks-key-alias", KEY.alias, "--ks-pass", "pass:" + KEY.pass,
  "--key-pass", "pass:" + KEY.pass, "--out", latestApk, aligned]);
run(bt("apksigner.bat"), ["verify", latestApk]);

const versioned = path.join(OUT, "KidsLearningHub-v" + versionName + ".apk");
fs.copyFileSync(latestApk, versioned);
for (const f of fs.readdirSync(OUT).filter((f) => /^KidsLearningHub-v[\d.]+\.apk$/.test(f))
  .sort((a, b) => +b.match(/(\d+)\.apk$/)[1] - +a.match(/(\d+)\.apk$/)[1]).slice(KEEP_OLD)) fs.rmSync(path.join(OUT, f));
for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".idsig"))) fs.rmSync(path.join(OUT, f));

fs.writeFileSync(STATE, JSON.stringify({ versionCode, versionName, built: stamp, hash: digest }, null, 2) + "\n");
const mb = (fs.statSync(latestApk).size / 1048576).toFixed(1);
const done = "✓ APK v" + versionName + " (" + mb + " MB) → " + latestApk;
console.log(hook ? JSON.stringify({ systemMessage: "📱 Rebuilt " + done.slice(2) }) : done);
