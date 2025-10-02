
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { X } from 'lucide-react'
import Image from "next/image";
import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const registrationSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(10, { message: "Please enter a valid phone number." }),
    eventName: z.string(),
});

type RegistrationSchema = z.infer<typeof registrationSchema>;

function RegistrationForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const eventName = "Aignite";

    const form = useForm<RegistrationSchema>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            eventName: eventName,
        },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (data: RegistrationSchema) => {
        // Here you would typically send the data to your backend
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        toast({
            title: "Registration Successful!",
            description: `Thank you for registering for ${data.eventName}. We've sent a confirmation to your email.`,
        });
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <Card className="w-full max-w-lg">
                <CardContent className="flex flex-col items-center justify-center text-center p-8 gap-4">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                    <h2 className="text-2xl font-bold">Registration Successful!</h2>
                    <p className="text-muted-foreground">
                        Thank you for registering. A confirmation email has been sent to you. We look forward to seeing you there!
                    </p>
                    <Button onClick={() => router.push('/')}>Back to Home</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-lg">
            <div className=" relative">
                <CardHeader >
                    <CardTitle className="text-3xl font-bold font-headline capitalize">Register for {eventName}</CardTitle>
                    <CardDescription>Complete the form below to secure your spot.</CardDescription>

                </CardHeader>
                <Link
                href="/"
                className="absolute top-4 right-4 p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Close and return home"
            >
                <X className="h-6 w-6 text-foreground" />
            </Link>
            </div>

            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter your full name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="you@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input type="tel" placeholder="Enter your phone number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="eventName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Event</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly className="bg-muted capitalize" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Registration
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

export default function StaticFormPage() {
    const [navOpen, setNavOpen] = useState(false);

    useEffect(() => {
        if (navOpen) {
            // lock body scroll
            document.body.style.overflow = "hidden";

            // scroll to form section
            const formSection = document.getElementById("form-section");
            if (formSection) {
                formSection.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else {
            // unlock body scroll
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [navOpen]);


    const headerProps = {
        activeView: "home" as const,
        setActiveView: () => { },
        isLoggedIn: false,
        onLogout: () => { },
        isLoading: false,
        isStaticPage: true,
        navOpen,
        setNavOpen,
        heroVisible: false
    };

    return (
        <div className="overflow-hidden relative flex flex-col min-h-screen bg-background">
            <Header {...headerProps} />
            <main className="flex-grow min-h-screen" id="main-view1">
                <section id="form-section" className="flex flex-col items-center justify-center pt-16">
                    <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin text-primary" />}>
                        <RegistrationForm />
                    </Suspense>
                    <div className="w-full pt-4">
                        <Footer />
                    </div>
                </section>

            </main>
        </div>

    );
}
