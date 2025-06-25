
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LayoutDashboard, Briefcase, Lightbulb, Users, FileText, Settings, Star, Lock, ArrowRight } from "lucide-react";
import type { View, DashboardTab } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const settingsFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    paymentMethod: z.enum(["paypal", "bank"], {
        required_error: "You must select a payment method."
    }),
    paypalEmail: z.string().optional(),
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.paymentMethod === 'paypal') {
        if (!data.paypalEmail || !z.string().email().safeParse(data.paypalEmail).success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['paypalEmail'],
                message: 'A valid PayPal email is required.',
            });
        }
    } else if (data.paymentMethod === 'bank') {
        if (!data.accountHolder) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accountHolder'],
                message: 'Account holder name is required.',
            });
        }
        if (!data.accountNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['accountNumber'],
                message: 'Account number is required.',
            });
        }
        if (!data.ifscCode) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ifscCode'],
                message: 'IFSC code is required.',
            });
        }
    }
});


type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const dashboardMentors = [
  {
    name: "Dr. Evelyn Reed",
    avatar: "https://source.unsplash.com/featured/100x100/?woman,portrait",
    hint: "woman portrait",
    lastSession: "April 15, 2024 - Topic: AI Product Strategy",
  },
  {
    name: "Marcus Chen",
    avatar: "https://source.unsplash.com/featured/100x100/?man,portrait",
    hint: "man portrait",
    lastSession: "May 2, 2024 - Topic: Seed Funding Pitch Deck",
  },
  {
    name: "Aisha Khan",
    avatar: "https://source.unsplash.com/featured/100x100/?woman,face",
    hint: "woman face",
    lastSession: "May 21, 2024 - Topic: Building a Brand Narrative",
  },
];

interface DashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isLoggedIn: boolean;
    hasSubscription: boolean;
    setActiveView: (view: View) => void;
}

const LockedContent = ({ setActiveView }: { setActiveView: (view: View) => void }) => (
    <Card className="mt-0 bg-card/50 backdrop-blur-sm border-border/50 text-center flex flex-col items-center justify-center p-8 min-h-[400px]">
        <Lock className="h-12 w-12 text-primary mb-4" />
        <CardTitle>Feature Locked</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-2 mb-6">
            This feature is available for subscribers only. Upgrade your plan to unlock full access to MSME collaborations, incubator applications, and submissions.
        </CardDescription>
        <Button onClick={() => setActiveView('pricing')}>View Pricing Plans <ArrowRight className="ml-2 h-4 w-4" /></Button>
    </Card>
);

