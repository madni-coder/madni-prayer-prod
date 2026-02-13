import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, Slide } from "react-toastify";
import TopNav from "./TopNav";
import BottomNav from "./BottomNav";
import IosClassSetter from "./IosClassSetter.client";
import ForceUpdateChecker from "../components/ForceUpdateChecker.client";

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
                <ForceUpdateChecker />

                {children}

                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar={false}
                    newestOnTop={true}
                    closeOnClick={true}
                    rtl={false}
                    pauseOnFocusLoss={false}
                    draggable={true}
                    pauseOnHover={true}
                    transition={Slide}
                    theme="dark"
                />
                {/* <BottomNav /> */}
            </body>
        </html>
    );
}
