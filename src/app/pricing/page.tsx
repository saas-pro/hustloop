import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import plans from "../../components/static_price";

export default function PricingPage() {
    return (
        <div className="container mx-auto py-12">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold font-headline">Our Pricing</h1>
                <p className="max-w-xl mx-auto text-muted-foreground mt-2">
                    Choose a plan that&apos;s right for your startup. All plans are designed to help you succeed.
                </p>
            </div>

            <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pt-4">
                    {plans.map((plan, idx) => (
                        <Card
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col bg-card/50 backdrop-blur-sm",
                                plan.primary ? "border-primary ring-2 ring-primary" : "border-border/50"
                            )}
                        >
                            <CardHeader>
                                {plan.tag && (
                                    <Badge className="absolute top-[-12px] right-4 bg-accent text-accent-foreground hover:bg-accent/90">
                                        {plan.tag}
                                    </Badge>
                                )}
                                <div className="flex items-center">
                                    <CardTitle>{plan.name}</CardTitle>
                                    {plan.offer && (
                                        <Badge className="ml-2 bg-green-100 text-green-800 border rounded-sm py-1 px-2">{plan.offer}</Badge>
                                    )}
                                </div>

                                <CardDescription>{plan.description}</CardDescription>
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
                                    {plan.originally && (
                                        <span className="text-3xl  text-muted-foreground line-through">{plan.originally}</span>
                                    )}

                                    <div className="flex flex-col">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            {(idx === 1 || idx === 2) && (
                                                <span className="text-xs text-muted-foreground">INR (including GST)</span>
                                            )}
                                        </div>
                                </div>

                                <Button
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
            </ScrollArea>
        </div>
    );
}
