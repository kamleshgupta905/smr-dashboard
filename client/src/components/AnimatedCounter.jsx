import React, { useState, useEffect, useRef } from 'react';

/**
 * Apple-grade Smooth Animated Counter
 * Easing: Ease-Out Quart (1 - (1 - t)^4) for silky, organic deceleration.
 */
export default function AnimatedCounter({ 
  value, 
  duration = 1400, 
  prefix = '', 
  suffix = '', 
  decimals = 0,
  defaultText = null 
}) {
  let targetNumber = 0;
  let isNumeric = false;
  let detectedDecimals = decimals;

  if (typeof value === 'number') {
    targetNumber = value;
    isNumeric = !isNaN(value);
  } else if (typeof value === 'string') {
    if (/^\d{2}:\d{2}$/.test(value.trim())) {
      return <span>{value}</span>;
    }
    const cleanStr = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleanStr);
    if (!isNaN(parsed)) {
      targetNumber = parsed;
      isNumeric = true;
      if (cleanStr.includes('.') && decimals === 0) {
        detectedDecimals = cleanStr.split('.')[1].length;
      }
    }
  }

  const [displayValue, setDisplayValue] = useState(() => isNumeric ? 0 : value);
  const frameRef = useRef(null);
  const startTimeRef = useRef(null);
  const prevTargetRef = useRef(0);

  useEffect(() => {
    if (!isNumeric) {
      setDisplayValue(value);
      return;
    }

    const startVal = prevTargetRef.current;
    const endVal = targetNumber;
    prevTargetRef.current = endVal;

    // Apple-style ease-out quartic easing curve
    const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);

      const current = startVal + (endVal - startVal) * easedProgress;
      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        startTimeRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      startTimeRef.current = null;
    };
  }, [targetNumber, duration, isNumeric, value]);

  if (!isNumeric) {
    return <span>{defaultText || value}</span>;
  }

  const formatted = typeof displayValue === 'number'
    ? displayValue.toLocaleString('en-US', {
        minimumFractionDigits: detectedDecimals,
        maximumFractionDigits: detectedDecimals,
      })
    : displayValue;

  return (
    <span style={{ 
      display: 'inline-block',
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em',
      transition: 'color 0.3s ease'
    }}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
