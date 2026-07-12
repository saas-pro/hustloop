"use client";

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LinkPreviewProps {
    url: string;
    title?: string;
    isLinkedin?: boolean;
}

export default function LinkPreview({ url, title, isLinkedin = true }: LinkPreviewProps) {
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Normalize linkedin embed to standard url if needed
    // LinkedIn stores embeds as /embed/feed/update/urn:li:...
    // The canonical post url is /feed/update/urn:li:...
    const fetchUrl = url.includes('/embed/feed/update/') ? url.replace('/embed/feed/update/', '/feed/update/') : url;

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                setLoading(true);
                // Directly use microlink API to get the rich data for LinkedIn
                const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(fetchUrl)}`);
                if (!res.ok) {
                    setError(true);
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                if (data.status !== 'success') {
                    setError(true);
                    setLoading(false);
                    return;
                }

                // Map microlink data to our expected format
                setPreview({
                    title: data.data.title,
                    description: data.data.description,
                    images: data.data.image?.url ? [data.data.image.url] : [],
                    siteName: data.data.publisher
                });
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (url) {
            fetchPreview();
        }
    }, [url, fetchUrl]);

    const displayTitle = title || "View Post on LinkedIn";
    const domain = isLinkedin ? "www.linkedin.com" : new URL(fetchUrl).hostname;

    if (loading) {
        return (
            <div className="w-full h-24 mb-8 rounded-lg bg-[#202c33]/5 border border-border/40 flex items-center justify-center shadow-sm">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const fetchedTitle = preview?.title || displayTitle;
    const description = preview?.description || "";
    const image = preview?.images && preview.images.length > 0 ? preview.images[0] : null;

    return (
        <a href={fetchUrl} target="_blank" rel="noopener noreferrer" className="block w-full mb-8 group">
            <div className="flex flex-row overflow-hidden rounded-xl bg-card border border-border/40 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300 max-h-[100px] group-hover:-translate-y-1">
                {/* Left Side: Square Image (if available) */}
                {image && (
                    <div className="w-[100px] h-[100px] shrink-0 bg-muted relative border-r border-border/40 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={image} 
                            alt={fetchedTitle} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Right Side: Content */}
                <div className="flex flex-col flex-1 px-4 py-3 justify-center min-w-0 bg-gradient-to-r from-transparent to-transparent group-hover:from-primary/5 transition-colors duration-300">
                    <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {/* Render HTML entities if any */}
                        <span dangerouslySetInnerHTML={{ __html: fetchedTitle }} />
                    </h4>

                    {description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5 leading-relaxed">
                            <span dangerouslySetInnerHTML={{ __html: description }} />
                        </p>
                    )}

                    <span className="text-[10px] text-muted-foreground/80 font-medium">
                        {domain}
                    </span>
                </div>
            </div>
        </a>
    );
}
