import { useEffect, useState } from "react";

export const useChallengeProgress = (challenge: any) => {
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const MS_PER_DAY = 1000 * 60 * 60 * 24;

  const toLocalDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  useEffect(() => {
    const { start_date, end_date } = challenge || {};
    
    if (!start_date || !end_date) return;

    const startDate = toLocalDate(start_date);
    const endDate = toLocalDate(end_date);
 
    const today = toLocalDate(new Date());

    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);

    const daysPassed = Math.ceil((today.getTime() - startDate.getTime()) / MS_PER_DAY);

    const remaining = Math.ceil((endDate.getTime() - today.getTime()) / MS_PER_DAY);
    setDaysRemaining(remaining > 0 ? remaining : 0);
    let calculatedProgress = 0;
    if (today <= startDate) {
      calculatedProgress = 0; 
    } else if (today >= endDate) {
      calculatedProgress = 100; 
    } else {
      calculatedProgress = (daysPassed / totalDays) * 100;
    }

    setProgress(Math.min(100, Math.max(0, calculatedProgress))); 
  }, [challenge,MS_PER_DAY]);

  return { progress, daysRemaining };
};
