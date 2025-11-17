package com.maximaceres.app
import expo.modules.splashscreen.SplashScreenManager

import android.os.Build
import android.os.Bundle
import android.view.KeyEvent

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    // setTheme(R.style.AppTheme);
    // @generated begin expo-splashscreen - expo prebuild (DO NOT MODIFY) sync-f3ff59a738c56c9a6119210cb55f0b613eb8b6af
    SplashScreenManager.registerOnActivity(this)
    // @generated end expo-splashscreen
    super.onCreate(null)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }

  /**
   * Captura eventos de teclado del control remoto de TV
   * y los envía a JavaScript para navegación manual
   */
  override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
    val reactInstanceManager = reactInstanceManager
    
    if (reactInstanceManager != null) {
      val reactContext = reactInstanceManager.currentReactContext
      
      if (reactContext != null) {
        val eventType = when (keyCode) {
          KeyEvent.KEYCODE_DPAD_UP -> "up"
          KeyEvent.KEYCODE_DPAD_DOWN -> "down"
          KeyEvent.KEYCODE_DPAD_LEFT -> "left"
          KeyEvent.KEYCODE_DPAD_RIGHT -> "right"
          KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_ENTER -> "select"
          KeyEvent.KEYCODE_BACK -> "back"
          KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> "playPause"
          else -> null
        }
        
        if (eventType != null) {
          val params = Arguments.createMap()
          params.putString("eventType", eventType)
          params.putInt("keyCode", keyCode)
          
          reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("TVRemoteKeyEvent", params)
          
          // Retornar true para indicar que manejamos el evento
          return true
        }
      }
    }
    
    return super.onKeyDown(keyCode, event)
  }
}
