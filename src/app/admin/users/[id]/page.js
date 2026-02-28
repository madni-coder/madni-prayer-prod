export const dynamicParams = false;

export async function generateStaticParams() {
    const placeholder = [{ id: "__placeholder" }];
    try {
        const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://raahehidayat.vercel.app").replace(/\/$/, "");
        const res = await fetch(`${base}/api/auth/users`, { cache: "no-store" });
        if (!res.ok) return placeholder;
        const json = await res.json();
        const users = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
        return users.length > 0 ? users.map((u) => ({ id: String(u.id) })) : placeholder;
    } catch {
        return placeholder;
    }
}

export default function Page({ params }) {
    return null;
}
