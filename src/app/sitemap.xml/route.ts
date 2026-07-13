import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const baseUrl = "https://hustloop.com";
    const currentDate = new Date().toISOString();

    const sitemaps = [
        `${baseUrl}/sitemap-pages.xml`,
        `${baseUrl}/sitemap-blog.xml`,
        `${baseUrl}/sitemap-tags.xml`,
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((url) => `
    <sitemap>
        <loc>${url}</loc>
        <lastmod>${currentDate}</lastmod>
    </sitemap>
`).join('')}
</sitemapindex>`;

    return new NextResponse(xml.trim(), {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
