'use client';

import React, { useState, useId, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog';
import { Maximize, Minimize, Trash2, Edit, Save, X, Paperclip, File as FileIcon, Loader2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { API_BASE_URL } from '@/lib/api';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import remarkGfm from "remark-gfm";
import { format } from 'date-fns';
import { IpActions } from './ui/ip-actions';

interface IPDetails {
    id: string;
    title: string;
    description: string;
    approvalStatus: string;
    name: string;
    organization: string;
    filePath: string;
}

interface Comment {
    id: string;
    name: string;
    comment: string;
    timestamp: string;
    parent_id: string | null;
    fileURL?: string;
    fileName?: string;
    comment_user_id: string;
    displayTimestamp:string;
}

interface CommentsResponse {
    ip_details: IPDetails;
    comments: Comment[];
}

interface CommentSectionProps {
    submissionId: string;
    onClose: () => void;
    highlightedComment?: string;
    onMaximizeToggle?: (isMaximized: boolean) => void;
}


export function CommentSection({ submissionId, onClose }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [ipDetails, setIpDetails] = useState<IPDetails | null>(null);
    const [newComment, setNewComment] = useState('');
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [draft, setDraft] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
    const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(true);
    const [shouldRefetchComments, setShouldRefetchComments] = useState(true);
    const [isFetchingIpDetails, setIsFetchingIpDetails] = useState(true);


    const { toast } = useToast();
    const textareaId = useId();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const commentsEndRef = useRef<HTMLDivElement>(null);
    const newCommentTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [isDialogOpen, setIsDialogOpen] = useState(true);


    const handleCloseDialog = useCallback(() => {
        setIsDialogOpen(false);
        onClose();
    }, [onClose]);

    const scrollToBottom = useCallback(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const getCurrentUserId = (): string | null => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload: { user_id: string } = jwtDecode(token);
                return payload.user_id;
            } catch (e) {
                console.error("Failed to decode token for user ID:", e);
                return null;
            }
        }
        return null;
    };

    useEffect(() => {
        if (highlightedCommentId) {
            const element = document.getElementById(`comment-${highlightedCommentId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const timeout = setTimeout(() => setHighlightedCommentId(null), 3000);
                return () => clearTimeout(timeout);
            }
        }
    }, [highlightedCommentId, comments]);

    const getCurrentUserRoles = (): string[] => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload: { user_id: string, role: string[] } = jwtDecode(token);
                return payload.role || [];
            } catch (e) {
                console.error("Failed to decode token for roles:", e);
                return [];
            }
        }
        return [];
    };

    const scrollToComment = (id: string) => {
        const element = document.getElementById(`comment-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedCommentId(id);
            setTimeout(() => {
                setHighlightedCommentId(null);
            }, 3000);
        }
    };

    useEffect(() => {
        const hash = window.location.hash;
        if (hash && hash.startsWith('#comment-')) {
            const id = hash.replace('#comment-', '');
            if (comments.length > 0) {
                const timer = setTimeout(() => scrollToComment(id), 100);
                return () => clearTimeout(timer);
            }
        }
    }, [comments]);

    const findParentComment = (parentId: string | null): Comment | undefined => {
        if (!parentId) return undefined;
        const stringParentId = String(parentId);
        return comments.find(c => String(c.id) === stringParentId);
    };

    const renderCommentContent = (text: string) => {
        if (!text.trim()) return null;
        return <div className="prose dark:prose-invert max-w-none">{text}</div>;
    };

    const renderFileAttachment = (fileURL: string, fileName: string) => (
        <a
            href={fileURL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 mt-2 border border-dashed rounded-md bg-accent/30 hover:bg-accent transition-colors"
            onClick={(e) => e.stopPropagation()}
        >
            <Paperclip className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm text-primary truncate">
                {fileName || 'Attached File'}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
                (Click to View)
            </span>
        </a>
    );

    useEffect(() => {
        const socket = io(API_BASE_URL || '', {
            transports: ['websocket'],
        });

        socket.emit('join', `ip_${submissionId}`);

        socket.on('new_comment_added', (data: any) => {
            setComments(prev => {
                if (prev.some(comment => String(comment.id) === String(data.id))) {
                    return prev;
                }
                const userId = data.comment_user_id || data.user_id;
                const newComment: Comment = {
                    id: String(data.id),
                    name: data.name || data.comment_user_name,
                    comment: data.comment,
                    timestamp: data.timestamp || new Date(),
                    displayTimestamp:format(new Date(data.timestamp || new Date()), "do MMM hh:mm a"),
                    parent_id: data.parent_id ? String(data.parent_id) : null,
                    fileURL: data.fileURL || data.supportingFileUrl || data.file_url,
                    fileName: data.fileName || data.supportingFileKey || data.file_name,
                    comment_user_id: userId,
                };

                return [...prev, newComment].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [submissionId]);

    useEffect(() => {
        if (!isFetching) {
            scrollToBottom();
        }
    }, [comments, isFetching, scrollToBottom]);


    const getCommentActions = (comment: Comment) => {
        const authorId = comment.comment_user_id;
        const currentUserId = getCurrentUserId();
        const currentUserRoles = getCurrentUserRoles();

        const isAuthor = currentUserId !== null && currentUserId === authorId;
        const createdAt = new Date(comment.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        const isAdmin = currentUserRoles.includes('admin');

        const canDeleteOverride = isAdmin;
        const canEdit = isAuthor && diffMinutes <= 5;
        const canDelete = canDeleteOverride || (isAuthor && diffMinutes <= 30);

        return { canEdit, canDelete, isAuthor, isAdmin };
    };

    const handleReplyToComment = (comment: Comment) => {
        setReplyingTo(comment);
        newCommentTextareaRef.current?.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const [isLoading, setIsLoading] = useState(false);
    const handleAddComment = async () => {
        if (newComment.trim() === '' && !attachedFile) {
            toast({ title: 'Error', description: 'Comment text or a file is required.', variant: 'destructive' });
            return;
        }

        const formData = new FormData();

        if (newComment.trim() !== '') {
            formData.append('comment', newComment);
        }

        if (replyingTo && replyingTo.id) {
            formData.append('parent_id', String(replyingTo.id));
        }

        if (attachedFile) {
            formData.append('supportingFile', attachedFile);
        }

        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tt_ip/${submissionId}/comments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast({ title: 'Error', description: errorData.error || 'Failed to add comment', variant: 'destructive' });
                return;
            }
            const newCommentData: Comment = await response.json();
            setNewComment('');
            setAttachedFile(null);
            setReplyingTo(null);

        } catch (error) {
            console.error('Error adding comment:', error);
            toast({ title: 'Error', description: 'Something went wrong while adding the comment.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast({ title: 'Error', description: 'Authentication required', variant: 'destructive' });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/tt_ip/comments/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: 'Error',
                    description: data.error || 'Failed to delete comment',
                    variant: 'destructive',
                });
                return;
            }

            setComments((prevComments) => prevComments.filter((comment) => String(comment.id) !== String(id)));

            toast({ title: 'Comment deleted successfully' });

        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({
                title: 'Error',
                description: 'Something went wrong while deleting the comment.',
                variant: 'destructive',
            });
        }
    };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditingText(comment.comment);
    };

    const handleSaveEdit = async () => {
        if (editingCommentId === null) return;

        const token = localStorage.getItem('token');
        if (!token) {
            toast({
                title: 'Error',
                description: 'Authentication required',
                variant: 'destructive',
            });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/tt_ip/comments/${editingCommentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ comment: editingText }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                toast({
                    title: 'Error',
                    description: responseData.error || 'Failed to update comment',
                    variant: 'destructive',
                });
                return;
            }
            const updatedCommentData: Comment | any = responseData.comment || responseData;
            if (!updatedCommentData.comment || !updatedCommentData.timestamp) {
                throw new Error('Server response missing updated comment text or timestamp.');
            }

            setComments((prevComments) =>
                prevComments.map((comment) =>
                    comment.id === editingCommentId
                        ? {
                            ...comment,
                            comment: updatedCommentData.comment,
                            timestamp: updatedCommentData.timestamp
                        }
                        : comment
                )
            );
            setEditingCommentId(null);
            setEditingText('');
        } catch (error) {
            console.error('Error updating comment:', error);
            toast({
                title: 'Error',
                description: 'Something went wrong while updating the comment.',
                variant: 'destructive',
            });
        }
    };

    const handleSaveDraft = async () => {
        toast({
            title: 'Draft Saved',
            description: 'This feature is not fully implemented yet.',
            variant: 'default',
        });
    };

    const handleLoadDraft = () => {
        toast({
            title: 'Load Draft',
            description: 'This feature is not fully implemented yet.',
            variant: 'default',
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setAttachedFile(file);
        }
    };
    const [techTransferIps, setTechTransferIps] = useState<IPDetails[]>([]);

    const useGroupedIps = (techTransferIps: IPDetails[]) => {
        const [groupedIps, setGroupedIps] = useState<Record<string, IPDetails[]>>({});
        const [statusUpdates, setStatusUpdates] = useState<Record<string, "approved" | "rejected" | "needInfo">>({});
        const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

        useEffect(() => {
            if (techTransferIps.length > 0) {
                const groups = techTransferIps.reduce((acc, ip) => {
                    const orgName = ip.organization;
                    if (!acc[orgName]) {
                        acc[orgName] = [];
                    }
                    const updatedIp = {
                        ...ip,
                        approvalStatus: statusUpdates[ip.id] || ip.approvalStatus,
                    };

                    acc[orgName].push(updatedIp);
                    return acc;
                }, {} as Record<string, IPDetails[]>);

                setGroupedIps(groups);
            } else {
                setGroupedIps({});
            }
        }, [techTransferIps, statusUpdates]);

        const handleActionClick = (ipId: string, newStatus: "approved" | "rejected" | "needInfo") => {
            setStatusUpdates((prev) => ({
                ...prev,
                [ipId]: newStatus,
            }));
        };

        const handleUpdateStatus = async (ipId: string) => {
            const newStatus = statusUpdates[ipId];

            if (!newStatus) return;

            setIsUpdating((prev) => ({ ...prev, [ipId]: true }));

            try {
                const token = localStorage.getItem('token')

                const response = await fetch(`${API_BASE_URL}/api/techtransfer/${ipId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: newStatus }),
                });

                if (!response.ok) {

                    toast({ title: "error", description: "Failed to get TechTransferIps" });
                }
                if (response.ok) {

                    setTechTransferIps(prev => prev.map(ip => ip.id === ipId ? { ...ip, approvalStatus: newStatus } : ip));
                    toast({ title: "Success", description: "IP status updated successfully." });

                }
                setStatusUpdates((prev) => {
                    const newUpdates = { ...prev };
                    delete newUpdates[ipId];
                    return newUpdates;
                });

            } catch (error) {

                toast({ title: "error", description: "Failed to update status" });

                setStatusUpdates((prev) => {
                    const newUpdates = { ...prev };
                    delete newUpdates[ipId];
                    return newUpdates;
                });
            } finally {
                setIsUpdating((prev) => {
                    const newUpdating = { ...prev };
                    delete newUpdating[ipId];
                    return newUpdating;
                });
            }
        };

        return { groupedIps, statusUpdates, handleActionClick, handleUpdateStatus, isUpdating };
    };
    const { groupedIps, statusUpdates, handleActionClick, handleUpdateStatus, isUpdating } = useGroupedIps(techTransferIps)
    useEffect(() => {
        const fetchIpDetails = async () => {
            setIsFetchingIpDetails(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/tt_ip/${submissionId}/comments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (res.ok) {
                    const data: CommentsResponse = await res.json();
                    setIpDetails(data.ip_details);
                } else {
                    toast({
                        title: 'Failed to load IP details',
                        description: 'Unknown error occurred',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Something went wrong while loading IP details.',
                    variant: 'destructive',
                });
            } finally {
                setIsFetchingIpDetails(false);
            }
        };

        fetchIpDetails();
    }, [submissionId, toast, isUpdating]);

    useEffect(() => {
        const fetchComments = async () => {
            if (!shouldRefetchComments) {
                return;
            }
            setIsFetching(true);
            try {
                const res = await fetch(`${API_BASE_URL}/api/tt_ip/${submissionId}/comments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (res.ok) {
                    const data: CommentsResponse = await res.json();
                    setIpDetails(data.ip_details);
                    const normalizedComments: Comment[] = data.comments.map(c => ({
                        ...c,
                        id: String(c.id),
                        parent_id: c.parent_id ? String(c.parent_id) : null,
                        timestamp: c.timestamp, 
                        displayTimestamp: format(new Date(c.timestamp), "do MMM hh:mm a")
                    }));
                    const sortedComments = normalizedComments.sort((a, b) =>
                        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                    );
                    setComments(sortedComments);

                } else {
                    toast({
                        title: 'Failed to load comments',
                        description: 'Unknown error occurred',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Something went wrong while loading comments.',
                    variant: 'destructive',
                });
            } finally {
                setIsFetching(false);
                setShouldRefetchComments(false);
            }
        };

        fetchComments();
    }, [submissionId, shouldRefetchComments, toast]);

    const currentRole = getCurrentUserRoles();
    const isAdmin = currentRole.includes("admin");
    return (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            if (!open) {
                handleCloseDialog();
            }
            setIsDialogOpen(open);
        }} >
            <DialogContent
                className={`
                    flex flex-col border bg-background transition-all duration-500 p-0 w-[90vw] max-w-[90vw] shadow-lg text-base fixed h-[90vh] rounded-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                `} >
                <div className="flex justify-between items-center p-4 pr-14 rounded-t-lg border-b bg-muted/50 dark:bg-muted/20 flex-shrink-0">
                    <DialogTitle className="text-xl font-bold">
                        {ipDetails?.title}
                    </DialogTitle>
                    {(ipDetails && isAdmin) && (
                        <div >
                            <IpActions
                                ipId={ipDetails.id}
                                statusUpdates={statusUpdates}
                                isUpdating={isUpdating}
                                handleUpdateStatus={handleUpdateStatus}
                                handleActionClick={handleActionClick}
                            />
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {ipDetails && (
                        <Card className="mb-0 border-primary/50 bg-primary-foreground/20">
                            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-lg font-extrabold text-primary flex items-center">
                                    <Info className="h-5 w-5 mr-2" />
                                    {ipDetails.title}
                                </CardTitle>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${ipDetails.approvalStatus === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                    {ipDetails.approvalStatus}
                                </span>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-sm">
                                <p>
                                    Description:
                                </p>
                                <div>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{ipDetails.description}</ReactMarkdown>
                                </div>
                                <p className="mt-1 text-muted-foreground">Submitted By: <span className="font-semibold">{ipDetails.name}</span> from <span className="italic">{ipDetails.organization}</span></p>

                                {ipDetails.filePath && (
                                    <div className="mt-4 border-t pt-3">
                                        <p className="font-medium text-primary-dark mb-2">Attached Submission File:</p>
                                        {renderFileAttachment(ipDetails.filePath, ipDetails.title)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    {isFetching && (
                        <div className="flex justify-center items-center h-full min-h-[100px]">
                            <Loader2 className="animate-spin h-8 w-8 text-primary" />
                        </div>
                    )}
                    {!isFetching && comments.length === 0 && (
                        <div className="text-center text-muted-foreground p-10">
                            <p>No comments yet. Start the conversation!</p>
                        </div>
                    )}
                    {comments.map((comment, index) => {
                        const { canEdit, canDelete } = getCommentActions(comment);
                        const parentComment = comment.parent_id ? findParentComment(comment.parent_id) : null;
                        return (
                            <div
                                key={index}
                                id={`comment-${comment.id}`}
                                className={`p-3 rounded-lg border bg-card transition-all duration-300 z-[999] ${highlightedCommentId === comment.id
                                    ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-900/30'
                                    : 'hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold text-sm">
                                        {comment.name}{' '}
                                        <span className="text-xs text-muted-foreground ml-2">
                                            {(() => {
                                                if (!comment.displayTimestamp) return '—';
                                                const d = new Date(comment.displayTimestamp);
                                                return isNaN(d.getTime())
                                                    ? comment.displayTimestamp
                                                    : d.toLocaleString();
                                            })()}
                                        </span>
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleReplyToComment(comment)}
                                            className="h-7 text-xs"
                                        >
                                            Reply
                                        </Button>
                                    </div>
                                </div>
                                {parentComment && (
                                    <div
                                        className="
                                                mb-3 p-2 rounded-lg border-l-4 border-muted-foreground/30
                                                cursor-pointer transition-colors hover:bg-muted/50
                                                text-sm
                                            "
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            scrollToComment(comment.parent_id!);
                                        }}
                                        title="Click to jump to parent comment"
                                    >
                                        <p className="font-semibold text-muted-foreground mb-0.5 not-italic truncate">
                                            {parentComment.name}
                                        </p>
                                        <p className="line-clamp-1 text-muted-foreground">
                                            {parentComment.comment || parentComment.fileName || '— Attachment sent.'}
                                        </p>
                                    </div>
                                )}

                                {editingCommentId === comment.id ? (
                                    <div>
                                        <Textarea
                                            value={editingText}
                                            onChange={(e) => setEditingText(e.target.value)}
                                            className="mb-2"
                                        />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handleSaveEdit}>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingCommentId(null)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {renderCommentContent(comment.comment)}
                                        {comment.fileURL &&
                                            comment.fileName &&
                                            renderFileAttachment(comment.fileURL, comment.fileName)}
                                    </>
                                )}
                                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    {canEdit && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleEditComment(comment)}
                                            className="h-auto p-0 font-normal text-muted-foreground hover:text-blue-500"
                                        >
                                            <Edit className="h-3 w-3 mr-1" />
                                            Edit
                                        </Button>
                                    )}

                                    {canEdit && canDelete && <span className="text-gray-400 dark:text-gray-600"> • </span>}

                                    {canDelete && (
                                        <Button
                                            variant="link"
                                            size="sm"
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="h-auto p-0 font-normal text-muted-foreground hover:text-red-500"
                                        >
                                            <Trash2 className="h-3 w-3 mr-1" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={commentsEndRef} />
                </div>

                <div className="p-4 border-t flex-shrink-0 bg-background rounded-b-lg">
                    <div>
                        <div className="flex flex-col items-left mb-2">
                            <label htmlFor={textareaId} className="font-semibold text-sm mb-1">Add a comment</label>
                            {replyingTo && (
                                <div className="p-2 mb-2 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/50 rounded-md flex justify-between items-center">
                                    <div className='truncate pr-2'>
                                        <p className="font-semibold text-green-700 dark:text-green-300 text-sm">Replying to {replyingTo.name}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{replyingTo.comment || replyingTo.fileName || 'Attachment.'}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={handleCancelReply}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Textarea
                                id={textareaId}
                                ref={newCommentTextareaRef}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={`Write your comment here${replyingTo ? ` (Replying to ${replyingTo.name})` : ''}`}
                                rows={4}
                                className='resize-y min-h-[80px]'
                            />
                        </div>



                        {attachedFile && (
                            <div className="mt-2 flex items-center gap-2 p-2 rounded-md border bg-muted text-sm">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium truncate">{attachedFile.name}</span>
                                <span className="text-xs text-muted-foreground ml-auto">({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 shrink-0" onClick={() => setAttachedFile(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-2 ">
                        <div className="flex items-center gap-2">
                            {draft && (
                                <Button variant="link" onClick={handleLoadDraft}>Load Draft</Button>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                            <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={!!attachedFile}>
                                <Paperclip className={`h-5 w-5 ${attachedFile ? 'text-green-500' : ''}`} />
                                <span className="sr-only">Attach file</span>
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleAddComment} disabled={isLoading || (!newComment.trim() && !attachedFile)}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" />
                                        Sending...
                                    </>
                                ) : attachedFile && !newComment.trim() ? (
                                    'Send Attachment'
                                ) : (
                                    'Add Comment'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}