"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CorporateChallengeDetails from "./corporate-challenge-details";
import MSMECollaborationDetails from "./msme-collaboration-details";


export type CorporateChallenge = {
  company: string;
  logo: string;
  hint: string;
  title: string;
  reward: string;
  description: string;
  details: {
    about: string;
    problemStatements: number;
    stages: number;
    rewardPerStatement: string;
    mission: string;
    participation: string;
    rewards: string;
  };
};

export type MSMECollaboration = {
  name: string;
  logo: string;
  hint: string;
  sector: string;
  description: string;
  details: {
    about: string;
    scope: string[];
    lookingFor: string;
    benefits: string[];
    contact: {
        name: string;
        title: string;
    }
  };
};

const corporateChallenges: CorporateChallenge[] = [
  {
    company: "Nexus Corp",
    logo: "https://placehold.co/100x100.png",
    hint: "corporate logo",
    title: "AI-Powered Logistics Optimization",
    reward: "₹5,00,000",
    description: "Develop an AI model to optimize our last-mile delivery routes, reducing fuel consumption and delivery times.",
    details: {
      about: "The Nexus Corp Grand Challenge is a pioneering initiative to encourage Deep Tech Startups to build indigenous solutions for optimizing supply chain and logistics. We are seeking innovative AI-driven products to revolutionize national delivery networks.",
      problemStatements: 12,
      stages: 3,
      rewardPerStatement: "Up to ₹5 Lakh",
      mission: "To nurture and develop AI solutions that address key challenges in logistics, predictive analytics, route optimization, and warehouse automation, thereby enhancing efficiency and reducing costs.",
      participation: "Indian Startups and Student Groups working in artificial intelligence, data science, and logistics technology who are capable of providing innovative, scalable solutions.",
      rewards: "Total Prizes worth ₹1.5 Crore. Winning teams with promising solutions are eligible for a post-challenge contract and integration into Nexus Corp's logistics network."
    }
  },
  {
    company: "Future Retail",
    logo: "https://placehold.co/100x100.png",
    hint: "retail logo",
    title: "Gamified Customer Loyalty Platform",
    reward: "₹3,50,000",
    description: "Create an engaging, game-like loyalty program to increase customer retention and in-store traffic.",
    details: {
      about: "This initiative aims to revolutionize customer engagement in the retail sector through cutting-edge gamification. We are looking for a platform that makes shopping more interactive, rewarding, and fun.",
      problemStatements: 5,
      stages: 2,
      rewardPerStatement: "Pilot Project",
      mission: "To foster innovative loyalty solutions that increase customer lifetime value, drive repeat business, and create memorable in-store and online experiences that differentiate our brand.",
      participation: "Startups and development teams specializing in retail tech, mobile app development, user engagement, and gamification.",
      rewards: "A total prize pool of ₹10 Lakhs, with the winning solution getting ₹3.5 Lakhs and a paid pilot project with Future Retail across 50 locations."
    }
  },
  {
    company: "HealthWell Pharma",
    logo: "https://placehold.co/100x100.png",
    hint: "pharma logo",
    title: "IoT Smart Packaging for Medication",
    reward: "₹7,00,000",
    description: "Design smart packaging that monitors temperature and reminds patients to take their medication.",
    details: {
      about: "A challenge to improve patient adherence and drug safety through intelligent packaging solutions. This initiative seeks to bridge the gap between patients and their medication regimen using IoT technology.",
      problemStatements: 8,
      stages: 3,
      rewardPerStatement: "R&D Grant",
      mission: "To develop smart packaging that reduces medication errors, improves patient outcomes, provides valuable data for healthcare providers, and ensures drug integrity from pharmacy to patient.",
      participation: "Innovators and startups in IoT, hardware design, healthcare tech, materials science, and mobile application development.",
      rewards: "Total prizes worth ₹25 Lakhs. The winning team receives ₹7 Lakhs, an R&D grant, and a collaboration agreement with HealthWell Pharma's innovation lab to bring the product to market."
    }
  },
  {
    company: "EcoSustain",
    logo: "https://placehold.co/100x100.png",
    hint: "sustainability logo",
    title: "Circular Economy Waste Reduction",
    reward: "Partnership",
    description: "Propose a scalable solution to upcycle industrial waste into consumer products.",
    details: {
      about: "A challenge to create sustainable business models by transforming industrial byproducts into valuable consumer goods. We're looking for innovators who can turn waste into want.",
      problemStatements: 4,
      stages: 2,
      rewardPerStatement: "Seed Funding",
      mission: "To pioneer circular economy solutions that minimize industrial waste, create new revenue streams, and contribute to a more sustainable planet by closing the loop on production.",
      participation: "Startups focused on sustainability, material science, green chemistry, and innovative manufacturing processes.",
      rewards: "A strategic partnership with EcoSustain, including access to our supply chain, manufacturing facilities, and a seed funding round for the most promising venture."
    }
  },
];

