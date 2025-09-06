
'use client';

import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Rocket, Calendar, Clock, X } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function EventModal({ isOpen, onOpenChange }: EventModalProps) {
  const router = useRouter();

  const handleRegisterClick = () => {
    onOpenChange(false);
    router.push('/form');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden bg-card text-card-foreground">
        <div className="relative">
          <Image
            src="https://placehold.co/800x400.png"
            alt="Aignite"
            width={800}
            height={400}
            className="w-full h-auto object-cover"
            data-ai-hint="conference event banner"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
           <DialogClose className="absolute right-4 top-4 rounded-none  bg-background/50 text-foreground/80 hover:bg-background/75 hover:text-foreground transition-opacity z-20">
              
              <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <DialogHeader className="p-6 pt-0 space-y-4 -mt-24 relative z-10 text-white rounded-lg">
          <div className='p-6 bg-card/80 backdrop-blur-sm rounded-lg'>
              <DialogTitle className="text-4xl font-bold font-headline text-foreground">
                  Aignite
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                The premier event for founders, innovators, and investors.
              </DialogDescription>
            <p className="text-foreground mt-4 text-left">
              Join us for a day of inspiring keynotes, hands-on workshops, and unparalleled networking opportunities. Learn from industry leaders, pitch your ideas, and connect with the people who can help you build the future.
            </p>
            <div className="flex items-center gap-6 text-muted-foreground mt-4">
              <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary"/>
                  <span>September 15, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary"/>
                  <span>9:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="p-6 pt-0 sm:justify-start relative z-10 -mt-8">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleRegisterClick}>
            <Rocket className="mr-2 h-5 w-5" />
            Register Now
            </Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
  );
}
