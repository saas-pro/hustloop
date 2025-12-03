
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, Trash2, PlusCircle, Loader2, Upload, CalendarIcon, Target, Handshake, Lock, ChevronDown, Save, Pencil, MoreVertical, UploadCloud } from "lucide-react";
import type { MsmeDashboardTab, Submission, Comment, View } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { API_BASE_URL } from "@/lib/api";
import PasswordChangeForm from './password-change-form';
import Script from "next/script";
import { format, addDays } from "date-fns";
import SectorSearchWithDropdown from "../ui/SectorSearchWithDropdown";
import Image from "next/image";
import { Label } from "../ui/label";
import ChallengeMarkdownEditor from "../ui/ChallengeMarkdown";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import CollaborationView from "./collaboration-view";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react";
import { LoadingButton } from "../ui/loading-button";



const DEFAULT_COLLABORATION_DESCRIPTION = `[Give a brief overview of the context and purpose of this challenge. What inspired it? Why does it matter?]
## Objective  
[What do you aim to achieve with this challenge? Clearly state the expected outcome or impact.]

## Problem Statement  

### Background  
[Describe the core problem this challenge seeks to solve. Why does it exist? Who is impacted? Include background details, context, and motivations.]

### What We Are Looking For  
[Explain the type of solution you want participants to propose or build.]

### Scope of Requirements  
[Outline any requirements, functionalities, or constraints for the solution.]

- Requirement 1  
- Requirement 2  
- Requirement 3  
`;

type User = {
    name: string;
    email: string;
}
type AuthProvider = 'local' | 'google';

export interface SectorData {
    id: number | string
    name: string
    children: string[]
}

const profileFormSchema = z.object({
    name: z.string().min(1, "Company name is required"),
    sector: z.string().min(1, "Sector is required"),
    affiliated_by: z.string().optional().or(z.literal('')),
    short_description: z.string().min(1, "A short description is required"),
    website_url: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
    x_url: z.string().url("Please enter a valid URL for your X profile.").optional().or(z.literal('')),
    linkedin_url: z.string().url("Please enter a valid URL for your LinkedIn profile.").optional().or(z.literal('')),
    logo: z.any().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const collaborationSchema = z.object({
    title: z.string().min(3, { message: "Title is required." }),
    description: z
        .string()
        .min(10, { message: "Description is required." })
        .max(5000, {
            message: "Description must not exceed 5000 characters.",
        }),

    rewardType: z.enum(["fixed", "range"], {
        errorMap: () => ({ message: "Reward type is required." }),
    }),

    rewardAmount: z.number().optional(),
    rewardMin: z.number().optional(),
    rewardMax: z.number().optional(),

    contact: z.object({
        name: z.string().min(2, { message: "Contact name is required." }),
        role: z.string().min(2, { message: "Contact role is required." }),
    }),

    challengeType: z.enum(["corporate", "msme", "government"], {
        errorMap: () => ({ message: "Please select a challenge type." }),
    }),

    technologyArea: z
        .object({
            sector: z.string().min(1, "Sector is required"),
            techArea: z.string().min(1, "Technology area is required"),
        })
        .refine(
            (val) => val.sector && val.techArea,
            { message: "Please select a technology area", path: ["techArea"] }
        ),

    startDate: z.date({
        required_error: "A start date is required.",
    }),
    endDate: z.date({
        required_error: "An end date is required.",
    }),
    attachments: z.array(z.any()).max(5, "Max 5 files allowed").optional(),
})
    .refine((data) => data.endDate > data.startDate, {
        message: "End date must be after the start date.",
        path: ["endDate"],
    })
    .superRefine((data, ctx) => {
        if (data.rewardType === "fixed") {
            if (data.rewardAmount === undefined || isNaN(data.rewardAmount)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Please enter a valid reward amount.",
                    path: ["rewardAmount"],
                });
            }
        } else if (data.rewardType === "range") {
            if (data.rewardMin === undefined || isNaN(data.rewardMin)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Please enter a valid minimum reward.",
                    path: ["rewardMin"],
                });
            }
            if (data.rewardMax === undefined || isNaN(data.rewardMax)) {
                ctx.addIssue({
                    code: "custom",
                    message: "Please enter a valid maximum reward.",
                    path: ["rewardMax"],
                });
            }
            if (
                data.rewardMin !== undefined &&
                data.rewardMax !== undefined &&
                data.rewardMin > data.rewardMax
            ) {
                ctx.addIssue({
                    code: "custom",
                    message: "Maximum reward should be greater than or equal to minimum reward.",
                    path: ["rewardMax"],
                });
            }
        }
    });

type collaborationFormValues = z.infer<typeof collaborationSchema>;

const settingsFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(20, "Name must not exceed 20 characters"),
    email: z.string().email("Invalid email address"),
});
type SettingsFormValues = z.infer<typeof settingsFormSchema>;

type UsersCollaborationData = z.infer<typeof collaborationSchema>

const initialSubmissionsData: Submission[] = [];

const rewardOptions = [
    { value: "fixed", label: "Fixed" },
    { value: "range", label: "Range" },
];
interface getUsersCollaborationSchema {
    id: number;
    title: string;
    description: string;

    reward_amount?: number;
    reward_min?: number;
    reward_max?: number;

    challenge_type: "corporate" | "msme" | "government";
    start_date: Date | undefined;
    end_date: Date | undefined;

    sector: string;
    technology_area: string;

    contact_name: string;
    contact_role: string;

    created_at: string;
    user_id: number;
}



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

const emptyProfile: ProfileFormValues = {
    name: "",
    sector: "",
    short_description: "",
    affiliated_by: "",
    website_url: "",
    x_url: "",
    linkedin_url: "",
};

