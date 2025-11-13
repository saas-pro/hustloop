import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/api";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface AnnouncementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collaborationId: number;
}

export function AnnouncementDialog({
    open,
    onOpenChange,
    collaborationId,
}: AnnouncementDialogProps) {
    const [announcementForm, setAnnouncementForm] = useState({
        title: "",
        message: "",
        type: "general",
    });

    const [attachments, setAttachments] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const MAX_ATTACHMENTS = 2;
    const onDrop = (event: React.DragEvent) => {
        event.preventDefault();
        const newFiles = Array.from(event.dataTransfer.files);

        if (attachments.length + newFiles.length > MAX_ATTACHMENTS) {
            toast({
                title: "Limit Exceeded",
                description: `You can upload a maximum of ${MAX_ATTACHMENTS} attachments.`,
                variant: "destructive",
            });
            return;
        }

        setAttachments((prev) => [...prev, ...newFiles]);
    };

    const onDragOver = (event: React.DragEvent) => event.preventDefault();

    const onSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);

        if (attachments.length + newFiles.length > MAX_ATTACHMENTS) {
            toast({
                title: "Limit Exceeded",
                description: `Only ${MAX_ATTACHMENTS} attachments are allowed.`,
                variant: "destructive",
            });
            return;
        }

        setAttachments((prev) => [...prev, ...newFiles]);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("title", announcementForm.title);
            formData.append("message", announcementForm.message);
            formData.append("type", announcementForm.type);

            attachments.forEach((file) => {
                formData.append("attachments", file);
            });

            const res = await fetch(
                `${API_BASE_URL}/api/announcements/${collaborationId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                }
            );

            if (res.ok) {
                toast({
                    title: "Announcement Created",
                    description: "Your announcement is now live.",
                });

                setAnnouncementForm({
                    title: "",
                    message: "",
                    type: "general",
                });
                setAttachments([]);
                onOpenChange(false);
            } else {
                toast({
                    title: "Failed",
                    description: "Unable to create announcement.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Server error occurred.",
                variant: "destructive",
            });
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className=" space-y-4 p-6">
                <DialogTitle>Create Announcement</DialogTitle>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Title</Label>
                    <Input
                        type="text"
                        placeholder="Enter announcement title..."
                        className="w-full border rounded-md p-2"
                        value={announcementForm.title}
                        onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, title: e.target.value }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Message</Label>
                    <Textarea
                        placeholder="Write the announcement message..."
                        className="w-full border rounded-md p-2 h-28"
                        value={announcementForm.message}
                        onChange={(e) =>
                            setAnnouncementForm((f) => ({ ...f, message: e.target.value }))
                        }
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Type</Label>

                    <Select
                        value={announcementForm.type}
                        onValueChange={(value) =>
                            setAnnouncementForm((f) => ({ ...f, type: value }))
                        }
                    >
                        <SelectTrigger className="w-full border rounded-md p-2">
                            <SelectValue placeholder="Select announcement type" />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="alert">Alert</SelectItem>
                                <SelectItem value="deadline">Deadline</SelectItem>
                                <SelectItem value="result">Result</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-medium">Attachment (Drag & Drop)</Label>

                    <div
                        onDrop={attachments.length < MAX_ATTACHMENTS ? onDrop : undefined}
                        onDragOver={attachments.length < MAX_ATTACHMENTS ? onDragOver : undefined}
                        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer
    ${attachments.length >= MAX_ATTACHMENTS ? "opacity-50 cursor-not-allowed" : "border-primary/50 bg-muted/30"}
  `}
                    >
                        <Input
                            type="file"
                            multiple
                            className="hidden"
                            id="fileUpload"
                            disabled={attachments.length >= MAX_ATTACHMENTS}
                            onChange={onSelectFiles}
                        />


                        <Label htmlFor="fileUpload" className="cursor-pointer text-sm text-primary">
                            Drag files here or <span className="underline">browse</span>
                        </Label>
                    </div>

                    {attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border rounded-md p-2 bg-white"
                                >
                                    <span className="text-sm">{file.name}</span>
                                    <Button
                                        className=" text-xs"
                                        onClick={() =>
                                            setAttachments((prev) => prev.filter((_, i) => i !== index))
                                        }
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <p className="text-xs text-muted-foreground mt-1">
                                {attachments.length}/{MAX_ATTACHMENTS} files uploaded
                            </p>

                        </div>
                    )}
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary text-white px-4 py-2 rounded-md w-full"
                >
                    {isSubmitting ? "Submitting..." : "Submit Announcement"}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
