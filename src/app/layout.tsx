

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import TwinklingStars from '@/components/layout/twinkling-stars';
import Script from 'next/script';
import { ThemeProvider } from '@/components/theme-provider';


export const metadata: Metadata = {
  title: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
  description: 'Open talent, Real impact. An ecosystem for problem solving and tech transfer - founders, enablers, innovators and students.',
  alternates: {
    canonical: 'https://hustloop.com/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet</title>
        <meta name="description" content="Open talent, Real impact. An ecosystem for problem solving and tech transfer - founders, enablers, innovators and students."/>
          <meta name="robots" content="index, follow"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <link rel="canonical" href="https://hustloop.com"/>
                </head>
                <body className="bg-background font-sans">
                  <ThemeProvider>
                    <div className="flex-grow ">
                      <TwinklingStars />
                      {children}
                    </div>
                    <Toaster />
                  </ThemeProvider>

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
              </html>
              );
}
