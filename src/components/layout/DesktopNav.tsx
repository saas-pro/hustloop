"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import React, { use, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Sun, Moon, Palette, Check, Loader2, UserCircle, LogOut, Droplet, Leaf, Flame, Cloud } from 'lucide-react';
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
}

const navItems: { id: View; label: string; loggedIn?: boolean }[] = [
    { id: "mentors", label: "Mentors" },
    { id: "incubators", label: "Incubators" },
    { id: "msmes", label: "MSMEs" },
    { id: "education", label: "Education" },
    { id: "pricing", label: "Pricing" },
    { id: "blog", label: "Blog" },
    { id: "dashboard", label: "Dashboard", loggedIn: true },
];




export function ThemeToggleDropdown() {
    const { theme, setTheme } = useTheme();
    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'purple', label: 'Purple', icon: Palette },
        { value: 'blue', label: 'Blue', icon: Droplet },
        { value: 'green', label: 'Green', icon: Leaf },
        { value: 'orange', label: 'Orange', icon: Flame },
        { value: 'blue-gray', label: 'Blue Gray', icon: Cloud },
    ];




    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
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

const DesktopNav = ({ navOpen, setNavOpen, activeView, setActiveView, isLoggedIn, onLogout, isLoading, isStaticPage = false }: DesktopNavProps) => {
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
        const interval = setInterval(shakeHamburger, 3000);

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
    }, []);

    return (
        <div >


            <div className="toggle fixed z-50 justify-end items-center flex gap-8 w-screen pointer-events-none top-4 -left-8">
                {/* Magnetic CTA Button */}
                <div className="hidden md:flex items-center gap-4 pointer-events-auto">
                    {!isStaticPage && (
                        <>
                            {isLoading ? (
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            ) : isLoggedIn ? (
                                <>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveView('dashboard')}>
                                        <UserCircle className="h-6 w-6" />
                                        <span className="sr-only">Dashboard</span>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={onLogout}>
                                        <LogOut className="h-6 w-6" />
                                        <span className="sr-only">Logout</span>
                                    </Button>
                                </>
                            ) : (
                                <div
                                    ref={containerRef}
                                    className='.btn-container1'
                                >
                                    <button
                                        onClick={() => handleAuthClick('login')}
                                        ref={buttonRef}
                                        className='login-btn bg-accent hover:bg-accent/90 text-accent-foreground'
                                    >
                                        Login
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {/* Menu Button */}
                <div>
                    <button
                        id="menu-button"
                        ref={btnRef}
                        aria-label="Menu"
                        onClick={() => {
                            document.body.classList.toggle('nav-open');
                            setNavOpen(!navOpen);

                        }}
                        className="z-10 relative xl:inline-block w-[3.5rem] rounded-xl border border-solid pointer-events-auto"
                    >
                        <svg
                            className="ham hamRotate pointer-events-none w-full h-full select-none transition-colors relative text-foreground"
                            viewBox="0 0 100 100"
                            width="80"
                        >
                            <path
                                className="line top"
                                stroke="currentColor"
                                d="m 70,33 h -40 c 0,0 -8.5,-0.149796 -8.5,8.5 0,8.649796 8.5,8.5 8.5,8.5 h 20 v -20"
                            />
                            <path
                                className="line middle"
                                stroke="currentColor"
                                d="m 70,50 h -40"
                            />
                            <path
                                className="line bottom"
                                stroke="currentColor"
                                d="m 30,67 h 40 c 0,0 8.5,0.149796 8.5,-8.5 0,-8.649796 -8.5,-8.5 -8.5,-8.5 h -20 v 20"
                            />
                        </svg>
                    </button>
                </div>

                <div className="relative pointer-events-auto typeform-trigger">

                    <ThemeToggleDropdown />
                </div>



            </div>

            <div className="menu-navs flex justify-center absolute top-40 left-[25%] w-1/2 m-auto text-xl 2xl:text-2xl opacity-0 translate-y-1/3 text-main-color-dark ">
                <div className="hidden md:flex items-center gap-4">
                    <Button asChild>
                        <a href="#newsletter-section" onClick={(e) => handleScrollToSection(e, 'newsletter-section')}>
                            Early Bird
                        </a>
                    </Button>
                    <a href="#contact-section" onClick={(e) => handleScrollToSection(e, 'contact-section')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Contact Us
                    </a>
                </div>
            </div>

            {/* Primary Menu Links */}
            {!isStaticPage && (
                <div className="menu-navs text-slate-200 z-50 flex justify-between absolute top-20 left-[30%] w-2/5 text-2xl xl:text-4xl opacity-0 translate-y-1/3 ">
                    {navItems
                        .filter((item) => !item.loggedIn || isLoggedIn)
                        .map((item) =>
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id)}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-foreground",
                                    activeView === item.id
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </button>

                        )}
                </div>

            )}


            {/* Secondary Menu Links and Socials */}

        </div>
    )
}

export default DesktopNav