#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_haptics::init())
    .plugin(tauri_plugin_geolocation::init())
    // Handles both local notifications (test-notification flow) and push
    // notifications (FCM on Android, APNs on iOS). tauri_plugin_notification
    // (the official plugin) was removed: this fork ships the same Android
    // classes under the same package, which caused a dex-merge conflict
    // when both plugins were registered together.
    .plugin(tauri_plugin_notifications::init())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
