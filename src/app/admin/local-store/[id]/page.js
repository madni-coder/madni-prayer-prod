import StoreDetailClient from "./StoreDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    const placeholder = [{ id: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const url = `${base}/api/local-stores`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            console.error("generateStaticParams: failed to fetch", res.status);
            return placeholder;
        }
        const json = await res.json();
        const stores = Array.isArray(json.data) ? json.data : [];
        return stores.length > 0 ? stores.map((s) => ({ id: String(s.id) })) : placeholder;
    } catch (err) {
        console.error("generateStaticParams error", err);
        return placeholder;
    }
}

export default async function Page({ params }) {
    const p = await params;
    const { id } = p || {};
    return <StoreDetailClient id={id} />;
}
