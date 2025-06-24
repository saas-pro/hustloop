"use client";

import { useEffect, useState } from "react";

const AnimatedBackground = () => {
  const [stars, setStars] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = Array.from({ length: 50 }).map((_, i) => {
        const style = {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${Math.random() * 5 + 5}s`,
        };
        return <div key={i} className="star" style={style} />;
      });
      setStars(newStars);
    };

    generateStars();
  }, []);

  return <div className="absolute inset-0 z-0">{stars}</div>;
};

export default AnimatedBackground;
