import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/api";
import BlogDetailClient from "./blog-detail-client";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

interface BlogPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        const response = await getBlogBySlug(slug);

        if (!response?.blog) {
            if (typeof window === 'undefined') {
                console.warn(`[Metadata] No blog found for slug: ${slug}`);
            }
            return {
                title: "Blog Not Found | Hustloop",
                description: "The requested blog post could not be found.",
            };
        }

        const blog = response.blog;
        // ... (title/description logic remains unchanged)
        const title = blog.meta_title || blog.title;
        const description =
            blog.meta_description ||
            blog.excerpt ||
            blog.content?.replace(/<[^>]*>/g, "").substring(0, 160) ||
            "Read this article on Hustloop.";

        const imageUrl = blog.featured_image_url || "/default-blog-image.jpg";

        return {
            title: `${title} | Hustloop Blog`,
            description,
            openGraph: {
                title,
                description,
                type: "article",
                publishedTime: blog.created_at,
                modifiedTime: blog.updated_at,
                authors: [blog.author?.name || "Hustloop Team"],
                images: [
                    {
                        url: imageUrl,
                        width: 1200,
                        height: 630,
                        alt: blog.title,
                    },
                ],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [imageUrl],
            },
            keywords: blog.tags?.join(", "),
        };
    } catch (error) {
        if (typeof window === 'undefined') {
            console.error(`[Metadata Error] Failed for slug:`, error);
        }
        return {
            title: "Blog Not Found | Hustloop",
            description: "The requested blog post could not be found.",
        };
    }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
    let currentSlug = '';
    try {
        const { slug } = await params;
        currentSlug = slug;

        if (typeof window === 'undefined') {
            console.log(`[BlogPage] Fetching blog for slug: ${slug}`);
        }

        const response = await getBlogBySlug(slug);

        if (!response?.blog) {
            if (typeof window === 'undefined') {
                console.warn(`[BlogPage] Blog response empty for slug: ${slug}`);
            }
            notFound();
        }

        return <BlogDetailClient blog={response.blog} />;
    } catch (error) {
        if (typeof window === 'undefined') {
            console.error(`[BlogPage Error] Failed for slug: ${currentSlug}`, error);
        }
        notFound();
    }
}
