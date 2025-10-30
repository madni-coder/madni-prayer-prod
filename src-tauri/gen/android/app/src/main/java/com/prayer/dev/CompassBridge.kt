package com.prayer.madni

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.view.Surface
import android.view.WindowManager
import android.webkit.WebView

class CompassBridge(private val context: Context) : SensorEventListener {
  private val sensorManager: SensorManager? = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
  private val rotationSensor: Sensor? =
    sensorManager?.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
      ?: sensorManager?.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)
  private var webView: WebView? = null

  fun attachWebView(wv: WebView) {
    webView = wv
  }

  fun start() {
    rotationSensor?.let { sensor ->
      sensorManager?.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
    }
  }

  fun stop() {
    sensorManager?.unregisterListener(this)
  }

  override fun onSensorChanged(event: SensorEvent) {
    if (event.sensor.type != Sensor.TYPE_ROTATION_VECTOR) return

    val rotationMatrix = FloatArray(9)
    SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values)

    val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
    val rotation = wm.defaultDisplay.rotation
    val outR = FloatArray(9)

    val axisX: Int
    val axisY: Int
    when (rotation) {
      Surface.ROTATION_90 -> { axisX = SensorManager.AXIS_Y; axisY = SensorManager.AXIS_MINUS_X }
      Surface.ROTATION_180 -> { axisX = SensorManager.AXIS_MINUS_X; axisY = SensorManager.AXIS_MINUS_Y }
      Surface.ROTATION_270 -> { axisX = SensorManager.AXIS_MINUS_Y; axisY = SensorManager.AXIS_X }
      else -> { axisX = SensorManager.AXIS_X; axisY = SensorManager.AXIS_Y }
    }

    SensorManager.remapCoordinateSystem(rotationMatrix, axisX, axisY, outR)

    val orientation = FloatArray(3)
    SensorManager.getOrientation(outR, orientation)
    var azimuth = Math.toDegrees(orientation[0].toDouble()).toFloat()
    if (azimuth < 0) azimuth += 360f

    val js = "window.__androidCompass && window.__androidCompass(" + azimuth + ");"
    webView?.post { webView?.evaluateJavascript(js, null) }
  }

  override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) { }
}