export enum SolutionStatus {
    new = "new",
    under_review = "under_review",
    duplicate = "duplicate",
    rejected = "rejected",
    solution_accepted_points = "solution_accepted_points",
    triaged = "triaged",
    need_info = "need_info",
    winner = "winner",
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



interface MsmeDashboardViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isLoggedIn: boolean;
    setActiveView: (view: View) => void;
    user: User;
    authProvider: AuthProvider;
}

const LoginPrompt = ({ setActiveView, contentType }: { setActiveView: (view: View) => void, contentType: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Lock className="h-16 w-16 text-accent mb-6" />
        <h3 className="text-2xl font-bold mb-2">Access required</h3>
        <p className="max-w-md mx-auto text-muted-foreground mb-6">
            Please log in or sign up to view available Problem Statements.
        </p>
        <div className="flex gap-4">
            <Button onClick={() => setActiveView('login')}>Login</Button>
            <Button onClick={() => setActiveView('signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Sign Up
            </Button>
        </div>
    </div>
);

export default function MsmeDashboardView({ isOpen, isLoggedIn, setActiveView, onOpenChange, user, authProvider }: MsmeDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<MsmeDashboardTab>("overview");
    const [confirmText, setConfirmText] = useState("");
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [selectedCollabId, setSelectedCollabId] = useState<number | null>(null);
    const [isCollabEditMode, setIsCollabEditMode] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isMsmerole, setisMsmeRole] = useState(false)
    const isMsmeRole = localStorage.getItem("userRole");
    const [isAdmin, setIsAdmin] = useState(false);
    const [statusUpdates, setStatusUpdates] = useState<Record<string, SolutionStatus>>({});
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const MAX_FILES = 5;

    const [files, setFiles] = useState<File[]>([]);
    const [uploadError, setUploadError] = useState("");
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

    function timeAgoShort(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        const intervals = [
            { label: "y", seconds: 31536000 },
            { label: "m", seconds: 2592000 },
            { label: "w", seconds: 604800 },
            { label: "d", seconds: 86400 },
            { label: "h", seconds: 3600 },
            { label: "min", seconds: 60 }
        ];

        for (let interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count > 0) {
                return `${count}${interval.label} ago`;
            }
        }

        return "just now";
    }

    useEffect(() => {
        if (isMsmeRole === "msme") {
            setisMsmeRole(true)
        }
    }, [isMsmeRole])

    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        setIsAdmin(userRole === "admin");
    }, []);

    // Helper function to check if a field should be disabled in edit mode
    const isFieldDisabled = (fieldName: string) => {
        if (!isEditingCollaboration) return false; // Not in edit mode, all fields editable
        if (isAdmin) return false; // Admin can edit all fields

        // Fields that regular users CAN edit
        const editableFields = ['title', 'technologyArea', 'description', 'challengeType', 'contact.name', 'contact.role'];
        return !editableFields.includes(fieldName);
    };

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: emptyProfile,
    });

    const collaborationForm = useForm<collaborationFormValues>({
        resolver: zodResolver(collaborationSchema),
        defaultValues: {
            title: "",
            description: DEFAULT_COLLABORATION_DESCRIPTION,
            rewardType: "fixed",
            rewardAmount: 0,
            rewardMin: undefined,
            rewardMax: undefined,


            contact: {
                name: "",
                role: ""
            },

            challengeType: "corporate",
            technologyArea: {
                sector: "",
                techArea: ""
            },

            startDate: undefined,
            endDate: undefined,
        },
    });


    const settingsForm = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsFormSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });


    const [getUsersCollaborationData, setGetUserCollaborationData] = useState<getUsersCollaborationSchema[]>([]);

    const [isEditingCollaboration, setIsEditingCollaboration] = useState(false);
    const [currentEditingCollaborationId, setCurrentEditingCollaborationId] = useState<number | null>(null);
    const [selectedCollaborationToEdit, setSelectedCollaborationToEdit] = useState<getUsersCollaborationSchema | null>(null);

    const MAX_CHARS = 300;

    async function onProfileSubmit(data: ProfileFormValues) {
        const token = localStorage.getItem('token');
        const profileData = {
            ...data
        };

        const formData = new FormData();
        formData.append("company_name", profileData.name);
        formData.append("sector", profileData.sector);
        formData.append("short_description", profileData.short_description || "");
        formData.append("affiliated_by", profileData.affiliated_by || "");
        formData.append("website_url", profileData.website_url || "");
        formData.append("linkedin_url", profileData.linkedin_url || "");
        formData.append("x_url", profileData.x_url || "");

        if (profileData.logo instanceof File) {
            formData.append("logo", profileData.logo);
        }
        try {
            setIsProfileSubmitting(true);
            const response = await fetch(`${API_BASE_URL}/api/msme-profiles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                toast({
                    title: "Profile Created",
                    description: "Your public MSME profile has been saved and is now visible.",
                });
                setIsProfileSubmitted(true);
                setOpen(false);
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
        } finally {
            setIsProfileSubmitting(false);
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


    const handleStatusChange = (id: string, newStatus: SolutionStatus) => {
        setStatusUpdates((prev) => ({ ...prev, [id]: newStatus }));
        setSubmissions((prev) =>
            prev.map((item) =>
                item.solutionId === id ? { ...item, status: newStatus } : item
            )
        );
    };

    const handleUpdateStatus = async (id: string) => {
        const newStatus = statusUpdates[id];
        if (!newStatus) return;

        setIsUpdating((prev) => ({ ...prev, [id]: true }));

        try {
            const response = await fetch(`${API_BASE_URL}/api/solutions/${id}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            setSubmissions((prev) =>
                prev.map((sub) =>
                    sub.solutionId === id
                        ? {
                            ...sub,
                            status: newStatus,
                            points: newStatus === "solution_accepted_points" || "winner" ? 50 : 0,

                        }
                        : sub
                )
            );

            toast({
                title: "Status Updated",
                description:
                    newStatus === "solution_accepted_points"
                        ? `Submission triaged with points. Awarded 50 points.`
                        : `Submission status updated to ${statusLabels[newStatus]}.`,
            });

            setStatusUpdates((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            });

        } finally {
            setIsUpdating((prev) => ({ ...prev, [id]: false }));
        }
    };


    const [SubmissionsLength, setSubmissionsLength] = useState(0);
    const list = Array.isArray(submissions) ? submissions : [];

    const overviewStats = {
        new: list.filter(s => s.status === 'new').length,
        review: list.filter(s => s.status === 'under_review').length,
        solutionAcceptedPoints: list.filter(s => s.status === 'solution_accepted_points').length,
        challengeSubmitted: SubmissionsLength,
    };

    const allowedExtensions = ["pdf", "doc", "docx"];

    const onDrop = useCallback(
        (acceptedFiles: any) => {
            setUploadError("");

            const validFiles = [];
            const allowedExtensions = ["pdf", "doc", "docx"];

            for (const file of acceptedFiles) {
                const ext = file.name.split(".").pop().toLowerCase();

                if (!allowedExtensions.includes(ext)) {
                    setUploadError(`Only PDF, DOC, and DOCX files are allowed: ${file.name}`);
                    continue;
                }

                if (validFiles.length + files.length >= MAX_FILES) {
                    setUploadError(`Maximum ${MAX_FILES} files allowed`);
                    break;
                }

                validFiles.push(file);
            }

            if (validFiles.length === 0) return;

            const updated = [...files, ...validFiles];
            setFiles(updated);
            collaborationForm.setValue("attachments", updated);
        },
        [files, collaborationForm]
    );


    const { getRootProps, getInputProps, isDragActive, open: open1 } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true
    });

    const openFileDialog = () => open1();

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        collaborationForm.setValue("attachments", updated);
    };

    const [isProfileSubmitted, setIsProfileSubmitted] = useState(false);
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function onCollaborationSubmit(data: collaborationFormValues) {
        const token = localStorage.getItem("token");
        if (!token) {
            toast({
                variant: "destructive",
                title: "Authentication Error",
                description: "Please log in again.",
            });
            return;
        }

        // Reward logic
        let rewardData: any = {};
        if (data.rewardType === "fixed") {
            rewardData.reward_amount = data.rewardAmount;
        } else {
            rewardData.reward_min = data.rewardMin;
            rewardData.reward_max = data.rewardMax;
        }

        const formData = new FormData();

        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("challenge_type", data.challengeType);
        formData.append("contact_name", data.contact.name);
        formData.append("contact_role", data.contact.role);

        formData.append("startDate", data.startDate?.toISOString() || "");
        formData.append("endDate", data.endDate?.toISOString() || "");

        formData.append("sector", data.technologyArea?.sector || "");
        formData.append("technologyArea", data.technologyArea?.techArea || "");

        // Reward
        if (rewardData.reward_amount !== undefined) {
            formData.append("reward_amount", String(rewardData.reward_amount));
        }
        if (rewardData.reward_min !== undefined) {
            formData.append("reward_min", String(rewardData.reward_min));
        }
        if (rewardData.reward_max !== undefined) {
            formData.append("reward_max", String(rewardData.reward_max));
        }

        if (files.length > 0) {
            files.forEach((file) => {
                formData.append("attachments", file);
            });
        }

        let url = `${API_BASE_URL}/api/collaborations`;
        let method = "POST";

        if (isEditingCollaboration && currentEditingCollaborationId) {
            url = `${API_BASE_URL}/api/collaborations/${currentEditingCollaborationId}`;
            method = "PUT";
        }

        try {
            setIsSubmitting(true);

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                toast({
                    title: isEditingCollaboration ? "Collaboration Updated" : "Collaboration Saved",
                    description: isEditingCollaboration
                        ? "Your collaboration details have been updated."
                        : "Your collaboration details have been saved.",
                });

                getUsersCollaboration();

                collaborationForm.reset({
                    title: "",
                    description: DEFAULT_COLLABORATION_DESCRIPTION,
                    rewardType: "fixed",
                    rewardAmount: 0,
                    rewardMin: undefined,
                    rewardMax: undefined,
                    contact: { name: "", role: "" },
                    challengeType: "corporate",
                    startDate: undefined,
                    endDate: undefined,
                    technologyArea: { sector: "", techArea: "" },
                    attachments: [],
                });

                setFiles([]); // reset file uploader

                setIsEditingCollaboration(false);
                setCurrentEditingCollaborationId(null);
                setSelectedCollaborationToEdit(null);
            } else {
                const errorData = await response.json();
                toast({
                    variant: "destructive",
                    title: `Failed to ${isEditingCollaboration ? "update" : "save"} collaboration`,
                    description: errorData.error || "An unknown error occurred.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: `Could not ${isEditingCollaboration ? "update" : "save"
                    } collaboration info. Please try again later.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    }




    const [sectors, setSectors] = useState<SectorData[]>([]);

    const fetchSectors = async () => {
        const res = await fetch(`${API_BASE_URL}/api/sectors`);
        const data = await res.json();
        setSectors(data);
    };
    useEffect(() => {
        fetchSectors();
    }, []);

    useEffect(() => {
        if (selectedCollaborationToEdit) {
            collaborationForm.reset({
                title: selectedCollaborationToEdit.title,
                description: selectedCollaborationToEdit.description,
                rewardType: selectedCollaborationToEdit.reward_min != null ? "range" : "fixed",
                rewardAmount: selectedCollaborationToEdit.reward_amount || 0,
                rewardMin: selectedCollaborationToEdit.reward_min ?? undefined,
                rewardMax: selectedCollaborationToEdit.reward_max ?? undefined,
                contact: {
                    name: selectedCollaborationToEdit.contact_name,
                    role: selectedCollaborationToEdit.contact_role,
                },
                challengeType: selectedCollaborationToEdit.challenge_type,
                startDate: selectedCollaborationToEdit.start_date ? new Date(selectedCollaborationToEdit.start_date) : undefined,
                endDate: selectedCollaborationToEdit.end_date ? new Date(selectedCollaborationToEdit.end_date) : undefined,
                technologyArea: {
                    sector: selectedCollaborationToEdit.sector || '',
                    techArea: selectedCollaborationToEdit.technology_area || ''
                }
            });
        }
    }, [selectedCollaborationToEdit, collaborationForm]);

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
                    'Authorization': `Bearer ${token} `
                }
            });

            const result = await response.json();
            setSubmissions(Array.isArray(result.solutions) ? result.solutions : []);
        } catch (error) {
            setSubmissions([]);
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could Not Get User Solutions. Please try again later.' });
        }
    }, [toast])

    useEffect(() => {
        getSubmissions()
    }, [getSubmissions])

    const getUsersCollaboration = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/get-users-collaboration`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();

            setGetUserCollaborationData(Array.isArray(result.collaborations) ? result.collaborations : []);
            if (result.length > 0) {
                setSubmissionsLength(result.length);
            }
        } catch (error) {
            setGetUserCollaborationData([]);
            toast({ variant: 'destructive', title: 'Network Error', description: 'Could not save settings. Please try again later.' });
        }
    }, [setGetUserCollaborationData, toast]);

    useEffect(() => {
        const checkProfile = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${API_BASE_URL}/api/isProfileSubmitted`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                setIsProfileSubmitted(data.status === "submitted");
            } catch (err) {
                console.error("Network error:", err);
            }

            await getUsersCollaboration();
        };

        checkProfile();
    }, [getUsersCollaboration]);



    const [open, setOpen] = useState(false);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [collaborationToDeleteId, setCollaborationToDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function onDeleteCollaboration() {
        if (!collaborationToDeleteId) return;

        setIsDeleting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Please log in again.' });
            setIsDeleting(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/collaborations/${collaborationToDeleteId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.ok) {
                toast({
                    title: "Collaboration Deleted",
                    description: "The collaboration has been successfully removed.",
                });

                setGetUserCollaborationData(prev => prev.filter(collab => collab.id !== collaborationToDeleteId));
                setIsDeleteDialogOpen(false);
                setCollaborationToDeleteId(null);
            } else {
                const errorData = await response.json();
                toast({
                    variant: "destructive",
                    title: "Failed to delete collaboration",
                    description: errorData.error || "An unknown error occurred.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Network Error",
                description: "Could not delete collaboration. Please try again later.",
            });
        } finally {
            setIsDeleting(false);
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            profileForm.setValue('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            profileForm.setValue('logo', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeLogo = () => {
        profileForm.setValue('logo', null);
        setLogoPreview(null);
    };


    const handleOpenDialog = async () => {
        const isValid = await profileForm.trigger();

        if (isValid) {
            setOpen(true);
        }
    };

    const [datePickerOpen, setDatePickerOpen] = useState(false);

    useEffect(() => {
        const pendingTab = localStorage.getItem("msmeTabPending");
        if (pendingTab) {
            setActiveTab(pendingTab as MsmeDashboardTab);
            localStorage.removeItem("msmeTabPending");
        }
    }, []);


    return (
        <>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this collaboration? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onDeleteCollaboration}
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                    {!isLoggedIn ? (
                        <>
                            <DialogHeader className="p-6">
                                <DialogTitle className="text-3xl font-bold text-center  font-headline">Join as an MSME</DialogTitle>
                                <DialogDescription className="text-center">
                                    <span className="text-accent">{"Your business, your potential."}</span><br />
                                    Browse technology profiles from various organizations seeking collaboration.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="h-[90vh] flex flex-col justify-center items-center">
                                <LoginPrompt setActiveView={setActiveView} contentType="Join as an MSME" />
                            </div>
                        </>
                    ) : !isMsmeRole ? (<>
                        <DialogHeader className="p-6 m-auto flex items-center">
                            <DialogTitle className="text-3xl font-bold font-headline">Join as an MSME</DialogTitle>
                            <DialogDescription className="text-center">
                                <span className="text-accent">{"Your business, your potential."}</span><br />
                                Browse technology profiles from various organizations seeking collaboration.

                            </DialogDescription>
                        </DialogHeader>
                        <div className="h-screen flex flex-col justify-center items-center">
                            <p>You do not have MSME access.</p>
                        </div>
                    </>

                    ) : (<>
                        <DialogHeader className="p-6">
                            <DialogTitle className="text-3xl font-bold font-headline">MSME Dashboard</DialogTitle>
                            <DialogDescription>Welcome, {user.name}. Manage your challenges, submissions, and profile.</DialogDescription>
                        </DialogHeader>
                        <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                            <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as MsmeDashboardTab)} className="flex flex-col flex-grow min-h-0">
                                <TabsList className="grid w-full grid-cols-5">
                                    <TabsTrigger value="overview"><LayoutDashboard className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
                                    <TabsTrigger value="submissions"><FileText className="mr-2 h-4 w-4" /> Submissions</TabsTrigger>
                                    <TabsTrigger value="engagement"><Handshake className="mr-2 h-4 w-4" /> Engagement</TabsTrigger>
                                    <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" /> Edit Profile</TabsTrigger>
                                    <TabsTrigger value="settings"><Settings className="mr-2 h-4 w-4" /> Settings</TabsTrigger>
                                </TabsList>
                                <ScrollArea className="flex-grow mt-4">
                                    <TabsContent value="overview" className="mt-0 space-y-6">
                                        <div className="grid gap-6 md:grid-cols-4">
                                            <Card className="
                                                    bg-card/50 
                                                    backdrop-blur-sm 
                                                    border-border/50 
                                                    cursor-pointer 
                                                    hover:border-primary 
                                                    transition-colors
                                                "
                                                onClick={() => setActiveTab("submissions")} >
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">New Submissions</CardTitle><FileText className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                                <CardContent><div className="text-2xl font-bold">{overviewStats.new}</div><p className="text-xs text-muted-foreground">Awaiting review</p></CardContent>
                                            </Card>
                                            <Card className="
                                                    bg-card/50 
                                                    backdrop-blur-sm 
                                                    border-border/50 
                                                    cursor-pointer 
                                                    hover:border-primary 
                                                    transition-colors
                                                " onClick={() => setActiveTab("engagement")}>
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Incentive Challenges</CardTitle>
                                                    <Target className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">
                                                        {overviewStats.challengeSubmitted === 0 ? "0" : overviewStats.challengeSubmitted}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Challenges submitted</p>
                                                </CardContent>

                                            </Card>
                                            <Card
                                                className="
                                                    bg-card/50 
                                                    backdrop-blur-sm 
                                                    border-border/50 
                                                    cursor-pointer 
                                                    hover:border-primary 
                                                    transition-colors
                                                "
                                                onClick={() => setActiveTab("submissions")}
                                            >
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                    <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                </CardHeader>

                                                <CardContent>
                                                    <div className="text-2xl font-bold">{overviewStats.review}</div>
                                                    <p className="text-xs text-muted-foreground">Currently being evaluated</p>
                                                </CardContent>
                                            </Card>

                                            <Card className="
                                                    bg-card/50 
                                                    backdrop-blur-sm 
                                                    border-border/50 
                                                    cursor-pointer 
                                                    hover:border-primary 
                                                    transition-colors
                                                "
                                                onClick={() => setActiveTab("submissions")} >
                                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Accepted Solutions</CardTitle><CheckCircle className="h-4 w-4 text-muted-foreground" /></CardHeader>
                                                <CardContent><div className="text-2xl font-bold">{overviewStats.solutionAcceptedPoints}</div><p className="text-xs text-muted-foreground">Marked as valid for collaboration</p></CardContent>
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
                                        {submissions.length > 0 ? submissions.map((sub, id) => (
                                            <Card
                                                key={id}
                                                onClick={() => setSelectedSubmission(sub)}
                                                className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 cursor-pointer transition-colors"
                                            >
                                                <CardHeader className="pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-2 w-full">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <div className='flex justify-between w-full'>
                                                                    <CardTitle className="tracking-normal text-lg font-medium w-full">
                                                                        {sub.challenge?.title || "Untitled Challenge"}
                                                                    </CardTitle>
                                                                    <div className="flex gap-2">
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <span>Comments</span>
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="px-2 py-0.5 rounded-full bg-muted text-foreground/70 text-xs font-medium">
                                                                                    {sub.comments?.length || 0}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                            <span>Points</span>
                                                                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                                                                {sub.points ?? 0}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <CardDescription className="flex items-center text-sm text-muted-foreground">


                                                                <p className="text-sm text-muted-foreground flex items-center">
                                                                    Submitted {formatPrettyDate(new Date(sub.createdAt))}
                                                                    <span className="w-1 h-1 rounded-full bg-foreground/40 inline-block mx-2"></span>
                                                                </p>
                                                                <Badge
                                                                    className={`px-3 py-1 text-xs font-semibold border rounded-sm 
                                                                    ${statusBadgeClasses[sub.status]}`}
                                                                >
                                                                    {statusLabels[sub.status]}

                                                                </Badge>
                                                                {sub.lastActive && <span className="w-1 h-1 rounded-full bg-foreground/40 inline-block mx-2"></span>}
                                                                {sub.lastActive && (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Last active {timeAgoShort(new Date(sub.lastActive))}
                                                                    </p>
                                                                )}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardFooter className="flex gap-2 items-center">
                                                    {sub.contactName && (
                                                        <div className="flex items-center text-sm text-muted-foreground">
                                                            <span className="font-medium">By {sub.contactName}</span>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-2 ml-auto">
                                                        {statusUpdates[sub.solutionId] && (
                                                            <Button
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUpdateStatus(sub.solutionId);
                                                                }}
                                                                disabled={isUpdating[sub.solutionId] || sub.challenge?.status === "stopped" || sub.challenge?.status === "expired"}
                                                            >
                                                                {isUpdating[sub.solutionId] ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <Save className="mr-2 h-4 w-4" />
                                                                )}
                                                                Update Status
                                                            </Button>
                                                        )}

                                                        {sub.challenge?.allow_status_updates !== false && sub.challenge?.status !== "expired" && sub.challenge?.status !== "stopped" && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        {statusUpdates[sub.status]}
                                                                        <span>{statusLabels[sub.status]}</span>
                                                                        <ChevronDown className="ml-2 h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>

                                                                <DropdownMenuContent>
                                                                    {Object.values(SolutionStatus).map((status) => (
                                                                        <DropdownMenuItem
                                                                            key={status}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleStatusChange(sub.solutionId, status);
                                                                            }}
                                                                        >
                                                                            <span>{statusLabels[status]}</span>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                </CardFooter>
                                            </Card >
                                        )) : (
                                            <Card className="text-center text-muted-foreground py-16">
                                                <CardContent>You have not received any submissions yet.</CardContent>
                                            </Card>
                                        )
                                        }
                                    </TabsContent >
                                    <TabsContent value="engagement" className="mt-0 space-y-4">
                                        {getUsersCollaborationData?.length > 0 ? getUsersCollaborationData.map((sub) => (
                                            <Card
                                                key={sub.id}
                                                onClick={() => setSelectedCollabId(sub.id)}
                                                className="bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer hover:border-primary"
                                            >
                                                <CardHeader>
                                                    <div className="flex justify-between items-start w-full">
                                                        <div>
                                                            <CardTitle className="text-lg">{sub.title}</CardTitle>
                                                            <CardDescription>Submitted by {sub.contact_name}</CardDescription>
                                                        </div>

                                                        {/* 3 DOT MENU */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-5 w-5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedCollabId(sub.id);
                                                                        setIsCollabEditMode(true);
                                                                    }}
                                                                >
                                                                    <Pencil className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setCollaborationToDeleteId(sub.id);
                                                                        setIsDeleteDialogOpen(true);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </CardHeader>

                                                <CardFooter>
                                                    <p className="text-sm text-muted-foreground">
                                                        Submitted on {new Date(sub.created_at).toLocaleString()}
                                                    </p>
                                                </CardFooter>
                                            </Card>
                                        )) : (
                                            <Card className="text-center text-muted-foreground py-16">
                                                <CardContent>You have not submit any Collaboration.</CardContent>
                                            </Card>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="profile" className="mt-0">
                                        <Card className={`${isProfileSubmitted ? "hidden" : "block"} bg-card/25 backdrop-blur-sm border-border/50`}>
                                            <CardHeader>
                                                <CardTitle>Create MSME Profile</CardTitle>
                                                <CardDescription>
                                                    This information will be publicly visible to potential collaborators.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Form {...profileForm}>
                                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                                                        <FormField
                                                            control={profileForm.control}
                                                            name="name"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("name") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Company Name <span className="text-red-600">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="Enter company name"
                                                                                    className="pr-16"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                        <FormField
                                                            control={profileForm.control}
                                                            name="affiliated_by"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("affiliated_by") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Affiliated By</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="Eg: Company / Institution Name"
                                                                                    className="pr-16"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="sector"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("sector") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Sector <span className="text-red-600">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="e.g., FinTech, Health, AI"
                                                                                    className="pr-16"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="short_description"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("short_description") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Short Description <span className="text-red-600">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Textarea
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="A brief one-sentence pitch for your company."
                                                                                    className="pr-16"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="website_url"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("website_url") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Website URL</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="https://example.com"
                                                                                    className="pr-20"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="x_url"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("x_url") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>X (Twitter) URL</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="https://x.com/username"
                                                                                    className="pr-20"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="linkedin_url"
                                                            render={({ field }) => {
                                                                const value = profileForm.watch("linkedin_url") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>LinkedIn URL</FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={MAX_CHARS}
                                                                                    placeholder="https://linkedin.com/in/username"
                                                                                    className="pr-20"
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {value.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="logo"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Company Logo <span className="text-red-500">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <div
                                                                            onClick={() => fileInputRef.current?.click()}
                                                                            onDragOver={handleDragOver}
                                                                            onDrop={handleDrop}
                                                                            className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                                                                        >
                                                                            {logoPreview ? (
                                                                                <>
                                                                                    <Image
                                                                                        src={logoPreview}
                                                                                        alt="Logo preview"
                                                                                        layout="fill"
                                                                                        objectFit="contain"
                                                                                        className="rounded-lg"
                                                                                    />
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="destructive"
                                                                                        size="icon"
                                                                                        className="absolute top-2 right-2 z-10"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            removeLogo();
                                                                                        }}
                                                                                    >
                                                                                        <Trash2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                </>
                                                                            ) : (
                                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                                                                    <p className="mb-2 text-sm text-muted-foreground">
                                                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                                                    </p>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        PNG, JPG, or GIF (MAX. 800x400px)
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            <Input
                                                                                ref={fileInputRef}
                                                                                id="dropzone-file"
                                                                                type="file"
                                                                                className="hidden"
                                                                                accept="image/*"
                                                                                onChange={handleFileChange}
                                                                            />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <Dialog open={open} onOpenChange={setOpen}>
                                                            <DialogTrigger asChild>
                                                                <LoadingButton
                                                                    type="button"
                                                                    onClick={handleOpenDialog}
                                                                    isLoading={isSubmitting}
                                                                    disabled={isProfileSubmitting}
                                                                >
                                                                    {isProfileSubmitted ? "Profile Already Submitted" : "Save Profile"}
                                                                </LoadingButton>
                                                            </DialogTrigger>

                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Confirm Submission</DialogTitle>
                                                                    <DialogDescription>
                                                                        Are you sure you want to submit your profile? You can only submit once.
                                                                        <br />
                                                                        <span className="text-red-500">Please type <strong>{"confirm"}</strong> below to proceed.</span>
                                                                    </DialogDescription>
                                                                </DialogHeader>

                                                                <div className="py-4">
                                                                    <Input
                                                                        placeholder='Type "confirm" to proceed'
                                                                        value={confirmText}
                                                                        onChange={(e) => setConfirmText(e.target.value)}
                                                                    />
                                                                </div>

                                                                <DialogFooter className="flex justify-end gap-2">
                                                                    <Button variant="outline" onClick={() => setOpen(false)}>
                                                                        Cancel
                                                                    </Button>

                                                                    <Button
                                                                        onClick={() => {
                                                                            profileForm.handleSubmit(onProfileSubmit)();
                                                                        }}
                                                                        disabled={
                                                                            profileForm.formState.isSubmitting ||
                                                                            confirmText.toLowerCase() !== "confirm"
                                                                        }
                                                                    >
                                                                        {profileForm.formState.isSubmitting && (
                                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        )}
                                                                        Confirm
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </form>
                                                </Form>
                                            </CardContent>
                                        </Card>


                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mt-4">
                                            <CardHeader>
                                                <CardTitle>Incentive Challenges</CardTitle>
                                                <CardDescription>
                                                    {"Tell us about the Challenges you're seeking and the contact person."}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <Form {...collaborationForm}>
                                                    <form onSubmit={collaborationForm.handleSubmit(onCollaborationSubmit)} className="space-y-4">

                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="title"
                                                            render={({ field }) => {
                                                                const titleValue = collaborationForm.watch("title") || "";
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input placeholder="Give your collaboration a title" {...field} />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                                                                                    {titleValue.length}/{MAX_CHARS}
                                                                                </span>
                                                                            </div>
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )
                                                            }
                                                            }
                                                        />

                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="technologyArea"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Sector & Technology Area <span className="text-red-500">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <SectorSearchWithDropdown
                                                                            data={sectors}
                                                                            defaultValue={field.value}
                                                                            onSelect={(item: any) => field.onChange({ "sector": item.sector, "techArea": item.label })}
                                                                            onDataAdded={fetchSectors}

                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="description"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Description <span className="text-red-500">*</span>
                                                                    </FormLabel>

                                                                    <ChallengeMarkdownEditor
                                                                        ttForm={collaborationForm}
                                                                        defaultDescription={`[Give a brief overview of the context and purpose of this challenge.]
## Objective
[What do you aim to achieve with this challenge? Clearly state the expected outcome or impact.]

## Problem Statement
[The current process of [describe the issue] is outdated and inefficient, affecting [who is impacted] with [specific negative consequence]]

## Background
[Describe the core problem this challenge seeks to solve. Why does it exist? Who is impacted?]

## What We Are Looking For
[Explain the type of solution you want participants to propose or build.]

## Scope of Requirements
1. Requirement 1
2. Requirement 2
3. Requirement 3
`}
                                                                    />

                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="rewardType"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Reward <span className="text-red-500">*</span>
                                                                    </FormLabel>

                                                                    <FormControl>
                                                                        <div className="flex items-center gap-4">

                                                                            {/* ✅ CUSTOM DROPDOWN USING POPOVER */}
                                                                            <Popover>
                                                                                <PopoverTrigger asChild>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="w-[130px] h-10 flex items-center justify-between rounded-md border px-3 text-sm"
                                                                                        disabled={isFieldDisabled('rewardType')}
                                                                                    >
                                                                                        {rewardOptions.find((opt) => opt.value === field.value)?.label ??
                                                                                            "Select type"}
                                                                                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                                                                    </button>
                                                                                </PopoverTrigger>

                                                                                <PopoverContent className="p-0 w-[130px]">
                                                                                    <Command>
                                                                                        <CommandList>
                                                                                            <CommandEmpty>No option found.</CommandEmpty>
                                                                                            <CommandGroup>
                                                                                                {rewardOptions.map((opt) => (
                                                                                                    <CommandItem
                                                                                                        key={opt.value}
                                                                                                        value={opt.value}
                                                                                                        onSelect={() => field.onChange(opt.value)}
                                                                                                    >
                                                                                                        <Check
                                                                                                            className={cn(
                                                                                                                "mr-2 h-4 w-4",
                                                                                                                field.value === opt.value ? "opacity-100" : "opacity-0"
                                                                                                            )}
                                                                                                        />
                                                                                                        {opt.label}
                                                                                                    </CommandItem>
                                                                                                ))}
                                                                                            </CommandGroup>
                                                                                        </CommandList>
                                                                                    </Command>
                                                                                </PopoverContent>
                                                                            </Popover>

                                                                            {/* ✅ CONDITIONAL INPUTS */}
                                                                            {collaborationForm.watch("rewardType") === "fixed" ? (
                                                                                <>
                                                                                    <Input
                                                                                        type="number"
                                                                                        placeholder="Enter amount"
                                                                                        {...collaborationForm.register("rewardAmount", { valueAsNumber: true })}
                                                                                        min={0}
                                                                                        className="no-spin w-48"
                                                                                        disabled={isFieldDisabled('rewardType')}
                                                                                    />
                                                                                </>
                                                                            ) : (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Input
                                                                                        type="number"
                                                                                        placeholder="Min"
                                                                                        {...collaborationForm.register("rewardMin", { valueAsNumber: true })}
                                                                                        className="no-spin w-24"
                                                                                        disabled={isFieldDisabled('rewardType')}
                                                                                    />
                                                                                    <span>-</span>
                                                                                    <Input
                                                                                        type="number"
                                                                                        placeholder="Max"
                                                                                        {...collaborationForm.register("rewardMax", { valueAsNumber: true })}
                                                                                        className="no-spin w-24"
                                                                                        disabled={isFieldDisabled('rewardType')}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </FormControl>
                                                                    {isFieldDisabled('rewardType') && (
                                                                        <p className="text-xs text-muted-foreground mt-1">
                                                                            These fields are only editable by admin. Contact admin.
                                                                        </p>
                                                                    )}
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="challengeType"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel>Challenge Type <span className="text-red-500">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            value={field.value}
                                                                            className="flex gap-5"
                                                                        >
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="corporate" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">Corporate Challenges</FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="msme" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">MSME Challenges</FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="government" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">Government Challenges</FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="startDate"

                                                            render={() => (
                                                                <div className="w-[60%] py-4">
                                                                    <FormItem className="flex flex-col gap-2">
                                                                        <FormLabel>Start / End Date <span className="text-red-500">*</span></FormLabel>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            className="pl-3 text-left font-normal"
                                                                            onClick={() => setDatePickerOpen((prev) => !prev)}
                                                                            disabled={isFieldDisabled('startDate')}
                                                                        >
                                                                            {collaborationForm.watch("startDate") && collaborationForm.watch("endDate") ? (
                                                                                <>
                                                                                    {format(collaborationForm.watch("startDate") as Date, "PPP")} →{" "}
                                                                                    {format(collaborationForm.watch("endDate") as Date, "PPP")}
                                                                                </>
                                                                            ) : (
                                                                                <span>Pick date range</span>
                                                                            )}
                                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                        </Button>

                                                                        {datePickerOpen && !isFieldDisabled('startDate') && (
                                                                            <div className="mt-2 border rounded-md p-3 shadow-md z-50 w-fit">
                                                                                <Calendar
                                                                                    mode="range"
                                                                                    numberOfMonths={2}
                                                                                    selected={{
                                                                                        from: collaborationForm.watch("startDate"),
                                                                                        to: collaborationForm.watch("endDate"),
                                                                                    }}
                                                                                    onSelect={(range: any) => {
                                                                                        collaborationForm.setValue("startDate", range?.from);
                                                                                        collaborationForm.setValue("endDate", range?.to);
                                                                                        if (range?.from && range?.to) setDatePickerOpen(false);
                                                                                    }}


                                                                                    disabled={(date) => date < new Date()}
                                                                                />
                                                                                <div className="flex justify-end gap-2 mt-3">
                                                                                    <Button
                                                                                        type="button"
                                                                                        variant="ghost"
                                                                                        onClick={() => {
                                                                                            collaborationForm.setValue("startDate", new Date());
                                                                                            collaborationForm.setValue("endDate", new Date());
                                                                                        }}
                                                                                    >
                                                                                        Reset
                                                                                    </Button>

                                                                                    <Button type="button" onClick={() => setDatePickerOpen(false)}>
                                                                                        Confirm
                                                                                    </Button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {isFieldDisabled('startDate') && (
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                These fields are only editable by admin. Contact admin.
                                                                            </p>
                                                                        )}
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                </div>

                                                            )}
                                                        />
                                                        <FormField
                                                            control={collaborationForm.control}
                                                            name="attachments"
                                                            render={() => (
                                                                <FormItem>
                                                                    <FormLabel>Attachments (Max 5 files)</FormLabel>
                                                                    <FormControl>
                                                                        <div
                                                                            {...getRootProps()}
                                                                            className={cn(
                                                                                "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 hover:bg-muted/30",
                                                                                isDragActive ? "bg-accent/30" : "bg-muted/20"
                                                                            )}
                                                                            onClick={openFileDialog}
                                                                        >
                                                                            <input {...getInputProps()} />


                                                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />

                                                                            <p className="text-sm text-muted-foreground mt-1" >
                                                                                Click to upload or Drag & drop PDF or DOCX here
                                                                            </p>

                                                                            <p className="text-xs text-muted-foreground">
                                                                                Max 5 files • Allowed: PDF, DOCX
                                                                            </p>
                                                                        </div>
                                                                    </FormControl>


                                                                    {files.length > 0 && (
                                                                        <div className="mt-4 space-y-2">
                                                                            {files.map((file: any, index) => {
                                                                                const ext = file.name.split(".").pop().toLowerCase();
                                                                                const isPDF = ext === "pdf";
                                                                                const isDOC = ext === "doc";
                                                                                const isDOCX = ext === "docx";

                                                                                return (
                                                                                    <div
                                                                                        key={index}
                                                                                        className="flex justify-between items-center border rounded p-2 bg-muted/40"
                                                                                    >
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div>
                                                                                                <div className="text-sm font-medium">{file.name}</div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                    {(file.size / 1024).toFixed(1)} KB
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => removeFile(index)}
                                                                                        >
                                                                                            <X className="h-4 w-4" />
                                                                                        </Button>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}


                                                                    {/* Error */}
                                                                    {uploadError && (
                                                                        <p className="text-xs text-destructive mt-1">{uploadError}</p>
                                                                    )}

                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />


                                                        <Separator className="my-4" />

                                                        {/* Contact Person */}
                                                        <h3 className="text-lg font-medium">Contact Person</h3>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <FormField
                                                                control={collaborationForm.control}
                                                                name="contact.name"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={300}
                                                                                    placeholder="Enter the Name"
                                                                                    onChange={(e) => {
                                                                                        field.onChange(e);
                                                                                    }}
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                                                                                    {field.value?.length || 0}/300
                                                                                </span>
                                                                            </div>

                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                            <FormField
                                                                control={collaborationForm.control}
                                                                name="contact.role"
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Role <span className="text-red-500">*</span></FormLabel>
                                                                        <FormControl>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    {...field}
                                                                                    maxLength={300}
                                                                                    placeholder="Enter the Role"
                                                                                    onChange={(e) => {
                                                                                        field.onChange(e);
                                                                                    }}
                                                                                />
                                                                                <span className="absolute right-2 bottom-2 text-xs text-gray-500">
                                                                                    {field.value?.length || 0}/300
                                                                                </span>
                                                                            </div>

                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <Button type="submit" disabled={collaborationForm.formState.isSubmitting}>
                                                            {collaborationForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            {isEditingCollaboration ? "Update Collaboration" : "Save Collaboration Info"}
                                                        </Button>
                                                    </form>
                                                </Form>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                    <TabsContent value="settings" className="mt-0">
                                        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                            <CardHeader><CardTitle>Account Settings</CardTitle><CardDescription>Manage your account settings.</CardDescription></CardHeader>
                                            <CardContent className="space-y-8">
                                                <Form {...settingsForm}>
                                                    <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
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
                                                {authProvider === 'local' && (
                                                    <>
                                                        <Separator />
                                                        <PasswordChangeForm />
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </ScrollArea >
                            </Tabs >
                        </div >
                    </>)
                    }
                </DialogContent >
            </Dialog >
            <SubmissionDetailsModal
                submission={selectedSubmission}
                onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}
            />
            {
                selectedCollabId !== null && (
                    <CollaborationView
                        collaborationId={selectedCollabId}
                        initialEditMode={isCollabEditMode}
                        onClose={() => {
                            setSelectedCollabId(null);
                            setIsCollabEditMode(false);
                        }}
                    />
                )
            }
            <Script
                src="https://www.google.com/recaptcha/enterprise.js?render=6LfZ4H8rAAAAAA0NMVH1C-sCiE9-Vz4obaWy9eUI"
                strategy="afterInteractive"
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
