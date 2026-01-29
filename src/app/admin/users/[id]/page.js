import prisma from "../../../../../lib/prisma";

export async function generateStaticParams() {
    // Fetch all user ids so Next can statically export these pages.
    const users = await prisma.user.findMany({ select: { id: true } });
    return users.map((u) => ({ id: String(u.id) }));
}

export default function Page({ params }) {
    // Render nothing during export - actual page can be implemented later.
    return null;
}
