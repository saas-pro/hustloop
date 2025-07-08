
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import TwinklingStars from '@/components/layout/twinkling-stars';

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
    <html lang="en" suppressHydrationWarning>
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Righteous&display=swap" rel="stylesheet" />
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
