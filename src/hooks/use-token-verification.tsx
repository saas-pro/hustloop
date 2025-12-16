"use client";

import { useEffect } from 'react';
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

export const useTokenVerification = ({
    setLoggedIn,
    setUserRole,
    setUser,
    setHasSubscription,
    setAppliedPrograms,
    setAuthProvider,
    setActiveView
}: UseTokenVerificationProps) => {
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/check-token`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });

                const data: TokenStatus = await response.json();

                if (!response.ok) {
                    if (data.expired) {
                        toast({
                            title: "Session expired",
                            description: "Your session has expired. Please log in again.",
                            variant: "destructive",
                        });
                    } else {
                        toast({
                            title: "Invalid token",
                            description: "Your authentication token is invalid. Please log in again.",
                            variant: "destructive",
                        });
                    }

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

                    setActiveView('home');
                    router.push('/');
                }
            } catch (error) {
                console.error('Token check failed:', error);
                toast({
                    title: "Network error",
                    description: "Unable to verify token. Please try again later.",
                    variant: "destructive",
                });
            }
        };

        checkToken();
    }, [toast, router, setLoggedIn, setUserRole, setUser, setHasSubscription, setAppliedPrograms, setAuthProvider, setActiveView]);
};
