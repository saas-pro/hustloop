
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { 
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useRouter } from "next/navigation";
import Script from 'next/script';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string()
        .min(10, { message: "Password must be at least 10 characters long." })
        .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
        .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
        .regex(/[0-9]/, { message: "Must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character." }),
});

type SignupSchema = z.infer<typeof signupSchema>;


interface SignupModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

declare global {
    interface Window {
        grecaptcha: any;
    }
}

export default function SignupModal({ isOpen, setIsOpen }: SignupModalProps) {
    const { toast } = useToast();
    const router = useRouter();
    const { auth } = useFirebaseAuth();
    const form = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });
    
    const { formState: { isSubmitting } } = form;

    const executeRecaptcha = (callback: (token: string) => void) => {
        if (!window.grecaptcha) {
            toast({ variant: 'destructive', title: 'reCAPTCHA Error', description: 'reCAPTCHA not loaded. Please try again.' });
            return;
        }
        window.grecaptcha.enterprise.ready(() => {
            window.grecaptcha.enterprise.execute('6LfZ4H8rAAAAAA0NMVH1C-sCiE9-Vz4obaWy9eUI', { action: 'register' }).then(callback);
        });
    };

    const handleSignup = (values: SignupSchema) => {
        executeRecaptcha(async (recaptchaToken: string) => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...values, recaptchaToken }),
                });

                const data = await response.json();

                if (response.ok) {
                    toast({
                        title: "Registration Successful",
                        description: "Your account has been created. Please check your email to verify your account.",
                    });
                    setIsOpen(false);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Registration Failed",
                        description: data.error || 'An unexpected error occurred.',
                    });
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Registration Failed",
                    description: "Could not connect to the server. Please try again later.",
                });
            }
        });
    };

    const handleSocialLogin = async (provider: 'google') => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is not available. Please try again later.' });
            return;
        }
        const authProvider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, authProvider);
            toast({ title: "Login Successful", description: `Welcome, ${result.user.displayName || result.user.email}!` });
            setIsOpen(false);
            // Optionally update UI or redirect
        } catch (error: any) {
            let description = error.message || 'An error occurred while signing in.';
            if (error.code === 'auth/invalid-api-key' || error.message.includes('api-key-not-valid')) {
                description = "The provided API key is not valid. Please check your Firebase project configuration."
            } else if (error.code === 'auth/popup-closed-by-user') {
                description = "Sign-in was cancelled. Please try again."
            }
            toast({
                variant: 'destructive',
                title: 'Social Login Failed',
                description: description,
            });
        }
    };

  return (
    <>
    <Script
        src="https://www.google.com/recaptcha/enterprise.js?render=6LfZ4H8rAAAAAA0NMVH1C-sCiE9-Vz4obaWy9eUI"
        strategy="lazyOnload"
    />
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg auth-modal-glow overflow-hidden">
        <DialogHeader className="text-center">
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            Join hustloop to start your journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4">
             <Button variant="outline" onClick={() => handleSocialLogin('google')}><GoogleIcon className="mr-2 h-4 w-4" /> Sign up with Google</Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-2 text-muted-foreground backdrop-blur-sm">
                    Or continue with
                </span>
            </div>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Your Name" {...field} disabled={isSubmitting} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">
                                Must be at least 10 characters and contain an uppercase, lowercase, number, and special character.
                            </p>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
    </>
  );
}
