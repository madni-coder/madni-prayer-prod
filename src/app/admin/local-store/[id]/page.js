import StoreDetailClient from "./StoreDetailClient";

export async function generateStaticParams() {
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_TAURI_DEV_HOST || "https://madni-prayer.vercel.app").replace(/\/$/, "");
        const url = `${base}/api/local-stores`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            console.error("generateStaticParams: failed to fetch", res.status);
            return [];
        }
        const json = await res.json();
        const stores = Array.isArray(json.data) ? json.data : [];
        return stores.map((s) => ({ id: String(s.id) }));
    } catch (err) {
        console.error("generateStaticParams error", err);
        return [];
    }
}

export default function Page({ params }) {
    const { id } = params || {};
    return <StoreDetailClient id={id} />;
}

