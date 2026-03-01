import { Metadata } from "next";
import { getBlogBySlug, getNextBlogs } from "@/lib/api";
import BlogDetailClient from "./blog-detail-client";
import BlogAdminGateway from "./blog-admin-gateway";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

interface BlogPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        [key: string]: string | string[] | undefined;
    }>;
}

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
    try {
        const { slug } = await params;
        const response = await getBlogBySlug(slug);

        if (!response?.blog) {
            return {
                title: "Blog Not Found | Hustloop",
                description: "The requested blog post could not be found.",
            };
        }

        const blog = response.blog;
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
                images: [{ url: imageUrl, width: 1200, height: 630, alt: blog.title }],
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [imageUrl],
            },
            keywords: blog.tags?.join(", "),
        };
    } catch {
        return {
            title: "Blog Post | Hustloop",
            description: "Read this article on Hustloop.",
        };
    }
}

export default async function BlogDetailPage({ params, searchParams }: BlogPageProps) {
    const { slug } = await params;
    const resolvedParams = await searchParams;
    const needsLogin = resolvedParams?.login === '1';

    // If login=1 is explicitly requested, bypass SSR rendering of the public feed
    // and go straight to the gateway to handle the admin login flow and token fetch.
    if (needsLogin) {
        return <BlogAdminGateway slug={slug} />;
    }

    try {
        // SSR fetch: no token available server-side → returns published blog only
        const response = await getBlogBySlug(slug);

        if (response?.blog) {
            // Also fetch next blogs server-side (returns null if none)
            const nextBlogResponse = await getNextBlogs(slug);
            const nextBlogs = nextBlogResponse?.blogs ?? null;
            const blog = response.blog;

            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: blog.meta_title || blog.title,
                image: [
                    blog.featured_image_url || "https://hustloop.com/default-blog-image.jpg"
                ],
                datePublished: blog.created_at,
                dateModified: blog.updated_at || blog.created_at,
                author: [{
                    "@type": "Person",
                    name: blog.author?.name || "Hustloop Team",
                    url: blog.website_url || blog.linkedin_url || blog.x_url || "https://hustloop.com"
                }]
            };

            // Blog is published → normal render
            return (
                <>
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                    />
                    <BlogDetailClient blog={blog} nextBlogs={nextBlogs} />
                </>
            );
        }
    } catch {
        // Blog not found or not published — fall through
    }

    // Blog not found in public feed (likely draft/pending/rejected).
    // Render the client-side gateway: it reads the token from localStorage,
    // retries with admin auth, and shows login modal if not authenticated.
    return <BlogAdminGateway slug={slug} />;
}
