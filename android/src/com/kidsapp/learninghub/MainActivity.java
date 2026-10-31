package com.kidsapp.learninghub;

import android.Manifest;
import android.app.Activity;
import android.content.ContentValues;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

/**
 * Kids Learning Hub — a full-screen WebView over the hub's HTML apps, which
 * ship inside the APK at assets/www. All pages share the file:// origin, so
 * localStorage + IndexedDB (logins, progress, ActivityDB) work as on a PC.
 *
 * Android WebView has no working Web Speech API, so this activity exposes
 * window.AndroidBridge (native TextToSpeech + SpeechRecognizer); the injected
 * bridge.js turns it back into speechSynthesis / webkitSpeechRecognition.
 */
public class MainActivity extends Activity {
  private static final String START_URL = "file:///android_asset/www/index.html";
  private static final int REQ_MIC = 7;
  private static final int REQ_WEB_MIC = 8;
  private static final int REQ_FILE = 8;
  private ValueCallback<Uri[]> fileCallback;   // Admin "Restore from backup" file picker

  private WebView web;
  private final Handler ui = new Handler(Looper.getMainLooper());

  private TextToSpeech tts;
  private volatile boolean ttsReady = false;

  private SpeechRecognizer recognizer;
  private int srSession = 0;          // bumps per start so stale callbacks are ignored
  private boolean srEnded = true;
  private String srToken = "";        // the page's id for the live session, echoed in every event
  private String[] pendingSr;         // start args waiting on the mic permission
  private PermissionRequest pendingWebMic;   // a page's getUserMedia (Class Corner noise meter) waiting on it

  @Override
  protected void onCreate(Bundle saved) {
    super.onCreate(saved);
    getWindow().setStatusBarColor(Color.parseColor("#6C4CF1"));

    web = new WebView(this);
    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setAllowFileAccess(true);
    s.setAllowFileAccessFromFileURLs(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setTextZoom(100);               // big system fonts would break the kid layouts
    s.setLoadWithOverviewMode(true);
    s.setUseWideViewPort(true);

    web.addJavascriptInterface(new Bridge(), "AndroidBridge");
    web.setWebViewClient(new WebViewClient() {
      @Override
      public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest req) {
        Uri u = req.getUrl();
        String scheme = u.getScheme();
        if ("http".equals(scheme) || "https".equals(scheme) || "mailto".equals(scheme)) {
          try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
          return true;
        }
        return false;
      }

      @Override
      public void onPageStarted(WebView v, String url, android.graphics.Bitmap icon) {
        // a new page: silence anything the old page was saying or hearing
        if (tts != null) tts.stop();
        abortRecognizer();
      }
    });
    web.setWebChromeClient(new WebChromeClient() {
      // getUserMedia from our own pages: microphone only, after Android's own permission
      @Override
      public void onPermissionRequest(final PermissionRequest req) {
        runOnUiThread(() -> {
          boolean audio = false;
          for (String r : req.getResources()) if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) audio = true;
          if (!audio) { req.deny(); return; }
          if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            req.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
          } else {
            if (pendingWebMic != null) pendingWebMic.deny();
            pendingWebMic = req;
            requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, REQ_WEB_MIC);
          }
        });
      }

