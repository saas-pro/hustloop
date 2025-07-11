
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
import { Card, CardContent } from '@/components/ui/card';
import type { MSMECollaboration } from './msmes';
import { Handshake, Target, Check, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Image from 'next/image';
import { Badge } from '../ui/badge';

interface MSMECollaborationDetailsProps {
  collaboration: MSMECollaboration | null;
  onOpenChange: (isOpen: boolean) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function MSMECollaborationDetails({
  collaboration,
  onOpenChange,
  isLoggedIn,
  hasSubscription,
}: MSMECollaborationDetailsProps) {
  if (!collaboration) return null;

  const isDisabled = !isLoggedIn || !hasSubscription;
  let tooltipContent = null;
  if (!isLoggedIn) {
    tooltipContent = <p>Please login to connect with MSMEs</p>;
  } else if (!hasSubscription) {
    tooltipContent = <p>Subscribe to a plan to connect with MSMEs</p>;
  }

  const connectButton = (
    <Button
      size="lg"
      className="bg-accent hover:bg-accent/90 text-accent-foreground"
      disabled={isDisabled}
    >
      <Handshake className="mr-2 h-5 w-5" /> Connect Now
    </Button>
  );

  return (
    <Dialog open={!!collaboration} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6">
            <div className='flex items-center gap-4'>
                <Image src={collaboration.logo} alt={`${collaboration.name} logo`} width={80} height={80} className="rounded-lg" data-ai-hint={collaboration.hint} />
                <div>
                    <DialogTitle className="text-3xl font-bold font-headline">{collaboration.name}</DialogTitle>
                    <DialogDescription>
                        Collaboration opportunity in the {collaboration.sector} sector.
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>

        <ScrollArea className="flex-grow mt-4 px-6">
          <div className="space-y-12">
            
            <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">About {collaboration.name}</h3>
                <p className="text-muted-foreground">{collaboration.details.about}</p>
            </div>

            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Target className="h-6 w-6 text-primary" /> What We're Looking For</h3>
                <p className="text-muted-foreground">{collaboration.details.lookingFor}</p>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-4 font-headline flex items-center gap-2"><Handshake className="h-6 w-6 text-primary" /> Scope of Collaboration</h3>
                <div className="flex flex-wrap gap-2">
                  {collaboration.details.scope.map((item, index) => (
                    <Badge key={index} variant="secondary">{item}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-2xl font-bold mb-4 font-headline">Benefits of Partnership</h3>
              <ul className="space-y-2">
                {collaboration.details.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            <div>
                <h3 className="text-2xl font-bold mb-4 font-headline">Primary Contact</h3>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <User className="h-8 w-8 text-primary" />
                        <div>
                            <p className="font-semibold">{collaboration.details.contact.name}</p>
                            <p className="text-sm text-muted-foreground">{collaboration.details.contact.title}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>


            <div className="text-center bg-card/50 rounded-lg my-12 py-10">
              <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Collaborate?</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                Reach out to {collaboration.name} to explore partnership opportunities and grow together.
              </p>
              {isDisabled ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span>{connectButton}</span>
                    </TooltipTrigger>
                    <TooltipContent>{tooltipContent}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                connectButton
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
