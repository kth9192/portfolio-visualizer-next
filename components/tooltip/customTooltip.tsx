import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { twMerge } from "tailwind-merge";

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  triggerClass?: string;
  contentClass?: string;
  disable?: boolean;
}

function CustomTooltip({
  children: trigger,
  content,
  triggerClass,
  contentClass,
  disable,
}: CustomTooltipProps) {
  if (disable) {
    return <div>{trigger}</div>;
  }

  return (
    <Tooltip>
      <TooltipTrigger
        className={twMerge(
          "cursor-pointer w-fit max-w-full truncate",
          triggerClass
        )}
      >
        {trigger}
      </TooltipTrigger>
      <TooltipContent className={twMerge("", contentClass)}>
        <div>{content}</div>
      </TooltipContent>
    </Tooltip>
  );
}

export default CustomTooltip;
