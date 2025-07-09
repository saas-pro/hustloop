
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CorporateChallengeDetails from "./corporate-challenge-details";
import MSMECollaborationDetails from "./msme-collaboration-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Terminal } from "lucide-react";
import type { View } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";


export type CorporateChallenge = {
  company: string;
  logo: string;
  hint: string;
  title: string;
  reward: string;
  description: string;
  details: {
    about: string;
    problemStatements: number;
    stages: number;
    rewardPerStatement: string;
    mission: string;
    participation: string;
    rewards: string;
  };
};

export type MSMECollaboration = {
  name: string;
  logo: string;
  hint: string;
  sector: string;
  description: string;
  details: {
    about: string;
    scope: string[];
    lookingFor: string;
    benefits: string[];
    contact: {
        name: string;
        title: string;
    }
  };
};

interface MsmesViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  setActiveView: (view: View) => void;
}

const LoginPrompt = ({ setActiveView, contentType }: { setActiveView: (view: View) => void, contentType: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Lock className="h-16 w-16 text-primary mb-6" />
        <h3 className="text-2xl font-bold mb-2">Content Locked</h3>
        <p className="max-w-md mx-auto text-muted-foreground mb-6">
            Please log in or sign up to view available {contentType}.
        </p>
        <div className="flex gap-4">
            <Button onClick={() => setActiveView('login')}>Login</Button>
            <Button onClick={() => setActiveView('signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Sign Up
            </Button>
        </div>
    </div>
);

const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter className="flex-col items-start space-y-2">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function MsmesView({ isOpen, onOpenChange, isLoggedIn, hasSubscription, setActiveView }: MsmesViewProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<CorporateChallenge | null>(null);
  const [selectedCollaboration, setSelectedCollaboration] = useState<MSMECollaboration | null>(null);
  const { toast } = useToast();

  const [corporateChallenges, setCorporateChallenges] = useState<CorporateChallenge[]>([]);
  const [msmeCollaborations, setMsmeCollaborations] = useState<MSMECollaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && isOpen) {
        const fetchMsmesData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await fetch(`${apiBaseUrl}/api/msmes`);
                if (!response.ok) {
                    throw new Error('Failed to fetch MSME data.');
                }
                const data = await response.json();
                setCorporateChallenges(data.corporateChallenges || []);
                setMsmeCollaborations(data.msmeCollaborations || []);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMsmesData();
    }
  }, [isOpen, isLoggedIn]);


  const handleViewDetails = (type: 'challenge' | 'collaboration', item: any) => {
    if (hasSubscription) {
      if (type === 'challenge') setSelectedChallenge(item);
      if (type === 'collaboration') setSelectedCollaboration(item);
    } else {
      toast({
        variant: "destructive",
        title: "Subscription Required",
        description: "You need an active subscription to view full details and engage with MSMEs.",
        action: <ToastAction altText="Upgrade" onClick={() => {
            onOpenChange(false);
            setActiveView('pricing');
        }}>Upgrade Plan</ToastAction>,
      });
    }
  };

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex-grow flex items-center justify-center px-6 pb-6">
          <LoginPrompt setActiveView={setActiveView} contentType="challenges and collaborations" />
        </div>
      );
    }

    if (isLoading) {
      return (
        <Tabs defaultValue="challenges" className="flex flex-col flex-grow min-h-0 px-6 pb-6">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="challenges">Corporate Challenges</TabsTrigger>
                <TabsTrigger value="collaborations">MSME Collaboration</TabsTrigger>
            </TabsList>
            <TabsContent value="challenges" className="mt-4 flex-1 overflow-y-auto pr-4">
                <LoadingSkeleton />
            </TabsContent>
            <TabsContent value="collaborations" className="mt-4 flex-1 overflow-y-auto pr-4">
                <LoadingSkeleton />
            </TabsContent>
        </Tabs>
      );
    }

    if (error) {
        return (
            <div className="flex-grow flex items-center justify-center px-6 pb-6">
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }
    
    return (
      <Tabs defaultValue="challenges" className="flex flex-col flex-grow min-h-0 px-6 pb-6">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenges">Corporate Challenges</TabsTrigger>
            <TabsTrigger value="collaborations">MSME Collaboration</TabsTrigger>
        </TabsList>
        <TabsContent value="challenges" className="mt-4 flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {corporateChallenges.map((challenge, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                  <CardHeader>
                  <div className="flex items-center gap-4">
                      <Image src={challenge.logo} alt={`${challenge.company} logo`} width={60} height={60} className="rounded-lg" data-ai-hint={challenge.hint} />
                      <div>
                          <CardTitle className="text-base">{challenge.title}</CardTitle>
                          <CardDescription>{challenge.company}</CardDescription>
                      </div>
                  </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                  </CardContent>
                  <CardFooter className="flex-col items-start space-y-2">
                  <Badge variant="outline">Reward: {challenge.reward}</Badge>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleViewDetails('challenge', challenge)}>
                      View Challenge
                  </Button>
                  </CardFooter>
              </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="collaborations" className="mt-4 flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {msmeCollaborations.map((msme, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                  <CardHeader>
                      <div className="flex items-center gap-4">
                          <Image src={msme.logo} alt={`${msme.name} logo`} width={60} height={60} className="rounded-full" data-ai-hint={msme.hint} />
                          <div>
                              <CardTitle className="text-base">{msme.name}</CardTitle>
                              <CardDescription>{msme.sector}</CardDescription>
                          </div>
                      </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{msme.description}</p>
                  </CardContent>
                  <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => handleViewDetails('collaboration', msme)}>Connect</Button>
                  </CardFooter>
              </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6">
            <DialogTitle className="text-3xl font-bold text-center font-headline">Innovation & Growth Opportunities</DialogTitle>
            <DialogDescription className="text-center">
              <span className="text-primary">"Empowering MSMEs for Success"</span>
              <span className="block mt-2">
                Join our platform to solve corporate challenges for rewards or collaborate with MSMEs for growth opportunities. Whether you're an innovator, entrepreneur, or business expert, find your perfect match here.
              </span>
            </DialogDescription>
          </DialogHeader>
          
          {renderContent()}

        </DialogContent>
      </Dialog>
      <CorporateChallengeDetails 
        challenge={selectedChallenge} 
        onOpenChange={(isOpen) => !isOpen && setSelectedChallenge(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
      <MSMECollaborationDetails 
        collaboration={selectedCollaboration}
        onOpenChange={(isOpen) => !isOpen && setSelectedCollaboration(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
    </>
  );
}
