"use client";

import { useEffect, useState } from 'react';
import Counter from '@/components/Counter';

const PageLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const nextValue = prev + 50;
        return Math.min(nextValue, 100);
      });
    }, 1150);

    return () => clearInterval(interval);
  }, []);

  const roundedProgress = Math.round(progress);
  const getPlaces = () => {
    if (roundedProgress >= 100) return [100, 10, 1];
    if (roundedProgress >= 10) return [10, 1];
    return [1];
  };

  return (
    <div className="flex items-end justify-start min-h-screen bg-background py-4 px-8">
      <div className="text-center">
        <div className="inline-flex items-center">
          <Counter
            value={roundedProgress}
            fontSize={220}
            padding={8}
            places={getPlaces()}
            gap={1}
            borderRadius={8}
            horizontalPadding={10}
            textColor="hsl(var(--accent))"
            fontWeight="normal"
            gradientHeight={20}
            gradientFrom="hsl(var(--background))"
            gradientTo="transparent"
            containerStyle={{}}
            counterStyle={{}}
            digitStyle={{}}
            topGradientStyle={{}}
            bottomGradientStyle={{}}
          />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
