import JobSeekerDetailClient from "./JobSeekerDetailClient";

export const dynamicParams = false;

export async function generateStaticParams() {
    const placeholder = [{ id: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const res = await fetch(`${base}/api/api-job-seekers`, { cache: "no-store" });
        if (!res.ok) return placeholder;
        const json = await res.json();
        const seekers = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return seekers.length > 0 ? seekers.map((s) => ({ id: String(s.id) })) : placeholder;
    } catch {
        return placeholder;
    }
}

export default async function Page({ params }) {
    const { id } = await params;
    return <JobSeekerDetailClient id={id} />;
}
