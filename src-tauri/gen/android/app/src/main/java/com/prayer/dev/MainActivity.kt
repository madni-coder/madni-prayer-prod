package com.prayer.dev

import android.os.Bundle
import androidx.activity.enableEdgeToEdge
import android.webkit.WebView

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Enable WebView remote debugging so chrome://inspect can attach to this app's WebView
    WebView.setWebContentsDebuggingEnabled(true)
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
