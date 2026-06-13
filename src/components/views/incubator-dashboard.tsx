
"use client";

import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { StartupSubmission, StartupIdeaStatus } from "./founder-ideas-view";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart as RechartsBarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LayoutDashboard, FileText, User, Settings, CheckCircle, Clock, Copy, XCircle, PlusCircle, Trash2, Loader2, MoreHorizontal, Edit, RefreshCcw } from "lucide-react";
import type { IncubatorDashboardTab, Submission, Comment } from "@/app/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { VanityUrlInput } from "@/components/ui/vanity-url-input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import SubmissionDetailsModal from "./submission-details-modal";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { API_BASE_URL } from "@/lib/api";
import PasswordChangeForm from './password-change-form';
import { EmailUpdateForm } from "../ui/EmailUpdateForm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Download, Star } from "lucide-react";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';



type User = {
    userId: string;
    name: string;
    email: string;
}
type AuthProvider = 'local' | 'google';


const profileFormSchema = z.object({
    name: z.string().min(1, "Incubator name is required"),
    location: z.string().min(1, "Location is required"),
    type: z.array(z.string()).min(1, "At least one type is required"),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().optional(),
    description: z.string().min(1, "Description is required").max(5000, { message: "Description must not exceed 5000 characters" }),
    focus: z.array(z.object({ value: z.string().min(1, "Focus area cannot be empty.") })).min(1, "At least one focus area is required."),
    socialLinks: z.object({
        website: z.string().url("Valid URL required").min(1, "Website is required"),
        linkedin: z.string().url("Valid URL required").min(1, "LinkedIn is required"),
        twitter: z.string().url().optional().or(z.literal("")),
        facebook: z.string().url().optional().or(z.literal("")),
        instagram: z.string().url().optional().or(z.literal("")),
        youtube: z.string().url().optional().or(z.literal("")),
    }),
    metrics: z.object({
        startupsSupported: z.string().min(1, "Required"),
        fundedStartupsPercent: z.string().min(1, "Required"),
        startupsOutsideLocationPercent: z.string().min(1, "Required"),
        totalFundingRaised: z.string().min(1, "Required"),
    }),
    partners: z.array(z.object({ value: z.string().min(1, "Partner name cannot be empty") })).min(1, "At least one partner is required"),
    startups: z.array(z.object({
        name: z.string().min(1, "Startup name is required"),
        city: z.string().optional(),
        founded_year: z.coerce.string().optional(),
        sector: z.array(z.string()).min(1, "At least one sector is required"),
        is_funded: z.boolean().default(false),
        funding_raised: z.coerce.string().optional()
    })).min(1, "At least one startup details is required").default([]),
    // Commented out fields per user request
    /*
    details: z.object({
        overview: z.string().min(1, "Overview is required"),
        services: z.array(z.object({
            title: z.string().min(1, "Service title is required"),
            description: z.string().min(1, "Service description is required").max(200, "Description must not exceed 200 characters"),
        })),
        benefits: z.array(z.object({ value: z.string().min(1, "Benefit cannot be empty") })),
        eligibility: z.object({
            focusAreas: z.string().min(1, "Required").max(200, "Focus area must not exceed 200 characters"),
            requirements: z.array(z.object({ value: z.string().min(1, "Requirement cannot be empty") })),
        }),
        timeline: z.array(z.object({
            event: z.string().min(1, "Event name is required"),
            period: z.string().min(1, "Period is required"),
        })),
    }),
    */
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const settingsFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(35, "Name must not exceed 35 characters"),
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
    authProvider: AuthProvider;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const emptyProfile: ProfileFormValues = {
    name: "",
    location: "",
    type: ["Incubator"],
    contactEmail: "",
    contactPhone: "",
    description: "",
    focus: [],
    socialLinks: {
        website: "",
        linkedin: "",
        twitter: "",
        facebook: "",
        instagram: "",
        youtube: "",
    },
    metrics: {
        startupsSupported: "",
        fundedStartupsPercent: "",
        startupsOutsideLocationPercent: "",
        totalFundingRaised: "",
    },
    partners: [],
    startups: [],
    /*
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
    */
} as any;

export default function IncubatorDashboardView({ isOpen, setUser, onOpenChange, user, authProvider }: IncubatorDashboardViewProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<IncubatorDashboardTab>("overview");
    const [submissions, setSubmissions] = useState<StartupSubmission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<StartupSubmission | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [myIncubators, setMyIncubators] = useState<any[]>([]);
    const [editingIncubatorId, setEditingIncubatorId] = useState<string | null>(null);
    const [isFetchingMyIncubators, setIsFetchingMyIncubators] = useState(false);
    const [selectedMyIncubator, setSelectedMyIncubator] = useState<any>(null);
    const [sectorsList, setSectorsList] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/sectors`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSectorsList(data.map(d => d.name));
                }
            }).catch(err => console.error("Failed to fetch sectors", err));
    }, []);

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

    const { fields: partnerFields, append: appendPartner, remove: removePartner } = useFieldArray({
        control: profileForm.control, name: "partners"
    });

    /*
    const { fields: services, append: appendService, remove: removeService } = useFieldArray({
        control: profileForm.control, name: "details.services"
    });
    const { fields: benefits, append: appendBenefit, remove: removeBenefit } = useFieldArray({
        control: profileForm.control, name: "details.benefits"
    });
    */
    const { fields: focusFields, append: appendFocus, remove: removeFocus } = useFieldArray({
        control: profileForm.control, name: "focus"
    });
    const { fields: startupFields, append: appendStartup, remove: removeStartup } = useFieldArray({
        control: profileForm.control, name: "startups"
    });

    const watchedStartupsStr = JSON.stringify(profileForm.watch("startups") || []);
    const watchedLocation = profileForm.watch("location") || "";

    const metricsData = useMemo(() => {
        const startups = JSON.parse(watchedStartupsStr);
        if (!startups || startups.length === 0) {
            return {
                startupsSupported: "0",
                fundedStartupsPercent: "0%",
                startupsOutsideLocationPercent: "0%",
                totalFundingRaised: "₹0",
            };
        }

        const total = startups.length;
        const funded = startups.filter((s: any) => s.is_funded).length;

        const outside = startups.filter((s: any) => {
            if (!s.city) return false;
            const sCity = s.city.toLowerCase().trim();
            const incLoc = watchedLocation.toLowerCase().trim();
            return sCity !== "" && incLoc !== "" && !incLoc.includes(sCity) && !sCity.includes(incLoc);
        }).length;

        const totalFunding = startups.reduce((acc: number, s: any) => {
            if (s.is_funded && s.funding_raised) {
                const num = parseFloat(String(s.funding_raised).replace(/[^0-9.]/g, ''));
                return acc + (isNaN(num) ? 0 : num);
            }
            return acc;
        }, 0);

        const formatFunding = (num: number) => {
            if (num >= 1000000000000) return (num / 1000000000000).toFixed(1).replace(/\.0$/, '') + 'T';
            if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
            if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
            return num.toString();
        };

        return {
            startupsSupported: total.toString(),
            fundedStartupsPercent: total > 0 ? `${Math.round((funded / total) * 100)}%` : "0%",
            startupsOutsideLocationPercent: total > 0 ? `${Math.round((outside / total) * 100)}%` : "0%",
            totalFundingRaised: `₹${formatFunding(totalFunding)}`,
        };
    }, [watchedStartupsStr, watchedLocation]);

    const handleDownloadPDF = () => {
        if (!selectedMyIncubator) return;
        const doc = new jsPDF();

        // Add Logo
        const logoUrl = '/logo.png';
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
            doc.addImage(img, 'PNG', 14, 10, 30, 10);
            generatePDFContent(doc);
        };
        img.onerror = () => {
            generatePDFContent(doc); // Fallback if logo not found
        };
    };

    const generatePDFContent = (doc: jsPDF) => {
        if (!selectedMyIncubator) return;

        let yPos = 30;

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(selectedMyIncubator.name, 14, yPos);
        yPos += 8;

        // Rating, Reviews
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(80, 80, 80);
        if (selectedMyIncubator.rating !== undefined && selectedMyIncubator.rating !== null) {
            doc.text(`Rating: ${selectedMyIncubator.rating}`, 14, yPos);
            yPos += 6;
        }

        // Subtitle (Location & Type)
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`${selectedMyIncubator.location || 'Unknown'} • ${(selectedMyIncubator.type || []).join(", ")}`, 14, yPos);
        yPos += 12;

        // Description
        if (selectedMyIncubator.description) {
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            const splitText = doc.splitTextToSize(selectedMyIncubator.description, 180);
            doc.text(splitText, 14, yPos);
            yPos += (splitText.length * 5) + 10;
        }

        // Contact Info
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Contact Information', 14, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Email: ${selectedMyIncubator.contactEmail || "N/A"}`, 14, yPos);
        yPos += 5;
        doc.text(`Phone: ${selectedMyIncubator.contactPhone || "N/A"}`, 14, yPos);
        yPos += 10;

        // Metrics
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Metrics Overview', 14, yPos);
        yPos += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const m = selectedMyIncubator.metrics || {};
        doc.text(`Startups Supported: ${m.startupsSupported || "0"}`, 14, yPos);
        yPos += 5;
        doc.text(`Funded Startups: ${m.fundedStartupsPercent || "0%"}`, 14, yPos);
        yPos += 5;
        doc.text(`Startups Outside Location: ${m.startupsOutsideLocationPercent || "0%"}`, 14, yPos);
        yPos += 5;
        doc.text(`Total Funding Raised: ${(m.totalFundingRaised || "0").replace('₹', 'Rs. ')}`, 14, yPos);
        yPos += 10;

        // Focus Areas
        if (selectedMyIncubator.focus?.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Focus Areas', 14, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const focusText = doc.splitTextToSize(selectedMyIncubator.focus.join(", "), 180);
            doc.text(focusText, 14, yPos);
            yPos += (focusText.length * 5) + 5;
        }

        // Partners
        if (selectedMyIncubator.partners?.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Recognised and Funded by', 14, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const partnerText = doc.splitTextToSize(selectedMyIncubator.partners.join(", "), 180);
            doc.text(partnerText, 14, yPos);
            yPos += (partnerText.length * 5) + 5;
        }

        // Social Links
        if (selectedMyIncubator.socialLinks && Object.values(selectedMyIncubator.socialLinks).some(v => v)) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Social Links & Website', 14, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const sl = selectedMyIncubator.socialLinks;
            if (sl.website) { doc.text(`Website: ${sl.website}`, 14, yPos); yPos += 5; }
            if (sl.linkedin) { doc.text(`LinkedIn: ${sl.linkedin}`, 14, yPos); yPos += 5; }
            if (sl.twitter) { doc.text(`Twitter: ${sl.twitter}`, 14, yPos); yPos += 5; }
            if (sl.instagram) { doc.text(`Instagram: ${sl.instagram}`, 14, yPos); yPos += 5; }
            if (sl.youtube) { doc.text(`YouTube: ${sl.youtube}`, 14, yPos); yPos += 5; }
            yPos += 5;
        }

        // Additional Details
        if (selectedMyIncubator.details && Object.keys(selectedMyIncubator.details).length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Additional Details', 14, yPos);
            yPos += 6;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const detailsText = doc.splitTextToSize(JSON.stringify(selectedMyIncubator.details, null, 2), 180);
            if (yPos + (detailsText.length * 4) > 270) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(detailsText, 14, yPos);
            yPos += (detailsText.length * 4) + 10;
        }


        // Startups Table
        if (selectedMyIncubator.startups && selectedMyIncubator.startups.length > 0) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Startups Supported Detailed', 14, yPos);
            yPos += 4;

            const tableData = selectedMyIncubator.startups.map((s: any) => [
                s.name || '-',
                s.city || '-',
                s.founded_year || '-',
                (s.sector || []).join(', '),
                s.is_funded ? 'Yes' : 'No',
                s.funding_raised ? `Rs. ${s.funding_raised}` : '-'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Startup Name', 'City', 'Founded Year', 'Sectors', 'Funded?', 'Funding Raised']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] },
            });
        }

        doc.save(`${selectedMyIncubator.name.replace(/\s+/g, '_')}_Profile.pdf`);
    };

    useEffect(() => {
        profileForm.setValue("metrics.startupsSupported", metricsData.startupsSupported);
        profileForm.setValue("metrics.fundedStartupsPercent", metricsData.fundedStartupsPercent);
        profileForm.setValue("metrics.startupsOutsideLocationPercent", metricsData.startupsOutsideLocationPercent);
        profileForm.setValue("metrics.totalFundingRaised", metricsData.totalFundingRaised);
    }, [metricsData, profileForm]);

    /*
    const { fields: requirementFields, append: appendRequirement, remove: removeRequirement } = useFieldArray({
        control: profileForm.control, name: "details.eligibility.requirements"
    });
    const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({
        control: profileForm.control, name: "details.timeline"
    });
    */

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

    const fetchMyIncubators = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setIsFetchingMyIncubators(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/incubators`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setMyIncubators(data.items || []);
            }
        } catch (error) {
            console.error('Failed to fetch my incubators:', error);
        } finally {
            setIsFetchingMyIncubators(false);
        }
    }, []);

    useEffect(() => {
        fetchMyIncubators();
    }, [fetchMyIncubators]);

    const fetchSubmissions = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/founder-ideas`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(Array.isArray(data) ? data : (data.ideas || []));
            }
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();

        socketRef.current = io(API_BASE_URL, {
            path: '/socket.io',
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('idea_status_updated', () => {
            fetchSubmissions();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [fetchSubmissions]);

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


    async function onProfileSubmit(data: ProfileFormValues) {
        const token = localStorage.getItem('token');
        const profileData = {
            ...data,
            focus: data.focus.map((item) => item.value),
            partners: data.partners.map((item) => item.value),
            type: (data.type || []).filter(t => t.length > 1), // Clean up corrupted one-character tags
            startups: data.startups || [],
            image: 'https://placehold.co/600x400.png',
            hint: 'office building',
            rating: editingIncubatorId ? undefined : 0, // Don't reset rating on update
            reviews: editingIncubatorId ? undefined : 0,
        };

        try {
            const url = editingIncubatorId
                ? `${API_BASE_URL}/api/incubators/${editingIncubatorId}`
                : `${API_BASE_URL}/api/incubators`;

            const response = await fetch(url, {
                method: editingIncubatorId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            if (response.ok) {
                toast({
                    title: editingIncubatorId ? "Profile Updated" : "Profile Created",
                    description: editingIncubatorId ? "Your profile has been updated successfully." : "Your public incubator profile has been saved. It will now be visible to founders.",
                });
                setEditingIncubatorId(null);
                profileForm.reset(emptyProfile);
                await fetchMyIncubators();
                setActiveTab("submissions");
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

    const handleEditIncubator = (inc: any) => {
        setEditingIncubatorId(inc.id);
        profileForm.reset({
            name: inc.name,
            location: inc.location,
            type: Array.isArray(inc.type) ? inc.type : (typeof inc.type === 'string' ? [inc.type] : ["Incubator"]),
            contactEmail: inc.contactEmail,
            contactPhone: inc.contactPhone,
            description: inc.description,
            focus: (inc.focus || []).map((f: string) => ({ value: f })),
            socialLinks: inc.socialLinks || emptyProfile.socialLinks,
            metrics: inc.metrics || emptyProfile.metrics,
            partners: (inc.partners || []).map((p: string) => ({ value: p })),
            startups: inc.startups || [],
        });
        setActiveTab("profile");
    };

    const handleDeleteIncubator = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/incubators/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                toast({ title: 'Profile Deleted', description: 'Incubator profile has been deleted.' });
                await fetchMyIncubators();
            } else {
                toast({ variant: 'destructive', title: 'Delete Failed', description: 'Could not delete profile.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'A network error occurred.' });
        }
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
        setIsSubmitting(true);
        try {
            const { name } = data;

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
                setUser(prev => prev ? { ...prev, name } : null);

                toast({
                    title: "Settings Saved",
                    description: "Your profile has been updated successfully."
                });
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update profile'
            });
        } finally {
            setIsSubmitting(false);
        }
    }


    const overviewStats = {
        new: submissions.filter(s => s.status === 'SUBMITTED').length,
        review: submissions.filter(s => s.status === 'UNDER_REVIEW').length,
        valid: submissions.filter(s => s.status === 'ACCEPTED').length,
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-7xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-3xl font-bold font-headline">Incubator Dashboard</DialogTitle>
                        <DialogDescription>Welcome, {user.name}. Manage your public profile, review startup submissions, and configure your settings.</DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow flex flex-col min-h-0 p-6 pt-0">
                        <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as IncubatorDashboardTab)} className="flex flex-col flex-grow min-h-0">
                            <TabsList className="grid w-full grid-cols-4">
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
                                <TabsContent value="submissions" className="mt-5 space-y-8 mr-4">
                                    <section>
                                        <div className="flex justify-between items-center mb-5">
                                            <h3 className="text-xl font-bold font-headline">My Incubator Profiles</h3>
                                            {myIncubators.length === 0 && (
                                                <Button size="sm" onClick={() => { setEditingIncubatorId(null); profileForm.reset(emptyProfile); setActiveTab("profile"); }}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Profile
                                                </Button>
                                            )}
                                        </div>

                                        {isFetchingMyIncubators ? (
                                            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                                        ) : myIncubators.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {myIncubators.map((inc) => (
                                                    <Card key={inc.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors relative group">
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEditIncubator(inc)}>
                                                                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteIncubator(inc.id)}>
                                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                        <CardHeader onClick={() => setSelectedMyIncubator(inc)} className="cursor-pointer pb-2">
                                                            <CardTitle className="text-lg pr-8 truncate">{inc.name}</CardTitle>
                                                            <CardDescription className="flex items-center gap-1">
                                                                <span className="truncate font-medium font-sans">{inc.location}</span>
                                                            </CardDescription>
                                                        </CardHeader>
                                                        <CardContent onClick={() => setSelectedMyIncubator(inc)} className="cursor-pointer space-y-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {(inc.type || []).map((t: string, index: number) => (
                                                                    <span key={`${t}-${index}`} className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-medium uppercase tracking-wider">{t}</span>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{inc.description}</p>
                                                            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-2 border-t border-border/30">
                                                                <span>{inc.metrics?.startupsSupported || 0} Startups</span>
                                                                <span>{inc.rating || 0} ⭐</span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="text-center text-muted-foreground py-12 border-dashed">
                                                <CardContent>
                                                    <div className="flex flex-col items-center gap-2">
                                                        <User className="h-8 w-8 opacity-20" />
                                                        <p>You have not created any incubator profiles yet.</p>
                                                        <Button variant="link" size="sm" onClick={() => setActiveTab("profile")}>Create your first profile</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </section>

                                    <Separator className="opacity-50" />

                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold font-headline">Incoming Submissions</h3>
                                            <Button variant="outline" size="sm" onClick={fetchSubmissions}>
                                                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
                                            </Button>
                                        </div>
                                        {submissions.length > 0 ? (
                                            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2">
                                                {submissions.map((sub) => (
                                                    <Card key={sub.id} className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                                                        <CardHeader>
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <CardTitle className="text-lg">{sub.startup_name}</CardTitle>
                                                                    <CardDescription>Submitted by {sub.founder_name}</CardDescription>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                                                                    <span className="text-primary">{sub.status}</span>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm text-muted-foreground line-clamp-3">{sub.description}</p>
                                                            <div className="mt-3">
                                                                <span className="px-2 py-1 bg-secondary rounded-md text-xs font-medium text-secondary-foreground">
                                                                    Industry: {sub.industry_sector}
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                        <CardFooter className="flex justify-between items-center">
                                                            <p className="text-sm text-muted-foreground">Submitted on {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                                        </CardFooter>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <Card className="text-center text-muted-foreground py-16">
                                                <CardContent>You have not received any submissions yet.</CardContent>
                                            </Card>
                                        )}
                                    </section>
                                </TabsContent>
                                <TabsContent value="profile" className="mt-0 mr-4">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>{editingIncubatorId ? "Edit Incubator Profile" : "Create Incubator Profile"}</CardTitle>
                                            <CardDescription className="font-sans font-medium">This information will be publicly visible. Fill it out to attract founders.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {myIncubators.length > 0 && !editingIncubatorId ? (
                                                <div className="text-center py-12 h-[45vh] flex justify-center items-center flex-col">
                                                    <p className="text-muted-foreground mb-6">You have already created an incubator profile. You can only maintain one profile.</p>
                                                    <Button onClick={() => handleEditIncubator(myIncubators[0])}>
                                                        Edit Existing Profile
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Form {...profileForm}>
                                                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                                                        <FormField control={profileForm.control} name="name" render={({ field }) => (
                                                            <FormItem><FormLabel>Incubator Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Nexus Hub" {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <FormField control={profileForm.control} name="type" render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Type <span className="text-destructive">*</span></FormLabel>
                                                                    <FormControl>
                                                                        <div className="flex gap-4">
                                                                            {["Incubator", "Accelerator"].map((t) => (
                                                                                <label key={t} className="flex items-center gap-2 cursor-pointer">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                                                                        checked={Array.isArray(field.value) && field.value.includes(t)}
                                                                                        onChange={(e) => {
                                                                                            const currentValues = Array.isArray(field.value) ? field.value : [];
                                                                                            const newValue = e.target.checked
                                                                                                ? [...currentValues, t]
                                                                                                : currentValues.filter((v: string) => v !== t);
                                                                                            field.onChange(newValue);
                                                                                        }}
                                                                                    />
                                                                                    <span className="text-sm">{t}</span>
                                                                                </label>
                                                                            ))}
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name="location" render={({ field }) => (
                                                                <FormItem><FormLabel>Location <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Bangalore, India" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <FormField control={profileForm.control} name="contactEmail" render={({ field }) => (
                                                                <FormItem><FormLabel>Contact Email <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="outreach@incubator.com" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name="contactPhone" render={({ field }) => (
                                                                <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+91 9123456789" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>

                                                        <FormField control={profileForm.control} name="description" render={({ field }) => (
                                                            <FormItem><FormLabel>Public Description <span className="text-destructive">*</span></FormLabel><FormControl><Textarea rows={4} placeholder="Describe your incubator's mission and mandate." {...field} /></FormControl><FormMessage /></FormItem>
                                                        )} />

                                                        <div>
                                                            <h3 className="text-lg font-medium mb-3">Focus Areas <span className="text-red-500">*</span></h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                                {focusFields.map((field, index) => (
                                                                    <div key={field.id} className="flex items-center gap-2">
                                                                        <FormField control={profileForm.control} name={`focus.${index}.value`} render={({ field }) => (
                                                                            <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., SaaS" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )} />
                                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeFocus(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendFocus({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Focus Area</Button>
                                                        </div>

                                                        <Separator />
                                                        <h3 className="text-lg font-medium">Startups Supported Detailed <span className="text-destructive">*</span></h3>
                                                        {profileForm.formState.errors.startups?.message && typeof profileForm.formState.errors.startups.message === 'string' && (
                                                            <p className="text-sm font-medium text-destructive mb-2">{profileForm.formState.errors.startups.message}</p>
                                                        )}
                                                        {profileForm.formState.errors.startups?.root?.message && typeof profileForm.formState.errors.startups.root.message === 'string' && (
                                                            <p className="text-sm font-medium text-destructive mb-2">{profileForm.formState.errors.startups.root.message}</p>
                                                        )}
                                                        <div className="space-y-4">
                                                            {startupFields.map((field, index) => (
                                                                <Card key={field.id} className="p-4 relative">
                                                                    <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeStartup(index)}>
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <FormField control={profileForm.control} name={`startups.${index}.name`} render={({ field }) => (
                                                                            <FormItem><FormLabel>Startup Name <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., AgriAI" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )} />
                                                                        <FormField control={profileForm.control} name={`startups.${index}.city`} render={({ field }) => (
                                                                            <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="e.g., Coimbatore" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )} />
                                                                        <FormField control={profileForm.control} name={`startups.${index}.founded_year`} render={({ field }) => (
                                                                            <FormItem><FormLabel>Founded Year</FormLabel><FormControl><Input placeholder="e.g., 2022" {...field} /></FormControl><FormMessage /></FormItem>
                                                                        )} />

                                                                        <FormField control={profileForm.control} name={`startups.${index}.sector`} render={({ field }) => {
                                                                            const currentSectors = field.value || [];
                                                                            return (
                                                                                <FormItem className="flex flex-col">
                                                                                    <FormLabel>Sectors <span className="text-destructive">*</span></FormLabel>
                                                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                                                        {currentSectors.map((s: string, i: number) => (
                                                                                            <Badge key={i} variant="secondary">
                                                                                                {s}
                                                                                                <button type="button" onClick={() => field.onChange(currentSectors.filter((x: string) => x !== s))}><X className="h-3 w-3 ml-1" /></button>
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                    <div className="flex gap-2">
                                                                                        <div className="w-full">
                                                                                            <DropdownMenu>
                                                                                                <DropdownMenuTrigger asChild>
                                                                                                    <Button variant="outline" className="w-full justify-between font-normal">
                                                                                                        <span>Select sectors...</span>
                                                                                                    </Button>
                                                                                                </DropdownMenuTrigger>
                                                                                                <DropdownMenuContent className="w-[200px] max-h-[300px] overflow-y-auto">
                                                                                                    {sectorsList.map(s => {
                                                                                                        const isSelected = currentSectors.includes(s);
                                                                                                        return (
                                                                                                            <DropdownMenuCheckboxItem
                                                                                                                key={s}
                                                                                                                checked={isSelected}
                                                                                                                onCheckedChange={(checked) => {
                                                                                                                    if (checked) {
                                                                                                                        field.onChange([...currentSectors, s]);
                                                                                                                    } else {
                                                                                                                        field.onChange(currentSectors.filter((x: string) => x !== s));
                                                                                                                    }
                                                                                                                }}
                                                                                                                onSelect={(e) => e.preventDefault()}
                                                                                                            >
                                                                                                                {s}
                                                                                                            </DropdownMenuCheckboxItem>
                                                                                                        );
                                                                                                    })}
                                                                                                </DropdownMenuContent>
                                                                                            </DropdownMenu>
                                                                                        </div>
                                                                                        <div className="flex w-full gap-1">
                                                                                            <Input placeholder="Other sector" onKeyDown={(e) => {
                                                                                                if (e.key === 'Enter') {
                                                                                                    e.preventDefault();
                                                                                                    const val = e.currentTarget.value.trim();
                                                                                                    if (val && !currentSectors.includes(val)) {
                                                                                                        field.onChange([...currentSectors, val]);
                                                                                                        e.currentTarget.value = '';
                                                                                                    }
                                                                                                }
                                                                                            }} />
                                                                                            <Button type="button" variant="outline" onClick={(e) => {
                                                                                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                                                                const val = input.value.trim();
                                                                                                if (val && !currentSectors.includes(val)) {
                                                                                                    field.onChange([...currentSectors, val]);
                                                                                                    input.value = '';
                                                                                                }
                                                                                            }}>Add</Button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <FormMessage />
                                                                                </FormItem>
                                                                            )
                                                                        }} />

                                                                        <FormField control={profileForm.control} name={`startups.${index}.is_funded`} render={({ field }) => (
                                                                            <FormItem className="flex flex-row items-center gap-2 space-y-0 mt-4 md:mt-8">
                                                                                <FormControl>
                                                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal cursor-pointer">Startup is Funded?</FormLabel>
                                                                            </FormItem>
                                                                        )} />

                                                                        {profileForm.watch(`startups.${index}.is_funded`) && (
                                                                            <FormField control={profileForm.control} name={`startups.${index}.funding_raised`} render={({ field }) => (
                                                                                <FormItem><FormLabel>Funding Raised</FormLabel><FormControl><Input placeholder="e.g., 2000000" {...field} /></FormControl><FormMessage /></FormItem>
                                                                            )} />
                                                                        )}
                                                                    </div>
                                                                </Card>
                                                            ))}
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendStartup({ name: '', city: '', founded_year: '', sector: [], is_funded: false, funding_raised: '' })}>
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Startup
                                                        </Button>

                                                        <Separator />
                                                        <h3 className="text-lg font-medium">Metrics <span className="text-sm text-muted-foreground">(will be calculated automatically based on your startup data)</span></h3>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <FormField control={profileForm.control} name="metrics.startupsSupported" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-xs">Startups Supported</FormLabel><FormControl><Input readOnly className="bg-muted" placeholder="e.g., 201" {...field} value={metricsData.startupsSupported} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name="metrics.fundedStartupsPercent" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-xs">Funded Startups (%)</FormLabel><FormControl><Input readOnly className="bg-muted" placeholder="e.g., 40%" {...field} value={metricsData.fundedStartupsPercent} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name="metrics.startupsOutsideLocationPercent" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-xs">Startups Outside (%)</FormLabel><FormControl><Input readOnly className="bg-muted" placeholder="e.g., 41%" {...field} value={metricsData.startupsOutsideLocationPercent} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name="metrics.totalFundingRaised" render={({ field }) => (
                                                                <FormItem><FormLabel className="text-xs">Total Funding Raised</FormLabel><FormControl><Input readOnly className="bg-muted" placeholder="e.g., ₹4,854M" {...field} value={metricsData.totalFundingRaised} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </div>

                                                        <Separator />
                                                        <h3 className="text-lg font-medium">Public Links</h3>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <FormField control={profileForm.control} name="socialLinks.website" render={({ field }) => {
                                                                const baseUrl = "https://";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : (val.startsWith("http://") ? val.slice(7) : val);
                                                                return (
                                                                    <FormItem><FormLabel>Website URL <span className="text-destructive">*</span></FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="yourwebsite.com" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                            <FormField control={profileForm.control} name="socialLinks.linkedin" render={({ field }) => {
                                                                const baseUrl = "https://linkedin.com/in/";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                                                return (
                                                                    <FormItem><FormLabel>LinkedIn URL <span className="text-destructive">*</span></FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                            <FormField control={profileForm.control} name="socialLinks.twitter" render={({ field }) => {
                                                                const baseUrl = "https://x.com/";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                                                return (
                                                                    <FormItem><FormLabel>Twitter/X URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                            <FormField control={profileForm.control} name="socialLinks.facebook" render={({ field }) => {
                                                                const baseUrl = "https://facebook.com/";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                                                return (
                                                                    <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                            <FormField control={profileForm.control} name="socialLinks.instagram" render={({ field }) => {
                                                                const baseUrl = "https://instagram.com/";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                                                return (
                                                                    <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                            <FormField control={profileForm.control} name="socialLinks.youtube" render={({ field }) => {
                                                                const baseUrl = "https://youtube.com/@";
                                                                const val = field.value || "";
                                                                const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                                                return (
                                                                    <FormItem><FormLabel>YouTube URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="channel" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                                                );
                                                            }} />
                                                        </div>

                                                        <Separator />
                                                        <h3 className="text-lg font-medium mb-3">Recognised and Funded by <span className="text-destructive">*</span></h3>
                                                        {profileForm.formState.errors.partners?.message && typeof profileForm.formState.errors.partners.message === 'string' && (
                                                            <p className="text-sm font-medium text-destructive mb-2">{profileForm.formState.errors.partners.message}</p>
                                                        )}
                                                        {profileForm.formState.errors.partners?.root?.message && typeof profileForm.formState.errors.partners.root.message === 'string' && (
                                                            <p className="text-sm font-medium text-destructive mb-2">{profileForm.formState.errors.partners.root.message}</p>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                                            {partnerFields.map((field, index) => (
                                                                <div key={field.id} className="flex items-center gap-2">
                                                                    <FormField control={profileForm.control} name={`partners.${index}.value`} render={({ field }) => (
                                                                        <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., MeitY" {...field} /></FormControl><FormMessage /></FormItem>
                                                                    )} />
                                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removePartner(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendPartner({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Agency</Button>


                                                        {/* Unnecessary fields commented out per user request
                                                    <Separator />
                                                    <h3 className="text-lg font-medium">Program Details</h3>
                                                    <FormField control={profileForm.control} name="details.overview" render={({ field }) => (
                                                        <FormItem><FormLabel>Program Overview <span className="text-destructive">*</span></FormLabel><FormControl><Textarea rows={5} placeholder="Describe your program in detail." {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />

                                                    <div>
                                                        <h3 className="text-lg font-medium mb-2">Services Offered</h3>
                                                        {services.map((service, index) => (
                                                            <Card key={service.id} className="mb-4 p-4 space-y-2">
                                                                <div className="flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => removeService(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                                                                <FormField control={profileForm.control} name={`details.services.${index}.title`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Service Title <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Mentorship" {...field} /></FormControl><FormMessage /></FormItem>
                                                                )} />
                                                                <FormField control={profileForm.control} name={`details.services.${index}.description`} render={({ field }) => (
                                                                    <FormItem><FormLabel>Service Description <span className="text-destructive">*</span></FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                                                                )} />
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
                                                                )} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeBenefit(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => appendBenefit({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Benefit</Button>
                                                    </div>

                                                    <Separator />
                                                    <h3 className="text-lg font-medium mb-2">Eligibility</h3>
                                                    <FormField control={profileForm.control} name="details.eligibility.focusAreas" render={({ field }) => (
                                                        <FormItem><FormLabel>Focus Areas (Detailed) <span className="text-destructive">*</span></FormLabel><FormControl><Textarea placeholder="Describe your focus areas in detail." {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <div>
                                                        <h4 className="text-md font-medium my-2">Key Requirements</h4>
                                                        {requirementFields.map((field, index) => (
                                                            <div key={field.id} className="flex items-center gap-2 mb-2">
                                                                <FormField control={profileForm.control} name={`details.eligibility.requirements.${index}.value`} render={({ field }) => (
                                                                    <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., MVP required" {...field} /></FormControl><FormMessage /></FormItem>
                                                                )} />
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeRequirement(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                            </div>
                                                        ))}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => appendRequirement({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Requirement</Button>
                                                    </div>

                                                    <Separator />
                                                    <h3 className="text-lg font-medium mb-2">Timeline</h3>
                                                    {timelineFields.map((field, index) => (
                                                        <Card key={field.id} className="mb-4 p-4 space-y-2">
                                                            <div className="flex justify-end"><Button type="button" variant="ghost" size="icon" onClick={() => removeTimeline(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                                                            <FormField control={profileForm.control} name={`details.timeline.${index}.event`} render={({ field }) => (
                                                                <FormItem><FormLabel>Event <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Application Period" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                            <FormField control={profileForm.control} name={`details.timeline.${index}.period`} render={({ field }) => (
                                                                <FormItem><FormLabel>Period <span className="text-destructive">*</span></FormLabel><FormControl><Input placeholder="e.g., Jan - Mar" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        </Card>
                                                    ))}
                                                    <Button type="button" variant="outline" size="sm" onClick={() => appendTimeline({ event: '', period: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Timeline Event</Button>
                                                    */}

                                                        <Button type="submit" className="w-full mt-4" disabled={profileForm.formState.isSubmitting}>
                                                            {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                            {editingIncubatorId ? "Update Public Profile" : "Save Public Profile"}
                                                        </Button>
                                                    </form>
                                                </Form>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="settings" className="mt-0">
                                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                                        <CardHeader>
                                            <CardTitle>Account Settings</CardTitle>
                                            <CardDescription>Manage your account settings.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-8">
                                            <Form {...settingsForm}>
                                                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-4">
                                                    <div>
                                                        <h3 className="text-lg font-medium mb-4">Profile</h3>
                                                        <div className="space-y-4">
                                                            <FormField control={settingsForm.control} name="name" render={({ field }) => (
                                                                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
                                                            )} />

                                                        </div>
                                                    </div>
                                                    <Button type="submit" disabled={isSubmitting}>Save Changes</Button>
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
                                                        {/* Payment Category - Always visible */}
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

                                                        {/* Payment Method Selection - Always visible */}
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

                                                        {/* PayPal Fields */}
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

                                                        {/* Bank Account Fields */}
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

                                                        {/* UPI Fields */}
                                                        {paymentForm.watch("paymentMethod") === "upi" && (
                                                            <FormField control={paymentForm.control} name="upiId" render={({ field }) => (
                                                                <FormItem><FormLabel>UPI ID</FormLabel><FormControl><Input placeholder="yourname@okbank" {...field} disabled={!isEditingPayment} /></FormControl><FormMessage /></FormItem>
                                                            )} />
                                                        )}

                                                        {/* Action Buttons */}
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
            <Dialog open={!!selectedMyIncubator} onOpenChange={(open) => !open && setSelectedMyIncubator(null)}>
                <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedMyIncubator && (
                        <>
                            <DialogHeader>
                                <div className="flex justify-between items-start pr-8">
                                    <div className="flex gap-4 items-start">
                                        {selectedMyIncubator.image && (
                                            <img src={selectedMyIncubator.image} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border/50" />
                                        )}
                                        <div>
                                            <DialogTitle className="text-2xl font-bold font-headline">
                                                {selectedMyIncubator.name}
                                            </DialogTitle>
                                            <DialogDescription className="mt-1 flex items-center flex-wrap gap-2 text-sm">
                                                <span>{selectedMyIncubator.location}</span>
                                                {(selectedMyIncubator.type || []).length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{(selectedMyIncubator.type || []).join(", ")}</span>
                                                    </>
                                                )}
                                                {selectedMyIncubator.rating !== undefined && selectedMyIncubator.rating !== null && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1 font-medium text-amber-500">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            {selectedMyIncubator.rating}

                                                        </span>
                                                    </>
                                                )}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="space-y-6 py-4">
                                <div>
                                    <h4 className="text-sm font-semibold mb-1">Description</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{selectedMyIncubator.description}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Contact Email</h4>
                                        <p className="text-sm text-primary">{selectedMyIncubator.contactEmail || "N/A"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-semibold">Contact Phone</h4>
                                        <p className="text-sm">{selectedMyIncubator.contactPhone || "N/A"}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-3">Metrics Overview</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-card border border-border/50 p-3 rounded-xl text-center shadow-sm">
                                            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-1">Supported</span>
                                            <span className="text-lg font-bold">{selectedMyIncubator.metrics?.startupsSupported || "0"}</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-3 rounded-xl text-center shadow-sm">
                                            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-1">Funded</span>
                                            <span className="text-lg font-bold">{selectedMyIncubator.metrics?.fundedStartupsPercent || "0%"}</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-3 rounded-xl text-center shadow-sm">
                                            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-1">Outside Loc.</span>
                                            <span className="text-lg font-bold">{selectedMyIncubator.metrics?.startupsOutsideLocationPercent || "0%"}</span>
                                        </div>
                                        <div className="bg-card border border-border/50 p-3 rounded-xl text-center shadow-sm">
                                            <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-1">Funding</span>
                                            <span className="text-lg font-bold">{selectedMyIncubator.metrics?.totalFundingRaised || "0"}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedMyIncubator.focus?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Focus Areas</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMyIncubator.focus.map((f: string, index: number) => (
                                                <span key={`${f}-${index}`} className="px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary rounded-lg text-xs font-medium">{f}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedMyIncubator.socialLinks && Object.values(selectedMyIncubator.socialLinks).some(v => v) && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Social Links & Website</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedMyIncubator.socialLinks.website && (
                                                <a href={selectedMyIncubator.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1.5 bg-primary/10 px-2 py-1.5 rounded-md"><FaGlobe className="w-3.5 h-3.5" /> Website</a>
                                            )}
                                            {selectedMyIncubator.socialLinks.linkedin && (
                                                <a href={selectedMyIncubator.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-[#0077b5] hover:text-[#0077b5]/80 flex items-center gap-1.5 bg-[#0077b5]/10 px-2 py-1.5 rounded-md"><FaLinkedin className="w-3.5 h-3.5" /> LinkedIn</a>
                                            )}
                                            {selectedMyIncubator.socialLinks.twitter && (
                                                <a href={selectedMyIncubator.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1DA1F2] hover:text-[#1DA1F2]/80 flex items-center gap-1.5 bg-[#1DA1F2]/10 px-2 py-1.5 rounded-md"><FaTwitter className="w-3.5 h-3.5" /> Twitter</a>
                                            )}
                                            {selectedMyIncubator.socialLinks.instagram && (
                                                <a href={selectedMyIncubator.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E1306C] hover:text-[#E1306C]/80 flex items-center gap-1.5 bg-[#E1306C]/10 px-2 py-1.5 rounded-md"><FaInstagram className="w-3.5 h-3.5" /> Instagram</a>
                                            )}
                                            {selectedMyIncubator.socialLinks.youtube && (
                                                <a href={selectedMyIncubator.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-xs text-[#FF0000] hover:text-[#FF0000]/80 flex items-center gap-1.5 bg-[#FF0000]/10 px-2 py-1.5 rounded-md"><FaYoutube className="w-3.5 h-3.5" /> YouTube</a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedMyIncubator.partners?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-2">Recognised and Funded by</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedMyIncubator.partners.map((p: string, index: number) => (
                                                <span key={`${p}-${index}`} className="px-2.5 py-1 bg-muted border border-border text-muted-foreground rounded-lg text-xs font-medium">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedMyIncubator.startups?.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold mb-3 mt-4">Startups Supported Detailed</h4>
                                        <div className="rounded-md border overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-muted text-muted-foreground text-xs uppercase">
                                                        <tr>
                                                            <th className="px-4 py-3 font-medium">Startup Name</th>
                                                            <th className="px-4 py-3 font-medium">City</th>
                                                            <th className="px-4 py-3 font-medium">Founded Year</th>
                                                            <th className="px-4 py-3 font-medium">Sectors</th>
                                                            <th className="px-4 py-3 font-medium">Funded?</th>
                                                            <th className="px-4 py-3 font-medium">Funding Raised</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y">
                                                        {selectedMyIncubator.startups.map((startup: any, index: number) => (
                                                            <tr key={index} className="bg-card hover:bg-muted/50 transition-colors">
                                                                <td className="px-4 py-3 font-medium">{startup.name || "-"}</td>
                                                                <td className="px-4 py-3">{startup.city || "-"}</td>
                                                                <td className="px-4 py-3">{startup.founded_year || "-"}</td>
                                                                <td className="px-4 py-3 max-w-[200px] truncate" title={(startup.sector || []).join(", ")}>
                                                                    {(startup.sector || []).join(", ") || "-"}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {startup.is_funded ? (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Yes</span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">No</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-muted-foreground">
                                                                    {startup.funding_raised ? `₹${startup.funding_raised}` : "-"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-6 border-t border-border/50">
                                    <Button variant="outline" onClick={handleDownloadPDF}>
                                        <Download className="mr-2 h-4 w-4" /> Download PDF
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={() => setSelectedMyIncubator(null)}>Close</Button>
                                        <Button onClick={() => { handleEditIncubator(selectedMyIncubator); setSelectedMyIncubator(null); }}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
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

