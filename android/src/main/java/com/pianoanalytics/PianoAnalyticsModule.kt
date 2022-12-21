@file:Suppress("unused")

package com.pianoanalytics

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.piano.analytics.*


@Suppress("SameParameterValue")
class PianoAnalyticsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext), PianoAnalytics.OnWorkListener {

  private val pa: PianoAnalytics = PianoAnalytics.getInstance(reactContext)

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun configure(config: ReadableMap) {
    if (!config.hasKey("collectDomain")) {
      dispatchEvent("error", "In `configure`, collectDomain is not defined")
      return
    }

    if (!config.hasKey("site")) {
      dispatchEvent("error", "In `configure`, site is not defined")
      return
    }

    var builder = Configuration.Builder()
      .withCollectDomain(config.getString("collectDomain"))
      .withSite(config.getInt("site"))

    val iterator = config.keySetIterator()

    while (iterator.hasNextKey()) {
      val key = iterator.nextKey()

      builder = when (key) {
        "path" -> builder.withPath(config.getString(key))
        "customUserAgent" -> builder.withCustomUserAgent(config.getString(key))
        "crashDetection" -> builder.enableCrashDetection(config.getBoolean(key))
        "sessionBackgroundDuration" -> builder.withSessionBackgroundDuration(config.getInt(key))
        "ignoreLimitedAdvertisingTracking" -> builder.enableIgnoreLimitedAdTracking(config.getBoolean(key))
        "sendEventWhenOptout" -> builder.enableSendEventWhenOptOut(config.getBoolean(key))
        "privacyDefaultMode" -> builder.withPrivacyDefaultMode(config.getString(key))
        "offlineEncryptionMode" -> {
          when (config.getString(key)) {
            "none" -> builder.withEncryptionMode(Configuration.EncryptionMode.NONE)
            "ifCompatible" -> builder.withEncryptionMode(Configuration.EncryptionMode.IF_COMPATIBLE)
            "force" -> builder.withEncryptionMode(Configuration.EncryptionMode.FORCE)
            else -> builder
          }
        }
        "offlineStorageMode" -> {
          when (config.getString(key)) {
            "always" -> builder.withOfflineStorageMode(Configuration.OfflineStorageMode.ALWAYS)
            "required" -> builder.withOfflineStorageMode(Configuration.OfflineStorageMode.REQUIRED)
            "never" -> builder.withOfflineStorageMode(Configuration.OfflineStorageMode.NEVER)
            else -> builder
          }
        }
        // "offlineSendInterval" -> builder.withOfflineSendInterval(config.getInt(key))
        "storageLifetimePrivacy" -> builder.withStorageLifetimePrivacy(config.getInt(key))
        "storageLifetimeUser" -> builder.withStorageLifetimeUser(config.getInt(key))
        "storageLifetimeVisitor" -> builder.withStorageLifetimeVisitor(config.getInt(key))
        "visitorStorageMode" -> {
          when (config.getString(key)) {
            "fixed" -> builder.withVisitorStorageMode(Configuration.VisitorStorageMode.FIXED)
            "relative" -> builder.withVisitorStorageMode(Configuration.VisitorStorageMode.RELATIVE)
            else -> builder
          }
        }
        "visitorIdType" -> {
          when (config.getString(key)) {
            "idfa" -> builder.withVisitorIDType(Configuration.VisitorIDType.ADVERTISING_ID)
            "idfv" -> builder.withVisitorIDType(Configuration.VisitorIDType.ANDROID_ID)
            "custom" -> builder.withVisitorIDType(Configuration.VisitorIDType.CUSTOM)
            "uuid" -> builder.withVisitorIDType(Configuration.VisitorIDType.UUID)
            else -> builder
          }
        }
        "visitorId" -> builder.withVisitorID(config.getString(key))
        else -> builder
      }
    }

    pa.setConfiguration(
      builder
        .build()
    )
  }

  @ReactMethod
  fun sendPianoEvent(name: String, data: ReadableMap) {
    pa.sendEvent(Event(name, data.toHashMap()), null, this)
  }

  @ReactMethod
  fun sendPianoEvents(data: ReadableArray) {
    val events = ArrayList<Event>()
    val dataList = data.toArrayList()
    for (e in dataList) {
      if (e is ReadableMap) {
        if (!e.hasKey("name")) {
          dispatchEvent("error", "In `sendPianoEvents`, Invalid event definition: missing name")
          return
        }

        if (e.hasKey("properties")) {
          events.add(Event(
            e.getString("name") as String,
            e.getMap("properties")!!.toHashMap()
          ))
        } else {
          events.add(Event(
            e.getString("name") as String,
            emptyMap()
          ))
        }
      }
    }

    pa.sendEvents(events, null, this)
  }

  @ReactMethod
  fun setProperties(data: ReadableMap, persistent: Boolean, events: ReadableArray) {
    val eventsArray = emptyArray<String>()

    for (e in events.toArrayList()) {
      eventsArray.plus(e.toString())
    }

    pa.setProperties(
      data.toHashMap(),
      persistent,
      eventsArray,

    )
  }

