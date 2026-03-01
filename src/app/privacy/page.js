'use client'

export default function PrivacyPolicy() {
    const sections = [
        {
            title: "1. Introduction",
            content: "Raah-e-Hidayat respects your privacy. This policy explains how we handle your information when you use our website raahehidayat.vercel.app."
        },
        {
            title: "2. Information We Collect",
            content: "We collect limited information:",
            items: [
                "Registration: We take all you personal details just because of tasbhih count rewards. We give rewards the person by finding his name,address,area majsid etc",
                "Location Info: Approximate location for features like Qibla direction, prayer times, Nearby Masjid.",
            ]
        },
        {
            title: "3. How We Use Information",
            content:
                "We See only durood counts with user's information that how much durood sharif a particular user has recited in a week"

        },
        {
            title: "4. Sharing of Information",
            content: "We do not sell your information. We may share non-personal data only with trusted service providers (hosting, analytics) or if required by law."
        },
        {
            title: "5. Cookies",
            content: "We use cookies and similar technologies to improve site performance. You may disable cookies in your browser, but some features may not work correctly."
        },
        {
            title: "6. Data Retention",
            content: "Usage data may be stored for a reasonable time to improve the website. No personal data is stored."
        },
        {
            title: "7. Security",
            content: "We use standard security measures, but no system is 100% secure."
        },
        {
            title: "8. Children's Privacy",
            content: "We do not knowingly collect personal data from children. The website is safe for general use."
        },
        {
            title: "9. External Links",
            content: "Our site may contain links to third-party websites. We are not responsible for their privacy practices."
        },
        {
            title: "10. Changes to This Policy",
            content: "We may update this policy anytime. Changes will be posted here with a new \"Effective Date\"."
        },
        {
            title: "11. Doing Check in Terms & Conditions",
            content: "By agreeing (check) to the Terms and Conditions, the user accepts all rules and regulations governing the app and its features."
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
                        Privacy Policy
                    </h1>

                </div>

                <div className="space-y-6">
                    {sections.map((section, index) => (
                        <div key={index} className="rounded-lg bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="p-6">
                                <h2 className="text-xl md:text-2xl font-semibold text-primary mb-4">
                                    {section.title}
                                </h2>
                                <div className="space-y-3">
                                    {section.content && (
                                        <p className="text-muted-foreground leading-relaxed">
                                            {section.content}
                                        </p>
                                    )}
                                    {section.items && (
                                        <ul className="space-y-2 ml-4">
                                            {section.items.map((item, itemIndex) => (
                                                <li key={itemIndex} className="text-muted-foreground leading-relaxed flex items-start">
                                                    <span className="text-primary mr-2 mt-1">•</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="my-8" />

                <div className="rounded-lg bg-muted/30 text-card-foreground shadow-sm">
                    <div className="p-6">
                        <p className="text-center text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us through our email - raahehidayatindia@gmail.com.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}