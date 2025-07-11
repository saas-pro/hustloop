
import type {Metadata} from 'next';
import { Inter, Righteous } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import TwinklingStars from '@/components/layout/twinkling-stars';
import Script from 'next/script';

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const fontHeadline = Righteous({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400'],
});

export const metadata: Metadata = {
  title: 'Hustloop | Connect, Collaborate, Build Stronger Startup & Innovators Meet',
  description: 'A prototype startup platform that includes modules such as Blog, Mentors, Incubators, Pricing, and MSMEs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontHeadline.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  let theme = localStorage.getItem('theme');
                  if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-background font-sans">
        <div className="flex flex-col min-h-screen">
          <div className="hidden dark:block">
            <TwinklingStars />
          </div>
          {children}
        </div>
        <Toaster />
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
                        if (window.\$zoho && window.\$zoho.salesiq && window.\$zoho.salesiq.page) {
                            window.\$zoho.salesiq.page.popup.close('all');
                            window.\$zoho.salesiq.page.popup.show();
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
