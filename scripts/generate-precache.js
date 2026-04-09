/**
 * generate-precache.js
 *
 * Runs after `next build` (both SSR and static-export modes).
 * Scans .next/static/ for all hashed JS/CSS chunks, combines with
 * known page routes and public image assets, then writes
 * public/precache-manifest.json so the Service Worker can
 * download EVERYTHING in one shot on first install.
 */

const fs   = require('fs');
const path = require('path');

const ROOT       = path.join(__dirname, '..');
const NEXT_DIR   = path.join(ROOT, '.next', 'static');
const OUTPUT     = path.join(ROOT, 'public', 'precache-manifest.json');

// ── 1. All hashed JS/CSS chunks from the Next.js build ──────────────────────
function collectNextChunks() {
    if (!fs.existsSync(NEXT_DIR)) return [];

    const results = [];

    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (/\.(js|css)$/.test(entry.name)) {
                // Convert .next/static/... → /_next/static/...
                const rel = full.replace(NEXT_DIR, '').replace(/\\/g, '/');
                results.push(`/_next/static${rel}`);
            }
        }
    }

    walk(NEXT_DIR);
    return results;
}

// ── 2. User-facing page routes (no admin, no dynamic [slug] routes) ──────────
const PAGE_ROUTES = [
    '/',
    '/aboutUs',
    '/committee',
    '/committee/eventUpdates',
    '/committee/rhPrograms',
    '/contactUs',
    '/events',
    '/islamicStar',
    '/jamat-times',
    '/jobPortal',
    '/jobPortal/Resume',
    '/jobPortal/Resume/editResume',
    '/jobPortal/applyForJob',
    '/jobPortal/auth/signin',
    '/jobPortal/auth/signup',
    '/jobPortal/hire',
    '/jobPortal/jobLists',
    '/local-stores',
    '/local-stores/viewStore',
    '/login',
    '/masjidLists',
    '/more',
    '/myProfile',
    '/notice',
    '/pdf-viewer',
    '/prayer-times',
    '/privacy',
    '/qibla',
    '/quran',
    '/rewards',
    '/settings',
    '/tasbih',
    '/zikr',
    '/404',
];

// ── 3. Public static assets ──────────────────────────────────────────────────
const PUBLIC_ASSETS = [
    '/logo.png',
    '/tasbih.png',
    '/tasbih.svg',
    '/zikrImg.jpg',
    '/kaabaIcon.png',
    '/mosqueLogo.png',
    '/iconZikr.png',
    '/tap.png',
    '/tasbihP.png',
    '/r1.jpeg',
    '/r2.jpeg',
    '/r3.jpeg',
    '/r4.jpeg',
    '/eight.gif',
    '/app-config.json',
    '/sw.js',
];

// ── 4. pdfjs library files (8.3 MB — needed for Quran PDF viewer offline) ───
function collectPdfjsFiles() {
    const pdfjsDir = path.join(ROOT, 'public', 'pdfjs');
    if (!fs.existsSync(pdfjsDir)) return [];

    const results = [];
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else {
                const rel = full.replace(path.join(ROOT, 'public'), '').replace(/\\/g, '/');
                results.push(rel);
            }
        }
    }
    walk(pdfjsDir);
    return results;
}

// ── Build & write manifest ────────────────────────────────────────────────────
const chunks     = collectNextChunks();
const pdfjsFiles = collectPdfjsFiles();
const allUrls    = [...new Set([...PAGE_ROUTES, ...chunks, ...PUBLIC_ASSETS, ...pdfjsFiles])];

const manifest = {
    generatedAt : new Date().toISOString(),
    totalUrls   : allUrls.length,
    urls        : allUrls,
};

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));

console.log('');
console.log('✅  precache-manifest.json generated');
console.log(`    Pages    : ${PAGE_ROUTES.length}`);
console.log(`    JS/CSS   : ${chunks.length}`);
console.log(`    Assets   : ${PUBLIC_ASSETS.length}`);
console.log(`    pdfjs    : ${pdfjsFiles.length} files (8.3 MB)`);
console.log(`    TOTAL    : ${allUrls.length} URLs → ${OUTPUT}`);
console.log('');
