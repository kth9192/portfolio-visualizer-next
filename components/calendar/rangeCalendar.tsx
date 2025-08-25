import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import {
  DateRange,
  DayPicker,
  DropdownProps,
  getDefaultClassNames,
} from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface RangeCalendarProps {
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomSelectDropdown(props: DropdownProps) {
  const { options, value, onChange } = props;

  const handleValueChange = (newValue: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: newValue,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange(syntheticEvent);
    }
  };

  return (
    <Select value={value?.toString()} onValueChange={handleValueChange}>
      <SelectTrigger className="border-none shadow-none cursor-pointer">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="flex flex-col-reverse h-100 overflow-y-auto">
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const RangeCalendar: React.FC<RangeCalendarProps> = ({
  selected,
  onSelect,
  placeholder = "날짜 범위를 선택하세요",
  disabled = false,
  className,
}) => {
  const defaultClassNames = getDefaultClassNames();
  const today = new Date();
  const currentMonth = new Date(today.getFullYear(), today.getMonth());

  const [isOpen, setIsOpen] = React.useState(false);

  const formatRange = (range: DateRange | undefined) => {
    if (!range?.from) return placeholder;

    if (range.from && !range.to) {
      return format(range.from, "yyyy년 MM월 dd일", { locale: ko });
    }

    if (range.from && range.to) {
      return `${format(range.from, "yyyy년 MM월 dd일", {
        locale: ko,
      })} - ${format(range.to, "yyyy년 MM월 dd일", { locale: ko })}`;
    }

    return placeholder;
  };

  const handleSelect = (range: DateRange | undefined) => {
    onSelect?.(range);

    // 시작일과 종료일이 모두 선택되면 팝오버 닫기
    if (range?.from && range?.to && range.from !== range.to) {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !selected && "text-gray-500",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
            {formatRange(selected)}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 bg-white border border-pbaa-border shadow-lg"
          align="start"
        >
          <DayPicker
            mode="range"
            defaultMonth={selected?.from}
            selected={selected}
            onSelect={handleSelect}
            showOutsideDays={true}
            fixedWeeks={true}
            locale={ko}
            captionLayout="dropdown"
            endMonth={currentMonth}
            classNames={{
              today: "text-red-800 font-medium",
              caption: "flex justify-center pt-1 relative items-center",
              outside: "opacity-20",
              range_start:
                "bg-blue-700 text-white rounded-l-md border-blue-700",
              range_end: "bg-blue-700 text-white rounded-r-md border-blue-700",
              range_middle: "bg-blue-200 font-semibold text-gray-500",
              month_caption: `${defaultClassNames.month_caption} flex justify-center pt-1 relative items-center font-bold `,
              selected: `font-bold`,
              dropdowns: "flex flex-row-reverse gap-2 z-50",
              nav: `${defaultClassNames.nav} justify-between w-full  z-10`,
            }}
            components={{
              Dropdown: CustomSelectDropdown,
              Chevron: ({ className, orientation, ...props }) => {
                if (orientation === "left") {
                  return (
                    <ChevronLeftIcon
                      className={cn("size-4", className)}
                      {...props}
                    />
                  );
                }
                return (
                  <ChevronRightIcon
                    className={cn("size-4", className)}
                    {...props}
                  />
                );
              },
            }}
          />
          <div className="p-3 border-t border-pbaa-border">
            <div className="flex justify-between items-center">
              <div className="text-xs text-pbaa-textlight-caption">
                {selected?.from && selected?.to
                  ? `${
                      Math.ceil(
                        (selected.to.getTime() - selected.from.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1
                    }일 선택됨`
                  : "날짜 범위를 선택하세요"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelect?.(undefined);
                    setIsOpen(false);
                  }}
                  className="h-7 px-2 text-xs"
                >
                  초기화
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-7 px-2 text-xs bg-pbaa-primary-80 hover:bg-pbaa-primary-100"
                  disabled={!selected?.from || !selected?.to}
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default RangeCalendar;
