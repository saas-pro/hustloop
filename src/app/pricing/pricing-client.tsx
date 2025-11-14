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

export default function PricingPageClient() {
    const [navOpen, setNavOpen] = useState(false);
    const router = useRouter();
    const headerProps = {
        activeView: 'home' as const,
        setActiveView: () => { },
        isLoggedIn: false,
        onLogout: () => { },
        isLoading: false,
        isStaticPage: true,
        navOpen,
        setNavOpen,
        heroVisible: false,
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
            <Header {...headerProps} />
            <main
                className={`flex-grow container relative z-40 ultrawide-fix m-auto pointer-events-auto px-4 py-12 md:pb-4 md:pt-14 ${navOpen ? 'overflow-hidden' : 'overflow-auto'
                    } pt-20 md:pt-0`}
                id="main-view2"
                data-alt-id="card-anchor"
            >
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
                    <div className="block w-full mt-6">
                        <Footer />
                    </div>
                </div>
            </main>
        </div>
    );
}
