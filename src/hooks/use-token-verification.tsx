"use client";

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { UserRole, View } from '@/app/types';

type AuthProvider = 'local' | 'google';

type User = {
    name: string;
    email: string;
    userId: string;
}

interface TokenStatus {
    valid?: boolean;
    expired?: boolean;
    error?: string;
}

interface UseTokenVerificationProps {
    setLoggedIn: (value: boolean) => void;
    setUserRole: (value: UserRole | null) => void;
    setUser: (value: User | null) => void;
    setHasSubscription: (value: boolean) => void;
    setAppliedPrograms: (value: Record<string, string>) => void;
    setAuthProvider: (value: AuthProvider | null) => void;
    setActiveView: (value: View) => void;
}

export function useTokenVerification({
    setLoggedIn,
    setUserRole,
    setUser,
    setHasSubscription,
    setAppliedPrograms,
    setAuthProvider,
    setActiveView
}: UseTokenVerificationProps) {
    const { toast } = useToast();
    const router = useRouter();
    const logout = useCallback((title: string, description: string) => {
        toast({ title, description, variant: "destructive" });
        setLoggedIn(false);
        setUserRole(null);
        setUser(null);
        setHasSubscription(false);
        setAppliedPrograms({});
        setAuthProvider(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('hasSubscription');
        localStorage.removeItem('appliedPrograms');
        localStorage.removeItem('token');
        localStorage.removeItem('authProvider');
        localStorage.removeItem('founder_role');
        window.dispatchEvent(new Event('storage'));
        setActiveView('home');
        router.push('/');
    }, [
        router,
        setActiveView,
        setLoggedIn,
        setUserRole,
        setUser,
        setHasSubscription,
        setAppliedPrograms,
        setAuthProvider,
        toast
    ]);
    const checkToken = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const [profileRes, tokenRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/user/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                fetch(`${API_BASE_URL}/api/check-token`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);
            if (!profileRes.ok) {
                logout("Session expired", "Please log in again.");
                return;
            }
            const userData = await profileRes.json();
            if (userData.user.role === null) {
                logout("Role is not set", "Please log in again to set your role.");
                return;
            }
            const tokenData: TokenStatus = await tokenRes.json();
            if (!tokenRes.ok) {
                logout(
                    tokenData.expired ? "Session expired" : "Invalid token",
                    "Please log in again."
                );
            }
        } catch {
            toast({
                title: "Network error",
                description: "Unable to verify token. Please try again later.",
                variant: "destructive",
            });
        }
    }, [logout, toast]);
    useEffect(() => {
        checkToken();
    }, [checkToken]);
}
