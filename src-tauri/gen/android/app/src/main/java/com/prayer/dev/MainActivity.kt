package com.prayer.madni

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.webkit.WebView

class MainActivity : TauriActivity() {
  private lateinit var compass: CompassBridge
  override fun onCreate(savedInstanceState: Bundle?) {
    // Enable WebView remote debugging so chrome://inspect can attach to this app's WebView
    WebView.setWebContentsDebuggingEnabled(true)
    enableEdgeToEdge()
    compass = CompassBridge(this)
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    compass.attachWebView(webView)
  }

  override fun onResume() {
    super.onResume()
    compass.start()
  }

  override fun onPause() {
    super.onPause()
    compass.stop()
  }
}
