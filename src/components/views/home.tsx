"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Lightbulb, Briefcase, Handshake, BookOpen, Building2, Wrench, Package, Award, Target, CheckCircle, Send, Gift, TrendingUp, Eye, ShieldCheck, Workflow } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { View } from "@/app/types";
import Image from "next/image";

const services = [
  {
    title: "Mentorship Programs",
    description: "Connect with experienced industry leaders who provide personalized guidance and insights to help you navigate challenges and accelerate growth.",
    icon: <Users className="h-10 w-10 text-primary" />,
  },
  {
    title: "Incubation Support",
    description: "Access state-of-the-art facilities, technical resources, and expert guidance through our network of leading incubators.",
    icon: <Lightbulb className="h-10 w-10 text-primary" />,
  },
  {
    title: "Business Development",
    description: "Get comprehensive support in strategy, market research, financial planning, and operational excellence.",
    icon: <Briefcase className="h-10 w-10 text-primary" />,
  },
  {
    title: "MSME Partnerships",
    description: "Collaborate with established MSMEs for market access, technology transfer, and scaling opportunities.",
    icon: <Building2 className="h-10 w-10 text-primary" />,
  },
  {
    title: "Educational Resources",
    description: "Access workshops, webinars, and learning materials designed to enhance your entrepreneurial skills.",
    icon: <BookOpen className="h-10 w-10 text-primary" />,
  },
  {
    title: "Networking Events",
    description: "Join exclusive events and connect with fellow entrepreneurs, investors, and industry experts.",
    icon: <Handshake className="h-10 w-10 text-primary" />,
  },
];

const whyChooseUs = [
  {
    title: "Our Mission",
    description: "To empower entrepreneurs by providing the resources, guidance, and connections they need to transform innovative ideas into successful ventures.",
    icon: <Target className="h-10 w-10 text-primary" />,
  },
  {
    title: "Our Vision",
    description: "To create a thriving ecosystem where startups, MSMEs, and incubators collaborate seamlessly to drive innovation and economic growth.",
    icon: <Eye className="h-10 w-10 text-primary" />,
  },
  {
    title: "Our Values",
    description: "Innovation, collaboration, integrity, and excellence guide everything we do as we help shape the future of entrepreneurship.",
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
  },
];


type Path = 'incubation' | 'marketSolution' | 'partnership';

const pathsData = {
  incubation: {
    steps: [
      { title: "Entrepreneur", description: "Start Your Journey", icon: <User className="h-6 w-6" />, side: 'left' },
      { title: "Innovative Idea", description: "Submit Your Concept", icon: <Lightbulb />, side: 'right' },
      { title: "Incubation Support", description: "Expert Guidance & Resources", icon: <Wrench />, side: 'left' },
      { title: "MVP Development", description: "Build & Test Your Solution", icon: <Package />, side: 'right' },
      { title: "Success", description: "Graduate", icon: <Award />, side: 'left', isFinal: true },
    ]
  },
  marketSolution: {
    steps: [
      { title: "Entrepreneur", description: "Identify Market Problem", icon: <User />, side: 'left' },
      { title: "Innovative Solution", description: "Develop Your Answer", icon: <CheckCircle />, side: 'right' },
      { title: "Submit to MSMEs", description: "Direct Solution Delivery", icon: <Send />, side: 'left' },
      { title: "Reward Recognition", description: "Solution Impact & Visibility", icon: <Gift />, side: 'right', isFinal: true },
    ]
  },
  partnership: {
    steps: [
      { title: "Entrepreneur", description: "Connect with MSMEs", icon: <User />, side: 'left' },
      { title: "Joint Innovation", description: "Collaborative Solution", icon: <Handshake />, side: 'right' },
      { title: "Scale-Up Scope", description: "Submit for Evaluation", icon: <TrendingUp />, side: 'left' },
      { title: "Partnership Opportunity", description: "Long-term Collaboration", icon: <Briefcase />, side: 'right', isFinal: true },
    ]
  }
};

const groupedBenefits = [
  {
    title: "Growth Ecosystem",
    description: "Access a rich network of resources and connections designed for rapid growth.",
    icon: <Workflow />,
    items: ["Expert Mentorship", "Peer Networking", "Resource Library"],
  },
  {
    title: "Business Acceleration",
    description: "Get the strategic support you need to develop your business and access new markets.",
    icon: <TrendingUp />,
    items: ["Market Access", "Strategic Development", "Scale-Up Support"],
  },
  {
    title: "Founder Support",
    description: "We provide the essential backing and guidance to help you succeed.",
    icon: <ShieldCheck />,
    items: ["Technical Guidance", "Funding Opportunities", "Dedicated Support"],
  },
];

