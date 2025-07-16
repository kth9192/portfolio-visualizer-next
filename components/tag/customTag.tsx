import React from "react";
import { twMerge } from "tailwind-merge";

interface CustomTagProps {
  content: React.ReactNode;
  className?: string;
}

function CustomTag({ content, className }: CustomTagProps) {
  return (
    <div className={twMerge("rounded-xl px-2 py-0.5 text-xs", className)}>
      {content}
    </div>
  );
}

export default CustomTag;
