
"use client";

import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
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


export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [activeView, setActiveView] = useState<View>("home");
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasUsedFreeSession, setHasUsedFreeSession] = useState(false);
  const { toast } = useToast();
  
  // This effect runs once on mount to set the initial theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    setTheme(savedTheme || 'dark');
  }, []);

  // This effect runs whenever the theme changes to update the DOM and localStorage
  useEffect(() => {
    if (theme) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
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

  const handleLoginSuccess = (role: UserRole) => {
    setLoggedIn(true);
    setUserRole(role);
    // In a real app, you would fetch subscription status here.
    // For this prototype, we'll keep it false to show the tooltip.
    setHasSubscription(false);
    setHasUsedFreeSession(false); // Reset for prototype testing
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserRole(null);
    setHasSubscription(false);
    setActiveView('home');
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
    // If user is logged in, show a "coming soon" message for the payment feature.
    // Otherwise, direct them to log in.
    if (isLoggedIn) {
      toast({
        title: "Coming Soon",
        description: "Payment integration is coming soon.",
      });
      // Close the pricing modal after showing the message.
      setActiveView('home');
    } else {
      setActiveView('login');
    }
  };

  const renderDashboard = () => {
    if (!isLoggedIn || activeView !== 'dashboard') {
      return null;
    }

    switch(userRole) {
      case 'mentor':
        return (
          <MentorDashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')}
            setActiveView={setActiveView}
          />
        );
      case 'incubator':
        return (
          <IncubatorDashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')}
          />
        );
      case 'msme':
        return (
            <MsmeDashboardView
                isOpen={true}
                onOpenChange={handleModalOpenChange('dashboard')}
            />
        );
      default:
        return (
          <DashboardView
            isOpen={true}
            onOpenChange={handleModalOpenChange('dashboard')} 
            isLoggedIn={isLoggedIn}
            hasSubscription={hasSubscription}
            setActiveView={setActiveView}
          />
        );
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
      />
      <main className="flex-grow">
        <HomeView setActiveView={setActiveView} theme={theme} />
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
      />}
      
      {activeView === 'incubators' && <IncubatorsView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('incubators')} 
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
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
      />}
      
      {activeView === 'education' && <EducationView 
        isOpen={true} 
        onOpenChange={handleModalOpenChange('education')} 
        onApplyClick={() => setActiveView('login')}
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
