import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { twMerge } from "tailwind-merge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface SingleCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SingleCalendar: React.FC<SingleCalendarProps> = ({
  selected,
  onSelect,
  placeholder = "날짜를 선택하세요",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={twMerge(
              "w-full justify-start text-left font-normal h-10",
              !selected && "text-pbaa-textlight-caption",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            disabled={disabled}
          >
            {selected ? (
              format(selected, "yyyy년 MM월 dd일", { locale: ko })
            ) : (
              <>
                <CalendarIcon className="h-4 w-4" />
                <span>{placeholder}</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <DayPicker
            mode="single"
            defaultMonth={selected}
            selected={selected}
            onSelect={onSelect}
            locale={ko}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SingleCalendar;
