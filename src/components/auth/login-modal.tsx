"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin } from "lucide-react";

// Google SVG Icon
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.5 1.63-3.87 0-7.02-3.22-7.02-7.2s3.15-7.2 7.02-7.2c2.2 0 3.68.86 4.5 1.69l2.5-2.5C18.97 3.2 16.25 2 12.48 2 7.28 2 3.2 5.64 3.2 10.92s4.08 8.92 9.28 8.92c2.6 0 4.92-.87 6.56-2.54 1.74-1.74 2.23-4.25 2.23-6.58 0-.57-.05-.92-.12-1.28H12.48z" />
    </svg>
);


interface LoginModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, setIsOpen, onLoginSuccess }: LoginModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
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
              <Input id="email-login" type="email" defaultValue="admin@nexus.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password-login">Password</Label>
              <Input id="password-login" type="password" defaultValue="admin" required />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Login</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
