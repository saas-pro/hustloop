"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Download, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { View } from "@/app/types";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import TechTransfer from "../techtransfer_view";
import { profile } from "console";
import { Input } from "../ui/input";
import Image from "next/image";
import TechCard from "../tech-card/tech-card";

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
    summary: string;
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
    const [techId, setTechId] = useState<string | null>(null);

    useEffect(() => {
        const fetchApprovedProfiles = async () => {
            try {
                setIsLoading(true);

                const response = await fetch(`${API_BASE_URL}/api/getTechTransfer`);
                if (!response.ok) {
                    toast({ title: "Error", description: "Cannot fetch Intelectual Property", variant: "destructive" })
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

    const [searchTerm, setSearchTerm] = useState("");

    const filteredProfiles = useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return profiles.filter(
            (p) =>
                p.ipTitle.toLowerCase().includes(lower) ||
                p.organization.toLowerCase().includes(lower) ||
                p.inventorName.toLowerCase().includes(lower) ||
                p.summary.toLowerCase().includes(lower)
        );
    }, [profiles, searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0 overflow-y-auto pb-3">
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
                    {!isLoading && profiles.length > 0 && (<div className="space-y-6">
                        {/* Search Bar */}
                        <div className="relative max-w-md mx-auto">
                            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by title, organization, or inventor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 rounded-md border border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
                            />
                        </div>

                        {/* Profiles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mx-14">
                            {filteredProfiles.length > 0 ? (
                                filteredProfiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        onClick={() => setTechId(profile.id)}
                                        className="relative cursor-pointer"
                                    >
                                        <TechCard
                                            title={profile.ipTitle}
                                            author={profile.firstName +" "+ profile.lastName}
                                        />
                                    </div>

                                        ))
                                        ) : (
                                        <div className="py-10 text-center text-gray-500 col-span-full">
                                            No profiles match your search.
                                        </div>
                            )}
                                    </div>

                    </div>)}
                    </div>
                {
                        techId !== null && (
                            <TechTransfer
                                techId={techId}
                                onClose={() => setTechId(null)}
                            />
                        )
                    }
            </DialogContent>
        </Dialog>
    );

}