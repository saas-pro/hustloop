"use client";

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { checkActionCode, applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';

type Action = 'resetPassword' | 'verifyEmail' | null;

const passwordResetSchema = z.object({
  password: z.string()
    .min(10, { message: "Password must be at least 10 characters long." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

type PasswordResetValues = z.infer<typeof passwordResetSchema>;

const resendSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});
type ResendValues = z.infer<typeof resendSchema>;


const ResendVerificationForm = () => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<ResendValues>({
        resolver: zodResolver(resendSchema),
    });

    const onSubmit = async (data: ResendValues) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (response.ok) {
                toast({ title: "Email Sent", description: result.message });
                router.push('/');
            } else {
                let errorMsg = result.error;
                if (errorMsg && errorMsg.toLowerCase().includes('already verified')) {
                    errorMsg = "This email is already verified. Please log in.";
                }
                toast({ variant: "destructive", title: "Failed to send", description: errorMsg });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the server." });
        }
    };

    return (
        <div>
            <CardHeader className="text-center">
                <CardTitle>Link Expired or Invalid</CardTitle>
                <CardDescription>This verification link has expired. Please enter your email to receive a new one.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Resend Verification Link
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </div>
    );
};


const ActionHandlerContent: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const { auth } = useFirebaseAuth();

    const [mode, setMode] = React.useState<Action>(null);
    const [actionCode, setActionCode] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [showResendForm, setShowResendForm] = React.useState(false);
    const [info, setInfo] = React.useState<{ email: string; from: 'verifyEmail' | 'resetPassword' } | null>(null);
    const [success, setSuccess] = React.useState(false);
    const [redirecting, setRedirecting] = React.useState(false);
    // Moved up: fallback email verification check states
    const [showCheckVerification, setShowCheckVerification] = React.useState(false);
    const [checkEmail, setCheckEmail] = React.useState("");
    const [checking, setChecking] = React.useState(false);
    const [checkResult, setCheckResult] = React.useState<null | "verified" | "not_verified" | "error">(null);
    const [checkError, setCheckError] = React.useState("");
    
    const form = useForm<PasswordResetValues>({
        resolver: zodResolver(passwordResetSchema),
    });

    React.useEffect(() => {
        const modeParam = searchParams.getAll('mode')[0] as Action; // Always get the first mode param
        const codeParam = searchParams.get('oobCode');
        
        setMode(modeParam);
        setActionCode(codeParam);
        
        if (!auth || !modeParam || !codeParam) {
            if(!auth) setLoading(false);
            if (!modeParam || !codeParam) {
                 setError("This link is invalid, expired, or has already been used. Please log in or request a new verification email.");
                 setLoading(false);
            }
            return;
        }

        const handleAction = async () => {
            try {
                const actionInfo = await checkActionCode(auth, codeParam);
                const { operation } = actionInfo;
                const { email } = actionInfo.data;

                if (!email) {
                    throw new Error("Invalid action code: email is missing.");
                }

                if (operation === 'VERIFY_EMAIL') {
                    await applyActionCode(auth, codeParam);
                    setSuccess(true);
                    setInfo({ email, from: 'verifyEmail' });
                } else if (operation === 'PASSWORD_RESET') {
                    await verifyPasswordResetCode(auth, codeParam); // Verify code is valid
                    setInfo({ email, from: 'resetPassword' });
                } else {
                    throw new Error("Unsupported action.");
                }
            } catch (err: any) {
                if (err.code === 'auth/invalid-action-code') {
                    setShowResendForm(true);
                } else {
                    setError("An unexpected error occurred. Please try again.");
                }
            } finally {
                setLoading(false);
            }
        };
        
        handleAction();

    }, [searchParams, auth]);

    const handlePasswordResetSubmit = async (data: PasswordResetValues) => {
        if (!auth || !actionCode) return;
        
        try {
            await confirmPasswordReset(auth, actionCode, data.password);
            setSuccess(true);
        } catch (err) {
            setError("Failed to reset password. The link may have expired. Please try again.");
        }
    }

    if (loading) {
        return (
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Verifying link...</p>
            </div>
        );
    }

    if (showResendForm) {
        return <ResendVerificationForm />;
    }
    
    if (error) {
        return (
            <div className="text-center">
                <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Action Failed</h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="flex flex-col gap-2 items-center">
                  <Button onClick={() => router.push('/')} variant="secondary">Go to Homepage</Button>
                  <Button onClick={() => router.push('/?action=login')} variant="default">Go to Login</Button>
                  <Button onClick={() => setShowResendForm(true)} variant="outline">Resend Verification Email</Button>
                </div>
            </div>
        );
    }

    if (success) {
         if (info?.from === 'verifyEmail') {
             setRedirecting(true);
             // After verification, check if profile is complete
             (async () => {
                 try {
                     const response = await fetch(`${API_BASE_URL}/api/check-profile`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({ email: info.email })
                     });
                     const data = await response.json();
                     if (response.ok && data.profileComplete) {
             toast({
                title: "Email Verified!",
                description: "Your account is now active. You can log in.",
             });
             router.push('/?action=login&from=verification_success');
                     } else if (data.token) {
                         toast({
                             title: "Email Verified!",
                             description: "Please complete your profile to continue.",
                         });
                         router.push(`/complete-profile?token=${data.token}`);
                     } else {
                         toast({
                             title: "Email Verified!",
                             description: "Please complete your profile to continue.",
                         });
                         router.push('/');
                     }
                 } catch (e) {
                     toast({
                         title: "Email Verified!",
                         description: "Please log in.",
                     });
                     router.push('/?action=login&from=verification_success');
                 } finally {
                     setRedirecting(false);
                 }
             })();
             return null;
         }
        if (info?.from === 'resetPassword') {
            toast({
                title: "Password Changed!",
                description: "Your password has been reset successfully. Please log in.",
            });
            router.push('/?action=login&from=reset_success');
            return null;
        }
    }

    if (redirecting) {
        return (
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Redirecting...</p>
            </div>
        );
    }

    if (mode === 'resetPassword' && info) {
        return (
            <div>
                <CardHeader className="text-center">
                    <CardTitle>Reset Your Password</CardTitle>
                    <CardDescription>Enter a new password for {info.email}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(handlePasswordResetSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm New Password</FormLabel>
                                        <FormControl><Input type="password" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save New Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </div>
        );
    }

    // Fallback for any other state
    return (
        <div className="text-center">
            <CardHeader className="text-center">
                <CardTitle>Check Email Verification</CardTitle>
                <CardDescription>Enter your email to check if it has been verified.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    setChecking(true);
                    setCheckResult(null);
                    setCheckError("");
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/check-verification-status`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: checkEmail })
                        });
                        const data = await response.json();
                        if (response.ok && data.email_verified) {
                            setCheckResult("verified");
                        } else if (response.ok && !data.email_verified) {
                            setCheckResult("not_verified");
                        } else {
                            setCheckResult("error");
                            setCheckError(data.error || "Unknown error");
                        }
                    } catch (err) {
                        setCheckResult("error");
                        setCheckError("Network error");
                    } finally {
                        setChecking(false);
                    }
                }} className="space-y-4">
                    <Input type="email" placeholder="you@example.com" value={checkEmail} onChange={e => setCheckEmail(e.target.value)} required />
                    <Button type="submit" className="w-full" disabled={checking}>{checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Check Verification Status"}</Button>
                </form>
                {checkResult === "verified" && (
                    <div className="mt-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="font-semibold">Your email is verified! Please log in.</p>
                        <Button className="mt-2" onClick={() => router.push('/?action=login')}>Go to Login</Button>
                    </div>
                )}
                {checkResult === "not_verified" && (
                    <div className="mt-4">
                        <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="font-semibold">Your email is not verified yet.</p>
                        <Button className="mt-2" onClick={() => setShowResendForm(true)}>Resend Verification Email</Button>
                    </div>
                )}
                {checkResult === "error" && (
                    <div className="mt-4 text-destructive">{checkError}</div>
                )}
                <Button onClick={() => router.push('/')} className="mt-4" variant="secondary">Go to Homepage</Button>
            </CardContent>
        </div>
    );
};


export default function AuthActionPage() {
    const router = useRouter();

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
                <React.Suspense fallback={
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                }>
                    <ActionHandlerContent />
                </React.Suspense>
            </Card>
        </div>
    );
}