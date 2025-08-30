"use client";

import Image from "next/image";

// Mock data for posts
const posts = [
    {
        id: 1,
        image: "/r1.jpeg",
        user: "user1",
        caption: "Beautiful day!",
    },
    {
        id: 2,
        image: "/r2.jpeg",
        user: "user2",
        caption: "Exploring the world!",
    },
    {
        id: 3,
        image: "/r3.jpeg",
        user: "user3",
        caption: "Window to the soul.",
    },
    {
        id: 4,
        image: "/r4.jpeg",
        user: "user4",
        caption: "Nature vibes.",
    },
];

export default function NoticeFeed() {
    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto py-4 bg-base-100">
            <div
                className="w-full max-w-xs mx-auto overflow-y-auto"
                style={{ height: "calc(100vh - 64px)" }}
            >
                {posts.map((post) => (
                    <div
                        key={post.id}
                        className="w-full mb-6 rounded-2xl shadow-lg bg-base-100 overflow-hidden flex flex-col border-4 border-primary"
                        style={{ aspectRatio: "9/16", maxWidth: 360 }}
                    >
                        <div
                            className="relative w-full h-0 flex items-center justify-center bg-base-100"
                            style={{ paddingBottom: "177.77%" }}
                        >
                            <Image
                                src={post.image}
                                alt={post.caption}
                                fill
                                className="object-contain"
                                sizes="(max-width: 360px) 100vw, 360px"
                                priority={post.id === 1}
                            />
                        </div>
                        <div className="p-3 flex flex-col gap-1">
                            <span className="font-semibold text-base-content">
                                @{post.user}
                            </span>
                            <span className="text-sm text-base-content/70">
                                {post.caption}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