const PathTimeline = ({ steps }: { steps: typeof pathsData.incubation.steps }) => {
  return (
    <div className="relative mt-16 md:px-4">
      {/* Vertical line for all screens, but positioned differently */}
      <div className="absolute top-0 left-6 md:left-1/2 w-0.5 h-full bg-border -translate-x-1/2"></div>

      {steps.map((step, index) => (
        <div key={index} className="relative mb-8 md:mb-0">
          {/* Dot for all screens, positioned differently */}
          <div className="absolute left-6 md:left-1/2 top-9 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10"></div>
          
          <div className={cn(
            "flex items-center",
            step.side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
          )}>
            <div className="md:w-1/2"></div> {/* Spacer for desktop */}
            <div className="w-full pl-12 pr-4 md:w-1/2 md:px-8 py-4">
              <Card 
                className={cn(
                  "p-4 bg-card/70 backdrop-blur-sm border-border/50 max-w-md w-full scroll-anim",
                  step.side === 'left' && "md:ml-auto",
                  step.isFinal && "bg-yellow-400/20 border-yellow-500"
                )} 
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={cn("flex items-center gap-4", step.side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row')}>
                  <div className="bg-primary p-3 rounded-full text-primary-foreground shrink-0">
                    {React.cloneElement(step.icon, { className: 'h-6 w-6' })}
                  </div>
                  <div className={cn("flex-grow", step.side === 'left' ? 'text-left md:text-right' : 'text-left')}>
                    <h4 className="font-bold text-lg">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};


interface HomeViewProps {
  setActiveView: (view: View) => void;
  theme: 'light' | 'dark' | null;
  isLoggedIn: boolean;
}

export default function HomeView({ setActiveView, theme, isLoggedIn }: HomeViewProps) {
  const [activePath, setActivePath] = useState<Path>('incubation');

  return (
    <div className="relative w-full h-full overflow-y-auto">
      <div className="absolute inset-0 z-0 overflow-hidden bg-background"></div>
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline tracking-tight">
                        Empowering Tomorrow's Innovators
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-12">
                        <strong className="font-headline" style={{ color: '#D4AF37' }}>Hustloop</strong> is your launchpad for success. We connect visionary entrepreneurs with elite mentors, top-tier incubators, and strategic MSME partners to fuel innovation and accelerate growth.
                    </p>
                    {isLoggedIn ? (
                        <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setActiveView('dashboard')}>Explore Dashboard</Button>
                    ) : (
                        <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setActiveView('signup')}>Join a Thriving Ecosystem</Button>
                    )}
                </div>
                <div className="hidden md:block">
                    <Image 
                        src="https://placehold.co/800x600.png"
                        width={800}
                        height={600}
                        alt="A team of innovators collaborating"
                        className="rounded-xl shadow-lg"
                        data-ai-hint="collaboration team"
                    />
                </div>
            </div>
        </section>

        {/* Services Section */}
        <section className="py-24 md:py-32 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">What We Offer</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-16">
              A comprehensive suite of services designed to support you at every stage of your entrepreneurial journey.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
              {services.map((service) => (
                <Card key={service.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-card/75 transition-all">
                  <CardHeader className="flex flex-row items-center gap-4 p-6">
                    {service.icon}
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-24 md:py-32 container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Why Choose hustloop?</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-16">
              We are founded on a clear mission, guided by a bold vision, and committed to core values that drive success.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-2 font-headline">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Path to Success Section */}
        <section className="py-24 md:py-32 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Choose Your Path to Success</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
              Whether you need incubation, a market for your solution, or a strategic partnership, we have a tailored path for you.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-8">
              <Button size="lg" variant={activePath === 'incubation' ? 'default' : 'outline'} onClick={() => setActivePath('incubation')}>Incubation</Button>
              <Button size="lg" variant={activePath === 'marketSolution' ? 'default' : 'outline'} onClick={() => setActivePath('marketSolution')}>Market Solution</Button>
              <Button size="lg" variant={activePath === 'partnership' ? 'default' : 'outline'} onClick={() => setActivePath('partnership')}>Partnership</Button>
            </div>
            
            <PathTimeline key={activePath} steps={pathsData[activePath].steps} />

            <h3 className="text-2xl font-bold mt-24 mb-8 font-headline">Benefits Across All Paths</h3>
             <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {groupedBenefits.map((group) => (
                    <Card key={group.title} className="p-6 bg-card/70 backdrop-blur-sm border-border/50 text-center">
                        <div className="flex justify-center mb-4">
                            {React.cloneElement(group.icon, { className: "h-10 w-10 text-primary"})}
                        </div>
                        <h4 className="text-xl font-bold mb-2">{group.title}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{group.description}</p>
                        <ul className="space-y-2 text-sm text-left">
                            {group.items.map((item) => (
                                <li key={item} className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                ))}
            </div>
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-24 md:py-32 container mx-auto px-4">
          <div className="bg-card/50 rounded-lg p-12 text-center border border-primary/50 shadow-lg shadow-primary/10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Ready to Build the Future?</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
              Join hustloop today and let's turn your vision into reality. Your journey to success starts here.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveView('contact')}>Contact Us Today</Button>
          </div>
        </section>

      </div>
    </div>
  );
}
