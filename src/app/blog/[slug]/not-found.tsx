"use client";

import { usePathname } from "next/navigation";
import BlogAdminGateway from "./blog-admin-gateway";

export default function NotFound() {
    const pathname = usePathname();
    const slug = pathname?.split('/').pop() || "";
    
    // We render BlogAdminGateway here so that the HTTP status is 404 (because notFound() was called),
    // but the client-side component can still check localStorage and fetch the draft blog if the user is an admin.
    return <BlogAdminGateway slug={slug} />;
}
