
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  // This prevents hydration mismatch by rendering the date only on the client.
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);


  // Dummy props for the Header, as it's used statically here and doesn't need to change views.
  const headerProps = {
    activeView: "home" as const,
    setActiveView: () => {},
    isLoggedIn: false,
    onLogout: () => {},
    isLoading: false, // Set to false as we are not checking auth status on this page
    isStaticPage: true,
    navOpen: false,
    setNavOpen: () => {},
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header {...headerProps} />
        <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-headline">Terms of Service</CardTitle>
              <p className="text-muted-foreground">Last Updated: {lastUpdated}</p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] pr-6">
                <div className="space-y-6 prose dark:prose-invert max-w-none">
                  <p>
                    Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms of Service&quot;) carefully before using the Hustloop website (the &quot;Service&quot;) operated by Hustloop (&quot;us&quot;, &quot;we&quot;, or &quot;our&quot;).
                  </p>

                  <h3 className="font-bold text-xl">1. Agreement to Terms</h3>
                  <p>
                    By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service. This is a legally binding agreement.
                  </p>

                  <h3 className="font-bold text-xl">2. Accounts</h3>
                  <p>
                    When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
                  </p>

                  <h3 className="font-bold text-xl">3. Subscriptions</h3>
                  <p>
                    Some parts of the Service are billed on a subscription basis (&quot;Subscription(s)&quot;). You will be billed in advance on a recurring and periodic basis (&quot;Billing Cycle&quot;). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
                  </p>
                  <p>
                    At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or Hustloop cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting customer support.
                  </p>

                  <h3 className="font-bold text-xl">4. Content</h3>
                  <p>
                    Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (&quot;Content&quot;). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.
                  </p>

                  <h3 className="font-bold text-xl">5. Limitation Of Liability</h3>
                  <p>
                    In no event shall Hustloop, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                  </p>
                  
                  <h3 className="font-bold text-xl">6. Governing Law</h3>
                  <p>
                    These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                  </p>

                  <h3 className="font-bold text-xl">7. Changes</h3>
                  <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days&apos; notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                  </p>

                  <h3 className="font-bold text-xl">Contact Us</h3>
                  <p>
                    If you have any questions about these Terms, please contact us at: support@hustloop.com.
                  </p>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}
