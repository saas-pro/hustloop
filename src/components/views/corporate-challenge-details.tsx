'use client';

import { useEffect, useRef, useState } from 'react'; // Import useState
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
import { Workflow, IndianRupee, Rocket, User, Timer, AlertCircle, Check, Globe, Twitter, Linkedin, HelpCircle, UserCircle, MessageSquare, Book, Award, Lock, FileText } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Image from 'next/image';
import { SolutionSubmissionForm } from './solution-submission-form';
import { MarkdownViewer } from '../ui/markdownViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import VerticalTimeline from '../ui/verticalTimeLine';
import { useChallengeProgress } from '../ui/useChallengeProgress';
import { QAForum } from '../ui/QAForum';
import { View } from '@/app/types';
import { API_BASE_URL } from '@/lib/api';
import { Input } from '../ui/input';
import { Table } from '../ui/table';
import { Badge } from '../ui/badge';

interface CorporateChallengeDetailsProps {
  challenge: CorporateChallenge | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  setActiveView: (view: View) => void;
}

import { LoadingButton } from "../ui/loading-button";
import TimelineCounter from '../ui/timeline-counter';

interface CorporateChallenge {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_min: number;
  reward_max: number;
  challenge_type: string;

  start_date: string;
  end_date: string;
  sector: string;
  stage: string;
  technology_area: string;
  contact_name: string;
  contact_role: string;
  created_at: string;
  looking_for: string;
  status: string;
  company_name: string;
  company_sector: string;
  company_description: string;
  website_url: string;
  linkedin_url: string;
  scope: string;
  x_url: string;
  stop_date: string | null;
  logo_url: string;
  extended_end_date?: string | null;
  attachments?: []
}

type hallOfFame = {
  contactName: string;
  points: number;
  state: string;
}

type TimelineData = {
  application_started: string;
  application_ended: string;
  extended_end_date: string | null;
  review_started: string;
  review_ended: string;
  screening_started: string;
  screening_ended: string;
  challenge_close: boolean | string;
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: string;
  attachments: string[];
  createdAt: string;
}

export function AccessMessage({ title, message }: { title: string; message: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="max-w-xs text-sm">{message}</p>
    </div>
  );
}


