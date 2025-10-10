'use client';

import { useState } from 'react'; // Import useState
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
import { Workflow, IndianRupee, Rocket, User, Timer, AlertCircle, Check } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { SolutionSubmissionForm } from './solution-submission-form'; // Import the new component

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
  hasSubscription
}: CorporateChallengeDetailsProps) {
  const [showSubmissionForm, setShowSubmissionForm] = useState(false); // New state

  if (!challenge) return null;
  const isOtherUsers = ["msme", "incubator", "mentor"].some(role =>
    localStorage.getItem('userRole')?.includes(role)
  );

  const isDisabled = !isLoggedIn || isOtherUsers;
  let tooltipContent = null;
  if (!isLoggedIn) {
    tooltipContent = <p>Please login to view the problem statement&apos;s</p>;
  } //else if (!hasSubscription) {
  //   tooltipContent = (
  //     <p>Subscribe to a plan to view and submit the solution</p>
  //   );
  else if (isOtherUsers) {
    tooltipContent = (
      <p>{"MSME Didn't allow to submit solution"}</p>
    )
  }

  const handleApplyClick = () => {
    if (!isDisabled) {
      setShowSubmissionForm(true);
    }
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false); // Hide form after successful submission
    onOpenChange(false); // Optionally close the main dialog
  };

  const handleCancelSubmission = () => {
    setShowSubmissionForm(false); // Hide form
  };

  const applyButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      onClick={handleApplyClick} // Add onClick handler
      disabled={!!isDisabled} // Disable if not logged in or subscribed
    >
      <Rocket className="mr-2 h-5 w-5" /> Apply Now
    </Button>
  );

  return (
    <Dialog open={!!challenge} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <div className="flex items-center gap-4">
            <Image
              src="https://api.hustloop.com/static/images/building.png"
              alt={`${challenge.company_name} logo`}
              width={80}
              height={80}
              className="rounded-lg"
            />
            <div>
              <DialogTitle className="text-3xl font-bold font-headline">
                {challenge.title}
              </DialogTitle>
              <DialogDescription>
                A challenge by {challenge.company_name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Conditional rendering based on showSubmissionForm state */}
        {showSubmissionForm ? (
          <ScrollArea className="flex-grow mt-4 px-6">
            <SolutionSubmissionForm
              challengeId={challenge.id} // Pass challenge ID to the form
              onSubmissionSuccess={handleSubmissionSuccess}
              onCancel={handleCancelSubmission}
            />
          </ScrollArea>
        ) : (
          <ScrollArea className="flex-grow mt-4 px-6">
            <div className="space-y-12">
              {/* About Challenge */}
              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">About The Challenge</h3>
                <p className="text-muted-foreground">{challenge.description}</p>
              </div>

              {/* Key Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                {/* Stage */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="items-center">
                    <Workflow className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-4xl font-bold">{challenge.stage}</CardTitle>
                    <p className="text-sm text-muted-foreground">Challenge Stage</p>
                  </CardHeader>
                </Card>

                {/* End Date */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="items-center">
                    <Timer className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-4xl font-bold">
                      {new Date(challenge.end_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">End Date</p>
                  </CardHeader>
                </Card>

                {/* Reward */}
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="items-center">
                    <IndianRupee className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-2xl font-bold">{challenge.reward_amount}</CardTitle>
                    <p className="text-sm text-muted-foreground">Reward Amount</p>
                  </CardHeader>
                </Card>
              </div>

              <Separator />

              {/* Mission & Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Mission</h3>
                  <ul className="space-y-2">
                    {Array.isArray(challenge.scope) && challenge.scope.map((s, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Who Can Participate</h3>
                  <p className="text-muted-foreground">{challenge.looking_for}</p>
                </div>
              </div>

              <Separator />

              {/* Contact */}
              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Primary Contact</h3>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 flex items-center gap-4">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-semibold">{challenge.contact_name}</p>
                      <p className="text-sm text-muted-foreground">{challenge.contact_role}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Apply Section */}
              {isOtherUsers ?
                <div className="text-center bg-card/50 rounded-lg my-12 py-10">
                  <h2 className="text-3xl font-bold mb-4 font-headline">
                    Ready to Solve This Challenge?
                  </h2>
                  <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                    Login as Founder to Solve this Problem
                  </p>
                </div>

                : <div className="text-center bg-card/50 rounded-lg my-12 py-10">
                  <h2 className="text-3xl font-bold mb-4 font-headline">
                    Ready to Solve This Challenge?
                  </h2>
                  <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                    Submit your innovative solution and get a chance to win exciting rewards and partnerships.
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{applyButton}</span>
                      </TooltipTrigger>
                      {isDisabled && <TooltipContent>{tooltipContent}</TooltipContent>}
                    </Tooltip>
                  </TooltipProvider>
                </div>}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}