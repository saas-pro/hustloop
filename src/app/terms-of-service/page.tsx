"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TermsOfServicePage() {
  const [lastUpdated, setLastUpdated] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  // Render last updated date only on client
  useEffect(() => {
    setLastUpdated(
      new Date("06-05-2025").toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    );
  }, []);

  // Handle nav open/close and lock scroll
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden';
      const cardSection = document.querySelector('[data-alt-id="card-anchor"]');
      if (cardSection) {
        cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [navOpen]);

  // Dummy props for Header
  const headerProps = {
    activeView: 'home' as const,
    setActiveView: () => {},
    isLoggedIn: false,
    onLogout: () => {},
    isLoading: false,
    isStaticPage: true,
    navOpen,
    setNavOpen,
    heroVisible: false,
  };
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <div onClick={() => router.push('/')} className="cursor-pointer">
          <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} className="h-12 w-auto min-w-[120px] max-w-[200px] object-contain" />
        </div>
        <Link
          href="/"
          passHref
          className="
                          relative pointer-events-auto typeform-trigger rounded-xl 
                          md:w-[3.5rem] md:h-[3.5rem] 
                          bg-white/10 flex items-center justify-center cursor-pointer 
                          hover:bg-accent/20 transition-colors 
                          z-10 
                          md:border md:border-solid md:box-border md:backdrop-blur-md
                          ">
          <button className="w-14 h-14 flex items-center justify-center">
            <Home className="h-6 w-6" />
          </button>
        </Link>

      </div>
      <Header {...headerProps} />
      <main
        className={`flex-grow container relative z-40 ultrawide-fix m-auto pointer-events-auto px-4 py-12 md:pb-4 md:pt-14 ${
          navOpen ? 'overflow-hidden' : 'overflow-auto'
        } pt-20 md:pt-20`}
        id="main-view1"
        data-alt-id="card-anchor"
      >
        <Card>
          <div className="relative">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-headline">
                Terms of Service
              </CardTitle>
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
            <ScrollArea
              className="max-h-[60vh] pr-6 overflow-auto touch-auto"
              style={{
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain', 
              }}
            >
              <div className="space-y-6 prose dark:prose-invert max-w-none">
                <p>
                  Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms
                  of Service&quot;) carefully before using the Hustloop website
                  (the &quot;Service&quot;) operated by Hustloop (&quot;us&quot;,
                  &quot;we&quot;, or &quot;our&quot;).
                </p>

                <h3 className="font-bold text-xl">1. Agreement to Terms</h3>
                <p>
                  By accessing or using our Service, you agree to be bound by
                  these Terms. If you disagree with any part of the terms, then
                  you may not access the Service. This is a legally binding
                  agreement.
                </p>

                <h3 className="font-bold text-xl">2. Accounts</h3>
                <p>
                  When you create an account with us, you must provide us with
                  information that is accurate, complete, and current at all
                  times. Failure to do so constitutes a breach of the Terms,
                  which may result in immediate termination of your account on
                  our Service. You are responsible for safeguarding the password
                  that you use to access the Service and for any activities or
                  actions under your password.
                </p>

                <h3 className="font-bold text-xl">3. Subscriptions</h3>
                <p>
                  Some parts of the Service are billed on a subscription basis
                  (&quot;Subscription(s)&quot;). You will be billed in advance on
                  a recurring and periodic basis (&quot;Billing Cycle&quot;).
                  Billing cycles are set either on a monthly or annual basis,
                  depending on the type of subscription plan you select when
                  purchasing a Subscription.
                </p>
                <p>
                  At the end of each Billing Cycle, your Subscription will
                  automatically renew under the exact same conditions unless you
                  cancel it or Hustloop cancels it. You may cancel your
                  Subscription renewal either through your online account
                  management page or by contacting customer support.
                </p>

                <h3 className="font-bold text-xl">4. Content</h3>
                <p>
                  Our Service allows you to post, link, store, share and
                  otherwise make available certain information, text, graphics,
                  videos, or other material (&quot;Content&quot;). You are
                  responsible for the Content that you post to the Service,
                  including its legality, reliability, and appropriateness.
                </p>

                <h3 className="font-bold text-xl">5. Limitation Of Liability</h3>
                <p>
                  In no event shall Hustloop, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from your
                  access to or use of or inability to access or use the Service.
                </p>

                <h3 className="font-bold text-xl">6. Governing Law</h3>
                <p>
                  These Terms shall be governed and construed in accordance with
                  the laws of India, without regard to its conflict of law
                  provisions.
                </p>

                <h3 className="font-bold text-xl">7. Changes</h3>
                <p>
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material we
                  will provide at least 30 days&apos; notice prior to any new
                  terms taking effect. What constitutes a material change will
                  be determined at our sole discretion.
                </p>

                <h3 className="font-bold text-xl">Contact Us</h3>
                <p>
                  If you have any questions about these Terms, please contact us
                  at: support@hustloop.com.
                </p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <div className="block w-full pt-8">
          <Footer />
        </div>
      </main>
    </div>
  );
}
