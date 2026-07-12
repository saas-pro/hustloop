"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Lock, Terminal, X, Bookmark, Download, ChevronLeft, ChevronRight, Check } from "lucide-react";
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';
import StartupSubmissionForm from "./startup-submission-form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthContext";

export type Incubator = {
  id: string;
  name: string;
  image: string;
  hint: string;
  state: string;
  city: string;
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
  startups?: any[];
  user_id?: string;
  is_owner?: boolean;
};

interface IncubatorsViewProps {
  isLoggedIn: boolean;
  isAuthChecking?: boolean;
  hasSubscription: boolean;
  setActiveView: (view: View) => void;
  onBack?: () => void;
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
  <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
    {[...Array(3)].map((_, index) => (
      <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden w-full">
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-4">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default function IncubatorsView({ isLoggedIn, isAuthChecking = false, hasSubscription, setActiveView, onBack }: IncubatorsViewProps) {
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  const { toast } = useToast();
  const [incubators, setIncubators] = useState<Incubator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowAccess, setAllowAccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isSubmitIdeaOpen, setIsSubmitIdeaOpen] = useState(false);
  const [selectedIncubatorId, setSelectedIncubatorId] = useState<string | null>(null);
  const [submittedIncubators, setSubmittedIncubators] = useState<string[]>([]);
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
  const { userRole, founderRole } = useAuth();

  useEffect(() => {
    if (userRole === 'founder' && founderRole === 'Submit an innovative idea') {
      const fetchSubmittedIncubators = async () => {
        if (!isLoggedIn) {
          setSubmittedIncubators([]);
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
          const res = await fetch(`${API_BASE_URL}/api/founder-ideas/submitted-incubators`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setSubmittedIncubators(data.submitted_incubator_ids || []);
          }
        } catch {
          // silently ignore – user may not be a founder
        }
      };
      fetchSubmittedIncubators();
    }
  }, [isLoggedIn, founderRole, userRole]);

  useEffect(() => {
    const fromMarketplace = localStorage.getItem("fromMarketplace");
    if (fromMarketplace === "true") {
      setAllowAccess(true);
      localStorage.removeItem("fromMarketplace");
    }
  }, []);

  useEffect(() => {
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
        setIncubators([]);
        setError("Could not load incubators at this time.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchIncubators();
  }, [isLoggedIn]);

  const totalPages = Math.ceil(incubators.length / itemsPerPage);
  const paginatedIncubators = incubators.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // const handleDownloadPDF = (incubator: Incubator) => {
  //   const doc = new jsPDF();
  //   const logoUrl = '/logo.png';
  //   const img = new window.Image();
  //   img.src = logoUrl;
  //   img.onload = () => {
  //     doc.addImage(img, 'PNG', 14, 10, 30, 10);
  //     generatePDFContent(doc, incubator);
  //   };
  //   img.onerror = () => {
  //     generatePDFContent(doc, incubator);
  //   };
  // };

  const generatePDFContent = (doc: jsPDF, incubator: Incubator) => {
    let yPos = 30;
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(incubator.name, 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    if (incubator.rating !== undefined && incubator.rating !== null && incubator.rating > 0) {
      doc.text(`Rating: ${incubator.rating}`, 14, yPos);
      yPos += 6;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const locationStr = incubator.city || incubator.state ? `${incubator.city || ''}${incubator.city && incubator.state ? ", " : ""}${incubator.state || ''}` : 'Unknown';
    doc.text(`${locationStr} • ${(incubator.type || []).join(", ")}`, 14, yPos);
    yPos += 12;

    if (incubator.description) {
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const splitText = doc.splitTextToSize(incubator.description, 180);
      doc.text(splitText, 14, yPos);
      yPos += (splitText.length * 5) + 10;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Information', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Email: ${incubator.contactEmail || "N/A"}`, 14, yPos);
    yPos += 5;
    doc.text(`Phone: ${incubator.contactPhone || "N/A"}`, 14, yPos);
    yPos += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Metrics Overview', 14, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const m = incubator.metrics || {};
    doc.text(`Startups Supported: ${m.startupsSupported || "0"}`, 14, yPos);
    yPos += 5;
    doc.text(`Funded Startups: ${m.fundedStartupsPercent || "0%"}`, 14, yPos);
    yPos += 5;
    doc.text(`Startups Outside Location: ${m.startupsOutsideLocationPercent || "0%"}`, 14, yPos);
    yPos += 5;
    doc.text(`Total Funding Raised: ${(m.totalFundingRaised || "0").replace('₹', 'Rs. ')}`, 14, yPos);
    yPos += 10;

    if (incubator.focus && incubator.focus.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Focus Areas', 14, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const focusText = doc.splitTextToSize(incubator.focus.join(", "), 180);
      doc.text(focusText, 14, yPos);
      yPos += (focusText.length * 5) + 5;
    }

    if (incubator.partners && incubator.partners.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recognised and Funded by', 14, yPos);
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const partnerText = doc.splitTextToSize(incubator.partners.join(", "), 180);
      doc.text(partnerText, 14, yPos);
      yPos += (partnerText.length * 5) + 5;
    }

    if (incubator.startups && incubator.startups.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Startups Supported Detailed', 14, yPos);
      yPos += 4;
      const tableData = incubator.startups.map((s: any) => [
        s.name || '-',
        s.city || '-',
        s.founded_year || '-',
        (s.sector || []).join(', '),
        s.is_funded ? 'Yes' : 'No',
        s.funding_raised ? `Rs. ${s.funding_raised}` : '-'
      ]);
      autoTable(doc, {
        startY: yPos,
        head: [['Startup Name', 'City', 'Founded Year', 'Sectors', 'Funded?', 'Funding Raised']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });
    }

    doc.save(`${incubator.name.replace(/\s+/g, '_')}_Profile.pdf`);
    toast({ title: 'Success', description: 'PDF generated successfully!' });
  };

  if (isLoading || isAuthChecking) {
    return <LoadingSkeleton />;
  }


  if (error) {
    return (
      <Alert variant="destructive" className="max-w-5xl mx-auto">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Error Fetching Incubators</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex-grow w-full flex flex-col p-0 max-w-6xl mx-auto px-4 md:px-6 mb-16 pt-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-primary/5 p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary">Innovate & Connect</h2>
          <p className="text-muted-foreground mt-2 max-w-lg font-medium leading-relaxed">
            Have a groundbreaking idea? Submit it to our admin team. Once reviewed, we&apos;ll match you with the best incubator to help bring your vision to life.
          </p>

        </div>
        <div className="relative w-28 h-28 md:w-36 md:h-36 border rounded-full z-10 hidden sm:block">
          <Image
            src="/hustloop_logo.png"
            alt="Hustloop Logo"
            fill
            className="object-contain rounded-lg"
          />
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {paginatedIncubators.map((incubator) => (
          <Card key={incubator.id} className="flex flex-col bg-card border-border/60 shadow-lg hover:shadow-xl transition-shadow w-full rounded-xl overflow-hidden">
            <CardContent className="p-6 md:p-8 space-y-8">

              {/* Header Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="flex gap-6 items-start">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 bg-white rounded-lg border flex items-center justify-center overflow-hidden p-2">
                    {incubator.image ? (
                      <Image
                        src={incubator.image || '/icons/corporate-incu.png'}
                        alt={incubator.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <span className="text-3xl font-black text-muted-foreground">{incubator.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold font-headline leading-tight">{incubator.name}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      {(incubator.type?.length > 0 ? incubator.type : ['Incubator']).map((type, idx) => (
                        <Badge key={idx} variant="secondary" className={`uppercase tracking-widest text-[10px] font-semibold border-none px-3 ${type.toLowerCase() === 'accelerator' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                          {type}
                        </Badge>
                      ))}
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                        <MapPin className="h-4 w-4" />
                        <span>{incubator.city}{incubator.city && incubator.state ? ", " : ""}{incubator.state}</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground pt-1">
                      {incubator.contactEmail && (
                        <div className="flex items-center gap-2">
                          <span className="truncate max-w-[200px]">✉ {incubator.contactEmail}</span>
                        </div>
                      )}
                      {incubator.contactPhone && (
                        <div className="flex items-center gap-2">
                          <span>📞 {incubator.contactPhone}</span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex items-center gap-3 mt-auto">
                    {/* <Button variant="outline" size="icon" className="text-primary border-primary/20 hover:bg-primary/10" onClick={() => handleDownloadPDF(incubator)}>
                      <Download className="h-4 w-4" />
                    </Button> */}
                    {(() => {
                      const isEligibleRole = (userRole === 'founder' && founderRole === 'Submit an innovative idea') || userRole === 'admin';

                      const hasSubmitted = submittedIncubators.includes(incubator.id);

                      let buttonDisabled = false;
                      let tooltipText = "";

                      if (isLoggedIn) {
                        if (hasSubmitted) {
                          buttonDisabled = true;
                          tooltipText = "You have already submitted an idea to this incubator.";
                        } else if (!isEligibleRole) {
                          buttonDisabled = true;
                          tooltipText = "Only founders submitting an innovative idea can apply.";
                        }
                      }

                      return (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="inline-block">
                                <Button
                                  className={`font-semibold gap-2 ${buttonDisabled ? 'bg-gray-400 text-white cursor-not-allowed pointer-events-none' : 'bg-[#4a00e0] hover:bg-[#3a00b0] text-white'}`}
                                  disabled={buttonDisabled}
                                  onClick={(e) => {
                                    if (buttonDisabled) {
                                      e.preventDefault();
                                      return;
                                    }
                                    if (!isLoggedIn) {
                                      setActiveView('login');
                                      return;
                                    }
                                    setSelectedIncubatorId(incubator.id);
                                    setIsSubmitIdeaOpen(true);
                                  }}
                                >
                                  <span>💡</span> {hasSubmitted ? "Already Submitted" : "Submit your idea"}
                                </Button>
                              </div>
                            </TooltipTrigger>
                            {buttonDisabled && (
                              <TooltipContent>
                                <p>{tooltipText}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Metrics Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border/50">
                <div className="text-center md:text-left space-y-1">
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-2xl font-bold">{incubator.metrics.startupsSupported || "0"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Key Startups Supported</p>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-2xl font-bold">{incubator.metrics.fundedStartupsPercent || "0%"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Funded Startups</p>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-2xl font-bold">{incubator.metrics.startupsOutsideLocationPercent || "0%"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Startups outside {incubator.city || 'Location'}</p>
                </div>
                <div className="text-center md:text-left space-y-1">
                  <div className="flex items-baseline justify-center md:justify-start gap-1">
                    <span className="text-2xl font-bold">{incubator.metrics.totalFundingRaised || "₹0"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total funding raised</p>
                </div>
              </div>

              {/* Description */}
              <div className="text-sm text-foreground/90 leading-relaxed font-medium">
                {incubator.description}
              </div>

              {/* Public Links */}
              {incubator.socialLinks && Object.values(incubator.socialLinks).some(Boolean) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Public Links</h4>
                  <div className="flex flex-wrap gap-3">
                    {incubator.socialLinks.website && (
                      <a href={incubator.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                        <FaGlobe className="text-gray-500" /> Website
                      </a>
                    )}
                    {incubator.socialLinks.linkedin && (
                      <a href={incubator.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                        <FaLinkedin className="text-blue-600" /> LinkedIn
                      </a>
                    )}
                    {incubator.socialLinks.facebook && (
                      <a href={incubator.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                        <FaFacebook className="text-blue-500" /> Facebook
                      </a>
                    )}
                    {incubator.socialLinks.instagram && (
                      <a href={incubator.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                        <FaInstagram className="text-pink-600" /> Instagram
                      </a>
                    )}
                    {incubator.socialLinks.youtube && (
                      <a href={incubator.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                        <FaYoutube className="text-red-600" /> Youtube
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Prominent Startups Supported */}
              {(incubator.startups && incubator.startups.length > 0) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-foreground">Prominent Startups Supported</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 items-start">
                    {incubator.startups.map((startup: any, idx: number) => {
                      const sId = `${incubator.id}-startup-${idx}`;
                      const isExpanded = selectedStartupId === sId;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col rounded-xl border bg-background/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden ${isExpanded ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''}`}
                        >
                          <div
                            onClick={() => setSelectedStartupId(isExpanded ? null : sId)}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                              {startup.name.charAt(0)}
                            </div>
                            <div className="flex flex-col overflow-hidden text-left flex-grow">
                              <span className="text-sm font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">{startup.name}</span>
                              <span className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
                                {startup.city ? `${startup.city} • ` : ''}{(startup.sector || []).join(', ')}
                              </span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 pt-0 mt-2 border-t border-border/50 bg-muted/20 animate-in slide-in-from-top-2 fade-in-20">
                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Founded</span>
                                  <p className="text-sm font-bold text-foreground/90">{startup.founded_year || '-'}</p>
                                </div>
                                {
                                  startup.funding_raised ? (
                                    <div className="space-y-1.5">
                                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Funding Raised</span>
                                      <p className="text-sm font-bold text-foreground/90">₹
                                        {startup.funding_raised.toLocaleString()}</p>
                                    </div>
                                  ) : null
                                }
                                <div className="space-y-1.5">
                                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Funded</span>
                                  <div>
                                    {startup.is_funded ? (
                                      <Badge variant="secondary" className="bg-muted-foreground/15 text-foreground hover:bg-muted-foreground/25 border-none px-3 py-0.5 rounded-full font-bold">Yes</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-muted-foreground/10 text-muted-foreground border-none px-3 py-0.5 rounded-full font-bold hover:bg-muted-foreground/20">No</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {startup.sector && startup.sector.length > 0 && (
                                <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                  <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sectors</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {startup.sector.map((sec: string, i: number) => (
                                      <Badge key={i} variant="outline" className="bg-background rounded-full px-3 py-0.5 text-[10px] border-border/60 shadow-sm">{sec}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Key Focus Areas */}
              {incubator.focus && incubator.focus.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Key Focus Areas of supported Startups</h4>
                  <div className="flex flex-wrap gap-2">
                    {incubator.focus.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-muted text-foreground/80 font-medium px-4 py-1.5 border hover:bg-muted/80">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutions Financing */}
              {incubator.partners && incubator.partners.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-foreground">Institutions Financing the supported Startups</h4>
                  <div className="flex flex-wrap gap-2">
                    {incubator.partners.map((partner, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-muted flex items-center gap-2 px-3 py-1.5 border text-xs font-medium text-foreground/80">
                        <span className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[8px] font-bold">{partner.charAt(0)}</span>
                        {partner}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="rounded-full w-8 h-8 hover:bg-muted"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                className={`w-8 h-8 rounded-full ${currentPage === i + 1 ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="rounded-full w-8 h-8 hover:bg-muted"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      <StartupSubmissionForm
        open={isSubmitIdeaOpen}
        onOpenChange={setIsSubmitIdeaOpen}
        selectedIncubatorId={selectedIncubatorId}
        onSuccess={(incubatorId) => {
          // Add the newly submitted incubator to the local list immediately
          // (no need to re-fetch – incubatorId is already known)
          setSubmittedIncubators((prev) => [...prev, incubatorId]);
        }}
      />
    </div>
  );
}
