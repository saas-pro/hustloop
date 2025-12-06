

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
  description: 'Hustloop is an open innovation and startup collaboration platform that connects founders, MSMEs, innovators, and students to solve real business challenges and drive technology transfer.',
  keywords: ['startup', 'innovation', 'team', 'incentive challenge', 'collaboration', 'founders', 'students', 'technology transfer', 'ecosystem'],
  authors: [{ name: 'Hustloop' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hustloop.com',
    title: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
    description: 'Hustloop is an open innovation and startup collaboration platform that connects founders, MSMEs, innovators, and students to solve real business challenges and drive technology transfer.',
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
    description: 'Hustloop is an open innovation and startup collaboration platform that connects founders, MSMEs, innovators, and students to solve real business challenges and drive technology transfer.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <Script id="org-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Hustloop",
            "url": "https://hustloop.com",
            "description": "Hustloop is an open innovation and startup collaboration platform that connects founders, MSMEs, innovators, and students to solve real business challenges and drive technology transfer.",
            "logo": "https://hustloop.com/logo.png"
          })}
        </Script>
        <Script id="website-schema" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Hustloop",
            "description": "Hustloop is an open innovation and startup collaboration platform that connects founders, MSMEs, innovators, and students to solve real business challenges and drive technology transfer.",
            "url": "https://hustloop.com"
          })}
        </Script>
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
      </body>
    </html >
  );
}
