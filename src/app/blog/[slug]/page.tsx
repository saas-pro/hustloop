import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/api";
import BlogDetailClient from "./blog-detail-client";

// Allow dynamic params for blog posts not generated at build time
export const dynamicParams = true;
export const revalidate = 60; // Revalidate every 60 seconds

// Generate static params for all blog posts at build time
export async function generateStaticParams() {
    try {
        // Fetch all published blogs for static generation
        const { getPublicBlogs } = await import('@/lib/api');
        const blogsResponse = await getPublicBlogs(1, 100);
        return blogsResponse.blogs.map((blog) => ({
            slug: blog.slug,
        }));
    } catch (error) {
        console.error('Failed to generate static params:', error);
        return [];
    }
}

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
