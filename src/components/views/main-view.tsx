
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "@/components/layout/header";
import HomeView from "@/components/views/home";
import type { View, UserRole, DashboardTab, founderRole } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2 } from "lucide-react";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import SubmitIPDashboard from "./submit-your-ip";
import { CommentSection } from "../comment-section";
import Unauthorized from "@/app/unauthorized";
import { API_BASE_URL } from "@/lib/api";
import BrowseMSME from "./browseMSME";
import SolveChallengeDashboard from "./solve-challenge-dashboard";
import ListTechnologyDashboard from "./list-a-tech-dashboard";
import InnovativeIdeaDashboard from "./innovative-dashboard";


const ModalSkeleton = () => (
  <Dialog open={true}>
    <DialogContent className="flex items-center justify-center h-64 bg-transparent border-none shadow-none">
      <VisuallyHidden>
        <DialogTitle>Profile Settings</DialogTitle>
      </VisuallyHidden>
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </DialogContent>
  </Dialog>
);

const BlogView = dynamic(() => import('@/components/views/blog'), { loading: () => <ModalSkeleton /> });
const MentorsView = dynamic(() => import('@/components/views/mentors'), { loading: () => <ModalSkeleton /> });
const IncubatorsView = dynamic(() => import('@/components/views/incubators'), { loading: () => <ModalSkeleton /> });
const PricingView = dynamic(() => import('@/components/views/pricing'), { loading: () => <ModalSkeleton /> });
const MsmesView = dynamic(() => import('@/components/views/msmes'), { loading: () => <ModalSkeleton /> });
const JoinAsAnMsme = dynamic(() => import('@/components/views/join-as-an-msme'), { loading: () => <ModalSkeleton /> });
const DashboardView = dynamic(() => import('@/components/views/dashboard'), { loading: () => <ModalSkeleton /> });
const MentorDashboardView = dynamic(() => import('@/components/views/mentor-dashboard'), { loading: () => <ModalSkeleton /> });
const IncubatorDashboardView = dynamic(() => import('@/components/views/incubator-dashboard'), { loading: () => <ModalSkeleton /> });
const MsmeDashboardView = dynamic(() => import('@/components/views/msme-dashboard'), { loading: () => <ModalSkeleton /> });
const TechTransferView = dynamic(() => import('@/components/browsetech/browsetech'), { loading: () => <ModalSkeleton /> });
const MarketplaceView = dynamic(() => import('@/components/views/marketplace-view'), { loading: () => <ModalSkeleton /> });

const LoginModal = dynamic(() => import('@/components/auth/login-modal'), { loading: () => <ModalSkeleton /> });
const SignupModal = dynamic(() => import('@/components/auth/signup-modal'), { loading: () => <ModalSkeleton /> });
const EducationView = dynamic(() => import('@/components/views/education'), { loading: () => <ModalSkeleton /> });
const ContactView = dynamic(() => import('@/components/views/contact'), { loading: () => <ModalSkeleton /> });

type User = {
  name: string;
  email: string;
  userId: string;
}
type AuthProvider = 'local' | 'google';

interface TokenStatus {
  valid?: boolean;
  expired?: boolean;
  error?: string;
}

