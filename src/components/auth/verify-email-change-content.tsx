"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";

export default function VerifyEmailChangeContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);

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

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Verification failed");
                }

                toast({
                    title: "Success",
                    description: "Your email has been updated successfully!",
                });

                router.push("/");
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "The verification link is invalid or expired.",
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
