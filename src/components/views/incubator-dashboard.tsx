
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
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, PlusCircle, Trash2, Loader2 } from "lucide-react";
import type { IncubatorDashboardTab, Submission, Comment } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { API_BASE_URL } from "@/lib/api";

type User = {
    name: string;
    email: string;
}

const profileFormSchema = z.object({
  name: z.string().min(1, "Incubator name is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().min(1, "Description is required"),
  focus: z.array(z.object({ value: z.string().min(1, "Focus area cannot be empty.") })).min(1, "At least one focus area is required."),
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
    benefits: z.array(z.object({ value: z.string().min(1, "Benefit cannot be empty") })),
     eligibility: z.object({
      focusAreas: z.string().min(1, "Required"),
      requirements: z.array(z.object({ value: z.string().min(1, "Requirement cannot be empty") })),
    }),
    timeline: z.array(z.object({
      event: z.string().min(1, "Event name is required"),
      period: z.string().min(1, "Period is required"),
    })),
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const settingsFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const initialSubmissionsData: Submission[] = [];

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
    user: User;
}

const emptyProfile: ProfileFormValues = {
  name: "",
  location: "",
  description: "",
  focus: [],
  metrics: {
    startups: "",
    funding: "",
    successRate: "",
  },
  details: {
    overview: "",
    services: [],
    benefits: [],
    eligibility: {
      focusAreas: "",
      requirements: [],
    },
    timeline: [],
  },
};

export default function IncubatorDashboardView({ isOpen, onOpenChange, user }: IncubatorDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<IncubatorDashboardTab>("overview");
    const [submissions, setSubmissions] = useState(initialSubmissionsData);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

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

    const { fields: services, append: appendService, remove: removeService } = useFieldArray({
        control: profileForm.control, name: "details.services"
    });
    const { fields: benefits, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control: profileForm.control, name: "details.benefits"
    });
    const { fields: focusFields, append: appendFocus, remove: removeFocus } = useFieldArray({
        control: profileForm.control, name: "focus"
    });
     const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: profileForm.control, name: "details.eligibility.requirements"
    });
    const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
        control: profileForm.control, name: "details.timeline"
    });


    async function onProfileSubmit(data: ProfileFormValues) {
        const token = localStorage.getItem('token');
        const profileData = {
            ...data,
            focus: data.focus.map((item) => item.value),
            details: {
                ...data.details,
                benefits: data.details.benefits.map((item) => item.value),
                eligibility: {
                    ...data.details.eligibility,
                    requirements: data.details.eligibility.requirements.map((item) => item.value),
                },
            },
            image: 'https://placehold.co/600x400.png',
            hint: 'office building',
            rating: 0,
            reviews: 0,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/incubator-profile`, {
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
                    description: "Your public incubator profile has been saved. It will now be visible to founders.",
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
                        <DialogDescription>Welcome, {user.name}. Manage your submissions and profile.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as IncubatorDashboardTab)} className="flex flex-col flex-grow min-h-0">
                            <TabsList className="justify-start">
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
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Submissions Overview</CardTitle>
                                            <CardDescription>Incoming submissions over the last 6 months.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={incubatorChartConfig} className="h-[250px] w-full">
                                                <RechartsBarChart data={incubatorChartData}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                                                    <YAxis />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                    <Bar dataKey="submissions" fill="var(--color-submissions)" radius={4} />
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
                                    )) : (
                                        <Card className="text-center text-muted-foreground py-16">
                                            <CardContent>You have not received any submissions yet.</CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                                <TabsContent value="profile" className="mt-0">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Create/Edit Incubator Profile</CardTitle>
                                        <CardDescription>This information will be publicly visible. Fill it out to attract founders.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...profileForm}>
                                            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                <FormField control={profileForm.control} name="name" render={({ field }) => (
                                                    <FormItem><FormLabel>Incubator Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={profileForm.control} name="location" render={({ field }) => (
                                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Bangalore, India" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <FormField control={profileForm.control} name="description" render={({ field }) => (
                                                    <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="A brief, one-sentence pitch for your incubator." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>

                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Focus Areas</h3>
                                                    {focusFields.map((field, index) => (
                                                        <div key={field.id} className="flex items-center gap-2 mb-2">
                                                            <FormField control={profileForm.control} name={`focus.${index}.value`} render={({ field }) => (
                                                                <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., SaaS" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeFocus(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendFocus({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Focus Area</Button>
                                                </div>

                                                <Separator />
                                                <h3 className="text-lg font-medium">Metrics</h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <FormField control={profileForm.control} name="metrics.startups" render={({ field }) => (
                                                        <FormItem><FormLabel>Startups Supported</FormLabel><FormControl><Input placeholder="e.g., 150+" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                    <FormField control={profileForm.control} name="metrics.funding" render={({ field }) => (
                                                        <FormItem><FormLabel>Average Funding</FormLabel><FormControl><Input placeholder="e.g., $5M" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                    <FormField control={profileForm.control} name="metrics.successRate" render={({ field }) => (
                                                        <FormItem><FormLabel>Success Rate</FormLabel><FormControl><Input placeholder="e.g., 85%" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )}/>
                                                </div>
                                                
                                                <Separator />
                                                <h3 className="text-lg font-medium">Program Details</h3>
                                                <FormField control={profileForm.control} name="details.overview" render={({ field }) => (
                                                    <FormItem><FormLabel>Program Overview</FormLabel><FormControl><Textarea rows={5} placeholder="Describe your program in detail." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                
                                                <div>
                                                    <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                                                    {services.map((service, index) => (
                                                        <Card key={service.id} className="mb-4 p-4 space-y-2">
                                                            <div className="flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                                                            <FormField control={profileForm.control} name={`details.services.${index}.title`} render={({ field }) => (
                                                                <FormItem><FormLabel>Service Title</FormLabel><FormControl><Input placeholder="e.g., Mentorship" {...field} /></FormControl><FormMessage /></FormItem>
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
                                                            <FormField control={profileForm.control} name={`details.benefits.${index}.value`} render={({ field }) => (
                                                                <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., $120,000 investment" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendBenefit({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Benefit</Button>
                                                </div>

                                                <Separator />
                                                <h3 className="text-lg font-medium mb-2">Eligibility</h3>
                                                 <FormField control={profileForm.control} name="details.eligibility.focusAreas" render={({ field }) => (
                                                    <FormItem><FormLabel>Focus Areas (Detailed)</FormLabel><FormControl><Textarea placeholder="Describe your focus areas in detail." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                                <div>
                                                    <h4 className="text-md font-medium my-2">Key Requirements</h4>
                                                    {requirementFields.map((field, index) => (
                                                        <div key={field.id} className="flex items-center gap-2 mb-2">
                                                            <FormField control={profileForm.control} name={`details.eligibility.requirements.${index}.value`} render={({ field }) => (
                                                                <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., MVP required" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                        </div>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendRequirement({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Requirement</Button>
                                                </div>


                                                <Separator />
                                                <h3 className="text-lg font-medium mb-2">Timeline</h3>
                                                 {timelineFields.map((field, index) => (
                                                        <Card key={field.id} className="mb-4 p-4 space-y-2">
                                                            <div className="flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => removeTimeline(index)}><Trash2 className="h-4 w-4 text-destructive"/></Button></div>
                                                            <FormField control={profileForm.control} name={`details.timeline.${index}.event`} render={({ field }) => (
                                                                <FormItem><FormLabel>Event</FormLabel><FormControl><Input placeholder="e.g., Application Period" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                            <FormField control={profileForm.control} name={`details.timeline.${index}.period`} render={({ field }) => (
                                                                <FormItem><FormLabel>Period</FormLabel><FormControl><Input placeholder="e.g., Jan - Mar" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
                                                        </Card>
                                                    ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => appendTimeline({ event: '', period: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Timeline Event</Button>

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
                                            <CardDescription>Manage your account settings.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...settingsForm}>
                                                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
                                                    <div>
                                                        <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                        <div className="space-y-4">
                                                            <FormField control={settingsForm.control} name="name" render={({ field }) => (
                                                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )}/>
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

const incubatorChartData = [
    { month: "January", submissions: 0 },
    { month: "February", submissions: 0 },
    { month: "March", submissions: 0 },
    { month: "April", submissions: 0 },
    { month: "May", submissions: 0 },
    { month: "June", submissions: 0 },
];
  
const incubatorChartConfig = {
    submissions: {
      label: "Submissions",
      color: "hsl(var(--chart-2))",
    },
};

    
