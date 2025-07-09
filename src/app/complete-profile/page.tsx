
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import * as React from 'react';
import { Suspense } from 'react';
import { API_BASE_URL } from "@/lib/api";

const profileSchema = z.object({
  role: z.string({ required_error: "Please select a role." }),
});

type ProfileSchema = z.infer<typeof profileSchema>;

function CompleteProfileForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const token = searchParams.get('token');

    const form = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (values: ProfileSchema) => {
        if (!token) {
            toast({ variant: "destructive", title: "Error", description: "Invalid session. Please try logging in again." });
            router.push('/');
            return;
        }

        try {
            const apiBaseUrl = API_BASE_URL;
            const response = await fetch(`${apiBaseUrl}/api/complete-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Profile Complete!",
                    description: "Your role has been set. Your account is now pending admin approval.",
                });
                // Redirect to home page, which will show a toast based on the status param
                router.push('/?status=pending_approval');
            } else {
                toast({
                    variant: "destructive",
                    title: "Submission Failed",
                    description: data.error || "An unknown error occurred.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Could not connect to the server. Please try again later.",
            });
        }
    };
    
    if (!token) {
         return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>Invalid Link</CardTitle>
                        <CardDescription>This profile completion link is invalid or has expired. Please try signing up again.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button className="w-full" onClick={() => router.push('/')}>Go to Homepage</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div
              className="flex items-center gap-2 cursor-pointer mb-8"
              onClick={() => router.push('/')}
            >
              <div className="logo-container" style={{'--logo-size': '2.5rem'} as React.CSSProperties}>
                <Image src="/logo.png" alt="Hustloop Logo" width={40} height={40} className="h-10 w-10 logo-image" />
              </div>
              <span className="font-headline text-2xl" style={{ color: '#facc15' }}>
                hustl<strong className="text-3xl align-middle font-bold">∞</strong>p
              </span>
            </div>
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle>One Last Step!</CardTitle>
                    <CardDescription>Please tell us who you are to complete your profile.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>I want to register as a...</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select your role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="founder">Founder</SelectItem>
                                                <SelectItem value="mentor">Mentor</SelectItem>
                                                <SelectItem value="incubator">Incubator</SelectItem>
                                                <SelectItem value="msme">MSME</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Complete Registration
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}


export default function CompleteProfilePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        }>
            <CompleteProfileForm />
        </Suspense>
    );
}
