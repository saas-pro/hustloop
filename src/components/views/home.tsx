import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/layout/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, Briefcase, Handshake, BookOpen, Network, Rocket, Wrench, Package, Award, Target, CheckCircle, Send, Gift, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { View } from "@/app/types";

const services = [
  {
    title: "Mentorship Programs",
    description: "Connect with experienced industry leaders who provide personalized guidance and insights to help you navigate challenges and accelerate growth.",
    icon: <Users className="h-8 w-8 text-primary" />,
  },
  {
    title: "Incubation Support",
    description: "Access state-of-the-art facilities, technical resources, and expert guidance through our network of leading incubators.",
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
  },
  {
    title: "Business Development",
    description: "Get comprehensive support in strategy, market research, financial planning, and operational excellence.",
    icon: <Briefcase className="h-8 w-8 text-primary" />,
  },
  {
    title: "MSME Partnerships",
    description: "Collaborate with established MSMEs for market access, technology transfer, and scaling opportunities.",
    icon: <Handshake className="h-8 w-8 text-primary" />,
  },
  {
    title: "Educational Resources",
    description: "Access workshops, webinars, and learning materials designed to enhance your entrepreneurial skills.",
    icon: <BookOpen className="h-8 w-8 text-primary" />,
  },
  {
    title: "Networking Events",
    description: "Join exclusive events and connect with fellow entrepreneurs, investors, and industry experts.",
    icon: <Network className="h-8 w-8 text-primary" />,
  },
];

type Path = 'incubation' | 'marketSolution' | 'partnership';

const pathsData = {
  incubation: {
    steps: [
      { title: "Entrepreneur", description: "Start Your Journey", icon: <Rocket />, side: 'left' },
      { title: "Innovative Idea", description: "Submit Your Concept", icon: <Lightbulb />, side: 'right' },
      { title: "Incubation Support", description: "Expert Guidance & Resources", icon: <Wrench />, side: 'left' },
      { title: "MVP Development", description: "Build & Test Your Solution", icon: <Package />, side: 'right' },
      { title: "Success", description: "Graduate", icon: <Award />, side: 'left', isFinal: true },
    ]
  },
  marketSolution: {
    steps: [
      { title: "Entrepreneur", description: "Identify Market Problem", icon: <Target />, side: 'left' },
      { title: "Innovative Solution", description: "Develop Your Answer", icon: <CheckCircle />, side: 'right' },
      { title: "Submit to MSMEs", description: "Direct Solution Delivery", icon: <Send />, side: 'left' },
      { title: "Reward Recognition", description: "Solution Impact & Visibility", icon: <Gift />, side: 'right', isFinal: true },
    ]
  },
  partnership: {
    steps: [
      { title: "Entrepreneur", description: "Connect with MSMEs", icon: <Users />, side: 'left' },
      { title: "Joint Innovation", description: "Collaborative Solution", icon: <Handshake />, side: 'right' },
      { title: "Scale-Up Scope", description: "Submit for Evaluation", icon: <TrendingUp />, side: 'left' },
      { title: "Partnership Opportunity", description: "Long-term Collaboration", icon: <Briefcase />, side: 'right', isFinal: true },
    ]
  }
};

const additionalBenefits = [
  { name: "Expert Mentorship", icon: <Users /> },
  { name: "Market Access", icon: <Briefcase /> },
  { name: "Technical Support", icon: <Wrench /> },
  { name: "Networking", icon: <Network /> },
  { name: "Resources", icon: <BookOpen /> },
  { name: "Business Development", icon: <TrendingUp /> },
  { name: "Growth Support", icon: <Rocket /> },
];

