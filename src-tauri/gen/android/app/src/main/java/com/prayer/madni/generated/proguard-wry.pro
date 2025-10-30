# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.prayer.madni.* {
  native <methods>;
}

-keep class com.prayer.madni.WryActivity {
  public <init>(...);

  void setWebView(com.prayer.madni.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.prayer.madni.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.prayer.madni.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.prayer.madni.RustWebChromeClient,com.prayer.madni.RustWebViewClient {
  public <init>(...);
}
