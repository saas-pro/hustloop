import { NextResponse } from 'next/server';
import { getLinkPreview } from 'link-preview-js';
import dns from 'dns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const previewData = await getLinkPreview(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
            },
            resolveDNSHost: async (url: string) => {
                return new Promise((resolve, reject) => {
                    const hostname = new URL(url).hostname;
                    dns.lookup(hostname, (err, address) => {
                        if (err) reject(err);
                        else resolve(address);
                    });
                });
            },
            timeout: 5000,
            followRedirects: 'follow'
        });
        return NextResponse.json(previewData);
    } catch (error: any) {
        // Return 200 with error payload so it doesn't pollute terminal logs with 500s
        return NextResponse.json({ error: error.message || 'Failed to fetch preview', fallback: true }, { status: 200 });
    }
}
