
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CorporateChallenge } from './msmes';
import { FileText, Workflow, IndianRupee, Rocket } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';

interface CorporateChallengeDetailsProps {
  challenge: CorporateChallenge | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function CorporateChallengeDetails({
  challenge,
  onOpenChange,
  isLoggedIn,
  hasSubscription,
}: CorporateChallengeDetailsProps) {
  if (!challenge) return null;

  const isDisabled = !isLoggedIn || !hasSubscription;
  let tooltipContent = null;
  if (!isLoggedIn) {
    tooltipContent = <p>Please login to view the problem statement's</p>;
  } else if (!hasSubscription) {
    tooltipContent = (
      <p>subscribe to a plan to view and submit the solution</p>
    );
  }

  const applyButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      disabled={isDisabled}
    >
      <Rocket className="mr-2 h-5 w-5" /> Apply Now
    </Button>
  );

  return (
    <Dialog open={!!challenge} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center gap-4">
            <Image src={challenge.logo} alt={`${challenge.company} logo`} width={80} height={80} className="rounded-lg" data-ai-hint={challenge.hint} />
            <div>
                <DialogTitle className="text-3xl font-bold font-headline">{challenge.title}</DialogTitle>
                <DialogDescription>
                A challenge by {challenge.company}.
                </DialogDescription>
            </div>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4">
          <div className="space-y-12">
            <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">About The Challenge</h3>
                <p className="text-muted-foreground">{challenge.details.about}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="items-center">
                  <FileText className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-4xl font-bold">{challenge.details.problemStatements}</CardTitle>
                  <p className="text-sm text-muted-foreground">Problem Statements</p>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="items-center">
                  <Workflow className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-4xl font-bold">{challenge.details.stages}</CardTitle>
                  <p className="text-sm text-muted-foreground">Challenge Stages</p>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="items-center">
                  <IndianRupee className="h-8 w-8 text-primary mb-2" />
                  <CardTitle className="text-2xl font-bold">{challenge.details.rewardPerStatement}</CardTitle>
                  <p className="text-sm text-muted-foreground">Per Problem Statement</p>
                </CardHeader>
              </Card>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-bold mb-4 font-headline">Mission</h3>
                    <p className="text-muted-foreground">{challenge.details.mission}</p>
                </div>
                <div>
                    <h3 className="text-2xl font-bold mb-4 font-headline">Who Can Participate</h3>
                    <p className="text-muted-foreground">{challenge.details.participation}</p>
                </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Rewards</h3>
              <p className="text-muted-foreground">{challenge.details.rewards}</p>
            </div>


            <div className="text-center bg-card/50 rounded-lg my-12 py-10">
              <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Solve This Challenge?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                Submit your innovative solution and get a chance to win exciting rewards and partnerships.
              </p>
              {isDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{applyButton}</span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipContent}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                applyButton
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
