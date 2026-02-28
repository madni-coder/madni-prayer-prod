import ClientPage from "./page.client";

export const dynamicParams = false;

export async function generateStaticParams() {
    const placeholder = [{ id: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const res = await fetch(`${base}/api/api-zikr`, { cache: "no-store" });
        if (!res.ok) return placeholder;
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return items.length > 0 ? items.map((i) => ({ id: String(i.id) })) : placeholder;
    } catch {
        return placeholder;
    }
}

export default async function Page({ params }) {
    const resolvedParams = await params;
    return <ClientPage params={resolvedParams} />;
}
