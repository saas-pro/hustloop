
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/app/types";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M17.6402 9.20455C17.6402 8.56818 17.5819 7.96136 17.4752 7.38636H9V10.8409H13.8402C13.6366 11.9773 12.9902 12.9318 12.0819 13.5227V15.8182H14.8093C16.5548 14.2841 17.6402 11.9773 17.6402 9.20455Z" fill="#4285F4"/>
        <path d="M9 18C11.4318 18 13.4682 17.1932 14.8091 15.8182L12.0818 13.5227C11.275 14.1023 10.2364 14.4545 9 14.4545C6.88636 14.4545 5.12045 13.0114 4.49091 11.1H1.66818V13.4091C3.04318 16.125 5.76136 18 9 18Z" fill="#34A853"/>
        <path d="M4.49091 11.1C4.28636 10.5227 4.17045 9.89773 4.17045 9.25C4.17045 8.60227 4.28636 7.97727 4.49091 7.4H1.66818V9.70909C1.23636 10.6682 1.23636 11.7273 1.66818 12.6955L4.49091 11.1Z" fill="#FBBC05"/>
        <path d="M9 3.54545C10.3773 3.54545 11.5227 4.02273 12.4227 4.86818L14.8705 2.41818C13.4682 1.13182 11.4318 0 9 0C5.76136 0 3.04318 1.875 1.66818 4.59091L4.49091 7.4C5.12045 5.48864 6.88636 3.54545 9 3.54545Z" fill="#EA4335"/>
    </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" {...props}>
        <path fill="#0A66C2" d="M22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0zM7.12 20.45H3.54V9h3.58v11.45zM5.33 7.42c-1.15 0-2.08-.93-2.08-2.08 0-1.15.93-2.08 2.08-2.08s2.08.93 2.08 2.08c0 1.15-.93 2.08-2.08 2.08zm13.12 13.03h-3.58V14.7c0-1.37-.03-3.13-1.9-3.13-1.9 0-2.2 1.48-2.2 3.03v5.85H7.18V9h3.44v1.57h.05c.48-.9 1.65-1.85 3.39-1.85 3.63 0 4.3 2.39 4.3 5.49v6.24z"/>
    </svg>
);

interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLoginSuccess: (role: UserRole) => void;
}

export default function LoginModal({ isOpen, setIsOpen, onLoginSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email-login') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password-login') as HTMLInputElement).value;

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let role: UserRole | null = null;
    if (email === 'admin@nexus.com' && password === 'admin') {
        role = 'admin';
    } else if (email === 'mentor@nexus.com' && password === 'mentor') {
        role = 'mentor';
    } else if (email === 'incubator@nexus.com' && password === 'incubator') {
        role = 'incubator';
    } else if (email === 'msme@nexus.com' && password === 'msme') {
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
    }

    setIsLoading(false);
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
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                </span>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email-login">Email</Label>
              <Input id="email-login" name="email-login" type="email" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password-login">Password</Label>
              <Input id="password-login" name="password-login" type="password" placeholder="••••••••" required disabled={isLoading} />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
