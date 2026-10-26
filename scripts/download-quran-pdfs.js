#!/usr/bin/env node
/**
 * download-quran-pdfs.js
 * Downloads all Para + Surah PDFs into public/quran-pdfs/ so the Tauri app
 * bundles them and opens them offline. Run by build:tauri. Gitignored.
 * Skips files already downloaded; fails the build if any download fails.
 */

const fs = require("fs");
const path = require("path");

const API = "https://raahehidayat.vercel.app/api/api-quran";
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "public", "quran-pdfs");
const surahs = require(path.join(root, "src", "app", "quran", "surahs.json"));

async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return res.json();
}

async function download(url, name) {
    const dest = path.join(outDir, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${name}: ${url} -> ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.subarray(0, 4).toString() !== "%PDF") throw new Error(`${name}: not a PDF`);
    fs.writeFileSync(dest + ".tmp", buf);
    fs.renameSync(dest + ".tmp", dest);
    console.log(`  ${name} ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
}

(async () => {
    fs.mkdirSync(outDir, { recursive: true });
    console.log("Downloading Quran PDFs to public/quran-pdfs ...");

    const { files } = await getJson(API);
    if (!files || files.length < 30) throw new Error(`Expected 30 paras, got ${files?.length}`);
    for (const f of files) await download(f.fileUrl, `para-${f.id}.pdf`);

    for (const s of surahs) {
        const { fileUrl } = await getJson(`${API}?surah=${encodeURIComponent(s.name)}`);
        await download(fileUrl, `surah-${s.number}.pdf`);
    }
    console.log("Quran PDFs ready.");
})().catch((e) => {
    console.error("download-quran-pdfs failed:", e.message);
    process.exit(1);
});
