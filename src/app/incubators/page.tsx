"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/header';
import { useState, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import Link from 'next/link';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import IncubatorsView from '@/components/views/incubators';
import { View } from '@/app/types';

export default function IncubatorsPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    const sub = localStorage.getItem('hasSubscription');
    setHasSubscription(sub === 'true');
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

  const headerProps = {
    activeView: 'home' as const,
    setActiveView: (v: View) => {
        if (v === 'login' || v === 'signup') {
            router.push(`/?view=${v}`);
        }
    },
    isLoggedIn,
    onLogout: () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    },
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
        <div onClick={() => router.push("/")} className="cursor-pointer">
          <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} />
        </div>
        <Link href="/" passHref>
          <Button variant="outline" size="icon" aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <Header {...headerProps} />
      <div id="main-view-wrapper">
        <main
          className={`flex-grow bg-background min-h-screen relative z-40 m-auto pointer-events-auto w-full flex flex-col`}
          data-alt-id="card-anchor"
          id="main-view1"
        >
          <div className={`container ultrawide-fix mx-auto px-4 py-12 md:pb-4 md:pt-14 ${navOpen ? 'overflow-hidden' : ''} pt-20 md:pt-20 flex-grow`}>
            <Card className="min-h-[80vh] flex flex-col">
              <div className="relative">
                <CardHeader>
                  <CardTitle className="text-3xl md:text-4xl font-headline">
                    Startup Incubation Hub
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    <span className="text-accent font-semibold">&quot;You Dream It. We Help Build It.&quot;</span><br />
                    Connect with leading incubators that provide the resources, mentorship, and ecosystem you need to transform your innovative ideas into successful ventures.
                  </p>
                </CardHeader>
                <Link
                  href="/"
                  className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent transition-colors"
                  aria-label="Close and return home"
                >
                  <X className="h-6 w-6 text-foreground" />
                </Link>
              </div>

              <CardContent className="flex-grow flex flex-col">
                <IncubatorsView
                  isLoggedIn={isLoggedIn}
                  hasSubscription={hasSubscription}
                  setActiveView={headerProps.setActiveView}
                />
              </CardContent>
            </Card>
          </div>

          <div className="block w-full pt-8 mt-auto">
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}
