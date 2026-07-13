"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import React from "react";

export interface BreadcrumbItem {
    name: string;
    href?: string;
}

export interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
    return (
        <nav aria-label="Breadcrumb" className={`flex text-sm text-muted-foreground ${className}`}>
            <ol className="flex items-center space-x-2">
                <li>
                    <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                        <Home className="h-4 w-4" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;
                    return (
                        <li key={item.name} className="flex items-center">
                            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
                            {isLast || !item.href ? (
                                <span className="font-medium text-foreground line-clamp-1 max-w-[200px] md:max-w-none" aria-current="page">
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="hover:text-foreground transition-colors line-clamp-1 max-w-[150px] md:max-w-none"
                                >
                                    {item.name}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
