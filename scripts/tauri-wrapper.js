#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
if (args.includes('android')) {
    const setScript = path.join(__dirname, 'set-android-identifier.js');
    const res = spawnSync('node', [setScript], { stdio: 'inherit' });
    if (res.status !== 0) process.exit(res.status);
}

const res = spawnSync('npx', ['tauri', ...args], { stdio: 'inherit' });
process.exit(res.status || 0);
