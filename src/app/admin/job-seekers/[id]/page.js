import JobSeekerDetailClient from "./JobSeekerDetailClient";
import prisma from "../../../../../lib/prisma";

export async function generateStaticParams() {
    try {
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
