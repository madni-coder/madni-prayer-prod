import JobSeekerDetailClient from "./JobSeekerDetailClient";

// Always render dynamically — admin pages must show live data
export const dynamic = "force-dynamic";

export default async function Page({ params }) {
    const { id } = await params;
    return <JobSeekerDetailClient id={id} />;
}
