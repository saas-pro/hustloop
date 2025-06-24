
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, Trash2, PlusCircle } from "lucide-react";
import type { MsmeDashboardTab, Submission, Comment } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { msmeCollaborations } from "./msmes";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  sector: z.string().min(1, "Sector is required"),
  description: z.string().min(1, "A short description is required"),
  details: z.object({
    about: z.string().min(1, "About section is required"),
    scope: z.array(z.string().min(1, "Scope item cannot be empty")),
    lookingFor: z.string().min(1, "This field is required"),
    benefits: z.array(z.string().min(1, "Benefit cannot be empty")),
    contact: z.object({
      name: z.string().min(1, "Contact name is required"),
      title: z.string().min(1, "Contact title is required"),
    }),
  }),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Settings form schema
const settingsFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;


// Sample Data for Submissions
const initialSubmissionsData: Submission[] = [
  { 
    id: 1, 
    founder: "Innovate AI", 
    idea: "Route Optimization Engine for Logistics", 
    status: "Under Review",
    submittedDate: 'August 2, 2024',
    description: "Our engine uses real-time traffic and delivery data to optimize last-mile routes, promising a 15% reduction in fuel consumption. It integrates with existing fleet management systems via API.",
    comments: [
      { author: 'Triage Team', text: 'This looks promising. Can you share the results of your backtesting or any pilot programs?', timestamp: '2 days ago' },
      { author: 'Founder', text: 'We have backtested with public datasets showing a 12-18% efficiency gain. A pilot program is our next step.', timestamp: '1 day ago' },
    ]
  },
  { 
    id: 2, 
    founder: "Retail Gamify", 
    idea: "Mobile-First Gamified Loyalty App", 
    status: "New",
    submittedDate: 'August 4, 2024',
    description: "A white-label mobile app that allows retailers to create a gamified loyalty program with quests, badges, and leaderboards. We focus on increasing daily user engagement and foot traffic.",
    comments: []
  },
  {
    id: 3,
    founder: "Patient-First Tech",
    idea: "NFC-enabled Smart Pill Bottle",
    status: "Valid",
    submittedDate: 'July 30, 2024',
    description: "A smart pill bottle cap with an NFC chip and a small e-ink display. Patients can tap their phone to log a dose, and the cap displays the last taken time. It also sends reminders via a connected app.",
    comments: [
      { author: 'Triage Team', text: 'Interesting use of NFC. Low power and effective. Marked as valid.', timestamp: '5 days ago'},
      { author: 'Incubator', text: 'We agree. The simplicity is a key advantage. Let\'s schedule a follow-up call to discuss manufacturing costs.', timestamp: '4 days ago'}
    ]
  }
];

// Status Icons
const statusIcons: { [key: string]: React.ReactNode } = {
  'New': <Clock className="h-4 w-4 text-blue-500" />,
  'Under Review': <Clock className="h-4 w-4 text-yellow-500" />,
  'Valid': <CheckCircle className="h-4 w-4 text-green-500" />,
  'Duplicate': <Copy className="h-4 w-4 text-orange-500" />,
  'Rejected': <XCircle className="h-4 w-4 text-red-500" />,
};


interface MsmeDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function MsmeDashboardView({ isOpen, onOpenChange }: MsmeDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<MsmeDashboardTab>("overview");
    const [submissions, setSubmissions] = useState(initialSubmissionsData);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    // Profile Form setup
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            ...msmeCollaborations.find(m => m.name === "Artisan Co-op")
        },
    });

    const { fields: scopeFields, append: appendScope, remove: removeScope } = useFieldArray({
        control: profileForm.control, name: "details.scope"
    });
    const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control: profileForm.control, name: "details.benefits"
    });

    function onProfileSubmit(data: ProfileFormValues) {
        toast({ title: "Profile Updated", description: "Your public MSME profile has been saved." });
        console.log("MSME Profile data:", data);
    }

    // Settings Form setup
    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            firstName: "MSME",
            lastName: "User",
            email: "msme@nexus.com",
        },
    });

    function onSettingsSubmit(data: SettingsFormValues) {
        toast({ title: "Settings Saved", description: "Your account settings have been updated." });
        console.log("Settings data:", data);
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
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-bold font-headline">MSME Dashboard</DialogTitle>
                        <DialogDescription>Welcome, Artisan Co-op. Manage your challenges, submissions, and profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow flex flex-col min-h-0">
                        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as MsmeDashboardTab)} className="flex flex-col flex-grow min-h-0">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                <TabsTrigger value="submissions"><FileText className="mr-2 h-4 w-4" /> Submissions</TabsTrigger>
                                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Edit Profile</TabsTrigger>
                                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="flex-grow mt-4 pr-6">
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
                                </TabsContent>
                                <TabsContent value="submissions" className="mt-0 space-y-4">
                                     {submissions.map((sub) => (
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
                                    ))}
                                </TabsContent>
                                <TabsContent value="profile" className="mt-0">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader><CardTitle>Edit MSME Profile</CardTitle><CardDescription>Update the public-facing details for your company.</CardDescription></CardHeader>
                                        <CardContent>
                                            <Form {...profileForm}>
                                                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                    <FormField control={profileForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="sector" render={({ field }) => (<FormItem><FormLabel>Sector</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    
                                                    <Separator/>
                                                    <h3 className="text-lg font-medium">Collaboration Details</h3>
                                                    <FormField control={profileForm.control} name="details.about" render={({ field }) => (<FormItem><FormLabel>About Your Company</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                                    <FormField control={profileForm.control} name="details.lookingFor" render={({ field }) => (<FormItem><FormLabel>What you're looking for</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>)}/>

                                                    <div>
                                                        <h4 className="text-md font-medium mb-2">Scope of Collaboration</h4>
                                                        {scopeFields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                                                <FormField control={profileForm.control} name={`details.scope.${index}`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeScope(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => appendScope('')}><PlusCircle className="mr-2 h-4 w-4" />Add Scope Item</Button>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-md font-medium mb-2">Benefits of Partnership</h4>
                                                        {benefitFields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                                                <FormField control={profileForm.control} name={`details.benefits.${index}`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
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

                                                    <Button type="submit">Save Profile</Button>
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
                                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField control={settingsForm.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Your first name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={settingsForm.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Your last name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                    <FormField control={settingsForm.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
