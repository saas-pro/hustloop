
"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import React, { use, useEffect, useRef, useState } from 'react'
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette, Check, Loader2, UserCircle, LogOut, Droplet, Leaf, Flame, Cloud, Mail, ShoppingCart } from 'lucide-react';
import { View } from '@/app/types';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from "next/navigation";
import { Separator } from '@radix-ui/react-separator';
import gsap from 'gsap';



interface DesktopNavProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isLoggedIn: boolean;
    onLogout: () => void;
    isLoading: boolean;
    isStaticPage?: boolean;
    navOpen?: boolean;
    setNavOpen: (value: boolean) => void;
    heroVisible?: boolean
}

const navItems: { id: View; label: string; loggedIn?: boolean }[] = [
    { id: "mentors", label: "Mentors" },
    { id: "incubators", label: "Incubators" },
    { id: "msmes", label: "MSMEs" },
    { id: "education", label: "Education" },
    { id: "pricing", label: "Pricing" },
    { id: "blog", label: "Blog" },
];


export function ThemeToggleDropdown() {
    const { theme, setTheme } = useTheme();
    const themeOptions = [
        { value: 'light', label: 'Light', icon: Palette },
        { value: 'dark', label: 'Dark', icon: Palette },
        { value: 'purple', label: 'Purple', icon: Palette },
        { value: 'blue', label: 'Blue', icon: Palette },
        { value: 'green', label: 'Green', icon: Palette },
        { value: 'orange', label: 'Orange', icon: Palette },
        { value: 'blue-gray', label: 'Blue Gray', icon: Palette },
    ];




    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="relative flex items-center justify-center w-[3.5rem] h-[3.5rem] rounded-xl border border-solid box-border cursor-pointer hover:bg-accent/20 transition-colors"
                >
                    <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-accent" />
                    <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-accent" />
                    <span className="sr-only">Toggle theme</span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {themeOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                    >
                        <option.icon className="mr-2 h-4 w-4" />
                        <span>{option.label}</span>
                        {theme === option.value && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const DesktopNav = ({ navOpen, setNavOpen, activeView, heroVisible, setActiveView, isLoggedIn, onLogout, isLoading, isStaticPage = false }: DesktopNavProps) => {
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
    const hideMarketplace =
        pathname === "/privacy-policy" || pathname === "/terms-of-service" || pathname ==="/aignite";
    const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        e.preventDefault();
        if (pathname !== '/') {
            router.push('/');
            setTimeout(() => {
                const section = document.getElementById(sectionId);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    document.body.classList.remove('nav-open');
                    setNavOpen(false);
                }
            }, 500); // Wait for page to potentially load
        } else {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
                document.body.classList.remove('nav-open');
                setNavOpen(false);
            }
        }
    };
    const btnRef = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (!btnRef.current) return;

        const shakeHamburger = () => {
            if (navOpen) return; // Stop shaking when nav is open
            const tl = gsap.timeline();
            tl.fromTo(
                btnRef.current,
                { rotation: -6, scale: 1 },
                {
                    rotation: 6,
                    scale: 1.05,
                    duration: 0.05,
                    repeat: 5,
                    yoyo: true,
                    ease: "power1.inOut",
                }
            ).to(btnRef.current, {
                rotation: 0,
                scale: 1,
                duration: 0.1,
                ease: "power1.out",
            });
        };

        // Shake every 1 second
        const interval = setInterval(shakeHamburger, 1000);

        return () => clearInterval(interval);
    }, [navOpen]);

    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const button = buttonRef.current;
        if (!container || !button) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const offsetX = (x / rect.width) * 20;
            const offsetY = (y / rect.height) * 20;

            gsap.to(button, {
                x: offsetX,
                y: offsetY,
                duration: 0.3,
                ease: "power2.out",
            });
        };

        const handleMouseLeave = () => {
            gsap.to(button, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
            });
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [isLoading, isLoggedIn]);

    const email = "support@hustloop.com"
    return (
        <div>
            <div className="toggle fixed z-50">
                {/* Magnetic CTA Button */}
                <div className='flex justify-end fixed items-center gap-8 right-4 top-5'>

                    <div className={cn("hidden md:flex relative pointer-events-auto", (heroVisible && !navOpen) ? 'items-center gap-4' : '')}>
                        {!isStaticPage && pathname !== "/terms-of-service" && pathname !== "/privacy-policy" && pathname !== "/aignite" &&(
                            <>
                                {!hideMarketplace && (<button
                                    onClick={() => setActiveView('marketplace')}
                                    className={cn(
                                        'font-medium w-32 h-14 transition-all duration-300 backdrop-blur-md rounded-xl border border-solid',
                                        'bg-white/10',
                                        (heroVisible && !navOpen) ? 'text-white ' : 'hidden',
                                    )}
                                >
                                    Marketplace
                                </button>)}
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                ) : isLoggedIn ? (
                                    <>

                                        <div className="inline-flex rounded-xl border border-solid backdrop-blur-md bg-white/10">
                                            <button
                                                onClick={() => setActiveView('dashboard')}
                                                className="w-14 h-14 flex items-center justify-center"
                                                style={{ color: (heroVisible && !navOpen) ? "white" : "CurrentColor", transition: "none" }}
                                            >
                                                <UserCircle className="h-6 w-6" />
                                                <span className="sr-only">Dashboard</span>
                                            </button>

                                            <button
                                                onClick={onLogout}
                                                className="w-14 h-14 flex items-center justify-center border-l border-solid"
                                                style={{ color: (heroVisible && !navOpen) ? "white" : "CurrentColor", transition: "none" }}
                                            >
                                                <LogOut className="h-6 w-6" />
                                                <span className="sr-only">Logout</span>
                                            </button>

                                        </div>
                                    </>


                                ) : (
                                    <div
                                        ref={containerRef}
                                        className='flex gap-2 items-center'
                                    >
                                        <button
                                            onClick={() => handleAuthClick('login')}
                                            ref={buttonRef}
                                            className='login-btn bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 py-2'
                                        >
                                            Login
                                        </button>
                                    </div>

                                )}


                            </>
                        )}

                    </div>
                    {/* Menu Button */}
                    <div className="flex items-center justify-center">
                        <button
                            id="menu-button"
                            ref={btnRef}
                            aria-label="Menu"
                            onClick={() => {
                                document.body.classList.toggle("nav-open");
                                setNavOpen(!navOpen);
                            }}
                            className="relative xl:inline-block w-[3.5rem] h-[3.5rem] rounded-xl border border-solid backdrop-blur-md bg-white/10 pointer-events-auto flex items-center justify-center"
                        >
                            <svg
                                className={`ham hamRotate pointer-events-auto w-[3.5rem] h-[3.5rem] select-none transition-colors relative duration-300 ${heroVisible && !navOpen ? "stroke-white" : "stroke-black"
                                    }`}
                                viewBox="0 0 100 100"
                                width="80"
                            >
                                <path className="line top transition-colors duration-300" stroke={(heroVisible && !navOpen) ? "white" : "CurrentColor"} d="m 70,33 h -40 c 0,0 -8.5,-0.149796 -8.5,8.5 0,8.649796 8.5,8.5 8.5,8.5 h 20 v -20" />
                                <path className="line middle transition-colors duration-300" stroke={(heroVisible && !navOpen) ? "white" : "CurrentColor"} d="m 70,50 h -40" />
                                <path className="line bottom transition-colors duration-300" stroke={(heroVisible && !navOpen) ? "white" : "CurrentColor"} d="m 30,67 h 40 c 0,0 8.5,0.149796 8.5,-8.5 0,-8.649796 -8.5,-8.5 -8.5,-8.5 h -20 v 20" />
                            </svg>
                        </button>
                    </div>



                    <div
                        className="relative pointer-events-auto typeform-trigger rounded-xl border border-solid box-border w-[3.5rem] h-[3.5rem] bg-white/10 flex items-center justify-center cursor-pointer hover:bg-accent/20 transition-colors backdrop-blur-md z-10"

                        aria-label="Toggle Theme"
                    >
                        <ThemeToggleDropdown />
                    </div>

                </div>
                <div className="flex justify-end fixed items-center gap-8 bg-transparent right-4 pointer-events-auto top-24 ">
                    {!hideMarketplace && (<div
                        className={cn(
                            "relative w-32 h-12 rounded-xl",
                            (heroVisible && !navOpen) && "hidden"
                        )}
                    >
                        <button
                            onClick={() => setActiveView("marketplace")}
                            className={cn(
                                "relative font-medium w-full h-full transition-all duration-300",
                                "backdrop-blur-md rounded-xl border border-solid",
                                "bg-white/10",
                                "text-foreground border-border"
                            )}
                        >
                            Marketplace
                        </button>
                    </div>)}


                    <div className="pointer-events-auto typeform-trigger rounded-full border border-solid w-[3.5rem] h-[3.5rem] flex items-center justify-center hover:bg-accent/10 transition-colors backdrop-blur-sm z-10 bg-white/10">
                        <a
                            href={`mailto:${email}`}
                            className="group flex items-center justify-center w-full h-full cursor-pointer"
                        >
                            <Mail
                                size={24}
                                className="text-accent transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
                            />
                        </a>
                    </div>

                </div>
            </div>

            <div
                className={cn(
                    "menu-navs flex justify-center absolute top-40 left-[25%] w-1/2 m-auto text-main-color-dark transition-all duration-300 ease-in-out",
                    navOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 translate-y-5 invisible"
                )}
                id="menu-navs"
            >

                <div className="hidden md:flex items-center gap-4 text-[18px]">
                    <Button asChild className="text-[18px] font-medium">
                        <a
                            href="#newsletter-section"
                            onClick={(e) => handleScrollToSection(e, "newsletter-section")}
                        >
                            Early Bird
                        </a>
                    </Button>

                    <a
                        onClick={(e) => handleScrollToSection(e, "contact-section")}
                        className={cn(
                            "menu-navs text-[18px] cursor-pointer font-medium pb-1 border-b-2 border-transparent text-muted-foreground transition-all duration-300 ease-in-out hover:text-foreground hover:border-primary"
                        )}
                    >
                        Contact Us
                    </a>
                </div>
            </div>


            {/* Primary Menu Links */}
            {!isStaticPage && (
                <div
                    className={cn(
                        "menu-navs text-slate-200 z-50 flex justify-between absolute top-20 left-[30%] w-2/5 transition-all duration-300 ease-in-out",
                        navOpen
                            ? "opacity-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 translate-y-5 pointer-events-none"
                    )}
                    id="menu-navs"
                >
                    {navItems
                        .filter((item) => !item.loggedIn || isLoggedIn)
                        .map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveView(item.id)}
                                className={cn(
                                    "text-[18px] font-medium pb-1 border-b-2 transition-all duration-300 ease-in-out hover:text-foreground hover:border-primary",
                                    activeView == item.id
                                        ? "text-foreground border-primary"
                                        : "text-muted-foreground border-transparent"
                                )}
                            >
                                {item.label}
                            </button>
                        ))}
                </div>


            )}


            {/* Secondary Menu Links and Socials */}

        </div>
    )
}

export default DesktopNav





