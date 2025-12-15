
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
import type { View, SolveChallengeTab, UserRole, AppUser, BlogPost, EducationProgram, NewsletterSubscriber, Submission } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { MoreVertical, Trash2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import SubmissionDetailsModal from "./submission-details-modal";
import TeamMembers from "./team-members";
import { LoadingButton } from "../ui/loading-button";
import { ContributionGraph } from "../ui/contribution-graph";
import removeMarkdown from "remove-markdown";

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

interface SolveChallengeDashboardViewProps {
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

interface SolutionDataItem {
    id: string;
    challenge_title: string;
    description: string;
    date: string;
    status: string;
    is_winner: boolean;
    reward_amount?: number;
    points?: number;
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

const statusIcons: { [key: string]: React.ReactNode } = {
    'new': <LucideIcons.Clock className="h-4 w-4 text-blue-500" />,
    'under review': <LucideIcons.Clock className="h-4 w-4 text-yellow-500" />,
    'valid': <LucideIcons.CheckCircle className="h-4 w-4 text-green-500" />,
    'duplicate': <LucideIcons.Copy className="h-4 w-4 text-orange-500" />,
    'rejected': <LucideIcons.XCircle className="h-4 w-4 text-red-500" />,
};

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
export enum SolutionStatus {
    new = "new",
    under_review = "under_review",
    duplicate = "duplicate",
    rejected = "rejected",
    solution_accepted_points = "solution_accepted_points",
    triaged = "triaged",
    need_info = "need_info",
    winner = "winner"
}


export const statusLabels: Record<SolutionStatus, string> = {
    new: "New",
    under_review: "Under Review",
    duplicate: "Duplicate",
    rejected: "Rejected",
    solution_accepted_points: "Solution Accepted + Points",
    triaged: "Triaged",
    need_info: "Need Info",
    winner: "Winner",
};

const statusBadgeClasses: Record<SolutionStatus, string> = {
    new: "border-blue-500 text-blue-700 bg-blue-50 dark:border-blue-400 dark:text-blue-300",
    under_review: "border-yellow-500 text-yellow-700 bg-yellow-50 dark:border-yellow-400 dark:text-yellow-300",
    duplicate: "border-purple-500 text-purple-700 bg-purple-50 dark:border-purple-400 dark:text-purple-300",
    rejected: "border-red-500 text-red-700 bg-red-50 dark:border-red-400 dark:text-red-300",
    solution_accepted_points: "border-green-600 text-green-800 bg-green-100 dark:border-green-500 dark:text-green-400",
    triaged: "border-orange-500 text-orange-700 bg-orange-50 dark:border-orange-400 dark:text-orange-300",
    need_info: "border-blue-600 text-blue-800 bg-blue-100 dark:border-blue-500 dark:text-blue-400",
    winner: "border-green-600 text-green-800 bg-green-100 dark:border-green-500 dark:text-green-400",
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

export default function SolveChallengeDashboard({ isOpen, setUser, onOpenChange, user, userRole, authProvider, hasSubscription, setActiveView, activateTab, id }: SolveChallengeDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<SolveChallengeTab>("overview");
    const [adminContentTab, setAdminContentTab] = useState('blog');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [emailChangeRequested, setEmailChangeRequested] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [commentingSubmissionId, setCommentingSubmissionId] = useState<string | null>(null);



    // Admin state
    const [users, setUsers] = useState<AppUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
    const [userToBan, setUserToBan] = useState<AppUser | null>(null);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
    const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

    const [educationPrograms, setEducationPrograms] = useState<EducationProgram[]>([]);
    const [editingProgram, setEditingProgram] = useState<EducationProgram | null>(null);

    const [itemToDelete, setItemToDelete] = useState<{ type: 'blog' | 'program'; id: number } | null>(null);
    const [loadingChange, setLoadingChange] = useState(false)
    const [loadingResend, setLoadingResend] = useState(false)
    const [submissions, setSubmissions] = useState<Submission[]>([]);
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
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [isOwner, setIsOwner] = useState(false);

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

    function formatPrettyDate(date: Date) {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        const suffix =
            day % 10 === 1 && day !== 11 ? "st" :
                day % 10 === 2 && day !== 12 ? "nd" :
                    day % 10 === 3 && day !== 13 ? "rd" : "th";

        return `${month} ${day}${suffix} ${year}`;
    }

    function formatRelativeTime(dateString: string): string {
        const now = new Date();
        const past = new Date(dateString);
        const diff = (now.getTime() - past.getTime()) / 1000; // difference in seconds

        const minutes = Math.floor(diff / 60);
        const hours = Math.floor(diff / 3600);
        const days = Math.floor(diff / 86400);
        const months = Math.floor(diff / 2592000);
        const years = Math.floor(diff / 31536000);

        if (diff < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        if (months < 12) return `${months}mo ago`;
        return `${years}y ago`;
    }


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

    const getSubmissions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/solutions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            setSubmissions(result.solutions);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could Not Get User Solutions. Please try again later.' });
        }
    }, [toast])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

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


    }, [activeTab, userRole, token, toast]);




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


    async function onSettingsSubmit(data: SettingsFormValues) {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Please log in again.'
            });
            return;
        }

        try {
            // ⚠️ Separate email from other profile fields
            const { name, email } = data;

            // 1. If user changed email, start the email-change flow
            if (email && email !== user?.email) {
                await handleChangeEmail(email);
                // Do NOT update localStorage here – wait until verification
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

    // Fetch payment method data on component mount
    const fetchPaymentMethod = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/payment-method`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const paymentData = data.payment_data;

                if (paymentData && paymentData.payment_method) {
                    // Pre-fill the form with existing payment data
                    paymentForm.reset({
                        paymentMethod: paymentData.payment_method,
                        paypalEmail: paymentData.paypal_email || "",
                        accountHolder: paymentData.account_holder || "",
                        accountNumber: paymentData.account_number || "",
                        ifscCode: paymentData.ifsc_code || "",
                        upiId: paymentData.upi_id || "",
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch payment method:', error);
        }
    }, [paymentForm]);

    useEffect(() => {
        if (activeTab === 'settings') {
            fetchPaymentMethod();
        }
    }, [activeTab, fetchPaymentMethod]);

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
                setIsEditingPayment(false); // Disable edit mode after successful save
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
        const founder_role = localStorage.getItem("founder_role");
        if (founder_role === "List a technology for licensing") {
            setIsTechTransfer(true);
            setisipOverview(true)
        } else {
            setIsTechTransfer(false)
            setisipOverview(false)
        }
    }, []);
    const solveChallenge = ["overview", "submission", "team", "settings"];
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
                const token = localStorage.getItem('token')

                const response = await fetch(`${API_BASE_URL}/api/techtransfer/${ipId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!response.ok) {

                    toast({ title: "error", description: "Failed to get TechTransferIps" });
                }
                if (response.ok) {

                    setTechTransferIps(prev => prev.map(ip => ip.id === ipId ? { ...ip, approvalStatus: newStatus } : ip));
                    toast({ title: "Success", description: "IP status updated successfully." });

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
    const [solutionChartData, setSolutionChartData] = useState<ChartDataItem[]>([]);
    const [solutionData, setSolutionData] = useState<SolutionDataItem[]>([]);
    const [dailySubmissions, setDailySubmissions] = useState<{ date: string; count: number }[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState<number[]>([]);
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

    // Fetch solution graph data for overview tab
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (activeTab === "overview") {
            fetch(`${API_BASE_URL}/api/solutions/myGraph`, {
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
                    const formattedData = data.solutions.map((item: any) => ({
                        year: item.year.toString(),
                        activity: item.total_submissions,
                    }));
                    if (data.daily_submissions) {
                        setDailySubmissions(data.daily_submissions);
                        const years = new Set<number>();
                        data.daily_submissions.forEach((item: any) => {
                            const year = new Date(item.date).getFullYear();
                            years.add(year);
                        });
                        const sortedYears = Array.from(years).sort((a, b) => b - a);
                        setAvailableYears(sortedYears);
                        if (sortedYears.length > 0 && !sortedYears.includes(selectedYear)) {
                            setSelectedYear(sortedYears[0]);
                        }
                    }
                    const formattedSolutionDetails = data.solutions_details.map((item: any) => ({
                        id: item.id,
                        challenge_title: item.challenge_title,
                        description: item.description,
                        date: item.date,
                        status: item.status,
                        is_winner: item.is_winner,
                        reward_amount: item.reward_amount,
                        points: item.points
                    }))

                    setSolutionData(formattedSolutionDetails)

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
                    setSolutionChartData(finalChartData);
                })
                .catch((error) => {
                    console.error("Error fetching solution graph:", error);
                });
        }

    }, [toast, activeTab, selectedYear]);


    const [expandedAccordion, setExpandedAccordion] = useState<string | undefined>(undefined);
    const [highlightedId, setHighlightedId] = useState<string | null>(null);


    const { groupedIps, setGroupedIps, statusUpdates, handleActionClick, handleUpdateStatus, isUpdating } = useGroupedIps(techTransferIps)

    useEffect(() => {
        if (activateTab === 'ip/technologies') {
            const role = localStorage.getItem("userRole")
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
    }, [activateTab, id, fetchIps, toast, setGroupedIps]);

    const [hasDraft, setHasDraft] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [existingFile, setExistingFile] = useState<ExistingFile | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [confirmText, setConfirmText] = useState("");

    const handleDelete = async (solutionId: string) => {
        if (confirmText !== "delete") {
            toast({
                variant: "destructive",
                title: "Confirmation required",
                description: "Type 'delete' to confirm deletion.",
            });
            return;
        }

        try {
            setIsDeleting(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/solutions/${solutionId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Deleted successfully",
                    description: "The submission has been removed.",
                });
                setSubmissions((prev: any[]) => prev.filter((s) => s.solutionId !== solutionId));
            } else {
                toast({
                    variant: "destructive",
                    title: "Delete failed",
                    description: data.error || "Something went wrong.",
                });
            }
            setDeleteTargetId(null);
            setConfirmText("");
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete submission.",
            });
        } finally {
            setIsDeleting(false);
        }
    };


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


    const handleMemberRemoved = (solutionId: string, userId: string) => {
        setSubmissions((prevSubmissions) =>
            prevSubmissions.map((sub) => {
                if (sub.solutionId === solutionId) {
                    return {
                        ...sub,
                        team_members: sub.team_members?.filter((m: any) => m.userId !== userId) || [],
                    };
                }
                return sub;
            })
        );
    };

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
            setActiveTab(pendingTab as SolveChallengeTab);
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
                                ${isTechTransfer ? "lg:grid-cols-4" : (userRole === 'admin' ? "lg:grid-cols-6" : "lg:grid-cols-4")}
                                gap-2 h-fit
                                items-stretch       
                                bg-muted/50 rounded-lg p-1
                                mb-4 sm:mb-6 lg:mb-10 z-10`}
                        >
                            {solveChallenge.map((tab) => {
                                const Icon = (
                                    LucideIcons[
                                    tab === "msmes"
                                        ? "Briefcase"
                                        : tab === "incubators"
                                            ? "Lightbulb"
                                            : tab === "ip/technologies"
                                                ? "FileSignature"
                                                : tab === "engagements"
                                                    ? "Handshake"
                                                    : tab === "mentors"
                                                        ? "Users"
                                                        : tab === "submission"
                                                            ? "FileText"
                                                            : tab === "team"
                                                                ? "Users"
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
                                        onClick={() => setActiveTab(tab as SolveChallengeTab)}
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
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-y-2">
                                                <CardTitle>Solution Submission Activity</CardTitle>
                                                <CardDescription>
                                                    Your Solution submission history over the years
                                                </CardDescription>
                                            </div>
                                            {availableYears.length > 0 && (
                                                <Select
                                                    value={selectedYear.toString()}
                                                    onValueChange={(value) => setSelectedYear(parseInt(value))}
                                                >
                                                    <SelectTrigger className="w-[120px]">
                                                        <SelectValue placeholder="Select year" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableYears.map((year) => (
                                                            <SelectItem key={year} value={year.toString()}>
                                                                {year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {availableYears.length > 0 ? (
                                            <div className="flex justify-center py-4">
                                                <ContributionGraph data={dailySubmissions} year={selectedYear} />
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No submission data available yet.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Recent Submissions */}
                                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                    <CardHeader>
                                        <CardTitle>Recent Submissions</CardTitle>
                                        <CardDescription>
                                            Your latest solution submissions and achievements
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {solutionData.length > 0 ? (
                                            <div className="space-y-4">
                                                {solutionData.slice(0, 5).map((solution) => (
                                                    <div
                                                        key={solution.id}
                                                        className="flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                                                    >
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-semibold text-sm">
                                                                    {solution.challenge_title}
                                                                </h4>
                                                                {solution.is_winner && (
                                                                    <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 text-xs">
                                                                        🏆 Winner
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                                {removeMarkdown(solution.description,
                                                                    {
                                                                        stripListLeaders: true,
                                                                        listUnicodeChar: '',
                                                                        gfm: true,
                                                                        useImgAltText: true,
                                                                    }
                                                                ).replace(/[\[\]]/g, '')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {solution.date}
                                                            </p>
                                                        </div>
                                                        <div className="ml-4 text-right">
                                                            {solution.is_winner ? (
                                                                <div className="space-y-1">
                                                                    <div className="text-lg font-bold text-green-600">
                                                                        ₹{solution.reward_amount?.toLocaleString()}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Reward + {solution.points} pts
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="text-lg font-bold text-primary">
                                                                        {solution.points} pts
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        Points
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <p>No submissions yet. Start participating in challenges!</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="submission" className="mt-0 space-y-4">
                                {submissions.length > 0 ? (
                                    submissions.map((sub, id) => (
                                        <Card
                                            key={id}
                                            onClick={() => setSelectedSubmission(sub)}
                                            className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 cursor-pointer transition-colors relative"
                                        >
                                            {/* ⋯ Menu */}
                                            <div className="absolute top-3 right-3">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <MoreVertical className="h-5 w-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            className="text-red-500 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeleteTargetId(sub.solutionId);
                                                                setConfirmText("");
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Card Header */}
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <CardTitle className="tracking-normal text-lg font-medium w-full">
                                                            {sub.challenge?.title || "Untitled Challenge"}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center text-sm text-muted-foreground">
                                                            <div>
                                                                {sub.challenge?.postedBy?.companyName && (
                                                                    <span className="font-medium">{sub.challenge.postedBy.companyName}</span>
                                                                )}
                                                            </div>
                                                            <span className="w-1 h-1 rounded-full bg-foreground/40 inline-block mx-2"></span>
                                                            <Badge
                                                                className={`px-3 py-1 text-xs font-semibold border rounded-sm 
                                        ${statusBadgeClasses[sub.status]}`}
                                                            >
                                                                {statusLabels[sub.status]}
                                                            </Badge>
                                                            <span className="w-1 h-1 rounded-full bg-foreground/40 inline-block mx-2"></span>
                                                            <p className="text-sm text-muted-foreground">
                                                                Submitted {formatPrettyDate(new Date(sub.createdAt))}
                                                            </p>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardFooter className="flex gap-2 items-center flex-wrap text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2 ">
                                                    <span>Comments</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/70 text-xs font-medium">
                                                        {sub.comments?.length || 0}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span>Points</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                        {sub.points ?? 0}
                                                    </span>
                                                </div>
                                            </CardFooter>

                                            {/* Delete confirmation block */}
                                            {deleteTargetId === sub.solutionId && (
                                                <div
                                                    className="p-4 border-t border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center gap-2"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Input
                                                        placeholder="Type 'delete' to confirm"
                                                        value={confirmText}
                                                        onChange={(e) => setConfirmText(e.target.value)}
                                                        className="text-sm"
                                                    />
                                                    <LoadingButton
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(sub.solutionId)}
                                                        isLoading={isDeleting}
                                                    >
                                                        Confirm Delete
                                                    </LoadingButton>
                                                </div>
                                            )}
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="text-center text-muted-foreground py-16">
                                        <CardContent>You have not received any submissions yet.</CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="team" className="mt-0">
                                {submissions.length > 0 ? (
                                    <div className="space-y-4">
                                        {submissions.map((sub: any) => (
                                            <TeamMembers
                                                key={sub.solutionId}
                                                solutionId={sub.solutionId}
                                                isOwner={sub.isOwner ?? false}
                                                currentUserId={sub.user_id}
                                                onMemberRemoved={(userId) => handleMemberRemoved(sub.solutionId, userId)}
                                                challengeStatus={sub.challenge?.status}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="text-center text-muted-foreground py-16">
                                        <CardContent>No team data available.</CardContent>
                                    </Card>
                                )}
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

                                                        {/* Email Field */}
                                                        <FormField
                                                            control={settingsForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <div className="relative">
                                                                        <FormControl>
                                                                            <Input
                                                                                type="email"
                                                                                placeholder="your@email.com"
                                                                                {...field}
                                                                                readOnly={!isEditingEmail}
                                                                                className="pr-28" // make space for buttons
                                                                            />
                                                                        </FormControl>

                                                                        {/* Buttons inside input */}
                                                                        <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                                                                            {emailChangeRequested ? (
                                                                                // Step 3: After Change request → Resend
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="text-xs flex items-center gap-1"
                                                                                    disabled={loadingResend}
                                                                                    onClick={() => handleResendEmail(field.value)}
                                                                                >
                                                                                    {loadingResend ? (
                                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                                    ) : (
                                                                                        "Resend"
                                                                                    )}
                                                                                </Button>
                                                                            ) : !isEditingEmail ? (
                                                                                // Step 1: Default → Edit
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="link"
                                                                                    className="p-0 h-auto text-sm"
                                                                                    onClick={() => {
                                                                                        setIsEditingEmail(true);
                                                                                        setEmailChangeRequested(false); // reset state
                                                                                    }}
                                                                                >
                                                                                    Edit
                                                                                </Button>
                                                                            ) : (
                                                                                // Step 2: While editing → Change
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="default"
                                                                                    size="sm"
                                                                                    className="text-xs flex items-center gap-1"
                                                                                    disabled={loadingChange}
                                                                                    onClick={async () => {
                                                                                        await handleChangeEmail(field.value);
                                                                                        setEmailChangeRequested(true);  // ✅ Resend will show
                                                                                        setIsEditingEmail(false);       // input locks, but still shows Resend
                                                                                    }}
                                                                                >
                                                                                    {loadingChange ? (
                                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                                    ) : (
                                                                                        "Change"
                                                                                    )}
                                                                                </Button>
                                                                            )}
                                                                        </div>

                                                                    </div>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                                >
                                                    Save Changes
                                                </Button>
                                            </form>
                                        </Form>

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
                                                                    fetchPaymentMethod(); // Reset form to saved values
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
                <SubmissionDetailsModal
                    submission={selectedSubmission}
                    onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}
                />
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
