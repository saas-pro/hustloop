
"use client";

import type { View } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, UserCircle, Menu, Sun, Moon, Palette, Check, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import * as React from 'react';
import { Separator } from "../ui/separator";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  isLoading: boolean;
  isStaticPage?: boolean;
}

const navItems: { id: View; label: string; loggedIn?: boolean }[] = [
  { id: "dashboard", label: "Dashboard", loggedIn: true },
  { id: "blog", label: "Blog" },
  { id: "mentors", label: "Mentors" },
  { id: "incubators", label: "Incubators" },
  { id: "pricing", label: "Pricing" },
  { id: "msmes", label: "MSMEs" },
  { id: "education", label: "Education" },
];

const themeOptions = [
    { value: 'light', label: 'Light', icon: Palette },
    { value: 'dark', label: 'Dark', icon: Palette },
    { value: 'purple', label: 'Purple', icon: Palette },
    { value: 'blue', label: 'Blue', icon: Palette },
    { value: 'green', label: 'Green', icon: Palette },
    { value: 'orange', label: 'Orange', icon: Palette },
    { value: 'blue-gray', label: 'Blue Gray', icon: Palette },
];

export function ThemeToggleDropdown() {
    const { theme, setTheme } = useTheme();

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
        </DropdownMenu>
    )
}

export default function Header({ activeView, setActiveView, isLoggedIn, onLogout, isLoading, isStaticPage = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = React.useState(false);

  const handleLogoClick = () => {
    if (pathname === '/terms-of-service' || pathname === '/privacy-policy') {
      setIsNavigating(true);
      router.push('/');
    } else {
      setActiveView("home");
    }
  };
  
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
        className="flex items-center gap-3 cursor-pointer"
        onClick={handleLogoClick}
      >
        <div className="font-headline text-2xl" style={{ color: '#D4AF37' }}>
          hustl<strong className="text-3xl align-middle font-bold">∞</strong>p
        </div>
        {!inSheet && (
          <>
              <Separator orientation="vertical" className="h-6 bg-border" />
              <p className="text-xs text-muted-foreground">
                  Smart hustle. <br /> Infinite growth..
              </p>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-20 items-center px-4">
          
          <div className="flex-1 flex justify-start">
            <BrandLogo />
          </div>
          
          {!isStaticPage && (
            <nav className="hidden md:flex items-center space-x-6">
              {navItems
                .filter((item) => !item.loggedIn || isLoggedIn)
                .map((item) => (
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
                ))}
            </nav>
          )}

          <div className="flex-1 flex justify-end">
            <div className="hidden md:flex items-center gap-2">
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
                    <>
                      <Button variant="ghost" onClick={() => handleAuthClick('login')}>
                        Login
                      </Button>
                      <Button onClick={() => handleAuthClick('signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        Sign Up
                      </Button>
                    </>
                  )}
                </>
              )}
              <ThemeToggleDropdown />
            </div>
            
            <div className="md:hidden">
              {!isStaticPage ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <div className="flex items-center justify-between mb-8">
                      <SheetClose asChild>
                          <BrandLogo inSheet={true} />
                      </SheetClose>
                      <ThemeToggleDropdown />
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
              ) : (
                <ThemeToggleDropdown />
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
}
