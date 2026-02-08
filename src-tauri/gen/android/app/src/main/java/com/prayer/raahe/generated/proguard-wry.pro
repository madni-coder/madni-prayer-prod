# THIS FILE IS AUTO-GENERATED. DO NOT MODIFY!!

# Copyright 2020-2023 Tauri Programme within The Commons Conservancy
# SPDX-License-Identifier: Apache-2.0
# SPDX-License-Identifier: MIT

-keep class com.prayer.raahe.* {
  native <methods>;
}

-keep class com.prayer.raahe.WryActivity {
  public <init>(...);

  void setWebView(com.prayer.raahe.RustWebView);
  java.lang.Class getAppClass(...);
  java.lang.String getVersion();
}

-keep class com.prayer.raahe.Ipc {
  public <init>(...);

  @android.webkit.JavascriptInterface public <methods>;
}

-keep class com.prayer.raahe.RustWebView {
  public <init>(...);

  void loadUrlMainThread(...);
  void loadHTMLMainThread(...);
  void evalScript(...);
}

-keep class com.prayer.raahe.RustWebChromeClient,com.prayer.raahe.RustWebViewClient {
  public <init>(...);
}