      @Override
      public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        fileCallback = cb;
        try {
          Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
          pick.addCategory(Intent.CATEGORY_OPENABLE);
          pick.setType("*/*");                       // .json backups have no reliable MIME type on Android
          startActivityForResult(Intent.createChooser(pick, "Choose a backup file"), REQ_FILE);
          return true;
        } catch (Exception e) {
          fileCallback = null;
          return false;
        }
      }
    });
    setContentView(web);

    tts = new TextToSpeech(this, status -> {
      if (status != TextToSpeech.SUCCESS) return;
      int r = tts.setLanguage(Locale.US);
      if (r == TextToSpeech.LANG_MISSING_DATA || r == TextToSpeech.LANG_NOT_SUPPORTED) tts.setLanguage(Locale.ENGLISH);
      tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
        @Override public void onStart(String id) { js("__androidTTS('start'," + q(id) + ",0,0)"); }
        @Override public void onDone(String id) { js("__androidTTS('end'," + q(id) + ",0,0)"); }
        @Override public void onError(String id) { js("__androidTTS('error'," + q(id) + ",0,0)"); }
        @Override public void onRangeStart(String id, int start, int end, int frame) {
          js("__androidTTS('boundary'," + q(id) + "," + start + "," + (end - start) + ")");
        }
      });
      ttsReady = true;
      js("window.__androidTTSReady && __androidTTSReady()");
    });

    if (saved != null) web.restoreState(saved);
    else web.loadUrl(START_URL);
  }

  // ---------------------------------------------------------------- bridge
  private class Bridge {
    @JavascriptInterface public boolean ttsReady() { return ttsReady; }

    @JavascriptInterface
    public void ttsSpeak(String id, String text, float rate, float pitch, float volume) {
      ttsSpeak(id, text, rate, pitch, volume, "");
    }

    /** voiceName = a name from ttsVoices(), or "" for the default US English voice. */
    @JavascriptInterface
    public void ttsSpeak(String id, String text, float rate, float pitch, float volume, String voiceName) {
      if (tts == null) return;
      useVoice(voiceName);
      tts.setSpeechRate(clamp(rate, 0.1f, 4f));
      tts.setPitch(clamp(pitch, 0.1f, 2f));
      Bundle p = new Bundle();
      p.putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, clamp(volume, 0f, 1f));
      if (tts.speak(text, TextToSpeech.QUEUE_ADD, p, id) != TextToSpeech.SUCCESS)
        js("__androidTTS('error'," + q(id) + ",0,0)");
    }

    /** The installed English voices as JSON [{name, lang, net}], for the Hub's voice picker. */
    @JavascriptInterface
    public String ttsVoices() {
      JSONArray a = new JSONArray();
      if (tts == null || !ttsReady) return a.toString();
      try {
        Set<Voice> all = tts.getVoices();
        if (all == null) return a.toString();
        for (Voice v : all) {
          Locale l = v.getLocale();
          if (l == null || !"en".equals(l.getLanguage())) continue;
          Set<String> feats = v.getFeatures();
          if (feats != null && feats.contains(TextToSpeech.Engine.KEY_FEATURE_NOT_INSTALLED)) continue;
          JSONObject o = new JSONObject();
          o.put("name", v.getName());
          o.put("lang", l.toLanguageTag());
          o.put("net", v.isNetworkConnectionRequired());
          a.put(o);
        }
      } catch (Exception ignored) {}
      return a.toString();
    }

    /** True when the TTS engine can speak this language now (its voice data is installed), e.g. "ar". */
    @JavascriptInterface
    public boolean ttsHasLang(String tag) {
      if (tts == null || !ttsReady) return false;
      try { return tts.isLanguageAvailable(Locale.forLanguageTag(tag)) >= TextToSpeech.LANG_AVAILABLE; }
      catch (Exception e) { return false; }
    }

    /** Saves a file (e.g. an Admin backup) into Downloads/KidsLearningHub. Returns where, or "" on failure. */
    @JavascriptInterface
    public String saveFile(String name, String text, String mime) {
      String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
      byte[] bytes = text.getBytes(StandardCharsets.UTF_8);
      try {
        if (Build.VERSION.SDK_INT >= 29) {
          ContentValues cv = new ContentValues();
          cv.put(MediaStore.MediaColumns.DISPLAY_NAME, safe);
          cv.put(MediaStore.MediaColumns.MIME_TYPE, mime == null || mime.isEmpty() ? "application/octet-stream" : mime);
          cv.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/KidsLearningHub");
          Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv);
          if (uri == null) return "";
          try (OutputStream out = getContentResolver().openOutputStream(uri)) { out.write(bytes); }
          return "Downloads/KidsLearningHub/" + safe;
        }
        // Android 7–9: app folder, no storage permission needed (removed if the app is uninstalled)
        File dir = new File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "KidsLearningHub");
        if (!dir.exists() && !dir.mkdirs()) return "";
        File out = new File(dir, safe);
        try (FileOutputStream fo = new FileOutputStream(out)) { fo.write(bytes); }
        return out.getAbsolutePath();
      } catch (Exception e) {
        return "";
      }
    }

    @JavascriptInterface public void ttsStop() { if (tts != null) tts.stop(); }

    @JavascriptInterface
    public boolean srAvailable() { return SpeechRecognizer.isRecognitionAvailable(MainActivity.this); }

    @JavascriptInterface
    public void srStart(String token, String lang, boolean interim, int maxAlts) {
      final String[] args = { lang, String.valueOf(interim), String.valueOf(maxAlts), token };
      ui.post(() -> {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
          pendingSr = args;
          requestPermissions(new String[] { Manifest.permission.RECORD_AUDIO }, REQ_MIC);
        } else startRecognizer(args);
      });
    }

    @JavascriptInterface public void srStop() { ui.post(() -> { if (recognizer != null) recognizer.stopListening(); }); }

    @JavascriptInterface public void srAbort() { ui.post(MainActivity.this::abortRecognizer); }
  }

  // ---------------------------------------------------------- voices
  private String currentVoice = "";
  private void useVoice(String name) {
    if (name == null) name = "";
    if (name.equals(currentVoice)) return;
    try {
      if (name.startsWith("lang:")) {             // a language, not a named voice (Arabic Oasis)
        int r = tts.setLanguage(Locale.forLanguageTag(name.substring(5)));
        currentVoice = r >= TextToSpeech.LANG_AVAILABLE ? name : "";
        if (currentVoice.isEmpty()) tts.setLanguage(Locale.US);
        return;
      }
      Voice pick = null;
      if (!name.isEmpty() && tts.getVoices() != null)
        for (Voice v : tts.getVoices()) if (v.getName().equals(name)) { pick = v; break; }
      if (pick != null) tts.setVoice(pick);
      else tts.setLanguage(Locale.US);
      currentVoice = pick != null ? name : "";
    } catch (Exception ignored) {}
  }

  // ---------------------------------------------------------- recognizer
  private void startRecognizer(String[] args) {
    abortRecognizer();
    if (recognizer == null) {
      recognizer = SpeechRecognizer.createSpeechRecognizer(this);
    }
    final int session = ++srSession;
    srEnded = false;
    srToken = args[3];
    recognizer.setRecognitionListener(new RecognitionListener() {
      private boolean live() { return session == srSession && !srEnded; }
      @Override public void onReadyForSpeech(Bundle b) { if (live()) srJs("start", "null"); }
      @Override public void onBeginningOfSpeech() {}
      @Override public void onRmsChanged(float v) {}
      @Override public void onBufferReceived(byte[] b) {}
      @Override public void onEndOfSpeech() {}
      @Override public void onEvent(int t, Bundle b) {}
      @Override public void onPartialResults(Bundle b) {
        if (live()) srJs("partial", texts(b));
      }
      @Override public void onResults(Bundle b) {
        if (!live()) return;
        srJs("final", texts(b));
        endRecognizer();
      }
      @Override public void onError(int code) {
        if (!live()) return;
        srJs("error", q(srError(code)));
        endRecognizer();
      }
    });

    Intent it = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
    it.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
    it.putExtra(RecognizerIntent.EXTRA_LANGUAGE, args[0] == null || args[0].isEmpty() ? "en-US" : args[0]);
    it.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, Boolean.parseBoolean(args[1]));
    it.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, Math.max(1, Integer.parseInt(args[2])));
    it.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
    // a restart straight after the previous session ends can hit ERROR_RECOGNIZER_BUSY
    ui.postDelayed(() -> { if (session == srSession && !srEnded) recognizer.startListening(it); }, 60);
  }

  private void endRecognizer() {
    if (srEnded) return;
    srEnded = true;
    srJs("end", "null");
  }

  private void srJs(String type, String data) { js("__androidSR('" + type + "'," + data + "," + q(srToken) + ")"); }

  private void abortRecognizer() {
    if (recognizer != null && !srEnded) {
      recognizer.cancel();
      endRecognizer();
    }
  }

  @Override
  protected void onActivityResult(int req, int result, Intent data) {
    if (req == REQ_FILE && fileCallback != null) {
      Uri u = (result == RESULT_OK && data != null) ? data.getData() : null;
      fileCallback.onReceiveValue(u == null ? null : new Uri[] { u });
      fileCallback = null;
      return;
    }
    super.onActivityResult(req, result, data);
  }

  @Override
  public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
    boolean granted = results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED;
    if (req == REQ_WEB_MIC) {
      PermissionRequest r = pendingWebMic;
      pendingWebMic = null;
      if (r != null) { if (granted) r.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE }); else r.deny(); }
      return;
    }
    if (req != REQ_MIC || pendingSr == null) return;
    String[] args = pendingSr;
    pendingSr = null;
    if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) startRecognizer(args);
    else {
      srToken = args[3];
      srJs("error", "'not-allowed'");
      srJs("end", "null");
    }
  }

  private static String srError(int code) {
    switch (code) {
      case SpeechRecognizer.ERROR_NO_MATCH:
      case SpeechRecognizer.ERROR_SPEECH_TIMEOUT: return "no-speech";
      case SpeechRecognizer.ERROR_AUDIO: return "audio-capture";
      case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS: return "not-allowed";
      case SpeechRecognizer.ERROR_NETWORK:
      case SpeechRecognizer.ERROR_NETWORK_TIMEOUT: return "network";
      case SpeechRecognizer.ERROR_CLIENT: return "aborted";
      default: return "error";
    }
  }

  // ------------------------------------------------------------- helpers
  private static String texts(Bundle b) {
    ArrayList<String> list = b == null ? null : b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
    JSONArray a = new JSONArray();
    if (list != null) for (String t : list) a.put(t);
    return a.toString();
  }

  private static String q(String s) { return JSONObject.quote(s == null ? "" : s); }

  private static float clamp(float v, float lo, float hi) { return Float.isNaN(v) ? 1f : Math.max(lo, Math.min(hi, v)); }

  private void js(String code) { ui.post(() -> { if (web != null) web.evaluateJavascript(code, null); }); }

  // ----------------------------------------------------------- lifecycle
  @Override
  public void onBackPressed() {
    if (web.canGoBack()) web.goBack();
    else super.onBackPressed();
  }

  @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }

  @Override protected void onPause() {
    if (tts != null) tts.stop();
    abortRecognizer();
    web.onPause();
    super.onPause();
  }

  @Override protected void onResume() { super.onResume(); web.onResume(); }

  @Override protected void onDestroy() {
    if (tts != null) tts.shutdown();
    if (recognizer != null) recognizer.destroy();
    web.destroy();
    super.onDestroy();
  }
}
