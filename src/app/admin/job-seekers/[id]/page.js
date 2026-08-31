import prisma from "../../../../lib/prisma";
import JobSeekerDetailClient from "./JobSeekerDetailClient";

// Static export (Tauri) requires dynamicParams = false
export const dynamicParams = false;

export async function generateStaticParams() {
    const placeholder = [{ id: "__placeholder" }];

    // Prefer the local DB first — required so job seekers created in this
    // environment (e.g. local dev) are reachable, not just ones that exist
    // on the remote production API.
    try {
        const seekers = await prisma.jobSeeker.findMany({ select: { id: true } });
        if (seekers && seekers.length > 0) {
            return seekers.map((s) => ({ id: String(s.id) }));
        }
    } catch (err) {
        console.error("Prisma query error in generateStaticParams:", err);
    }

    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const url = `${base}/api/admin/job-seekers`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
            return placeholder;
        }
        const json = await res.json();
        const seekers = Array.isArray(json.data) ? json.data : (Array.isArray(json.seekers) ? json.seekers : (Array.isArray(json) ? json : []));
        return seekers.length > 0 ? seekers.map((s) => ({ id: String(s.id) })) : placeholder;
    } catch (err) {
        console.error("generateStaticParams error", err);
        return placeholder;
    }
}

export default async function Page({ params }) {
    const { id } = await params;
    return <JobSeekerDetailClient id={id} />;
}

