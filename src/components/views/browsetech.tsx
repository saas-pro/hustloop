"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { View } from "@/app/types";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface TechTransferViewProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    setActiveView: (view: View) => void;
}

interface TechTransferProfile {
    id: string;
    ipTitle: string;
    firstName: string;
    lastName: string;
    describetheTech: string;
    summary:string;
    inventorName: string;
    organization: string;
    contactEmail: string;
    supportingFileUrl?: string;
    approvalStatus: string;
    user_id?: number;
}

export default function TechTransferView({ isOpen, onOpenChange }: TechTransferViewProps) {
    const [profiles, setProfiles] = useState<TechTransferProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApprovedProfiles = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`${API_BASE_URL}/api/getTechTransfer`);
                if (!response.ok) {
                    toast({title:"Error",description:"Cannot fetch Intelectual Property",variant:"destructive"})
                }
                const data = await response.json();
                setProfiles(data.ips || []);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            fetchApprovedProfiles();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6">
                    <DialogTitle className="text-3xl font-bold text-center font-headline">Technology Transfer</DialogTitle>
                    <DialogDescription className="text-center">
                        <span className="text-accent">
                            {"Hustloop is where innovation meets execution."}
                        </span>
                        <br />
                        Browse technology profiles from various organizations seeking collaboration.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                    {isLoading && (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                            <span className="text-gray-500">Loading profiles...</span>
                        </div>
                    )}
                    {!isLoading && profiles.length === 0 && (
                        <div className="py-10 text-center text-gray-500 flex items-center justify-center h-[50vh]">
                            <p>No Technology Transfer profiles are currently available.</p>
                        </div>
                    )}
                    {!isLoading && profiles.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
                            {profiles.map((profile) => (
                                <div key={profile.id} className="border rounded-lg p-6 shadow-sm">
                                    <h3 className="text-xl font-bold text-primary">{profile.ipTitle}</h3>
                                    <p className="text-sm text-muted-foreground">{profile.organization}</p>

                                    <Separator className="my-4" />

                                    <div className="space-y-4 ">
                                        <div>
                                            <h4 className="font-semibold text-lg">About</h4>
                                            <p className="text-sm text-gray-600 line-clamp-3">{profile.summary}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">Inventor</h4>
                                            <p className="text-sm text-gray-600">{profile.inventorName}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        {profile.supportingFileUrl && (
                                            <a
                                                href={`${profile.supportingFileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-fit"
                                            >
                                                <Button variant="default" className="w-full">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    View Document
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}