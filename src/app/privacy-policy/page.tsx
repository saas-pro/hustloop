
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { set } from 'date-fns';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  // This prevents hydration mismatch by rendering the date only on the client.
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  // Dummy props for the Header, as it's used statically here and doesn't need to change views.
  const headerProps = {
    activeView: "home" as const,
    setActiveView: () => { },
    isLoggedIn: false,
    onLogout: () => { },
    isLoading: false, // Set to false as we are not checking auth status on this page
    isStaticPage: true,
    navOpen: false,
    setNavOpen: () => { },
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header {...headerProps} />
        <main className="flex-grow container relative z-40 h-screen w-screen ultrawide-fix m-auto pointer-events-auto  px-4 py-12 md:py-16" id='main-view'>
          <Card>
            <div className='relative'>
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl font-headline">Privacy Policy</CardTitle>
                <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
              </CardHeader>
              <Link
                href="/"
                className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Close and return home"
              >
                <X className="h-6 w-6 text-foreground" />
              </Link>
            </div>
            <CardContent>
              <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-6 prose dark:prose-invert max-w-none">
                  <p>
                    Hustloop (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by Hustloop.
                  </p>

                  <h3 className="font-bold text-xl">1. Information We Collect</h3>
                  <p>
                    We collect information you provide directly to us, such as when you create an account, subscribe, contact us for support, or otherwise communicate with us. The types of information we may collect include your name, email address, password, payment information, and any other information you choose to provide.
                  </p>

                  <h3 className="font-bold text-xl">2. How We Use Your Information</h3>
                  <p>
                    We use the information we collect to operate, maintain, and provide the features and functionality of the Hustloop platform, including to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Create and manage your account.</li>
                    <li>Process transactions and send you related information, including confirmations and invoices.</li>
                    <li>Communicate with you about products, services, offers, and events.</li>
                    <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
                    <li>Personalize the services and provide advertisements, content, or features that match user profiles or interests.</li>
                  </ul>

                  <h3 className="font-bold text-xl">3. How We Share Your Information</h3>
                  <p>
                    We may share your information with third-party vendors and service providers that provide services on our behalf, such as payment processing, data analysis, email delivery, and hosting services. We may also share information if we believe disclosure is necessary to comply with any applicable law, regulation, legal process, or governmental request.
                  </p>

                  <h3 className="font-bold text-xl">4. Your Choices</h3>
                  <p>
                    You may update, correct, or delete information about you at any time by logging into your online account or emailing us at support@hustloop.com. If you wish to delete your account, please contact us, but note that we may retain certain information as required by law or for legitimate business purposes.
                  </p>

                  <h3 className="font-bold text-xl">5. Changes to This Policy</h3>
                  <p>
                    We may change this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice.
                  </p>

                  <h3 className="font-bold text-xl">Contact Us</h3>
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at: support@hustloop.com.
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <div className='mt-10'>
            <Footer />
          </div>
        </main>

      </div>
    </>
  );
}