const LOCAL_STORAGE_VERSION = '1.2';

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
  const [activeView, setActiveView] = useState<View>("home");
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
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
  const [commentingSubmissionId, setCommentingSubmissionId] = useState<string | null>(null);
  const [isCommentSectionMaximized, setIsCommentSectionMaximized] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [founderRole, setFounderRole] = useState<founderRole | null>(null);



  const loadStateFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (localStorage.getItem('localStorageVersion') !== LOCAL_STORAGE_VERSION) {
      localStorage.removeItem('user');
      localStorage.removeItem('appliedPrograms');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userRole');
      localStorage.removeItem('hasSubscription');
      localStorage.removeItem('authProvider');
      localStorage.removeItem('token');
      localStorage.setItem('localStorageVersion', LOCAL_STORAGE_VERSION);
    }

    const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUserRole = localStorage.getItem('userRole') as UserRole | null;
    const savedUser = localStorage.getItem('user');
    const savedSubscription = localStorage.getItem('hasSubscription');
    const savedAppliedPrograms = localStorage.getItem('appliedPrograms');
    const savedAuthProvider = localStorage.getItem('authProvider') as AuthProvider | null;
    const savedFounderRole = localStorage.getItem('founder_role') as founderRole | null;
    const parsedUser = safeParse<User | null>(savedUser, null, 'user', isValidUser);
    const parsedAppliedPrograms = safeParse<Record<string, string>>(savedAppliedPrograms, {}, 'appliedPrograms', isValidAppliedPrograms);

    const validRoles: UserRole[] = ['admin', 'mentor', 'organisation', 'incubator', 'founder'];
    if (savedIsLoggedIn === 'true' && validRoles.includes(savedUserRole as UserRole) && parsedUser) {
      setLoggedIn(true);
      setUserRole(savedUserRole);
      setUser(parsedUser);
      setFounderRole(savedFounderRole)
      setHasSubscription(savedSubscription === 'true');
      setHasUsedFreeSession(false);
      setAppliedPrograms(parsedAppliedPrograms);
      if (savedAuthProvider) setAuthProvider(savedAuthProvider);
    } else {
      // Clear state if inconsistent
      setLoggedIn(false);
      setUserRole(null);
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStateFromStorage();

    window.addEventListener('storage', loadStateFromStorage);

    return () => {
      window.removeEventListener('storage', loadStateFromStorage);
    };
  }, [loadStateFromStorage]);


  // useEffect(() => {
  //   if (!auth) return;

  //   const unsubscribe = onAuthStateChanged(auth, async (user: import('firebase/auth').User | null) => {
  //     if (user) {
  //       // User is signed in, update your state accordingly
  //       const userData = { name: user.displayName || '', email: user.email || '' };
  //       let role: UserRole | null = null;
  //       let hasSubscription = false;
  //       let appliedPrograms: Record<string, string> = {};
  //       let authProvider: AuthProvider = user.providerData[0]?.providerId === 'google.com' ? 'google' : 'local';

  //       // Fetch user role and other info from backend
  //       try {
  //         const token = await user.getIdToken();
  //         const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/user-profile`, {
  //           headers: { Authorization: `Bearer ${token}` }
  //         });
  //         if (res.ok) {
  //           const data = await res.json();
  //           role = data.role as UserRole;
  //           hasSubscription = !!data.hasSubscription;
  //           appliedPrograms = data.appliedPrograms || {};
  //           // Optionally update other user info
  //         }
  //       } catch (e) {
  //         // fallback to localStorage if backend fails
  //         role = localStorage.getItem('userRole') as UserRole | null;
  //         hasSubscription = localStorage.getItem('hasSubscription') === 'true';
  //         appliedPrograms = safeParse<Record<string, string>>(localStorage.getItem('appliedPrograms'), {}, 'appliedPrograms', isValidAppliedPrograms);
  //       }

  //       setLoggedIn(true);
  //       setUserRole(role);
  //       setUser(userData);
  //       setAuthProvider(authProvider);
  //       setHasSubscription(hasSubscription);
  //       setAppliedPrograms(appliedPrograms);
  //       setIsLoading(false);
  //     } else {
  //       // User logged out or no session
  //       setLoggedIn(false);
  //       setUserRole(null);
  //       setUser(null);
  //       setAuthProvider(null);
  //       setHasSubscription(false);
  //       setAppliedPrograms({});
  //       setIsLoading(false);
  //       // Remove only relevant keys, not theme
  //       localStorage.removeItem('userRole');
  //       localStorage.removeItem('hasSubscription');
  //       localStorage.removeItem('appliedPrograms');
  //       localStorage.removeItem('authProvider');
  //       localStorage.removeItem('isLoggedIn');
  //       localStorage.removeItem('user');
  //       localStorage.removeItem('token');
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [auth]);

  const [navOpen, setNavOpen] = useState<boolean>(false);

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



  const id = searchParams.get('id');
  const [showUnauthorized, setShowUnauthorized] = useState(false);

  const setActiveDashboardView = (tab: DashboardTab) => {
    setActiveView("dashboard");
    setActiveTab(tab);
  };
  useEffect(() => {
    if (!id) return;
    setActiveDashboardView("ip/technologies");
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      toast({
        title: "Login Required",
        description: "Please login to visit",
        variant: "destructive",
      });
      return;
    }

    if (userRole !== "admin") {
      setShowUnauthorized(true);
    }

    const timeout = setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight");
        setTimeout(() => element.classList.remove("highlight"), 2000);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [id, toast]);


  const handleModalOpenChange = (view: View) => (isOpen: boolean) => {
    if (!isOpen) {
      setActiveView("home");
    } else {
      setActiveView(view);
    }
  };

  const handleLoginSuccess = (data: { role: UserRole, token: string, hasSubscription: boolean, founder_role: string, name: string, email: string, authProvider: AuthProvider }) => {
    const { role, token, hasSubscription, name, email, authProvider, founder_role } = data;
    const userData = { name, email };

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role || '');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('hasSubscription', String(hasSubscription));
    localStorage.setItem('founder_role', founder_role);
    localStorage.setItem('token', token);
    localStorage.setItem('authProvider', authProvider);

    // Dispatch event to notify app of state change
    window.dispatchEvent(new Event('storage'));

    if (!role) {
      router.push(`/complete-profile?token=${token}`);
      // Close any open modals
      setActiveView('home');
    } else {
      setActiveView('dashboard');
    }
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
      localStorage.removeItem('founder_role');
      localStorage.removeItem("rzp_device_id");

      // Dispatch event to notify app of state change
      window.dispatchEvent(new Event('storage'));

      setActiveView('home');
      router.push('/');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: "Could not log out. Please try again." });
    }
  };

  const [isHeroVisible, setIsHeroVisible] = useState(true);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {

        setIsHeroVisible(entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [isHeroVisible]);


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
        title: "Payment Integrated Soon!",
        description: "You will be notified before your plan ends.",
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
    if (activeView !== 'dashboard' || !userRole || !authProvider || !isLoggedIn || !user) {
      return null;
    }
    switch (userRole) {
      case 'mentor':
        return (
          <MentorDashboardView
            isOpen={true}
            onOpenChange={() => setActiveView('home')}
            setActiveView={setActiveView}
            user={user}
            setUser={setUser}
            authProvider={authProvider}
          />
        );
      case 'organisation':
        return (
          <MsmeDashboardView
            isOpen={true}
            onOpenChange={() => setActiveView('home')}
            isLoggedIn={isLoggedIn}
            setActiveView={setActiveView}
            user={user}
            setUser={setUser}
            authProvider={authProvider}
          />
        );
      case 'incubator':
        return (
          <IncubatorDashboardView
            isOpen={true}
            onOpenChange={() => setActiveView('home')}
            user={user}
            setUser={setUser}
            authProvider={authProvider}
          />
        );
      case 'admin':
        return (
          <DashboardView
            isOpen={true}
            onOpenChange={() => setActiveView('home')}
            user={user}
            userRole={userRole}
            authProvider={authProvider}
            hasSubscription={hasSubscription}
            setActiveView={setActiveView}
            setUser={setUser}
            activateTab={activeTab}
            id={id ?? undefined}
          />
        );
      case 'founder':
        switch (founderRole) {
          case "Solve Organisation's challenge":
            return (
              <SolveChallengeDashboard
                isOpen={true}
                onOpenChange={() => setActiveView('home')}
                user={user}
                authProvider={authProvider}
                userRole={userRole}
                hasSubscription={hasSubscription}
                setActiveView={setActiveView}
                setUser={setUser}
                activateTab={activeTab}
                id={id ?? undefined}
              />
            );

          case 'List a technology for licensing':
            return (
              <ListTechnologyDashboard
                isOpen={true}
                onOpenChange={() => setActiveView('home')}
                user={user}
                authProvider={authProvider}
                userRole={userRole}
                hasSubscription={hasSubscription}
                setActiveView={setActiveView}
                setUser={setUser}
                activateTab={activeTab}
                id={id ?? undefined}
              />
            );

          case 'Submit an innovative idea':
            return (
              <InnovativeIdeaDashboard
                isOpen={true}
                onOpenChange={() => setActiveView('home')}
                user={user}
                authProvider={authProvider}
                userRole={userRole}
                hasSubscription={hasSubscription}
                setActiveView={setActiveView}
                setUser={setUser}
                activateTab={activeTab}
                id={id ?? undefined}
              />
            );

          default:
            return null;
        }

      default:
        return null;
    }
  }
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (showUnauthorized) return <Unauthorized />;
  return (

    <div className="overflow-hidden relative flex flex-col min-h-screen bg-background text-foreground moz-container">
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        isLoading={isLoading}
        navOpen={navOpen}
        setNavOpen={(value: boolean) => { setNavOpen(value); }}
        heroVisible={isHeroVisible}
      />

      <main
        className={`relative overflow-y-auto z-40 min-h-screen w-screen flex-grow m-auto pointer-events-auto ${navOpen && "border rounded-lg"
          }`}
        id="main-view"
      >
        <section className={`min-h-screen`} ref={scrollContainerRef}>
          <HomeView
            setActiveView={setActiveView}
            setActiveTab={setActiveTab}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onLogout={handleLogout}
            navOpen={navOpen}
            scrollContainerRef={scrollContainerRef}
          />
        </section>
      </main>

      {
        showUnauthorized && <Unauthorized />
      }


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

      {
        activeView === 'submitIP' && <SubmitIPDashboard
          isOpen={true}
          onOpenChange={() => setActiveView('home')}
          user={user!}
          userRole={userRole!}
          authProvider={authProvider!}
          hasSubscription={hasSubscription}
          setActiveView={setActiveView}
          setUser={setUser}
        />
      }

      {activeView === 'pricing' && <PricingView
        isOpen={true}
        onOpenChange={handleModalOpenChange('pricing')}
        onGetStartedClick={handleGetStartedOnPricing}
      />}
      {
        activeView === 'browseMSME' && <BrowseMSME isOpen={true} onOpenChange={handleModalOpenChange('browseMSME')} />
      }
      {activeView === 'msmes' && <MsmesView
        isOpen={true}
        onOpenChange={handleModalOpenChange('msmes')}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        setActiveView={setActiveView}
      />}

      {activeView === 'joinasanMSME' && (
        <JoinAsAnMsme
          isOpen={true}
          onOpenChange={handleModalOpenChange('joinasanMSME')}
          isLoggedIn={isLoggedIn}
          hasSubscription={hasSubscription}
          setActiveView={setActiveView}
          authProvider={authProvider!}
          user={user!}
        />
      )}
      {activeView === 'browseTech' && (
        <TechTransferView
          isOpen={true}
          onOpenChange={handleModalOpenChange('browseTech')}
          setActiveView={setActiveView}
        />
      )}

      {activeView === 'education' && <EducationView
        isOpen={true}
        onOpenChange={handleModalOpenChange('education')}
        onApplicationSuccess={handleEducationApplicationSuccess}
        isLoggedIn={isLoggedIn}
        setActiveView={setActiveView}
        appliedPrograms={appliedPrograms}
      />}

      {activeView === 'marketplace' && <MarketplaceView
        isOpen={true}
        onOpenChange={handleModalOpenChange('marketplace')}
        setActiveView={setActiveView}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />}

      {renderDashboard()}

      {activeView === 'login' && <LoginModal
        isOpen={true}
        setIsOpen={handleModalOpenChange('login')}
        onLoginSuccess={handleLoginSuccess}
        setActiveView={setActiveView} // so you can switch to signup inside signup modal
        activeView={activeView}
      />}

      {activeView === 'signup' && <SignupModal
        isOpen={true}
        setIsOpen={handleModalOpenChange('signup')}
        onLoginSuccess={handleLoginSuccess}
        setActiveView={setActiveView} // so you can switch to login inside login modal
        activeView={activeView}
      />}

      {activeView === 'contact' && <ContactView
        isOpen={true}
        onOpenChange={handleModalOpenChange('contact')}
      />}

      {commentingSubmissionId !== null && (
        <CommentSection
          submissionId={commentingSubmissionId}
          onClose={() => {
            setCommentingSubmissionId(null);
            setIsCommentSectionMaximized(false);
          }}
          onMaximizeToggle={setIsCommentSectionMaximized}
        />
      )}

    </div>
  );
}
