import prisma from "../../../../../lib/prisma";
import ClientPage from "./page.client";

export async function generateStaticParams() {
    const items = await prisma.zikr.findMany({ select: { id: true } });
    return items.map((i) => ({ id: String(i.id) }));
}

export default function Page({ params }) {
    return <ClientPage params={params} />;
}
