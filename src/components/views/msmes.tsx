
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CorporateChallengeDetails from "./corporate-challenge-details";
import MSMECollaborationDetails from "./msme-collaboration-details";
import GovernmentChallengeDetails from "./government-challenge-details";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Lock, Terminal } from "lucide-react";
import type { View } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { API_BASE_URL } from "@/lib/api";


export type CorporateChallenge = {
  id:number;
  title: string;
  description: string;
  looking_for: string;
  reward_amount: string;
  challenge_type: string;
  duration_in_days: number;
  contact_name: string;
  contact_role: string;
  scope: [];
  company_name: string
  stage: number
  end_date: number
};

export type MSMECollaboration = {
  title: string;
  description: string;
  looking_for: string;
  reward_amount: string;
  challenge_type: string;
  duration_in_days: number;
  contact_name: string;
  contact_role: string;
  scope: [];
  company_name: string
  stage: number
  end_date: number
};
export type Governmentchallenges = {
  title: string;
  description: string;
  looking_for: string;
  reward_amount: string;
  challenge_type: string;
  duration_in_days: number;
  contact_name: string;
  contact_role: string;
  scope: [];
  company_name: string
  stage: number
  end_date: number
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
    <Lock className="h-16 w-16 text-accent mb-6" />
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
  const [selectedGovernmentchallenges, setSelectedGovernmentchallenges] = useState<Governmentchallenges | null>(null);
  const { toast } = useToast();

  const [corporateChallenges, setCorporateChallenges] = useState<CorporateChallenge[]>([]);
  const [msmeCollaborations, setMsmeCollaborations] = useState<MSMECollaboration[]>([]);
  const [Governmentchallenges, setGovernmentchallenges] = useState<Governmentchallenges[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn && isOpen) {
      const fetchCorporateMsmeData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem("token")
          const apiBaseUrl = API_BASE_URL;
          const response = await fetch(`${apiBaseUrl}/api/get-collaboration?challenge_type=corporate`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            toast({
              variant: "destructive",
              title: 'Failed to fetch corporate data.',
              description: "Internal Server Error"
            });
          }
          const data = await response.json();
          setCorporateChallenges(
            data.collaborations
          );
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Failed to Get CorporateMSME",
            description: err.message || "An unknown error occurred.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      const fetchMSMECollaboration = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const apiBaseUrl = API_BASE_URL;
          const token = localStorage.getItem("token")
          const response = await fetch(`${apiBaseUrl}/api/get-collaboration?challenge_type=msme`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            toast({
              variant: "destructive",
              title: 'Failed to fetch corporate data.',
              description: "Internal Server Error"
            });
          }
          const data = await response.json();
          setMsmeCollaborations(
            data.collaborations
          );
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Failed to Get MSMEData",
            description: err.message || "An unknown error occurred.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      const fetchGovernmentChallenge = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const apiBaseUrl = API_BASE_URL;
          const token = localStorage.getItem("token")
          const response = await fetch(`${apiBaseUrl}/api/get-collaboration?challenge_type=government`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            toast({
              variant: "destructive",
              title: 'Failed to fetch Governement MSME data.',
              description: "Internal Server Error"
            });
          }
          const data = await response.json();
          setGovernmentchallenges(
            data.collaborations
          );
        } catch (err: any) {
          toast({
            variant: "destructive",
            title: "Failed to Get Government Challenge",
            description: err.message || "An unknown error occurred.",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchCorporateMsmeData();
      fetchMSMECollaboration();
      fetchGovernmentChallenge();
    }
  }, [isOpen, isLoggedIn,toast]);

  const handleViewDetails = (type: 'CorporateChallenges' | 'MSMECollaboration' | 'GovernmentChallenges', item: any) => {
    if (type === 'CorporateChallenges') setSelectedChallenge(item);
    if (type === 'MSMECollaboration') setSelectedCollaboration(item);
    if (type === 'GovernmentChallenges') setSelectedGovernmentchallenges(item);
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
        <Tabs defaultValue="CorporateChallenges" className="flex flex-col flex-grow min-h-0 px-6 pb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="CorporateChallenges">Corporate Challenges</TabsTrigger>
            <TabsTrigger value="MSMECollaboration">MSME Collaboration</TabsTrigger>
            <TabsTrigger value="Governmentchallenges">Government Challenges</TabsTrigger>
          </TabsList>
          <TabsContent value="CorporateChallenges" className="mt-4 flex-1 overflow-y-auto pr-4">
            <LoadingSkeleton />
          </TabsContent>
          <TabsContent value="MSMECollaboration" className="mt-4 flex-1 overflow-y-auto pr-4">
            <LoadingSkeleton />
          </TabsContent>
          <TabsContent value="Governmentchallenges" className="mt-4 flex-1 overflow-y-auto pr-4">
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="CorporateChallenges">Corporate Challenges</TabsTrigger>
          <TabsTrigger value="MSMECollaboration">MSME Challenges</TabsTrigger>
          <TabsTrigger value="Governmentchallenges">Government Challenges</TabsTrigger>
        </TabsList>
        <TabsContent value="CorporateChallenges" className="mt-4 flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {corporateChallenges?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2 font-headline">
                  No Challenges Present at the Moment
                </h2>
                <p className="text-muted-foreground">
                  Please check back later — new challenges will appear here soon.
                </p>
              </div>
            ) : corporateChallenges?.map((challenge, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image src={"https://api.hustloop.com/static/images/building.png"} alt={`${challenge.company_name} logo`} width={60} height={60} className="rounded-lg" />
                    <div>
                      <CardTitle className="text-base">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.company_name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{challenge.description}</p>
                </CardContent>
                <CardFooter className="flex-col items-start space-y-2">
                  <Badge variant="outline">Reward: {challenge.reward_amount}</Badge>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleViewDetails('CorporateChallenges', challenge)}>
                    View Challenge
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="MSMECollaboration" className="mt-4 flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {msmeCollaborations?.length === 0 ? (
              // 🟡 Empty State
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2 font-headline">
                  No Challenges Present at the Moment
                </h2>
                <p className="text-muted-foreground">
                  Please check back later — new challenges will appear here soon.
                </p>
              </div>
            ) : msmeCollaborations?.map((msme, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image src={"https://api.hustloop.com/static/images/building.png"} alt={`${msme.company_name} logo`} width={60} height={60} className="rounded-full" />
                    <div>
                      <CardTitle className="text-base">{msme.title}</CardTitle>
                      <CardDescription>{msme.company_name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{msme.description}</p>
                </CardContent>
                <CardFooter className="flex-col items-start space-y-2">
                  <Badge variant="outline">Reward: {msme.reward_amount}</Badge>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleViewDetails('MSMECollaboration', msme)}>
                    View Challenge
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="Governmentchallenges" className="mt-4 flex-1 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Governmentchallenges?.length === 0 ? (
              // 🟡 Empty State
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2 font-headline">
                  No Challenges Present at the Moment
                </h2>
                <p className="text-muted-foreground">
                  Please check back later — new challenges will appear here soon.
                </p>
              </div>
            ) : Governmentchallenges?.map((gov, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Image src={"https://api.hustloop.com/static/images/building.png"} alt={gov.company_name} width={60} height={60} className="rounded-lg" />
                    <div>
                      <CardTitle className="text-base">{gov.title}</CardTitle>
                      <CardDescription>{gov.company_name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{gov.description}</p>
                </CardContent>

                <CardFooter className="flex-col items-start space-y-2">
                  <Badge variant="outline">Reward: {gov.reward_amount}</Badge>
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleViewDetails('GovernmentChallenges', gov)}>
                    View Challenge
                  </Button>
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
            <DialogTitle className="text-3xl font-bold text-center font-headline">Innovation &amp; Growth Opportunities</DialogTitle>
            <DialogDescription className="text-center">
              <span className="text-accent">&quot;Empowering MSMEs for Success&quot;</span>
              <span className="block mt-2">
                Join our platform to solve corporate challenges for rewards or collaborate with MSMEs for growth opportunities. Whether you&apos;re an innovator, entrepreneur, or business expert, find your perfect match here.
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
      <GovernmentChallengeDetails
        collaboration={selectedGovernmentchallenges}
        onOpenChange={(isOpen) => !isOpen && setSelectedGovernmentchallenges(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
    </>
  );
}
