
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LayoutDashboard, Users, Calendar as CalendarIcon, Settings, Star, MessageSquare, User, PlusCircle, Trash2, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import PasswordChangeForm from './password-change-form';


type User = {
    name: string;
    email: string;
}
type AuthProvider = 'local' | 'google';

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  avatar: z.string().url("A valid avatar URL is required"),
  hint: z.string().min(1, "Avatar hint is required"),
  expertise: z.array(z.object({ value: z.string().min(1, "Expertise cannot be empty.") })).min(1, "At least one expertise is required."),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  socials: z.object({
    x: z.string().url("A valid URL is required").optional().or(z.literal('')),
    linkedin: z.string().url("A valid URL is required").optional().or(z.literal('')),
  }),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;


const settingsFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    paymentMethod: z.enum(["paypal", "bank", "upi"], {
        required_error: "You must select a payment method."
    }),
    paypalEmail: z.string().optional(),
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    ifscCode: z.string().optional(),
    upiId: z.string().optional(),
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
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountHolder'], message: 'Account holder name is required.' });
        }
        if (!data.accountNumber) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['accountNumber'], message: 'Account number is required.' });
        }
        if (!data.ifscCode) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['ifscCode'], message: 'IFSC code is required.' });
        }
    } else if (data.paymentMethod === 'upi') {
        if (!data.upiId || !/^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/.test(data.upiId)) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['upiId'],
                message: 'A valid UPI ID is required (e.g., yourname@okbank).',
            });
        }
    }
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const mentees: { name: string; startup: string; avatar: string; hint: string; lastSession: string; }[] = [];

const scheduleData: Record<string, { time: string; mentee: string }[]> = {};

interface MentorDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    setActiveView: (view: View) => void;
    user: User;
    authProvider: AuthProvider;
}

const emptyProfile: ProfileFormValues = {
  name: "",
  title: "",
  avatar: "https://placehold.co/100x100.png",
  hint: "",
  expertise: [],
  bio: "",
  socials: { x: "", linkedin: "" },
  hourlyRate: "",
};


