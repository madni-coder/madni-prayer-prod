import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const cfgPath = path.join(process.cwd(), "src-tauri", "tauri.conf.json");
        const raw = await fs.promises.readFile(cfgPath, "utf8");
        const cfg = JSON.parse(raw);
        const version = cfg && typeof cfg.version === "string" ? cfg.version : null;
        return new Response(JSON.stringify({ version }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ version: null, error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
