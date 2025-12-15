"use client";

import { useEffect, useState } from 'react';
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

interface PageLoaderProps {
  setLoggedIn: (value: boolean) => void;
  setUserRole: (value: UserRole | null) => void;
  setUser: (value: User | null) => void;
  setHasSubscription: (value: boolean) => void;
  setAppliedPrograms: (value: Record<string, string>) => void;
  setAuthProvider: (value: AuthProvider | null) => void;
  setActiveView: (value: View) => void;
}

const PageLoader = ({
  setLoggedIn,
  setUserRole,
  setUser,
  setHasSubscription,
  setAppliedPrograms,
  setAuthProvider,
  setActiveView
}: PageLoaderProps) => {
  const [progress, setProgress] = useState(0);
  const [tokenChecked, setTokenChecked] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkToken = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setTokenChecked(true);
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

        setTokenChecked(true);
      } catch (error) {
        console.error('Token check failed:', error);
        toast({
          title: "Network error",
          description: "Unable to verify token. Please try again later.",
          variant: "destructive",
        });
        setTokenChecked(true);
      }
    };

    checkToken();

    interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        if (tokenChecked) {
          return 100;
        }

        const increment = prev < 30 ? 10 : prev < 60 ? 5 : 2;
        return Math.min(prev + increment, 90);
      });
    }, 150);

    return () => clearInterval(interval);
  }, [tokenChecked, toast, router, setLoggedIn, setUserRole, setUser, setHasSubscription, setAppliedPrograms, setAuthProvider, setActiveView]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md px-6">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <path
              d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z"
              fill="hsl(var(--muted))"
            />
          </svg>

          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0"
          >
            <path
              d="M20.288 9.463a4.856 4.856 0 0 0-4.336-2.3 4.586 4.586 0 0 0-3.343 1.767c.071.116.148.226.212.347l.879 1.652.134-.254a2.71 2.71 0 0 1 2.206-1.519 2.845 2.845 0 1 1 0 5.686 2.708 2.708 0 0 1-2.205-1.518L13.131 12l-1.193-2.26a4.709 4.709 0 0 0-3.89-2.581 4.845 4.845 0 1 0 0 9.682 4.586 4.586 0 0 0 3.343-1.767c-.071-.116-.148-.226-.212-.347l-.879-1.656-.134.254a2.71 2.71 0 0 1-2.206 1.519 2.855 2.855 0 0 1-2.559-1.369 2.825 2.825 0 0 1 0-2.946 2.862 2.862 0 0 1 2.442-1.374h.121a2.708 2.708 0 0 1 2.205 1.518l.7 1.327 1.193 2.26a4.709 4.709 0 0 0 3.89 2.581h.209a4.846 4.846 0 0 0 4.127-7.378z"
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: 100 - progress,
                transition: 'stroke-dashoffset 0.3s ease-out',
              }}
            />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
          <p className="mt-2 text-sm text-muted-foreground">Initializing your experience...</p>
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
