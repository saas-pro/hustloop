'use client'

import Script from "next/script"

const GoogleAnalytics = () => {
    const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

    if (!GA_ID) return null;
    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
                id="google-analytics-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    gtag('config', ${GA_ID});
                    `,
                }}
            />
        </>
    )
}

export default GoogleAnalytics