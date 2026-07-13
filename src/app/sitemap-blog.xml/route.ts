import { NextResponse } from "next/server";
import { getPublicBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = "https://hustloop.com";
    const currentDate = new Date().toISOString();

    let blogs: any[] = [];
    try {
        const response = await getPublicBlogs(1, 1000);
        blogs = response?.blogs || [];
    } catch (error) {
        console.error("Error fetching blogs for sitemap:", error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogs.map((blog) => `
    <url>
        <loc>${baseUrl}/blog/${blog.slug}</loc>
        <lastmod>${new Date(blog.updated_at || blog.created_at || currentDate).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
`).join('')}
</urlset>`;

    return new NextResponse(xml.trim(), {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
