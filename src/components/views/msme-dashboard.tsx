
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
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, Trash2, PlusCircle, Loader2 } from "lucide-react";
import type { MsmeDashboardTab, Submission, Comment } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type User = {
    name: string;
    email: string;
}

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  sector: z.string().min(1, "Sector is required"),
  description: z.string().min(1, "A short description is required"),
  details: z.object({
    about: z.string().min(1, "About section is required"),
    scope: z.array(z.string().min(1, "Scope item cannot be empty")).min(1, "At least one scope item is required"),
    lookingFor: z.string().min(1, "This field is required"),
    benefits: z.array(z.string().min(1, "Benefit cannot be empty")).min(1, "At least one benefit is required"),
    contact: z.object({
      name: z.string().min(1, "Contact name is required"),
      title: z.string().min(1, "Contact title is required"),
    }),
  }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Settings form schema
const settingsFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;


// Sample Data for Submissions
const initialSubmissionsData: Submission[] = [];

// Status Icons
const statusIcons: { [key: string]: React.ReactNode } = {
  'New': <Clock className="h-4 w-4 text-blue-500" />,
  'Under Review': <Clock className="h-4 w-4 text-yellow-500" />,
  'Valid': <CheckCircle className="h-4 w-4 text-green-500" />,
  'Duplicate': <Copy className="h-4 w-4 text-orange-500" />,
  'Rejected': <XCircle className="h-4 w-4 text-red-500" />,
};

const emptyProfile: ProfileFormValues = {
  name: "",
  sector: "",
  description: "",
  details: {
    about: "",
    scope: [],
    lookingFor: "",
    benefits: [],
    contact: {
      name: "",
      title: "",
    },
  },
};

interface MsmeDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User;
}

