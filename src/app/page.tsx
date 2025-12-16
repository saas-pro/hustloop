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
      setShowLoader(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (showLoader) {
    return <PageLoader />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <MainView />
    </Suspense>
  );
}
