"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function ZohoChatbot() {
    const pathname = usePathname();
    const isBlog = pathname?.startsWith("/blog");

    useEffect(() => {
        try {
            if (typeof window !== "undefined" && (window as any).$zoho?.salesiq) {
                const zoho = (window as any).$zoho.salesiq;
                if (isBlog) {
                    zoho.floatbutton?.visible?.("hide");
                    zoho.floatwindow?.visible?.("hide");
                    zoho.chatwindow?.close?.();
                } else {
                    zoho.floatbutton?.visible?.("show");
                    // Ensure the full chat window does not pop open automatically
                    zoho.floatwindow?.visible?.("hide");
                    zoho.chatwindow?.close?.();
                }
            }
        } catch (e) {}
    }, [isBlog, pathname]);

    return (
        <>
            {isBlog && (
                <style dangerouslySetInnerHTML={{
                    __html: `
                        #zsiq_float,
                        #zsiq_mfloat,
                        .zsiq_floatmain,
                        .zsiq_theme1,
                        div[id^="zsiq"],
                        iframe[id^="siq"],
                        iframe[name^="siq"] {
                            display: none !important;
                            visibility: hidden !important;
                            opacity: 0 !important;
                            pointer-events: none !important;
                        }
                    `
                }} />
            )}

            <Script
                id="zsiq-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}};`,
                }}
            />
            <Script
                id="zsiqscript"
                src="https://salesiq.zohopublic.in/widget?wc=siq770fac757336897d739f9273d8f8f7b3aec5f63c512be52582e5f9e3440d863b"
                strategy="afterInteractive"
            />
        </>
    );
}


