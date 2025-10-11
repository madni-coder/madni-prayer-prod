import { FaUsers, FaBullseye, FaHeart } from "react-icons/fa";

export default function AboutUs() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <h1 className="text-4xl font-bold mb-6 text-green-700 dark:text-green-400">
                About Us
            </h1>
            <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                    <FaUsers className="text-3xl text-blue-500 mr-3" />
                    <span className="text-lg font-semibold">Our Team</span>
                </div>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                    We are a passionate group dedicated to making daily Islamic
                    practices accessible and meaningful for everyone.
                </p>
                <div className="flex items-center mb-4">
                    <FaBullseye className="text-3xl text-green-500 mr-3" />
                    <span className="text-lg font-semibold">Our Mission</span>
                </div>
                <p className="mb-6 text-gray-700 dark:text-gray-300">
                    Our mission is to provide easy-to-use tools and resources to
                    help you stay connected with your faith.
                </p>
                <div className="flex items-center mb-4">
                    <FaHeart className="text-3xl text-pink-500 mr-3" />
                    <span className="text-lg font-semibold">Our Values</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                    We value community, accessibility, and spiritual growth.
                </p>
            </div>
        </main>
    );
}