  @ReactMethod
  fun setUser(id: String, category: String?, enableStorage: Boolean) {
    pa.setUser(
      id,
      category,
      enableStorage
    )
  }

  @ReactMethod
  fun deleteUser() {
    pa.deleteUser()
  }

  @ReactMethod
  fun getUser(promise: Promise) {
    pa.getUser {
      if (it == null) {
        promise.resolve(null)
      } else {
        val params = Arguments.createMap()
        params.putString("id", it.id)
        params.putString("category", it.category)
        promise.resolve(params)
      }
    }
  }

  @ReactMethod
  fun setVisitorId(id: String) {
    pa.setVisitorId(id)
  }

  @ReactMethod
  fun getVisitorId(promise: Promise) {
    pa.getVisitorId {
      promise.resolve(it)
    }
  }

  @ReactMethod
  fun setPrivacyMode(mode: String) {
    pa.privacySetMode(mode)
  }

  @ReactMethod
  fun getPrivacyMode(promise: Promise) {
    pa.privacyGetMode { promise.resolve(it) }
  }

  private fun toStringArray(source: ReadableArray): Array<String> {
    val asArray = emptyArray<String>()

    for (e in source.toArrayList()) {
      if (e is String) {
        asArray.plus(e)
      }
    }

    return asArray
  }

  @ReactMethod
  fun privacyIncludeEvents(events: ReadableArray, modes: ReadableArray) {
    pa.privacyIncludeEvents(
      toStringArray(events),
      toStringArray(modes)
    )
  }

  @ReactMethod
  fun privacyExcludeEvents(events: ReadableArray, modes: ReadableArray) {
    pa.privacyExcludeEvents(
      toStringArray(events),
      toStringArray(modes)
    )
  }

  @ReactMethod
  fun privacyIncludeProperties(properties: ReadableArray, modes: ReadableArray, events: ReadableArray) {
    pa.privacyIncludeProperties(
      toStringArray(properties),
      toStringArray(modes),
      toStringArray(events)
    )
  }

  @ReactMethod
  fun privacyExcludeProperties(properties: ReadableArray, modes: ReadableArray, events: ReadableArray) {
    pa.privacyExcludeProperties(
      toStringArray(properties),
      toStringArray(modes),
      toStringArray(events)
    )
  }

  @ReactMethod
  fun privacyIncludeStorageKeys(keys: ReadableArray, modes: ReadableArray) {
    var storageKeys = emptyArray<PianoAnalytics.PrivacyStorageFeature>()

    for (key in keys.toArrayList()) {
      storageKeys = when (key) {
        "pa_privacy" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.PRIVACY)
        "pa_crash" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.CRASH)
        "pa_lifecycle" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.LIFECYCLE)
        "pa_uid" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.USER)
        "pa_vid" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.VISITOR)
        else -> storageKeys
      }
    }

    pa.privacyIncludeStorageKeys(
      storageKeys,
      toStringArray(modes)
    )
  }

  @ReactMethod
  fun privacyExcludeStorageKeys(keys: ReadableArray, modes: ReadableArray) {
    var storageKeys = emptyArray<PianoAnalytics.PrivacyStorageFeature>()

    for (key in keys.toArrayList()) {
      storageKeys = when (key) {
        "pa_privacy" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.PRIVACY)
        "pa_crash" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.CRASH)
        "pa_lifecycle" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.LIFECYCLE)
        "pa_uid" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.USER)
        "pa_vid" -> storageKeys.plus(PianoAnalytics.PrivacyStorageFeature.VISITOR)
        else -> storageKeys
      }
    }

    pa.privacyExcludeStorageKeys(
      storageKeys,
      toStringArray(modes)
    )
  }

  private fun dispatchEvent(name: String) {
    val params = Arguments.createMap().apply {
      putString("__name", name)
    }

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit( "pianoEvent", params)
  }

  private fun dispatchEvent(name: String, data: String) {
    val params = Arguments.createMap().apply {
      putString("__name", name)
      putString("__data", data)
    }

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit( "pianoEvent", params)
  }

  private fun dispatchEvent(name: String, body: ReadableMap) {
    val params = Arguments.createMap().apply {
      putString("__name", name)
      putMap("__body", body)
    }

    reactApplicationContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit( "pianoEvent", params)
  }

  override fun onBeforeBuild(model: Model): Boolean {
    dispatchEvent("beforeBuild")
    return true
  }

  override fun onBeforeSend(built: BuiltModel, stored: Map<String, BuiltModel>): Boolean {
    val params = Arguments.createMap().apply {
      putString("uri", built.uri)
      putString("body", built.body)
    }
    dispatchEvent("beforeSend", params)
    return true
  }

  companion object {
    const val NAME = "PianoAnalytics"
  }
}
