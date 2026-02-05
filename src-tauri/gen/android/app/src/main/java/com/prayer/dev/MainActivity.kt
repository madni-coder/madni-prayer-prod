package com.prayer.raahe

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.UpdateAvailability
import com.prayer.raahe.BuildConfig

class MainActivity : TauriActivity() {
  private lateinit var compass: CompassBridge
  private lateinit var appUpdateManager: AppUpdateManager

  override fun onCreate(savedInstanceState: Bundle?) {
    // Enable WebView remote debugging so chrome://inspect can attach to this app's WebView
    WebView.setWebContentsDebuggingEnabled(true)
    enableEdgeToEdge()
    compass = CompassBridge(this)
    appUpdateManager = AppUpdateManagerFactory.create(this)
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    compass.attachWebView(webView)
  }

  override fun onResume() {
    super.onResume()
    compass.start()
    checkForImmediateUpdate()
  }

  override fun onPause() {
    super.onPause()
    compass.stop()
  }

  @Suppress("OVERRIDE_DEPRECATION")
  override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    super.onActivityResult(requestCode, resultCode, data)
    if (requestCode == APP_UPDATE_REQUEST_CODE && resultCode != Activity.RESULT_OK) {
      finish()
    }
  }

  private fun checkForImmediateUpdate() {
    if (!shouldForceUpdate()) {
      return
    }

    appUpdateManager.appUpdateInfo.addOnSuccessListener { info ->
      val updateReady = info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
        info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
      val updateInProgress = info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS

      if (updateReady || updateInProgress) {
        val updateOptions = AppUpdateOptions.newBuilder(AppUpdateType.IMMEDIATE).build()
        appUpdateManager.startUpdateFlowForResult(
          info,
          this,
          updateOptions,
          APP_UPDATE_REQUEST_CODE
        )
      }
    }
  }

  companion object {
    private const val APP_UPDATE_REQUEST_CODE = 4210
    private const val MIN_REQUIRED_MAJOR_VERSION = 3
  }

  private fun shouldForceUpdate(): Boolean {
    val major = BuildConfig.VERSION_NAME
      .split(".")
      .firstOrNull()
      ?.toIntOrNull()
      ?: 0

    return major < MIN_REQUIRED_MAJOR_VERSION
  }
}
