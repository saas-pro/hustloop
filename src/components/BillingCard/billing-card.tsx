import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import plans from "../static_price";
import { toast } from "@/hooks/use-toast";


export default function PricingAccordion() {

    const handlePlanClick = (idx: number) => {
        if (idx === 0) {
            return;
        }

        if (idx === 1 || idx === 2) {
            toast({
                title: "Payment Integrated Coming Soon!"
            });
            return;
        }

        if (idx === 3) {
            window.location.href = "/contact-us";
        }
    };
    return (
        <div className="flex flex-col items-center relative py-16 md:py-20 bg-background">
            <div className="text-center mb-8 w-[95vw]">
                <h2 className="text-3xl font-bold font-headline">Our Pricing</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                    Choose a plan that&apos;s right for your startup. All plans are designed to help you succeed.
                </p>
            </div>

            <div className={`w-[95vw] max-w-7xl relative`}>
                <Accordion type="single" collapsible defaultValue="pricing-plans">
                    <AccordionItem
                        value="pricing-plans"
                        className={`rounded-xl border border-border px-6 shadow-xl shadow-primary/5`}
                    >
                        <AccordionTrigger className="w-full text-center text-xl font-semibold hover:no-underline p-6">
                            View Pricing Plans
                        </AccordionTrigger>

                        <AccordionContent className={`mt-4 rounded-xl `}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pt-4">
                                {plans.map((plan, idx) => (
                                    <Card
                                        key={plan.name}
                                        className={cn(
                                            "relative flex flex-col",
                                            plan.primary ? "border-primary border-2" : "border-border/50"
                                        )}
                                    >
                                        {plan.tag && (
                                            <Badge className="absolute top-[-12px] right-4 bg-accent text-accent-foreground hover:bg-accent/90">
                                                {plan.tag}
                                            </Badge>
                                        )}
                                        <CardHeader>

                                            <div className="flex items-center">
                                                <CardTitle>{plan.name}</CardTitle>
                                                {plan.offer && (
                                                    <Badge className="ml-2 bg-green-500/20 text-green-500 border border-green-500/50 rounded-sm py-1 px-2">{plan.offer}</Badge>
                                                )}
                                            </div>

                                            <CardDescription className="font-sans font-normal">{plan.description}</CardDescription>
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
                                            <div className="flex items-baseline gap-3 mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-4xl font-bold">{plan.price}
                                                        {plan.originally && (
                                                            <span className="text-3xl font-headline ml-2 text-muted-foreground line-through ">{plan.originally}</span>
                                                        )}
                                                    </span>
                                                    {(idx === 1 || idx === 2) && (
                                                        <span className="text-xs text-muted-foreground">INR + GST Applicable</span>
                                                    )}

                                                </div>

                                            </div>

                                            <Button
                                                onClick={() => handlePlanClick(idx)}
                                                disabled={idx === 0}
                                                className={cn(
                                                    "w-full",
                                                    plan.primary
                                                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                                                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                                                )}
                                            >
                                                {plan.cta}
                                            </Button>

                                            {plan.note && (
                                                <p className="text-xs text-muted-foreground mt-3 text-center w-full">{plan.note}</p>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    );
}