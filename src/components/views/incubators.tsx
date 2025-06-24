"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import IncubatorDetails from "./incubator-details";

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

export const incubators: Incubator[] = [
  {
    name: "TechStars Bangalore",
    image: "https://placehold.co/600x400.png",
    hint: "science lab",
    location: "Bangalore, India",
    rating: 5,
    reviews: 128,
    description: "Premier startup accelerator focused on technology innovation and entrepreneurship.",
    metrics: {
      startups: "150+",
      funding: "$5M",
      successRate: "85%",
    },
    focus: ["SaaS", "IoT", "Deep Tech"],
    details: {
      overview: "TechStars Bangalore is a world-class accelerator program that helps entrepreneurs build great companies. We provide funding, mentorship, and access to a global network of investors and corporate partners.",
      services: [
        { title: "Mentorship", description: "One-on-one guidance from industry experts to help navigate your startup journey." },
        { title: "Business Development", description: "Access to a network of potential customers and partners to grow your business." },
        { title: "Technical Support", description: "Resources and expertise to refine your products and ensure market readiness." },
        { title: "Funding Access", description: "Opportunities for direct investment and connections to potential investors." },
        { title: "Workspace", description: "Modern coworking space with high-speed internet, meeting rooms, and collaboration areas." },
        { title: "VC Network", description: "Direct connections to leading venture capital firms and investment opportunities." },
        { title: "Angel Network", description: "Access to a curated network of angel investors interested in early-stage startups." },
        { title: "Startup School", description: "Structured learning programs and workshops to enhance entrepreneurial skills." }
      ],
      benefits: [
        "$120,000 investment in exchange for 6% equity",
        "Access to TechStars' global network of mentors and investors",
        "Workspace in Bangalore's tech hub",
        "Demo Day presentation to investors",
        "Lifetime access to TechStars resources"
      ],
      eligibility: {
          focusAreas: "SaaS and Enterprise Software: B2B solutions, cloud platforms, AI/ML applications. IoT and Hardware: Smart devices, industrial IoT, connected solutions. Product Innovation: Consumer tech, marketplace platforms, mobile applications. Deep Tech: Blockchain, quantum computing, robotics.",
          requirements: [
            "Minimum Viable Product (MVP) with early customer validation",
            "Founding team with technical expertise and business acumen",
            "Intellectual property or unique technological advantage"
          ]
      },
      timeline: [
        { event: "Application Period", period: "January - March" },
        { event: "Interviews", period: "April" },
        { event: "Program Start", period: "June" },
        { event: "Demo Day", period: "September" }
      ]
    }
  },
  {
    name: "EcoInnovate Hub",
    image: "https://placehold.co/600x400.png",
    hint: "green technology",
    location: "Chennai, India",
    rating: 4,
    reviews: 98,
    description: "Fostering startups that are building a sustainable and green future.",
    metrics: {
      startups: "80+",
      funding: "$2.5M",
      successRate: "88%",
    },
    focus: ["MedTech", "BioTech", "Digital Health"],
    details: { 
      overview: "EcoInnovate Hub is dedicated to supporting startups in the high-growth healthcare and biotech sectors. We provide the specialized resources, clinical networks, and regulatory guidance to help you navigate the complexities of medical innovation and make a global impact.",
      services: [
        { title: "Clinical Mentorship", description: "Guidance from experienced healthcare professionals and medical experts." },
        { title: "Lab Access", description: "State-of-the-art laboratory facilities for medical research and testing." },
        { title: "Regulatory Support", description: "Expert guidance on FDA approvals, CE marking, and healthcare compliance." },
        { title: "Hospital Network", description: "Direct access to leading hospitals for pilots and clinical trials." },
        { title: "Bio Workspace", description: "Specialized facilities with wet labs and research equipment." },
        { title: "Healthcare VC Network", description: "Connections to venture funds specializing in healthcare investments." },
        { title: "MedTech Angels", description: "Network of angel investors with healthcare industry expertise." },
        { title: "BioTech Academy", description: "Specialized training in healthcare innovation and entrepreneurship." }
      ],
      benefits: [ 
        "Seed funding up to $150,000.",
        "Access to certified wet labs and advanced research equipment.",
        "Fast-track pilot programs within our partner hospital network.",
        "Comprehensive support for navigating medical device and drug regulations."
      ],
      eligibility: {
          focusAreas: "MedTech, BioTech, Digital Health, and other healthcare-related fields.",
          requirements: [ 
            "A strong scientific foundation with preliminary research data or a working prototype.",
            "A clear understanding of the clinical need and market potential.",
            "A founding team with relevant scientific, medical, or technical expertise."
          ]
      },
      timeline: [
        { event: "Rolling Applications Open", period: "All year round" },
        { event: "Quarterly Review Cycles", period: "March, June, September, December" },
        { event: "Program Duration", period: "12-18 months" },
        { event: "Clinical Trial Support Phase", period: "Post-program" }
      ]
    }
  },
  {
    name: "Creative Spark Collective",
    image: "https://placehold.co/600x400.png",
    hint: "art studio",
    location: "Mumbai, India",
    rating: 5,
    reviews: 110,
    description: "An incubator for the next generation of storytellers and digital artists.",
    metrics: {
      startups: "120+",
      funding: "$1.8M",
      successRate: "90%",
    },
    focus: ["Creative Tech", "Media", "Digital Arts"],
    details: { 
      overview: "Creative Spark Collective is where art meets technology. We are an incubator dedicated to empowering the next generation of digital artists, filmmakers, and creative technologists. We help you launch and scale your ventures in the dynamic media landscape.",
      services: [
        { title: "Production Support", description: "Access to professional-grade studios, cameras, and editing equipment." },
        { title: "Distribution Network", description: "Partnerships with leading media platforms and streaming services for content distribution." },
        { title: "Creative Mentorship", description: "Guidance from award-winning artists, directors, and media executives." },
        { title: "Legal & IP Guidance", description: "Specialized legal support for intellectual property, copyrights, and licensing." },
        { title: "Co-working & Studio Space", description: "Collaborative workspaces and dedicated studio facilities for creative projects." },
        { title: "Investor Connections", description: "Access to investors and funds that specialize in the creative and media industries." }
      ],
      benefits: [ 
        "Seed funding for creative and media-tech projects.",
        "Opportunities to showcase work at major international film and art festivals.",
        "Collaboration opportunities with established artists and production houses.",
        "Distribution deals for promising projects."
      ],
      eligibility: {
          focusAreas: "Digital Media, Interactive Art, VR/AR Experiences, Filmmaking, Animation, and Gaming.",
          requirements: [
            "A compelling portfolio, script, or a proof-of-concept for your creative project.",
            "A passionate team with a blend of creative vision and technical execution skills.",
            "A unique artistic voice or innovative use of technology in storytelling."
          ]
      },
      timeline: [
        { event: "Spring & Fall Applications", period: "Feb-Apr & Aug-Oct" },
        { event: "Residency Program", period: "6-month cohorts" },
        { event: "Final Showcase Event", period: "End of each residency" },
        { event: "Alumni Network Access", period: "Ongoing" }
      ]
    }
  },
];


interface IncubatorsViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function IncubatorsView({ isOpen, onOpenChange, isLoggedIn, hasSubscription }: IncubatorsViewProps) {
  const [selectedIncubator, setSelectedIncubator] = useState<Incubator | null>(null);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center font-headline">Startup Incubation Hub</DialogTitle>
            <DialogDescription className="text-center">
              <span style={{ color: '#D4AF37' }}>"You Dream It. We Help Build It."</span>
              <br />
              Connect with leading incubators that provide the resources, mentorship, and ecosystem you need to transform your innovative ideas into successful ventures.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full mt-4">
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 pr-6">
              {incubators.map((incubator, index) => {
                return (
                  <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                    <CardHeader className="p-0">
                      <Image src={incubator.image} alt={incubator.name} width={600} height={400} className="w-full h-48 object-cover" data-ai-hint={incubator.hint}/>
                    </CardHeader>
                    <CardContent className="flex-grow p-4 space-y-3">
                      <CardTitle className="text-xl">{incubator.name}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < incubator.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`} />
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
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setSelectedIncubator(incubator)}>
                        View Details
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
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
