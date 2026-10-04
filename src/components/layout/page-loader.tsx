"use client";

import { useEffect, useState } from 'react';

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
    let videoDone = false;
    let windowDone = typeof document !== 'undefined' && document.readyState === 'complete';

    const checkAllLoaded = () => {
      if (videoDone && windowDone) {
        setProgress(100);
        setVideoLoaded(true);
      }
    };

    const handleWindowLoad = () => {
      windowDone = true;
      checkAllLoaded();
    };

    if (typeof window !== 'undefined') {
      if (document.readyState === 'complete') {
        windowDone = true;
      } else {
        window.addEventListener('load', handleWindowLoad);
      }
    }

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    const fetchVideo = async () => {
      try {
        const response = await fetch('/video/HeaderVideo.mp4');

        if (!response.ok) {
          videoDone = true;
          checkAllLoaded();
          return;
        }

        const contentLength = response.headers.get('content-length');
        const total = contentLength ? parseInt(contentLength, 10) : 0;
        let loaded = 0;

        reader = response.body?.getReader();
        if (!reader) {
          videoDone = true;
          checkAllLoaded();
          return;
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            videoDone = true;
            checkAllLoaded();
            break;
          }
          loaded += value.length;
          if (total) {
            const percentComplete = Math.round((loaded / total) * 95);
            setProgress(Math.min(percentComplete, 95));
          } else {
            setProgress((prev) => Math.min(Math.round(prev + 10), 90));
          }
        }
      } catch (error: any) {
        videoDone = true;
        checkAllLoaded();
      }
    };

    fetchVideo();

    const handleVideoLoaded = () => {
      videoDone = true;
      checkAllLoaded();
    };
    window.addEventListener('app-video-loaded', handleVideoLoaded);

    return () => {
      if (!videoDone && reader) {
        try {
          reader.cancel().catch(() => { });
        } catch { }
      }
      window.removeEventListener('load', handleWindowLoad);
      window.removeEventListener('app-video-loaded', handleVideoLoaded);
    };
  }, []);

  const [displayProgress, setDisplayProgress] = useState(0);

  // Smoothly increment display progress towards the actual progress
  useEffect(() => {
    if (displayProgress < progress) {
      const step = Math.max(1, Math.ceil((progress - displayProgress) / 5));
      const timer = setTimeout(() => {
        setDisplayProgress((prev) => Math.min(Math.round(prev + step), progress));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [progress, displayProgress]);

  useEffect(() => {
    if (displayProgress >= 100) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('page-loader-complete'));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [displayProgress]);

  return (
    <div className="flex items-end justify-start min-h-[100dvh] bg-background py-8 px-8 md:py-12 md:px-12 select-none">
      <div className="font-headline font-semibold text-accent leading-none tracking-tight">
        <span className="text-9xl sm:text-8xl md:text-9xl lg:text-[14rem] font-bold tabular-nums">
          {Math.round(displayProgress)}
        </span>
        <span className="text-6xl sm:text-4xl md:text-5xl lg:text-7xl font-medium ml-1 text-accent/80">
          %
        </span>
      </div>
    </div>
  );
};

export default PageLoader;
