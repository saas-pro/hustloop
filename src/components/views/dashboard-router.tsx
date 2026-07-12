"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Types
import type { View, UserRole, DashboardTab, founderRole } from "@/app/types";

const ModalSkeleton = () => (
  <Dialog open={true}>
    <DialogContent className="flex items-center justify-center h-64 bg-transparent border-none shadow-none">
      <VisuallyHidden>
        <DialogTitle>Loading Dashboard</DialogTitle>
      </VisuallyHidden>
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </DialogContent>
  </Dialog>
);

const DashboardView = dynamic(() => import('@/components/views/dashboard'), { loading: () => <ModalSkeleton /> });
const MentorDashboardView = dynamic(() => import('@/components/views/mentor-dashboard'), { loading: () => <ModalSkeleton /> });
const IncubatorDashboardView = dynamic(() => import('@/components/views/incubator-dashboard'), { loading: () => <ModalSkeleton /> });
const MsmeDashboardView = dynamic(() => import('@/components/views/msme-dashboard'), { loading: () => <ModalSkeleton /> });
const SolveChallengeDashboard = dynamic(() => import('@/components/views/solve-challenge-dashboard'), { loading: () => <ModalSkeleton /> });
const ListTechnologyDashboard = dynamic(() => import('@/components/views/list-a-tech-dashboard'), { loading: () => <ModalSkeleton /> });
const InnovativeIdeaDashboard = dynamic(() => import('@/components/views/innovative-dashboard'), { loading: () => <ModalSkeleton /> });

interface DashboardRouterProps {
  userRole: UserRole | null;
  user: any; 
  authProvider: any;
  founderRole?: founderRole | null;
  hasSubscription: boolean;
  isLoggedIn: boolean;
  activeTab?: DashboardTab;
  id?: string;
  setActiveView: (view: View) => void;
  setUser: (val: any) => void;
}

export default function DashboardRouter({
  userRole,
  user,
  authProvider,
  founderRole,
  hasSubscription,
  isLoggedIn,
  activeTab,
  id,
  setActiveView,
  setUser
}: DashboardRouterProps) {
  if (!userRole || !user) return null;

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
          founderRole={founderRole}
          hasSubscription={hasSubscription}
          setActiveView={setActiveView}
          setUser={setUser}
          activateTab={activeTab as any}
          id={id}
        />
      );
    case 'founder':
      if (!founderRole) {
        return null;
      }
      switch (founderRole) {
        case "Solve Organisation's challenge":
          return (
            <SolveChallengeDashboard
              isOpen={true}
              onOpenChange={() => setActiveView('home')}
              user={user}
              founderRole={founderRole}
              authProvider={authProvider}
              userRole={userRole}
              hasSubscription={hasSubscription}
              setActiveView={setActiveView}
              setUser={setUser}
              activateTab={activeTab as any}
              id={id}
            />
          );

        case 'List a technology for licensing':
          return (
            <ListTechnologyDashboard
              isOpen={true}
              onOpenChange={() => setActiveView('home')}
              user={user}
              founderRole={founderRole}
              authProvider={authProvider}
              userRole={userRole}
              hasSubscription={hasSubscription}
              setActiveView={setActiveView}
              setUser={setUser}
              activateTab={activeTab as any}
              id={id}
            />
          );

        case 'Submit an innovative idea':
          return (
            <InnovativeIdeaDashboard
              isOpen={true}
              onOpenChange={() => setActiveView('home')}
              user={user}
              founderRole={founderRole}
              authProvider={authProvider}
              userRole={userRole}
              hasSubscription={hasSubscription}
              setActiveView={setActiveView}
              setUser={setUser}
              activateTab={activeTab as any}
              id={id}
            />
          );

        default:
          return null;
      }

    default:
      return null;
  }
}
