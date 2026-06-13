'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { SolutionMarkdownViewer } from '../ui/SolutionMarkdownViewer';

type StartupIdeaStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REJECTED' | 'ACCEPTED' | 'FUNDED';

interface StartupSubmission {
    id: string;
    startup_name: string;
    industry_sector: string;
    status: StartupIdeaStatus;
    created_at: string;
    description?: string;
    contactName?: string;
    recommended_incubators?: any[];
}

interface IdeaMessage {
    id: string;
    sender_id: string;
    sender_name?: string;
    sender_role?: string;
    message: string;
    created_at: string;
    submission_id: string;
}

interface IdeaChatModalProps {
    submission: StartupSubmission | null;
    onOpenChange: (open: boolean) => void;
}

const socket: Socket = io(API_BASE_URL, {
    transports: ['websocket'],
    withCredentials: true,
});

export function IdeaChatModal({ submission, onOpenChange }: IdeaChatModalProps) {
    const { toast } = useToast();
    const [messages, setMessages] = useState<IdeaMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const textareaId = useId();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isCommentsDisabled = submission?.status === 'REJECTED' || submission?.status === 'FUNDED';

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const getCurrentUserId = (): string | null => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload: { user_id: string } = jwtDecode(token);
                return payload.user_id;
            } catch (e) {
                const uid = localStorage.getItem('uid') || localStorage.getItem('userId');
                return uid || null;
            }
        }
        return null;
    };

    useEffect(() => {
        if (!submission) return;
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`${API_BASE_URL}/api/founder-ideas/${submission.id}/messages`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!res.ok) throw new Error('Failed to load messages');
                const data = await res.json();
                setMessages(data || []);
                setTimeout(scrollToBottom, 100);
            } catch {
                toast({
                    title: 'Error',
                    description: 'Failed to load messages',
                    variant: 'destructive',
                });
            }
        };

        fetchMessages();
    }, [submission?.id, toast, scrollToBottom, submission]);

    useEffect(() => {
        if (!submission) return;
        const submissionId = submission.id;

        socket.emit('join_idea_chat', { submissionId });

        const handleNewMessage = (msg: IdeaMessage) => {
            if (msg.submission_id !== submissionId) return;

            setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            setTimeout(scrollToBottom, 150);
        };

        socket.on('new_idea_message', handleNewMessage);

        return () => {
            socket.emit('leave_idea_chat', { submissionId });
            socket.off('new_idea_message', handleNewMessage);
        };
    }, [submission?.id, scrollToBottom, submission]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsLoading(true);
        const userId = getCurrentUserId();

        socket.emit('send_idea_message', {
            submissionId: submission!.id,
            senderId: userId,
            message: newMessage.trim()
        });

        setNewMessage('');
        setIsLoading(false);
    };

    if (!submission) return null;

    function formatTime(timestamp: string) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

        if (diffSeconds < 60) {
            return "just now";
        } else if (diffSeconds < 3600) {
            const minutes = Math.floor(diffSeconds / 60);
            return `${minutes} m ago`;
        } else if (diffSeconds < 86400) {
            const hours = Math.floor(diffSeconds / 3600);
            return `${hours} h ago`;
        } else {
            const days = Math.floor(diffSeconds / 86400);
            return `${days} d ago`;
        }
    }

    return (
        <Dialog open={!!submission} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col border bg-background w-[90vw] h-[90vh] max-w-[90vw] p-0 rounded-lg shadow-lg">
                <div className="flex justify-between items-center p-4 border-b bg-muted/50">
                    <div className="flex flex-col">
                        <h2 className="text-sm font-medium text-muted-foreground">
                            {submission.industry_sector}
                        </h2>
                        <DialogTitle className="text-xl font-bold text-foreground">
                            {submission.startup_name}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                            Current Status: <span className="font-semibold">{submission.status.replace('_', ' ')}</span>
                        </p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-4">
                    {/* TIMELINE WRAPPER */}
                    <div className="relative pl-2 space-y-4">
                        {/* GLOBAL TIMELINE LINE that scrolls correctly */}
                        <div className="absolute left-[28px] top-1 bottom-1 w-px bg-muted-foreground"></div>

                        {/* ===================== DESCRIPTION CARD ===================== */}
                        <Card className="rounded-none border-none shadow-none bg-transparent relative">
                            <CardHeader className="p-1 flex flex-row items-start justify-between">
                                <div className="flex gap-3 items-start relative">
                                    {/* Submission Avatar - anchored to timeline */}
                                    <Avatar className="h-8 w-8 relative z-10">
                                        <AvatarFallback className="font-semibold">
                                            {submission.contactName ? submission.contactName.charAt(0) : submission.startup_name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className='flex flex-col justify-between'>
                                        <div className="flex items-center gap-2">
                                            <p className="text-muted-foreground text-sm">
                                                Submitted Idea{" "}
                                                <span className="font-semibold">
                                                    {submission.startup_name}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* ===================== MESSAGES ===================== */}
                        {messages.length === 0 ? (
                            <p className="text-center text-muted-foreground mt-10">No messages yet. Be the first to chat!</p>
                        ) : (
                            messages.map((msg) => {
                                return (
                                    <div
                                        key={msg.id}
                                        id={`message-${msg.id}`}
                                        className="relative flex gap-3 p-2 items-start bg-transparent transition-all duration-300"
                                    >
                                        {/* Avatar aligned to timeline */}
                                        <Avatar className="h-8 w-8 relative z-10">
                                            <AvatarFallback className="font-semibold">
                                                {msg.sender_name ? msg.sender_name.charAt(0) : 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* MESSAGE BODY */}
                                        <div className="flex-1 min-w-0 mt-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1 gap-2">
                                                <div className='flex flex-col sm:flex-row gap-1 sm:gap-2 sm:items-center flex-wrap'>
                                                    <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                                                        <span className="text-foreground break-words">{msg.sender_name || 'Unknown User'}</span>
                                                        {msg.sender_role && (
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
                                                                {msg.sender_role.toLowerCase() === 'admin' ? 'Triager' : msg.sender_role.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <small className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {formatTime(msg.created_at)}
                                                    </small>
                                                </div>
                                            </div>

                                            <p className="break-words whitespace-pre-wrap overflow-wrap-anywhere text-sm bg-accent/30 p-3 rounded-lg border border-border/50 inline-block w-full">{msg.message}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <div className="p-4 border-t bg-muted/30 flex flex-col">
                    {isCommentsDisabled ? (
                        <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-md border border-dashed">
                            <p className="text-sm font-medium">Chat is closed</p>
                            <p className="text-xs mt-1">
                                This idea has reached its final decision state.
                            </p>
                        </div>
                    ) : (
                        <>
                            <Textarea
                                id={textareaId}
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                rows={2}
                                disabled={isLoading}
                                className="resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()}>
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Send Message
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
