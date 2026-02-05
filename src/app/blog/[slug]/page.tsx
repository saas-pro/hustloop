import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/api";
import BlogDetailClient from "./blog-detail-client";

// Force Node.js runtime for dynamic rendering on Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0; // Disable caching for now to test


interface BlogPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        const response = await getBlogBySlug(slug);
        const blog = response.blog;

        const title = blog.meta_title || blog.title;
        const description = blog.meta_description || blog.excerpt || blog.content.replace(/<[^>]*>/g, "").substring(0, 160);
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
        return {
            title: "Blog Not Found | Hustloop",
            description: "The requested blog post could not be found.",
        };
    }
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
    try {
        const { slug } = await params;
        const response = await getBlogBySlug(slug);
        return <BlogDetailClient blog={response.blog} />;
    } catch (error) {
        notFound();
    }
}
