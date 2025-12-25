"use client";

import { Suspense, useState, useEffect } from "react";
import MainView from "@/components/views/main-view";
import PageLoader from "@/components/layout/page-loader";
import { useTokenVerification } from "@/hooks/use-token-verification";
import type { UserRole, View } from "@/app/types";

type AuthProvider = 'local' | 'google';

type User = {
  name: string;
  email: string;
  userId: string;
}

export default function Home() {
  const [showLoader, setShowLoader] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authProvider, setAuthProvider] = useState<AuthProvider | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [appliedPrograms, setAppliedPrograms] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<View>("home");

  useTokenVerification({
    setLoggedIn,
    setUserRole,
    setUser,
    setHasSubscription,
    setAppliedPrograms,
    setAuthProvider,
    setActiveView
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      // Wait for animation to complete before hiding loader
      setTimeout(() => {
        setShowLoader(false);
      }, 500); // Match the faster animation duration
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Main Content */}
      <Suspense fallback={<PageLoader />}>
        <MainView />
      </Suspense>

      {/* Loader Overlay with slide-up animation */}
      {showLoader && (
        <div
          className={`fixed inset-0 z-50 bg-background transition-transform duration-500 ease-in-out ${isAnimating ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
          <PageLoader />
        </div>
      )}
    </>
  );
}