const msmeCollaborations: MSMECollaboration[] = [
  {
    name: "Artisan Co-op",
    logo: "https://placehold.co/100x100.png",
    hint: "handmade crafts",
    sector: "Handicrafts",
    description: "Seeking collaborators for digital marketing and e-commerce expansion to reach a global audience.",
    details: {
      about: "Artisan Co-op is a collective of over 200 artisans from across rural India, dedicated to preserving traditional craft techniques. We specialize in handcrafted textiles, pottery, and jewelry, bringing authentic Indian artistry to the world.",
      scope: ["E-commerce Strategy", "Digital Marketing", "International Logistics", "Brand Storytelling"],
      lookingFor: "We are seeking a dynamic startup partner to help us scale our online presence. The ideal partner will have expertise in building and managing e-commerce platforms, running effective digital marketing campaigns, and handling international shipping logistics.",
      benefits: [
        "Access to a unique and authentic product catalog.",
        "Opportunity to make a significant social impact by empowering rural artisans.",
        "Co-branding opportunities and shared revenue model.",
        "Rich content and stories for marketing campaigns."
      ],
      contact: {
        name: "Priya Sharma",
        title: "Director of Operations"
      }
    }
  },
  {
    name: "GreenLeaf Organics",
    logo: "https://placehold.co/100x100.png",
    hint: "organic farm",
    sector: "Agriculture",
    description: "Looking for partners in sustainable packaging and cold-chain logistics to reduce spoilage.",
    details: {
      about: "GreenLeaf Organics is a certified organic farm committed to sustainable agriculture. We produce high-quality, fresh produce for urban markets but face challenges with shelf life and packaging waste.",
      scope: ["Sustainable Packaging", "Cold-Chain Logistics", "Supply Chain Optimization", "Food Tech"],
      lookingFor: "We are looking for an innovative partner to develop eco-friendly packaging solutions that extend product shelf life. Additionally, we need expertise in establishing an efficient cold-chain logistics network to reduce post-harvest losses.",
      benefits: [
        "Consistent supply of high-quality organic produce for testing and pilots.",
        "A strong case study in the growing sustainable agriculture market.",
        "Joint grant applications for agritech and sustainability funding.",
        "Potential for long-term logistics and packaging contracts."
      ],
      contact: {
        name: "Ravi Kumar",
        title: "Farm Manager"
      }
    }
  },
  {
    name: "TechFix Solutions",
    logo: "https://placehold.co/100x100.png",
    hint: "computer repair",
    sector: "IT Services",
    description: "Open to collaborations with hardware suppliers and B2B clients for annual maintenance contracts.",
    details: {
      about: "TechFix Solutions provides reliable IT repair and maintenance services for small and medium businesses. We have a skilled team of technicians but are looking to expand our service offerings and client base.",
      scope: ["Hardware Procurement", "B2B Sales", "SaaS Integration", "Managed IT Services"],
      lookingFor: "We are seeking partners to streamline our hardware procurement process through bulk purchasing agreements. We are also looking for B2B sales experts or platforms to help us secure more Annual Maintenance Contracts (AMCs) with corporate clients.",
      benefits: [
        "A reliable service partner for your hardware sales.",
        "Commission-based rewards for successful client referrals.",
        "Opportunity to bundle your SaaS products with our maintenance services.",
        "Access to a wide network of SME clients."
      ],
      contact: {
        name: "Anjali Verma",
        title: "Business Development Head"
      }
    }
  },
  {
    name: "The Book Nook",
    logo: "https://placehold.co/100x100.png",
    hint: "cozy bookstore",
    sector: "Retail",
    description: "Interested in partnering with local authors for book signing events and community workshops.",
    details: {
      about: "The Book Nook is a beloved independent bookstore that serves as a cultural hub for the local community. We aim to create unique literary experiences that go beyond just selling books.",
      scope: ["Event Management", "Community Engagement", "Publishing Tech", "Content Creation"],
      lookingFor: "We are looking for partners to help us organize and promote literary events, such as author signings, writing workshops, and book clubs. We are also interested in platforms that connect independent bookstores with self-published authors.",
      benefits: [
        "A charming and authentic venue for literary events.",
        "Access to a loyal and engaged community of book lovers.",
        "Cross-promotion opportunities through our newsletter and social media.",
        "A platform to test new publishing or author service technologies."
      ],
      contact: {
        name: "Siddharth Rao",
        title: "Owner"
      }
    }
  },
];

