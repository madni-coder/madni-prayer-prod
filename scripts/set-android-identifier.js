#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const VERCEL_URL = 'https://raahehidayat.vercel.app';

const file = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
try {
    const data = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(data);

    // Set correct Android identifier
    obj.identifier = 'com.prayer.madni';

    // ✅ Ensure window loads from Vercel (same as iOS behavior)
    // This makes Android reflect code changes instantly without app store update
    if (!obj.app) obj.app = {};
    if (!obj.app.windows) obj.app.windows = [{}];
    obj.app.windows[0].url = VERCEL_URL;

    // ✅ Also set devUrl to Vercel so both dev and prod point to Vercel
    if (!obj.build) obj.build = {};
    obj.build.devUrl = VERCEL_URL;

    fs.writeFileSync(file, JSON.stringify(obj, null, 4), 'utf8');
    console.log('✅ Updated tauri.conf.json for Android:');
    console.log('   identifier   = com.prayer.madni');
    console.log('   windows[0].url = ' + VERCEL_URL);
    console.log('   build.devUrl   = ' + VERCEL_URL);
} catch (e) {
    console.error('Failed to update identifier:', e);
    process.exit(1);
}
