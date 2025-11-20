'use client';

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

interface MarketplaceViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  setActiveView: (view: View) => void;
}

export default function MarketplaceView({ isOpen, onOpenChange, setActiveView }: MarketplaceViewProps) {

  return (
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle />
                  Solve Corporate & MSME Challenges
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Apply your skills to solve real-world problems posted by companies and MSMEs. Get rewarded and gain valuable experience.
                </p>

                <Button
                  onClick={() => {
                    localStorage.setItem("fromMarketplace", "true");
                    setActiveView("msmes");   
                  }}
                >
                  Browse Challenges <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tech">
            <Card>
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

                <Button onClick={() => setActiveView("browseTech")}>
                  Browse Technologies <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incubators">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb />
                  Startup Incubation
                </CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Find the perfect incubator to nurture your idea.
                </p>

                <Button
                  onClick={() => {
                    localStorage.setItem("fromMarketplace", "true");
                    setActiveView("incubators");  
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
  );
}
