"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import {
  checkActionCode,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { API_BASE_URL } from "@/lib/api";

// Error code mapping utility
function getFriendlyError(code: string, fallback: string) {
  switch (code) {
    case "auth/invalid-action-code":
    case "invalid-action-code":
      return "This verification link is invalid or has already been used.";
    case "auth/expired-action-code":
    case "expired-action-code":
      return "This verification link has expired. Please request a new one.";
    case "auth/user-not-found":
    case "user-not-found":
      return "No account found with this email.";
    case "auth/too-many-requests":
    case "too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return fallback;
  }
}

const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(10, { message: "Password must be at least 10 characters long." })
      .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Must contain at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, {
        message: "Must contain at least one special character.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type PasswordResetValues = z.infer<typeof passwordResetSchema>;

const resendSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});
type ResendValues = z.infer<typeof resendSchema>;

// Resend Verification Form
const ResendVerificationForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<ResendValues>({
    resolver: zodResolver(resendSchema),
  });

  const onSubmit = async (data: ResendValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        toast({ title: "Email Sent", description: result.message });
        router.push("/");
      } else {
        let errorMsg = result.error;
        if (errorMsg && errorMsg.toLowerCase().includes("already verified")) {
          errorMsg = "This email is already verified. Please log in.";
        }
        toast({
          variant: "destructive",
          title: "Failed to send",
          description: errorMsg,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Could not connect to the server.",
      });
    }
  };

  return (
    <div>
      <CardHeader className="text-center">
        <CardTitle>Link Expired or Invalid</CardTitle>
        <CardDescription>
          This verification link has expired. Please enter your email to receive a new one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Resend Verification Link
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
};

