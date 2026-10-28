'use client'

import Script from "next/script"

// Google Ads Conversion tracking helper: call this function on conversion events (e.g. form submission, signup)
export const trackGoogleAdsConversion = (conversionSendTo?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
            send_to: conversionSendTo || 'AW-18393251642',
        });
    }
};

const GoogleAnalytics = () => {
    // Replace AW-XXXXXXXXXX with your Google Ads Conversion ID (starts with AW-)
    const GOOGLE_ADS_ID = 'AW-18393251642';

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=G-HVTHQZ2SFM`}
            />
            <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18393251642"></Script>

            <Script
                id="google-analytics-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());

                    // Google Analytics 4
                    gtag('config', 'G-HVTHQZ2SFM');

                    // Google Ads Conversion Tracking
                    // Replace 'AW-XXXXXXXXXX' with your Google Ads tag ID
                    gtag('config', '${GOOGLE_ADS_ID}');
                    `,
                }}
            />
        </>
    )
}

export default GoogleAnalytics
