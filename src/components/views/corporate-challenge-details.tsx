'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
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
import { Workflow, IndianRupee, Rocket, User, Timer, AlertCircle, Check, Globe, Twitter, Linkedin, HelpCircle, UserCircle, MessageSquare, Book, Award, Lock, FileText, Trophy, Star, Medal, Users, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { LoadingButton } from "../ui/loading-button";
import TimelineCounter from '../ui/timeline-counter';
import { Skeleton } from '../ui/skeleton';
import { AnnouncementDialog } from './AnnouncementDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { string } from 'zod';

interface CorporateChallengeDetailsProps {
  challenge: CorporateChallenge | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  setActiveView: (view: View) => void;
}

interface CorporateChallenge {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  reward_min: number;
  reward_max: number;
  challenge_type: string;
  affiliated_by: string | null;
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
  status: string;
  rewards: string;
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
  status: string;
};

type Announcement = {
  id: string;
  title: string;
  message: string;
  type: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
}

const sampleFaqs = [
  {
    question: "Who is eligible to participate?",
    answer: "This challenge is open to all registered startups, students, and innovators who meet the criteria specified in the 'Who Can Participate' section."
  },
  {
    question: "Can I submit as a team?",
    answer: "Yes, you can submit as an individual or form a team of up to 5 members. Make sure to list all team members after the submission process in your dashboard."
  },
  {
    question: "What is the format for submission?",
    answer: "Submissions should include a detailed description of your solution, key features, benefits, and an implementation plan. You can also attach supporting documents (PDF/DOCX)."
  },
  {
    question: "How will the winners be selected?",
    answer: "Winners will be selected based on innovation, feasibility, impact, and alignment with the challenge problem statement. A panel of experts will review all submissions."
  },
  {
    question: "Can I update my submission after submitting?",
    answer: "Yes, you may revise your submission until the official deadline. After the cutoff time, no further edits or resubmissions will be allowed. Ensure your final version is complete and accurate."
  },
  {
    question: "Will participants receive feedback?",
    answer: "Feedback may be provided depending on reviewer availability. While detailed comments are not guaranteed, participants often receive summary insights. Additional guidance may be shared during review phases."
  },
  {
    question: "Are there any restrictions on solution type?",
    answer: "Solutions must align with the challenge theme and follow the provided guidelines. Both technical and non-technical solutions are welcome. Any content violating safety or legal standards will be disqualified."
  },
  {
    question: "How will I know if my submission was received?",
    answer: "Once submitted, you will receive a confirmation email with your submission ID. You can also verify it in your dashboard at any time. If you don’t receive confirmation, contact support."
  },
  {
    question: "What happens if the deadline is extended?",
    answer: "If the deadline changes, all registered participants will be notified immediately. The updated schedule will appear on the challenge page. Submissions will be accepted until the new cutoff date."
  },
  {
    question: "Will my submission remain confidential?",
    answer: "All submissions are kept secure and used only for evaluation purposes. Sensitive information will not be shared publicly without permission."
  }
];


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
  const [scrolled, setScrolled] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [collaborationId, setCollaborationId] = useState<string>("")
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState<string | null>(null);
  const [isFetchingAnnouncements, setIsFetchingAnnouncements] = useState(false);
  const handleScrollCapture = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrolled(el.scrollTop > 0);
  };

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

  const fetchAnnouncements = useCallback(async () => {
    if (!challenge?.id) return;

    setIsFetchingAnnouncements(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements/${challenge.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setIsFetchingAnnouncements(false);
    }
  }, [challenge?.id]);

  useEffect(() => {
    fetchAnnouncements();
  }, [challenge, fetchAnnouncements]);

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setIsAnnouncementDialogOpen(true);
  };

  const handleDeleteAnnouncement = async () => {
    if (!deleteAnnouncementId) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/announcements/${deleteAnnouncementId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.ok) {
        toast({
          title: "Announcement Deleted",
          description: "The announcement has been removed.",
        });
        fetchAnnouncements();
        setDeleteAnnouncementId(null);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete announcement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting announcement", error);
      toast({
        title: "Error",
        description: "An error occurred while deleting.",
        variant: "destructive",
      });
    }
  };

  const handleAnnouncementDialogClose = (open: boolean) => {
    setIsAnnouncementDialogOpen(open);
    if (!open) {
      setEditingAnnouncement(null);
    }
  };


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

  const winners = filtered.filter(item => item.status === "winner");
  const scored = filtered.filter(item => item.points > 0 && item.status !== "winner");
  const zeroPoints = filtered.filter(item => item.points === 0 && item.status !== "winner");


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
              src={challenge.logo_url || "https://api.hustloop.com/static/images/building.png"}
              alt={`${challenge.company_name} logo`}
              width={80}
              height={80}
              className="rounded-lg"
            />
            <div>

              <DialogTitle className="text-3xl font-bold font-headline text-left">
                {challenge.company_name}
              </DialogTitle>
              <div className="text-left flex flex-col gap-2">
                <DialogDescription className="line-clamp-3">
                  {challenge.company_description}
                </DialogDescription>
                <p className="text-sm text-muted-foreground">A challenge by {challenge.company_name} {challenge.affiliated_by && <span className="text-muted-foreground font-bold">(Affiliated By {challenge.affiliated_by})</span>}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="summary" className="w-full px-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-fit">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="announcement">
              <span className="flex items-center gap-2">
                Announcements
                {announcements && announcements.length >= 0 && (
                  <span className="inline-flex items-center justify-center h-5 w-5 font-semibold rounded-full bg-primary text-primary-foreground">
                    {announcements.length}
                  </span>
                )}
              </span>
            </TabsTrigger>
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

                          {challenge.status === "expired" && (
                            <p className="text-sm leading-relaxed mb-2">
                              Explore other challenges to continue showcasing your skills.
                            </p>
                          )}


                          <p className="text-sm leading-relaxed mb-4">
                            If you have any questions, please reach out to support or email us at
                            <a href="mailto:support@hustloop.com" className="font-semibold underline ml-1">
                              support[@]hustloop.com
                            </a>
                          </p>

                          {challenge.stop_date && (
                            <p className="text-xs font-semibold text-red-700">
                              Stopped on {new Date(challenge.stop_date).toLocaleString()}
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
                    <div className='md:mr-8 md:mt-8'>
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
                          {new Date(challenge.end_date).toLocaleDateString()}
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

                  <div className="text-center rounded-lg my-12 py-10">

                    {
                      isChallengeExpiredOrStopped ? (
                        <div className="w-full text-left bg-red-100 border-l-8 border-red-600 p-5 rounded text-red-900 shadow-sm">
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

                              {challenge.status === "expired" && (
                                <p className="text-sm leading-relaxed mb-2">
                                  Explore other challenges to continue showcasing your skills.
                                </p>
                              )}


                              <p className="text-sm leading-relaxed mb-4">
                                If you have any questions, please reach out to support or email us at
                                <a href="mailto:support@hustloop.com" className="font-semibold underline ml-1">
                                  support[@]hustloop.com
                                </a>
                              </p>

                              {challenge.stop_date && (
                                <p className="text-xs font-semibold text-red-700">
                                  Stopped on {new Date(challenge.stop_date).toLocaleString()}
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
                          {isChallengeExpiredOrStopped ? (
                            <div />
                          ) : isOtherUsers ? (
                            <div className="flex gap-4 w-full justify-center">
                              <Button disabled className="bg-gray-400 cursor-not-allowed">
                                Not Allowed
                              </Button>
                            </div>
                          ) : isAllowedFounder || isLoggedIn ? (
                            <Button
                              size="lg"
                              className="bg-accent hover:bg-accent/90 text-accent-foreground"
                              onClick={() => handleApplyClick(challenge.id)}
                              disabled={isDisabled}
                            >
                              <Rocket className="mr-2 h-5 w-5" />
                              Solve This Challenge
                            </Button>
                          ) : (
                            <div className="flex gap-4 w-full justify-center mt-4">
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
              <Card className="p-4 min-h-[400px]">
                <div className="mb-8 text-left m-3">
                  <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Clock className="h-8 w-8" />
                    Challenge Timeline
                  </h2>
                  <p className="text-muted-foreground">
                    Track the progress of the challenge from start to finish.
                  </p>
                </div>

                <CardContent className="flex flex-col items-center mt-6">

                  {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Access Required</h3>
                      <p className="max-w-xs text-sm">
                        Please log in to view the challenge timeline.
                      </p>
                    </div>
                  ) : (
                    <>
                      {events ? (
                        <VerticalTimeline timeline={events} />
                      ) : (
                        <div className="space-y-6 w-full">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                {i < 3 && <Skeleton className="w-0.5 h-16 mt-2" />}
                              </div>
                              <div className="flex-1 space-y-2 pb-8">
                                <Skeleton className="h-6 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                </CardContent>
              </Card>
            </TabsContent>


            <TabsContent value="announcement">
              <Card className="border shadow-sm p-4 min-h-[400px]">
                <div className="mb-8 text-left m-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <MessageSquare className="h-8 w-8" />
                        Announcements
                      </h2>
                      <p className="text-muted-foreground">
                        Updates and important information for this challenge.
                      </p>
                    </div>
                    {localStorage.getItem("userRole") === "admin" && (
                      <Button
                        size="sm"
                        className="w-full md:w-auto"
                        onClick={() => {
                          setCollaborationId(challenge.id)
                          setIsAnnouncementDialogOpen(true);
                        }}
                      >
                        + Create Announcement
                      </Button>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 pt-0">
                  {!isLoggedIn ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Lock className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">Access Required</h3>
                      <p className="max-w-xs text-sm">Please log in to view announcements.</p>
                    </div>
                  ) : isFetchingAnnouncements ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="p-5">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-5/6" />
                        </Card>
                      ))}
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
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                                    {a.type === "alert" && <span className="text-red-500">⚠️</span>}
                                    {a.type === "update" && <span className="text-blue-500">📢</span>}
                                    {a.type === "deadline" && <span className="text-orange-500">⏳</span>}
                                    {a.type === "result" && <span className="text-green-500">🏆</span>}
                                    {a.type === "general" && <span className="text-primary">📝</span>}
                                    {a.title}
                                  </h3>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs capitalize px-3 py-1 rounded-full"
                                  >
                                    {a.type}
                                  </Badge>

                                  {a.createdBy && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-3 py-1 rounded-full"
                                    >
                                      {a.createdBy}
                                    </Badge>
                                  )}

                                  {localStorage.getItem("userRole") === "admin" && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onClick={() => handleEditAnnouncement(a)}
                                        >
                                          <Pencil className="h-4 w-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="cursor-pointer text-destructive"
                                          onClick={() => setDeleteAnnouncementId(a.id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  )}
                                </div>
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


            <TabsContent value="hof" >
              <Card className="border shadow-sm p-4 min-h-[400px]">
                <div className="mb-8 text-left m-3">
                  <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Trophy className="h-8 w-8" />
                    Hall of Fame
                  </h2>
                  <p className="text-muted-foreground">
                    Celebrating the top innovators and contributors
                  </p>
                </div>

                {!isLoggedIn ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Access Required</h3>
                    <p className="max-w-xs text-sm">Please log in to view the Hall of Fame and see who&apos;s leading the challenge.</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* 1️⃣ Winner Podium Section */}
                    {winners.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 via-amber-500/5 to-yellow-500/10 blur-3xl -z-10" />
                        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                          {winners.map((item, index) => (
                            <div
                              key={index}
                              className="relative group w-full max-w-sm"
                            >
                              <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
                              <div className="relative flex flex-col items-center p-6 bg-card rounded-xl border border-yellow-200/50 dark:border-yellow-900/50 shadow-xl">
                                <div className="absolute -top-5">
                                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-4 py-1 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
                                    <Trophy className="h-4 w-4" />
                                    WINNER
                                  </div>
                                </div>

                                <div
                                  className="h-24 w-24 rounded-full border-4 border-yellow-100 dark:border-yellow-900/30 flex items-center justify-center text-3xl font-bold text-white shadow-inner mb-4 mt-4"
                                  style={(() => {
                                    const name = item.contactName || "?";
                                    const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                                    const color1 = `hsl(${hash % 360}, 70%, 50%)`;
                                    const color2 = `hsl(${(hash + 120) % 360}, 70%, 50%)`;
                                    return { background: `linear-gradient(135deg, ${color1}, ${color2})` };
                                  })()}
                                >
                                  {item.contactName ? item.contactName.charAt(0).toUpperCase() : "?"}
                                </div>

                                <h3 className="text-xl font-bold text-center mb-1">{item.contactName}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{item.state}</p>

                                <div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/10 px-4 py-2 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-bold text-yellow-700 dark:text-yellow-400">{item.points} Points</span>

                                </div>
                                <span className="font-bold text-yellow-700 dark:text-yellow-400 mt-4">₹ {item.rewards} has been Rewarded</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2️⃣ Leaderboard Section */}
                    {scored.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Medal className="h-5 w-5 text-primary" />
                          Top Performers
                        </h3>
                        <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                  <TableHead className="w-[100px]">Rank</TableHead>
                                  <TableHead>Participant</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {scored.map((item, index) => (
                                  <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium text-muted-foreground">
                                      #{index + 1 + winners.length}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="h-9 w-9 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-sm"
                                          style={(() => {
                                            const name = item.contactName || "?";
                                            const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                                            const color1 = `hsl(${hash % 360}, 70%, 50%)`;
                                            const color2 = `hsl(${(hash + 120) % 360}, 70%, 50%)`;
                                            return { background: `linear-gradient(135deg, ${color1}, ${color2})` };
                                          })()}
                                        >
                                          {item.contactName ? item.contactName.charAt(0).toUpperCase() : "?"}
                                        </div>
                                        <span className="font-medium">{item.contactName}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="font-normal">
                                        {item.state}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                      {item.points}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </Card>
                      </div>
                    )}

                    {/* 3️⃣ Participants Grid */}
                    {zeroPoints.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          All Participants
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                          {zeroPoints.map((item, index) => (
                            <div
                              key={index}
                              className="group flex flex-col items-center p-4 rounded-xl border bg-card/30 hover:bg-card hover:shadow-md transition-all duration-300"
                            >
                              <div
                                className="h-12 w-12 rounded-full mb-3 text-white flex items-center justify-center text-lg font-bold shadow-sm group-hover:scale-110 transition-transform duration-300"
                                style={(() => {
                                  const name = item.contactName || "?";
                                  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
                                  const color1 = `hsl(${hash % 360}, 70%, 50%)`;
                                  const color2 = `hsl(${(hash + 120) % 360}, 70%, 50%)`;
                                  return { background: `linear-gradient(135deg, ${color1}, ${color2})` };
                                })()}
                              >
                                {item.contactName ? item.contactName.charAt(0).toUpperCase() : "?"}
                              </div>
                              <p className="font-semibold text-sm text-center line-clamp-1 w-full">{item.contactName}</p>
                              <p className="text-xs text-muted-foreground mt-1">{item.state}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {winners.length === 0 && scored.length === 0 && zeroPoints.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                        <h3 className="text-lg font-semibold text-foreground">No Participants Yet</h3>
                        <p className="max-w-xs text-sm">
                          No participants have joined this challenge yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="q/a">
              {!isLoggedIn ? (
                <Card className="border shadow-sm p-4 min-h-[400px]">
                  <div className="mb-8 text-left m-3">
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                      <HelpCircle className="h-8 w-8" />
                      Q/A Forum
                    </h2>
                    <p className="text-muted-foreground">
                      Ask questions and collaborate with others on this challenge.
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Lock className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Access Required</h3>
                    <p className="max-w-xs text-sm">Please log in to view the Q/A forum.</p>
                  </div>
                  <CardContent>
                  </CardContent>
                </Card>
              ) : (
                <QAForum collaborationId={challenge?.id} isExpired={isChallengeExpiredOrStopped} />
              )}
            </TabsContent>

            <TabsContent value="faq">
              <Card className="border shadow-sm p-4 min-h-[400px]">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <HelpCircle className="h-8 w-8" />
                    FAQ
                  </h2>
                  <p className="text-muted-foreground">
                    Answer to your questions about this challenge.
                  </p>
                </div>
                <CardContent >
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full md:w-[95%] mx-auto"
                  >
                    {sampleFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className='text-left hover:no-underline'>{faq.question}</AccordionTrigger>
                        <AccordionContent className='leading-relaxed'>
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                </CardContent>
              </Card>
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
              <div className={`space-y-3 ${!scrolledToEnd ? 'text-muted-foreground' : 'text-current'}`}>
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
                <p>
                  By checking the box below, you acknowledge that you have read and agree to these
                  terms.
                </p>
              </div>


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
              className={`text-sm ${!scrolledToEnd ? 'text-muted-foreground' : 'text-current'}`}
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
      <AnnouncementDialog
        open={isAnnouncementDialogOpen}
        onOpenChange={handleAnnouncementDialogClose}
        collaborationId={collaborationId}
        editingAnnouncement={editingAnnouncement}
        onAnnouncementCreated={fetchAnnouncements}
      />

      <AlertDialog open={!!deleteAnnouncementId} onOpenChange={(open) => !open && setDeleteAnnouncementId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this announcement?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAnnouncement}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog >
  );
}