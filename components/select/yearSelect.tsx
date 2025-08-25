"use client";

import React, { useMemo, useState } from "react";
import CustomSelect from "./customSelect";

interface YearSelectProps {
  value: number | undefined;
  onSelectYear: (year: number) => void;
}

function YearSelect({ value, onSelectYear }: YearSelectProps) {
  const yearItem = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1999;

    const years = [];

    for (let i = currentYear; i > startYear; i--) {
      years.push({ label: `${i}년`, value: i });
    }

    return years;
  }, []);

  return (
    <CustomSelect
      items={yearItem}
      mode="single"
      value={value}
      placeholder="연도 선택"
      triggerClass="bg-background text-black"
      contentClass="h-100"
      onSelect={(value) => {
        onSelectYear(value);
      }}
    />
  );
}

export default YearSelect;
