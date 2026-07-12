"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, PlusCircle, Trash2, UploadCloud, MapPin } from "lucide-react";
import { getAllStates, getDistricts } from "india-state-district";
import Image from "next/image";
import { FaGlobe, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaFacebook } from 'react-icons/fa';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { VanityUrlInput } from "@/components/ui/vanity-url-input";
import { API_BASE_URL } from "@/lib/api";

const profileFormSchema = z.object({
    name: z.string().min(1, "Incubator name is required"),
    contactEmail: z.string().email("Invalid email address"),
    contactPhone: z.string().optional(),
    description: z.string().min(1, "Description is required").max(5000, "Max 5000 characters"),
    notification_email: z.string().email("Invalid email address").min(1, "Notification email is required to alert them"),
    focus: z.array(z.object({ value: z.string().min(1, "Focus area cannot be empty") })).min(1, "Required"),
    socialLinks: z.object({
        website: z.string().url().optional().or(z.literal("")),
        linkedin: z.string().url().optional().or(z.literal("")),
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
    partners: z.array(z.object({ value: z.string().min(1, "Partner cannot be empty") })),
    type: z.array(z.string()).optional(),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    image: z.string().optional(),
    startups: z.array(z.object({
        name: z.string().min(1, "Startup name is required"),
        state: z.string().min(1, "State is required"),
        city: z.string().min(1, "City is required"),
        founded_year: z.coerce.string().min(1, "Founded year is required"),
        sector: z.array(z.string()).min(1, "At least one sector is required"),
        is_funded: z.boolean().default(false),
        funding_raised: z.coerce.string().optional()
    })).default([]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function AdminIncubatorsView() {
    const { toast } = useToast();
    const [incubators, setIncubators] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [selectedIncubator, setSelectedIncubator] = useState<any | null>(null);
    const [selectedStartupId, setSelectedStartupId] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDraggingLogo, setIsDraggingLogo] = useState(false);
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

    const handleViewDetails = (inc: any) => {
        setSelectedIncubator(inc);
    };

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: "",
            contactEmail: "",
            contactPhone: "",
            description: "",
            notification_email: "",
            focus: [],
            socialLinks: { website: "", linkedin: "", twitter: "", facebook: "", instagram: "", youtube: "" },
            metrics: { startupsSupported: "", fundedStartupsPercent: "", startupsOutsideLocationPercent: "", totalFundingRaised: "" },
            partners: [],
            type: ["Incubator"],
            state: "",
            city: "",
            image: "",
            startups: [],
        },
    });

    const { fields: focusFields, append: appendFocus, remove: removeFocus } = useFieldArray({
        name: "focus",
        control: form.control,
    });

    const { fields: partnerFields, append: appendPartner, remove: removePartner } = useFieldArray({
        name: "partners",
        control: form.control,
    });

    const { fields: startupFields, append: appendStartup, remove: removeStartup } = useFieldArray({
        name: "startups",
        control: form.control,
    });

    const watchedState = form.watch("state") || "";

    const indianStates = getAllStates();
    const selectedStateCode = indianStates.find(state => state.name === watchedState)?.code || "";
    const availableDistricts = selectedStateCode ? getDistricts(selectedStateCode) : [];

    const fetchIncubators = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/incubators`);
            const data = await res.json();
            if (res.ok) setIncubators(data.items || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchIncubators();
    }, []);

    const onSubmit = async (data: ProfileFormValues) => {
        if (!logoFile && !data.image) {
            toast({ variant: "destructive", title: "Error", description: "Incubator logo is required." });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                ...data,
                focus: data.focus.map(f => f.value),
                partners: data.partners.map(p => p.value),
                type: data.type && data.type.length > 0 ? data.type : ["Incubator"],
                startups: data.startups || [],
            };

            const formData = new FormData();
            formData.append('data', JSON.stringify(payload));
            if (logoFile) {
                formData.append('image', logoFile);
            }

            const res = await fetch(`${API_BASE_URL}/api/incubators`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const result = await res.json();
            if (res.ok) {
                toast({ title: "Success", description: "Incubator profile created & notified!" });
                setIsOpen(false);
                await fetchIncubators();
                form.reset();
            } else {
                toast({ variant: "destructive", title: "Error", description: result.error || "Failed to create" });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Network Error", description: "Failed to create profile" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/incubators/${itemToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                toast({ title: "Deleted", description: "Incubator profile removed." });
                fetchIncubators();
            } else {
                toast({ variant: "destructive", title: "Error", description: "Could not delete profile" });
            }
        } catch (e) {
            toast({ variant: "destructive", title: "Network Error", description: "Could not delete profile" });
        } finally {
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card p-6 rounded-lg border border-border shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold">Incubator Profiles</h2>
                    <p className="text-muted-foreground">Manage and create Incubator profiles on the platform.</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] flex flex-col p-6 rounded-lg">
                        <DialogHeader className="shrink-0 mb-4">
                            <DialogTitle>Create Incubator Profile</DialogTitle>
                            <DialogDescription>
                                Add a new incubator. They will automatically receive a notification email.
                            </DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="flex-1 px-2">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-2">
                                    <FormField control={form.control} name="notification_email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-primary font-bold">Notification Email Address *</FormLabel>
                                            <FormControl><Input placeholder="Email to notify..." type="email" {...field} className="border-primary/50" /></FormControl>
                                            <p className="text-xs text-muted-foreground">This email will receive the &quot;Profile Created&quot; notification.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Separator className="my-6" />

                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Incubator Name</FormLabel><FormControl><Input placeholder="e.g., Nexus Hub" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div>
                                        <FormLabel className={!logoFile && !form.getValues('image') ? "text-destructive" : ""}>Incubator Logo *</FormLabel>
                                        <div
                                            className={`mt-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDraggingLogo ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                                            onDragOver={(e) => { e.preventDefault(); setIsDraggingLogo(true); }}
                                            onDragLeave={() => setIsDraggingLogo(false)}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                setIsDraggingLogo(false);
                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                    const file = e.dataTransfer.files[0];
                                                    setLogoFile(file);
                                                    setLogoPreview(URL.createObjectURL(file));
                                                    form.setValue('image', file.name);
                                                    form.clearErrors('image');
                                                }
                                            }}
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                        >
                                            {logoPreview ? (
                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden shadow-sm">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <span className="text-white text-xs font-medium">Change Logo</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-medium">Click or drag logo here</p>
                                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                                                </div>
                                            )}
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        setLogoFile(file);
                                                        setLogoPreview(URL.createObjectURL(file));
                                                        form.setValue('image', file.name);
                                                        form.clearErrors('image');
                                                    }
                                                }}
                                            />
                                        </div>
                                        {!logoFile && !form.getValues('image') && <p className="text-[0.8rem] font-medium text-destructive mt-1">Incubator logo is required.</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField control={form.control} name="type" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
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
                                        <FormField control={form.control} name="state" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {indianStates.map((state) => (
                                                            <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="city" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!watchedState}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={watchedState ? "Select City" : "Select State First"} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableDistricts.map((district) => (
                                                            <SelectItem key={district} value={district}>{district}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="contactEmail" render={({ field }) => (
                                            <FormItem><FormLabel>Contact Email</FormLabel><FormControl><Input placeholder="outreach@incubator.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="contactPhone" render={({ field }) => (
                                            <FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input placeholder="+91 9123456789" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Public Description</FormLabel><FormControl><Textarea rows={4} placeholder="Describe your incubator's mission and mandate." {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />

                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Focus Areas</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                            {focusFields.map((field, index) => (
                                                <div key={field.id} className="flex items-center gap-2">
                                                    <FormField control={form.control} name={`focus.${index}.value`} render={({ field }) => (
                                                        <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., SaaS" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFocus(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendFocus({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Focus Area</Button>
                                        {form.formState.errors.focus?.root && <p className="text-[0.8rem] font-medium text-destructive mt-1">{form.formState.errors.focus.root.message}</p>}
                                    </div>

                                    <Separator />
                                    <h3 className="text-lg font-medium">Metrics</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <FormField control={form.control} name="metrics.startupsSupported" render={({ field }) => (
                                            <FormItem><FormLabel className="text-xs">Startups Supported</FormLabel><FormControl><Input placeholder="e.g., 201" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="metrics.fundedStartupsPercent" render={({ field }) => (
                                            <FormItem><FormLabel className="text-xs">Funded Startups (%)</FormLabel><FormControl><Input placeholder="e.g., 40%" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="metrics.startupsOutsideLocationPercent" render={({ field }) => (
                                            <FormItem><FormLabel className="text-xs">Startups Outside (%)</FormLabel><FormControl><Input placeholder="e.g., 41%" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                        <FormField control={form.control} name="metrics.totalFundingRaised" render={({ field }) => (
                                            <FormItem><FormLabel className="text-xs">Total Funding Raised</FormLabel><FormControl><Input placeholder="e.g., ₹4,854M" {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>

                                    <Separator />
                                    <h3 className="text-lg font-medium">Public Links</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="socialLinks.website" render={({ field }) => {
                                            const baseUrl = "https://";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : (val.startsWith("http://") ? val.slice(7) : val);
                                            return (
                                                <FormItem><FormLabel>Website URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="yourwebsite.com" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                        <FormField control={form.control} name="socialLinks.linkedin" render={({ field }) => {
                                            const baseUrl = "https://linkedin.com/in/";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                            return (
                                                <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                        <FormField control={form.control} name="socialLinks.twitter" render={({ field }) => {
                                            const baseUrl = "https://x.com/";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                            return (
                                                <FormItem><FormLabel>Twitter/X URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                        <FormField control={form.control} name="socialLinks.facebook" render={({ field }) => {
                                            const baseUrl = "https://facebook.com/";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                            return (
                                                <FormItem><FormLabel>Facebook URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                        <FormField control={form.control} name="socialLinks.instagram" render={({ field }) => {
                                            const baseUrl = "https://instagram.com/";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                            return (
                                                <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="username" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                        <FormField control={form.control} name="socialLinks.youtube" render={({ field }) => {
                                            const baseUrl = "https://youtube.com/@";
                                            const val = field.value || "";
                                            const displayValue = val.startsWith(baseUrl) ? val.slice(baseUrl.length) : val;
                                            return (
                                                <FormItem><FormLabel>YouTube URL</FormLabel><FormControl><VanityUrlInput baseUrl={baseUrl} placeholder="channel" value={displayValue} onChange={(v) => field.onChange(v ? baseUrl + v : "")} /></FormControl><FormMessage /></FormItem>
                                            );
                                        }} />
                                    </div>

                                    <Separator />
                                    <h3 className="text-lg font-medium mb-3">Recognised and Funded by</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                        {partnerFields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <FormField control={form.control} name={`partners.${index}.value`} render={({ field }) => (
                                                    <FormItem className="flex-grow"><FormControl><Input placeholder="e.g., MeitY" {...field} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removePartner(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendPartner({ value: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Agency</Button>

                                    <Separator />
                                    <h3 className="text-lg font-medium mb-3">Startups Supported (Optional)</h3>
                                    <div className="space-y-6">
                                        {startupFields.map((field, index) => (
                                            <Card key={field.id} className="p-4 border border-border shadow-sm">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-semibold text-sm">Startup #{index + 1}</h4>
                                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeStartup(index)} className="text-destructive h-8 px-2">
                                                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FormField control={form.control} name={`startups.${index}.name`} render={({ field }) => (
                                                        <FormItem><FormLabel>Startup Name *</FormLabel><FormControl><Input placeholder="e.g., TechFlow" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`startups.${index}.founded_year`} render={({ field }) => (
                                                        <FormItem><FormLabel>Founded Year *</FormLabel><FormControl><Input placeholder="e.g., 2022" type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`startups.${index}.sector`} render={({ field }) => (
                                                        <FormItem className="col-span-1 lg:col-span-2">
                                                            <FormLabel>Sectors *</FormLabel>
                                                            <FormControl>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {sectorsList.length > 0 ? sectorsList.map((sector) => (
                                                                        <label key={sector} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                                                            <input
                                                                                type="checkbox"
                                                                                className="rounded border-gray-300 text-primary focus:ring-primary w-3.5 h-3.5"
                                                                                checked={Array.isArray(field.value) && field.value.includes(sector)}
                                                                                onChange={(e) => {
                                                                                    const currentValues = Array.isArray(field.value) ? field.value : [];
                                                                                    const newValue = e.target.checked
                                                                                        ? [...currentValues, sector]
                                                                                        : currentValues.filter((v: string) => v !== sector);
                                                                                    field.onChange(newValue);
                                                                                }}
                                                                            />
                                                                            <span className="text-xs font-medium">{sector}</span>
                                                                        </label>
                                                                    )) : (
                                                                        <span className="text-xs text-muted-foreground">Loading sectors...</span>
                                                                    )}
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`startups.${index}.state`} render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>State *</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    {indianStates.map((state) => (
                                                                        <SelectItem key={state.code} value={state.name}>{state.name}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )} />
                                                    <FormField control={form.control} name={`startups.${index}.city`} render={({ field }) => {
                                                        const currentStartupState = form.watch(`startups.${index}.state`);
                                                        const sCode = indianStates.find(s => s.name === currentStartupState)?.code || "";
                                                        const sDistricts = sCode ? getDistricts(sCode) : [];
                                                        return (
                                                            <FormItem>
                                                                <FormLabel>City *</FormLabel>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!currentStartupState}>
                                                                    <FormControl><SelectTrigger><SelectValue placeholder={currentStartupState ? "Select City" : "Select State First"} /></SelectTrigger></FormControl>
                                                                    <SelectContent>
                                                                        {sDistricts.map((district) => (
                                                                            <SelectItem key={district} value={district}>{district}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )
                                                    }} />
                                                    <div className="flex flex-col gap-4 lg:col-span-3 md:col-span-2">
                                                        <FormField control={form.control} name={`startups.${index}.is_funded`} render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-muted/10">
                                                                <FormControl>
                                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                                </FormControl>
                                                                <div className="space-y-1 leading-none">
                                                                    <FormLabel>Startup is Funded</FormLabel>
                                                                    <p className="text-xs text-muted-foreground">Check if this startup has received external funding.</p>
                                                                </div>
                                                            </FormItem>
                                                        )} />
                                                        {form.watch(`startups.${index}.is_funded`) && (
                                                            <FormField control={form.control} name={`startups.${index}.funding_raised`} render={({ field }) => (
                                                                <FormItem className="w-full md:w-1/2">
                                                                    <FormLabel>Funding Raised</FormLabel>
                                                                    <FormControl><Input placeholder="e.g., 5000000" type="number" {...field} /></FormControl>
                                                                    <p className="text-xs text-muted-foreground">Amount in INR (e.g. 5000000 for 50 Lakhs).</p>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )} />
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                    <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => appendStartup({ name: '', state: '', city: '', founded_year: '', sector: [], is_funded: false, funding_raised: '' })}>
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Startup
                                    </Button>

                                    <Button type="submit" disabled={isSubmitting} className="w-full mt-4 h-12 text-lg">
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Submit Incubator & Send Notification"}
                                    </Button>
                                </form>
                            </Form>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="flex flex-col border border-border bg-card">
                            <CardHeader className="pb-3">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow">
                                <Skeleton className="h-16 w-full" />
                                <div className="space-y-2 pt-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-2/3" />
                                </div>
                            </CardContent>
                            <CardContent className="flex justify-end mt-auto border-t p-4 border-border/50">
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : incubators.length === 0 ? (
                <Card className="text-center p-12 border-dashed bg-card/50">
                    <CardHeader>
                        <CardTitle>No Incubators</CardTitle>
                        <CardDescription>Click the button above to create an incubator profile.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="flex flex-col gap-8 w-full">
                    {incubators.map((incubator) => (
                        <Card key={incubator._id || incubator.id} className="flex flex-col bg-card border-border/60 shadow-lg hover:shadow-xl transition-shadow w-full rounded-xl overflow-hidden relative">
                            <CardContent className="p-6 md:p-8 space-y-8">

                                {/* Header Section */}
                                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                                    <div className="flex gap-6 items-start">
                                        <div className="relative w-24 h-24 md:w-32 md:h-32 shrink-0 bg-white rounded-lg border flex items-center justify-center overflow-hidden p-2">
                                            {incubator.image ? (
                                                <Image
                                                    src={incubator.image || '/icons/corporate-incu.png'}
                                                    alt={incubator.name}
                                                    fill
                                                    className="object-contain p-2"
                                                />
                                            ) : (
                                                <span className="text-3xl font-black text-muted-foreground">{incubator.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <h3 className="text-2xl font-bold font-headline leading-tight">{incubator.name}</h3>
                                            <div className="flex flex-wrap items-center gap-3">
                                                {(incubator.type?.length > 0 ? incubator.type : ['Incubator']).map((type: string, idx: number) => (
                                                    <Badge key={idx} variant="secondary" className={`uppercase tracking-widest text-[10px] font-semibold border-none px-3 ${type.toLowerCase() === 'accelerator' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
                                                        {type}
                                                    </Badge>
                                                ))}
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{incubator.city}{incubator.city && incubator.state ? ", " : ""}{incubator.state}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground pt-1">
                                                {incubator.contactEmail && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="truncate max-w-[200px]">✉ {incubator.contactEmail}</span>
                                                    </div>
                                                )}
                                                {incubator.contactPhone && (
                                                    <div className="flex items-center gap-2">
                                                        <span>📞 {incubator.contactPhone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-4 w-full md:w-auto mt-4 md:mt-0">
                                        <div className="flex items-center gap-3 mt-auto">
                                            <Button variant="destructive" size="sm" onClick={() => { setItemToDelete(incubator._id || incubator.id); setDeleteDialogOpen(true); }}>
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete Profile
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Section */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border/50">
                                    <div className="text-center md:text-left space-y-1">
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-2xl font-bold">{incubator.metrics?.startupsSupported || "0"}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Key Startups Supported</p>
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-2xl font-bold">{incubator.metrics?.fundedStartupsPercent || "0%"}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Funded Startups</p>
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-2xl font-bold">{incubator.metrics?.startupsOutsideLocationPercent || "0%"}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Startups outside {incubator.city || 'Location'}</p>
                                    </div>
                                    <div className="text-center md:text-left space-y-1">
                                        <div className="flex items-baseline justify-center md:justify-start gap-1">
                                            <span className="text-2xl font-bold">{incubator.metrics?.totalFundingRaised || "₹0"}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total funding raised</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="text-sm text-foreground/90 leading-relaxed font-medium">
                                    {incubator.description}
                                </div>

                                {/* Public Links */}
                                {incubator.socialLinks && Object.values(incubator.socialLinks).some(Boolean) && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-foreground">Public Links</h4>
                                        <div className="flex flex-wrap gap-3">
                                            {incubator.socialLinks.website && (
                                                <a href={incubator.socialLinks.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                                                    <FaGlobe className="text-gray-500" /> Website
                                                </a>
                                            )}
                                            {incubator.socialLinks.linkedin && (
                                                <a href={incubator.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                                                    <FaLinkedin className="text-blue-600" /> LinkedIn
                                                </a>
                                            )}
                                            {incubator.socialLinks.facebook && (
                                                <a href={incubator.socialLinks.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                                                    <FaFacebook className="text-blue-500" /> Facebook
                                                </a>
                                            )}
                                            {incubator.socialLinks.instagram && (
                                                <a href={incubator.socialLinks.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                                                    <FaInstagram className="text-pink-600" /> Instagram
                                                </a>
                                            )}
                                            {incubator.socialLinks.youtube && (
                                                <a href={incubator.socialLinks.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-muted/50 hover:bg-muted border px-3 py-1.5 rounded-full text-xs font-semibold text-foreground/80 transition-colors">
                                                    <FaYoutube className="text-red-600" /> Youtube
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Prominent Startups Supported */}
                                {(incubator.startups && incubator.startups.length > 0) ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-foreground">Prominent Startups Supported</h4>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3 items-start">
                                            {incubator.startups.map((startup: any, idx: number) => {
                                                const sId = `${incubator._id || incubator.id}-startup-${idx}`;
                                                const isExpanded = selectedStartupId === sId;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`flex flex-col rounded-xl border bg-background/50 hover:bg-muted/50 transition-all duration-300 shadow-sm hover:shadow-md group overflow-hidden ${isExpanded ? 'col-span-1 sm:col-span-2 lg:col-span-3' : ''}`}
                                                    >
                                                        <div
                                                            onClick={() => setSelectedStartupId(isExpanded ? null : sId)}
                                                            className="flex items-center gap-3 p-3 cursor-pointer"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-110 transition-transform">
                                                                {startup.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col overflow-hidden text-left flex-grow">
                                                                <span className="text-sm font-bold truncate text-foreground/90 group-hover:text-primary transition-colors">{startup.name}</span>
                                                                <span className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
                                                                    {startup.city ? `${startup.city} • ` : ''}{(startup.sector || []).join(', ')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div className="p-4 pt-0 mt-2 border-t border-border/50 bg-muted/20 animate-in slide-in-from-top-2 fade-in-20">
                                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                                    <div className="space-y-1.5">
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Founded</span>
                                                                        <p className="text-sm font-bold text-foreground/90">{startup.founded_year || '-'}</p>
                                                                    </div>
                                                                    {
                                                                        startup.funding_raised ? (
                                                                            <div className="space-y-1.5 col-span-2 pt-2 mt-1 border-t border-border/50">
                                                                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Funding Raised</span>
                                                                                <p className="text-sm font-bold text-primary bg-primary/5 inline-block px-3 py-1 rounded-md border border-primary/10">₹
                                                                                    {startup.funding_raised.toLocaleString()}</p>
                                                                            </div>
                                                                        ) : null
                                                                    }
                                                                    <div className="space-y-1.5">
                                                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Funded</span>
                                                                        <div>
                                                                            {startup.is_funded ? (
                                                                                <Badge variant="secondary" className="bg-muted-foreground/15 text-foreground hover:bg-muted-foreground/25 border-none px-3 py-0.5 rounded-full font-bold">Yes</Badge>
                                                                            ) : (
                                                                                <Badge variant="secondary" className="bg-muted-foreground/10 text-muted-foreground border-none px-3 py-0.5 rounded-full font-bold hover:bg-muted-foreground/20">No</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {startup.sector && startup.sector.length > 0 && (
                                                                    <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                                                                        <h4 className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Sectors</h4>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {startup.sector.map((sec: string, i: number) => (
                                                                                <Badge key={i} variant="outline" className="bg-background rounded-full px-3 py-0.5 text-[10px] border-border/60 shadow-sm">{sec}</Badge>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Key Focus Areas */}
                                {incubator.focus && incubator.focus.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-foreground">Key Focus Areas of supported Startups</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {incubator.focus.map((area: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-muted text-foreground/80 font-medium px-4 py-1.5 border hover:bg-muted/80">
                                                    {area}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Institutions Financing */}
                                {incubator.partners && incubator.partners.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-foreground">Institutions Financing the supported Startups</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {incubator.partners.map((partner: string, idx: number) => (
                                                <Badge key={idx} variant="secondary" className="bg-muted flex items-center gap-2 px-3 py-1.5 border text-xs font-medium text-foreground/80">
                                                    <span className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[8px] font-bold">{partner.charAt(0)}</span>
                                                    {partner}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this incubator profile.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
