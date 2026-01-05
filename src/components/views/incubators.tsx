
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
  id: string;
  name: string;
  image: string;
  hint: string;
  location: string;
  type: string[];
  contactEmail?: string;
  contactPhone?: string;
  rating: number;
  reviews: number;
  description: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  metrics: {
    startupsSupported: string;
    fundedStartupsPercent: string;
    startupsOutsideLocationPercent: string;
    totalFundingRaised: string;
  };
  partners?: string[];
  // Kept for backward compatibility but made optional
  details?: {
    overview?: string;
    services?: { title: string; description: string }[];
    benefits?: string[];
    eligibility?: {
      focusAreas?: string;
      requirements?: string[];
    };
    timeline?: {
      event?: string;
      period?: string;
    }[];
  };
  focus: string[];
  user_id?: string;
  is_owner?: boolean;
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
          const token = localStorage.getItem("token");
          const response = await fetch(`${API_BASE_URL}/api/incubators`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {}
          });
          if (!response.ok) {
            throw new Error('Failed to fetch incubators.');
          }
          const data = await response.json();

          setIncubators(data.items);
        } catch (err: any) {
          // Fallback static data
          setIncubators([
            {
              id: "fallback-1",
              name: "Fallback Incubator",
              image: "https://placehold.co/600x400",
              hint: "fallback",
              location: "Fallback City",
              rating: 5,
              reviews: 10,
              description: "This is a fallback incubator shown when the API is unavailable.",
              metrics: {
                startupsSupported: "20+",
                fundedStartupsPercent: "40%",
                startupsOutsideLocationPercent: "30%",
                totalFundingRaised: "$5M"
              },
              focus: ["Tech", "Innovation"],
              details: {
                overview: "Fallback overview.",
                services: [{ title: "Mentorship", description: "Expert guidance." }],
                benefits: ["Networking"],
                eligibility: { focusAreas: "All", requirements: ["None"] },
                timeline: [{ event: "Application", period: "Year-round" }],
              },
              type: ["Incubator"]
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
    setSelectedIncubator(incubator);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] w-[90vw] rounded-lg lg:w-full flex flex-col p-0">
          <DialogHeader className="p-6">
            <DialogTitle className="text-3xl font-bold text-center font-headline">Startup Incubation Hub</DialogTitle>
            <DialogDescription className="text-center">
              <span className="text-accent">&quot;You Dream It. We Help Build It.&quot;</span>
              <br />
              Connect with leading incubators that provide the resources, mentorship, and ecosystem you need to transform your innovative ideas into successful ventures.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto px-6">
            {!allowAccess && !isLoggedIn ? (
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
                    <Card key={index} className="flex flex-col bg-card/40 backdrop-blur-md border-border/50 hover:border-accent/40 transition-all duration-300 group shadow-lg hover:shadow-accent/10 h-full overflow-hidden">
                      <CardHeader className="p-0 relative h-32 bg-gradient-to-br from-accent/10 to-transparent flex items-center justify-center">
                        <div className="absolute top-4 right-4 z-10">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-accent/20 text-accent">
                            {incubator.type[0] || 'Incubator'}
                          </Badge>
                        </div>
                        <div className="relative w-20 h-20 transition-all duration-500 group-hover:scale-110">
                          {incubator.image ? (
                            <Image
                              src={'/icons/corporate-incu.png'}
                              alt={incubator.name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent/5 rounded-xl border border-accent/10">
                              <span className="text-xl font-bold text-accent">{incubator.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex-grow p-5 space-y-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-bold font-headline transition-colors uppercase tracking-tight">{incubator.name}</CardTitle>
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest leading-none">
                            <MapPin className="h-3 w-3 text-blue-500" />
                            <span>{incubator.location}</span>
                          </div>
                        </div>

                        <CardDescription className="text-sm line-clamp-2 text-muted-foreground leading-relaxed">
                          {incubator.description}
                        </CardDescription>

                        <div className="flex flex-wrap gap-1.5">
                          {incubator.focus.map(area => (
                            <Badge key={area} variant="outline" className="text-[10px] py-0 border-blue-500/20 bg-blue-500/5 text-blue-300">
                              {area}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                          <div className="text-left">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Supported</p>
                            <p className="text-lg font-bold font-headline">{incubator.metrics.startupsSupported}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Funded (%)</p>
                            <p className="text-lg font-bold font-headline text-blue-500">{incubator.metrics.fundedStartupsPercent}</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="p-5 pt-0">
                        <Button
                          className="w-full bg-accent hover:bg-accent/90 text-white font-semibold transition-all group-hover:shadow-[0_0_20px_-5px_rgba(var(--accent-rgb),0.4)]"
                          onClick={() => handleViewDetails(incubator)}
                        >
                          Explore Program ({incubator.rating || 0} ★ | {incubator.reviews || 0} Reviews)
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
