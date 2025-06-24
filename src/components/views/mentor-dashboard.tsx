
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
import { LayoutDashboard, Users, Calendar as CalendarIcon, Settings, Star, MessageSquare } from "lucide-react";
import type { View, MentorDashboardTab } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

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

const mentees = [
    { name: "Alex Johnson", startup: "InnovateAI", avatar: "https://placehold.co/100x100.png", hint: "man face", lastSession: "Topic: Go-to-Market Strategy" },
    { name: "Samantha Lee", startup: "Healthful", avatar: "https://placehold.co/100x100.png", hint: "woman face", lastSession: "Topic: User Acquisition Funnels" },
    { name: "David Chen", startup: "FinTech Secure", avatar: "https://placehold.co/100x100.png", hint: "man portrait", lastSession: "Topic: Seed Round Pitch Deck Review" },
];

const scheduleData: Record<string, { time: string; mentee: string }[]> = {
    "2024-08-12": [{ time: "10:00 AM", mentee: "Alex Johnson" }, { time: "02:00 PM", mentee: "Samantha Lee" }],
    "2024-08-14": [{ time: "11:00 AM", mentee: "David Chen" }],
    "2024-08-15": [{ time: "03:00 PM", mentee: "Alex Johnson" }],
};

interface MentorDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    setActiveView: (view: View) => void;
}

export default function MentorDashboardView({ isOpen, onOpenChange }: MentorDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<MentorDashboardTab>("overview");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            firstName: "Mentor",
            lastName: "User",
            email: "mentor@nexus.com",
            paymentMethod: "bank",
            paypalEmail: "",
            accountHolder: "Mentor User",
            accountNumber: "1234567890",
            ifscCode: "BANK0001234"
        },
    });

    function onSubmit(data: SettingsFormValues) {
        // Here you would typically call an API to save the user's data
    }
    
    const todaysAppointments = selectedDate ? scheduleData[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-3xl font-bold font-headline">Mentor Dashboard</DialogTitle>
                    <DialogDescription>Manage your mentorship activities, schedule, and mentees.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0">
                    <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as MentorDashboardTab)} className="flex flex-col flex-grow min-h-0">
                        <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
                            <TabsTrigger value="overview">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="mentees">
                                <Users className="mr-2 h-4 w-4" /> My Mentees
                            </TabsTrigger>
                            <TabsTrigger value="schedule">
                                <CalendarIcon className="mr-2 h-4 w-4" /> Schedule
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
                                            <CardTitle className="text-sm font-medium">Total Mentees</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">3</div>
                                            <p className="text-xs text-muted-foreground">across various industries</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">4</div>
                                            <p className="text-xs text-muted-foreground">scheduled this week</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">4.9 / 5.0</div>
                                            <p className="text-xs text-muted-foreground">based on 25 reviews</p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Mentorship Sessions</CardTitle>
                                        <CardDescription>Your session activity over the last 6 months.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <RechartsBarChart data={chartData}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                                <YAxis />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                <Bar dataKey="sessions" fill="var(--color-sessions)" radius={4} />
                                            </RechartsBarChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="mentees" className="mt-0 space-y-6">
                                {mentees.map((mentee) => (
                                    <Card key={mentee.name} className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={mentee.avatar} alt={mentee.name} data-ai-hint={mentee.hint} />
                                                <AvatarFallback>{mentee.name.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle>{mentee.name}</CardTitle>
                                                <CardDescription>Founder of {mentee.startup}</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground">{mentee.lastSession}</p>
                                        </CardContent>
                                        <CardFooter className="gap-2">
                                            <Button>View Progress</Button>
                                            <Button variant="outline"><MessageSquare className="mr-2 h-4 w-4" /> Message</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </TabsContent>
                            <TabsContent value="schedule" className="mt-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>My Schedule</CardTitle>
                                        <CardDescription>View your upcoming appointments and manage your availability.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-8">
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            className="rounded-md border p-0"
                                            classNames={{
                                                day_disabled: "text-muted-foreground/30",
                                            }}
                                            disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                                        />
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">
                                                Appointments for {selectedDate ? format(selectedDate, "PPP") : "..."}
                                            </h3>
                                            {todaysAppointments.length > 0 ? (
                                                <div className="space-y-3">
                                                    {todaysAppointments.map((appt, i) => (
                                                        <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                                                            <div>
                                                                <p className="font-semibold">{appt.time}</p>
                                                                <p className="text-sm text-muted-foreground">{appt.mentee}</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm">Details</Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-muted-foreground text-center pt-8">No appointments scheduled for this day.</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
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
    { month: "January", sessions: 18 },
    { month: "February", sessions: 30 },
    { month: "March", sessions: 23 },
    { month: "April", sessions: 27 },
    { month: "May", sessions: 20 },
    { month: "June", sessions: 21 },
];
  
const chartConfig = {
    sessions: {
      label: "Sessions",
      color: "hsl(var(--primary))",
    },
};
