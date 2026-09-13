"use client";

import { useEffect, useState } from 'react';
import Counter from '@/components/Counter';

const PageLoader = () => {
  const [progress, setProgress] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const LOCAL_STORAGE_VERSION = '1.4';

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
    const controller = new AbortController();

    const fetchVideo = async () => {
      try {
        const response = await fetch('/video/HeaderVideo.mp4', {
          signal: controller.signal
        });

        if (!response.ok) {
          setProgress(100);
          setVideoLoaded(true);
          return;
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        const reader = response.body?.getReader();
        if (!reader) {
          setProgress(100);
          setVideoLoaded(true);
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setProgress(100);
            setVideoLoaded(true);
            break;
          }
          loaded += value.length;
          if (total) {
            const percentComplete = (loaded / total) * 100;
            setProgress(Math.min(percentComplete, 99));
          } else {
            setProgress((prev) => Math.min(prev + 10, 99));
          }
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          setProgress(100);
          setVideoLoaded(true);
        }
      }
    };

    fetchVideo();

    const handleVideoLoaded = () => {
      setProgress(100);
      setVideoLoaded(true);
    };
    window.addEventListener('app-video-loaded', handleVideoLoaded);

    return () => {
      controller.abort();
      window.removeEventListener('app-video-loaded', handleVideoLoaded);
    };
  }, []);

  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const steps = [0, 10, 50, 90];
    const currentIndex = steps.indexOf(displayProgress);

    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      if (progress >= nextStep) {
        const timer = setTimeout(() => {
          setDisplayProgress(nextStep);
        }, 800); // Slower delay per step (max ~2.4s minimum load time)
        return () => clearTimeout(timer);
      }
    }
  }, [progress, displayProgress]);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('page-loader-complete'));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [displayProgress]);

  const getPlaces = () => {
    if (displayProgress >= 100) return [100, 10, 1];
    if (displayProgress >= 10) return [10, 1];
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

  const fontSize = isMobile ? 120 : isTablet ? 160 : 220;
  const padding = isMobile ? 2 : isTablet ? 3 : 4;
  const gap = isMobile ? 0 : isTablet ? 0.5 : 0.5;
  const horizontalPadding = isMobile ? 2 : isTablet ? 3 : 4;
  const borderRadius = isMobile ? 4 : isTablet ? 6 : 8;

  return (
    <div className="flex items-end justify-start min-h-[100dvh] bg-background py-6 px-6 md:py-6 md:px-6">
      <div className="text-center font-headline">
        <div className="inline-flex items-center">
          <Counter
            value={displayProgress}
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
