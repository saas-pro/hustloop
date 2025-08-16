"use client";
import GlowingText from "@/components/ui/GlowingText";
import { FloatingIcon } from "../ui/floating-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Briefcase, PlayCircle, Star, Award, CheckCircle, GraduationCap, Hexagon, FolderCheck, ArrowRight, Group, Library, TrendingUp, GitBranch, Scaling, Wrench, CircleDollarSign, Handshake, Search, Rocket, Target, Users, Megaphone, Gauge, BrainCircuit, BarChart, ShieldCheck, Heart, BookOpen, Building, Loader2, Send, Linkedin, Mail, Eye, Code, Settings, User, Contact } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import * as React from "react";
import type { View } from "@/app/types";
import Footer from "../layout/footer";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { IconCard } from "@/components/ui/icon-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UnderlineEffect from "@/components/ui/underline-effect";
import { useRef } from "react";
import HighlightEffect from "@/components/ui/highlight-effect";
import BannerImage from "../ui/BannerImage";
import HanddrawnUnderline from "@/components/ui/handdrawn-underline";
import { Separator } from "@radix-ui/react-separator";
import { useRouter } from "next/navigation";


const contactFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string({ required_error: "Please select a subject." }),
  message: z.string().min(10, "Message must be at least 10 characters.").max(500, "Message must not exceed 500 characters."),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;




const marqueeTabsRow1 = [
  { text: "Venture Capital", icon: <CircleDollarSign className="h-4 w-4 text-green-500" /> },
  { text: "Product-Market Fit" },
  { text: "Seed Funding" },
  { text: "Expert Mentorship", icon: <Users className="h-4 w-4 text-purple-500" /> },
  { text: "Go-to-Market Strategy" },
  { text: "Angel Investors" },
];
const marqueeTabsRow2 = [
  { text: "Growth Hacking" },
  { text: "Pitch Deck Review", icon: <Megaphone className="h-4 w-4" /> },
  { text: "Technical Co-founder" },
  { text: "Agile Development" },
  { text: "Lean Startup" },
];
const marqueeTabsRow3 = [
  { text: "Business Model Canvas" },
  { text: "User Acquisition" },
  { text: "KPIs & Metrics", icon: <Gauge className="h-4 w-4" /> },
  { text: "AI & Machine Learning" },
  { text: "Networking Events", icon: <Handshake className="h-4 w-4 text-blue-500" /> },
];


interface HomeViewProps {
  setActiveView: (view: View) => void;
  isLoggedIn: boolean;
  navOpen?: boolean;
}

const dynamicHeroStates = [
  {
    stage: 'VALIDATE',
    icon: ShieldCheck,
    tags: ["Customer Interviews", "Market Viability", "Proof of Concept", "Feedback Loop"],
    users: [
      { image: "/images/woman writing.jpeg", hint: "woman writing" },
      { image: "/images/man discussing.jpeg", hint: "man discussing" }
    ]
  },
  {
    stage: 'PLAN',
    icon: FolderCheck,
    tags: ["Market Research", "Business Plan", "Financial Modeling", "Competitor Analysis"],
    users: [
      { image: "/images/smiling woman.jpeg", hint: "smiling woman" },
      { image: "/images/smiling man with glasses.jpeg", hint: "smiling man with glasses" }
    ]

  },
  {
    stage: 'BUILD',
    icon: Wrench,
    tags: ["MVP Development", "UI/UX Design", "Agile Sprints", "Beta Testing"],
    users: [
      { image: "/images/person thinking.jpeg", hint: "person thinking" },
      { image: "/images/woman professional.jpeg", hint: "woman professional" }
    ]
  },
  {
    stage: 'LAUNCH',
    icon: Rocket,
    tags: ["Go-to-Market", "User Acquisition", "Growth Hacking", "Pitch Deck"],
    users: [
      { image: "/images/man celebrating.jpeg", hint: "man celebrating" },
      { image: "/images/woman happy.jpeg", hint: "woman happy" }
    ]
  },
  {
    stage: 'SCALE',
    icon: TrendingUp,
    tags: ["Series A Funding", "International Expansion", "Hiring Key Roles", "Optimize Operations"],
    users: [
      { image: "/images/team meeting.jpeg", hint: "team meeting" },
      { image: "/images/ceo portrait.jpeg", hint: "ceo portrait" }
    ]
  }
];




