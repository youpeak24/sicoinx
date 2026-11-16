import React, { useEffect, useState, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1600,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const elementRef = useRef<HTMLSpanElement | null>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    // If reduced motion is requested, show final value directly
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          startAnimation();
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value]);

  const startAnimation = () => {
    const startTime = performance.now();
    const startVal = 0;
    const endVal = value;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(endVal);
      }
    };

    requestAnimationFrame(step);
  };

  const formatNumber = (num: number) => {
    const fixed = num.toFixed(decimals);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  return (
    <span ref={elementRef} className={`tabular-nums inline-block ${className}`}>
      {prefix}
      {formatNumber(displayValue)}
      {suffix}
    </span>
  );
};
