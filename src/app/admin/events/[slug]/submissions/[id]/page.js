import SubmissionDetailClient from "./SubmissionDetailClient";

export async function generateStaticParams() {
    const placeholder = [{ slug: "__placeholder", id: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        // Fetch all events first
        const eventsRes = await fetch(`${base}/api/admin/events`, { cache: "no-store" });
        if (!eventsRes.ok) return placeholder;
        const eventsJson = await eventsRes.json();
        const events = Array.isArray(eventsJson.events) ? eventsJson.events : [];
        if (events.length === 0) return placeholder;

        // For each event, fetch its submissions to get all (slug, id) pairs
        const allParams = [];
        for (const ev of events) {
            try {
                const subRes = await fetch(`${base}/api/admin/events/${ev.slug}/submissions`, { cache: "no-store" });
                if (!subRes.ok) continue;
                const subJson = await subRes.json();
                const subs = Array.isArray(subJson.submissions) ? subJson.submissions : [];
                for (const sub of subs) {
                    allParams.push({ slug: ev.slug, id: String(sub.id) });
                }
            } catch {
                // skip this event's submissions on error
            }
        }

        return allParams.length > 0 ? allParams : placeholder;
    } catch (err) {
        console.error("generateStaticParams error", err);
        return placeholder;
    }
}

export default async function Page({ params }) {
    const p = await params;
    return <SubmissionDetailClient slug={p?.slug} id={p?.id} />;
}