const DynamicHeroSection = ({ isLoggedIn, setActiveView }: HomeViewProps) => {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStateIndex((prevIndex) => (prevIndex + 1) % dynamicHeroStates.length);
    }, 3500); // Change state every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  const { stage, icon: StageIcon, tags, users } = dynamicHeroStates[currentStateIndex];

  const logoPositions = [
    { top: '-4rem', left: '50%', transform: 'translateX(-50%)' }, // top center
    { top: '20%', left: 'calc(100% + 2rem)', transform: 'translateY(-50%)' }, // right middle
    { bottom: '-4rem', left: '50%', transform: 'translateX(-50%)' }, // bottom center
    { top: '20%', right: 'calc(100% + 2rem)', transform: 'translateY(-50%)' }, // left middle
    { top: '-2rem', right: '-2rem' }, // top right
  ];


  const floatingIcons = [
    {
      src: "/images/1.png",
      size: 50,
      top: 100,
      left: 50,
      delay: 0,
      duration: 4,
    },
    {
      src: "/images/5.png",
      size: 75,
      top: 200,
      right: 60,
      delay: 1,
      duration: 3,
    },
    {
      src: "/images/3.png",
      size: 60,
      bottom: 120,
      left: 80,
      delay: 0.5,
      duration: 3.5,
    },
    {
      src: "/images/4.png",
      size: 60,
      bottom: 80,
      right: 40,
      delay: 0.8,
      duration: 2.5,
    }
  ];
  const BrandLogo = ({ inSheet = false }: { inSheet?: boolean }) => {
    const router = useRouter();
    const handleLogoClick = () => {
      router.push("/");
    };
    return (
      <div
        className="flex justify-left items-center z-[1000] gap-2 relative top-5 left-4"
        onClick={handleLogoClick}
      >
        <Image
          src="/logo.png"
          alt="Hustloop logo"
          width={120}
          height={120}
          className=" w-auto min-w-[120px] max-w-[200px] h-12 md:h-16 object-contain cursor-pointer"
        />
        {!inSheet && (
          <div className=" flex items-center gap-2">
            <Separator orientation="vertical" className="h-8 bg-border w-0.5" />
            <p className="text-sm leading-0.5 text-muted-foreground ">
              Smart hustle. <br /> Infinite growth..
            </p>
          </div>
        )}
      </div>
    );
  };


  return (
    <section className="relative hidden-scroll z-[1000] h-screen md:h-[100vh] ">
      {/* Logo in top-right */}

      <BrandLogo></BrandLogo>

      {/* Particles Layer */}
      <div className="z-10 container mx-auto grid  gap-24 items-center h-screen justify-center px-4 py-16 md:py-20">
        {/* Left content */}
        <div className="text-center lg:text-center">
          <h1 className="text-5xl md:text-[90px] font-bold tracking-tight font-headline">
            Empowering Tomorrow&apos;s{' '}
            <br /><span className="relative inline-block text-primary">
              Innovators
              <svg
                className="absolute w-[80px] md:w-[146px] right-0 -bottom-[6px] md:-bottom-[8px] pointer-events-none"
                aria-hidden="true"
                role="presentation"
                viewBox="0 0 117 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.52643 7.99766C4.94183 5.69998 2.85228 3.68244 1 1.59863M109.77 14.3969C110.378 13.7416 110.937 13.0433 111.515 12.3608M68 9.00049C68.2139 6.63002 68.6547 4.31683 69 2.00049M17.8709 63.5527C15.6537 64.3763 13.7205 66.0614 11.7627 67.334M70 65.0005C70.3433 66.9512 70.6707 68.9328 71 71.0005M111.806 56.8633C113.335 57.5003 114.724 58.3876 116.169 59.1902"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl md:max-w-[50%] mx-auto">
            Hustloop is your launchpad for success. We connect visionary entrepreneurs with elite mentors, top-tier incubators, and strategic MSME partners to fuel innovation and accelerate growth.
          </p>
          {isLoggedIn ? (
            <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveView('dashboard')}>
              Explore Dashboard
            </Button>
          ) : (
            <Button size="lg" className="mt-8 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setActiveView('signup')}>
              Join a Thriving Ecosystem
            </Button>
          )}
        </div>

        {/* Right banner with floating icons */}
        {/* <div className="relative hidden lg:flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="bg-transparent flex items-center justify-center text-center z-10">
              
            </div>
          </div>

          <div className="absolute inset-0 pointer-events-none z-40"></div>
        </div> */}
      </div>
    </section>

  );
};


