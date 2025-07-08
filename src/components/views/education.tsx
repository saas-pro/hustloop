
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    BookOpen, 
    BrainCircuit,
    RadioTower,
    Users,
    Workflow,
    Briefcase,
    Lightbulb,
    Wrench,
    PenTool,
    TrendingUp,
    Search,
    Award,
    CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import EducationBookingModal from "./education-booking-modal";
import type { View } from "@/app/types";

export type Session = {
    language: string;
    date: string;
    time: string;
};

export type Program = {
    title: string;
    sessions: Session[];
    description: string;
    features: {
        name: string;
        icon: React.ReactNode;
    }[];
};

const acceleratorPrograms: Program[] = [
    {
      title: "Startup Accelerator Program",
      sessions: [
        { language: "Tamil", date: "15 JULY", time: "11:00 AM" },
        { language: "English", date: "16 JULY", time: "4:30 PM" },
      ],
      description: "An intensive 8-week program designed to help early-stage startups validate their business model, refine their product strategy, and prepare for scaling. Learn directly from successful entrepreneurs and industry experts.",
      features: [
        { name: "Live Interactive Sessions", icon: <RadioTower className="h-5 w-5 text-primary" /> },
        { name: "1-on-1 Mentoring", icon: <Users className="h-5 w-5 text-primary" /> },
        { name: "Networking Opportunities", icon: <Workflow className="h-5 w-5 text-primary" /> },
        { name: "Real Project Work", icon: <Briefcase className="h-5 w-5 text-primary" /> },
      ],
    },
    {
      title: "AI for Business Leaders",
      sessions: [
        { language: "English", date: "22 JULY", time: "10:00 AM" },
        { language: "English", date: "29 JULY", time: "10:00 AM" },
      ],
      description: "This 2-day workshop provides a comprehensive overview of AI technologies and their practical applications in business. Understand how to leverage AI for competitive advantage, operational efficiency, and product innovation. No technical background required.",
      features: [
        { name: "Expert-Led Workshops", icon: <BrainCircuit className="h-5 w-5 text-primary" /> },
        { name: "Case Study Analysis", icon: <BookOpen className="h-5 w-5 text-primary" /> },
        { name: "Strategy Sessions", icon: <Lightbulb className="h-5 w-5 text-primary" /> },
        { name: "Implementation Roadmap", icon: <Wrench className="h-5 w-5 text-primary" /> },
      ],
    },
    {
      title: "Digital Marketing Bootcamp",
      sessions: [
        { language: "English", date: "5 AUG", time: "9:00 AM - 5:00 PM" },
      ],
      description: "A one-day intensive bootcamp covering the entire digital marketing ecosystem. From SEO and SEM to social media marketing and content strategy, gain the skills to effectively promote your brand online and drive customer acquisition.",
      features: [
        { name: "Hands-On Training", icon: <PenTool className="h-5 w-5 text-primary" /> },
        { name: "Google & Meta Ads", icon: <TrendingUp className="h-5 w-5 text-primary" /> },
        { name: "SEO Masterclass", icon: <Search className="h-5 w-5 text-primary" /> },
        { name: "Certification", icon: <Award className="h-5 w-5 text-primary" /> },
      ],
    },
];

interface EducationViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onApplicationSuccess: (programTitle: string, session: Session) => void;
  isLoggedIn: boolean;
  setActiveView: (view: View) => void;
  appliedPrograms: Record<string, string>;
}

export default function EducationView({ isOpen, onOpenChange, onApplicationSuccess, isLoggedIn, setActiveView, appliedPrograms }: EducationViewProps) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleApplyClick = (program: Program) => {
    if (isLoggedIn) {
      setSelectedProgram(program);
    } else {
      setActiveView('signup');
    }
  };
  
  return (
    <>
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center font-headline">Transform Your Future Through Education</DialogTitle>
          <DialogDescription className="text-center">
            <span style={{ color: '#facc15' }}>"Knowledge is the Currency of Tomorrow"</span>
            <span className="block mt-2">
              Join our comprehensive educational programs designed to empower entrepreneurs and business leaders with cutting-edge skills and insights.
            </span>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full mt-4">
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-bold font-headline mb-6">Featured Programs</h2>
                    <div className="space-y-8">
                        {acceleratorPrograms.map((program, index) => {
                            const isApplied = !!appliedPrograms[program.title];
                            return (
                                <Card key={index} className="bg-card/50 backdrop-blur-sm border border-primary/30 hover:border-primary transition-colors">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{program.title}</CardTitle>
                                            <Badge>Free</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="md:flex">
                                            <div className="md:w-1/3 mb-6 md:mb-0 md:pr-6">
                                                <h4 className="font-semibold text-sm mb-2 text-muted-foreground">NEXT SESSIONS</h4>
                                                <div className="space-y-3">
                                                {program.sessions.map((session, sIndex) => (
                                                    <div key={sIndex} className="text-sm p-3 rounded-md bg-muted/50 border">
                                                        <p className="font-bold">{session.language}</p>
                                                        <p className="text-muted-foreground">{session.date}, {session.time}</p>
                                                    </div>
                                                ))}
                                                </div>
                                            </div>
                                            <div className="md:w-2/3 md:pl-6 border-muted-foreground/20 md:border-l">
                                                <p className="text-muted-foreground mb-4">{program.description}</p>
                                                <ul className="grid grid-cols-2 gap-4 text-sm">
                                                    {program.features.map((feature, fIndex) => (
                                                    <li key={fIndex} className="flex items-center gap-2">
                                                        {feature.icon}
                                                        <span>{feature.name}</span>
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button 
                                          onClick={() => handleApplyClick(program)} 
                                          className="w-full md:w-auto ml-auto bg-accent hover:bg-accent/90 text-accent-foreground disabled:bg-green-500 disabled:opacity-100"
                                          disabled={isApplied}
                                        >
                                          {isApplied ? (
                                              <>
                                                  <CheckCircle className="mr-2 h-4 w-4" /> Applied
                                              </>
                                          ) : "Apply Now"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                </section>
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
    <EducationBookingModal
        program={selectedProgram}
        onOpenChange={() => setSelectedProgram(null)}
        onApplicationSuccess={onApplicationSuccess}
    />
    </>
  );
}
