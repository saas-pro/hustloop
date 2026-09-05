import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, Eye } from "lucide-react";
import { API_BASE_URL, resetBlogViews } from "@/lib/api";

export default function BlogViewsManagement({ token }: { token: string }) {
    const { toast } = useToast();
    const [blogs, setBlogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [resettingSlug, setResettingSlug] = useState<string | null>(null);

    const fetchBlogs = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/blogs?page=1&per_page=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setBlogs(data.blogs || []);
            }
        } catch (error) {
            console.error("Error fetching blogs", error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchBlogs();
        }
    }, [token, fetchBlogs]);

    const handleResetViews = async (slug: string) => {
        setResettingSlug(slug);
        try {
            const res = await resetBlogViews(slug, token);
            if (res.success) {
                toast({ title: "Success", description: "Blog views reset successfully." });
                // Update local state instead of refetching everything
                setBlogs(prev => prev.map(blog => blog.slug === slug ? { ...blog, views: 0 } : blog));
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Failed to reset views" });
        } finally {
            setResettingSlug(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Blog Views Management</h1>
                <p className="text-muted-foreground">Monitor and reset view counts for all blog posts.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Blog Posts</CardTitle>
                    <CardDescription>A complete list of blogs and their total views.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="rounded-md border border-border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead className="text-right">Views</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {blogs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                No blogs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        blogs.map((blog) => (
                                            <TableRow key={blog.id}>
                                                <TableCell className="font-medium">{blog.title}</TableCell>
                                                <TableCell className="text-muted-foreground">{blog.slug}</TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    {blog.views || 0}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleResetViews(blog.slug)}
                                                        disabled={resettingSlug === blog.slug || (blog.views || 0) === 0}
                                                    >
                                                        {resettingSlug === blog.slug ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <RefreshCw className="h-4 w-4 mr-2" />
                                                        )}
                                                        Reset Views
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
