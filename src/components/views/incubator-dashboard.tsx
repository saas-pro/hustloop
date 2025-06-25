
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, PlusCircle, Trash2 } from "lucide-react";
import type { IncubatorDashboardTab, Submission, Comment } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { incubators } from "./incubators";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";


const profileFormSchema = z.object({
  name: z.string().min(1, "Incubator name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  metrics: z.object({
    startups: z.string().min(1, "Required"),
    funding: z.string().min(1, "Required"),
    successRate: z.string().min(1, "Required"),
  }),
  details: z.object({
    overview: z.string().min(1, "Overview is required"),
    services: z.array(z.object({
        title: z.string().min(1, "Service title is required"),
        description: z.string().min(1, "Service description is required"),
    })),
    benefits: z.array(z.string().min(1, "Benefit cannot be empty")),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const settingsFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const initialSubmissionsData: Submission[] = [
  { 
    id: 1, 
    founder: "Alex Grant", 
    idea: "AI-Powered Personalized Learning Platform", 
    status: "Under Review",
    submittedDate: 'August 1, 2024',
    description: "Our platform uses machine learning to create adaptive learning paths for students, focusing on individual strengths and weaknesses. We aim to make education more engaging and effective by providing personalized content, real-time feedback, and dynamic difficulty adjustments. The initial target market is K-12 students preparing for competitive exams.",
    comments: [
      { author: 'Triage Team', text: 'Thank you for your submission. The concept is interesting. Could you provide more details on the data sources for your AI model and your monetization strategy?', timestamp: '2 days ago' },
      { author: 'Founder', text: 'Thank you! We plan to use a combination of open-source educational datasets and proprietary data from partner schools. Monetization will be a B2B2C model, selling to schools who then offer it to students. We\'re also exploring a direct-to-consumer premium subscription.', timestamp: '1 day ago' },
    ]
  },
  { 
    id: 2, 
    founder: "Brenda Smith", 
    idea: "Sustainable Packaging from Seaweed", 
    status: "New",
    submittedDate: 'August 3, 2024',
    description: "A biodegradable and compostable alternative to single-use plastics, derived from seaweed polymers. Our packaging is durable, water-resistant, and breaks down naturally in weeks, not centuries. We have a working prototype and are ready to scale production.",
    comments: []
  },
  { 
    id: 3, 
    founder: "Carl Davis", 
    idea: "Decentralized Social Media Network", 
    status: "New",
    submittedDate: 'August 4, 2024',
    description: "A social media platform built on blockchain technology, giving users full control over their data and content. Our model eliminates centralized censorship and creates a more transparent and equitable digital community. We're focusing on data privacy and user empowerment.",
    comments: []
  },
  { 
    id: 4, 
    founder: "Diana Prince", 
    idea: "Marketplace for Local Artisans", 
    status: "Valid",
    submittedDate: 'July 28, 2024',
    description: "An e-commerce platform that connects local artisans and craftsmen directly with consumers, cutting out the middlemen. We provide tools for inventory management, marketing, and logistics to help small creators build a sustainable business.",
    comments: [
      { author: 'Triage Team', text: 'Great concept. We see a lot of potential here. We\'ve marked this as valid and are passing it to the incubator for a direct look.', timestamp: '4 days ago' },
      { author: 'Incubator', text: 'Thanks for flagging this. We agree, this is a strong candidate. We\'d like to schedule a follow-up call with the founder.', timestamp: '3 days ago' },
    ]
  },
  { 
    id: 5, 
    founder: "Ethan Hunt", 
    idea: "Another AI Learning Platform", 
    status: "Duplicate",
    submittedDate: 'July 25, 2024',
    description: "A platform for learning, powered by AI.",
    comments: [
      { author: 'Triage Team', text: 'Thank you for your submission. While interesting, the core concept is very similar to another submission we are currently evaluating. We are marking this as a duplicate for now.', timestamp: '5 days ago' }
    ]
  },
];

const statusIcons: { [key: string]: React.ReactNode } = {
  'New': <Clock className="h-4 w-4 text-blue-500" />,
  'Under Review': <Clock className="h-4 w-4 text-yellow-500" />,
  'Valid': <CheckCircle className="h-4 w-4 text-green-500" />,
  'Duplicate': <Copy className="h-4 w-4 text-orange-500" />,
  'Rejected': <XCircle className="h-4 w-4 text-red-500" />,
}

interface IncubatorDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function IncubatorDashboardView({ isOpen, onOpenChange }: IncubatorDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<IncubatorDashboardTab>("overview");
    const [submissions, setSubmissions] = useState(initialSubmissionsData);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            ...incubators.find(inc => inc.name === "TechStars Bangalore")
        },
    });

    const { fields: services, append: appendService, remove: removeService } = useFieldArray({
        control: profileForm.control,
        name: "details.services"
    });
    
    const { fields: benefits, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control: profileForm.control,
        name: "details.benefits"
    });


    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            firstName: "Incubator",
            lastName: "Admin",
            email: "incubator@nexus.com",
        },
    });

    function onProfileSubmit(data: ProfileFormValues) {
        toast({
            title: "Profile Updated",
            description: "Your public incubator profile has been saved.",
        });
    }
    
    function onSettingsSubmit(data: SettingsFormValues) {
        toast({
            title: "Settings Saved",
            description: "Your account settings have been updated.",
        });
    }

    const handleStatusChange = (id: number, status: string) => {
        setSubmissions(subs => subs.map(s => s.id === id ? { ...s, status: status as Submission['status'] } : s));
    };

    const handleAddComment = (submissionId: number, commentText: string) => {
        const newComment: Comment = {
            author: 'Incubator',
            text: commentText,
            timestamp: 'Just now'
        };

        const updatedSubmissions = submissions.map(sub => {
            if (sub.id === submissionId) {
                return { ...sub, comments: [...sub.comments, newComment] };
            }
            return sub;
        });

        setSubmissions(updatedSubmissions);
        setSelectedSubmission(updatedSubmissions.find(s => s.id === submissionId) || null);
    };

    const overviewStats = {
      new: submissions.filter(s => s.status === 'New').length,
      review: submissions.filter(s => s.status === 'Under Review').length,
      valid: submissions.filter(s => s.status === 'Valid').length,
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-3xl font-bold font-headline">Incubator Dashboard</DialogTitle>
                        <DialogDescription>Welcome, TechStars Bangalore. Manage your submissions and profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as IncubatorDashboardTab)} className="flex flex-col flex-grow min-h-0">
                            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
                                <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                <TabsTrigger value="submissions"><FileText className="mr-2 h-4 w-4" /> Submissions</TabsTrigger>
                                <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Edit Profile</TabsTrigger>
                                <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                            </TabsList>
                            <ScrollArea className="flex-grow mt-4">
                                <TabsContent value="overview" className="mt-0 space-y-6">
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">New Submissions</CardTitle>
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{overviewStats.new}</div>
                                                <p className="text-xs text-muted-foreground">Awaiting review</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{overviewStats.review}</div>
                                                <p className="text-xs text-muted-foreground">Currently being evaluated</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Approved Ideas</CardTitle>
                                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{overviewStats.valid}</div>
                                                <p className="text-xs text-muted-foreground">Marked as valid for incubation</p>
                                            </CardContent>
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
                                            <CardFooter className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <Select value={sub.status} onValueChange={(value) => handleStatusChange(sub.id, value)}>
                                                        <SelectTrigger className="w-[180px]" onClick={(e) => e.stopPropagation()}>
                                                            <SelectValue placeholder="Change status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="New">New</SelectItem>
                                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                                            <SelectItem value="Valid">Valid</SelectItem>
                                                            <SelectItem value="Duplicate">Duplicate</SelectItem>
                                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Submitted on {sub.submittedDate}</p>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </TabsContent>
                                <TabsContent value="profile" className="mt-0">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Edit Incubator Profile</CardTitle>
                                        <CardDescription>Update the public-facing details for your incubation center.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...profileForm}>
                                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                <FormField control={profileForm.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel>Incubator Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={profileForm.control} name="location" render={({ field }) => (
                                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={profileForm.control} name="description" render={({ field }) => (
                                                    <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>

                                                <Separator />
                                                <h3 className="text-lg font-medium">Metrics</h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <FormField control={profileForm.control} name="metrics.startups" render={({ field }) => (
                                                        <FormItem><FormLabel>Startups Supported</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                    <FormField control={profileForm.control} name="metrics.funding" render={({ field }) => (
                                                        <FormItem><FormLabel>Average Funding</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                    <FormField control={profileForm.control} name="metrics.successRate" render={({ field }) => (
                                                        <FormItem><FormLabel>Success Rate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                </div>
                                                
                                                <Separator />
                                                <h3 className="text-lg font-medium">Program Details</h3>
                                                <FormField control={profileForm.control} name="details.overview" render={({ field }) => (
                                                    <FormItem><FormLabel>Program Overview</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                
                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                                                    {services.map((service, index) => (
                                                        <Card key={service.id} className="mb-4 p-4 space-y-2">
                                                            <div className="flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                                                            <FormField control={profileForm.control} name={`details.services.${index}.title`} render={({ field }) => (
                                                                <FormItem><FormLabel>Service Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={profileForm.control} name={`details.services.${index}.description`} render={({ field }) => (
                                                                <FormItem><FormLabel>Service Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                        </Card>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendService({ title: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Service</Button>
                                                </div>

                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Benefits</h3>
                                                    {benefits.map((benefit, index) => (
                                                        <div key={benefit.id} className="flex items-center gap-2 mb-2">
                                                            <FormField control={profileForm.control} name={`details.benefits.${index}`} render={({ field }) => (
                                                                <FormItem className="flex-grow"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendBenefit('')}><PlusCircle className="mr-2 h-4 w-4" /> Add Benefit</Button>
                                                </div>

                                                <Button type="submit">Save Profile</Button>
                                            </form>
                                        </Form>
                                    </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Account Settings</CardTitle>
                                            <CardDescription>Manage your account settings.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...settingsForm}>
                                                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <FormField control={settingsForm.control} name="firstName" render={({ field }) => (
                                                            <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Your first name" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )}/>
                                                        <FormField control={settingsForm.control} name="lastName" render={({ field }) => (
                                                            <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Your last name" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )}/>
                                                    </div>
                                                    <FormField control={settingsForm.control} name="email" render={({ field }) => (
                                                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
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
