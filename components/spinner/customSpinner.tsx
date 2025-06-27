import React, { useMemo } from "react";
import { twMerge } from "tailwind-merge";

interface CustomSpinnerProps {
  className?: string;
  size?: number;
}

function CustomSpinner({ className, size = 20 }: CustomSpinnerProps) {
  const borderWidth = useMemo(() => {
    return Math.floor(size / 10);
  }, [size]);

  return (
    <div
      className={twMerge(
        `size-${size} bg-transparent border-${borderWidth} border-blue-600 border-t-blue-200 rounded-full animate-spin`,
        className
      )}
    ></div>
  );
}

export default CustomSpinner;
