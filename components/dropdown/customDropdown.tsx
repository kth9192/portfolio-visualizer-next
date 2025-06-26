import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface DropdownItem {
  label: string;
  value: string | number;
  disabled?: boolean;
  separator?: boolean;
}

interface CustomDropdownProps {
  trigger: React.ReactNode;
  triggerClass?: string;
  items: DropdownItem[];
  contentClass?: string;
  label?: string;
  onSelect?: (value: string | number) => void;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
}

function CustomDropdown({
  trigger,
  items,
  triggerClass = "",
  contentClass = "",
  label,
  onSelect,
  align = "start",
  side = "bottom",
}: CustomDropdownProps) {
  const handleSelect = (value: string | number) => {
    onSelect?.(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClass} asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className={`min-w-40 ${contentClass}`}
        align={align}
        side={side}
      >
        {label && (
          <>
            <DropdownMenuLabel className="text-pbaa-textlight-caption">
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onSelect={() => handleSelect(item.value)}
              disabled={item.disabled}
              className="cursor-pointer text-pbaa-textlight-primary hover:bg-pbaa-hoverMenu focus:bg-pbaa-hoverMenu"
            >
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default CustomDropdown;