
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomeView from "@/components/views/home";
import type { View, UserRole } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

const ModalSkeleton = () => (
  <Dialog open={true}>
    <DialogContent className="flex items-center justify-center h-64 bg-transparent border-none shadow-none">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </DialogContent>
  </Dialog>
);

const BlogView = dynamic(() => import('@/components/views/blog'), { loading: () => <ModalSkeleton /> });
const MentorsView = dynamic(() => import('@/components/views/mentors'), { loading: () => <ModalSkeleton /> });
const IncubatorsView = dynamic(() => import('@/components/views/incubators'), { loading: () => <ModalSkeleton /> });
const PricingView = dynamic(() => import('@/components/views/pricing'), { loading: () => <ModalSkeleton /> });
const MsmesView = dynamic(() => import('@/components/views/msmes'), { loading: () => <ModalSkeleton /> });
const DashboardView = dynamic(() => import('@/components/views/dashboard'), { loading: () => <ModalSkeleton /> });
const MentorDashboardView = dynamic(() => import('@/components/views/mentor-dashboard'), { loading: () => <ModalSkeleton /> });
const IncubatorDashboardView = dynamic(() => import('@/components/views/incubator-dashboard'), { loading: () => <ModalSkeleton /> });
const MsmeDashboardView = dynamic(() => import('@/components/views/msme-dashboard'), { loading: () => <ModalSkeleton /> });
const LoginModal = dynamic(() => import('@/components/auth/login-modal'), { loading: () => <ModalSkeleton /> });
const SignupModal = dynamic(() => import('@/components/auth/signup-modal'), { loading: () => <ModalSkeleton /> });
const EducationView = dynamic(() => import('@/components/views/education'), { loading: () => <ModalSkeleton /> });
const ContactView = dynamic(() => import('@/components/views/contact'), { loading: () => <ModalSkeleton /> });

type User = {
    name: string;
    email: string;
}
type AuthProvider = 'local' | 'google';

// Version for localStorage data
const LOCAL_STORAGE_VERSION = '1.0';

function safeParse<T>(value: string | null, fallback: T, key?: string, validate: (obj: any) => boolean = () => true): T {
  try {
    if (!value || value === 'undefined') return fallback;
    const parsed = JSON.parse(value);
    if (validate(parsed)) {
      return parsed;
    } else {
      if (key) localStorage.removeItem(key);
      return fallback;
    }
  } catch {
    if (key) localStorage.removeItem(key);
    return fallback;
  }
}

function isValidUser(obj: any): obj is { name: string; email: string } {
  return obj && typeof obj.name === 'string' && typeof obj.email === 'string';
}

function isValidAppliedPrograms(obj: any): obj is Record<string, string> {
  return obj && typeof obj === 'object' && !Array.isArray(obj);
}