export default function DashboardView({ isOpen, onOpenChange, isLoggedIn, hasSubscription, setActiveView }: DashboardViewProps) {
    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [mentorReviews, setMentorReviews] = useState(
        dashboardMentors.reduce((acc, mentor) => {
            acc[mentor.name] = { rating: 0, hover: 0, review: "" };
            return acc;
        }, {} as Record<string, { rating: number; hover: number; review: string }>)
    );

    const handleRatingChange = (mentorName: string, newRating: number) => {
        setMentorReviews(prev => ({ ...prev, [mentorName]: { ...prev[mentorName], rating: newRating } }));
    };
    
    const handleHoverChange = (mentorName: string, newHover: number) => {
        setMentorReviews(prev => ({ ...prev, [mentorName]: { ...prev[mentorName], hover: newHover } }));
    };
    
    const handleReviewChange = (mentorName: string, newReview: string) => {
        setMentorReviews(prev => ({ ...prev, [mentorName]: { ...prev[mentorName], review: newReview } }));
    }
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            firstName: "Admin",
            lastName: "User",
            email: "admin@nexus.com",
            paymentMethod: "paypal",
            paypalEmail: "admin.user@paypal.com",
            accountHolder: "",
            accountNumber: "",
            ifscCode: ""
        },
    });

    function onSubmit(data: SettingsFormValues) {
        // Here you would typically call an API to save the user's data
    }


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-3xl font-bold font-headline">Dashboard</DialogTitle>
                    <DialogDescription>Welcome back! Here's an overview of your startup journey.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as DashboardTab)} className="flex flex-col flex-grow min-h-0">
                        <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                            <TabsTrigger value="overview">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="msmes">
                                <Briefcase className="mr-2 h-4 w-4" /> MSMEs
                            </TabsTrigger>
                            <TabsTrigger value="incubators">
                                <Lightbulb className="mr-2 h-4 w-4" /> Incubators
                            </TabsTrigger>
                            <TabsTrigger value="mentors">
                                <Users className="mr-2 h-4 w-4" /> My Mentors
                            </TabsTrigger>
                            <TabsTrigger value="submission">
                                <FileText className="mr-2 h-4 w-4" /> Submissions
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                                <Settings className="mr-2 h-4 w-4" /> Settings
                            </TabsTrigger>
                        </TabsList>
                        <ScrollArea className="flex-grow mt-4">
                            <TabsContent value="overview" className="mt-0 space-y-6">
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                                            <Lightbulb className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">1</div>
                                            <p className="text-xs text-muted-foreground">to TechStars Bangalore</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">MSME Collaborations</CardTitle>
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">1</div>
                                            <p className="text-xs text-muted-foreground">proposal with GreenLeaf Organics</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">2</div>
                                            <p className="text-xs text-muted-foreground">sessions scheduled with mentors</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Activity Overview</CardTitle>
                                        <CardDescription>Your activity over the last 6 months.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <RechartsBarChart data={chartData}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                />
                                                <YAxis />
                                                <ChartTooltip
                                                cursor={false}
                                                content={<ChartTooltipContent />}
                                                />
                                                <Bar dataKey="activity" fill="var(--color-activity)" radius={4} />
                                            </RechartsBarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            
                            <TabsContent value="msmes" className="mt-0">
                                {hasSubscription ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>MSME Collaborations</CardTitle>
                                            <CardDescription>Your ongoing and potential collaborations with MSMEs.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>You have an active collaboration proposal with GreenLeaf Organics.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <LockedContent setActiveView={setActiveView} />
                                )}
                            </TabsContent>

                            <TabsContent value="incubators" className="mt-0">
                                {hasSubscription ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Incubator Applications</CardTitle>
                                            <CardDescription>Status of your applications to incubators.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Your application to TechStars Bangalore is under review.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <LockedContent setActiveView={setActiveView} />
                                )}
                            </TabsContent>

                            <TabsContent value="mentors" className="mt-0">
                                <div className="space-y-6">
                                    {dashboardMentors.map((mentor) => (
                                        <Card key={mentor.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader>
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={mentor.avatar} alt={mentor.name} data-ai-hint={mentor.hint} />
                                                        <AvatarFallback>{mentor.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <CardTitle>{mentor.name}</CardTitle>
                                                        <CardDescription>Last Session: {mentor.lastSession}</CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-2">
                                                    <Label htmlFor={`review-${mentor.name}`}>Write a Review</Label>
                                                    <Textarea
                                                        id={`review-${mentor.name}`}
                                                        placeholder={`Share your experience with ${mentor.name}...`}
                                                        value={mentorReviews[mentor.name]?.review || ""}
                                                        onChange={(e) => handleReviewChange(mentor.name, e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <Label>Your Rating</Label>
                                                    <div className="flex items-center gap-1">
                                                        {[...Array(5)].map((_, index) => {
                                                            const ratingValue = index + 1;
                                                            return (
                                                                <Star
                                                                    key={index}
                                                                    className={cn(
                                                                        "h-6 w-6 cursor-pointer transition-colors",
                                                                        ratingValue <= (mentorReviews[mentor.name]?.hover || mentorReviews[mentor.name]?.rating || 0)
                                                                            ? "text-primary fill-primary"
                                                                            : "text-muted-foreground/30"
                                                                    )}
                                                                    onClick={() => handleRatingChange(mentor.name, ratingValue)}
                                                                    onMouseEnter={() => handleHoverChange(mentor.name, ratingValue)}
                                                                    onMouseLeave={() => handleHoverChange(mentor.name, 0)}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <Button>Submit Review</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="submission" className="mt-0">
                                {hasSubscription ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>My Submissions</CardTitle>
                                            <CardDescription>Your submissions for corporate challenges.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>Your solution for the 'AI-Powered Logistics Optimization' challenge is in the final round.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <LockedContent setActiveView={setActiveView} />
                                )}
                            </TabsContent>
                            
                            <TabsContent value="settings" className="mt-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>Manage your account and payment information.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <FormField
                                                                control={form.control}
                                                                name="firstName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>First Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Your first name" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={form.control}
                                                                name="lastName"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Last Name</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="Your last name" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>
                                                        <FormField
                                                            control={form.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl>
                                                                        <Input type="email" placeholder="your@email.com" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                                                    <div className="space-y-4">
                                                        <FormField
                                                            control={form.control}
                                                            name="paymentMethod"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel>Select Method</FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                                                                        >
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="paypal" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    PayPal
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="bank" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Bank Account
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {form.watch("paymentMethod") === "paypal" && (
                                                            <FormField
                                                                control={form.control}
                                                                name="paypalEmail"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>PayPal Email</FormLabel>
                                                                        <FormControl>
                                                                            <Input type="email" placeholder="you@paypal.com" {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                        {form.watch("paymentMethod") === "bank" && (
                                                            <div className="space-y-4">
                                                                <FormField
                                                                    control={form.control}
                                                                    name="accountHolder"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Account Holder Name</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Full name on account" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name="accountNumber"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>Account Number</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Your bank account number" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                                <FormField
                                                                    control={form.control}
                                                                    name="ifscCode"
                                                                    render={({ field }) => (
                                                                        <FormItem>
                                                                            <FormLabel>IFSC Code</FormLabel>
                                                                            <FormControl>
                                                                                <Input placeholder="Bank's IFSC code" {...field} />
                                                                            </FormControl>
                                                                            <FormMessage />
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Button type="submit">Save Changes</Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </ScrollArea>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const chartData = [
    { month: "January", activity: 186 },
    { month: "February", activity: 305 },
    { month: "March", activity: 237 },
    { month: "April", activity: 273 },
    { month: "May", activity: 209 },
    { month: "June", activity: 214 },
];
  
const chartConfig = {
    activity: {
      label: "Activity",
      color: "hsl(var(--chart-1))",
    },
};
