import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import IosClassSetter from "./IosClassSetter.client";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Raahe Hidayat Web",
    description: "Raahe Hidayat Bsp",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" data-theme="forest">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <TopNav />

                <IosClassSetter />

                {children}

                {/* <BottomNav /> */}
            </body>
        </html>
    );
}
