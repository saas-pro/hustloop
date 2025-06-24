'use client';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Incubator } from './incubators';
import {
  Users,
  Briefcase,
  Wrench,
  CircleDollarSign,
  Building,
  Network,
  Star,
  BookOpen,
  Check,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const serviceIcons: { [key: string]: React.ReactNode } = {
  Mentorship: <Users className="h-6 w-6 text-primary" />,
  'Business Development': <Briefcase className="h-6 w-6 text-primary" />,
  'Technical Support': <Wrench className="h-6 w-6 text-primary" />,
  'Funding Access': <CircleDollarSign className="h-6 w-6 text-primary" />,
  Workspace: <Building className="h-6 w-6 text-primary" />,
  'VC Network': <Network className="h-6 w-6 text-primary" />,
  'Angel Network': <Star className="h-6 w-6 text-primary" />,
  'Startup School': <BookOpen className="h-6 w-6 text-primary" />,
  'Clinical Mentorship': <Users className="h-6 w-6 text-primary" />,
  'Lab Access': <Wrench className="h-6 w-6 text-primary" />,
  'Regulatory Support': <BookOpen className="h-6 w-6 text-primary" />,
  'Hospital Network': <Building className="h-6 w-6 text-primary" />,
  'Bio Workspace': <Building className="h-6 w-6 text-primary" />,
  'Healthcare VC Network': <Network className="h-6 w-6 text-primary" />,
  'MedTech Angels': <Star className="h-6 w-6 text-primary" />,
  'BioTech Academy': <BookOpen className="h-6 w-6 text-primary" />,
  'Production Support': <Wrench className="h-6 w-6 text-primary" />,
  'Distribution Network': <Network className="h-6 w-6 text-primary" />,
  'Creative Mentorship': <Users className="h-6 w-6 text-primary" />,
  'Legal & IP Guidance': <BookOpen className="h-6 w-6 text-primary" />,
  'Co-working & Studio Space': <Building className="h-6 w-6 text-primary" />,
  'Investor Connections': <CircleDollarSign className="h-6 w-6 text-primary" />,
};

interface IncubatorDetailsProps {
  incubator: Incubator | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function IncubatorDetails({ incubator, onOpenChange, isLoggedIn, hasSubscription }: IncubatorDetailsProps) {
  if (!incubator) return null;

  const isDisabled = !isLoggedIn || !hasSubscription;
  let tooltipContent = null;
  if (!isLoggedIn) {
    tooltipContent = <p>Please login to apply for incubation</p>;
  } else if (!hasSubscription) {
    tooltipContent = <p>Subscribe to a plan to apply for an incubation</p>;
  }

  const applyButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      disabled={isDisabled}
    >
      Apply Now
    </Button>
  );

  return (
    <Dialog open={!!incubator} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold font-headline">{incubator.name}</DialogTitle>
          <DialogDescription>
            Detailed overview of the program, benefits, and eligibility.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4 pr-6">
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">{incubator.metrics.startups}</CardTitle>
                  <p className="text-sm text-muted-foreground">Startups Supported</p>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">{incubator.metrics.funding}</CardTitle>
                  <p className="text-sm text-muted-foreground">Average Funding</p>
                </CardHeader>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold">{incubator.metrics.successRate}</CardTitle>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </CardHeader>
              </Card>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Program Overview</h3>
              <p className="text-muted-foreground">{incubator.details.overview}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Our Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incubator.details.services.map((service) => (
                  <Card key={service.title} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="flex flex-row items-center gap-4">
                      {serviceIcons[service.title] || <Star className="h-6 w-6 text-primary" />}
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Program Benefits</h3>
              <ul className="space-y-2">
                {incubator.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Eligibility Criteria</h3>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 space-y-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Focus Areas</h4>
                            <p className="text-sm text-muted-foreground">{incubator.details.eligibility.focusAreas}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Key Requirements</h4>
                            <ul className="space-y-2">
                            {incubator.details.eligibility.requirements.map((item, index) => (
                              <li key={index} className="flex items-start gap-3">
                                <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

             <Separator />

            <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Program Timeline</h3>
                <div className="relative border-l border-border/50 pl-6 space-y-6">
                    {incubator.details.timeline.map((item, index) => (
                        <div key={index} className="relative">
                            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full bg-primary ring-8 ring-background"></div>
                            <p className="font-semibold">{item.event}</p>
                            <p className="text-sm text-muted-foreground">{item.period}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-center bg-card/50 rounded-lg my-12 py-10">
              <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Accelerate Your Startup?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                Join the next cohort of {incubator.name} and take your startup to the next level.
              </p>
              {isDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{applyButton}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {tooltipContent}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                applyButton
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