export default function MentorDashboardView({ isOpen, onOpenChange, setActiveView, user, authProvider }: MentorDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<MentorDashboardTab>("overview");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    
    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            ...emptyProfile,
            name: user.name
        },
    });

    const { fields: expertiseFields, append: appendExpertise, remove: removeExpertise } = useFieldArray({
        control: profileForm.control, name: "expertise"
    });

    async function onProfileSubmit(data: ProfileFormValues) {
        const token = localStorage.getItem('token');
        const profileData = {
            ...data,
            expertise: data.expertise.map(item => item.value),
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/mentor-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                toast({
                    title: "Profile Created",
                    description: "Your public mentor profile has been saved. It will now be visible to founders.",
                });
            } else {
                const errorData = await response.json();
                toast({
                    variant: "destructive",
                    title: "Failed to save profile",
                    description: errorData.error || "An unknown error occurred.",
                });
            }
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not save profile. Please try again later.",
            });
        }
    }


    async function onSettingsSubmit(data: SettingsFormValues) {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                toast({ title: "Settings Saved", description: result.message });
                localStorage.setItem('user', JSON.stringify(result.user));
            } else {
                toast({ variant: 'destructive', title: 'Update Failed', description: result.error || 'An unknown error occurred.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not save settings. Please try again later.' });
        }
    }
    
    const todaysAppointments = selectedDate ? scheduleData[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-3xl font-bold font-headline">Mentor Dashboard</DialogTitle>
                    <DialogDescription>Welcome, {user.name}. Manage your mentorship activities, schedule, and profile.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as MentorDashboardTab)} className="flex flex-col flex-grow min-h-0">
                        <TabsList className="justify-start">
                            <TabsTrigger value="overview">
                                <LayoutDashboard className="mr-2 h-4 w-4" /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="mentees">
                                <Users className="mr-2 h-4 w-4" /> My Mentees
                            </TabsTrigger>
                            <TabsTrigger value="schedule">
                                <CalendarIcon className="mr-2 h-4 w-4" /> Schedule
                            </TabsTrigger>
                             <TabsTrigger value="profile">
                                <User className="mr-2 h-4 w-4" /> Profile
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
                                            <div className="text-2xl font-bold">{mentees.length}</div>
                                            <p className="text-xs text-muted-foreground">across various industries</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
                                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{Object.values(scheduleData).flat().length}</div>
                                            <p className="text-xs text-muted-foreground">scheduled this week</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                            <Star className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">N/A</div>
                                            <p className="text-xs text-muted-foreground">based on 0 reviews</p>
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
                                {mentees.length > 0 ? mentees.map((mentee) => (
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
                                )) : (
                                    <div className="text-center text-muted-foreground py-16">
                                        <p>You have no mentees yet.</p>
                                    </div>
                                )}
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
                             <TabsContent value="profile" className="mt-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Create/Edit Mentor Profile</CardTitle>
                                        <CardDescription>This information will be publicly visible to founders seeking mentorship.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...profileForm}>
                                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} readOnly /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={profileForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title / Headline</FormLabel><FormControl><Input placeholder="e.g., Serial Entrepreneur, Fintech Expert" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={profileForm.control} name="avatar" render={({ field }) => (<FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={profileForm.control} name="hint" render={({ field }) => (<FormItem><FormLabel>Avatar Hint</FormLabel><FormControl><Input placeholder="e.g., man portrait" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                <FormField control={profileForm.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Biography</FormLabel><FormControl><Textarea rows={5} placeholder="Tell founders about your experience and how you can help." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                
                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Areas of Expertise</h3>
                                                    {expertiseFields.map((field, index) => (
                                                        <div key={field.id} className="flex items-center gap-2 mb-2">
                                                            <FormField control={profileForm.control} name={`expertise.${index}.value`} render={({ field }) => (
                                                                <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., SaaS" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeExpertise(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendExpertise({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Expertise</Button>
                                                </div>

                                                <Separator />
                                                <h3 className="text-lg font-medium">Socials & Rate</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                     <FormField control={profileForm.control} name="socials.x" render={({ field }) => (<FormItem><FormLabel>X (Twitter) Profile URL</FormLabel><FormControl><Input placeholder="https://x.com/username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                     <FormField control={profileForm.control} name="socials.linkedin" render={({ field }) => (<FormItem><FormLabel>LinkedIn Profile URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                </div>
                                                <FormField control={profileForm.control} name="hourlyRate" render={({ field }) => (<FormItem><FormLabel>Hourly Rate</FormLabel><FormControl><Input placeholder="e.g., ₹8,000" {...field} /></FormControl><FormMessage /></FormItem>)} />

                                                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                                                    {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Save Profile
                                                </Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="settings" className="mt-0">
                               <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>Manage your account and payment information.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <Form {...settingsForm}>
                                            <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                    <div className="space-y-4">
                                                        <FormField
                                                            control={settingsForm.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Full Name</FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Your full name" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={settingsForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <div className="flex justify-between items-center">
                                                                        <FormLabel>Email</FormLabel>
                                                                        {!isEditingEmail && (
                                                                            <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setIsEditingEmail(true)}>
                                                                                Edit
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                    <FormControl>
                                                                        <Input type="email" placeholder="your@email.com" {...field} readOnly={!isEditingEmail} />
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
                                                            control={settingsForm.control}
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
                                                                                <FormControl><RadioGroupItem value="paypal" /></FormControl>
                                                                                <FormLabel className="font-normal">PayPal</FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl><RadioGroupItem value="bank" /></FormControl>
                                                                                <FormLabel className="font-normal">Bank Account</FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl><RadioGroupItem value="upi" /></FormControl>
                                                                                <FormLabel className="font-normal">UPI</FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        {settingsForm.watch("paymentMethod") === "paypal" && (
                                                            <FormField
                                                                control={settingsForm.control}
                                                                name="paypalEmail"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>PayPal Email</FormLabel>
                                                                        <FormControl><Input type="email" placeholder="you@paypal.com" {...field} /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        )}
                                                        {settingsForm.watch("paymentMethod") === "bank" && (
                                                            <div className="space-y-4">
                                                                <FormField control={settingsForm.control} name="accountHolder" render={({ field }) => (
                                                                    <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input placeholder="Full name on account" {...field} /></FormControl><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={settingsForm.control} name="accountNumber" render={({ field }) => (
                                                                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Your bank account number" {...field} /></FormControl><FormMessage /></FormItem>
                                                                )}/>
                                                                <FormField control={settingsForm.control} name="ifscCode" render={({ field }) => (
                                                                    <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="Bank's IFSC code" {...field} /></FormControl><FormMessage /></FormItem>
                                                                )}/>
                                                            </div>
                                                        )}
                                                        {settingsForm.watch("paymentMethod") === "upi" && (
                                                            <FormField control={settingsForm.control} name="upiId" render={({ field }) => (
                                                                <FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input placeholder="yourname@okbank" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <Button type="submit">Save Changes</Button>
                                            </form>
                                        </Form>
                                        
                                        {authProvider === 'local' && (
                                            <>
                                                <Separator />
                                                <PasswordChangeForm />
                                            </>
                                        )}
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
    { month: "January", sessions: 0 },
    { month: "February", sessions: 0 },
    { month: "March", sessions: 0 },
    { month: "April", sessions: 0 },
    { month: "May", sessions: 0 },
    { month: "June", sessions: 0 },
];
  
const chartConfig = {
    sessions: {
      label: "Sessions",
      color: "hsl(var(--chart-1))",
    },
};

    