const PathTimeline = ({ steps }: { steps: typeof pathsData.incubation.steps }) => {
  return (
    <div className="relative mt-16 px-4">
      {/* Vertical line for desktop */}
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-border -translate-x-1/2 hidden md:block"></div>

      {steps.map((step, index) => (
        <div key={index} className="relative mb-12 md:mb-0">
          {/* Dot */}
          <div className="hidden md:block absolute left-1/2 top-9 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-background z-10"></div>
          
          <div className={cn(
            "md:flex items-center",
            step.side === 'left' ? 'md:flex-row-reverse' : 'md:flex-row'
          )}>
            <div className="md:w-1/2"></div>
            <div className="md:w-1/2 md:px-8 py-4">
              <Card className={cn(
                "p-4 bg-card/70 backdrop-blur-sm border-border/50",
                step.isFinal && "bg-yellow-400/20 border-yellow-500"
              )}>
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
}

export default function HomeView({ setActiveView }: HomeViewProps) {
  const [activePath, setActivePath] = useState<Path>('incubation');

  return (
    <div className="relative w-full h-full overflow-y-auto">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-4">
        
        <section className="text-center py-24 md:py-32">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline tracking-tight">
            Empowering Tomorrow's Innovators
          </h1>
          <p className="max-w-4xl mx-auto text-lg md:text-xl text-muted-foreground mb-12">
            At Nexus Platform, we bridge the gap between innovative ideas and successful businesses. Our platform connects entrepreneurs with industry-leading mentors, cutting-edge incubators, and established MSMEs to foster growth and innovation in the startup ecosystem.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">Get Started Now</Button>
        </section>

        <section className="py-24 grid md:grid-cols-3 gap-16 text-center">
          <div>
            <h3 className="text-3xl font-bold mb-4 font-headline">Our Mission</h3>
            <p className="text-muted-foreground">
              To empower entrepreneurs by providing them with the resources, guidance, and connections they need to transform their innovative ideas into successful ventures.
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4 font-headline">Our Vision</h3>
            <p className="text-muted-foreground">
              To create a thriving ecosystem where startups, MSMEs, and incubators collaborate seamlessly to drive innovation and economic growth.
            </p>
          </div>
          <div>
            <h3 className="text-3xl font-bold mb-4 font-headline">Our Values</h3>
            <p className="text-muted-foreground">
              Innovation, collaboration, integrity, and excellence guide everything we do as we help shape the future of entrepreneurship.
            </p>
          </div>
        </section>

        <section className="py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Our Services</h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-16">
            We offer comprehensive support to help entrepreneurs at every stage of their journey, from ideation to scaling their business.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {services.map((service) => (
              <Card key={service.title} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-card/75 transition-all">
                <CardHeader className="flex flex-row items-center gap-4 p-4">
                  {service.icon}
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        
        <section className="py-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Choose Your Path to Success</h2>
          <div className="flex justify-center gap-2 mt-8">
            <Button variant={activePath === 'incubation' ? 'default' : 'outline'} onClick={() => setActivePath('incubation')}>Incubation Path</Button>
            <Button variant={activePath === 'marketSolution' ? 'default' : 'outline'} onClick={() => setActivePath('marketSolution')}>Market Solution Path</Button>
            <Button variant={activePath === 'partnership' ? 'default' : 'outline'} onClick={() => setActivePath('partnership')}>Partnership Path</Button>
          </div>
          
          <PathTimeline steps={pathsData[activePath].steps} />

          <h3 className="text-2xl font-bold mt-24 mb-8 font-headline">Additional Benefits Across All Paths</h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {additionalBenefits.map((benefit) => (
                  <Card key={benefit.name} className="p-3 bg-card/50 backdrop-blur-sm border-border/50 flex items-center gap-2">
                      {React.cloneElement(benefit.icon, { className: "h-5 w-5 text-primary"})}
                      <span className="text-sm font-medium">{benefit.name}</span>
                  </Card>
              ))}
          </div>
        </section>
        
        <section className="py-24 text-center bg-card/50 rounded-lg mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Ready to Build the Future?</h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
            Join Nexus Platform today and let's turn your vision into reality. Contact us to get started.
          </p>
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveView('contact')}>Contact Us</Button>
        </section>

      </div>
    </div>
  );
}
