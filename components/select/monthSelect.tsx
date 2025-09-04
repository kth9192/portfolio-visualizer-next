"use client";

import CustomSelect from "./customSelect";

interface MonthSelectProps {
  value: number | undefined;
  onSelectMonth: (month: number) => void;
}

function MonthSelect({ value, onSelectMonth }: MonthSelectProps) {
  return (
    <CustomSelect
      items={[
        {
          label: "1월",
          value: 1,
        },
        {
          label: "2월",
          value: 2,
        },
        {
          label: "3월",
          value: 3,
        },
        {
          label: "4월",
          value: 4,
        },
        {
          label: "5월",
          value: 5,
        },
        {
          label: "6월",
          value: 6,
        },
        {
          label: "7월",
          value: 7,
        },
        {
          label: "8월",
          value: 8,
        },
        {
          label: "9월",
          value: 9,
        },
        {
          label: "10월",
          value: 10,
        },
        {
          label: "11월",
          value: 11,
        },
        {
          label: "12월",
          value: 12,
        },
      ]}
      value={value}
      placeholder="월 선택"
      triggerClass="bg-background text-black"
      contentClass="h-100"
      mode="single"
      onSelect={(value) => {
        onSelectMonth(value);
      }}
    />
  );
}

export default MonthSelect;
