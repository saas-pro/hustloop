'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Lightbulb, Microscope, Puzzle } from 'lucide-react';
import type { View } from '@/app/types';
import CircularText from '@/components/CircularText';

const MsmesView = dynamic(() => import('./msmes'));
const TechTransferView = dynamic(() => import('../browsetech/browsetech'));
const IncubatorsView = dynamic(() => import('./incubators'));

interface MarketplaceViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
  isLoggedIn: boolean;
  hasSubscription: boolean;
}

export default function MarketplaceView({ isOpen, onOpenChange, setActiveView, isLoggedIn, hasSubscription }: MarketplaceViewProps) {
  const [internalView, setInternalView] = useState<string | null>(null);

  const handleInternalViewClose = (viewName: string) => (open: boolean) => {
    if (!open) {
      setInternalView(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center font-headline">Marketplace</DialogTitle>
            <DialogDescription className="text-center">
              Explore opportunities, solve challenges, and discover new technologies.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="challenges" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 h-fit md:grid-cols-3">
              <TabsTrigger value="challenges">Solve Challenges</TabsTrigger>
              <TabsTrigger value="tech">Technology Transfer</TabsTrigger>
              <TabsTrigger value="incubators">Incubators</TabsTrigger>
            </TabsList>

            <TabsContent value="challenges">
              <Card className='min-h-[26vh] flex  justify-between'>
                <div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Puzzle />
                      Solve Corporate & MSME Challenges
                    </CardTitle>
                  </CardHeader>

                  <CardContent >
                    <p className="text-muted-foreground mb-4">
                      Apply your skills to solve real-world problems posted by companies and MSMEs. Get rewarded and gain valuable experience.
                    </p>

                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        localStorage.setItem("fromMarketplace", "true");
                        setInternalView("msmes");
                      }}
                    >
                      Browse Challenges <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </div>

                <div className="flex justify-center items-center m-6">
                  <CircularText
                    text="INCENTIVE*CHALLENGES*"
                    spinDuration={10}
                    className='!h-36 !w-36 '
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tech">
              <Card className='min-h-[26vh] flex flex-col justify-center'>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Microscope />
                    Technology Transfer
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Discover and license cutting-edge technologies from universities and research institutions.
                  </p>

                  <Button onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setInternalView("browseTech");
                  }}>
                    Browse Technologies <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incubators">
              <Card className='min-h-[26vh] flex flex-col justify-center'>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb />
                    Startup Incubation
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Discover the ideal incubator that will provide the guidance, support, and resources needed to nurture your idea into a successful reality
                  </p>

                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      localStorage.setItem("fromMarketplace", "true");
                      setInternalView("incubators");
                    }}
                  >
                    Find an Incubator <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </DialogContent>
      </Dialog>

      {internalView === 'msmes' && (
        <MsmesView
          isOpen={true}
          onOpenChange={handleInternalViewClose('msmes')}
          isLoggedIn={isLoggedIn}
          hasSubscription={hasSubscription}
          setActiveView={setActiveView}
        />
      )}

      {internalView === 'browseTech' && (
        <TechTransferView
          isOpen={true}
          onOpenChange={handleInternalViewClose('browseTech')}
          setActiveView={setActiveView}
        />
      )}

      {internalView === 'incubators' && (
        <IncubatorsView
          isOpen={true}
          onOpenChange={handleInternalViewClose('incubators')}
          isLoggedIn={isLoggedIn}
          hasSubscription={hasSubscription}
          setActiveView={setActiveView}
        />
      )}
    </>
  );
}
