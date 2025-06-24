
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, Linkedin, CalendarPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import MentorBookingModal from "@/components/views/mentor-booking-modal";

export type Mentor = {
  name: string;
  avatar: string;
  hint: string;
  title: string;
  expertise: string[];
  bio: string;
  rating: number;
  socials: {
    x: string;
    linkedin: string;
  };
  hourlyRate: string;
  availability: Record<string, string[]>;
};

const mentors: Mentor[] = [
  {
    name: "Dr. Evelyn Reed",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman portrait",
    title: "Ph.D. in AI, Ex-Googler",
    expertise: ["AI/ML", "Product Strategy", "Growth Hacking"],
    bio: "Dr. Evelyn Reed is a seasoned AI researcher and product strategist with over 15 years of experience at the forefront of technological innovation. After a distinguished career at Google, where she led several high-impact AI projects, Evelyn now dedicates her time to mentoring early-stage startups, helping them navigate the complexities of product-market fit and scalable growth.",
    rating: 5,
    socials: {
      x: "#",
      linkedin: "#",
    },
    hourlyRate: "₹8,000",
    availability: {
        "2024-08-05": ["10:00 AM", "11:00 AM", "02:00 PM"],
        "2024-08-06": ["09:00 AM", "03:00 PM"],
        "2024-08-08": ["10:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"],
    }
  },
  {
    name: "Marcus Chen",
    avatar: "https://placehold.co/100x100.png",
    hint: "man portrait",
    title: "Serial Entrepreneur, Fintech Expert",
    expertise: ["Fintech", "Blockchain", "Venture Capital"],
    bio: "Marcus Chen has successfully built and exited three fintech companies. His expertise lies in decentralized finance, blockchain technology, and navigating the venture capital landscape. Marcus offers invaluable insights into fundraising, financial modeling, and building resilient business models in the competitive fintech space.",
    rating: 4,
    socials: {
      x: "#",
      linkedin: "#",
    },
    hourlyRate: "₹10,000",
    availability: {
        "2024-08-05": ["01:00 PM", "02:00 PM"],
        "2024-08-07": ["10:00 AM", "11:00 AM", "12:00 PM"],
        "2024-08-09": ["02:00 PM", "03:00 PM", "04:00 PM"],
    }
  },
  {
    name: "Aisha Khan",
    avatar: "https://placehold.co/100x100.png",
    hint: "woman face",
    title: "Marketing Guru, Brand Specialist",
    expertise: ["Branding", "Digital Marketing", "Storytelling"],
    bio: "Aisha Khan is a branding virtuoso who has crafted compelling narratives for numerous Fortune 500 companies. Her approach combines data-driven digital marketing with powerful storytelling to build brands that resonate deeply with customers. She helps startups define their voice, build a loyal community, and create a lasting market presence.",
    rating: 5,
    socials: {
      x: "#",
      linkedin: "#",
    },
    hourlyRate: "₹7,500",
    availability: {
        "2024-08-06": ["10:00 AM", "02:00 PM", "03:00 PM"],
        "2024-08-07": ["09:00 AM", "11:00 AM"],
        "2024-08-08": ["01:00 PM", "02:00 PM"],
    }
  },
];

interface MentorsViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
  hasUsedFreeSession: boolean;
  onBookingSuccess: (mentorName: string, date: Date, time: string) => void;
}

export default function MentorsView({ isOpen, onOpenChange, isLoggedIn, hasSubscription, hasUsedFreeSession, onBookingSuccess }: MentorsViewProps) {
  const [bookingMentor, setBookingMentor] = useState<Mentor | null>(null);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center font-headline">Meet Our Expert Mentors</DialogTitle>
            <DialogDescription className="text-center">Learn from industry veterans who have been there and done that. Get guidance to transform your startup journey.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full mt-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mentors.map((mentor, index) => {
                return (
                  <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex-row gap-4 items-center">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={mentor.avatar} alt={mentor.name} data-ai-hint={mentor.hint}/>
                        <AvatarFallback>{mentor.name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <CardTitle>{mentor.name}</CardTitle>
                        <CardDescription>{mentor.title}</CardDescription>
                      </div>
                      <div className="flex gap-2 text-muted-foreground self-start">
                          <a href={mentor.socials.x} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153Zm-1.653 19.57h2.608L6.856 2.597H4.062l13.185 18.126Z"/></svg>
                          </a>
                          <a href={mentor.socials.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary"><Linkedin className="h-5 w-5" /></a>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < mentor.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
                                />
                            ))}
                        </div>
                        <span className="text-muted-foreground text-sm">({mentor.rating}.0)</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                          {mentor.expertise.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {mentor.bio}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => setBookingMentor(mentor)}>
                          <CalendarPlus className="mr-2 h-4 w-4" />
                          Schedule Meeting
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <MentorBookingModal 
        mentor={bookingMentor}
        onOpenChange={(isOpen) => !isOpen && setBookingMentor(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
        hasUsedFreeSession={hasUsedFreeSession}
        onBookingSuccess={onBookingSuccess}
      />
    </>
  );
}
