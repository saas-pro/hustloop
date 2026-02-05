"use client";

import { type BlogPost } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, Share2, ArrowLeft, Sun, Moon, Palette, Check, Home } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import BrandLogo from "@/components/blog/brand-logo";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

function ThemeToggleDropdown() {
    const { theme, setTheme } = useTheme();
    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'purple', label: 'Purple', icon: Palette },
        { value: 'blue', label: 'Blue', icon: Palette },
        { value: 'green', label: 'Green', icon: Palette },
        { value: 'orange', label: 'Orange', icon: Palette },
        { value: 'blue-gray', label: 'Blue Gray', icon: Palette },
    ];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themeOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
                        <option.icon className="mr-2 h-4 w-4" />
                        <span>{option.label}</span>
                        {theme === option.value && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface BlogDetailClientProps {
    blog: BlogPost;
}

export default function BlogDetailClient({ blog }: BlogDetailClientProps) {
    const { toast } = useToast();
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 10) {
                // Always show header at top
                setIsHeaderVisible(true);
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide header
                setIsHeaderVisible(false);
            } else {
                // Scrolling up - show header
                setIsHeaderVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const shareOnLinkedIn = () => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(blog.title);
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            "_blank",
            "width=600,height=400"
        );
    };

    const shareOnTwitter = () => {
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(blog.title);
        window.open(
            `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            "_blank",
            "width=600,height=400"
        );
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast({
                title: "Link copied!",
                description: "Blog link copied to clipboard",
            });
        } catch (error) {
            toast({
                title: "Failed to copy",
                description: "Could not copy link to clipboard",
                variant: "destructive",
            });
        }
    };

    return (
        <>
            {/* Simple Header with Logo */}
            <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300 ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"
                }`}>
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <BrandLogo />
                            <Link href="/">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Home className="h-5 w-5" />
                                </Button>
                            </Link>
                        </div>
                        <ThemeToggleDropdown />
                    </div>
                </div>
            </header>

            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Back Button */}
                        <Link href="/blog">
                            <Button variant="ghost" className="mb-6">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Button>
                        </Link>

                        {/* Article Header */}
                        <article>
                            <header className="mb-8">
                                {/* Tags */}
                                {blog.tags && blog.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {blog.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Title */}
                                <h1 className="text-4xl md:text-5xl font-bold mb-4">{blog.title}</h1>

                                {/* Excerpt */}
                                {blog.excerpt && (
                                    <p className="text-xl text-muted-foreground mb-6">{blog.excerpt}</p>
                                )}

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{blog.author?.name || "Anonymous"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(blog.created_at).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}</span>
                                    </div>
                                </div>

                                {/* Social Share Buttons */}
                                <div className="flex items-center gap-2 pb-6 border-b">
                                    <span className="text-sm font-medium mr-2">Share:</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={shareOnLinkedIn}
                                        className="gap-2"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={shareOnTwitter}
                                        className="gap-2"
                                    >
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                        X (Twitter)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyLink}
                                        className="gap-2"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        Copy Link
                                    </Button>
                                </div>
                            </header>

                            {/* Featured Image */}
                            {blog.featured_image_url && (
                                <div className="relative w-full h-[400px] md:h-[500px] mb-8 rounded-lg overflow-hidden">
                                    <Image
                                        src={blog.featured_image_url}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}

                            {/* YouTube Embed */}
                            {blog.youtube_embed_url && (
                                <div className="relative w-full aspect-video mb-8 rounded-lg overflow-hidden">
                                    <iframe
                                        src={blog.youtube_embed_url}
                                        title="YouTube video"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    />
                                </div>
                            )}

                            {/* Blog Content */}
                            <Card className="mb-8">
                                <CardContent className="pt-6">
                                    <div
                                        className="blog-content max-w-none text-foreground"
                                        dangerouslySetInnerHTML={{ __html: blog.content }}
                                    />
                                </CardContent>
                            </Card>

                            {/* Author Info */}
                            {/* Hustloop Branding & Social */}
                            <Card className="mb-8 relative overflow-hidden">
                                {/* Background Logo with Fade */}
                                <div className="absolute inset-0 opacity-10">
                                    <Image
                                        src="/hustloop_logo.png"
                                        alt="Hustloop Background"
                                        fill
                                        className="object-cover object-left"
                                    />
                                    {/* Fade Overlay - Left to Right */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-background"></div>
                                </div>

                                <CardContent className="pt-6 relative z-10">
                                    <div className="flex items-center justify-between gap-6 flex-wrap">
                                        {/* Logo Section */}
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                                                <Image
                                                    src="/hustloop_logo.png"
                                                    alt="Hustloop"
                                                    width={64}
                                                    height={64}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">Hustloop</h3>
                                            </div>
                                        </div>

                                        {/* Social Media Section */}
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="text-sm font-medium">Follow us for more blogs</p>
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href="https://linkedin.com/company/hustloop"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                                    </svg>
                                                </a>
                                                <a
                                                    href="https://twitter.com/hustloop"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                                    </svg>
                                                </a>
                                                <a
                                                    href="https://instagram.com/hustloop_official"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Bottom Share */}
                            <div className="flex items-center justify-between pt-6 border-t">
                                <Link href="/blog">
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Blog
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium mr-2">Share:</span>
                                    <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
                                        LinkedIn
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                                        X
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={copyLink}>
                                        Copy
                                    </Button>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>
        </>
    );
}
