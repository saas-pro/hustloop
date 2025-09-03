
import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { View, DashboardTab, UserRole, AppUser, BlogPost, EducationProgram, NewsletterSubscriber } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_BASE_URL } from "@/lib/api";
import PasswordChangeForm from './password-change-form';
import Image from "next/image";


const settingsFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const blogPostSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    image: z.string().url("Please enter a valid image URL"),
    hint: z.string().min(1, "Hint is required"),
});
type BlogPostFormValues = z.infer<typeof blogPostSchema>;

const featureSchema = z.object({
    name: z.string().min(1, "Feature name is required"),
    icon: z.string().min(1, "Icon is required"),
});
const sessionSchema = z.object({
    language: z.string().min(1, "Language is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
});
const programSchema = z.object({
    title: z.string().min(5, "Title is required"),
    description: z.string().min(10, "Description is required"),
    sessions: z.array(sessionSchema).min(1, "At least one session is required"),
    features: z.array(featureSchema).min(1, "At least one feature is required"),
});
type ProgramFormValues = z.infer<typeof programSchema>;


type User = { name: string; email: string; }
type AuthProvider = 'local' | 'google';

interface DashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User;
    userRole: UserRole;
    authProvider: AuthProvider;
    hasSubscription: boolean;
    setActiveView: (view: View) => void;
}

const iconNames = Object.keys(LucideIcons).filter(k => k !== 'createLucideIcon' && k !== 'icons' && k !== 'default');


const LockedContent = ({ setActiveView, title }: { setActiveView: (view: View) => void, title: string }) => (
    <Card className="mt-0 bg-card/50 backdrop-blur-sm border-border/50 text-center flex flex-col items-center justify-center p-8 min-h-[400px]">
        <LucideIcons.Lock className="h-12 w-12 text-primary mb-4" />
        <CardTitle>{title} Locked</CardTitle>
        <CardDescription className="max-w-md mx-auto mt-2 mb-6">
            This feature is available for subscribers only. Upgrade your plan to unlock full access.
        </CardDescription>
        <Button onClick={() => setActiveView('pricing')} className="bg-accent hover:bg-accent/90 text-accent-foreground">View Pricing Plans <LucideIcons.ArrowRight className="ml-2 h-4 w-4" /></Button>
    </Card>
);

