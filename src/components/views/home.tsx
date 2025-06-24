import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/layout/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lightbulb, Briefcase, Handshake, BookOpen, Network, Rocket, Wrench, Package, Award, Target, CheckCircle, Send, Gift, TrendingUp, Eye, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { View } from "@/app/types";

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
    icon: <Handshake className="h-10 w-10 text-primary" />,
  },
  {
    title: "Educational Resources",
    description: "Access workshops, webinars, and learning materials designed to enhance your entrepreneurial skills.",
    icon: <BookOpen className="h-10 w-10 text-primary" />,
  },
  {
    title: "Networking Events",
    description: "Join exclusive events and connect with fellow entrepreneurs, investors, and industry experts.",
    icon: <Network className="h-10 w-10 text-primary" />,
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
                "p-4 bg-card/70 backdrop-blur-sm border-border/50 max-w-md",
                step.side === 'left' && "md:ml-auto",
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
  theme: 'light' | 'dark';
}

export default function HomeView({ setActiveView, theme }: HomeViewProps) {
  const [activePath, setActivePath] = useState<Path>('incubation');

  return (
    <div className="relative w-full h-full overflow-y-auto">
      {theme === 'dark' && <AnimatedBackground />}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="text-center py-24 md:py-32 container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-headline tracking-tight">
            Empowering Tomorrow's Innovators
          </h1>
          <p className="max-w-4xl mx-auto text-lg md:text-xl text-muted-foreground mb-12">
            Nexus Platform is your launchpad for success. We connect visionary entrepreneurs with elite mentors, top-tier incubators, and strategic MSME partners to fuel innovation and accelerate growth.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => setActiveView('signup')}>Join a Thriving Ecosystem</Button>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-background/50 backdrop-blur-sm">
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
        <section className="py-24 container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Why Choose Nexus?</h2>
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
        <section className="py-24 bg-background/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Choose Your Path to Success</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-12">
              Whether you need incubation, a market for your solution, or a strategic partnership, we have a tailored path for you.
            </p>
            <div className="flex justify-center gap-2 mt-8">
              <Button size="lg" variant={activePath === 'incubation' ? 'default' : 'outline'} onClick={() => setActivePath('incubation')}>Incubation</Button>
              <Button size="lg" variant={activePath === 'marketSolution' ? 'default' : 'outline'} onClick={() => setActivePath('marketSolution')}>Market Solution</Button>
              <Button size="lg" variant={activePath === 'partnership' ? 'default' : 'outline'} onClick={() => setActivePath('partnership')}>Partnership</Button>
            </div>
            
            <PathTimeline steps={pathsData[activePath].steps} />

            <h3 className="text-2xl font-bold mt-24 mb-8 font-headline">Benefits Across All Paths</h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {additionalBenefits.map((benefit) => (
                    <Card key={benefit.name} className="p-3 bg-card/70 backdrop-blur-sm border-border/50 flex items-center gap-2">
                        {React.cloneElement(benefit.icon, { className: "h-5 w-5 text-primary"})}
                        <span className="text-sm font-medium">{benefit.name}</span>
                    </Card>
                ))}
            </div>
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-24 container mx-auto px-4">
          <div className="bg-card/50 rounded-lg p-12 text-center border border-primary/50 shadow-lg shadow-primary/10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-headline">Ready to Build the Future?</h2>
            <p className="max-w-3xl mx-auto text-lg text-muted-foreground mb-8">
              Join Nexus Platform today and let's turn your vision into reality. Your journey to success starts here.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveView('contact')}>Contact Us Today</Button>
          </div>
        </section>

      </div>
    </div>
  );
}
