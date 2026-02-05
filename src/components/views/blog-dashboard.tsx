"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    Send,
    FileText,
    Search,
    Filter,
} from "lucide-react";
import {
    getAdminBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    unpublishBlog,
    type BlogPost,
    type CreateBlogData,
} from "@/lib/api";

interface BlogDashboardProps {
    token: string;
}

export default function BlogDashboard({ token }: BlogDashboardProps) {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

    const { toast } = useToast();

    // Fetch blogs
    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAdminBlogs(
                token,
                page,
                10,
                statusFilter === "all" ? undefined : statusFilter
            );
            setBlogs(response.blogs);
            setTotalPages(response.pages);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch blogs",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [token, page, statusFilter, toast]);

    useEffect(() => {
        fetchBlogs();
    }, [page, statusFilter, fetchBlogs]);

    // Handle publish/unpublish
    const handleTogglePublish = async (blog: BlogPost) => {
        try {
            if (blog.status === "published") {
                await unpublishBlog(blog.id, token);
                toast({
                    title: "Success",
                    description: "Blog unpublished successfully",
                });
            } else {
                await publishBlog(blog.id, token);
                toast({
                    title: "Success",
                    description: "Blog published successfully",
                });
            }
            fetchBlogs();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update blog status",
                variant: "destructive",
            });
        }
    };

    // Handle delete
    const handleDelete = async (blogId: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;

        try {
            await deleteBlog(blogId, token);
            toast({
                title: "Success",
                description: "Blog deleted successfully",
            });
            fetchBlogs();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete blog",
                variant: "destructive",
            });
        }
    };

    // Filter blogs by search query
    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 w-[90vw] md:w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Blog Management</h2>
                    <p className="text-muted-foreground">
                        Create and manage your blog posts
                    </p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    New Blog Post
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search blogs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Select
                            value={statusFilter}
                            onValueChange={(value: any) => setStatusFilter(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Blog List */}
            <Card>
                <CardHeader>
                    <CardTitle>Blog Posts</CardTitle>
                    <CardDescription>
                        Manage your blog posts, publish drafts, and edit content
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : filteredBlogs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No blog posts found. Create your first blog post to get started.
                        </div>
                    ) : (
                        <div className="rounded-md border w-[85vw] md:w-full">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-[200px]">Title</TableHead>
                                        <TableHead className="min-w-[100px]">Status</TableHead>
                                        <TableHead className="min-w-[120px]">Author</TableHead>
                                        <TableHead className="min-w-[120px]">Created</TableHead>
                                        <TableHead className="text-right min-w-[140px]">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredBlogs.map((blog) => (
                                        <TableRow key={blog.id}>
                                            <TableCell className="font-medium">
                                                {blog.title}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        blog.status === "published"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {blog.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{blog.author?.name || "Unknown"}</TableCell>
                                            <TableCell>
                                                {new Date(blog.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedBlog(blog);
                                                            setIsEditDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleTogglePublish(blog)}
                                                    >
                                                        {blog.status === "published" ? (
                                                            <FileText className="h-4 w-4" />
                                                        ) : (
                                                            <Send className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(blog.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                            >
                                Previous
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <BlogFormDialog
                isOpen={isCreateDialogOpen || isEditDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    setIsEditDialogOpen(false);
                    setSelectedBlog(null);
                }}
                blog={selectedBlog}
                token={token}
                onSuccess={fetchBlogs}
            />
        </div>
    );
}

// Blog Form Dialog Component
interface BlogFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    blog: BlogPost | null;
    token: string;
    onSuccess: () => void;
}

function BlogFormDialog({
    isOpen,
    onClose,
    blog,
    token,
    onSuccess,
}: BlogFormDialogProps) {
    const [formData, setFormData] = useState<CreateBlogData>({
        title: "",
        excerpt: "",
        content: "",
        featured_image_url: "",
        youtube_embed_url: "",
        meta_title: "",
        meta_description: "",
        tags: "",
    });
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // Populate form when editing
    useEffect(() => {
        if (blog) {
            setFormData({
                title: blog.title,
                excerpt: blog.excerpt || "",
                content: blog.content,
                featured_image_url: blog.featured_image_url || "",
                youtube_embed_url: blog.youtube_embed_url || "",
                meta_title: blog.meta_title || "",
                meta_description: blog.meta_description || "",
                tags: blog.tags?.join(", ") || "",
            });
        } else {
            setFormData({
                title: "",
                excerpt: "",
                content: "",
                featured_image_url: "",
                youtube_embed_url: "",
                meta_title: "",
                meta_description: "",
                tags: "",
            });
        }
    }, [blog]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (blog) {
                await updateBlog(blog.id, formData, token);
                toast({
                    title: "Success",
                    description: "Blog updated successfully",
                });
            } else {
                await createBlog(formData, token);
                toast({
                    title: "Success",
                    description: "Blog created successfully",
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save blog",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{blog ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
                    <DialogDescription>
                        {blog
                            ? "Update your blog post details"
                            : "Fill in the details to create a new blog post"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Title <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                            placeholder="Enter blog title"
                            required
                            maxLength={300}
                        />
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                            id="excerpt"
                            value={formData.excerpt}
                            onChange={(e) =>
                                setFormData({ ...formData, excerpt: e.target.value })
                            }
                            placeholder="Brief summary of the blog post"
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground">
                            {formData.excerpt?.length || 0}/500 characters
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">
                            Content <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="content"
                            value={formData.content}
                            onChange={(e) =>
                                setFormData({ ...formData, content: e.target.value })
                            }
                            placeholder="Write your blog content here (HTML supported)"
                            rows={12}
                            required
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            HTML is supported. Use standard HTML tags for formatting.
                        </p>
                    </div>

                    {/* Featured Image URL */}
                    <div className="space-y-2">
                        <Label htmlFor="featured_image_url">Featured Image URL</Label>
                        <Input
                            id="featured_image_url"
                            type="url"
                            value={formData.featured_image_url}
                            onChange={(e) =>
                                setFormData({ ...formData, featured_image_url: e.target.value })
                            }
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    {/* YouTube Embed URL */}
                    <div className="space-y-2">
                        <Label htmlFor="youtube_embed_url">YouTube Embed URL</Label>
                        <Input
                            id="youtube_embed_url"
                            type="url"
                            value={formData.youtube_embed_url}
                            onChange={(e) =>
                                setFormData({ ...formData, youtube_embed_url: e.target.value })
                            }
                            placeholder="https://www.youtube.com/embed/VIDEO_ID"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData({ ...formData, tags: e.target.value })
                            }
                            placeholder="tech, startup, innovation (comma-separated)"
                        />
                    </div>

                    {/* SEO Section */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4">SEO Metadata</h3>

                        <div className="space-y-4">
                            {/* Meta Title */}
                            <div className="space-y-2">
                                <Label htmlFor="meta_title">Meta Title</Label>
                                <Input
                                    id="meta_title"
                                    value={formData.meta_title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, meta_title: e.target.value })
                                    }
                                    placeholder="SEO-optimized title"
                                    maxLength={60}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.meta_title?.length || 0}/60 characters
                                </p>
                            </div>

                            {/* Meta Description */}
                            <div className="space-y-2">
                                <Label htmlFor="meta_description">Meta Description</Label>
                                <Textarea
                                    id="meta_description"
                                    value={formData.meta_description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, meta_description: e.target.value })
                                    }
                                    placeholder="SEO-optimized description"
                                    rows={3}
                                    maxLength={160}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {formData.meta_description?.length || 0}/160 characters
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Saving..." : blog ? "Update Blog" : "Create Blog"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
