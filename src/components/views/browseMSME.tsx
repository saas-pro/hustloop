import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { API_BASE_URL } from "@/lib/api";
import Image from "next/image";

interface MSMEProfile {
    id: string;
    company_name: string;
    sector: string;
    description: string;
    website_url?: string | null;
    linkedin_url?: string | null;
    x_url?: string | null;
    logo_url?: string | null;
    user_id: string;
    is_submitted: boolean;
}

interface BrowseMSMEProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function BrowseMSME({ isOpen, onOpenChange }: BrowseMSMEProps) {
    const [profiles, setProfiles] = useState<MSMEProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProfile, setSelectedProfile] = useState<MSMEProfile | null>(null);

    useEffect(() => {
        const ac = new AbortController();

        const fetchProfiles = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/api/msme_profiles`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    signal: ac.signal,
                });

                if (!res.ok) {
                    let msg = `${res.status} ${res.statusText}`;
                    try {
                        const body = await res.json();
                        if (body?.message) msg = body.message;
                    } catch { }
                    throw new Error(msg);
                }

                const data = await res.json();
                if (Array.isArray(data)) setProfiles(data);
                else if (data && data.message) setError(data.message);
                else setProfiles([]);
            } catch (err: any) {
                if (err.name !== "AbortError")
                    setError(err.message ?? "Failed to fetch profiles");
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
        return () => ac.abort();
    }, []);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-6xl h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-3xl font-bold text-center  font-headline">MSME Profiles</DialogTitle>
                        <DialogDescription className="text-center">
                            <span className="text-accent">{"Your business, your potential."}</span><br />
                            Browse MSME profiles from various organizations seeking collaboration.

                        </DialogDescription>
                    </DialogHeader>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="p-4 animate-pulse">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                            <div className="w-full">
                                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                                <div className="h-3 bg-gray-200 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-20 bg-gray-200 rounded" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="space-y-2">
                            <p className="text-red-600">Error: {error}</p>
                            <Button onClick={() => window.location.reload()}>Retry</Button>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                            No MSME profiles found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
                            {profiles.map((p) => (
                                <Card
                                    key={p.id}
                                    onClick={() => setSelectedProfile(p)}
                                    className="overflow-hidden hover:shadow-lg transition cursor-pointer"
                                >
                                    <CardHeader className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12">
                                            {p.logo_url ? (
                                                <AvatarImage src={p.logo_url} />
                                            ) : (
                                                <AvatarFallback>
                                                    {p.company_name?.charAt(0) ?? "?"}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center justify-between">
                                                <span>{p.company_name}</span>

                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">
                                                {p.sector}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-3">
                                            {p.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog >

            <Dialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
                {selectedProfile && (
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{selectedProfile.company_name}</DialogTitle>
                            <DialogDescription>{selectedProfile.sector}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedProfile.logo_url && (
                                <Image
                                    width={25}
                                    height={25}
                                    src={selectedProfile.logo_url}
                                    alt={selectedProfile.company_name}
                                    className="w-24 h-24 rounded-full mx-auto object-cover"
                                />
                            )}
                            <p className="text-sm text-muted-foreground">
                                {selectedProfile.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {selectedProfile.website_url && (
                                    <Button asChild>
                                        <a
                                            href={selectedProfile.website_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit Website
                                        </a>
                                    </Button>
                                )}
                                {selectedProfile.linkedin_url && (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={selectedProfile.linkedin_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            LinkedIn
                                        </a>
                                    </Button>
                                )}
                                {selectedProfile.x_url && (
                                    <Button variant="outline" asChild>
                                        <a
                                            href={selectedProfile.x_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            X
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                )}
            </Dialog >
        </>
    );
}
