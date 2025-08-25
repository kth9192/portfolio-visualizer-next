import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

// 제네릭 아이템 타입 정의
interface SelectItem<T> {
  label: string;
  value: T;
  disabled?: boolean;
}

// 단일 선택 프롭스
interface SingleSelectProps<T> {
  mode: "single";
  value?: T;
  onSelect: (value: T) => void;
}

// 다중 선택 프롭스
interface MultipleSelectProps<T> {
  mode: "multiple";
  value?: T[];
  onSelect: (values: T[]) => void;
}

// 공통 프롭스
interface BaseCustomSelectProps<T> {
  items: SelectItem<T>[];
  placeholder?: string;
  disabled?: boolean;
  triggerClass?: string;
  contentClass?: string;
  itemClass?: string;
  renderLabel?: (item: SelectItem<T>) => React.ReactNode;
  getValueString?: (value: T) => string;
}

// 통합 프롭스 타입
type CustomSelectProps<T> = BaseCustomSelectProps<T> &
  (SingleSelectProps<T> | MultipleSelectProps<T>);

function CustomSelect<T = string | number>(props: CustomSelectProps<T>) {
  const {
    items,
    placeholder = "선택해주세요",
    disabled = false,
    triggerClass,
    contentClass,
    itemClass,
    renderLabel,
    getValueString,
    mode,
  } = props;

  const [open, setOpen] = useState(false);

  // 값을 문자열로 변환하는 함수
  const valueToString = (val: T): string => {
    if (getValueString) {
      return getValueString(val);
    }
    return String(val);
  };

  // 단일 선택 모드 렌더링
  if (mode === "single") {
    const { value, onSelect } = props;

    // 문자열에서 원래 값으로 변환하는 함수
    const stringToValue = (str: string): T | undefined => {
      return items?.find((item) => valueToString(item.value) === str)?.value;
    };

    // 선택된 아이템 찾기
    const selectedItem =
      value !== undefined
        ? items?.find((item) => item.value === value)
        : undefined;

    return (
      <Select
        value={value !== undefined ? valueToString(value) : undefined}
        onValueChange={(stringValue) => {
          const actualValue = stringToValue(stringValue);
          if (actualValue !== undefined) {
            onSelect(actualValue);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full", triggerClass)}>
          <SelectValue placeholder={placeholder}>
            {selectedItem &&
              (renderLabel ? renderLabel(selectedItem) : selectedItem.label)}
          </SelectValue>
        </SelectTrigger>

        <SelectContent className={cn("", contentClass)}>
          {items?.map((item, index) => (
            <SelectItem
              key={`${valueToString(item.value)}-${index}`}
              value={valueToString(item.value)}
              disabled={item.disabled}
              className={cn("", itemClass)}
            >
              {renderLabel ? renderLabel(item) : item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // 다중 선택 모드 렌더링
  const { value = [], onSelect } = props;

  // 선택된 아이템들
  const selectedItems = items?.filter((item) => value.includes(item.value));

  // 표시할 텍스트 생성
  const getDisplayText = () => {
    if (selectedItems?.length === 0) return placeholder;
    return `${selectedItems?.length}개 선택됨`;
  };

  // 아이템 선택/해제 처리
  const handleItemToggle = (itemValue: T, checked: boolean) => {
    let newValues: T[];

    if (checked) {
      newValues = [...value, itemValue];
    } else {
      newValues = value.filter((v) => v !== itemValue);
    }

    onSelect(newValues);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selectedItems?.length && "text-muted-foreground",
            triggerClass
          )}
          disabled={disabled}
        >
          <span className="flex-1">{getDisplayText()}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className={cn("w-full p-0", contentClass)} align="start">
        <div className="max-h-60 overflow-auto">
          {items?.map((item, index) => {
            const isSelected = value.includes(item.value);

            return (
              <div
                key={`${valueToString(item.value)}-${index}`}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-accent",
                  item.disabled && "opacity-50 cursor-not-allowed",
                  itemClass
                )}
                onClick={() =>
                  !item.disabled && handleItemToggle(item.value, !isSelected)
                }
              >
                <Checkbox
                  checked={isSelected}
                  disabled={item.disabled}
                  onChange={() => {}} // onClick에서 처리
                />
                <span className="flex-1 text-sm">
                  {renderLabel ? renderLabel(item) : item.label}
                </span>
                {isSelected && <Check className="h-4 w-4 text-pbaa-primary" />}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default CustomSelect;
export type { SelectItem, CustomSelectProps };
