
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Linkedin, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignupModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.5 1.63-3.87 0-7.02-3.22-7.02-7.2s3.15-7.2 7.02-7.2c2.2 0 3.68.86 4.5 1.69l2.5-2.5C18.97 3.2 16.25 2 12.48 2 7.28 2 3.2 5.64 3.2 10.92s4.08 8.92 9.28 8.92c2.6 0 4.92-.87 6.56-2.54 1.74-1.74 2.23-4.25 2.23-6.58 0-.57-.05-.92-.12-1.28H12.48z" />
    </svg>
);


export default function SignupModal({ isOpen, setIsOpen }: SignupModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState("");
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Registration Successful",
            description: "This is a demonstration. You can now use the default credentials to log in.",
        });
        setIsOpen(false);
        setIsLoading(false);
    };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            Join the Nexus Platform to start your journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={isLoading}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline" disabled={isLoading}><Linkedin className="mr-2 h-4 w-4" /> LinkedIn</Button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-secondary px-2 text-muted-foreground">
                    Or continue with
                </span>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" type="text" placeholder="Your Name" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">I am a</Label>
              <Select name="role" required onValueChange={setRole} disabled={isLoading}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="founder">Founder</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="incubator">Incubator</SelectItem>
                  <SelectItem value="msme">MSME</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-signup">Email</Label>
              <Input id="email-signup" name="email-signup" type="email" placeholder="you@example.com" required disabled={isLoading} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input id="password-signup" name="password-signup" type="password" placeholder="••••••••" required disabled={isLoading} />
                <p className="text-xs text-muted-foreground">
                    Password must be at least 10 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.
                </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
