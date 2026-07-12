import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StartupSubmission } from './founder-ideas-view';

interface StartupSubmissionDetailsModalProps {
    submission: StartupSubmission | null;
    onClose: () => void;
    userRole?: string;
    onStatusUpdate?: (status: string) => void;
}

export function StartupSubmissionDetailsModal({
    submission,
    onClose,
    userRole,
    onStatusUpdate
}: StartupSubmissionDetailsModalProps) {
    if (!submission) return null;

    return (
        <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{submission.startup_name}</DialogTitle>
                    <DialogDescription>
                        Submitted on {new Date(submission.created_at).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 my-4">
                    <div className="flex gap-2 items-center">
                        <Badge variant="outline">{submission.industry_sector}</Badge>
                        <Badge>{submission.status.replace('_', ' ')}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-sm font-semibold text-muted-foreground block">Founder</span>
                            <span>{submission.founder_name || submission.contactName || 'N/A'}</span>
                        </div>
                        {submission.incubator_name && (
                            <div>
                                <span className="text-sm font-semibold text-muted-foreground block">Incubator</span>
                                <span>{submission.incubator_name}</span>
                            </div>
                        )}
                    </div>

                    {submission.description && (
                        <div>
                            <span className="text-sm font-semibold text-muted-foreground block mb-1">Description</span>
                            <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">
                                {submission.description}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default StartupSubmissionDetailsModal;
