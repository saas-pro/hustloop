

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import TwinklingStars from '@/components/layout/twinkling-stars';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';
import GoogleAnalytics from "./metrics/GoogleAnalytics"
import MicrosoftClarity from "./metrics/MicrosoftClarity"



export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://hustloop.com'),
  title: {
    default: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
    template: '%s | Hustloop',
  },
  description: 'Open talent, Real impact. A dynamic ecosystem for problem solving and technology transfer. We connect founders, enablers, innovators, and students to collaborate, build startups, and drive meaningful innovation together.',
  keywords: ['startup', 'innovation', 'team', 'incentive challenge', 'collaboration', 'founders', 'students', 'technology transfer', 'ecosystem'],
  authors: [{ name: 'Hustloop' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hustloop.com',
    title: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
    description: 'Open talent, Real impact. A dynamic ecosystem for problem solving and technology transfer. We connect founders, enablers, innovators, and students to collaborate, build startups, and drive meaningful innovation together.',
    siteName: 'Hustloop',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Hustloop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
    description: 'Open talent, Real impact. A dynamic ecosystem for problem solving and technology transfer. We connect founders, enablers, innovators, and students to collaborate, build startups, and drive meaningful innovation together.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://hustloop.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background font-sans">
        <ThemeProvider>
          <div className="flex-grow ">
            {/* <TwinklingStars /> */}
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Script id="zoho-salesiq-script" strategy="lazyOnload">
          {`
            window.$zoho = window.$zoho || {};
            window.$zoho.salesiq = window.$zoho.salesiq || {
              widgetcode: "siq770fac757336897d739f9273d8f8f7b3aec5f63c512be52582e5f9e3440d863b",
              values: {},
              ready: function () {
                var salesiqDoc = document.getElementById("zsiq_float");
                if (salesiqDoc) {
                    document.addEventListener('router:end', (event) => {
                        if (window.$zoho && window.$zoho.salesiq && window.$zoho.salesiq.page) {
                            window.$zoho.salesiq.page.popup.close('all');
                            window.$zoho.salesiq.page.popup.show();
                        }
                    });
                }
              }
            };
            
            var d = document;
            var s = d.createElement("script");
            s.type = "text/javascript";
            s.id = "zsiqscript";
            s.defer = true;
            s.src = "https://salesiq.zohopublic.in/widget";
            var t = d.getElementsByTagName("script")[0];
            t.parentNode.insertBefore(s, t);
          `}

        </Script>
        <Script id="org-schema" type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Hustloop",
            "url": "https://hustloop.com",
            "description": "Open talent, real impact. Hustloop connects founders, innovators, MSMEs, and students to collaborate, solve challenges, and accelerate startup growth.",
            "logo": "https://hustloop.com/logo.png"
          }
          `}
        </Script>
        <Script id="website-schema" type="application/ld+json">
          {`
            [
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Hustloop",
                "url": "https://hustloop.com"
              },
              {
                "@context": "https://schema.org",
                "@type": "ItemList",
                "itemListElement": [
                  {
                    "@type": "SiteNavigationElement",
                    "position": 1,
                    "name": "Pricing",
                    "description": "View our pricing plans",
                    "url": "https://hustloop.com/pricing"
                  },
                  {
                    "@type": "SiteNavigationElement",
                    "position": 2,
                    "name": "Contact Us",
                    "description": "Contact our team",
                    "url": "https://hustloop.com/contact-us"
                  }
                ]
              }
            ]
          `}
        </Script>
      </body>
    </html >
  );
}
