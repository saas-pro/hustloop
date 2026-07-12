'use client';

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Loader2, Reply, Pencil, Trash2, X, MoreHorizontal } from 'lucide-react';
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
    parent_id?: string | null;
    is_updated?: boolean;
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
    const [replyingTo, setReplyingTo] = useState<IdeaMessage | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editMessageContent, setEditMessageContent] = useState('');
    const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
    const textareaId = useId();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToMessage = (id: string) => {
        const element = document.getElementById(`message-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedMessageId(id);
            setTimeout(() => {
                setHighlightedMessageId(null);
            }, 3000);
        }
    };

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

        const handleEditMessage = (msg: IdeaMessage) => {
            if (msg.submission_id !== submissionId) return;
            setMessages((prev) => prev.map(m => m.id === msg.id ? msg : m));
        };

        const handleDeleteMessage = (data: { id: string, submission_id: string }) => {
            if (data.submission_id !== submissionId) return;
            setMessages((prev) => prev.filter(m => m.id !== data.id));
        };

        socket.on('new_idea_message', handleNewMessage);
        socket.on('idea_message_edited', handleEditMessage);
        socket.on('idea_message_deleted', handleDeleteMessage);

        return () => {
            socket.emit('leave_idea_chat', { submissionId });
            socket.off('new_idea_message', handleNewMessage);
            socket.off('idea_message_edited', handleEditMessage);
            socket.off('idea_message_deleted', handleDeleteMessage);
        };
    }, [submission?.id, scrollToBottom, submission]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsLoading(true);
        const userId = getCurrentUserId();

        socket.emit('send_idea_message', {
            submissionId: submission!.id,
            senderId: userId,
            message: newMessage.trim(),
            parent_id: replyingTo ? replyingTo.id : null
        });

        setNewMessage('');
        setReplyingTo(null);
        setIsLoading(false);
    };

    const submitEditMessage = async () => {
        if (!editMessageContent.trim() || !editingMessageId) return;
        const userId = getCurrentUserId();
        socket.emit('edit_idea_message', {
            messageId: editingMessageId,
            senderId: userId,
            message: editMessageContent.trim()
        });
        setEditingMessageId(null);
        setEditMessageContent('');
    };

    const confirmDeleteMessage = (messageId: string) => {
        const userId = getCurrentUserId();
        socket.emit('delete_idea_message', {
            messageId,
            senderId: userId
        });
    };

    const getCurrentUserRoles = (): string[] => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload: { role?: string[] } = jwtDecode(token);
                return payload.role || [];
            } catch (e) {
                return [];
            }
        }
        return [];
    };

    const getMessageActions: any = (msg: IdeaMessage) => {
        const currentUserId = getCurrentUserId();
        const currentUserRoles = getCurrentUserRoles();
        const isAuthor = currentUserId !== null && currentUserId === msg.sender_id;
        const isAdmin = currentUserRoles.includes('admin');
        const createdAt = new Date(msg.created_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

        const canEdit = (isAuthor && isAdmin) || (isAuthor && diffMinutes <= 15);
        const canDelete = isAdmin || (isAuthor && diffMinutes <= 5);

        return { canEdit, canDelete };
    };

    const findParentMessage = (parentId: string | null | undefined): IdeaMessage | undefined => {
        if (!parentId) return undefined;
        return messages.find(m => m.id === parentId);
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
                        {messages.length > 0 && (
                            <div className="absolute left-[28px] top-1 bottom-1 w-px bg-muted-foreground"></div>
                        )}

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
                                const { canEdit, canDelete } = getMessageActions(msg);
                                const parentMsg = findParentMessage(msg.parent_id);
                                return (
                                    <div
                                        key={msg.id}
                                        id={`message-${msg.id}`}
                                        className={`relative flex gap-3 p-2 items-start transition-all duration-500 rounded-md ${highlightedMessageId === msg.id ? 'bg-primary/10 ring-1 ring-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-transparent'}`}
                                    >
                                        <Avatar className="h-8 w-8 relative z-10 mt-1">
                                            <AvatarFallback className="font-semibold text-xs">
                                                {msg.sender_name ? msg.sender_name.charAt(0) : 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex-1 min-w-0">
                                            <div className='flex justify-between'>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <span className="font-semibold text-sm text-foreground">{msg.sender_name || 'Unknown User'}</span>
                                                    {msg.sender_role && (
                                                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                                            {msg.sender_role.toLowerCase() === 'admin' ? 'Triager' : msg.sender_role.toUpperCase()}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatTime(msg.created_at)}
                                                    </span>
                                                    {msg.is_updated && (
                                                        <span className="text-[10px] text-muted-foreground italic">(edited)</span>
                                                    )}
                                                </div>

                                                {!editingMessageId && (
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                        <button onClick={() => { setReplyingTo(msg); document.getElementById(textareaId)?.focus(); }} className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                            <Reply className="w-3.5 h-3.5" /> Reply
                                                        </button>
                                                        {(canEdit || canDelete) && (
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors outline-none focus:outline-none">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="start" className="w-32">
                                                                    {canEdit && (
                                                                        <DropdownMenuItem onClick={() => { setEditingMessageId(msg.id); setEditMessageContent(msg.message); }}>
                                                                            <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    {canDelete && (
                                                                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => confirmDeleteMessage(msg.id)}>
                                                                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        )}
                                                    </div>
                                                )}
                                            </div>


                                            {parentMsg && (
                                                <div
                                                    onClick={() => scrollToMessage(parentMsg.id)}
                                                    className="bg-muted/50 border-l-2 border-primary/50 pl-2 py-1 mb-2 rounded-r flex flex-col text-xs text-muted-foreground cursor-pointer hover:bg-muted/80 transition-colors"
                                                >
                                                    <span className="font-semibold mb-0.5">Replying to {parentMsg.sender_name || 'Unknown User'}:</span>
                                                    <span className="line-clamp-2">{parentMsg.message}</span>
                                                </div>
                                            )}

                                            {editingMessageId === msg.id ? (
                                                <div className="mt-1">
                                                    <Textarea
                                                        value={editMessageContent}
                                                        onChange={(e) => setEditMessageContent(e.target.value)}
                                                        className="w-full resize-none bg-background text-sm mb-2"
                                                        rows={2}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingMessageId(null)}>Cancel</Button>
                                                        <Button size="sm" onClick={submitEditMessage}>Save</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-foreground mb-1 whitespace-pre-wrap break-words">{msg.message}</div>
                                            )}


                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input area */}
                <div className="p-4 border-t bg-muted/30 flex flex-col relative">
                    {isCommentsDisabled ? (
                        <div className="text-center py-4 text-muted-foreground bg-muted/50 rounded-md border border-dashed">
                            <p className="text-sm font-medium">Chat is closed</p>
                            <p className="text-xs mt-1">
                                This idea has reached its final decision state.
                            </p>
                        </div>
                    ) : (
                        <>
                            {replyingTo && (
                                <div className="flex items-center justify-between bg-muted/50 border-l-2 border-primary/50 pl-3 pr-2 py-2 mb-2 rounded text-xs text-muted-foreground">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-foreground mb-0.5">Replying to {replyingTo.sender_name || 'Unknown User'}</span>
                                        <span className="truncate max-w-[500px]">{replyingTo.message}</span>
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="p-1 hover:text-foreground hover:bg-muted rounded-full transition-colors ml-2">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
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
