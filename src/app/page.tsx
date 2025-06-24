"use client";

import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HomeView from "@/components/views/home";
import BlogView from "@/components/views/blog";
import MentorsView from "@/components/views/mentors";
import IncubatorsView from "@/components/views/incubators";
import PricingView from "@/components/views/pricing";
import MsmesView from "@/components/views/msmes";
import DashboardView from "@/components/views/dashboard";
import type { View } from "@/app/types";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";
import EducationView from "@/components/views/education";
import ContactView from "@/components/views/contact";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";


export default function Home() {
  const [activeView, setActiveView] = useState<View>("home");
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [hasUsedFreeSession, setHasUsedFreeSession] = useState(false);
  const { toast } = useToast();

  const handleModalOpenChange = (view: View) => (isOpen: boolean) => {
    if (!isOpen) {
      setActiveView("home");
    } else {
      setActiveView(view);
    }
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
    // In a real app, you would fetch subscription status here.
    // For this prototype, we'll keep it false to show the tooltip.
    setHasSubscription(false);
    setHasUsedFreeSession(false); // Reset for prototype testing
    setActiveView('dashboard');
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

  return (
    <>
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        setLoggedIn={setLoggedIn}
      />
      <main className="flex-grow">
        <HomeView setActiveView={setActiveView} />
      </main>
      <Footer />

      <BlogView isOpen={activeView === 'blog'} onOpenChange={handleModalOpenChange('blog')} />
      <MentorsView 
        isOpen={activeView === 'mentors'} 
        onOpenChange={handleModalOpenChange('mentors')}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        hasUsedFreeSession={hasUsedFreeSession}
        onBookingSuccess={handleBookingSuccess}
      />
      <IncubatorsView 
        isOpen={activeView === 'incubators'} 
        onOpenChange={handleModalOpenChange('incubators')} 
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
      <PricingView 
        isOpen={activeView === 'pricing'} 
        onOpenChange={handleModalOpenChange('pricing')}
        onGetStartedClick={() => setActiveView('login')}
      />
      <MsmesView 
        isOpen={activeView === 'msmes'} 
        onOpenChange={handleModalOpenChange('msmes')}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
      <EducationView 
        isOpen={activeView === 'education'} 
        onOpenChange={handleModalOpenChange('education')} 
        onApplyClick={() => setActiveView('login')}
      />
      {isLoggedIn && <DashboardView 
        isOpen={activeView === 'dashboard'} 
        onOpenChange={handleModalOpenChange('dashboard')} 
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        setActiveView={setActiveView}
      />}

      <LoginModal 
        isOpen={activeView === 'login'} 
        setIsOpen={handleModalOpenChange('login')} 
        onLoginSuccess={handleLoginSuccess}
      />
      <SignupModal 
        isOpen={activeView === 'signup'} 
        setIsOpen={handleModalOpenChange('signup')}
      />
      <ContactView 
        isOpen={activeView === 'contact'}
        onOpenChange={handleModalOpenChange('contact')}
      />
    </>
  );
}
