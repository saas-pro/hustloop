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
import { Rocket, Calendar, Clock, X, Phone } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function EventModal({ isOpen, onOpenChange }: EventModalProps) {
  const router = useRouter();

  const handleRegisterClick = () => {
    onOpenChange(false);
    router.push('/sif-aignite');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-[600px] max-w-sm p-0 overflow-hidden bg-transparent border rounded-md text-white">
        <div className="relative">
          {/* Banner Image */}
          <Image
            src="/aignite.jpg"
            alt="Aignite"
            width={800}
            height={400}
            className="h-auto md:h-[90vh] object-cover"
          />

          {/* Dark gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Close button */}
          <DialogClose className="absolute right-4 top-4 rounded-none bg-background/50 text-foreground/80 hover:bg-background/75 hover:text-foreground transition-opacity z-20">
              <X></X>
              <span className="sr-only">Close</span>
          </DialogClose>


          {/* Overlay content with translucent background */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl">
              <DialogHeader className="space-y-4">
                <DialogTitle className="text-4xl font-bold font-headline text-white">
                  {"SIF's-Aignite"}
                </DialogTitle>

                <p className="text-sm sm:text-base leading-relaxed text-white">
                  Join SIF’s Aignite: a 6-day online AI transformation workshop series for
                  founders, innovators, and teams. Learn from industry leaders, get hands-on
                  with top AI tools, and build strategies you can implement immediately—
                  4 hours per day, with certificate on completion.
                </p>

                <div className="flex items-center gap-6 text-sm sm:text-base text-white/80 mt-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>+91 9080895742</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>4 Hours/Day</span>
                  </div>
                </div>
              </DialogHeader>

              <DialogFooter className="mt-6 sm:justify-start">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={handleRegisterClick}
                >
                  <Rocket className="mr-2 h-5 w-5" />
                  Register Now
                </Button>
              </DialogFooter>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>


  );
}
