
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/app/types";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.42-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path fill="#0A66C2" d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0zM7.12 20.45H3.54V9h3.58v11.45zM5.33 7.42c-1.15 0-2.08-.93-2.08-2.08 0-1.15.93-2.08 2.08-2.08s2.08.93 2.08 2.08c0 1.15-.93 2.08-2.08 2.08zm13.12 13.03h-3.58V14.7c0-1.37-.03-3.13-1.9-3.13-1.9 0-2.2 1.48-2.2 3.03v5.85H7.18V9h3.44v1.57h.05c.48-.9 1.65-1.85 3.39-1.85 3.63 0 4.3 2.39 4.3 5.49v6.24z"/>
    </svg>
);

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginSchema = z.infer<typeof loginSchema>;

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export default function LoginModal({ isOpen, setIsOpen, onLoginSuccess }: LoginModalProps) {
  const { toast } = useToast();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { formState: { isSubmitting } } = form;

  const handleLogin = async (values: LoginSchema) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let role: UserRole | null = null;
    if (values.email === 'admin@nexus.com' && values.password === 'admin') {
        role = 'admin';
    } else if (values.email === 'mentor@nexus.com' && values.password === 'mentor') {
        role = 'mentor';
    } else if (values.email === 'incubator@nexus.com' && values.password === 'incubator') {
        role = 'incubator';
    } else if (values.email === 'msme@nexus.com' && values.password === 'msme') {
        role = 'msme';
    }

    if (role) {
        toast({
            title: "Login Successful",
            description: `Welcome back, ${role}!`,
        });
        onLoginSuccess(role);
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid credentials. Please try again.",
        });
        form.setError("password", { type: "custom", message: "Invalid credentials." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Access your Nexus Platform account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline"><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline"><LinkedinIcon className="mr-2 h-4 w-4" /> LinkedIn</Button>
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
                    <FormLabel>Password</FormLabel>
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
