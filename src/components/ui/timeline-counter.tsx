'use client';

import { useEffect, useState } from 'react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface TimelineCounterProps {
    endDate: string;
    extendedEndDate?: string | null;
    status?: string;
    className?: string;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
}

export default function TimelineCounter({
    endDate,
    extendedEndDate,
    status,
    className
}: TimelineCounterProps) {
    const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
    });

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const targetDate = new Date(extendedEndDate || endDate);
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0 || status === 'expired' || status === 'stopped') {
                setTimeRemaining({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isExpired: true,
                });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeRemaining({
                days,
                hours,
                minutes,
                seconds,
                isExpired: false,
            });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [endDate, extendedEndDate, status]);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center">
            <div className={cn(
                "relative w-14 h-14 md:w-14 md:h-14 rounded-lg flex items-center justify-center",
                "bg-gradient-to-br from-primary/20 to-primary/10",
                "border-2 border-primary/30",
                "shadow-lg shadow-primary/20",
                timeRemaining.isExpired && "from-red-500/20 to-red-500/10 border-red-500/30 shadow-red-500/20"
            )}>
                <span className={cn(
                    "text-2xl md:text-3xl font-bold tabular-nums",
                    timeRemaining.isExpired ? "text-red-500" : "text-primary"
                )}>
                    {String(value).padStart(2, '0')}
                </span>

                {!timeRemaining.isExpired && (
                    <div className="absolute inset-0 rounded-lg bg-primary/10 animate-pulse" />
                )}
            </div>
            <span className="text-xs md:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wide">
                {label}
            </span>
        </div>
    );

    return (
        <div className='flex justify-center'>
            <div className="space-y-2">
                {/* <div className="text-center">
                    <h3 className={cn(
                        "text-lg md:text-xl font-bold mb-1",
                        timeRemaining.isExpired ? "text-red-500" : "text-foreground"
                    )}>
                        {timeRemaining.isExpired ? 'Challenge Ended' : 'Time Remaining'}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                        {timeRemaining.isExpired
                            ? 'This challenge has concluded'
                            : extendedEndDate
                                ? 'Extended deadline countdown'
                                : 'Until deadline'}
                    </p>
                </div> */}

                <div className="flex justify-center gap-3 md:gap-4">
                    <TimeUnit value={timeRemaining.days} label="Days" />

                    <div className={`flex items-center text-2xl md:text-3xl font-bold pb-6 ${timeRemaining.isExpired ? 'text-red-600' : 'text-primary/50'}`}>
                        :
                    </div>

                    <TimeUnit value={timeRemaining.hours} label="Hours" />

                    <div className={`flex items-center text-2xl md:text-3xl font-bold pb-6 ${timeRemaining.isExpired ? 'text-red-600' : 'text-primary/50'}`}>
                        :
                    </div>

                    <TimeUnit value={timeRemaining.minutes} label="Mins" />

                    <div className={`flex items-center text-2xl md:text-3xl font-bold pb-6 ${timeRemaining.isExpired ? 'text-red-600' : 'text-primary/50'}`}>
                        :
                    </div>

                    <TimeUnit value={timeRemaining.seconds} label="Secs" />
                </div>

                {extendedEndDate && !timeRemaining.isExpired && (
                    <div className="flex w-full border-t border-border/50 pt-2">
                        <div className="flex-1 flex justify-center">
                            <p className="text-xs text-muted-foreground">
                                ⚡ Extended until {new Date(extendedEndDate).toLocaleDateString(
                                    'en-US',
                                    { month: 'short', day: 'numeric', year: 'numeric' }
                                )}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
