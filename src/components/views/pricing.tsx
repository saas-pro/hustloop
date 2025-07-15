
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const plans = [
  {
    name: "Basic",
    price: "₹999",
    period: "/month",
    description: "For individuals getting started.",
    features: [
      "Access to all incubators",
      "Submit 1 idea to Incubators",
      "30 days duration",
      "Basic support",
    ],
    cta: "Get Started",
    primary: false,
    note: "Payment integration coming soon. You will be notified before your plan ends."
  },
  {
    name: "Pro",
    tag: "Popular",
    price: "₹1999",
    period: "/month",
    description: "For growing teams that need more access and support.",
    features: [
      "Access to all incubators",
      "Submit up to 2 ideas to incubators and 1 to MSME",
      "45 days duration",
      "Priority support",
      "Basic analytics",
    ],
    cta: "Get Started",
    primary: true,
    note: "Payment integration coming soon. You will be notified before your plan ends."
  },
  {
    name: "Premium",
    price: "₹2999",
    period: "/month",
    description: "For established businesses and enterprises.",
    features: [
      "Access to all incubators",
      "Submit up to 3 ideas to incubators and 2 to MSME",
      "60 days duration",
      "24/7 priority support",
      "Advanced analytics",
      "Custom reports"
    ],
    cta: "Get Started",
    primary: false,
    note: "Payment integration coming soon. You will be notified before your plan ends."
  },
];

interface PricingViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onGetStartedClick: () => void;
}

export default function PricingView({ isOpen, onOpenChange, onGetStartedClick }: PricingViewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-center font-headline">Our Pricing</DialogTitle>
            <DialogDescription className="text-center max-w-xl mx-auto">Choose a plan that&apos;s right for your startup. All plans are designed to help you succeed.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-full mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto pt-4">
                {plans.map((plan) => (
                <Card key={plan.name} className={cn("relative flex flex-col bg-card/50 backdrop-blur-sm", plan.primary ? "border-primary ring-2 ring-primary" : "border-border/50")}>
                    <CardHeader>
                    {plan.tag && <Badge className="absolute top-[-12px] right-4 bg-accent text-accent-foreground hover:bg-accent/90">{plan.tag}</Badge>}
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div>
                        <span className="text-4xl font-bold">{plan.price}</span>
                        {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <ul className="space-y-3">
                        {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                            <span>{feature}</span>
                        </li>
                        ))}
                    </ul>
                    </CardContent>
                    <CardFooter className="flex-col items-start mt-4">
                    <Button onClick={onGetStartedClick} className={cn("w-full", plan.primary ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90")}>
                        {plan.cta}
                    </Button>
                    {plan.note && <p className="text-xs text-muted-foreground mt-3 text-center w-full">{plan.note}</p>}
                    </CardFooter>
                </Card>
                ))}
            </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