// Main Auth Action Page
const AuthActionPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { auth } = useFirebaseAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showVerifiedSuccess, setShowVerifiedSuccess] = React.useState(false);
  const [showResendForm, setShowResendForm] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState<string | null>(null);
  const [showResetForm, setShowResetForm] = React.useState(false);
  const form = useForm<PasswordResetValues>({
    resolver: zodResolver(passwordResetSchema),
  });
  // Fallback check/resend state
  const [checkEmail, setCheckEmail] = React.useState("");
  const [checking, setChecking] = React.useState(false);
  const [checkResult, setCheckResult] = React.useState<null | "verified" | "not_verified" | "error" | "resent">(null);
  const [checkError, setCheckError] = React.useState("");

  // Handle password reset submit
  const handlePasswordResetSubmit = async (data: PasswordResetValues) => {
    if (!auth || !searchParams.get("oobCode")) return;
    try {
      await confirmPasswordReset(auth, searchParams.get("oobCode")!, data.password);
      setSuccess(true);
      toast({ title: "Password Reset!", description: "Your password has been updated. You can now log in." });
      router.push("/?action=login");
    } catch (err) {
      setError("Failed to reset password. The link may have expired. Please try again.");
    }
  };

  // Effect: handle action code from URL
  React.useEffect(() => {
    const modeParam = searchParams.get("mode");
    const codeParam = searchParams.get("oobCode");
    if (!auth || !modeParam || !codeParam) {
      if (!auth) setLoading(false);
      if (!modeParam || !codeParam) {
        setError(
          "This link is invalid, expired, or has already been used. Please log in or request a new verification email."
        );
        setLoading(false);
      }
      return;
    }
    const handleAction = async () => {
      try {
        const actionInfo = await checkActionCode(auth, codeParam);
        const { operation } = actionInfo;
        const { email } = actionInfo.data;
        if (operation === "VERIFY_EMAIL") {
          await applyActionCode(auth, codeParam);
          setSuccess(true);
          const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          if (token) {
            const response = await fetch(`${API_BASE_URL}/api/check-profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok && data.profile_complete) {
              toast({
                title: "Email Verified!",
                description: "Your account is now active. You can log in.",
              });
              router.push("/?action=login&from=verification_success");
            } else if (data.token) {
              toast({
                title: "Email Verified!",
                description: "Please complete your profile to continue.",
              });
              router.push(`/complete-profile?token=${data.token}`);
            } else {
              toast({
                title: "Email Verified!",
                description: "Please complete your profile to continue.",
              });
              router.push("/");
            }
          } else {
            setShowVerifiedSuccess(true);
          }
        } else if (operation === "PASSWORD_RESET") {
          await verifyPasswordResetCode(auth, codeParam);
          setResetEmail(email);
          setShowResetForm(true);
        }
      } catch (err: any) {
        if (err.code === "auth/invalid-action-code") {
          setShowResendForm(true);
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };
    handleAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, auth, router]);

  // UI: Loading
  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Verifying link...</p>
      </div>
    );
  }

  // UI: Error
  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Action Failed</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex flex-col gap-2 items-center">
          <Button onClick={() => router.push("/")} variant="secondary">
            Go to Homepage
          </Button>
          <Button onClick={() => router.push("/?action=login")} variant="default">
            Go to Login
          </Button>
          <Button onClick={() => setShowResendForm(true)} variant="outline">
            Resend Verification Email
          </Button>
        </div>
      </div>
    );
  }

  // UI: Email Verified Success
  if (showVerifiedSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
        <p className="mb-6">Your email has been verified successfully. You can now log in.</p>
        <Button onClick={() => router.push("/?action=login")}>Go to Login</Button>
      </div>
    );
  }

  // UI: Resend Verification Form
  if (showResendForm) {
    return <ResendVerificationForm />;
  }

  // UI: Password Reset Form
  if (showResetForm && resetEmail) {
    return (
      <div>
        <CardHeader className="text-center">
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter a new password for {resetEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePasswordResetSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save New Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </div>
    );
  }

  // UI: Fallback - Check or Resend Email Verification
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div
        className="flex items-center gap-2 cursor-pointer mb-8"
        onClick={() => router.push("/")}
      >
        <Image
          src="/logo.png"
          alt="Hustloop Logo"
          width={40}
          height={40}
          className="h-10 w-10"
        />
        <span className="font-headline text-2xl" style={{ color: "#facc15" }}>
          hustl<strong className="text-3xl align-middle font-bold">&#8734;</strong>p
        </span>
      </div>
      <Card className="w-full max-w-md p-6">
        <CardHeader className="text-center">
          <CardTitle>Check or Resend Email Verification</CardTitle>
          <CardDescription>
            Enter your email to check if it has been verified. If not, you can resend the verification link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setChecking(true);
              setCheckResult(null);
              setCheckError("");
              try {
                const response = await fetch(`${API_BASE_URL}/api/check-verification-status`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: checkEmail }),
                });
                const data = await response.json();
                if (response.ok && data.email_verified) {
                  setCheckResult("verified");
                } else if (response.ok && !data.email_verified) {
                  setCheckResult("not_verified");
                } else {
                  setCheckResult("error");
                  setCheckError(getFriendlyError(data.code, data.error || "Unknown error"));
                }
              } catch (err) {
                setCheckResult("error");
                setCheckError("Network error");
              } finally {
                setChecking(false);
              }
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={checking}>
              {checking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Check Verification Status"}
            </Button>
          </form>
          {checkResult === "verified" && (
            <div className="mt-4">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 animate-pop" />
              <p className="font-semibold text-green-700">Your email is verified! Please log in.</p>
              <Button className="mt-2 w-full" size="lg" onClick={() => router.push("/?action=login")}>Go to Login</Button>
            </div>
          )}
          {checkResult === "not_verified" && (
            <div className="mt-4">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="font-semibold">Your email is not verified yet.</p>
              <Button
                className="mt-2 w-full"
                variant="outline"
                onClick={async () => {
                  setChecking(true);
                  setCheckError("");
                  try {
                    const response = await fetch(`${API_BASE_URL}/api/resend-verification`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: checkEmail }),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setCheckResult("resent");
                    } else {
                      setCheckError(getFriendlyError(data.code, data.error || "Failed to resend verification email."));
                    }
                  } catch (err) {
                    setCheckError("Network error");
                  } finally {
                    setChecking(false);
                  }
                }}
              >
                Resend Verification Email
              </Button>
            </div>
          )}
          {checkResult === "resent" && (
            <div className="mt-4 text-green-700">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 animate-pop" />
              <p className="font-semibold">Verification email resent! Please check your inbox.</p>
            </div>
          )}
          {checkResult === "error" && (
            <div className="mt-4 text-destructive">{checkError}</div>
          )}
          <Button onClick={() => router.push("/")} className="mt-4 w-full" variant="secondary">
            Go to Homepage
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthActionPage;