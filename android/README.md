# Kids Learning Hub — Android app

A tiny native wrapper: one full-screen WebView showing the hub's HTML apps, which ship
inside the APK (`assets/www`). Nothing is downloaded at run time except the Google Fonts
(they fall back to system fonts offline).

## Build

```
node android/build-apk.mjs              # always build
node android/build-apk.mjs --if-changed # skip if no web/Android file changed
```

Output: `apk/KidsLearningHub.apk` (latest) plus `apk/KidsLearningHub-v1.0.N.apk` (last 3 kept).
A Claude Code **Stop hook** (`.claude/settings.json`) runs the `--if-changed` build after every
session turn, so the APK always matches the latest code.

The script uses no Gradle and no npm packages. It goes aapt2 (resources) → javac → d8 →
`jar` (adds assets and dex; aapt2 `-A` writes backslash paths on Windows) → zipalign → apksigner.

**Toolchain**: portable JDK 17 + Android SDK in `D:\_projects\androidtools` (override with
`ANDROID_TOOLS`). To recreate it: unzip a Temurin JDK 17 there, unzip Android
command-line tools into `sdk/cmdline-tools/latest`, then run
`sdkmanager --sdk_root=<tools>/sdk "platforms;android-34" "build-tools;34.0.0"`.

## Updates keep the data

Every build bumps `versionCode` (`android/version.json`). Android installs the new APK over the
old one and **keeps** localStorage + IndexedDB (logins, progress, activity log), as long as the
same key signs it. **Keep `android/kidsapp-release.keystore`**. If it's lost, the next APK can only
be installed after uninstalling the old app, and uninstalling wipes the kids' data.
(Back up from Admin → Data first.)

The keystore and its password are **not in git**. The password is read from `KIDSAPP_KEY_PASS` or
`android/signing.local.json` (`{"pass": "…"}`). Back up both files privately.

## What the wrapper adds

| File | Job |
| --- | --- |
| `src/.../MainActivity.java` | WebView setup, back button = browser back, outside links open in the browser, `window.AndroidBridge` (native TextToSpeech + SpeechRecognizer, mic permission prompt) |
| `bridge.js` | Injected at the top of every page's `<head>` **in the APK only**. Rebuilds `speechSynthesis` / `SpeechSynthesisUtterance` / `webkitSpeechRecognition` on the bridge, because Android WebView has no working Web Speech API. Apps keep using the standard APIs |
| build stamp | `window.APP_VERSION` is injected too; `js/hub.js` shows it in the Hub footer |

Read-aloud uses the phone's text-to-speech voice. Phonics Pals' listener uses the phone's
speech recognizer (Google app), which asks for microphone permission the first time.

## Install on a phone or tablet

Copy `apk/KidsLearningHub.apk` to the device (USB, Google Drive, email…), tap it, and allow
"Install unknown apps" for the app you opened it from. For an update, install the new APK the
same way; it replaces the old app and keeps the data.
