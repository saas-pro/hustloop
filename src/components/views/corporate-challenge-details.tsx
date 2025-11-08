'use client';

import { useEffect, useState } from 'react'; // Import useState
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { CorporateChallenge } from './msmes';
import { Workflow, IndianRupee, Rocket, User, Timer, AlertCircle, Check, Globe, Twitter, Linkedin, HelpCircle, UserCircle, MessageSquare, Book, Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { SolutionSubmissionForm } from './solution-submission-form'; // Import the new component
import { MarkdownViewer } from '../ui/markdownViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';

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
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | string>('N/A');

  useEffect(() => {
    if (challenge?.end_date && challenge.start_date) {
      const startDate = new Date(challenge.start_date);
      const endDate = new Date(challenge.end_date);
      const now = new Date();

      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsedDuration = now.getTime() - startDate.getTime();

      let currentProgress = 0;
      if (totalDuration > 0) {
        currentProgress = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));
      } else if (now >= endDate) {
        currentProgress = 100;
      }
      setProgress(currentProgress);

      if (now > endDate) {
        setDaysRemaining('Ended');
      } else {
        const remaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setDaysRemaining(remaining > 0 ? remaining : 0);
      }
    }
  }, [challenge]);


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
    setShowSubmissionForm(false);
    onOpenChange(false);
  };

  const handleCancelSubmission = () => {
    setShowSubmissionForm(false);
  };

  const applyButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      onClick={handleApplyClick}
      disabled={!!isDisabled}
    >
      <Rocket className="mr-2 h-5 w-5" /> Apply Now
    </Button>
  );

  return (
    <Dialog open={!!challenge} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6">
          <div className="flex items-center gap-4">
            <Image
              src={`${challenge.logo_url}`}
              alt={`${challenge.company_name} logo`}
              width={80}
              height={80}
              className="rounded-lg"
            />
            <div>
              <DialogTitle className="text-3xl font-bold font-headline">
                {challenge.company_name}
              </DialogTitle>
              <DialogDescription>
                {challenge.company_description}<br />
                A challenge by {challenge.company_name}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full px-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="forum">Forum</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="q/a">Q/A</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-grow mt-4 h-[calc(90vh-200px)]">
            <TabsContent value="summary">


              {showSubmissionForm ? (
                <ScrollArea className="flex-grow mt-4 px-6">
                  <SolutionSubmissionForm
                    challengeId={challenge.id}
                    onSubmissionSuccess={handleSubmissionSuccess}
                    onCancel={handleCancelSubmission}
                  />
                </ScrollArea>
              ) : (
                <ScrollArea className="flex-grow mt-4 px-6">
                  <div className="space-y-12">
                    {/* Title */}
                    <div className="mb-8 flex items-start gap-4">
                      <Award className="h-10 w-10 text-primary mt-1" />
                      <div>
                        <h2 className="text-xl font-bold text-muted-foreground tracking-wide uppercase mb-1">
                          Challenge Title
                        </h2>
                        <h1 className="text-4xl font-extrabold leading-tight text-foreground">
                          {challenge.title}
                        </h1>
                      </div>
                    </div>

                    {/* About Challenge */}
                    <div>
                      <h3 className="text-2xl font-bold mb-4 font-headline">About The Challenge</h3>
                      <MarkdownViewer content={challenge.description} />
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
                          <CardTitle className="text-2xl font-bold">
                            {challenge.reward_amount
                              ? challenge.reward_amount
                              : `${challenge.reward_min} - ${challenge.reward_max}`}
                          </CardTitle>
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
                        <CardContent className="p-6 flex items-center justify-between gap-4">
                          {/* Left: Contact Info */}
                          <div className="flex items-center gap-4">
                            <User className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-semibold">{challenge.contact_name}</p>
                              <p className="text-sm text-muted-foreground">{challenge.contact_role}</p>
                            </div>
                          </div>

                          {/* Right: Social Links */}
                          <div className="flex flex-col items-start gap-3">
                            {challenge?.website_url && (
                              <a
                                href={challenge.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-primary/80"
                              >
                                <Globe className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">Website</span>
                              </a>
                            )}
                            {challenge?.x_url && (
                              <a
                                href={challenge.x_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-primary/80"
                              >
                                <Twitter className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">X (Twitter)</span>
                              </a>
                            )}
                            {challenge?.linkedin_url && (
                              <a
                                href={challenge.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-primary/80"
                              >
                                <Linkedin className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">LinkedIn</span>
                              </a>
                            )}
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
            </TabsContent>
            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Challenge Timeline</CardTitle>
                  <CardDescription>Track the progress of the challenge from start to finish.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Start: {new Date(challenge.start_date).toLocaleDateString()}</span>
                    <span>End: {new Date(challenge.end_date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-center mt-4">
                    <p className="text-lg font-semibold">
                      {typeof daysRemaining === 'number' ? `${daysRemaining} days remaining` : daysRemaining}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blog">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Book className="h-6 w-6" />Blog</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                  <p>Blogs related to this challenge will appear here.</p>
                  <p className="text-sm">Coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="forum">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MessageSquare className="h-6 w-6" />Forum</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                  <p>A discussion forum for this challenge will be available soon.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><UserCircle className="h-6 w-6" />Participant Profile</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                  <p>Your participation profile and status will be shown here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="q/a">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><HelpCircle className="h-6 w-6" />Q/A Section</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground py-12">
                  <p>Have questions? Ask the organizers directly in the Q/A section.</p>
                  <p className="text-sm">This feature is coming soon!</p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog >
  );
}