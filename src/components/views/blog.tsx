
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import BlogPostDetails from "./blog-post-details";
import type { BlogPost } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface BlogViewProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const LoadingSkeleton = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(3)].map((_, index) => (
            <Card key={index} className="flex flex-col">
                <CardHeader>
                    <Skeleton className="h-48 w-full rounded-t-lg" />
                    <Skeleton className="h-6 w-3/4 mt-4" />
                </CardHeader>
                <CardContent className="flex-grow space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-6 w-24" />
                </CardFooter>
            </Card>
        ))}
    </div>
);


export default function BlogView({ isOpen, onOpenChange }: BlogViewProps) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        const fetchBlogPosts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const response = await fetch(`${apiBaseUrl}/api/blog-posts`);
                if (!response.ok) {
                    throw new Error("Failed to fetch blog posts.");
                }
                const data = await response.json();
                setBlogPosts(data);
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBlogPosts();
    }
  }, [isOpen]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6">
            <DialogTitle className="text-3xl font-bold text-center mb-4 font-headline">Our Blog</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-full px-6">
              {isLoading ? (
                  <LoadingSkeleton />
              ) : error ? (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map((post, index) => (
                    <Card key={index} className="flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
                        <CardHeader>
                        <Image src={post.image} alt={post.title} width={600} height={400} className="rounded-t-lg" data-ai-hint={post.hint}/>
                        <CardTitle className="pt-4">{post.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{post.excerpt}</p>
                        </CardContent>
                        <CardFooter>
                        <Button variant="link" className="p-0" onClick={() => setSelectedPost(post)}>Read More →</Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
              )}
              <div className="mt-12">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Event Registration
                        <Badge variant="secondary">Coming Soon</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Register for upcoming events and webinars directly from this portal.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        Newsletter Subscription
                        <Badge variant="secondary">Coming Soon</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Stay updated with the latest news and insights. Subscribe to our newsletter!</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <BlogPostDetails post={selectedPost} onOpenChange={(isOpen) => !isOpen && setSelectedPost(null)} />
    </>
  );
}
