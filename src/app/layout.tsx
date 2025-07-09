
import type {Metadata} from 'next';
import { Inter, Righteous } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import TwinklingStars from '@/components/layout/twinkling-stars';

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
  title: 'hustloop',
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
        <div className="hidden dark:block">
          <TwinklingStars />
        </div>
        <div className="flex flex-col min-h-screen relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
