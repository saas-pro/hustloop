
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
import type { UserRole } from "@/app/types";
import { API_BASE_URL } from "@/lib/api";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { useRouter } from "next/navigation";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

type AuthProvider = 'local' | 'google';

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLoginSuccess: (data: { role: UserRole, token: string, hasSubscription: boolean, name: string, email: string, authProvider: AuthProvider }) => void;
}

export default function LoginModal({ isOpen, setIsOpen, onLoginSuccess }: LoginModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { auth } = useFirebaseAuth();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState: { isSubmitting }, getValues } = form;

  const handleLogin = async (values: LoginSchema) => {
    // Special admin bypass for development
    if (
      values.email === "admin@hustloop.com" &&
      values.password === "Hustloop@Admin"
    ) {
      toast({
        title: "Admin Login Successful",
        description: "Welcome, Admin!",
      });
      setIsOpen(false);
      onLoginSuccess({
        role: "admin",
        token: "dev-admin-token",
        hasSubscription: true,
        name: "Admin",
        email: "admin@hustloop.com",
        authProvider: "local",
      });
      return;
    }
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is not available. Please try again later.' });
        return;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const firebaseUser = userCredential.user;
        if (!firebaseUser.emailVerified) {
            toast({
                variant: "destructive",
                title: "Email Not Verified",
                description: "Please check your inbox to verify your email address before logging in.",
            });
            return;
        }
        // Always call backend /api/login with Firebase ID token
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch(`${API_BASE_URL}/api/login`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${idToken}` },
        });
        const data = await response.json();
        setIsOpen(false);
        if (data.action === 'complete-profile' && data.token) {
          router.push(`/complete-profile?token=${data.token}`);
          return;
        }
        if (response.ok) {
          const normalizedAuthProvider = data.authProvider === 'password' ? 'local' : data.authProvider || 'local';
          onLoginSuccess({
            role: data.role || 'founder',
            token: data.token || idToken,
            hasSubscription: data.hasSubscription || false,
            name: data.name || firebaseUser.displayName || '',
            email: data.email || firebaseUser.email || '',
            authProvider: normalizedAuthProvider,
          });
          return;
        } else {
          toast({ variant: 'destructive', title: 'Login Failed', description: data.error || 'An error occurred.' });
          return;
        }
    } catch (error: any) {
        let title = "Login Failed";
        let description = "An unexpected error occurred. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            description = "Invalid email or password.";
        } else if (error.code === 'auth/invalid-api-key') {
            description = "API key is not valid. Please check your configuration."
        }
        toast({ variant: "destructive", title, description });
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is not available. Please try again later.' });
        return;
    }
    const authProvider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, authProvider);
      const idToken = await result.user.getIdToken();
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` },
      });
      const data = await response.json();
      setIsOpen(false);
      if (data.action === 'complete-profile' && data.token) {
        router.push(`/complete-profile?token=${data.token}`);
        return;
      }
      if (response.ok) {
        onLoginSuccess({
          role: data.role || 'founder',
          token: data.token || idToken,
          hasSubscription: data.hasSubscription || false,
          name: data.name || result.user.displayName || '',
          email: data.email || result.user.email || '',
          authProvider: 'google',
        });
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: data.error || 'An error occurred.' });
      }
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
  
  const handlePasswordReset = async () => {
    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service is not available. Please try again later.' });
        return;
    }
    const email = getValues("email");
    if (!email) {
        toast({
            variant: "destructive",
            title: "Email Required",
            description: "Please enter your email address to reset your password.",
        });
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        toast({
            title: "Password Reset Email Sent",
            description: "Please check your inbox for instructions to reset your password.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Failed to Send Email",
            description: "Could not send password reset email. Please check the address and try again.",
        });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Access your hustloop account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" onClick={() => handleSocialLogin('google')}><GoogleIcon className="mr-2 h-4 w-4" /> Sign in with Google</Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background/80 px-2 text-muted-foreground backdrop-blur-sm">
                    Or continue with email
                </span>
            </div>
        </div>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
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
                    <div className="flex justify-between">
                        <FormLabel>Password</FormLabel>
                        <Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={handlePasswordReset}>Forgot password?</Button>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Login
                </Button>
              </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