interface MsmesViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function MsmesView({ isOpen, onOpenChange, isLoggedIn, hasSubscription }: MsmesViewProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<CorporateChallenge | null>(null);
  const [selectedCollaboration, setSelectedCollaboration] = useState<MSMECollaboration | null>(null);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center font-headline">Innovation & Growth Opportunities</DialogTitle>
            <DialogDescription className="text-center">
              <span style={{ color: '#D4AF37' }}>"Empowering MSMEs for Success"</span>
              <span className="block mt-2">
                Join our platform to solve corporate challenges for rewards or collaborate with MSMEs for growth opportunities. Whether you're an innovator, entrepreneur, or business expert, find your perfect match here.
              </span>
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-full mt-4 pr-6">
            <div className="space-y-12">
              <section>
                <h2 className="text-2xl font-bold font-headline mb-6">Corporate Challenges</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {corporateChallenges.map((challenge, index) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                            <Image src={challenge.logo} alt={`${challenge.company} logo`} width={60} height={60} className="rounded-lg" data-ai-hint={challenge.hint} />
                            <div>
                                <CardTitle className="text-base">{challenge.title}</CardTitle>
                                <CardDescription>{challenge.company}</CardDescription>
                            </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </CardContent>
                      <CardFooter className="flex-col items-start space-y-2">
                        <Badge variant="outline">Reward: {challenge.reward}</Badge>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setSelectedChallenge(challenge)}>
                            View Challenge
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold font-headline mb-6">MSME Collaboration</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {msmeCollaborations.map((msme, index) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                      <CardHeader>
                          <div className="flex items-center gap-4">
                              <Image src={msme.logo} alt={`${msme.name} logo`} width={60} height={60} className="rounded-full" data-ai-hint={msme.hint} />
                              <div>
                                  <CardTitle className="text-base">{msme.name}</CardTitle>
                                  <CardDescription>{msme.sector}</CardDescription>
                              </div>
                          </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground">{msme.description}</p>
                      </CardContent>
                      <CardFooter>
                          <Button variant="outline" className="w-full" onClick={() => setSelectedCollaboration(msme)}>Connect</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <CorporateChallengeDetails 
        challenge={selectedChallenge} 
        onOpenChange={(isOpen) => !isOpen && setSelectedChallenge(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
      <MSMECollaborationDetails 
        collaboration={selectedCollaboration}
        onOpenChange={(isOpen) => !isOpen && setSelectedCollaboration(null)}
        isLoggedIn={isLoggedIn}
        hasSubscription={hasSubscription}
      />
    </>
  );
}
