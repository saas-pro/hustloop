"use client";

import { useState, useId, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "../../hooks/use-toast";
import SolutionMarkdown from "../ui/SolutionMarkdown";
import { API_BASE_URL } from "@/lib/api";
import { FileText, Upload } from "lucide-react";

const solutionSubmissionSchema = z.object({
    description: z
        .string()
        .min(10, "Description must be at least 10 characters long.")
        .max(5000, "Description is too long."),
    contactName: z
        .string()
        .min(2, "Contact name must be at least 2 characters long.")
        .max(100, "Too long."),
    mobileNumber: z
        .string()
        .regex(/^[0-9]{10}$/, "Enter a valid 10-digit mobile number."),
    placeOfResidence: z
        .string()
        .min(3, "Place of residence must be at least 3 characters long.")
        .max(100, "Too long."),
    district: z
        .string()
        .min(2, "District name must be at least 2 characters long.")
        .max(50, "Too long."),
    files: z
        .array(z.instanceof(File))
        .min(1, "Please upload at least one PDF file.")
        .max(5, "You can upload up to 5 PDF files.")
        .refine((files) => files.every((file) => file.type === "application/pdf"), {
            message: "All files must be PDFs.",
        })
        .refine(
            (files) => files.every((file) => file.size <= 10 * 1024 * 1024),
            { message: "Each file must be under 10 MB." }
        ),
});

type SolutionSubmissionSchema = z.infer<typeof solutionSubmissionSchema>;

interface SolutionSubmissionFormProps {
    challengeId: number;
    onSubmissionSuccess: () => void;
    onCancel: () => void;
}

export function SolutionSubmissionForm({
    challengeId,
    onSubmissionSuccess,
    onCancel,
}: SolutionSubmissionFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const fileInputId = useId();
    const [defaultContactName, setDefaultContactName] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    
    const form = useForm<SolutionSubmissionSchema>({
        resolver: zodResolver(solutionSubmissionSchema),
        defaultValues: {
            contactName: defaultContactName,
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = form;

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setDefaultContactName(parsedUser.name);
            setValue("contactName", parsedUser.name);
        }
    }, [setValue]);





    const selectedFiles = watch("files") || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        if (newFiles.length === 0) return;

        const currentFiles = selectedFiles || [];
        const uniqueNewFiles = newFiles.filter(
            (newFile) => !currentFiles.some((f) => f.name === newFile.name)
        );

        const updatedFiles = [...currentFiles, ...uniqueNewFiles].slice(0, 5);
        setValue("files", updatedFiles, { shouldValidate: true });
        e.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setValue("files", updatedFiles, { shouldValidate: true });
    };

    const onSubmit = async (data: SolutionSubmissionSchema) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast({
                    variant: "destructive",
                    title: "You must be logged in to submit a solution.",
                });
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("description", data.description);
            formData.append("contactName", data.contactName);
            formData.append("mobileNumber", data.mobileNumber);
            formData.append("placeOfResidence", data.placeOfResidence);
            formData.append("district", data.district);

            if (data.files && data.files.length > 0) {
                data.files.forEach((file) => formData.append("files", file));
            }

            const response = await fetch(
                `${API_BASE_URL}/api/solutions/${challengeId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to submit solution");
            }

            const result = await response.json();


            toast({
                title: "Solution submitted successfully!",
                description: result.message || "Your solution was uploaded.",
            });

            onSubmissionSuccess();

        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Failed to submit solution",
                description: error.message || "Please try again later.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div>
                    <Label htmlFor="description" className="mb-2 block">
                        Description
                    </Label>
                    <SolutionMarkdown solutionForm={form} defaultDescription={`
Briefly describe your solution and how it addresses the identified challenge.

---

## Key Features
- Feature 1: Short description.
- Feature 2: Short description.
- Feature 3: Short description.

---

## Benefits
- Benefit 1: Short description.
- Benefit 2: Short description.
- Benefit 3: Short description.

--

## Implementation Plan
1. Step 1: Describe the first action or phase.
2. Step 2: Outline the next action.
3. Step 3: Add further steps as needed.

--
`} />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.description.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label htmlFor={fileInputId} className="mb-2 block">
                        Upload Documents (PDF or DOCX, up to 5 files)
                    </Label>

                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={() => setIsDragging(true)}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);

                            const droppedFiles = Array.from(e.dataTransfer.files || []);
                            const allowedFiles = droppedFiles.filter(
                                (file) =>
                                    file.type === "application/pdf" ||
                                    file.type ===
                                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            );

                            if (allowedFiles.length === 0) {
                                toast({
                                    variant: "destructive",
                                    title: "Invalid file type",
                                    description: "Only PDF or DOCX files are allowed.",
                                });
                                return;
                            }

                            const currentFiles = selectedFiles || [];
                            const uniqueNewFiles = allowedFiles.filter(
                                (newFile) => !currentFiles.some((f) => f.name === newFile.name)
                            );

                            const updatedFiles = [...currentFiles, ...uniqueNewFiles].slice(0, 5);
                            setValue("files", updatedFiles, { shouldValidate: true });
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition
      ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/60"}
    `}
                    >
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                            PDF or DOCX files only (Max 5 files, each ≤ 10 MB)
                        </p>
                    </div>
                    <Input
                        ref={fileInputRef}
                        id={fileInputId}
                        type="file"
                        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    {selectedFiles.length > 0 && (
                        <ul className="mt-4 border rounded-md divide-y divide-gray-200 bg-gray-50">
                            {selectedFiles.map((file, index) => (
                                <li
                                    key={index}
                                    className="flex items-center justify-between p-2 text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-gray-500 text-xs">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600"
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                    >
                                        Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {errors?.files && (
                        <p className="text-red-500 text-sm mt-1">{errors.files.message}</p>
                    )}
                </div>



                <div className="border rounded-md p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-4">Contact Details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div>
                            <Label htmlFor="contactName" className="mb-2 block">
                                Contact Name
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="contactName"
                                    readOnly={!isEditingName}
                                    className={
                                        !isEditingName
                                            ? "bg-gray-100 cursor-not-allowed"
                                            : ""
                                    }
                                    {...register("contactName")}
                                />
                                <Button
                                    type="button"
                                    variant={isEditingName ? "default" : "outline"}
                                    className="whitespace-nowrap"
                                    onClick={() => setIsEditingName(!isEditingName)}
                                >
                                    {isEditingName ? "Save" : "Edit"}
                                </Button>
                            </div>
                            {errors.contactName && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.contactName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="mobileNumber" className="mb-2 block">
                                Mobile Number
                            </Label>
                            <Input
                                id="mobileNumber"
                                placeholder="Enter 10-digit mobile number"
                                {...register("mobileNumber")}
                            />
                            {errors.mobileNumber && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.mobileNumber.message}
                                </p>
                            )}
                        </div>


                        <div>
                            <Label htmlFor="placeOfResidence" className="mb-2 block">
                                Place of Residence
                            </Label>
                            <Input
                                id="placeOfResidence"
                                placeholder="Enter place of residence"
                                {...register("placeOfResidence")}
                            />
                            {errors.placeOfResidence && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.placeOfResidence.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="district" className="mb-2 block">
                                District
                            </Label>
                            <Input
                                id="district"
                                placeholder="Enter district"
                                {...register("district")}
                            />
                            {errors.district && (
                                <p className="text-red-500 text-sm mt-1">
                                    {errors.district.message}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreeToTerms}
                        onChange={(e) => setAgreeToTerms(e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{" "}
                        <a
                            href="/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Terms & Conditions
                        </a>
                    </Label>
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className={`bg-accent hover:bg-accent/90 text-accent-foreground ${!agreeToTerms ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        disabled={loading || !agreeToTerms}
                    >
                        {loading ? "Submitting..." : "Submit Solution"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
