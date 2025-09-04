import React from "react";
import YearSelect from "./yearSelect";
import MonthSelect from "./monthSelect";

interface DateSelectProps {
  value: Date;
  onSelect: (value: Date) => void;
}

function DateSelect({ value, onSelect }: DateSelectProps) {
  const year = value ? value.getFullYear() : undefined;
  const month = value ? value.getMonth() + 1 : undefined;

  const handleYearChange = (selectedYear: number) => {
    onSelect(new Date(selectedYear, month - 1, 1));
  };

  const handleMonthChange = (selectedMonth: number) => {
    onSelect(new Date(year, selectedMonth - 1, 1));
  };

  return (
    <div className="flex gap-2">
      <YearSelect
        value={year}
        onSelectYear={(year: number) => {
          handleYearChange(year);
        }}
      />
      <MonthSelect
        value={month}
        onSelectMonth={(month: number) => {
          handleMonthChange(month);
        }}
      />
    </div>
  );
}

export default DateSelect;
