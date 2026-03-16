import EventPageClient from "./EventPageClient";

export async function generateStaticParams() {
    const placeholder = [{ slug: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const res = await fetch(`${base}/api/events`, { cache: "no-store" });
        if (!res.ok) return placeholder;
        const json = await res.json();
        const events = Array.isArray(json.events) ? json.events : [];
        return events.length > 0 ? events.map((ev) => ({ slug: ev.slug })) : placeholder;
    } catch (err) {
        console.error("generateStaticParams error", err);
        return placeholder;
    }
}

export default async function Page({ params }) {
    const p = await params;
    return <EventPageClient slug={p?.slug} />;
}