export default function MsmeDashboardView({ isOpen, onOpenChange, user }: MsmeDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<MsmeDashboardTab>("overview");
    const [submissions, setSubmissions] = useState(initialSubmissionsData);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Profile Form setup
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: emptyProfile,
    });

     const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const { fields: scopeFields, append: appendScope, remove: removeScope } = useFieldArray({
        control: profileForm.control, name: "details.scope"
    });
    const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control: profileForm.control, name: "details.benefits"
    });

    async function onProfileSubmit(data: ProfileFormValues) {
        const token = localStorage.getItem('token');
        const profileData = {
            ...data,
            logo: 'https://placehold.co/100x100.png',
            hint: 'company building',
        };
        
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/msme-profile`, {
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
                    description: "Your public MSME profile has been saved and is now visible.",
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

    function onSettingsSubmit(data: SettingsFormValues) {
        toast({ title: "Settings Saved", description: "Your account settings have been updated." });
    }

    // Submission handling
    const handleStatusChange = (id: number, status: string) => {
        setSubmissions(subs => subs.map(s => s.id === id ? { ...s, status: status as Submission['status'] } : s));
    };

    const handleAddComment = (submissionId: number, commentText: string) => {
        const newComment: Comment = { author: 'MSME', text: commentText, timestamp: 'Just now' };
        const updatedSubmissions = submissions.map(sub => 
            sub.id === submissionId ? { ...sub, comments: [...sub.comments, newComment] } : sub
        );
        setSubmissions(updatedSubmissions);
        setSelectedSubmission(updatedSubmissions.find(s => s.id === submissionId) || null);
    };

    // Overview Stats
    const overviewStats = {
      new: submissions.filter(s => s.status === 'New').length,
      review: submissions.filter(s => s.status === 'Under Review').length,
      valid: submissions.filter(s => s.status === 'Valid').length,
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-3xl font-bold font-headline">MSME Dashboard</DialogTitle>
                        <DialogDescription>Welcome, {user.name}. Manage your challenges, submissions, and profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as MsmeDashboardTab)} className="flex flex-col flex-grow min-h-0">
                            <TabsList>
                                <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                <TabsTrigger value="submissions"><FileText className="mr-2 h-4 w-4" /> Submissions</TabsTrigger>
                                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Edit Profile</TabsTrigger>
                                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="flex-grow mt-4">
                                <TabsContent value="overview" className="mt-0 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New Submissions</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{overviewStats.new}</div><p className="text-xs text-muted-foreground">Awaiting review</p></CardContent>
                                        </Card>
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Under Review</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{overviewStats.review}</div><p className="text-xs text-muted-foreground">Currently being evaluated</p></CardContent>
                                        </Card>
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Accepted Solutions</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                            <CardContent><div className="text-2xl font-bold">{overviewStats.valid}</div><p className="text-xs text-muted-foreground">Marked as valid for collaboration</p></CardContent>
                                        </Card>
                                    </div>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Solutions Overview</CardTitle>
                                            <CardDescription>Accepted solutions over the last 6 months.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={msmeChartConfig} className="h-[250px] w-full">
                                                <RechartsBarChart data={msmeChartData}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                                    <YAxis />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                    <Bar dataKey="solutions" fill="var(--color-solutions)" radius={4} />
                                                </RechartsBarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="submissions" className="mt-0 space-y-4">
                                     {submissions.length > 0 ? submissions.map((sub) => (
                                        <Card key={sub.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setSelectedSubmission(sub)}>
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg">{sub.idea}</CardTitle>
                                                        <CardDescription>Submitted by {sub.founder}</CardDescription>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        {statusIcons[sub.status as keyof typeof statusIcons]}
                                                        <span>{sub.status}</span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                             <CardFooter>
                                                <p className="text-sm text-muted-foreground">Submitted on {sub.submittedDate}</p>
                                            </CardFooter>
                                        </Card>
                                    )) : (
                                        <Card className="text-center text-muted-foreground py-16">
                                            <CardContent>You have not received any submissions yet.</CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                                <TabsContent value="profile" className="mt-0">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader><CardTitle>Create/Edit MSME Profile</CardTitle><CardDescription>This information will be publicly visible to potential collaborators.</CardDescription></CardHeader>
                                        <CardContent>
                                            <Form {...profileForm}>
                                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                    <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="sector" render={({ field }) => (<FormItem><FormLabel>Sector</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="A brief one-sentence pitch for your company." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    
                                                    <Separator/>
                                                    <h3 className="text-lg font-medium">Collaboration Details</h3>
                                                    <FormField control={profileForm.control} name="details.about" render={({ field }) => (<FormItem><FormLabel>About Your Company</FormLabel><FormControl><Textarea rows={5} placeholder="Describe your company, its mission, and what it does." {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="details.lookingFor" render={({ field }) => (<FormItem><FormLabel>What you're looking for</FormLabel><FormControl><Textarea rows={3} placeholder="Describe the ideal partner or solution you are seeking." {...field} /></FormControl><FormMessage /></FormItem>)}/>

                                                    <div>
                                                        <h4 className="text-md font-medium mb-2">Scope of Collaboration</h4>
                                                        {scopeFields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                                                <FormField control={profileForm.control} name={`details.scope.${index}`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="e.g., E-commerce Strategy" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeScope(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => appendScope('')}><PlusCircle className="mr-2 h-4 w-4" />Add Scope Item</Button>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-md font-medium mb-2">Benefits of Partnership</h4>
                                                        {benefitFields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                                                <FormField control={profileForm.control} name={`details.benefits.${index}`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="e.g., Access to our distribution network" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => appendBenefit('')}><PlusCircle className="mr-2 h-4 w-4" />Add Benefit</Button>
                                                    </div>

                                                    <Separator />
                                                     <h3 className="text-lg font-medium">Contact Person</h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <FormField control={profileForm.control} name="details.contact.name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={profileForm.control} name="details.contact.title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>

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
                                        <CardHeader><CardTitle>Account Settings</CardTitle><CardDescription>Manage your account settings.</CardDescription></CardHeader>
                                        <CardContent>
                                            <Form {...settingsForm}>
                                                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
                                                     <div>
                                                        <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                        <div className="space-y-4">
                                                            <FormField control={settingsForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
                                                                        <FormControl><Input type="email" placeholder="your@email.com" {...field} readOnly={!isEditingEmail} /></FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
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
            <SubmissionDetailsModal 
                submission={selectedSubmission} 
                onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}
                onAddComment={handleAddComment}
            />
        </>
    );
}

const msmeChartData = [
    { month: "January", solutions: 0 },
    { month: "February", solutions: 0 },
    { month: "March", solutions: 0 },
    { month: "April", solutions: 0 },
    { month: "May", solutions: 0 },
    { month: "June", solutions: 0 },
];
  
const msmeChartConfig = {
    solutions: {
      label: "Solutions",
      color: "hsl(var(--chart-3))",
    },
};

    