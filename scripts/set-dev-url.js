const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return null;
}

function updateTauriConf(ip) {
    const confPath = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
    let raw = fs.readFileSync(confPath, 'utf8');
    let conf = JSON.parse(raw);
    const newDevUrl = `http://${ip}:3000`;
    if (!conf.build) conf.build = {};
    conf.build.devUrl = newDevUrl;
    fs.writeFileSync(confPath, JSON.stringify(conf, null, 4), 'utf8');
    console.log(`Updated src-tauri/tauri.conf.json -> build.devUrl = ${newDevUrl}`);
}

function main() {
    const ip = process.env.NEXT_PUBLIC_TAURI_DEV_HOST || getLocalIp();
    if (!ip) {
        console.warn('Could not detect local IP address; leaving tauri.conf.json unchanged.');
        console.warn('You can set NEXT_PUBLIC_TAURI_DEV_HOST to override.');
        process.exit(0);
    }
    updateTauriConf(ip);
}

main();