export default function CorporateChallengeDetails({
  challenge,
  onOpenChange,
  isLoggedIn,
  hasSubscription,
  setActiveView
}: CorporateChallengeDetailsProps) {
  const { progress, daysRemaining } = useChallengeProgress(challenge);
  const [challengeId, setChallengeId] = useState()
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<TimelineData | null>(null);

  const [data, setData] = useState<hallOfFame[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!challenge) return;

    const getHallOfFame = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/hall-of-fame/${challenge.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        setData(data.hallOfFame || []);
      } catch (err) {
        console.error("Failed to fetch hall of fame:", err);
      }
    };

    getHallOfFame();
  }, [challenge]);


  useEffect(() => {
    const getEvents = async () => {
      if (!challenge) return;

      const response = await fetch(
        `${API_BASE_URL}/api/collaborations/${challenge.id}/timeline`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      setEvents(data.message?.timeline || data.timeline);
    };

    getEvents();
  }, [challenge]);



  useEffect(() => {
    if (!challenge?.id) return;

    fetch(`${API_BASE_URL}/api/announcements/${challenge.id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => setAnnouncements(data.announcements || []));
  }, [challenge]);


  const filtered = data.filter((item: any) => {
    const s = search.toLowerCase();
    return (
      item.contactName.toLowerCase().includes(s) ||
      String(item.points).includes(s) ||
      item.district.toLowerCase().includes(s)
    );
  });

  const termsRef = useRef<HTMLDivElement>(null);

  if (!challenge) return null;
  const userRole = localStorage.getItem("userRole") || "";
  const founderRole = localStorage.getItem("founder_role") || "";
  console.log(founderRole)

  const isAllowedFounder =
    userRole.includes("founder") &&
    founderRole === "Solve MSME&#39;s challenge";

  const isOtherUsers =
    userRole.includes("incubator") ||
    userRole.includes("mentor") ||
    userRole.includes("msme") ||
    (userRole.includes("founder") && !isAllowedFounder);

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

  const handleApplyClick = (id: any) => {
    if (!isDisabled) {
      setShowTermsDialog(true);
      setChallengeId(id)
    }
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    onOpenChange(false);
  };

  const handleCancelSubmission = () => {
    setShowSubmissionForm(false);
  };

  const handleAgreeAndProceed = () => {
    setShowTermsDialog(false);
    setShowSubmissionForm(true);
  };

  const handleScroll = () => {
    if (!termsRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setScrolledToEnd(true);
    }
  };

  const isChallengeExpiredOrStopped = challenge.status === "expired" || challenge.status === "stopped";
  const attachments = Array.isArray(challenge?.attachments)
    ? challenge.attachments
    : JSON.parse(challenge?.attachments || "[]");
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-fit">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="announcement">Announcements</TabsTrigger>
            <TabsTrigger value="hof">Hall of Fame</TabsTrigger>
            <TabsTrigger value="q/a">Q/A</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* <ScrollArea className="flex-grow mt-4 h-[calc(90vh-350px)] md:h-[calc(90vh-250px)]"> */}
          <ScrollArea className="flex-grow mt-4 h-[calc(90vh-350px)] md:h-[calc(90vh-250px)]">
            <div className="flex flex-col w-full mt-4">
              <TabsContent value="summary">
                <div className="space-y-8">

                  {isChallengeExpiredOrStopped && (
                    <div className="w-full bg-red-100 border-l-8 border-red-600 p-5 rounded text-red-900 shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="text-red-600 text-xl">❗</div>
                        <div>
                          <h2 className="text-lg font-bold mb-1">
                            {challenge.status === "stopped" && "This challenge has been Stopped"}
                            {challenge.status === "expired" && "This challenge has been Ended"}
                          </h2>

                          <p className="text-sm leading-relaxed mb-2">
                            All activity related to this challenge should be halted until further notice.
                          </p>

                          <p className="text-sm leading-relaxed mb-2">
                            Effective immediately, this challenge is no longer accepting submissions.
                            Our team is reviewing operational and safety requirements and will notify you
                            when further updates are available. We appreciate your patience.
                          </p>

                          <p className="text-sm leading-relaxed mb-4">
                            If you have any questions, please contact support or your challenge administrator.
                          </p>

                          {challenge.stop_date && (
                            <p className="text-xs font-semibold text-red-700">
                              Stopped on {new Date(challenge.stop_date).toUTCString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}


                  <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6">
                    <div className="flex items-start gap-3">
                      <Award className="h-10 w-10 text-primary mt-1" />
                      <div>
                        <h2 className="text-xl font-bold text-muted-foreground uppercase mb-1">
                          Challenge Title
                        </h2>
                        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-foreground break-words">
                          {challenge.title}
                        </h1>
                      </div>
                    </div>
                    <div className='md:mr-3'>
                      <TimelineCounter
                        endDate={challenge?.end_date}
                        extendedEndDate={challenge.extended_end_date}
                        status={challenge.status}
                      />
                    </div>

                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-4">About The Challenge</h3>
                    <MarkdownViewer content={challenge.description} />
                  </div>

                  {attachments?.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-2">Attachments</h2>

                      <div className="space-y-2 text-sm bg-accent/50 hover:bg-accent p-3 rounded-md">
                        {attachments.map((fileUrl: string, index: number) => {
                          const fileName = fileUrl.split("/").pop();
                          return (
                            <a
                              key={index}
                              href={fileUrl}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:text-primary/80 break-all"
                            >
                              <FileText className="h-4 w-4" />
                              {fileName}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <Card className="bg-card/50 backdrop-blur-sm border">
                      <CardHeader className="items-center">
                        <Workflow className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-3xl font-bold">{challenge?.stage}</CardTitle>
                        <p className="text-sm text-muted-foreground">Challenge Stage</p>
                      </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border">
                      <CardHeader className="items-center">
                        <Timer className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-2xl font-bold">
                          {new Date(challenge.end_date).toLocaleDateString("en-US")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">End Date</p>
                      </CardHeader>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border">
                      <CardHeader className="items-center">
                        <IndianRupee className="h-8 w-8 text-primary mb-2" />
                        <CardTitle className="text-xl font-bold">
                          {challenge.reward_amount ??
                            `${challenge.reward_min} - ${challenge.reward_max}`}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">Reward Amount</p>
                      </CardHeader>
                    </Card>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Mission</h3>
                      <ul className="space-y-3">
                        {Array.isArray(challenge.scope) && challenge.scope.map((s, i) => (<li key={i} className="flex items-start gap-3"> <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" /> <span>{s}</span> </li>))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold mb-4">Who Can Participate</h3>
                      <p className="text-muted-foreground break-words">
                        {challenge.looking_for}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="text-2xl font-bold mb-4 font-headline">Primary Contact</h3>

                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <User className="h-8 w-8 text-primary" />

                          <div>
                            <p className="font-semibold">{challenge.contact_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {challenge.contact_role}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center bg-card/50 rounded-lg my-12 py-10">
                    {isChallengeExpiredOrStopped ? (
                      <div className="w-full text-left bg-red-100 border-l-8 border-red-600 p-5 rounded text-red-900 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="text-red-600 text-xl">❗</div>
                          <div>
                            <h2 className="text-lg font-bold mb-1">
                              {challenge.status === "stopped" || "expired"
                                ? "This challenge has been stopped"
                                : "This challenge has been paused"}
                            </h2>

                            <p className="text-sm leading-relaxed mb-2">
                              All activity related to this challenge should be halted until further notice.
                            </p>

                            <p className="text-sm leading-relaxed mb-2">
                              Effective immediately, this challenge is no longer accepting submissions.
                              Our team is reviewing operational and safety requirements and will notify you
                              when further updates are available. We appreciate your patience.
                            </p>

                            <p className="text-sm leading-relaxed mb-4">
                              If you have any questions, please contact support or your challenge administrator.
                            </p>

                            {challenge.stop_date && (
                              <p className="text-xs font-semibold text-red-700">
                                Stopped on {new Date(challenge.stop_date).toUTCString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold mb-4 font-headline">
                          Ready to Solve This Challenge?
                        </h2>

                        <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                          Submit your innovative solution and get a chance to win exciting rewards
                          and partnerships.
                        </p>
                      </>
                    )}

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {isOtherUsers ? (
                            <div className="flex gap-4 w-full justify-center">
                              <Button disabled className="bg-gray-400 cursor-not-allowed">
                                Not Allowed
                              </Button>
                            </div>
                          ) : isAllowedFounder || isLoggedIn ? (
                            challenge.extended_end_date || challenge.status === "active" ? (
                              <Button
                                size="lg"
                                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                onClick={() => handleApplyClick(challenge.id)}
                                disabled={isDisabled || isChallengeExpiredOrStopped}
                              >
                                <Rocket className="mr-2 h-5 w-5" />
                                Solve This Challenge
                              </Button>
                            ) : null
                          ) : (
                            <div className="flex gap-4 w-full justify-center">
                              <Button onClick={() => setActiveView("login")}>Login</Button>

                              <Button
                                onClick={() => setActiveView("signup")}
                                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                              >
                                Sign Up
                              </Button>
                            </div>
                          )}
                        </TooltipTrigger>

                        {isDisabled && <TooltipContent>{tooltipContent}</TooltipContent>}
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </TabsContent>
            </div>

            <TabsContent value="timeline">
              <Card className="p-4">
                <CardHeader >
                  <CardTitle>Challenge Timeline</CardTitle>
                  <CardDescription>
                    Track the progress of the challenge from start to finish.
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center mt-6">

                  {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Lock size={"64"} />
                      <h3 className="text-lg font-semibold text-foreground">Please Log In</h3>
                      <p className="max-w-xs text-sm">
                        You must be logged in to view the challenge timeline.
                      </p>
                    </div>
                  ) : (
                    <>
                      {events ? (
                        <VerticalTimeline timeline={events} />
                      ) : (
                        <p className="text-muted-foreground">Loading timeline...</p>
                      )}
                    </>
                  )}

                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="announcement">
              <Card className="border shadow-sm p-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Announcements
                  </CardTitle>
                  <CardDescription>
                    Updates and important information for this challenge.
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4">
                  {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                      <Lock size={"64"} />
                      <h3 className="text-lg font-semibold text-foreground">Please Log In</h3>
                      <p className="max-w-xs text-sm">You must be logged in to view announcements.</p>
                    </div>
                  ) : (
                    <>
                      {(!announcements || announcements.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                          <h3 className="text-lg font-semibold text-foreground">No Announcements Yet</h3>
                          <p className="max-w-xs text-sm">
                            Announcements related to this challenge will appear here.
                          </p>
                        </div>
                      )}

                      {announcements?.length > 0 && (
                        <div className="space-y-4">
                          {announcements.map((a) => (
                            <Card
                              key={a.id}
                              className="group p-5 border shadow-sm hover:shadow-lg 
                  transition-all duration-300 rounded-xl relative
                  hover:border-primary/40 hover:bg-primary/5"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                    {a.type === "alert" && <span className="text-red-500">⚠️</span>}
                                    {a.type === "update" && <span className="text-blue-500">📢</span>}
                                    {a.type === "deadline" && <span className="text-orange-500">⏳</span>}
                                    {a.type === "result" && <span className="text-green-500">🏆</span>}
                                    {a.type === "general" && <span className="text-primary">📝</span>}
                                    {a.title}
                                  </h3>
                                </div>

                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize px-3 py-1 rounded-full"
                                >
                                  {a.type}
                                </Badge>
                              </div>

                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                                {a.message}
                              </p>

                              {a.attachments.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    Attachments:
                                  </p>

                                  <div className="flex gap-2">
                                    📎
                                    {a.attachments.map((url, i) => (
                                      <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-primary font-medium 
                              underline underline-offset-2 transition-all hover:text-primary/70"
                                      >
                                        Attachment {i + 1}
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <Separator className="my-4" />

                              <div className="flex items-center justify-between text-xs text-muted-foreground opacity-80">
                                <span>Posted on {new Date(a.createdAt).toLocaleString()}</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="hof">
              <Card className="p-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Hall of Fame
                  </CardTitle>
                  <CardDescription>
                    Top performers and contributors of this challenge.
                  </CardDescription>
                </CardHeader>
                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Lock size={"64"} />
                    <h3 className="text-lg font-semibold text-foreground">Please Log In</h3>
                    <p className="max-w-xs text-sm">You must be logged in to view the Hall of Fame.</p>
                  </div>

                ) : (
                  <>
                    <CardContent>
                      <div className="w-full overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted text-left">
                              <TableHead>Profile</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Points</TableHead>
                              <TableHead>State</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {filtered.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={4}
                                  className="text-center text-muted-foreground py-4"
                                >
                                  No results found.
                                </TableCell>
                              </TableRow>
                            ) : (
                              filtered.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <div
                                      className="h-10 w-10 rounded-full text-white flex items-center justify-center text-lg font-bold"
                                      style={(() => {
                                        const name = item.contactName || "?"
                                        const hash = name
                                          .split("")
                                          .reduce((acc, c) => acc + c.charCodeAt(0), 0)
                                        const color1 = `hsl(${hash % 360}, 70%, 50%)`
                                        const color2 = `hsl(${(hash + 120) % 360}, 70%, 50%)`
                                        return {
                                          background: `linear-gradient(135deg, ${color1}, ${color2})`,
                                        }
                                      })()}
                                    >
                                      {item.contactName
                                        ? item.contactName.charAt(0).toUpperCase()
                                        : "?"}
                                    </div>
                                  </TableCell>

                                  <TableCell className="font-medium">{item.contactName}</TableCell>
                                  <TableCell className="font-semibold">{item.points}</TableCell>
                                  <TableCell className="font-medium">{item.state}</TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="q/a">
              {!isLoggedIn ? (
                <Card className="p-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">Q/A Forum</CardTitle>
                    <CardDescription>Ask questions and collaborate with others on this challenge.</CardDescription>
                  </CardHeader>
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <Lock size={"64"} />
                    <h3 className="text-lg font-semibold text-foreground">Please Log In</h3>
                    <p className="max-w-xs text-sm">You must be logged in to view the Q/A forum.</p>
                  </div>
                  <CardContent>
                  </CardContent>
                </Card>
              ) : (
                <QAForum collaborationId={challenge?.id} />
              )}


            </TabsContent>

          </ScrollArea>
        </Tabs >
      </DialogContent >

      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-[600px] max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Terms & Conditions</DialogTitle>
            <DialogDescription>
              Please review the following terms before submitting your solution.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea
            ref={termsRef}
            onScrollCapture={handleScroll}
            className="max-h-[40vh] border rounded-md p-4 text-sm"
          >
            <div className="pr-4 space-y-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Originality & Ownership</h3>
                <p>
                  All submissions must be original work, free of plagiarism, and not infringe on third-party
                  intellectual property. The organizer may request evidence of ownership if required.
                </p>
                <h3 className="font-semibold text-lg">Submission Rights</h3>
                <p>
                  By submitting a solution, the participant grants the organizer the non-exclusive right to
                  review, evaluate, and use the submission for challenge purposes (such as judging and display
                  during the event).
                </p>

                <h3 className="font-semibold text-lg">Confidentiality</h3>
                <p>
                  The organizer will treat submissions as confidential, but cannot guarantee absolute
                  confidentiality due to online review processes or public events.
                </p>

                <h3 className="font-semibold text-lg">Disqualification</h3>
                <p>
                  Submissions that violate the platform’s code of conduct, include prohibited content, or do
                  not comply with stated rules may be disqualified.
                </p>

                <h3 className="font-semibold text-lg">Liability</h3>
                <p>
                  The organizer is not responsible for any technical malfunctions, lost data, or issues
                  arising from the submission process.
                </p>

                <h3 className="font-semibold text-lg">Acceptance of Terms</h3>
                <p>
                  Participants must accept these terms to proceed with submission.
                </p>
              </div>

              <p>
                By checking the box below, you acknowledge that you have read and agree to these
                terms.
              </p>
            </div>
          </ScrollArea>


          {/* Agree section */}
          <div className="flex items-center mt-4 gap-2">
            <input
              type="checkbox"
              disabled={!scrolledToEnd}
              checked={agreeChecked}
              onChange={(e) => setAgreeChecked(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span
              className={`text-sm ${!scrolledToEnd ? 'text-gray-400' : 'text-muted-foreground'}`}
            >
              I agree to the Terms & Conditions
            </span>
          </div>

          {/* Proceed button */}
          <div className="flex justify-end mt-6">
            <Button
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleAgreeAndProceed}
              disabled={!agreeChecked}
            >
              Proceed to Submission
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubmissionForm} onOpenChange={setShowSubmissionForm}>
        <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold font-headline">Submit Your Solution</DialogTitle>
            <DialogDescription>
              Fill out the form below to submit your idea for this challenge.
            </DialogDescription>
          </DialogHeader>

          {challengeId && (
            <SolutionSubmissionForm
              challengeId={challengeId || challenge.id}
              onSubmissionSuccess={handleSubmissionSuccess}
              onCancel={handleCancelSubmission}
            />
          )}
        </DialogContent>
      </Dialog>
    </Dialog >
  );
}