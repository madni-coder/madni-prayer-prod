#!/usr/bin/env node
/**
 * sync-version.js
 * Reads version from src-tauri/tauri.conf.json and writes it to .env.production.local
 * so that NEXT_PUBLIC_APP_VERSION is correctly baked into the Next.js bundle.
 *
 * Run automatically before iOS/Android builds via package.json scripts.
 * NOT needed for Vercel — .env.production.local is committed with the correct version.
 */

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const tauriConfPath = path.join(root, "src-tauri", "tauri.conf.json");
const envFilePath = path.join(root, ".env.production.local");

try {
    const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, "utf-8"));
    const version = tauriConf?.version;

    if (!version) {
        console.error("[sync-version] ❌ No version found in tauri.conf.json");
        process.exit(1);
    }

    // Read existing .env.production.local if it exists, update/add the variable
    let envContent = "";
    if (fs.existsSync(envFilePath)) {
        envContent = fs.readFileSync(envFilePath, "utf-8");
        // Remove existing NEXT_PUBLIC_APP_VERSION line if present
        envContent = envContent
            .split("\n")
            .filter((line) => !line.startsWith("NEXT_PUBLIC_APP_VERSION="))
            .join("\n");
        if (envContent && !envContent.endsWith("\n")) envContent += "\n";
    }

    envContent += `NEXT_PUBLIC_APP_VERSION=${version}\n`;
    fs.writeFileSync(envFilePath, envContent, "utf-8");

    console.log(
        `[sync-version] ✅ NEXT_PUBLIC_APP_VERSION=${version} written to .env.production.local`
    );
} catch (err) {
    console.error("[sync-version] ❌ Error:", err.message);
    process.exit(1);
}
