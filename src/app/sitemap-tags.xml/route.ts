import { NextResponse } from "next/server";
import { getPublicBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = "https://hustloop.com";
    const currentDate = new Date().toISOString();

    let tags = new Set<string>();
    try {
        const response = await getPublicBlogs(1, 1000);
        const blogs = response?.blogs || [];
        blogs.forEach(blog => {
            if (blog.tags) {
                blog.tags.forEach(tag => tags.add(tag));
            }
        });
    } catch (error) {
        console.error("Error fetching blogs for tags sitemap:", error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Array.from(tags).map((tag) => `
    <url>
        <loc>${baseUrl}/blog?tags=${encodeURIComponent(tag)}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>
`).join('')}
</urlset>`;

    return new NextResponse(xml.trim(), {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
