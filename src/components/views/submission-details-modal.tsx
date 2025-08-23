
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Paperclip, Send } from 'lucide-react';
import type { Submission } from '@/app/types';
import { cn } from '@/lib/utils';

interface SubmissionDetailsModalProps {
  submission: Submission | null;
  onOpenChange: (isOpen: boolean) => void;
  onAddComment: (submissionId: number, commentText: string) => void;
}

export default function SubmissionDetailsModal({ submission, onOpenChange, onAddComment }: SubmissionDetailsModalProps) {
    const [newComment, setNewComment] = useState('');

    if (!submission) return null;

    const handlePostComment = () => {
        if (newComment.trim()) {
            onAddComment(submission.id, newComment);
            setNewComment('');
        }
    };

    return (
        <Dialog open={!!submission} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold font-headline">{submission.idea}</DialogTitle>
                    <DialogDescription>
                        Submitted by {submission.founder} on {submission.submittedDate}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow flex flex-col min-h-0 gap-4">
                    <div className="p-4 border rounded-lg bg-card/50">
                        <h3 className="font-semibold mb-2">Submission Details</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{submission.description}</p>
                    </div>

                    <Separator />

                    <h3 className="font-semibold">Communication Thread</h3>
                    <ScrollArea className="flex-grow border rounded-lg p-4 bg-muted/20">
                        <div className="space-y-6">
                            {submission.comments.map((comment, index) => {
                                const isPlatformMessage = comment.author !== 'Founder';
                                return (
                                <div key={index} className={cn("flex items-start gap-3", isPlatformMessage && "justify-end")}>
                                    <Avatar className={cn(isPlatformMessage && "order-2")}>
                                        <AvatarFallback>{comment.author.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className={cn("rounded-lg p-3 max-w-md", isPlatformMessage ? "bg-primary text-primary-foreground" : "bg-card")}>
                                        <p className="font-semibold text-sm">{comment.author}</p>
                                        <p className="text-sm mt-1">{comment.text}</p>
                                        <p className="text-xs opacity-70 mt-1 text-right">{comment.timestamp}</p>
                                    </div>
                                </div>
                            )})}
                             {submission.comments.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    No comments yet. Start the conversation!
                                </div>
                             )}
                        </div>
                    </ScrollArea>
                    
                    <div className="mt-auto pt-4">
                         <div className="relative">
                            <Textarea
                                placeholder="Type your message..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="pr-24"
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-1">
                                 <Button type="button" variant="ghost" size="icon">
                                    <Paperclip className="h-5 w-5" />
                                    <span className="sr-only">Attach file</span>
                                </Button>
                                <Button type="submit" size="icon" onClick={handlePostComment} disabled={!newComment.trim()}>
                                    <Send className="h-5 w-5" />
                                    <span className="sr-only">Send</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
