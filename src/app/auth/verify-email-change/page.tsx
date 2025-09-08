"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; 
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyEmailChangePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token"); 
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!token) return;

        const verifyEmailChange = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/verify-email-change`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                });


                if (!res.ok) {
                    throw new Error("Verification failed");
                }

                toast({
                    title: "✅ Success",
                    description: "Your email has been updated successfully!",
                });

                router.push("/"); // ✅ works fine in App Router
            } catch (error) {
                toast({
                    title: "❌ Error",
                    description: "The verification link is invalid or expired.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        verifyEmailChange();
    }, [token, router, toast]);

    return (
        <div className="flex h-screen items-center justify-center">
            {loading ? (
                <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>Verifying your email...</p>
                </div>
            ) : (
                <p>Redirecting...</p>
            )}
        </div>
    );
}
