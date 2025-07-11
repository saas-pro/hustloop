
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string()
    .min(10, { message: "Password must be at least 10 characters long." })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Must contain at least one number." })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain at least one special character." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function PasswordChangeForm() {
    const { toast } = useToast();
    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordFormSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const { formState: { isSubmitting } } = form;

    const onSubmit = async (data: PasswordFormValues) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Your password has been updated successfully.",
                });
                form.reset();
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: result.error || "An unknown error occurred.",
                });
            }

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not update password. Please try again later.",
            });
        }
    };

    return (
        <div>
            <h3 className="text-lg font-medium mb-4">Change Password</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl><Input type="password" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl><Input type="password" {...field} disabled={isSubmitting} /></FormControl>
                                <p className="text-xs text-muted-foreground">Must be 10+ characters with uppercase, lowercase, number, and special character.</p>
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
                                <FormControl><Input type="password" {...field} disabled={isSubmitting} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Password
                    </Button>
                </form>
            </Form>
        </div>
    );
}
