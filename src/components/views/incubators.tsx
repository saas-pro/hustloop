
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Lock, Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import IncubatorDetails from "./incubator-details";
import type { View } from "@/app/types";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { API_BASE_URL } from "@/lib/api";
import { set } from "date-fns";


export type Incubator = {
  name: string;
  image: string;
  hint: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  metrics: {
    startups: string;
    funding: string;
    successRate: string;
  };
  focus: string[];
  details: {
    overview: string;
    services: { title: string; description: string }[];
    benefits: string[];
    eligibility: {
      focusAreas: string;
      requirements: string[];
    };
    timeline: {
      event: string;
      period: string;
    }[];
  };
};

interface IncubatorsViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  setActiveView: (view: View) => void;
}

const LoginPrompt = ({ setActiveView, contentType }: { setActiveView: (view: View) => void, contentType: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <Lock className="h-16 w-16 text-accent mb-6" />
    <h3 className="text-2xl font-bold mb-2">Access required</h3>
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
      <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="p-0">
          <Skeleton className="w-full h-48" />
        </CardHeader>
        <CardContent className="flex-grow p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Separator className="my-4 bg-border/50" />
          <div className="grid grid-cols-3 text-center">
            <div>
              <Skeleton className="h-5 w-1/2 mx-auto" />
              <Skeleton className="h-3 w-3/4 mx-auto mt-1" />
            </div>
            <div>
              <Skeleton className="h-5 w-1/2 mx-auto" />
              <Skeleton className="h-3 w-3/4 mx-auto mt-1" />
            </div>
            <div>
              <Skeleton className="h-5 w-1/2 mx-auto" />
              <Skeleton className="h-3 w-3/4 mx-auto mt-1" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    ))}
  </div>
);


export default function IncubatorsView({ isOpen, onOpenChange, isLoggedIn, hasSubscription, setActiveView }: IncubatorsViewProps) {
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  const { toast } = useToast();
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowAccess, setAllowAccess] = useState(false);

  useEffect(() => {
    const fromMarketplace = localStorage.getItem("fromMarketplace");
    if (fromMarketplace === "true") {
      setAllowAccess(true);
      localStorage.removeItem("fromMarketplace");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchIncubators = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const apiBaseUrl = API_BASE_URL;
          const response = await fetch(`${apiBaseUrl}/api/incubators`);
          if (!response.ok) {
            throw new Error('Failed to fetch incubators.');
          }
          const data = await response.json();

          setIncubators(data.items);
        } catch (err: any) {
          // Fallback static data
          setIncubators([
            {
              name: "Fallback Incubator",
              image: "https://placehold.co/600x400",
              hint: "fallback",
              location: "Fallback City",
              rating: 5,
              reviews: 10,
              description: "This is a fallback incubator shown when the API is unavailable.",
              metrics: { startups: "10+", funding: "$1M+", successRate: "90%" },
              focus: ["Tech", "Innovation"],
              details: {
                overview: "Fallback overview.",
                services: [{ title: "Mentorship", description: "Expert guidance." }],
                benefits: ["Networking"],
                eligibility: { focusAreas: "All", requirements: ["None"] },
                timeline: [{ event: "Application", period: "Year-round" }],
              },
            },
          ]);
          setError(null); // Hide error, show fallback
        } finally {
          setIsLoading(false);
        }
      };
      fetchIncubators();
    }
  }, [isOpen]);

  const handleViewDetails = (incubator: Incubator) => {
    if (hasSubscription) {
      setSelectedIncubator(incubator);
    } else {
      toast({
        variant: "destructive",
        title: "Subscription Required",
        description: "You need an active subscription to view full details and apply to incubators.",
        action: <ToastAction altText="Upgrade" onClick={() => {
          onOpenChange(false);
          setActiveView('pricing');
        }}>Upgrade Plan</ToastAction>,
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6">
            <DialogTitle className="text-3xl font-bold text-center font-headline">Startup Incubation Hub</DialogTitle>
            <DialogDescription className="text-center">
              <span className="text-accent">&quot;You Dream It. We Help Build It.&quot;</span>
              <br />
              Connect with leading incubators that provide the resources, mentorship, and ecosystem you need to transform your innovative ideas into successful ventures.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto px-6">
            { !allowAccess && !isLoggedIn ? (
              <LoginPrompt setActiveView={setActiveView} contentType="incubators" />
            ) : isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Fetching Incubators</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {incubators.map((incubator, index) => {
                  return (
                    <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                      <CardHeader className="p-0">
                        <Image src={incubator.image} alt={incubator.name} width={600} height={400} className="w-full h-53 object-cover" data-ai-hint={incubator.hint} />
                      </CardHeader>
                      <CardContent className="flex-grow p-4 space-y-3">
                        <CardTitle className="text-xl">{incubator.name}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < incubator.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'}`} />
                            ))}
                            <span className="ml-1">({incubator.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{incubator.location}</span>
                          </div>
                        </div>
                        <CardDescription>{incubator.description}</CardDescription>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {incubator.focus.map(area => <Badge key={area} variant="secondary">{area}</Badge>)}
                        </div>

                        <Separator className="my-4 bg-border/50" />

                        <div className="grid grid-cols-3 text-center">
                          <div>
                            <p className="text-lg font-bold">{incubator.metrics.startups}</p>
                            <p className="text-xs text-muted-foreground">Startups</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{incubator.metrics.funding}</p>
                            <p className="text-xs text-muted-foreground">Avg Funding</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{incubator.metrics.successRate}</p>
                            <p className="text-xs text-muted-foreground">Success Rate</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4">
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleViewDetails(incubator)}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <IncubatorDetails
        incubator={selectedIncubator}
        onOpenChange={(isOpen) => !isOpen && setSelectedIncubator(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
    </>
  );
}
