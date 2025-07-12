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
type AuthProvider = 'local' | 'google' | 'linkedin';

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
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    
    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUserRole = localStorage.getItem('userRole') as UserRole | null;
    const savedUser = localStorage.getItem('user');
    const savedSubscription = localStorage.getItem('hasSubscription');
    const savedAppliedPrograms = localStorage.getItem('appliedPrograms');
    const savedAuthProvider = localStorage.getItem('authProvider') as AuthProvider | null;

    if (savedIsLoggedIn === 'true' && savedUserRole && savedUser) {
      setLoggedIn(true);
      setUserRole(savedUserRole);
      setUser(JSON.parse(savedUser));
      setHasSubscription(savedSubscription === 'true');
      setHasUsedFreeSession(false);
      if (savedAppliedPrograms) {
        setAppliedPrograms(JSON.parse(savedAppliedPrograms));
      }
      if (savedAuthProvider) {
        setAuthProvider(savedAuthProvider);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const error = searchParams.get('error');
    const status = searchParams.get('status');

    if (status === 'pending_approval') {
        toast({
            title: "Registration Submitted",
            description: "Your account is pending admin approval. You'll be notified via email once it's active.",
        });
        router.replace('/');
    }

    if (error) {
        let title = "Sign-in Failed";
        let description = "Could not sign in with provider. Please try again or use email.";

        if (error === 'account_suspended') {
            title = "Account Suspended";
            description = "This account has been suspended.";
        } else if (error === 'email_not_provided') {
            title = "Email Missing";
            description = "Your provider did not share your email. Please try another method.";
        }
        toast({ variant: "destructive", title, description });
        router.replace('/');
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    if (theme) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', theme);
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