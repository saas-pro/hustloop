"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import plans from "../../components/static_price";
import { Card, CardContent, CardHeader, CardFooter, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function PricingPageClient() {
    const router = useRouter();
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
        <div className="flex flex-col">
            <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                <div onClick={() => router.push('/')} className="cursor-pointer">
                    <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} />
                </div>
                <Link href="/" passHref>
                    <Button variant="outline" size="icon" aria-label="Home">
                        <Home className="h-5 w-5" />
                    </Button>
                </Link>
            </div>
            <div className="container mx-auto pt-12 mt-5">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold font-headline">Our Pricing</h1>
                    <p className="max-w-xl mx-auto text-muted-foreground mt-2">
                        Choose a plan that&apos;s right for your startup. All plans are designed to help you succeed.
                    </p>
                </div>

                <ScrollArea className="h-full">
                    <div className="grid grid-cols-1 p-2 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pt-4">
                        {plans.map((plan, idx) => (
                            <Card
                                key={plan.name}
                                className={cn(
                                    "relative flex flex-col bg-card/50 backdrop-blur-sm",
                                    plan.primary ? "ring-2 ring-primary" : "border-border/50"
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
                </ScrollArea>
                <div className="block w-full mt-6">
                    <Footer />
                </div>
            </div>
        </div>
    );
}