export default function MainView() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [activeView, setActiveView] = useState<View>("home");
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authProvider, setAuthProvider] = useState<AuthProvider | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasUsedFreeSession, setHasUsedFreeSession] = useState(false);
  const [appliedPrograms, setAppliedPrograms] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useFirebaseAuth();
  
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR safety

    // Migration/version handling
    const version = localStorage.getItem('localStorageVersion');
    if (version !== LOCAL_STORAGE_VERSION) {
      // Clear all relevant keys if version mismatch
      localStorage.removeItem('user');
      localStorage.removeItem('appliedPrograms');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('hasSubscription');
      localStorage.removeItem('authProvider');
      localStorage.setItem('localStorageVersion', LOCAL_STORAGE_VERSION);
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUserRole = localStorage.getItem('userRole') as UserRole | null;
    const savedUser = localStorage.getItem('user');
    const savedSubscription = localStorage.getItem('hasSubscription');
    const savedAppliedPrograms = localStorage.getItem('appliedPrograms');
    const savedAuthProvider = localStorage.getItem('authProvider') as AuthProvider | null;

    const parsedUser = safeParse<User | null>(savedUser, null, 'user', isValidUser);
    const parsedAppliedPrograms = safeParse<Record<string, string>>(savedAppliedPrograms, {}, 'appliedPrograms', isValidAppliedPrograms);

    const validRoles: UserRole[] = ['admin', 'mentor', 'msme', 'incubator', 'founder'];
    if (savedIsLoggedIn === 'true' && validRoles.includes(savedUserRole as UserRole) && parsedUser) {
      setLoggedIn(true);
      setUserRole(savedUserRole);
      setUser(parsedUser);
      setHasSubscription(savedSubscription === 'true');
      setHasUsedFreeSession(false);
      setAppliedPrograms(parsedAppliedPrograms);
      if (savedAuthProvider) setAuthProvider(savedAuthProvider);
    }

    setIsLoading(false);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  useEffect(() => {
    const from = searchParams.get('from');
    const action = searchParams.get('action');

    if (action === 'login' && (from === 'verification_success' || from === 'reset_success')) {
        const title = from === 'verification_success' ? "Verification Successful!" : "Password Reset Successful";
        const description = from === 'verification_success' ? "Your email has been verified. Please log in to continue." : "Please log in with your new password.";
        
        toast({ title, description });
        setActiveView('login');
        router.replace('/');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (theme) {
      // Add transition class for smooth theme switching
      document.documentElement.style.transition = 'color-scheme 0.3s ease, background-color 0.3s ease';
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      
      localStorage.setItem('theme', theme);
      
      // Remove transition after animation completes
      setTimeout(() => {
        document.documentElement.style.transition = '';
      }, 300);
    }
  }, [theme]);
  
  const handleModalOpenChange = (view: View) => (isOpen: boolean) => {
    if (!isOpen) {
      setActiveView("home");
    } else {
      setActiveView(view);
    }
  };

  const handleLoginSuccess = (data: { role: UserRole, token: string, hasSubscription: boolean, name: string, email: string, authProvider: AuthProvider }) => {
    const { role, token, hasSubscription, name, email, authProvider } = data;
    const userData = { name, email };
    setLoggedIn(true);
    setUserRole(role);
    setUser(userData);
    setHasSubscription(hasSubscription);
    setAuthProvider(authProvider);

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role || '');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('hasSubscription', String(hasSubscription));
    localStorage.setItem('token', token);
    localStorage.setItem('authProvider', authProvider);

    setHasUsedFreeSession(false);
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        setLoggedIn(false);
        setUserRole(null);
        setUser(null);
        setHasSubscription(false);
        setAppliedPrograms({});
        setAuthProvider(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('hasSubscription');
        localStorage.removeItem('appliedPrograms');
        localStorage.removeItem('token');
        localStorage.removeItem('authProvider');
        setActiveView('home');
        router.push('/');
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
        console.error("Logout failed:", error);
        toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };

  const handleBookingSuccess = (mentorName: string, date: Date, time: string) => {
    if (!hasUsedFreeSession) {
      setHasUsedFreeSession(true);
    }
    toast({
      title: "Booking Confirmed!",
      description: `Your session with ${mentorName} on ${format(date, 'PPP')} at ${time} is booked.`,
    });
  };
  
  const handleGetStartedOnPricing = () => {
    if (isLoggedIn) {
      setHasSubscription(true);
      localStorage.setItem('hasSubscription', 'true');
      toast({
        title: "Subscription Activated!",
        description: "You now have full access to all premium features.",
      });
      setActiveView('home');
    } else {
      setActiveView('signup');
    }
  };
  
  const handleEducationApplicationSuccess = (programTitle: string, session: { language: string, date: string, time: string }) => {
    const newAppliedPrograms = {
      ...appliedPrograms,
      [programTitle]: `${session.date}, ${session.time}`
    };
    setAppliedPrograms(newAppliedPrograms);
    localStorage.setItem('appliedPrograms', JSON.stringify(newAppliedPrograms));

    toast({
      title: "Application Successful!",
      description: `You've applied for ${programTitle} on ${session.date} at ${session.time}. A calendar invite has been sent to your email.`,
    });
  };

  const renderDashboard = () => {
    if (!isLoggedIn || activeView !== 'dashboard' || !userRole || !user || !authProvider) {
      return null;
    }

    switch(userRole) {
      case 'mentor':
        return (
          <MentorDashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')}
            setActiveView={setActiveView}
            user={user}
            authProvider={authProvider}
          />
        );
      case 'incubator':
        return (
          <IncubatorDashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')}
            user={user}
            authProvider={authProvider}
          />
        );
      case 'msme':
        return (
            <MsmeDashboardView
                isOpen={true}
                onOpenChange={handleModalOpenChange('dashboard')}
                user={user}
                authProvider={authProvider}
            />
        );
      case 'founder':
      case 'admin':
        return (
          <DashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')} 
            user={user}
            userRole={userRole}
            authProvider={authProvider}
            hasSubscription={hasSubscription}
            setActiveView={setActiveView}
          />
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        isLoading={isLoading}
      />
      <main className="flex-grow">
        <HomeView setActiveView={setActiveView} theme={theme} isLoggedIn={isLoggedIn} />
      </main>
      <Footer />

      {activeView === 'blog' && <BlogView isOpen={true} onOpenChange={handleModalOpenChange('blog')} />}
      
      {activeView === 'mentors' && <MentorsView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('mentors')}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        hasUsedFreeSession={hasUsedFreeSession}
        onBookingSuccess={handleBookingSuccess}
        setActiveView={setActiveView}
      />}
      
      {activeView === 'incubators' && <IncubatorsView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('incubators')} 
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        setActiveView={setActiveView}
      />}
      
      {activeView === 'pricing' && <PricingView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('pricing')}
        onGetStartedClick={handleGetStartedOnPricing}
      />}
      
      {activeView === 'msmes' && <MsmesView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('msmes')}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        setActiveView={setActiveView}
      />}
      
      {activeView === 'education' && <EducationView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('education')} 
        onApplicationSuccess={handleEducationApplicationSuccess}
        isLoggedIn={isLoggedIn}
        setActiveView={setActiveView}
        appliedPrograms={appliedPrograms}
      />}
      
      {renderDashboard()}

      {activeView === 'login' && <LoginModal 
        isOpen={true} 
        setIsOpen={handleModalOpenChange('login')} 
        onLoginSuccess={handleLoginSuccess}
      />}
      
      {activeView === 'signup' && <SignupModal 
        isOpen={true} 
        setIsOpen={handleModalOpenChange('signup')}
      />}
      
      {activeView === 'contact' && <ContactView 
        isOpen={true}
        onOpenChange={handleModalOpenChange('contact')}
      />}
    </>
  );
}
