"use client";

import { useEffect, useState } from 'react';
import Counter from '@/components/Counter';

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const LOCAL_STORAGE_VERSION = '1.3';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentVersion = localStorage.getItem('localStorageVersion');
      if (currentVersion !== LOCAL_STORAGE_VERSION) {
        localStorage.clear();
        localStorage.setItem('localStorageVersion', LOCAL_STORAGE_VERSION);
      }
    }
  }, []);

  useEffect(() => {
    const handleVideoLoaded = () => setVideoLoaded(true);
    window.addEventListener('app-video-loaded', handleVideoLoaded);
    return () => window.removeEventListener('app-video-loaded', handleVideoLoaded);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }

        // If video is loaded, increment faster but don't jump instantly to prevent spring overshoot
        let increment = 1;
        if (videoLoaded) {
          increment = Math.floor(Math.random() * 8) + 4; // 4 to 11
        } else {
          // Slower organic increments
          if (prev < 40) {
            increment = Math.floor(Math.random() * 4) + 2; // 2 to 5
          } else if (prev < 80) {
            increment = Math.floor(Math.random() * 3) + 1; // 1 to 3
          } else if (prev < 99) {
            increment = Math.random() > 0.3 ? 1 : 0; // 0 to 1, mostly 1
          } else {
            increment = 0; // Cap at 99 until video loads
          }
        }

        const nextProgress = prev + increment;
        return videoLoaded ? Math.min(nextProgress, 100) : Math.min(nextProgress, 99);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [videoLoaded]);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('page-loader-complete'));
      }, 400); // Allow time for the user to see 100
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const roundedProgress = Math.round(progress);
  const getPlaces = () => {
    if (roundedProgress >= 100) return [100, 10, 1];
    if (roundedProgress >= 10) return [10, 1];
    return [1];
  };

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Responsive values
  const fontSize = isMobile ? 120 : isTablet ? 160 : 200;
  const padding = isMobile ? 2 : isTablet ? 3 : 4;
  const gap = isMobile ? 0 : isTablet ? 0.5 : 0.5;
  const horizontalPadding = isMobile ? 2 : isTablet ? 3 : 4;
  const borderRadius = isMobile ? 4 : isTablet ? 6 : 8;

  return (
    <div className="flex items-end justify-start min-h-[100dvh] bg-background py-4 px-4">
      <div className="text-center">
        <div className="inline-flex items-center">
          <Counter
            value={roundedProgress}
            fontSize={fontSize}
            padding={padding}
            places={getPlaces()}
            gap={gap}
            borderRadius={borderRadius}
            horizontalPadding={horizontalPadding}
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
