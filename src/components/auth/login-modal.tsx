
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/app/types";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.5 1.63-3.87 0-7.02-3.22-7.02-7.2s3.15-7.2 7.02-7.2c2.2 0 3.68.86 4.5 1.69l2.5-2.5C18.97 3.2 16.25 2 12.48 2 7.28 2 3.2 5.64 3.2 10.92s4.08 8.92 9.28 8.92c2.6 0 4.92-.87 6.56-2.54 1.74-1.74 2.23-4.25 2.23-6.58 0-.57-.05-.92-.12-1.28H12.48z" />
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
            description: "Invalid credentials. Please check the hint below.",
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
            <Button variant="outline"><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-secondary px-2 text-muted-foreground">
                    Or continue with email
                </span>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email-login">Email</Label>
              <Input id="email-login" name="email-login" type="email" defaultValue="admin@nexus.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password-login">Password</Label>
              <Input id="password-login" name="password-login" type="password" defaultValue="admin" required disabled={isLoading} />
            </div>
            <p className="text-xs text-muted-foreground text-center px-4">
                Use: admin@nexus.com (pw: admin), mentor@nexus.com (pw: mentor), incubator@nexus.com (pw: incubator), or msme@nexus.com (pw: msme).
            </p>
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
