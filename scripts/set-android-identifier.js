#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const VERCEL_URL = 'https://raahehidayat.vercel.app';

const tauriConfPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const appConfigPath = path.join(__dirname, '..', 'public', 'app-config.json');

try {
    // ── 1. Update tauri.conf.json ──────────────────────────────────────────
    const tauriData = fs.readFileSync(tauriConfPath, 'utf8');
    const tauriConf = JSON.parse(tauriData);

    // Set correct Android identifier
    tauriConf.identifier = 'com.prayer.madni';

    // Ensure no hardcoded window URL — app must load from local bundle (out/)
    if (tauriConf.app && tauriConf.app.windows && tauriConf.app.windows[0]) {
        delete tauriConf.app.windows[0].url;
    }

    // devUrl is only used during `tauri dev`, set to localhost
    if (!tauriConf.build) tauriConf.build = {};
    tauriConf.build.devUrl = 'http://localhost:3000';

    fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 4), 'utf8');
    console.log('✅ Updated tauri.conf.json for Android:');
    console.log('   identifier     = com.prayer.madni');
    console.log('   windows[0].url = removed (local bundle)');
    console.log('   build.devUrl   = http://localhost:3000');

    // ── 2. Sync current_version in public/app-config.json ──────────────────
    // This keeps the Vercel-side version in sync with the Play Store build version
    const currentVersion = tauriConf.version;
    if (currentVersion && fs.existsSync(appConfigPath)) {
        const appConfigData = fs.readFileSync(appConfigPath, 'utf8');
        const appConfig = JSON.parse(appConfigData);
        appConfig.current_version = currentVersion;
        fs.writeFileSync(appConfigPath, JSON.stringify(appConfig, null, 2), 'utf8');
        console.log('✅ Synced current_version in public/app-config.json = ' + currentVersion);
    } else if (!currentVersion) {
        console.warn('⚠️  No version found in tauri.conf.json — skipping app-config.json sync');
    }

} catch (e) {
    console.error('Failed to update configs:', e);
    process.exit(1);
}
