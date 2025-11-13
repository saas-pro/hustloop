'use client';

import { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, MessageCircle, HelpCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import QuillEditor from './quillEditor';
import QAItemViewer from './QAItemViewer';
import { toast } from '@/hooks/use-toast';
import { set } from 'date-fns';
import { jwtDecode } from "jwt-decode";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog';

interface QAItem {
    id: string;
    author: string;
    parent_id:string|null
    author_id: string;
    user_id: string;
    isOrganizer?: boolean;
    timestamp: string;
    text: string;
    attachment?: { name: string; url: string; type: 'image' | 'doc' | 'pdf' };
    replies: QAItem[];
}

interface QAForumProps {
    collaborationId: string;
}

const QAReplyForm = ({
    parentId,
    onAddReply,
    onCancel,
}: {
    parentId: string;
    onAddReply: (text: string, file: File | null) => void;
    onCancel: () => void;
}) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [newFile, setNewFile] = useState<File | null>(null);

    const handleCancel = () => {
        setNewFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = () => {
        if (text.trim() || file) {
            onAddReply(text, file);
            setText('');
            setFile(null);
            onCancel();
        }
    };

    return (
        <div className="ml-8 mt-2 space-y-2 border-l-2 pl-4">
            <QuillEditor
                value={text}
                onChange={setText}
                placeholder="Ask your question here..."
                height="150px"
            />
            <div className="flex justify-between items-center">
                <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                />
                <div className='flex items-center gap-2'>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className="h-4 w-4" />
                    </Button>
                    {newFile && <p className="text-xs text-muted-foreground">Selected: {newFile.name}</p>}
                    {newFile && (
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            className="text-xs"
                        >
                            Cancel
                        </Button>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSubmit}>
                        Reply
                    </Button>
                </div>
            </div>
        </div>
    );
};

const QAItemView = ({
    item,
    onReply,
    replyingTo,
    setReplyingTo,
    onAddReply,
    onDelete,
    onUpdate,

}: {
    item: QAItem;
    onReply: (id: string) => void;
    replyingTo: string | null;
    setReplyingTo: (id: string | null) => void;
    onAddReply: (parentId: string, text: string, file: File | null) => void;
    onDelete: (id: string) => void;
    onUpdate: (itemId: string, updatedText: string, newFile: File | null, removeExistingAttachment: boolean) => void;
}) => {

    const [isAuthor, setIsAuthorOrAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(item.text);
    const [editFile, setEditFile] = useState<File | null>(null);
    const [removeAttachment, setRemoveAttachment] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const getCurrentUserInfo = (): { userId: string | null; roles: string[] } => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload: { user_id: string; role: string[] } = jwtDecode(token);
                return {
                    userId: payload.user_id || null,
                    roles: payload.role || [],
                };
            } catch (e) {
                console.error("Failed to decode token:", e);
            }
        }
        return { userId: null, roles: [] };
    };

    useEffect(() => {
        const { userId, roles } = getCurrentUserInfo();

        if (!userId) {
            setIsAuthorOrAdmin(false);
            return;
        }

        if (item.author_id === userId || roles.includes("admin")) {
            setIsAuthorOrAdmin(true);
        } else {
            setIsAuthorOrAdmin(false);
        }
    }, [item.author_id]);

    useEffect(() => {
        if (isEditing) {
            setEditText(item.text);
            setEditFile(null);
            setRemoveAttachment(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }, [isEditing, item.text]);
    const handleSaveEdit = () => {
        onUpdate(item.id, editText, editFile, removeAttachment);
        setIsEditing(false);
        setEditFile(null);
        setRemoveAttachment(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(item.text);
        setEditFile(null);
        setRemoveAttachment(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFile(e.target.files?.[0] || null);
        setRemoveAttachment(false);
    };

    const handleRemoveCurrentAttachment = () => {
        setRemoveAttachment(true);
        setEditFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex gap-3">
            <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Avatar className="h-6 w-6">
                        <AvatarFallback>{item.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span
                        className={`font-semibold ${item.isOrganizer ? 'text-primary' : 'text-foreground'}`}
                    >
                        {item.author}
                    </span>
                    {item.isOrganizer && <Badge variant="secondary">Organizer</Badge>}
                    <span>• {item.timestamp}</span>
                </div>
                <QAItemViewer html={item.text} />

                {isEditing ? (
                    <div className="space-y-2">
                        <QuillEditor
                            key={`edit-${item.id}`}
                            value={editText}
                            onChange={setEditText}
                            placeholder="Edit your question/reply..."
                            height="150px"
                        />
                        <div className="flex justify-between items-center">
                            <Input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                {editFile && <p className="text-xs text-muted-foreground">New: {editFile.name}</p>}
                                {item.attachment && !editFile && !removeAttachment && (
                                    <p className="text-xs text-muted-foreground">Current: {item.attachment.name}</p>
                                )}
                                {removeAttachment && <p className="text-xs text-muted-foreground">Attachment will be removed</p>}

                                {item.attachment && !removeAttachment && (
                                    <Button
                                        variant="destructive"
                                        size="default"
                                        onClick={handleRemoveCurrentAttachment}
                                        className="text-xs"
                                    >
                                        Remove Current
                                    </Button>
                                )}
                                {editFile && (
                                    <Button
                                        variant="destructive"
                                        size="default"
                                        onClick={() => { setEditFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                        className="text-xs"
                                    >
                                        Cancel New File
                                    </Button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveEdit}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {item.attachment && (
                            <a
                                href={item.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 ml-2 flex items-center gap-2 text-sm text-blue-500 hover:underline"
                            >
                                <Paperclip className="h-4 w-4" />
                                {item.attachment.name}
                            </a>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={() => onReply(item.id)}
                            >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Reply
                            </Button>

                            {isAuthor && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs text-red-500 hover:text-red-600"
                                        onClick={() => onDelete(item.id)}
                                    >
                                        Delete
                                    </Button>
                                </>
                            )}
                        </div>
                    </>
                )}


                {replyingTo === item.id && (
                    <QAReplyForm
                        parentId={item.id}
                        onCancel={() => setReplyingTo(null)}
                        onAddReply={(text, file) => onAddReply(item.id, text, file)}
                    />
                )}

                <div className="mt-4 space-y-4 border-l-2 pl-4">
                    {item.replies.map((reply) => (
                        <QAItemView
                            key={reply.id}
                            item={reply}
                            onReply={onReply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            onAddReply={onAddReply}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ))}
                </div>

            </div>
        </div>
    );
};

export function QAForum({ collaborationId }: QAForumProps) {
    const [qaData, setQaData] = useState<QAItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [newFile, setNewFile] = useState<File | null>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const openDeleteDialog = (id: string) => {
        setDeleteId(id);
    };

    useEffect(() => {
        if (!collaborationId) return;
        const fetchQA = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_BASE_URL}/api/qa/${collaborationId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await res.json();

                setQaData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchQA();
    }, [collaborationId]);

    const addReplyToItem = (items: QAItem[], parentId: string, newReply: QAItem): QAItem[] => {
        return items.map((item) => {
            if (item.id === parentId) {
                return { ...item, replies: [...item.replies, newReply] };
            }
            if (item.replies.length > 0) {
                return { ...item, replies: addReplyToItem(item.replies, parentId, newReply) };
            }
            return item;
        });
    };

    const handlePostQuestion = async () => {
        if (!newQuestion.trim() && !newFile) return;

        const formData = new FormData();
        formData.append('text', newQuestion);
        formData.append('collaboration_id', String(collaborationId));
        if (newFile) formData.append('attachment', newFile);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/qa`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
        });

        if (!res.ok) return console.error('Failed to post question');

        const newItem = await res.json();
        setQaData((prev) => [newItem, ...prev]);
        setNewQuestion('');
        setNewFile(null);
    };

    const handleAddReply = async (parentId: string, text: string, file: File | null) => {
        if (!text.trim() && !file) return;

        const formData = new FormData();
        formData.append('text', text);
        formData.append('collaboration_id', String(collaborationId));
        formData.append('parent_id', String(parentId));
        if (file) formData.append('attachment', file);
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/qa`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData,
        });

        const newReply = await res.json();
        setQaData((prev) => addReplyToItem(prev, parentId, newReply));
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        setIsDeleting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/qa/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const error = await res.json();
                toast({
                    variant: "destructive",
                    title: "Delete failed",
                    description: error.message || "Something went wrong. Please try again.",
                });
                return;
            }

            const removeItem = (items: QAItem[]): QAItem[] =>
                items
                    .filter((i) => i.id !== deleteId)
                    .map((i) => ({
                        ...i,
                        replies: removeItem(i.replies),
                    }));

            setQaData((prev) => removeItem(prev));

            toast({
                title: "Deleted successfully",
                description: "The question has been removed.",
            });
        } catch (err) {
            console.error("Error deleting item:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete the question. Please try again later.",
            });
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    };

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleCancel = () => {
        setNewFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    const updateItemInTree = (items: QAItem[], updatedItem: QAItem): QAItem[] => {
        return items.map((item) => {
            if (item.id === updatedItem.id) {
                return updatedItem;
            }
            if (item.replies.length > 0) {
                return { ...item, replies: updateItemInTree(item.replies, updatedItem) };
            }
            return item;
        });
    };

    const handleUpdateItem = async (
        itemId: string,
        updatedText: string,
        newFile: File | null,
        removeExistingAttachment: boolean
    ) => {
        const formData = new FormData();
        formData.append('text', updatedText);
        formData.append('collaboration_id', String(collaborationId));
        if (newFile) {
            formData.append('attachment', newFile);
        } else if (removeExistingAttachment) {
            formData.append('remove_attachment', 'true');
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/qa/${itemId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                toast({
                    variant: "destructive",
                    title: "Update failed",
                    description: error.message || "Something went wrong. Please try again.",
                });
                return;
            }

            const updatedItem = await res.json();
            setQaData((prev) => updateItemInTree(prev, updatedItem));
            toast({
                title: "Updated successfully",
                description: "Your item has been updated.",
            });
        } catch (err) {
            console.error("Error updating item:", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update the item. Please try again later.",
            });
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-6 w-6" />
                    Q&amp;A Forum
                </CardTitle>
                <CardDescription>Ask questions, get answers, and engage with the community.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-3 p-4 border rounded-lg bg-background">
                    <h4 className="font-semibold">Ask a Question</h4>
                    <QuillEditor
                        value={newQuestion}
                        onChange={setNewQuestion}
                        placeholder="Ask your question here..."
                        height="150px"
                    />

                    <div className="flex gap-2 items-center justify-between">
                        <div className='flex items-center gap-2'>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                            />

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>

                            {newFile && (
                                <Button
                                    variant="destructive"
                                    onClick={handleCancel}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>

                        <div className="flex-grow" />
                        <Button onClick={handlePostQuestion}>
                            Post Question
                        </Button>
                    </div>

                </div>
                {newFile && <p className="text-xs text-muted-foreground">Selected: {newFile.name}</p>}

                <Separator />

                {loading ? (
                    <p className="text-center text-muted-foreground">Loading Q&amp;A...</p>
                ) : qaData.length === 0 ? (
                    <p className="text-center text-muted-foreground">No questions yet.</p>
                ) : (
                    <div className="space-y-6">
                        {qaData.map((item) => (
                            <QAItemView
                                key={item.id}
                                item={item}
                                onReply={setReplyingTo}
                                replyingTo={replyingTo}
                                setReplyingTo={setReplyingTo}
                                onAddReply={handleAddReply}
                                onDelete={openDeleteDialog}
                                onUpdate={handleUpdateItem}
                            />
                        ))}
                    </div>
                )}

                <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Question?</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. Are you sure you want to delete this question?
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>
                                Cancel
                            </Button>

                            <Button
                                variant="destructive"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card >
    );
}
