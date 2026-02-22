#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
try {
    const data = fs.readFileSync(file, 'utf8');
    const obj = JSON.parse(data);
    obj.identifier = 'com.prayer.madni';
    fs.writeFileSync(file, JSON.stringify(obj, null, 4), 'utf8');
    console.log('Updated identifier to com.prayer.madni in src-tauri/tauri.conf.json');
} catch (e) {
    console.error('Failed to update identifier:', e);
    process.exit(1);
}
