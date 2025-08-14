"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

/**
 * Renders children with animated double curved lines below the text.
 * On hover, the lines disappear and reappear with a GSAP animation.
 */
export const HighlightEffect: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => {
  const topLineRef = useRef<SVGPathElement>(null);
  const bottomLineRef = useRef<SVGPathElement>(null);

  // Set initial scale for both lines
  useEffect(() => {
    [topLineRef, bottomLineRef].forEach((ref) => {
        gsap.to(ref.current, { scaleX: 1, transformOrigin: "left center" });
    });
  }, []);

  const handleMouseEnter = () => {
    const tl = gsap.timeline();

    // Animate both lines to disappear and reappear
    [topLineRef, bottomLineRef].forEach((ref) => {
      if (ref.current) {
        tl.to(ref.current, {
          scaleX: 0,
          duration: 0.3,
          ease: "power2.in",
        }).to(
          ref.current,
          {
            scaleX: 1,
            duration: 1.5,
            ease: "power2.out",
          },
          "-=0.1" // slight overlap for smoother animation
        );
      }
    });
  };

  return (
    <span
      className={`relative inline-block left-4 cursor-pointer ${className} text-4xl scale-125`}
      onMouseEnter={handleMouseEnter}
    >
       <svg
        className="absolute left-0 bottom-0 top-6 w-full h-[1.2em] z-0 pointer-events-none"
        viewBox="0 0 100 16"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          ref={topLineRef}
          d="M2 8 C25 12, 75 2, 98 8"
          stroke="#ffe066"
          strokeWidth="1.0"
          fill="none"
          strokeLinecap="round"
        />
        <path
          ref={bottomLineRef}
          d="M2 10 C25 13, 75 4, 98 10"
          stroke="#ffe066"
          strokeWidth="1.0"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="relative z-10">{children}</span>
    </span>
  );
};

export default HighlightEffect;
