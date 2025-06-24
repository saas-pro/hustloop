
"use client";

import { useEffect, useRef } from "react";

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous stars to prevent duplicates on remount
    container.innerHTML = '';

    // Generate twinkling stars
    const generateStars = () => {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.width = `${Math.random() * 2 + 1}px`;
        star.style.height = star.style.width;
        star.style.animationDelay = `${Math.random() * 8}s`;
        star.style.animationDuration = `${Math.random() * 6 + 4}s`;
        container.appendChild(star);
      }
    };

    // Generate shooting stars
    const generateShootingStars = () => {
      for (let i = 0; i < 2; i++) {
          const shootingStar = document.createElement('div');
          shootingStar.className = 'shooting-star';
          shootingStar.style.top = `${Math.random() * 50}%`;
          shootingStar.style.left = `${Math.random() * 100 + 50}%`;
          shootingStar.style.width = `${Math.random() * 150 + 100}px`;
          shootingStar.style.animationDelay = `${Math.random() * 10 + 5}s`;
          shootingStar.style.animationDuration = `${Math.random() * 2 + 2}s`;
          container.appendChild(shootingStar);
      }
    }

    generateStars();
    generateShootingStars();
    
    // Cleanup function to remove stars when component unmounts
    return () => {
        if (container) {
            container.innerHTML = '';
        }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden bg-background"
    />
  );
};

export default AnimatedBackground;
