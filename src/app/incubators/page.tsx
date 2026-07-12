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
import { DashboardTab, UserRole, View } from '@/app/types';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/providers/AuthContext';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { AuthProvider, signOut } from "firebase/auth";
import { toast } from '@/hooks/use-toast';
import MarketplaceView from '@/components/views/marketplace-view';
import MainView from '@/components/views/main-view';
import DashboardRouter from '@/components/views/dashboard-router';
import LoginModal from '@/components/auth/login-modal';

export default function IncubatorsPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeView, setActiveView] = useState<View>("home");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const { auth } = useFirebaseAuth()
  const [authProvider, setAuthProvider] = useState<AuthProvider | null>(null);
  const [appliedPrograms, setAppliedPrograms] = useState<Record<string, string>>({});

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

  const {
    userRole,
    isLoggedIn,
    hasSubscription,
    isLoading,
    setAuthData,
    logout: authLogout,
    user,
    founderRole,

  } = useAuth();
  const handleSetUser = (updater: any) => {
    const newUser = typeof updater === 'function' ? updater(user) : updater;
    setAuthData({
      user: newUser,
      userRole,
      founderRole,
      isLoggedIn,
      hasSubscription
    });
    localStorage.setItem('user', JSON.stringify(newUser));
    window.dispatchEvent(new Event('storage'));
  };

  const handleLoginSuccess = (data: any) => {
    const { role, token, hasSubscription, name, email, authProvider, founder_role } = data;
    const userId = data.userId || data.uid || '';
    const userData = { name, email, userId };

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    localStorage.setItem('authProvider', authProvider);

    setAuthData({
      user: userData,
      userRole: role,
      founderRole: founder_role,
      isLoggedIn: true,
      hasSubscription: hasSubscription
    });

    window.dispatchEvent(new Event('storage'));
    setActiveView('home'); // Go back to the incubators view after login
  };

  const router = useRouter();
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      authLogout();
      setAuthProvider(null);
      setAppliedPrograms({});
      window.dispatchEvent(new Event('storage'));
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };
  const id = undefined;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="hidden xl:flex absolute top-4 left-4 z-50 items-center gap-4">
        <div onClick={() => router.push("/")} className="cursor-pointer">
          <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} />
        </div>
        <Link href="/" passHref>
          <Button variant="outline" size="icon" aria-label="Home">
            <Home className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        isLoading={isLoading}
        navOpen={navOpen}
        setNavOpen={(value: boolean) => { setNavOpen(value); }}
        heroVisible={false}
        userRole={userRole as string}
      />
      <div id="main-view-wrapper">
        <main
          className={`flex-grow bg-background min-h-screen relative z-40 m-auto pointer-events-auto w-full flex flex-col`}
          data-alt-id="card-anchor"
          id="main-view1"
        >
          <div className={`w-full ${navOpen ? 'overflow-hidden' : ''} flex-grow flex flex-col`}>
            {/* Hero Section */}
            <div className="relative w-full bg-muted/10 pt-28 pb-4 md:pt-16">
              <div className="container ultrawide-fix mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 text-xs font-bold uppercase tracking-widest px-4 py-1">Incubator Directory</Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-headline tracking-tight mb-4 text-foreground">
                  Startup Incubation Hub
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                  <span className="text-primary font-sans font-extrabold block mb-2 tracking-tight">&quot;You Dream It. We Help Build It.&quot;</span>
                  Connect with leading incubators that provide the resources, mentorship, and ecosystem you need to transform your innovative ideas into successful ventures.
                </p>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full flex-grow flex flex-col pt-4">
              <IncubatorsView
                isLoggedIn={isLoggedIn}
                isAuthChecking={isLoading}
                hasSubscription={hasSubscription}
                setActiveView={setActiveView}
              />
            </div>
          </div>

          <div className="block w-full pt-8 mt-auto">
            <Footer />
          </div>
          {activeView === "marketplace" && (
            <MarketplaceView
              isOpen={true}
              onOpenChange={() => setActiveView("home")}
              setActiveView={setActiveView}
              isLoggedIn={isLoggedIn}
              hasSubscription={hasSubscription}
            />
          )}
          {activeView === "dashboard" && (
            <DashboardRouter
              userRole={userRole}
              user={user}
              authProvider={authProvider}
              founderRole={founderRole}
              hasSubscription={hasSubscription}
              isLoggedIn={isLoggedIn}
              activeTab={activeTab}
              id={id}
              setActiveView={setActiveView}
              setUser={handleSetUser}
            />
          )}
          {
            activeView === "login" && (
              <LoginModal
                isOpen={true}
                setIsOpen={(open: boolean) => {
                  if (!open) setActiveView('home');
                }}
                activeView={activeView}
                setActiveView={setActiveView}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        </main>
      </div>
    </div>
  );
}
