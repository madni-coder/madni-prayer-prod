import StoreDetailClient from "./StoreDetailClient";
import prisma from "../../../../../lib/prisma";

export async function generateStaticParams() {
    try {
        const stores = await prisma.localStore.findMany({ select: { id: true } });
        return stores.map((s) => ({ id: String(s.id) }));
    } catch (err) {
        console.error('generateStaticParams error', err);
        return [];
    }
}

export default async function Page({ params }) {
    const { id } = await params;
    return <StoreDetailClient id={id} />;
}

