"use client";

import { useRef, useEffect, ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  reverse?: boolean;
}

export default function Marquee({
  children,
  speed = 30,
  className = "",
  reverse = false,
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    let animationId: number;
    let position = reverse ? -inner.scrollWidth / 2 : 0;

    const animate = () => {
      const speedPx = speed / 60;
      if (reverse) {
        position -= speedPx;
        if (position <= -inner.scrollWidth / 2) {
          position = 0;
        }
      } else {
        position -= speedPx;
        if (position <= -inner.scrollWidth / 2) {
          position = 0;
        }
      }
      inner.style.transform = `translateX(${position}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, reverse]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="flex w-fit">
        <div className="flex">{children}</div>
        <div className="flex" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
