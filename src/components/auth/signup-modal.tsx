
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const signupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    role: z.string({ required_error: "Please select a role." }),
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

export default function SignupModal({ isOpen, setIsOpen }: SignupModalProps) {
    const { toast } = useToast();
    const form = useForm<SignupSchema>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });
    
    const { formState: { isSubmitting } } = form;

    const handleSignup = async (values: SignupSchema) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
            title: "Registration Successful",
            description: "This is a demonstration. You can now use the default credentials to log in.",
        });
        setIsOpen(false);
    };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            Join hustloop to start your journey.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" disabled={isSubmitting}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
            <Button variant="outline" disabled={isSubmitting}><LinkedinIcon className="mr-2 h-4 w-4" /> LinkedIn</Button>
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
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>I am a</FormLabel>
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
  );
}
