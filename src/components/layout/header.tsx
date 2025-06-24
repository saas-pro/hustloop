"use client";

import type { View } from "@/app/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Rocket, LogOut, UserCircle } from "lucide-react";

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isLoggedIn: boolean;
  setLoggedIn: (isLoggedIn: boolean) => void;
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

export default function Header({ activeView, setActiveView, isLoggedIn, setLoggedIn }: HeaderProps) {
  const handleLogout = () => {
    setLoggedIn(false);
    setActiveView("home");
  };

  return (
    <>
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveView("home")}
          >
            <Rocket className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">Nexus Platform</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            {navItems
              .filter((item) => !item.loggedIn || isLoggedIn)
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    activeView === item.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Button variant="ghost" size="icon">
                  <UserCircle className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-6 w-6" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setActiveView('login')}>
                  Login
                </Button>
                <Button onClick={() => setActiveView('signup')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
