
import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import * as LucideIcons from "lucide-react";
import type { LucideProps } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { View, DashboardTab, UserRole, AppUser, BlogPost, EducationProgram, NewsletterSubscriber, founderRole } from "@/app/types";
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
import { Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { CommentSection } from "../comment-section";
import { DeleteConfirmationDialog } from '../ui/DeleteConfirmationDialog'
import MarkdownEditor from "../ui/markdown";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { useSearchParams } from "next/navigation";
import { EmailUpdateForm } from "../ui/EmailUpdateForm";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { FounderIdeaSubmission } from "./founder-idea-submission";
import { FounderIdeasView } from "./founder-ideas-view";
import { io, Socket } from "socket.io-client";

const settingsFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(35, "Name must not exceed 35 characters"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;


const paymentMethodSchema = z.object({
    paymentMethod: z.enum(["paypal", "bank", "upi"], {
        required_error: "You must select a payment method."
    }),
    paymentCategory: z.enum(["primary", "secondary", "others"], {
        required_error: "You must select a payment category."
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

type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;

const blogPostSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(50, "Content must be at least 50 characters").max(300, "Content must not exceed 300 characters."),
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
    description: z.string().min(10, "Description is required").max(5000, "Description must not exceed 5000 characters."),
    sessions: z.array(sessionSchema).min(1, "At least one session is required"),
    features: z.array(featureSchema).min(1, "At least one feature is required"),
});

type ProgramFormValues = z.infer<typeof programSchema>;


type User = { name: string; email: string; userId: string }
type AuthProvider = 'local' | 'google';

interface InnovativeIdeaDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    user: User;
    userRole: UserRole;
    authProvider: AuthProvider;
    hasSubscription: boolean;
    setActiveView: (view: View) => void;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    activateTab: string;
    id?: string;
    founderRole: founderRole;
}

interface TechTransferIP {
    id: string;
    ipTitle: string;
    firstName: string;
    lastName: string;
    describetheTech: string;
    summary: string;
    inventorName: string;
    organization: string;
    supportingFile?: string;
    approvalStatus: string;
    created_by?: number;
}

type GroupedIPs = Record<string, TechTransferIP[]>;

interface ChartDataItem {
    year: string;
    activity: number;
}

interface ipDataItem {
    title: string;
    summary: string;
    date: string;
    approvalStatus: string;
}

interface ExistingFile {
    url: string;
    name: string;
}

interface RestoreIP {
    id: string;
    ipTitle: string;
    ip_id: string;
    action_by_user_name?: string;
    organization: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const techTransferSchema = z.object({
    firstName: z.string().min(1, "First name is required").max(20, "First name must not exceed 20 characters"),
    lastName: z.string().min(1, "Last name is required").max(20, "Last name must not exceed 20 characters"),
    ipTitle: z.string().min(1, "IP title is required").max(35, "First name must not exceed 20 characters"),
    summary: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Description must not exceed 1000 characters"),
    describetheTech: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(5000, "Description must not exceed 5000 characters"),
    inventorName: z.string().min(1, "Inventor name is required").max(35, "Inventor Name must not exceed 20 characters"),
    organization: z.string().min(1, "Organization is required").max(100, "Organization Name must not exceed 20 characters"),
    supportingFile: z
        .any()
        .optional()
        .refine(
            (file) => !file || file.size <= MAX_FILE_SIZE,
            "File size must be less than or equal to 10 MB"
        ),
});

type TechTransferFormData = z.infer<typeof techTransferSchema>;

type RegistrationAignite = {
    id: number;
    full_name: string;
    email_address: string;
    phone_number: string;
    who_you_are: string;
    registered_at: string;
};
type connexRegistrations = {
    id: number;
    full_name: string;
    email_address: string;
    phone_number: string;
    who_you_are: string;
    created_at: string;
};


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

export default function InnovativeIdeaDashboard({ isOpen, setUser, founderRole, onOpenChange, user, userRole, authProvider, hasSubscription, setActiveView, activateTab, id }: InnovativeIdeaDashboardViewProps) {
    const { toast } = useToast();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(API_BASE_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('ip_status_updated', (data) => {
            setTechTransferIps(prev => prev.map(ip => ip.id === data.id ? { ...ip, approvalStatus: data.approvalStatus } : ip));
            toast({ title: "IP Status Updated", description: `${data.ipTitle} is now ${data.approvalStatus}` });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [toast]);

    const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
    const [adminContentTab, setAdminContentTab] = useState('blog');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [emailChangeRequested, setEmailChangeRequested] = useState(false);
    const [commentingSubmissionId, setCommentingSubmissionId] = useState<string | null>(null);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);


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
    const [loadingChange, setLoadingChange] = useState(false)
    const [loadingResend, setLoadingResend] = useState(false)

    const searchParams = useSearchParams()

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

    const ttForm = useForm<TechTransferFormData>({
        resolver: zodResolver(techTransferSchema),
        defaultValues: {
            describetheTech: "",
            summary: ""
        }
    }
    )

    const paymentForm = useForm<PaymentMethodFormValues>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            paymentMethod: undefined,
            paypalEmail: "",
            accountHolder: "",
            accountNumber: "",
            ifscCode: "",
            upiId: "",
        },
    });

    const { fields: sessionFields, append: appendSession, remove: removeSession } = useFieldArray({ control: programForm.control, name: "sessions" });
    const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({ control: programForm.control, name: "features" });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;
    const [registrations, setRegistrations] = useState<RegistrationAignite[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingFormUsers, setIsLoadingFormUsers] = useState(false)
    const [perPage] = useState(10);
    const [totalRegistrations, setTotalRegistrations] = useState(0);


    const fetchUsers = useCallback(async (page: number, perPage: number) => {
        setIsLoadingUsers(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'No token found. Please log in again.' });
            setIsLoadingUsers(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users?page=${page}&per_page=${perPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                toast({ variant: 'destructive', title: 'Network Error', description: `Failed to fetch users: ${response.status} ${response.statusText}` });
            }

            const data = await response.json();

            setUsers(data.items || []);
            setTotalPages(data.pages || 1);
            setCurrentPage(page);

        } catch (error) {

            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not connect to the server or retrieve data.' });
        } finally {
            setIsLoadingUsers(false);
        }
    }, [toast]);


    const handlePageChange = (page: number) => {
        fetchUsers(page, itemsPerPage);
    };


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

    const [selectedSubscribers, setSelectedSubscribers] = useState<number[]>([]);

    const handleDeleteSubscribers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/subscribers/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ids: selectedSubscribers }),
            });

            if (!response.ok) throw new Error('Failed to delete subscribers');
            const result = await response.json();

            toast({ title: "Success", description: result.message || 'Selected subscribers deleted successfully' });

            setSubscribers((prev: any) =>
                prev.filter((s: any) => !selectedSubscribers.includes(s.id))
            );
            setSelectedSubscribers([]);
        } catch (err) {
            toast({ title: "Failed to delete selected subscribers", variant: "destructive" });
        }
    };


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




    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === registrations.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(registrations.map((r) => r.id));
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        setIsDeleting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(
                `${API_BASE_URL}/api/delete-multiple-aignite`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ids: selectedIds }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Registrations deleted",
                    description: `${data.deleted_count || selectedIds.length} registration(s) deleted successfully.`,

                });
                setSelectedIds([]);
                fetchRegistrations(0);
            } else {
                toast({
                    title: "Deletion failed",
                    description: data.message || "Unable to delete selected registrations.",
                    variant: "destructive",

                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Server error",
                description: "An error occurred while deleting registrations.",
                variant: "destructive",

            });
        } finally {
            setIsDeleting(false);
        }
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
    const [techTransferIps, setTechTransferIps] = useState<TechTransferIP[]>([]);
    const [isLoadingIps, setIsLoadingIps] = useState(false);

    const fetchIps = useCallback(async () => {
        setIsLoadingIps(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            setIsLoadingIps(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/getIps`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTechTransferIps(data.ips || []);
                return data.ips
            } else {
                toast({
                    variant: 'destructive',
                    description: data.message || 'Something went wrong.',
                    title: 'Failed to fetch IPs'
                });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error' });
        } finally {
            setIsLoadingIps(false);
        }
    }, [toast]);

    const fetchRegistrations = useCallback(async (page: number) => {
        setIsLoadingFormUsers(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/get-aignite?page=${page}&per_page=${perPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json()

            setRegistrations(data.items);
            setTotalPages(data.pages || 1);
            setTotalRegistrations(data.total);
            setCurrentPage(data.page);

            if (!res.ok) {
                toast({
                    variant: 'destructive',
                    description: data.message || 'Something went wrong.',
                    title: 'Failed to fetch Registered Users'
                });
            }

        } catch (err) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not connect to the server or retrieve data.' });
        } finally {
            setIsLoadingFormUsers(false);
        }
    }, [perPage, toast]);

    const [connexRegistrations, setConnexRegistrations] = useState<connexRegistrations[]>([]);

    const fetchConnex = useCallback(async (page: number) => {
        setIsLoadingFormUsers(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_BASE_URL}/api/get-connex?page=${page}&per_page=${perPage}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json()

            setConnexRegistrations(data.items);
            setTotalPages(data.pages || 1);
            setTotalRegistrations(data.total);
            setCurrentPage(data.page);

            if (!res.ok) {
                toast({
                    variant: 'destructive',
                    description: data.message || 'Something went wrong.',
                    title: 'Failed to fetch Registered Users'
                });
            }

        } catch (err) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not connect to the server or retrieve data.' });
        } finally {
            setIsLoadingFormUsers(false);
        }
    }, [perPage, toast]);


    const onPageChange = (page: number) => {
        fetchRegistrations(page)
    };

    const registrationColumns = [
        "Full Name",
        "Email Address",
        "Phone Number",
        "Who You Are",
        "Registered At",
    ];

    const handleExportAigniteCSV = async () => {
        try {
            // Fetch all registrations from backend
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/get-aignite?all=true`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                toast({
                    title: "Export failed",
                    description: "Could not fetch registrations for CSV.",
                    variant: "destructive",
                });
                return;
            }

            const data = await res.json();
            const allRegistrations = data.items;

            if (allRegistrations.length === 0) {
                toast({
                    title: "No data",
                    description: "No registrations to export.",
                    variant: "destructive",
                });
                return;
            }

            // CSV headers
            const headers = ["Full Name", "Email Address", "Phone Number", "WhoYouAre", "Registered At"];

            // Map registrations into rows
            const rows = allRegistrations.map((reg: any) => [
                reg.full_name,
                reg.email_address,
                reg.phone_number,
                reg.who_you_are,
                new Date(reg.registered_at).toLocaleString(),
            ]);

            // Convert to CSV
            const csvContent = [headers, ...rows]
                .map((row) => row.map((field: any) => `"${String(field).replace(/"/g, '""')}"`).join(","))
                .join("\n");

            // Trigger download
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `aignite_registrations_all.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            toast({
                title: "Export failed",
                description: "An error occurred while exporting CSV.",
                variant: "destructive",
            });
        }
    };


    const token = localStorage.getItem("token")
    useEffect(() => {
        const fetchDraft = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/techtransfer/loadDraft`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 404) {
                    setHasDraft(false);
                    return;
                }
                const data = await res.json();
                setHasDraft(true);

            } catch (error) {
                console.error("Error loading draft:", error);
                toast({
                    title: "Error",
                    description: "Internal Server Error",
                    variant: "destructive",
                });
            }
        };

        if (activeTab === "engagements") {
            fetchDraft();
        }
    }, [activeTab, userRole, token, toast]);


    useEffect(() => {
        if (userRole === 'admin') {
            if (activeTab === 'users') fetchUsers(1, 10);
            if (activeTab === 'aignite') fetchRegistrations(1);
            if (activeTab === 'connex') fetchConnex(1);
            // if (activeTab === 'blog') fetchBlogPosts();
            // if (activeTab === 'sessions') fetchEducationPrograms();
            if (activeTab === 'ip/technologies') fetchIps();
            if (activeTab === 'subscribers') fetchSubscribers();
        }
    }, [activeTab, userRole, fetchUsers, fetchConnex, fetchBlogPosts, fetchEducationPrograms, fetchSubscribers, fetchIps, fetchRegistrations]);



    const handleApiResponse = async (response: Response, successMessage: string, errorMessage: string) => {
        if (response.ok) {
            toast({ title: 'Success', description: successMessage });
            await fetchUsers(1, 10);
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

    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSettingsSubmit(data: SettingsFormValues) {
        const token = localStorage.getItem('token');
        setIsSubmitting(true);
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Please log in again.'
            });
            return;
        }

        try {
            const { name, email } = data;

            if (email && email !== user?.email) {
                await handleChangeEmail(email);
            }

            if (name) {
                const response = await fetch(`${API_BASE_URL}/api/update-profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ name })
                });

                const result = await response.json();
                if (response.ok) {
                    toast({ title: "Settings Saved", description: result.message });

                    localStorage.setItem('user', JSON.stringify({
                        ...user,
                        ...result.user
                    }));
                    setUser((prev) => ({ ...prev, ...result.user }));

                } else {
                    toast({
                        variant: 'destructive',
                        title: 'Update Failed',
                        description: result.error || 'An unknown error occurred.'
                    });
                }
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Network Error',
                description: 'Could not save settings. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleChangeEmail(email: string) {
        try {
            setLoadingChange(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/request-email-change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ new_email: email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast({
                    title: "Success",
                    description: `Verification email sent to ${email}. Please confirm to complete the change.`,
                });
            } else {
                toast({
                    title: "Error",
                    description: data.message || data.error || "Failed to send verification email.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoadingChange(false);
        }
    }

    async function handleResendEmail(email: string) {
        try {
            setLoadingResend(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/request-email-change`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ new_email: email }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast({
                    title: "Success",
                    description: `Resent verification email to ${email}.`,
                });
            } else {
                toast({
                    title: "Error",
                    description: data.message || data.error || "Failed to resend verification email.",
                    variant: "destructive",
                });
            }
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoadingResend(false);
        }
    }

    // Fetch all payment methods
    const fetchAllPaymentMethods = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/payment-methods`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const paymentMethods = data.payment_methods || [];
                setAllPaymentMethods(paymentMethods);
            }
        } catch (error) {
            console.error('Failed to fetch payment methods:', error);
        }
    }, []);

    // Load payment data for the selected category
    const loadPaymentDataForCategory = useCallback((category: string) => {
        if (!category || allPaymentMethods.length === 0) return;

        const categoryPayment = allPaymentMethods.find(
            (pm: any) => pm.payment_category === category
        );

        if (categoryPayment) {
            // Pre-fill the form with existing payment data for this category
            paymentForm.setValue('paymentMethod', categoryPayment.payment_method);
            paymentForm.setValue('paypalEmail', categoryPayment.paypal_email || "");
            paymentForm.setValue('accountHolder', categoryPayment.account_holder || "");
            paymentForm.setValue('accountNumber', categoryPayment.account_number || "");
            paymentForm.setValue('ifscCode', categoryPayment.ifsc_code || "");
            paymentForm.setValue('upiId', categoryPayment.upi_id || "");
        } else {
            // Clear form fields if no payment method exists for this category
            paymentForm.setValue('paymentMethod', undefined as any);
            paymentForm.setValue('paypalEmail', "");
            paymentForm.setValue('accountHolder', "");
            paymentForm.setValue('accountNumber', "");
            paymentForm.setValue('ifscCode', "");
            paymentForm.setValue('upiId', "");
        }
    }, [allPaymentMethods, paymentForm]);

    // Fetch payment methods when settings tab is opened
    useEffect(() => {
        if (activeTab === 'settings') {
            fetchAllPaymentMethods();
        }
    }, [activeTab, fetchAllPaymentMethods]);

    // Load initial payment data when payment methods are fetched
    useEffect(() => {
        if (allPaymentMethods.length > 0 && !paymentForm.getValues('paymentCategory')) {
            // Load the first available payment method
            const firstPayment = allPaymentMethods[0];
            paymentForm.setValue('paymentCategory', firstPayment.payment_category);
            paymentForm.setValue('paymentMethod', firstPayment.payment_method);
            paymentForm.setValue('paypalEmail', firstPayment.paypal_email || "");
            paymentForm.setValue('accountHolder', firstPayment.account_holder || "");
            paymentForm.setValue('accountNumber', firstPayment.account_number || "");
            paymentForm.setValue('ifscCode', firstPayment.ifsc_code || "");
            paymentForm.setValue('upiId', firstPayment.upi_id || "");
        }
    }, [allPaymentMethods, paymentForm]);

    // Watch for category changes and load the appropriate payment data
    useEffect(() => {
        const subscription = paymentForm.watch((value, { name }) => {
            if (name === 'paymentCategory' && value.paymentCategory) {
                loadPaymentDataForCategory(value.paymentCategory);
            }
        });
        return () => subscription.unsubscribe();
    }, [paymentForm, loadPaymentDataForCategory]);

    // Submit payment method
    async function onPaymentMethodSubmit(data: PaymentMethodFormValues) {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }

        setIsLoadingPayment(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/payment-method`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                toast({ title: 'Payment Method Saved', description: result.message || 'Your payment information has been saved successfully.' });
                setIsEditingPayment(false);
                await fetchAllPaymentMethods();
            } else {
                toast({ variant: 'destructive', title: 'Save Failed', description: result.error || 'Failed to save payment method.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not save payment method. Please try again later.' });
        } finally {
            setIsLoadingPayment(false);
        }
    }

    const deleteSubmission = async (
        id: string | number,
        setMySubmissions: React.Dispatch<React.SetStateAction<any[]>>
    ) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/api/techtransfer/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to delete submission");
            }
            setMySubmissions((prev) => prev.filter((s) => s.id !== id));
            fetchIps()
            toast({ title: "success", description: "Submission deleted successfully" });
        } catch (error: any) {
            toast({ title: "error", description: "Failed to delete submission" });
        }
    };

    const [isTechTransfer, setIsTechTransfer] = useState(false)
    const [isipOverview, setisipOverview] = useState(false)

    useEffect(() => {
        const founder_role = founderRole;
        if (founder_role === "List a technology for licensing") {
            setIsTechTransfer(true);
            setisipOverview(true)
        } else {
            setIsTechTransfer(false)
            setisipOverview(false)
        }
    }, [founderRole]);
    // Comment out unnecessary tabs and keep only the necessary ones for innovative ideas
    const founderTabs = founderRole === "Submit an innovative idea"
        ? ["overview", "submission", "mentors", "settings"]
        : ["overview", "organisation", "incubators", "mentors", "submission", "settings"];
    const pendingApprovalCount = users.filter(u => u.status === 'pending').length;

    const [techtransferData, setTechtransferData] = useState<{
        ipTitle: string;
        firstName: string;
        lastName: string;
        description: string;
        inventorName: string;
        organization: string;
        supportingFile: File | null;
    }>({
        ipTitle: "",
        firstName: "",
        lastName: "",
        description: "",
        inventorName: "",
        organization: "",
        supportingFile: null,
    });
    const techTransferFile = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        techTransferFile.current!.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setTechtransferData({
                ...techtransferData,
                supportingFile: e.target.files[0],
            });
        }
    };

    const handleTechTransferSubmit = async (
        data: TechTransferFormData
    ) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                if (key === "supportingFile" && value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === "string") {
                    formData.append(key, value);
                }
            }
        });
        formData.append("contactEmail", user.email);
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE_URL}/api/techtransfer`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });


            if (res.ok) {
                toast({
                    title: "Submission successful",
                    description: "Your IP has been submitted for review.",
                });

                ttForm.reset();
                if (techTransferFile.current) techTransferFile.current.value = "";
            } else {
                toast({
                    title: "Submission failed",
                    description: "Please try again later.",
                    variant: "destructive",
                });
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            toast({
                title: "Error occurred",
                description: message,
                variant: "destructive",
            });
        }
    };
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTechtransferData({
            ...techtransferData,
            [name]: value,
        });
    };

    const [mySubmissions, setMySubmissions] = useState<TechTransferIP[]>([]);
    const [loading, setLoading] = useState(false);
    const [emptyToastShown, setEmptyToastShown] = useState(false);

    useEffect(() => {
        const fetchMySubmissions = async () => {
            setLoading(true);
            setEmptyToastShown(false);
            try {

                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/api/techtransfer/my-ips`, {
                    headers: {
                        Authorization: `Bearer ${token || ""}`,
                    },
                });

                const data = await res.json();

                if (res.ok) {
                    setMySubmissions(data.ips);

                } else {
                    setMySubmissions([]);
                    toast({
                        title: "Failed to load submissions",
                        description: data.error || "Please try again later.",
                        variant: "destructive",
                    });
                }
            } catch (err: any) {
                setMySubmissions([]);
                toast({
                    title: "Error occurred",
                    description: err.message || "Unable to fetch submissions.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };
        if (activeTab === "submission") {
            fetchMySubmissions();
        }
    }, [activeTab, toast]);

    const useGroupedIps = (techTransferIps: TechTransferIP[]) => {
        const [groupedIps, setGroupedIps] = useState<Record<string, TechTransferIP[]>>({});
        const [statusUpdates, setStatusUpdates] = useState<Record<string, "approved" | "rejected" | "needInfo">>({});
        const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

        useEffect(() => {
            if (techTransferIps.length > 0) {
                const groups = techTransferIps.reduce((acc, ip) => {
                    const orgName = ip.organization;
                    if (!acc[orgName]) {
                        acc[orgName] = [];
                    }
                    const updatedIp = {
                        ...ip,
                        approvalStatus: statusUpdates[ip.id] || ip.approvalStatus,
                    };

                    acc[orgName].push(updatedIp);
                    return acc;
                }, {} as Record<string, TechTransferIP[]>);

                setGroupedIps(groups);
            } else {
                setGroupedIps({});
            }
        }, [techTransferIps, statusUpdates]);

        const handleActionClick = (ipId: string, newStatus: "approved" | "rejected" | "needInfo") => {
            setStatusUpdates((prev) => ({
                ...prev,
                [ipId]: newStatus,
            }));
        };

        const handleUpdateStatus = async (ipId: string) => {
            const newStatus = statusUpdates[ipId];

            if (!newStatus) return;

            setIsUpdating((prev) => ({ ...prev, [ipId]: true }));

            try {
                if (socketRef.current) {
                    socketRef.current.emit('update_ip_status', {
                        ipId: ipId,
                        status: newStatus,
                        actorId: user?.userId || 'unknown'
                    });
                } else {
                    toast({ title: "Error", description: "Not connected to server", variant: "destructive" });
                }

                setStatusUpdates((prev) => {
                    const newUpdates = { ...prev };
                    delete newUpdates[ipId];
                    return newUpdates;
                });

            } catch (error) {

                toast({ title: "error", description: "Failed to update status" });

                setStatusUpdates((prev) => {
                    const newUpdates = { ...prev };
                    delete newUpdates[ipId];
                    return newUpdates;
                });
            } finally {
                setIsUpdating((prev) => {
                    const newUpdating = { ...prev };
                    delete newUpdating[ipId];
                    return newUpdating;
                });
            }
        };

        return { groupedIps, setGroupedIps, statusUpdates, handleActionClick, handleUpdateStatus, isUpdating };
    };
    const [chartData, setChartData] = useState<ChartDataItem[]>([]);
    const [ipData, setIpData] = useState<ipDataItem[]>([]);
    const [summary, setSummary] = useState("");
    const maxChars = 1000;
    const summaryValue = ttForm.watch("summary") || "";


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (isipOverview) {
            fetch(`${API_BASE_URL}/api/techtransfer/myGraph`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.error) {
                        toast({ title: "Error", description: data.error, variant: "destructive" })
                        return
                    }
                    const formattedData = data.ips.map((item: any) => ({
                        year: item.year.toString(),
                        activity: item.total_submissions,
                    }));

                    const formatedIpsDetails = data.ips_details.map((item: any) => ({
                        title: item.title,
                        summary: item.summary,
                        date: item.date,
                        approvalStatus: item.approval_status
                    }))

                    setIpData(formatedIpsDetails)

                    const START_YEAR = 2023;
                    const TOTAL_YEARS = 5;

                    const baseData = Array.from({ length: TOTAL_YEARS }, (_, i) => {
                        const year = (START_YEAR + i).toString();
                        return {
                            year: year,
                            activity: 0
                        };
                    });

                    const finalChartData = baseData.map((baseItem: ChartDataItem) => {
                        const match = formattedData.find((item: ChartDataItem) => item.year === baseItem.year);

                        if (match) {
                            return {
                                ...baseItem,
                                activity: match.activity
                            };
                        }
                        return baseItem;
                    });
                    setChartData(finalChartData);
                });
        }

    }, [toast, isipOverview]);


    const [expandedAccordion, setExpandedAccordion] = useState<string | undefined>(undefined);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    useEffect(() => {
        const tabFromUrl = searchParams.get('id') as DashboardTab | null;
        if (tabFromUrl && (userRole == "admin")) {
            setActiveTab('ip/technologies');
        }
    }, [searchParams, userRole]);
    const { groupedIps, setGroupedIps, statusUpdates, handleActionClick, handleUpdateStatus, isUpdating } = useGroupedIps(techTransferIps)

    useEffect(() => {
        if (activateTab === 'ip/technologies') {
            const role = userRole
            if (role === "admin") {
                fetchIps()
                    .then((ips: any) => {
                        if (!Array.isArray(ips)) {
                            toast({ title: "error", description: "Ips not found", variant: "destructive" });
                        }
                        const grouped: Record<string, any[]> = {};
                        ips.forEach((ip: any) => {
                            const orgName = ip.organization?.trim() || 'Unknown Organization';
                            if (!grouped[orgName]) grouped[orgName] = [];
                            grouped[orgName].push(ip);
                        });
                        setGroupedIps(grouped);
                        if (id) {
                            const orgName = Object.keys(grouped).find((org) =>
                                grouped[org].some((ip) => ip.id === id)
                            );
                            if (!orgName) {
                                toast({
                                    title: "IP Not Found",
                                    description: `No IP record found matching ID: ${id}`,
                                    variant: "destructive",
                                });
                            }
                            if (orgName) {
                                const accordionValue = `org-${orgName}`;
                                setExpandedAccordion(accordionValue);
                                setTimeout(() => {
                                    const el = document.getElementById(id);
                                    if (el) {
                                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                                        setHighlightedId(id);
                                    }

                                }, 600);
                            }
                        }
                    })
                    .catch((err) => toast({ title: "error", description: "Failed to fetch Ips", variant: "destructive" }));
            }
        }
    }, [activateTab, id, fetchIps, toast, setGroupedIps, userRole]);

    const [hasDraft, setHasDraft] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [existingFile, setExistingFile] = useState<ExistingFile | null>(null);


    const handleLoadDraft = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/techtransfer/getDraft`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            const fileUrl = data.supportingFile;
            const fileName = fileUrl ? fileUrl.split("/").pop().split("?")[0] : null;
            if (res.ok) {
                ttForm.setValue("ipTitle", data.ipTitle);
                ttForm.setValue("describetheTech", data.describetheTech);
                ttForm.setValue("summary", data.summary);
                ttForm.setValue("inventorName", data.inventorName);
                ttForm.setValue("organization", data.organization);
                ttForm.setValue("firstName", data.firstName);
                ttForm.setValue("lastName", data.lastName);
                ttForm.setValue("supportingFile", data.supportingFile);
                if (fileUrl && fileName) setExistingFile({ url: fileUrl, name: fileName });
                setHasDraft(false)
            } else {
                toast({ title: "error", description: "No draft found", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Error loading draft", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };


    const handleSaveDraft = async () => {
        setLoading(true);
        const formData = new FormData();

        formData.append("ipTitle", ttForm.getValues("ipTitle"));
        formData.append("describetheTech", ttForm.getValues("describetheTech"));
        formData.append("summary", ttForm.getValues("summary"));
        formData.append("inventorName", ttForm.getValues("inventorName"));
        formData.append("organization", ttForm.getValues("organization"));
        formData.append("firstName", ttForm.getValues("firstName"));
        formData.append("lastName", ttForm.getValues("lastName"));
        formData.append("contactEmail", user.email);
        const file = ttForm.getValues("supportingFile");
        if (file) {
            formData.append("supportingFile", file);
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/techtransfer/saveDraft`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            ttForm.reset()
            if (res.ok) {
                toast({ title: "Saved Successfully", description: "Draft saved successfully!" });
                setHasDraft(true);
            } else {
                toast({ title: "Error", description: "Failed to save draft", variant: "destructive" });
            }
        } catch (err) {
            toast({ title: "Error", description: "Error saving draft", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const [activeSubTab, setActiveSubTab] = useState("ip/technologies");
    const [restoreIps, setRestoreIps] = useState<RestoreIP[]>([]);
    const [isLoadingRestoreIps, setIsLoadingRestoreIps] = useState(false);

    const fetchRestoreIps = useCallback(async () => {
        try {
            setIsLoadingRestoreIps(true);
            const res = await fetch(`${API_BASE_URL}/api/techtransfer/restore`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const restoreIp = await res.json();
            if (Array.isArray(restoreIp)) {
                setRestoreIps(restoreIp);
            } else {
                setRestoreIps([]);
            }
            if (!res.ok) toast({
                title: "Fetch failed",
                description: "Failed to fetch restore IPs",
                variant: "destructive",
            });
        } catch (err) {
            toast({
                title: "Failed",
                description: "Failed to load deleted IP submissions.",
                variant: "destructive",
            });
        } finally {
            setIsLoadingRestoreIps(false);
        }
    }, [toast, token]
    )


    const handleRestore = async (restoreId: any) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/techtransfer/restore/${restoreId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.ok) {
                toast({
                    title: "Restored successfully!",
                    description: "The IP record has been restored and moved back to active submissions.",
                });
                setRestoreIps((prev) => prev.filter((ip: any) => ip.restore_id !== restoreId));
                fetchRestoreIps()
            } else {
                toast({
                    title: "Restore failed",
                    description: "There was an issue restoring this IP. Please try again.",
                    variant: "destructive",
                });
            }
        } catch (err) {
            console.error("Error restoring IP:", err);
            toast({
                title: "Server error",
                description: "Failed to connect to the server.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (activeSubTab === "restoreips") {
            fetchRestoreIps();
        }
    }, [activeSubTab, fetchRestoreIps]);

    useEffect(() => {
        if (activeSubTab === "ip/technologies" && userRole === "admin") {
            fetchIps()
        }
    }, [activeSubTab, fetchIps, userRole])

    useEffect(() => {
        const pendingTab = localStorage.getItem("pendingTab");
        if (pendingTab) {
            setActiveTab(pendingTab as DashboardTab);
            localStorage.removeItem("pendingTab");
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 shrink-0">
                    <DialogTitle className="text-3xl font-bold font-headline capitalize">
                        {userRole} Dashboard
                    </DialogTitle>
                    <DialogDescription>
                        Welcome back, {user.name}! Here&apos;s an overview of your startup journey.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0 p-4 pt-0">
                    <Tabs value={activeTab} className="flex flex-col flex-grow min-h-0">
                        <TabsList
                            className={`
                                grid 
                                grid-cols-3       
                                sm:grid-cols-3    
                                md:grid-cols-4 
                                lg:grid-cols-4    
                                gap-2 h-fit
                                items-stretch       
                                bg-muted/50 rounded-lg p-1
                                mb-4 sm:mb-6 lg:mb-10 z-10`}
                        >

                            {founderTabs.map((tab) => {
                                const Icon = (
                                    LucideIcons[
                                    tab === "organisation"
                                        ? "Briefcase"
                                        : (tab === "incubators" || tab === "recommended-incubators")
                                            ? "Lightbulb"
                                            : tab === "ip/technologies"
                                                ? "FileSignature"
                                                : tab === "engagements"
                                                    ? "Handshake"
                                                    : tab === "mentors"
                                                        ? "Users"
                                                        : (tab === "submission" || tab === "founder-ideas")
                                                            ? "FileText"
                                                            : tab === "settings"
                                                                ? "Settings"
                                                                : tab === "users"
                                                                    ? "User"
                                                                    : tab === "subscribers"
                                                                        ? "Mail"
                                                                        : "BookOpen"
                                    ] || LucideIcons.HelpCircle
                                ) as React.ComponentType<LucideProps>;

                                return (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        onClick={() => setActiveTab(tab as DashboardTab)}
                                        className="
                                    flex items-center justify-start md:justify-center gap-2 
                                    rounded-md bg-card 
                                    text-sm sm:text-base 
                                    data-[state=active]:bg-accent data-[state=active]:text-accent-foreground 
                                    hover:bg-accent/20 transition"
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span className="truncate">{tab}</span>
                                    </TabsTrigger>

                                );
                            })}
                        </TabsList>
                        <div className="flex-grow overflow-y-auto pb-6 w-full" >
                            <TabsContent value="overview" className="mt-0 space-y-6">
                                {isipOverview ? (<div>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Activity Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                                <RechartsBarChart data={chartData}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="year"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                    />
                                                    <Tooltip cursor={false} />
                                                    <Bar dataKey="activity" fill="var(--color-activity)" radius={4} />
                                                </RechartsBarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Submissions</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {loading ? (
                                                <p>Loading...</p>
                                            ) : ipData.length === 0 ? (
                                                <p>You have no active submissions.</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {ipData.map((submission, index) => (
                                                        <div
                                                            key={index}
                                                            className="p-4 border rounded-lg flex justify-between items-center transition-all cursor-pointer hover:bg-accent/20 focus:outline-none focus:ring-2 focus:ring-ring"
                                                            tabIndex={0}
                                                        >
                                                            <div className="flex items-center space-x-4">
                                                                <div className="flex flex-col items-center text-sm text-muted-foreground w-24 flex-shrink-0">
                                                                    <span className="font-medium text-xs capitalize tracking-wider">
                                                                        {submission.date}
                                                                    </span>
                                                                    <span
                                                                        className={`mt-1 px-2 py-0.5 rounded-full text-xs font-semibold 
                            ${submission.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                                                                submission.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                                    'bg-red-100 text-red-700'
                                                                            }`
                                                                        }
                                                                    >
                                                                        {submission.approvalStatus}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-grow">
                                                                    <p className="font-semibold">{submission.title}</p>
                                                                    <p className="text-sm text-muted-foreground mt-1">Summary:</p>
                                                                    <div className="line-clamp-2 text-sm">
                                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                            {submission.summary}
                                                                        </ReactMarkdown>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>) :
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Activity Overview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                                <RechartsBarChart data={staticChartData}>
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="year"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}
                                                    />
                                                    <YAxis />
                                                    <Tooltip cursor={false} />
                                                    <Bar dataKey="activity" fill="var(--color-activity)" radius={4} />
                                                </RechartsBarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Card>}
                            </TabsContent>
                            <TabsContent value="organisation" className="mt-0">
                                {hasSubscription || userRole === 'admin' ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Organisation Collaborations</CardTitle>
                                            <CardDescription>
                                                Your ongoing and potential collaborations with MSMEs.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <p>You have no active collaboration proposals.</p>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <LockedContent setActiveView={setActiveView} title="MSMEs" />
                                )}
                            </TabsContent>
                            <TabsContent value="incubators" className="mt-0">
                                {hasSubscription || userRole === 'admin' ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Incubator Applications</CardTitle>
                                            <CardDescription>Status of your applications to incubators.</CardDescription>
                                        </CardHeader>
                                        <CardContent><p>You have not applied to any incubators yet.</p></CardContent>
                                    </Card>
                                ) :
                                    <LockedContent setActiveView={setActiveView} title="Incubators" />
                                }
                            </TabsContent>
                            <TabsContent value="mentors" className="mt-0">
                                <div className="text-center py-16 text-muted-foreground">
                                    <p>You have not had any mentor sessions yet.</p>
                                    <Button variant="link" onClick={() => setActiveView('mentors')}>Book a session</Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="submission" className="mt-0">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-2xl font-bold tracking-tight">Your Ideas</h2>
                                    </div>
                                    <FounderIdeasView />
                                </div>
                            </TabsContent>

                            <TabsContent value="recommended-incubators" className="mt-0">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold tracking-tight">Submit New Idea</h2>
                                    </div>
                                    <FounderIdeaSubmission />
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="mt-0">
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Account Settings</CardTitle>
                                        <CardDescription>Manage your account and payment information.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-8">
                                        <Form {...settingsForm}>
                                            <form
                                                onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}
                                                className="space-y-4"
                                            >
                                                <div>
                                                    <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                    <div className="space-y-4">
                                                        {/* Name Field */}
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
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                                    disabled={isSubmitting}
                                                >
                                                    Save Changes
                                                </Button>
                                            </form>
                                        </Form>
                                        <EmailUpdateForm currentEmail={settingsForm.watch('email')} />
                                        <Separator />

                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-medium">Payment Method</h3>
                                                {!isEditingPayment && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsEditingPayment(true)}
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                            </div>
                                            <Form {...paymentForm}>
                                                <form onSubmit={paymentForm.handleSubmit(onPaymentMethodSubmit)} className="space-y-4">

                                                    <FormField
                                                        control={paymentForm.control}
                                                        name="paymentCategory"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Payment Category</FormLabel>
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    disabled={!isEditingPayment}
                                                                >
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select category" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="primary">Primary</SelectItem>
                                                                        <SelectItem value="secondary">Secondary</SelectItem>
                                                                        <SelectItem value="others">Others</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />


                                                    <FormField
                                                        control={paymentForm.control}
                                                        name="paymentMethod"
                                                        render={({ field }) => (
                                                            <FormItem className="space-y-3">
                                                                <FormLabel>Select Method</FormLabel>
                                                                <FormControl>
                                                                    <RadioGroup
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        disabled={!isEditingPayment}
                                                                        className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-4"
                                                                    >
                                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                                            <FormControl><RadioGroupItem value="paypal" disabled={!isEditingPayment} /></FormControl>
                                                                            <FormLabel className="font-normal">PayPal</FormLabel>
                                                                        </FormItem>
                                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                                            <FormControl><RadioGroupItem value="bank" disabled={!isEditingPayment} /></FormControl>
                                                                            <FormLabel className="font-normal">Bank Account</FormLabel>
                                                                        </FormItem>
                                                                        <FormItem className="flex items-center space-x-3 space-y-0">
                                                                            <FormControl><RadioGroupItem value="upi" disabled={!isEditingPayment} /></FormControl>
                                                                            <FormLabel className="font-normal">UPI</FormLabel>
                                                                        </FormItem>
                                                                    </RadioGroup>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    {paymentForm.watch("paymentMethod") === "paypal" && (
                                                        <FormField
                                                            control={paymentForm.control}
                                                            name="paypalEmail"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>PayPal Email</FormLabel>
                                                                    <FormControl><Input type="email" placeholder="you@paypal.com" {...field} disabled={!isEditingPayment} /></FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    )}

                                                    {paymentForm.watch("paymentMethod") === "bank" && (
                                                        <div className="space-y-4">
                                                            <FormField control={paymentForm.control} name="accountHolder" render={({ field }) => (
                                                                <FormItem><FormLabel>Account Holder Name</FormLabel><FormControl><Input placeholder="Full name on account" {...field} disabled={!isEditingPayment} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={paymentForm.control} name="accountNumber" render={({ field }) => (
                                                                <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Your bank account number" {...field} disabled={!isEditingPayment} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={paymentForm.control} name="ifscCode" render={({ field }) => (
                                                                <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="Bank's IFSC code" {...field} disabled={!isEditingPayment} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>
                                                    )}


                                                    {paymentForm.watch("paymentMethod") === "upi" && (
                                                        <FormField control={paymentForm.control} name="upiId" render={({ field }) => (
                                                            <FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input placeholder="yourname@okbank" {...field} disabled={!isEditingPayment} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                    )}


                                                    {isEditingPayment && (
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="submit"
                                                                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                                                disabled={isLoadingPayment}
                                                            >
                                                                {isLoadingPayment ? (
                                                                    <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    'Save Payment Method'
                                                                )}
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setIsEditingPayment(false);
                                                                    const currentCategory = paymentForm.getValues('paymentCategory');
                                                                    if (currentCategory) {
                                                                        loadPaymentDataForCategory(currentCategory);
                                                                    }
                                                                }}
                                                                disabled={isLoadingPayment}
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    )}
                                                </form>
                                            </Form>
                                        </div>

                                        {(authProvider === 'local') && (
                                            <>
                                                <Separator />
                                                <PasswordChangeForm />
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
                {
                    commentingSubmissionId !== null && (
                        <CommentSection
                            submissionId={commentingSubmissionId}
                            onClose={() => setCommentingSubmissionId(null)}
                        />
                    )
                }
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
            </DialogContent >
        </Dialog >
    );
}

const staticChartData = [
    { year: 2025, activity: 0 }, { year: 2026, activity: 0 }, { year: 2027, activity: 0 },
    { year: 2028, activity: 0 }, { year: 2029, activity: 0 }, { year: 2030, activity: 0 },
];

const chartConfig = {
    activity: { label: "Activity", color: "hsl(var(--chart-1))" },
};
