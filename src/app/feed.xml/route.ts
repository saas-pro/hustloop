import { NextResponse } from "next/server";
import { getPublicBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = "https://hustloop.com";
    const currentDate = new Date().toUTCString();

    let blogs: any[] = [];
    try {
        const response = await getPublicBlogs(1, 50); // Fetch latest 50 for RSS
        blogs = response?.blogs || [];
    } catch (error) {
        console.error("Error fetching blogs for RSS feed:", error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Hustloop Blog</title>
    <link>${baseUrl}/blog</link>
    <description>The latest insights, articles, and updates from Hustloop.</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${blogs.map((blog) => {
        const title = blog.meta_title || blog.title;
        const description = blog.meta_description || blog.excerpt || "";
        const pubDate = new Date(blog.created_at).toUTCString();
        const url = `${baseUrl}/blog/${blog.slug}`;
        
        return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      ${blog.author ? `<author>${blog.author.email} (${blog.author.name})</author>` : ''}
      ${(blog.tags || []).map((tag: string) => `<category>${tag}</category>`).join('')}
    </item>`;
    }).join('')}
  </channel>
</rss>`;

    return new NextResponse(xml.trim(), {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