export default function HomeView({ setActiveView, isLoggedIn, navOpen }: HomeViewProps) {
  const { toast } = useToast();
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", message: "" },
  });



  const { formState: { isSubmitting: isContactSubmitting }, reset: resetContactForm } = contactForm;

  async function onContactSubmit(data: ContactFormValues) {
    console.log(data)
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });


      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you shortly.",
        });
        resetContactForm();
      } else {
        toast({
          variant: "destructive",
          title: "Submission Failed",
          description: result.error || "An unknown error occurred.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Could not connect to the server. Please try again later.",
      });
    }
  }


  const solutionSteps = {
    incubation: {
      title: 'Incubation Journey',
      steps: [
        { icon: Rocket, title: "Entrepreneur", description: "Start Your Journey with a Vision" },
        { icon: Lightbulb, title: "Innovative Idea", description: "Submit Your Groundbreaking Concept" },
        { icon: Briefcase, title: "Incubation Support", description: "Get Expert Guidance & Resources" },
        { icon: Award, title: "MVP Development", description: "Build, Test, and Refine Your Solution" },
        { icon: GraduationCap, title: "Success", description: "Graduate from the Program & Scale" },
      ]
    },
    'market-solution': {
      title: 'Market Solution Path',
      steps: [
        { icon: Search, title: "Market Analysis", description: "Identify Your Target Audience & Niche" },
        { icon: Target, title: "Product Validation", description: "Confirm Product-Market Fit with Real Users" },
        { icon: TrendingUp, title: "Go-to-Market", description: "Develop a Winning Launch Strategy" },
        { icon: Scaling, title: "Launch & Iterate", description: "Execute, Measure Your KPIs, and Adapt" },
        { icon: CircleDollarSign, title: "Scale & Grow", description: "Expand Your User Base and Revenue" },
      ]
    },
    partnership: {
      title: 'Partnership Roadmap',
      steps: [
        { icon: Handshake, title: "Partner Discovery", description: "Identify and Vet Strategic Partners" },
        { icon: BarChart, title: "Value Proposition", description: "Connect with MSMEs and Corporates" },
        { icon: Wrench, title: "Pilot Program", description: "Forge Pilot Projects to Prove Value" },
        { icon: GitBranch, title: "Integration", description: "Align Goals and Grow Together" },
        { icon: ShieldCheck, title: "Long-Term Synergy", description: "Achieve Mutual and Lasting Success" },
      ]
    },
  };

  const [activeSolution, setActiveSolution] = useState<keyof typeof solutionSteps>('incubation');

  const currentSteps = solutionSteps[activeSolution].steps;

  const whatWeOffer = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Mentorship Programs",
      description: "Connect with experienced industry leaders who provide personalized guidance and insights to help you navigate challenges and accelerate growth."
    },
    {
      icon: <Building className="h-8 w-8" />,
      title: "Incubation Support",
      description: "Access state-of-the-art facilities, technical resources, and expert guidance through our network of leading incubators."
    },
    {
      icon: <Handshake className="h-8 w-8" />,
      title: "MSME Partnerships",
      description: "Collaborate with established MSMEs for market access, technology transfer, and scaling opportunities."
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Educational Resources",
      description: "Access workshops, webinars, and learning materials designed to enhance your entrepreneurial skills."
    },
    {
      icon: <Group className="h-8 w-8" />,
      title: "Networking Events",
      description: "Join exclusive events and connect with fellow entrepreneurs, investors, and industry experts."
    }
  ];

  const [isPausedRow1, setPausedRow1] = useState(false);
  const [isPausedRow2, setPausedRow2] = useState(false);
  const [isPausedRow3, setPausedRow3] = useState(false);






  return (
    <div
      className={`absolute w-full h-screen bg-background text-foreground overflow-x-hidden ${navOpen ? "overflow-hidden" : ""
        }`}
    >
      <div className="z-10">

        {/* Hero Section */}
        <DynamicHeroSection setActiveView={setActiveView} isLoggedIn={isLoggedIn} />

        {/* Start Your Journey Section */}
        <section className="py-16 md:py-20 cursor-default">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12 font-headline">Start your <HighlightEffect> Journey </HighlightEffect></h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <Card className="group text-center p-6 flex flex-col items-center transition-all duration-75 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Rocket className="h-8 w-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">For Founders</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Launch your idea with expert guidance and resources.</p>
                </div>
                <Button className="bg-secondary text-secondary-foreground hover:text-primary-foreground dark:bg-input" onClick={() => setActiveView('incubators')}>Explore Incubators</Button>
              </Card>
              <Card className="group text-center p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Users className="h-8 w-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">For Mentors</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Guide the next generation of innovators and make an impact.</p>
                </div>
                <Button className="bg-secondary text-secondary-foreground hover:text-primary-foreground dark:bg-input" onClick={() => setActiveView('mentors')}>Become a Mentor</Button>
              </Card>
              <Card className="group text-center p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Building className="h-8 w-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">For Incubators</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Support startups and foster a culture of innovation.</p>
                </div>
                <Button className="bg-secondary text-secondary-foreground hover:text-primary-foreground dark:bg-input" onClick={() => setActiveView('incubators')}>Partner with Us</Button>
              </Card>
              <Card className="group text-center p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Handshake className="h-8 w-8" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">For MSMEs</h3>
                  <p className="text-muted-foreground mt-2 mb-4">Collaborate with startups for mutual growth and innovation.</p>
                </div>
                <Button className="bg-secondary text-secondary-foreground hover:text-primary-foreground dark:bg-input" onClick={() => setActiveView('msmes')}>Join as MSME</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="py-16 md:py-20 bg-muted/30 cursor-default">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 font-headline">What we offer</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-12">
              A comprehensive suite of services designed to support you at every stage of your entrepreneurial journey.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl m-auto">
              {/* First 3 items */}
              {whatWeOffer.slice(0,3).map((feature) => (
                <div key={feature.title} className="flex justify-center">
                  <IconCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    className="h-full"
                  />
                </div>
              ))}

              {/* Last 2 items centered in full-width row */}
              <div className="hidden md:flex md:col-span-3 justify-center gap-8 w-2/3 m-auto">
                {whatWeOffer.slice(3).map((feature) => (
                  <IconCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    className="h-full"
                  />
                ))}
              </div>

              {/* Mobile version for last 2: just stack them */}
              <div className="md:hidden">
                {whatWeOffer.slice(3).map((feature) => (
                  <IconCard
                    key={feature.title}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    className="mb-8"
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* Choose Your Path Section */}
        <section className="py-16 md:py-20 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-7xl rounded-2xl shadow-lg bg-card">
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
                  {/* Left side - Path selection */}
                  <div className="lg:col-span-4 flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-primary mb-6 lg:mb-8">
                      Choose your{' '}
                      <span className="relative inline-block">
                        path
                        <svg
                          className="absolute left-0 bottom-0 w-[38px] sm:w-[50px] text-primary"
                          aria-hidden="true"
                          role="presentation"
                          viewBox="0 0 50 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ pointerEvents: 'none' }}
                        >
                          <path
                            d="M1 2.94452C14.5 0.48118 31 0.481247 49 2.25307M10.6944 6C19.3488 4.11245 30 4.16042 38.4059 5.21069"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>{' '}
                      to success
                    </h3>

                    <div className="space-y-2">
                      {(Object.keys(solutionSteps) as Array<keyof typeof solutionSteps>).map((key) => (
                        <button
                          key={key}
                          className={cn(
                            "group w-full p-4 text-left text-base sm:text-lg font-medium transition-all duration-300 border-l-4 rounded-r-md",
                            activeSolution === key
                              ? "border-primary text-primary bg-primary/10 shadow-glow"
                              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/30"
                          )}
                          onClick={() => setActiveSolution(key)}
                        >
                          <span className="capitalize flex justify-between items-center">
                            {key.replace('-', ' ')}
                            <ArrowRight
                              className={cn(
                                "h-5 w-5 opacity-0 -translate-x-2 transition-all duration-300",
                                activeSolution === key && "opacity-100 translate-x-0"
                              )}
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right side - Process visualization */}
                  <div className="lg:col-span-8">
                    <div className="flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
                      {/* Mobile view - Vertical layout */}
                      <div className="block lg:hidden w-full">
                        <div className="relative space-y-6">
                          {currentSteps.map((step, index) => {
                            const isLast = index === currentSteps.length - 1;
                            return (
                              <div key={step.title} className="relative flex">
                                {/* Icon with line */}
                                <div className="relative flex flex-col items-center mr-4">
                                  <div
                                    className={cn(
                                      "flex size-16 items-center justify-center rounded-full border-2 bg-background shadow-lg shrink-0 z-10",
                                      isLast ? "border-flow-accent" : "border-primary"
                                    )}
                                  >
                                    <step.icon
                                      className={cn("size-8", isLast ? "text-flow-accent" : "text-primary")}
                                    />
                                  </div>

                                  {/* Connecting line */}
                                  {!isLast && (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 bg-border"
                                      style={{ height: "calc(100% + 1.5rem)" }}>
                                    </div>
                                  )}
                                </div>

                                {/* Text */}
                                <div className="flex-1 pt-2">
                                  <h4 className="font-semibold text-foreground text-lg">{step.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>


                      {/* Desktop view - Horizontal layout */}
                      <div className="hidden lg:block w-full">
                        <div className="relative">
                          {/* Main horizontal line */}
                          <div className="absolute top-8 left-8 right-8 h-0.5 bg-border"></div>

                          <div className="relative flex justify-between items-start">
                            {/* Vertical lines between items */}
                            {currentSteps.slice(0, -1).map((_, index) => {
                              const position = ((index + 1) / currentSteps.length) * 100;
                              return (
                                <div
                                  key={`line-${index}`}
                                  className="absolute top-8 h-8 w-0.5 bg-border"
                                  style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                                ></div>
                              );
                            })}

                            {currentSteps.map((step, index) => {
                              const isLast = index === currentSteps.length - 1;
                              return (
                                <div key={step.title} className="relative flex flex-col items-center text-center" style={{ width: `${100 / currentSteps.length}%` }}>
                                  <div className={cn(
                                    "relative flex size-16 items-center justify-center rounded-full border-2 bg-background shadow-lg mb-4",
                                    isLast ? "   border-yellow-400" : "border-primary",
                                  )}>
                                    <step.icon className={cn("size-8", isLast ? "text-yellow-400" : "text-primary")} />
                                  </div>
                                  <h4 className="font-semibold text-foreground text-sm lg:text-base px-2">{step.title}</h4>
                                  <p className="text-xs lg:text-sm text-muted-foreground mt-1 px-2">{step.description}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            {/* New Marquee Section - Reskinned and Fixed */}
            <div className="reskin-marquee pt-10 mb-6 md:mt-6 md:mb-6 w-screen relative left-1/2 right-1/2 -translate-x-1/2 px-0 overflow-x-hidden">
              <div className="reskin-marquee-holder flex flex-col gap-0">
                {/* Row 1 */}
                <div
                  className="reskin-marquee-content relative w-full overflow-hidden h-16"
                  onMouseEnter={() => setPausedRow1(true)}
                  onMouseLeave={() => setPausedRow1(false)}
                >
                  <ul className={cn("reskin-marquee-list flex animate-marquee space-x-4 w-max items-center h-16", isPausedRow1 && "paused")}>
                    {[...Array(6)].flatMap(() => marqueeTabsRow1).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 hover:bg-muted transition-colors rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className={cn("reskin-marquee-list flex animate-marquee space-x-4 w-max items-center h-16 absolute left-0 top-0 pointer-events-none", isPausedRow1 && "paused")} aria-hidden="true">
                    {[...Array(6)].flatMap(() => marqueeTabsRow1).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 rounded-full px-4 py-3 text-sm text-muted-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Row 2 */}
                <div
                  className="reskin-marquee-content relative w-full overflow-hidden h-16"
                  onMouseEnter={() => setPausedRow2(true)}
                  onMouseLeave={() => setPausedRow2(false)}
                >
                  <ul className={cn("reskin-marquee-list flex animate-marquee-reverse space-x-4 w-max items-center h-16", isPausedRow2 && "paused")}>
                    {[...Array(6)].flatMap(() => marqueeTabsRow2).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 hover:bg-muted transition-colors rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className={cn("reskin-marquee-list flex animate-marquee-reverse space-x-4 w-max items-center h-16 absolute left-0 top-0 pointer-events-none", isPausedRow2 && "paused")} aria-hidden="true">
                    {[...Array(6)].flatMap(() => marqueeTabsRow2).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 rounded-full px-4 py-3 text-sm text-muted-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Row 3 */}
                <div
                  className="reskin-marquee-content relative w-full overflow-hidden h-16"
                  onMouseEnter={() => setPausedRow3(true)}
                  onMouseLeave={() => setPausedRow3(false)}
                >
                  <ul className={cn("reskin-marquee-list flex animate-marquee space-x-4 w-max items-center h-16", isPausedRow3 && "paused")}>
                    {[...Array(6)].flatMap(() => marqueeTabsRow3).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 hover:bg-muted transition-colors rounded-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <ul className={cn("reskin-marquee-list flex animate-marquee space-x-4 w-max items-center h-16 absolute left-0 top-0 pointer-events-none", isPausedRow3 && "paused")} aria-hidden="true">
                    {[...Array(6)].flatMap(() => marqueeTabsRow3).map((tab, idx) => (
                      <li key={idx} className="reskin-marquee-item flex-shrink-0">
                        <span className="reskin-marquee-text flex items-center gap-2 bg-muted/50 rounded-full px-4 py-3 text-sm text-muted-foreground">
                          {tab.icon}
                          {tab.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Hustloop Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-4 relative font-headline flex items-center justify-center gap-1 text-center flex-wrap">
              Why choose
              <span className="inline-flex items-center justify-center relative top-1">
                <Image
                  src="/logo.png"
                  alt="Hustloop logo"
                  width={220}
                  height={220}
                  className="object-contain h-auto max-w-[140px] md:max-w-[140px]"
                />
                <span
                  className="ml-[-4px] text-4xl"
                  style={{ color: '#D4AF37' }}
                >
                  ?
                </span>
              </span>
            </h2>

            <p className="max-w-3xl mx-auto text-muted-foreground mb-12">
              We are founded on a clear mission, guided by a bold vision, and committed to core values that drive success.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="group text-center p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle className="mb-2">Our Mission</CardTitle>
                <p className="text-muted-foreground">To empower entrepreneurs by providing the resources, guidance, and connections they need to transform innovative ideas into successful ventures.</p>
              </Card>
              <Card className="group text-center p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <BrainCircuit className="h-8 w-8" />
                </div>
                <CardTitle className="mb-2">Our Vision</CardTitle>
                <p className="text-muted-foreground">To create a thriving ecosystem where startups, MSMEs, and incubators collaborate seamlessly to drive innovation and economic growth.</p>
              </Card>
              <Card className="group text-center p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
                <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Heart className="h-8 w-8" />
                </div>
                <CardTitle className="mb-2">Our Values</CardTitle>
                <p className="text-muted-foreground">Innovation, collaboration, integrity, and excellence guide everything we do as we help shape the future of entrepreneurship.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* 5-Minute Tour Section */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <Card className="bg-card text-card-foreground rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <p className="font-semibold text-primary">5-Minute Tour</p>
                    <h2 className="text-4xl font-bold font-headline text-card-foreground">Unlock the thriving <span className="text-primary">Ecosystem</span></h2>
                    <p className="text-muted-foreground max-w-md">
                      Take a virtual tour and experience how the Hustloop Platform connects founders, mentors, and investors to build the future.
                    </p>
                  </div>
                  <div className="relative h-48 md:h-full">
                    <Image
                      src="https://placehold.co/1280x720.png"
                      alt="Decorative abstract image"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg absolute z-10 shadow-lg top-48"
                      data-ai-hint="orange abstract cubes"
                    />
                  </div>
                </div>
                <div className="mt-8 relative group">
                  <Image
                    src="https://placehold.co/1280x720.png"
                    alt="Hustloop platform screenshot"
                    width={1280}
                    height={720}
                    className="rounded-lg shadow-lg"
                    data-ai-hint="platform dashboard ui"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <Button
                      variant="ghost"
                      className="w-24 h-24 rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-all duration-300 group-hover:scale-110"
                      aria-label="Play video tour"
                    >
                      <PlayCircle className="w-16 h-16 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Call to Action Section */}
        <section id="contact-section" className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
              <Card className="p-8 lg:p-12 h-full flex flex-col justify-center">
                <CardHeader className="p-0">
                  <CardTitle className="text-4xl font-bold font-headline">
                    Ready to build the{" "}
                    <span className="relative inline-block z-10 pt-2 md:pt-0">
                      Future
                      <svg
                        className="absolute w-[114px] md:w-[114px] -right-[2px] -bottom-[12px] md:-bottom-[10px] z-0"
                        aria-hidden="true"
                        role="presentation"
                        viewBox="0 0 114 60"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ pointerEvents: "none" }}
                      >
                        <path
                          d="M61.1407 5.29573C61.5825 5.29573 61.9407 4.93755 61.9407 4.49573C61.9407 4.0539 61.5825 3.69573 61.1407 3.69573V5.29573ZM25.6313 1.18441L25.5712 0.386673L25.6313 1.18441ZM65.1859 56.529L65.2466 57.3267L65.1859 56.529ZM102.238 49.5437L102.146 50.3384L102.238 49.5437ZM113 59L112.33 59.4366C112.546 59.7688 112.973 59.8924 113.333 59.7273C113.694 59.5621 113.879 59.1579 113.768 58.7772L113 59ZM113.483 45.9598C113.667 45.5584 113.492 45.0833 113.09 44.8986C112.689 44.7139 112.214 44.8896 112.029 45.291L113.483 45.9598ZM9.10831 45.245L8.60696 45.8685L8.60698 45.8685L9.10831 45.245ZM61.1407 3.69573C55.3296 3.69573 50.2958 2.60385 44.7326 1.62791C39.1822 0.654208 33.1789 -0.18624 25.5712 0.386673L25.6913 1.98216C33.1047 1.42388 38.9568 2.23909 44.4562 3.20384C49.9428 4.16636 55.1532 5.29573 61.1407 5.29573V5.29573ZM102.146 50.3384C103.978 50.5502 105.816 51.7049 107.587 53.4268C109.346 55.1369 110.954 57.3236 112.33 59.4366L113.67 58.5634C112.268 56.4103 110.585 54.1104 108.703 52.2797C106.832 50.4607 104.678 49.0204 102.329 48.749L102.146 50.3384ZM113.768 58.7772C113.392 57.4794 112.891 55.17 112.707 52.7136C112.521 50.2318 112.669 47.729 113.483 45.9598L112.029 45.291C111.04 47.4401 110.92 50.2798 111.112 52.8333C111.305 55.4122 111.828 57.8311 112.232 59.2228L113.768 58.7772ZM25.5712 0.386673C12.1968 1.39385 4.12231 9.70072 1.32012 19.2877C-1.46723 28.8239 0.948311 39.7092 8.60696 45.8685L9.60967 44.6216C2.5531 38.9466 0.211996 28.7819 2.85587 19.7366C5.4849 10.742 13.0295 2.93568 25.6913 1.98216L25.5712 0.386673ZM8.60698 45.8685C17.052 52.6596 27.4766 55.8004 37.6285 57.1087C47.7823 58.4172 57.7242 57.8998 65.2466 57.3267L65.1251 55.7313C57.6265 56.3026 47.8183 56.8086 37.833 55.5218C27.8456 54.2347 17.7419 51.1613 9.60965 44.6216L8.60698 45.8685ZM65.2466 57.3267C71.9263 56.8179 78.8981 54.7692 85.2941 53.0195C91.7606 51.2505 97.5723 49.8099 102.146 50.3384L102.329 48.749C97.3895 48.1782 91.2605 49.7286 84.8719 51.4762C78.4129 53.2432 71.6155 55.2369 65.1251 55.7313L65.2466 57.3267Z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                    ?
                  </CardTitle>

                </CardHeader>
                <CardContent className="p-0 mt-4 space-y-6">
                  <p className="text-muted-foreground">
                    Join Hustloop today and let&apos;s turn your vision into reality. Your journey to success starts here.
                  </p>
                  <div>
                    <p className="text-sm font-semibold">Email us</p>
                    <a href="mailto:support@hustloop.com" className="text-primary hover:underline">support@hustloop.com</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="#" aria-label="X" className="text-muted-foreground hover:text-primary transition-colors">
                      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current"><title>X</title><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.931L18.901 1.153Zm-1.653 19.57h2.608L6.856 2.597H4.062l13.185 18.126Z" /></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/hustloop/" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
                      <Linkedin className="h-5 w-5" />
                    </a>
                    <a href="mailto:support@hustloop.com" aria-label="Email" className="text-muted-foreground hover:text-primary transition-colors">
                      <Mail className="h-5 w-5" />
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="p-8 lg:p-12">
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                    <FormField
                      control={contactForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="Enter your email address" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl><Input type="tel" placeholder="Enter your phone number" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General Inquiry</SelectItem>
                              <SelectItem value="mentorship">Mentorship Programs</SelectItem>
                              <SelectItem value="incubation">Incubation Support</SelectItem>
                              <SelectItem value="msme">MSME Partnerships</SelectItem>
                              <SelectItem value="support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={contactForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl><Textarea placeholder="How can we help you?" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isContactSubmitting}>
                      {isContactSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      {isContactSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Form>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
