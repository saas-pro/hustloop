import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = "https://hustloop.com";
    const currentDate = new Date().toISOString();

    const staticPages = [
        { url: baseUrl, changefreq: "daily", priority: 1.0 },
        { url: `${baseUrl}/pricing`, changefreq: "monthly", priority: 0.9 },
        { url: `${baseUrl}/blog`, changefreq: "daily", priority: 0.9 },
        { url: `${baseUrl}/contact-us`, changefreq: "monthly", priority: 0.8 },
        { url: `${baseUrl}/incentive-challenge`, changefreq: "monthly", priority: 0.8 },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
    <url>
        <loc>${page.url}</loc>
        <lastmod>${currentDate}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>
`).join('')}
</urlset>`;

    return new NextResponse(xml.trim(), {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
