import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import plans from "../static_price";


export default function PricingAccordion() {
    return (
        <div className="flex flex-col items-center relative py-16 md:py-20 bg-background">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold font-headline">Our Pricing</h1>
                <p className="text-muted-foreground max-w-xl mx-auto mt-2">
                    Choose a plan that&apos;s right for your startup. All plans are designed to help you succeed.
                </p>
            </div>

            <div className={`w-full max-w-6xl relative z-0`}>
                <Accordion type="single" collapsible>
                    <AccordionItem
                        value="pricing-plans"
                        // Removed fancy class from AccordionItem
                        className={`rounded-xl border border-border/50 bg-card `} // Keep base styling
                    >
                        <AccordionTrigger className="w-full text-center text-xl font-semibold hover:no-underline p-6"> {/* Added p-6 here */}
                            View Pricing Plans
                        </AccordionTrigger>
                        {/* Apply fancy class directly to AccordionContent */}
                        <AccordionContent className={`mt-4 rounded-xl `}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-6"> {/* Added p-6 for inner padding */}
                                {plans.map((plan) => (
                                    <Card
                                        key={plan.name}
                                        className={cn(
                                            "relative flex flex-col bg-card/50 backdrop-blur-sm",
                                            plan.primary ? "border-primary ring-2 ring-primary" : "border-border/50"
                                        )}
                                    >
                                        <CardHeader className="flex-grow-[0.4]">
                                            {plan.tag && (
                                                <Badge className="absolute top-[-12px] right-4 bg-accent text-accent-foreground hover:bg-accent/90">
                                                    {plan.tag}
                                                </Badge>
                                            )}
                                            <div className="flex-grow">
                                                <CardTitle>{plan.name}</CardTitle>
                                                <CardDescription className="mt-2">{plan.description}</CardDescription>
                                            </div>
                                            <div>
                                                <span className="text-4xl font-bold">{plan.price}</span>
                                                
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
                                            <Button
                                                className={cn(
                                                    "w-full",
                                                    plan.primary ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-primary text-primary-foreground hover:bg-primary/90"
                                                )}
                                            >
                                                {plan.cta}
                                            </Button>
                                            {plan.note && <p className="text-xs text-muted-foreground mt-3 text-center w-full">{plan.note}</p>}
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