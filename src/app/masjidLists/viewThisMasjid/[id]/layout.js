export async function generateStaticParams() {
    // Return a dummy placeholder to prevent Next.js build errors for dynamic routes in static export.
    return [{ id: "placeholder" }];
}

export default function Layout({ children }) {
    return children;
}
