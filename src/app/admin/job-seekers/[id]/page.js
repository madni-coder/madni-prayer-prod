import JobSeekerDetailClient from "./JobSeekerDetailClient";

export async function generateStaticParams() {
    try {
        // Lazy import prisma to ensure any initialization errors are caught here
        const { default: prisma } = await import("../../../../../lib/prisma");
        const seekers = await prisma.jobSeeker.findMany({ select: { id: true } });
        return seekers.map((s) => ({ id: String(s.id) }));
    } catch (err) {
        console.error('generateStaticParams error', err);
        return [];
    }
}

export default async function Page({ params }) {
    const { id } = await params;
    return <JobSeekerDetailClient id={id} />;
}