export default function DashboardView({ isOpen, onOpenChange, user, userRole, authProvider, hasSubscription, setActiveView }: DashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [adminContentTab, setAdminContentTab] = useState('blog');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    // Admin state
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
    const [userToBan, setUserToBan] = useState<AppUser | null>(null);

    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [educationPrograms, setEducationPrograms] = useState<EducationProgram[]>([]);
    const [editingProgram, setEditingProgram] = useState<EducationProgram | null>(null);

    const [itemToDelete, setItemToDelete] = useState<{ type: 'blog' | 'program'; id: number } | null>(null);


    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: { name: user.name, email: user.email },
        values: { name: user.name, email: user.email },
    });

    useEffect(() => {
        settingsForm.reset({ name: user.name, email: user.email });
    }, [user, settingsForm]);

    const blogForm = useForm<BlogPostFormValues>({
        resolver: zodResolver(blogPostSchema),
        defaultValues: { title: "", excerpt: "", content: "", image: "https://placehold.co/600x400.png", hint: "" },
    });
    const programForm = useForm<ProgramFormValues>({
        resolver: zodResolver(programSchema),
        defaultValues: { title: "", description: "", sessions: [], features: [] },
    });
    const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ control: programForm.control, name: "sessions" });
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: programForm.control, name: "features" });

    const fetchUsers = useCallback(async () => {
        setIsLoadingUsers(true);
        const token = localStorage.getItem('token');
        if (!token) { toast({ variant: 'destructive', title: 'Authentication Error' }); setIsLoadingUsers(false); return; }
        try {
            const response = await fetch(`${API_BASE_URL}/api/users`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : data.items || data.users || []);
            } else toast({ variant: 'destructive', title: 'Failed to fetch users' });
        } catch (error) { toast({ variant: 'destructive', title: 'Network Error' }); } finally { setIsLoadingUsers(false); }
    }, [toast]);

    const fetchSubscribers = useCallback(async () => {
        setIsLoadingSubscribers(true);
        const token = localStorage.getItem('token');
        if (!token) { toast({ variant: 'destructive', title: 'Authentication Error' }); setIsLoadingSubscribers(false); return; }
        try {
            const response = await fetch(`${API_BASE_URL}/api/subscribers`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (response.ok) {
                const data = await response.json();
                setSubscribers(Array.isArray(data) ? data : data.items || data.subscribers || []);
            } else toast({ variant: 'destructive', title: 'Failed to fetch subscribers' });
        } catch (error) { toast({ variant: 'destructive', title: 'Network Error' }); } finally { setIsLoadingSubscribers(false); }
    }, [toast]);

    const handleResetSubscribers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/subscribers/reset`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast({ title: 'Success', description: 'Subscriber list has been reset.' });
                setSubscribers([]);
            } else {
                toast({ variant: 'destructive', title: 'Failed to reset subscribers' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error' });
        }
    };

    const handleExportCSV = () => {
        if (subscribers.length === 0) {
            toast({ title: 'No Subscribers', description: 'There is no data to export.' });
            return;
        }
        const headers = ['id', 'email', 'subscribed_at'];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + subscribers.map(s => headers.map(h => (s as any)[h]).join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const fetchBlogPosts = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/blog-posts`);
            if (response.ok) setBlogPosts(await response.json());
        } catch (error) { console.error("Failed to fetch blog posts"); }
    }, []);

    const fetchEducationPrograms = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/education-programs`);
            if (response.ok) setEducationPrograms(await response.json());
        } catch (error) { console.error("Failed to fetch education programs"); }
    }, []);

    useEffect(() => {
        if (userRole === 'admin') {
            if (activeTab === 'users') fetchUsers();
            if (activeTab === 'blog') fetchBlogPosts();
            if (activeTab === 'sessions') fetchEducationPrograms();
            if (activeTab === 'subscribers') fetchSubscribers();
        }
    }, [activeTab, userRole, fetchUsers, fetchBlogPosts, fetchEducationPrograms, fetchSubscribers]);

    const handleApiResponse = async (response: Response, successMessage: string, errorMessage: string) => {
        if (response.ok) {
            toast({ title: 'Success', description: successMessage });
            await fetchUsers();
        } else {
            const data = await response.json();
            toast({ variant: 'destructive', title: errorMessage, description: data.error });
        }
    };

    const handleDeleteUser = async (userId: string) => handleApiResponse(await fetch(`${API_BASE_URL}/api/users/${userId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }), 'User deleted successfully.', 'Deletion Failed');
    const handleToggleBanUser = async (userId: string) => handleApiResponse(await fetch(`${API_BASE_URL}/api/users/${userId}/toggle-ban`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }), 'User status updated.', 'Update Failed');

    const handleEditPost = (post: BlogPost) => {
        setEditingPost(post);
        blogForm.reset(post);
        setAdminContentTab('blogCreate');
    };

    const handleEditProgram = (program: EducationProgram) => {
        setEditingProgram(program);
        programForm.reset(program);
        setAdminContentTab('sessionCreate');
    };

    const cancelEdit = () => {
        setEditingPost(null);
        setEditingProgram(null);
        blogForm.reset({ title: "", excerpt: "", content: "", image: "https://placehold.co/600x400.png", hint: "" });
        programForm.reset({ title: "", description: "", sessions: [], features: [] });
    }

    const onBlogSubmit = async (data: BlogPostFormValues) => {
        const url = editingPost
            ? `${API_BASE_URL}/api/blog-posts/${editingPost.id}`
            : `${API_BASE_URL}/api/blog-posts`;
        const method = editingPost ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            toast({ title: `Blog Post ${editingPost ? 'Updated' : 'Created'}` });
            blogForm.reset();
            setEditingPost(null);
            await fetchBlogPosts();
            localStorage.setItem('blogs-updated', Date.now().toString());
            setAdminContentTab('blogView');
        } else {
            toast({ variant: 'destructive', title: `Failed to ${editingPost ? 'update' : 'create'} post` });
        }
    };

    const onProgramSubmit = async (data: ProgramFormValues) => {
        const url = editingProgram
            ? `${API_BASE_URL}/api/education-programs/${editingProgram.id}`
            : `${API_BASE_URL}/api/education-programs`;
        const method = editingProgram ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            toast({ title: `Education Program ${editingProgram ? 'Updated' : 'Created'}` });
            programForm.reset();
            setEditingProgram(null);
            await fetchEducationPrograms();
            setAdminContentTab('sessionView');
        } else {
            toast({ variant: 'destructive', title: `Failed to ${editingProgram ? 'update' : 'create'} program` });
        }
    };

    const handleDeleteItem = async () => {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;
        const url = type === 'blog' ? `${API_BASE_URL}/api/blog-posts/${id}` : `${API_BASE_URL}/api/education-programs/${id}`;

        const response = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        if (response.ok) {
            toast({ title: 'Success', description: `${type === 'blog' ? 'Blog post' : 'Program'} deleted successfully.` });
            if (type === 'blog') fetchBlogPosts();
            else fetchEducationPrograms();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to delete ${type}.` });
        }
        setItemToDelete(null);
    };


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
                // Update user data in localStorage to reflect changes immediately
                localStorage.setItem('user', JSON.stringify(result.user));
                // Optionally, trigger a re-render or state update in the parent component
            } else {
                toast({ variant: 'destructive', title: 'Update Failed', description: result.error || 'An unknown error occurred.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not save settings. Please try again later.' });
        }
    }

    const adminTabs = ["overview", "users", "subscribers", "blog", "sessions", "settings"];
    const founderTabs = ["overview", "msmes", "incubators", "mentors", "submission", "settings"];
    const availableTabs = userRole === 'admin' ? adminTabs : founderTabs;
    const pendingApprovalCount = users.filter(u => u.status === 'pending').length;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-3xl font-bold font-headline capitalize">{userRole} Dashboard</DialogTitle>
                    <DialogDescription>Welcome back, {user.name}! Here&apos;s an overview of your startup journey.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                    <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as DashboardTab)} className="flex flex-col flex-grow min-h-0">
                        <TabsList className="relative w-full">
                          <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {availableTabs.map(tab => {
                                  const Icon = (LucideIcons[tab === 'overview' ? 'LayoutDashboard' : tab === 'msmes' ? 'Briefcase' : tab === 'incubators' ? 'Lightbulb' : tab === 'mentors' ? 'Users' : tab === 'submission' ? 'FileText' : tab === 'settings' ? 'Settings' : tab === 'users' ? 'User' : tab === 'subscribers' ? 'Mail' : 'BookOpen' as keyof typeof LucideIcons] || LucideIcons.HelpCircle) as React.ComponentType<LucideProps>;
                                  return (
                                      <TabsTrigger value={tab} key={tab} className="capitalize flex-shrink-0">
                                          <Icon className="mr-2 h-4 w-4" /> {tab === 'mentors' ? 'My Mentors' : tab}
                                          {tab === 'users' && pendingApprovalCount > 0 && <Badge className="ml-2">{pendingApprovalCount}</Badge>}
                                      </TabsTrigger>
                                  )
                              })}
                            </div>
                           </ScrollArea>
                        </TabsList>
                        <ScrollArea className="flex-grow mt-4">
                            <TabsContent value="overview" className="mt-0 space-y-6"><Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader><CardTitle>Activity Overview</CardTitle><CardDescription>Your activity over the last 6 months.</CardDescription></CardHeader><CardContent><ChartContainer config={chartConfig} className="h-[250px] w-full"><RechartsBarChart data={chartData}><CartesianGrid vertical={false} /><XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} /><YAxis /><ChartTooltip cursor={false} content={<ChartTooltipContent />} /><Bar dataKey="activity" fill="var(--color-activity)" radius={4} /></RechartsBarChart></ChartContainer></CardContent></Card></TabsContent>
                            <TabsContent value="msmes" className="mt-0">{hasSubscription || userRole === 'admin' ? (<Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader><CardTitle>MSME Collaborations</CardTitle><CardDescription>Your ongoing and potential collaborations with MSMEs.</CardDescription></CardHeader><CardContent><p>You have no active collaboration proposals.</p></CardContent></Card>) : <LockedContent setActiveView={setActiveView} title="MSMEs" />}</TabsContent>
                            <TabsContent value="incubators" className="mt-0">{hasSubscription || userRole === 'admin' ? (<Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader><CardTitle>Incubator Applications</CardTitle><CardDescription>Status of your applications to incubators.</CardDescription></CardHeader><CardContent><p>You have not applied to any incubators yet.</p></CardContent></Card>) : <LockedContent setActiveView={setActiveView} title="Incubators" />}</TabsContent>
                            <TabsContent value="mentors" className="mt-0"><div className="text-center py-16 text-muted-foreground"><p>You have not had any mentor sessions yet.</p><Button variant="link" onClick={() => setActiveView('mentors')}>Book a session</Button></div></TabsContent>
                            <TabsContent value="submission" className="mt-0">{hasSubscription || userRole === 'admin' ? (<Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader><CardTitle>My Submissions</CardTitle><CardDescription>Your submissions for corporate challenges.</CardDescription></CardHeader><CardContent><p>You have no active submissions.</p></CardContent></Card>) : <LockedContent setActiveView={setActiveView} title="Submissions" />}</TabsContent>

                            {userRole === "admin" && (
                                <>
                                    <TabsContent value="users" className="mt-0">
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50"><CardHeader><CardTitle>User Management</CardTitle><CardDescription>Approve, ban, or delete user accounts.</CardDescription></CardHeader><CardContent>
                                            {isLoadingUsers ? <div className="flex justify-center items-center h-48"><LucideIcons.Loader2 className="h-8 w-8 animate-spin" /></div> : (<Table><TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>
                                                {users.map(u => (<TableRow key={u.uid}><TableCell><div className="font-medium">{u.name}</div><div className="text-sm text-muted-foreground">{u.email}</div></TableCell><TableCell className="capitalize">{u.role}</TableCell><TableCell><div className="flex flex-col gap-1">{u.status === 'banned' ? <Badge variant="destructive">Banned</Badge> : (u.status === 'active' ? <Badge variant="default">Active</Badge> : <Badge variant="secondary">Pending</Badge>)}</div></TableCell><TableCell className="space-x-2">
                                                    {u.status === 'pending' && (<Button size="sm" onClick={() => { }} className="bg-accent hover:bg-accent/90 text-accent-foreground"><LucideIcons.CheckCircle className="mr-2 h-4 w-4" />Approve</Button>)}
                                                    <Button size="sm" variant={u.status === 'banned' ? "outline" : "secondary"} onClick={() => setUserToBan(u)}><LucideIcons.Ban className="mr-2 h-4 w-4" />{u.status === 'banned' ? "Unban" : "Ban"}</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => setUserToDelete(u)}><LucideIcons.Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                                                </TableCell></TableRow>))}
                                            </TableBody></Table>)}
                                        </CardContent></Card>
                                    </TabsContent>
                                    <TabsContent value="subscribers" className="mt-0">
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader>
                                                <CardTitle>Newsletter Subscribers</CardTitle>
                                                <CardDescription>List of all users subscribed to the newsletter.</CardDescription>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button variant="outline" onClick={handleExportCSV}><LucideIcons.Download className="mr-2 h-4 w-4" /> Export CSV</Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive"><LucideIcons.Trash className="mr-2 h-4 w-4" /> Reset List</Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete all newsletter subscribers.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={handleResetSubscribers}>Reset</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                {isLoadingSubscribers ? <div className="flex justify-center items-center h-48"><LucideIcons.Loader2 className="h-8 w-8 animate-spin" /></div> : (
                                                    <Table><TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Subscribed Date</TableHead></TableRow></TableHeader><TableBody>
                                                        {subscribers.map(sub => (
                                                            <TableRow key={sub.id}>
                                                                <TableCell className="font-medium">{sub.email}</TableCell>
                                                                <TableCell>{new Date(sub.subscribed_at).toLocaleDateString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody></Table>
                                                )}
                                                {subscribers.length === 0 && !isLoadingSubscribers && (
                                                    <p className="text-center text-muted-foreground py-8">There are no newsletter subscribers yet.</p>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="blog" className="mt-0 space-y-6">
                                        <Tabs value={adminContentTab} onValueChange={setAdminContentTab} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="blogCreate" onClick={cancelEdit}>{editingPost ? 'Edit Post' : 'Create New'}</TabsTrigger>
                                                <TabsTrigger value="blogView">View All</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="blogCreate" className="mt-4">
                                                <Card><CardHeader><CardTitle>{editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}</CardTitle></CardHeader><CardContent><Form {...blogForm}><form onSubmit={blogForm.handleSubmit(onBlogSubmit)} className="space-y-4"><FormField control={blogForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={blogForm.control} name="excerpt" render={({ field }) => (<FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={blogForm.control} name="content" render={({ field }) => (<FormItem><FormLabel>Content</FormLabel><FormControl><Textarea rows={8} {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={blogForm.control} name="image" render={({ field }) => (<FormItem><FormLabel>Image URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={blogForm.control} name="hint" render={({ field }) => (<FormItem><FormLabel>Image Hint</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><div className="flex gap-2"><Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingPost ? 'Update Post' : 'Publish Post'}</Button>{editingPost && <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>}</div></form></Form></CardContent></Card>
                                            </TabsContent>
                                            <TabsContent value="blogView" className="mt-4">
                                                <Card><CardHeader><CardTitle>Existing Blog Posts</CardTitle></CardHeader><CardContent className="space-y-4">
                                                    {blogPosts.map((post) => (
                                                        <div key={post.id} className="flex items-center justify-between p-2 border rounded-md">
                                                            <div className="flex items-center gap-4">
                                                                <Image src={post.image} alt={post.title} width={60} height={40} className="rounded-md object-cover" data-ai-hint={post.hint} />
                                                                <p className="font-medium">{post.title}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}><LucideIcons.Edit className="mr-2 h-4 w-4" />Edit</Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ type: 'blog', id: post.id })}><LucideIcons.Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {blogPosts.length === 0 && <p className="text-center text-muted-foreground py-4">No blog posts found.</p>}
                                                </CardContent></Card>
                                            </TabsContent>
                                        </Tabs>
                                    </TabsContent>
                                    <TabsContent value="sessions" className="mt-0 space-y-6">
                                        <Tabs value={adminContentTab} onValueChange={setAdminContentTab} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2">
                                                <TabsTrigger value="sessionCreate" onClick={cancelEdit}>{editingProgram ? 'Edit Program' : 'Create New'}</TabsTrigger>
                                                <TabsTrigger value="sessionView">View All</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="sessionCreate" className="mt-4">
                                                <Card><CardHeader><CardTitle>{editingProgram ? 'Edit Education Program' : 'Create New Education Program'}</CardTitle></CardHeader><CardContent><Form {...programForm}><form onSubmit={programForm.handleSubmit(onProgramSubmit)} className="space-y-6"><FormField control={programForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={programForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} /><Separator /><div><h3 className="text-lg font-medium mb-2">Sessions</h3>{sessionFields.map((field, index) => (<div key={field.id} className="grid grid-cols-4 gap-2 items-end mb-2 p-2 border rounded-lg"><FormField control={programForm.control} name={`sessions.${index}.language`} render={({ field }) => (<FormItem><FormLabel>Language</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={programForm.control} name={`sessions.${index}.date`} render={({ field }) => (<FormItem><FormLabel>Date</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={programForm.control} name={`sessions.${index}.time`} render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" onClick={() => removeSession(index)}><LucideIcons.Trash2 className="h-4 w-4" /></Button></div>))}<Button type="button" variant="outline" size="sm" onClick={() => appendSession({ language: 'English', date: '', time: '' })}><LucideIcons.PlusCircle className="mr-2 h-4 w-4" />Add Session</Button></div><Separator /><div><h3 className="text-lg font-medium mb-2">Features</h3>{featureFields.map((field, index) => (<div key={field.id} className="grid grid-cols-3 gap-2 items-end mb-2 p-2 border rounded-lg"><FormField control={programForm.control} name={`features.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Feature Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={programForm.control} name={`features.${index}.icon`} render={({ field }) => (<FormItem><FormLabel>Icon</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select icon" /></SelectTrigger></FormControl><SelectContent><ScrollArea className="h-72">{iconNames.map(icon => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</ScrollArea></SelectContent></Select><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" onClick={() => removeFeature(index)}><LucideIcons.Trash2 className="h-4 w-4" /></Button></div>))}<Button type="button" variant="outline" size="sm" onClick={() => appendFeature({ name: '', icon: 'Check' })}><LucideIcons.PlusCircle className="mr-2 h-4 w-4" />Add Feature</Button></div><div className="flex gap-2"><Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">{editingProgram ? 'Update Program' : 'Publish Program'}</Button>{editingProgram && <Button variant="ghost" onClick={cancelEdit}>Cancel</Button>}</div></form></Form></CardContent></Card>
                                            </TabsContent>
                                            <TabsContent value="sessionView" className="mt-4">
                                                <Card><CardHeader><CardTitle>Existing Education Programs</CardTitle></CardHeader><CardContent className="space-y-4">
                                                    {educationPrograms.map((program) => (
                                                        <div key={program.id} className="flex items-center justify-between p-2 border rounded-md">
                                                            <p className="font-medium">{program.title}</p>
                                                            <div className="flex gap-2">
                                                                <Button variant="outline" size="sm" onClick={() => handleEditProgram(program)}><LucideIcons.Edit className="mr-2 h-4 w-4" />Edit</Button>
                                                                <Button variant="ghost" size="icon" onClick={() => setItemToDelete({ type: 'program', id: program.id })}><LucideIcons.Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {educationPrograms.length === 0 && <p className="text-center text-muted-foreground py-4">No education programs found.</p>}
                                                </CardContent></Card>
                                            </TabsContent>
                                        </Tabs>
                                    </TabsContent>
                                </>
                            )}
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
                                                        <FormField control={settingsForm.control} name="name" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                                        <FormField control={settingsForm.control} name="email" render={({ field }) => (<FormItem><div className="flex justify-between items-center"><FormLabel>Email</FormLabel>{!isEditingEmail && (<Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setIsEditingEmail(true)}>Edit</Button>)}</div><FormControl><Input type="email" placeholder="your@email.com" {...field} readOnly={!isEditingEmail} /></FormControl><FormMessage /></FormItem>)} />
                                                    </div>
                                                </div>
                                                <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
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
                <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the user account and remove their data from our servers.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (userToDelete) { handleDeleteUser(userToDelete.uid); setUserToDelete(null); } }}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                <AlertDialog open={!!userToBan} onOpenChange={(open) => !open && setUserToBan(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will {userToBan?.status === 'banned' ? "unban" : "ban"} the user, {userToBan?.status === 'banned' ? "allowing" : "preventing"} them from logging in. Do you want to continue?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (userToBan) { handleToggleBanUser(userToBan.uid); setUserToBan(null); } }}>{userToBan?.status === 'banned' ? "Unban User" : "Ban User"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone. This will permanently delete the {itemToDelete?.type}.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteItem}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DialogContent>
        </Dialog>
    );
}

const chartData = [
    { month: "January", activity: 0 }, { month: "February", activity: 0 }, { month: "March", activity: 0 },
    { month: "April", activity: 0 }, { month: "May", activity: 0 }, { month: "June", activity: 0 },
];

const chartConfig = {
    activity: { label: "Activity", color: "hsl(var(--chart-1))" },
};
