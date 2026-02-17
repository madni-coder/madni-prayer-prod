const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const projectRoot = path.join(__dirname, "..");
const tauriConfPath = path.join(projectRoot, "src-tauri", "tauri.conf.json");
const nextLockPath = path.join(projectRoot, ".next", "dev", "lock");

function getDevUrl() {
    try {
        const conf = JSON.parse(fs.readFileSync(tauriConfPath, "utf8"));
        return conf?.build?.devUrl || "http://127.0.0.1:3000";
    } catch {
        return "http://127.0.0.1:3000";
    }
}

async function isServerReachable(url) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    try {
        const response = await fetch(url, {
            method: "GET",
            signal: controller.signal,
        });

        return response.ok || response.status < 500;
    } catch {
        return false;
    } finally {
        clearTimeout(timeout);
    }
}

function removeStaleNextLock() {
    try {
        if (fs.existsSync(nextLockPath)) {
            fs.rmSync(nextLockPath, { force: true });
            console.log("Removed stale Next.js dev lock file");
        }
    } catch (error) {
        console.warn("Could not remove .next/dev/lock:", error.message);
    }
}

async function main() {
    const devUrl = getDevUrl();
    const reachable = await isServerReachable(devUrl);

    if (reachable) {
        console.log(`Dev server already running at ${devUrl}. Reusing it.`);
        process.exit(0);
    }

    removeStaleNextLock();
    console.log(`Starting Next.js dev server for ${devUrl}...`);

    const child = spawn("npm", ["run", "dev"], {
        cwd: projectRoot,
        stdio: "inherit",
        shell: true,
    });

    child.on("exit", (code) => {
        process.exit(code ?? 1);
    });
}

main();