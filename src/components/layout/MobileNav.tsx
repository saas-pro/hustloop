
"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import React from 'react'
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette, Check, Loader2, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { View } from '@/app/types';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Separator } from '@radix-ui/react-separator';
import Image from 'next/image';


interface MobileNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    isLoading: boolean;
    isStaticPage?: boolean;
    heroVisible?:boolean

}

const navItems: { id: View; label: string; loggedIn?: boolean }[] = [
    { id: "mentors", label: "Mentors" },
    { id: "incubators", label: "Incubators" },
    { id: "msmes", label: "MSMEs" },
    { id: "education", label: "Education" },
    { id: "pricing", label: "Pricing" },
    { id: "blog", label: "Blog" },
];




export function ThemeToggleDropdown({heroVisible}:MobileNavProps) {
    const { theme, setTheme } = useTheme();
    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'purple', label: 'Purple', icon: Palette },
        { value: 'blue', label: 'Blue', icon: Palette },
        { value: 'green', label: 'Green', icon: Palette },
        { value: 'orange', label: 'Orange', icon: Palette },
        { value: 'blue-gray', label: 'Blue Gray', icon: Palette },
    ];
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={`${heroVisible && "text-white"} text-current`}>
                    <Sun className={`h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 `} />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {themeOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onClick={() => setTheme(option.value)}>
                        <option.icon className="mr-2 h-4 w-4" />
                        <span>{option.label}</span>
                        {theme === option.value && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>)
}

const MobileNav = ({ activeView, setActiveView, isLoggedIn, onLogout, isLoading, isStaticPage = false ,heroVisible}: MobileNavProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const [isNavigating, setIsNavigating] = React.useState(false);

    const preloadRecaptcha = () => {
        const scriptId = 'recaptcha-preload-link';
        if (!document.getElementById(scriptId)) {
            const link = document.createElement('link');
            link.id = scriptId;
            link.rel = 'preload';
            link.as = 'script';
            link.href = 'https://www.google.com/recaptcha/enterprise.js?render=6LfZ4H8rAAAAAA0NMVH1C-sCiE9-Vz4obaWy9eUI';
            document.head.appendChild(link);
        }
    };
    const BrandLogo = ({ inSheet = false }: { inSheet?: boolean }) => {
        if (isNavigating) {
            return (
                <div className="flex items-center gap-3 h-[40px]">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">Loading...</span>
                </div>
            );
        }

        return (

            <div
                className="flex flex-col items-center gap-3 cursor-pointer"
                onClick={handleLogoClick}
            >
                <Image
                    src="/logo.png"
                    alt="Hustloop logo"
                    width={120}
                    height={48}
                    className="h-12 w-auto min-w-[120px] max-w-[200px] object-contain"
                />
                {!inSheet && (
                    <div>
                        <Separator orientation="vertical" className="h-6 bg-border" />
                        <p className="text-xs text-muted-foreground">
                            Smart hustle. <br /> Infinite growth..
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const handleAuthClick = (view: 'login' | 'signup') => {
        preloadRecaptcha();
        setActiveView(view);
    };

    const handleLogoClick = () => {
        if (pathname === '/terms-of-service' || pathname === '/privacy-policy') {
            setIsNavigating(true);
            router.push('/');
        } else {
            setActiveView("home");
        }
    };

    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement, MouseEvent>, sectionId: string) => {

        if (pathname !== '/') {
            router.push('/');
            setTimeout(() => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });

                }
            }, 500); // Wait for page to potentially load
        } else {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });

            }
        }
    };
    return (
        <div>
            <div className="md:hidden fixed flex top-6 right-4 z-50 pointer-events-auto text-current">
                <div>
                    <ThemeToggleDropdown heroVisible={heroVisible} activeView={"home"} setActiveView={function (view: View): void {
                        throw new Error("Function not implemented.");
                    } } isLoggedIn={false} onLogout={function (): void {
                        throw new Error("Function not implemented.");
                    } } isLoading={false}/>
                </div>
                {!isStaticPage ? (

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className={`h-6 w-6 text-current`}  />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]" showCloseButton={false}>
                            <div className="flex items-center justify-between mb-8">
                                <SheetClose asChild>
                                    <BrandLogo inSheet={true} />
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10">
                                        <X className="h-6 w-6" />
                                        <span className="sr-only">Close</span>
                                    </Button>
                                </SheetClose>
                            </div>

                            <nav className="flex flex-col space-y-2">
                                {navItems
                                    .filter((item) => !item.loggedIn || isLoggedIn)
                                    .map((item) => (
                                        <SheetClose key={item.id} asChild>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setActiveView(item.id)}
                                                className={cn(
                                                    "justify-start text-lg",
                                                    activeView === item.id ? "text-primary" : "text-muted-foreground"
                                                )}
                                            >
                                                {item.label}
                                            </Button>
                                        </SheetClose>
                                    ))}
                                <Separator className="ms-3 w-[42%] h-0.5 bg-border"></Separator>

                                <SheetClose asChild >
                                    <Button
                                        variant="ghost"
                                        onClick={(e) => handleScrollToSection(e, 'newsletter-section')}
                                        className="justify-start text-lg text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Early Bird
                                    </Button>
                                </SheetClose>


                                <SheetClose asChild >
                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="justify-start  text-lg text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <a
                                            onClick={(e) => {
                                                handleScrollToSection(e, "contact-section");
                                            }}
                                        >
                                            Contact Us
                                        </a>
                                    </Button>

                                </SheetClose>
                            </nav>

                            <div className="absolute bottom-6 left-6 right-6">
                                {isLoading ? (
                                    <div className="flex justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : isLoggedIn ? (
                                    <div className="flex items-center justify-between">
                                        <SheetClose asChild>
                                            <Button variant="ghost" size="icon" onClick={() => setActiveView('dashboard')}>
                                                <UserCircle className="h-8 w-8" />
                                                <span className="sr-only">Dashboard</span>
                                            </Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button variant="outline" onClick={onLogout}>
                                                <LogOut className="mr-2 h-5 w-5" /> Logout
                                            </Button>
                                        </SheetClose>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <SheetClose asChild>
                                            <Button className="w-full" onClick={() => handleAuthClick('login')}>Login</Button>
                                        </SheetClose>
                                        <SheetClose asChild>
                                            <Button variant="secondary" className="w-full" onClick={() => handleAuthClick('signup')}>Sign Up</Button>
                                        </SheetClose>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>
                ) : null}
            </div>
        </div>
    )
}

export default MobileNav
