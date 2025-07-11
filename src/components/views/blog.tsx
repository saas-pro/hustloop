
"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomeView from "@/components/views/home";
import type { View, UserRole } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// A more obvious loading animation to show while dynamic components are being downloaded.
const ModalSkeleton = () => (
  <Dialog open={true}>
    <DialogContent className="flex items-center justify-center h-64 bg-transparent border-none shadow-none">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </DialogContent>
  </Dialog>
);

// Dynamically import all modal views. Their code will only be loaded when they're first opened.
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

export default function Home() {
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
  
  // This effect runs once on mount to set initial state from localStorage or OAuth redirect
  useEffect(() => {
    // Check for OAuth redirect first
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role') as UserRole | null;
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const hasSub = urlParams.get('hasSubscription') === 'true';
    const error = urlParams.get('error');
    const status = urlParams.get('status');

    // Clean the URL immediately
    if (token || error || status) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    if (status === 'pending_approval') {
        toast({
            title: "Registration Submitted",
            description: "Your account is pending admin approval. You'll be notified via email once it's active.",
        });
        setIsLoading(false);
        return; // Exit early
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

        toast({
            variant: "destructive",
            title: title,
            description: description,
        });
    } else if (token && role && name && email) {
        const userData = { name, email };
        const authProvider = urlParams.get('authProvider') as AuthProvider || 'local';
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userRole', role);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('hasSubscription', String(hasSub));
        localStorage.setItem('token', token);
        localStorage.setItem('authProvider', authProvider);


        setLoggedIn(true);
        setUserRole(role);
        setUser(userData);
        setHasSubscription(hasSub);
        setAuthProvider(authProvider);
        toast({ title: "Login Successful", description: `Welcome back, ${name}!` });
        setActiveView('dashboard');
        setIsLoading(false);
        return; // Exit early to prevent localStorage logic below from running
    }

    // Fallback to localStorage if no OAuth redirect
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // This effect runs whenever the theme changes to update the DOM and localStorage
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

  // Re-run Zoho SalesIQ trigger on SPA navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).$zoho) {
      (window as any).$zoho.salesiq.page.popup.close('all');
      (window as any).$zoho.salesiq.page.popup.show();
    }
  }, [activeView]);

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
    localStorage.setItem('userRole', role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('hasSubscription', String(hasSubscription));
    localStorage.setItem('token', token);
    localStorage.setItem('authProvider', authProvider);


    setHasUsedFreeSession(false); // Reset for prototype testing
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole(null);
    setUser(null);
    setHasSubscription(false);
    setAppliedPrograms({});
    setAuthProvider(null);
    // Clear all auth-related items
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
    localStorage.removeItem('hasSubscription');
    localStorage.removeItem('appliedPrograms');
    localStorage.removeItem('token');
    localStorage.removeItem('authProvider');
    setActiveView('home');
    router.push('/');
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
    // If user is logged in, simulate a subscription purchase.
    // Otherwise, direct them to sign up.
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

    
