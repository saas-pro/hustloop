import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';
import React, { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Info } from 'lucide-react';
import { MarkdownViewer } from '../ui/markdownViewer';
import { Button } from '../ui/button';
import { AnnouncementDialog } from './AnnouncementDialog';

interface CollaborationViewProps {
    collaborationId: number;
    onClose: () => void;
}

interface GetUsersCollaborationSchema {
    id: number;
    title: string;
    description: string;
    reward_amount: number;
    reward_min: number;
    reward_max: number;
    challenge_type: 'corporate' | 'msme' | 'government';
    start_date: Date | undefined;
    end_date: Date | undefined;
    sector: string;
    technology_area: string;
    contact_name: string;
    contact_role: string;
    created_at: string;
    user_id: number;
}

const CollaborationView = ({ collaborationId, onClose }: CollaborationViewProps) => {
    const [collabDetails, setCollabDetails] = useState<GetUsersCollaborationSchema | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(true);
    const [announcementOpen, setAnnouncementOpen] = useState(false);

    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        onClose();
    }, [onClose]);

    useEffect(() => {
        const fetchCollabDetails = async () => {
            setIsFetching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/get-users-collaboration?id=${collaborationId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setCollabDetails(data.collaborations[0]);

                } else {
                    toast({
                        title: 'Failed to load Collaboration',
                        description: 'Unknown error occurred',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Something went wrong while loading collaboration details.',
                    variant: 'destructive',
                });
            } finally {
                setIsFetching(false);
            }
        };
        fetchCollabDetails();
    }, [collaborationId]);

    return (
        <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleCloseDialog();
                }
                setIsDialogOpen(open);
            }}
        >
            <DialogContent
                className={`
          relative flex flex-col border bg-background transition-all duration-500 p-0 
          w-[90vw] max-w-[90vw] shadow-lg text-base h-[90vh]  fixed
          rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        `}
            >
                <div className="flex justify-between items-center p-4 pr-14 rounded-t-lg border-b bg-muted/50 dark:bg-muted/20 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold">
                        {collabDetails?.title}
                    </DialogTitle>
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {collabDetails && (
                        <Card className="mb-0 border-primary/50 bg-primary-foreground/20">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg font-extrabold text-primary flex items-center">
                                    <Info className="h-5 w-5 mr-2" />
                                    {collabDetails.title}
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">
                                    Submitted by {collabDetails.contact_name} — {collabDetails.contact_role}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-4 pt-0 text-sm">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <p><span className="font-semibold">Sector:</span> {collabDetails.sector}</p>
                                    <p><span className="font-semibold">Technology Area:</span> {collabDetails.technology_area}</p>
                                    <p><span className="font-semibold">Challenge Type:</span> {collabDetails.challenge_type}</p>
                                    <p>
                                        <span className="font-semibold">Reward:</span>{" "}
                                        {collabDetails.reward_amount
                                            ? `₹${collabDetails.reward_amount}`
                                            : `₹${collabDetails.reward_min} - ₹${collabDetails.reward_max}`}
                                    </p>
                                    <p><span className="font-semibold">Start Date:</span> {collabDetails.start_date ? new Date(collabDetails.start_date).toLocaleDateString() : 'N/A'}</p>
                                    <p><span className="font-semibold">End Date:</span> {collabDetails.end_date ? new Date(collabDetails.end_date).toLocaleDateString() : 'N/A'}</p>
                                </div>

                                <h1 className="text-lg mb-2">Description:</h1>
                                <MarkdownViewer content={collabDetails.description} />

                                <p className="mt-4 text-xs text-muted-foreground">
                                    Created on: {new Date(collabDetails.created_at).toLocaleString()}
                                </p>

                            </CardContent>
                        </Card>
                    )}
                    {/* Floating Button */}
                    <Button
                        onClick={() => setAnnouncementOpen(true)}
                        className="
    bg-primary text-white px-4 py-2 rounded-md 
    absolute bottom-4 right-4 shadow-lg z-50
  "
                    >
                        + Create Announcement
                    </Button>

                </div>
            </DialogContent>
            <AnnouncementDialog
                open={announcementOpen}
                onOpenChange={setAnnouncementOpen}
                collaborationId={collaborationId}
            />

        </Dialog>
    );
};

export default CollaborationView;
