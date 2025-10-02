
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
import { Loader2, CheckCircle, Home } from "lucide-react";
import { X } from 'lucide-react'
import Image from "next/image";
import * as React from 'react';
import { Suspense, useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { API_BASE_URL } from "@/lib/api";

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

    const { formState: { isSubmitting }, reset } = form;

    const onSubmit = async (data: RegistrationSchema) => {
        const response = await fetch(`${API_BASE_URL}/api/agnite-registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: data.name,
                email_address: data.email,
                phone_number: data.phone,
                event: data.eventName,
            }),
        });
        toast({
            title: "Registration Successful!",
            description: `Thank you for registering for ${data.eventName}. We've sent a confirmation to your email.`,
        });
        if (!response.ok) {
            const errorData = await response.json();

            toast({
                title: 'Registration Failed',
                description: errorData.error || 'Something went wrong. Please try again.',
                variant: 'destructive',
            });

            return;
        }


        toast({
            title: 'Registration Successful!',
            description: `Thank you for registering for ${data.eventName}. We've sent a confirmation to your email.`,
        });
        reset({
            name: "",
            email: "",
            phone: "",
            eventName: eventName,
        });
    };



    return (
        <Card className="w-full md:w-[600px]">
            <div className="relative w-full">
                <CardHeader >
                    <CardTitle className="text-3xl font-bold font-headline capitalize">Register for {eventName}</CardTitle>
                    <CardDescription>Complete the form below to secure your spot.</CardDescription>
                </CardHeader>
                <Link
                    href="/"
                    className="absolute top-4 right-4 p-2"
                    aria-label="Close and return home"
                >
                    <X className="h-6 w-6 " />
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
    const router = useRouter();
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
            <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                <div onClick={() => router.push('/')} className="cursor-pointer">
                    <Image src="/logo.png" alt="Hustloop Logo" width={120} height={120} className="h-12 w-auto min-w-[120px] max-w-[200px] object-contain" />
                </div>
                <Link
                    href="/"
                    passHref
                    className="
                    relative pointer-events-auto typeform-trigger rounded-xl 
                    md:w-[3.5rem] md:h-[3.5rem] 
                    bg-white/10 flex items-center justify-center cursor-pointer 
                    
                    z-10 
                    md:border md:border-solid md:box-border md:backdrop-blur-md
                    ">
                    <button className="w-14 h-14 flex items-center justify-center">
                        <Home className="h-6 w-6" size={24}/>
                    </button>
                </Link>

            </div>
            <Header {...headerProps} />

            <main className="flex flex-col min-h-screen w-full" id="main-view1">
                {/* Form Section */}
                <section className="flex flex-col items-center justify-center pt-16 w-full flex-grow">
                    <Suspense fallback={<Loader2 className="h-16 w-16 animate-spin text-primary" />}>
                        <RegistrationForm />
                    </Suspense>
                </section>

                {/* Footer always at bottom */}
                <div className="w-full mt-6">
                    <Footer />
                </div>
            </main>



        </div>
    );
}
