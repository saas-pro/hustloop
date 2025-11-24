"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { API_BASE_URL } from "@/lib/api"

function VerifyContent() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const router = useRouter()
    const { toast } = useToast()

    const [status, setStatus] = useState<"loading" | "invalid" | "expired" | "error" | "success" | "already_registered">("loading")
    const [expiredData, setExpiredData] = useState<{ email: string; solution_id: string } | null>(null)
    const [isResending, setIsResending] = useState(false)

    useEffect(() => {
        const existingToken = localStorage.getItem("token");
        if (existingToken) {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            localStorage.removeItem('hasSubscription');
            localStorage.removeItem('appliedPrograms');
            localStorage.removeItem('token');
            localStorage.removeItem('authProvider');
            localStorage.removeItem('founder_role');
            toast({
                title: "Please login again",
            });
        }

        if (!token) {
            setStatus("invalid")
            toast({
                variant: "destructive",
                title: "Invalid or missing token"
            })
            return
        }

        function decodeToken(token: string) {
            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                return JSON.parse(atob(base64));
            } catch {
                return null;
            }
        }

        const verify = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/verify-team-member?token=${token}`);
                const data = await res.json();

                if (data.message.status === "expired") {
                    const decoded = decodeToken(token);
                    setStatus("expired");
                    setExpiredData({
                        email: decoded?.email,
                        solution_id: decoded?.solution_id
                    });

                    toast({
                        variant: "destructive",
                        title: "Invitation link expired",
                    });
                    return;
                }

                if (data.message.status === "success") {
                    setStatus("success");
                    toast({
                        title: "Verification successful",
                    });

                    setTimeout(() => {
                        router.push(data.redirect_to || "/");
                    }, 1500);
                    return;
                }

                if (data.message.status === "already_registered") {
                    setStatus("already_registered");
                    toast({
                        variant: "destructive",
                        title: "You are already registered",
                    });
                    setTimeout(() => {
                        router.push(data.redirect_to || "/");
                    }, 1000);
                    return;
                }


                setStatus("error");
                toast({
                    variant: "destructive",
                    title: "Verification failed",
                });

            } catch (error) {
                setStatus("error");
                toast({
                    variant: "destructive",
                    title: "Verification failed",
                });
            }
        };


        verify()
    }, [token, router, toast])

    const handleResend = async () => {
        if (!expiredData) return

        setIsResending(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/resend-invite-team-member`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(expiredData)
            })

            if (res.ok) {
                toast({
                    title: "Invitation link resent successfully"
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed to resend invitation"
                })
            }
        } catch {
            toast({
                variant: "destructive",
                title: "Failed to resend invitation"
            })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md text-center py-4">
                <CardHeader>
                    <div className="flex justify-center mb-4">
                        <Image
                            src="https://api.hustloop.com/static/images/logo.png"
                            width={120}
                            height={120}
                            alt="Hustloop Logo"
                            className="rounded-md"
                        />
                    </div>

                    <CardTitle className="text-xl font-semibold">Team Verification</CardTitle>

                    <CardDescription className="mt-2">
                        {status === "loading" && "Verifying your invitation..."}
                        {status === "invalid" && "Invalid or missing token."}
                        {status === "expired" && "Your invitation link has expired."}
                        {status === "error" && "Verification failed."}
                        {status === "success" && "Verified successfully! Redirecting..."}
                        {status === "already_registered" && "You are already registered! Redirecting..."}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center gap-4">
                    {(status === "loading" || status === "success" || status === "already_registered") && (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    )}

                    {status === "expired" && (
                        <Button onClick={handleResend} disabled={isResending}>
                            {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Resend Invitation
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    )
}
