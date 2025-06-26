"use client";

import {
  RebalanceFrequency,
  rebalanceOptions,
} from "@/app/interface/enum/rebanalceFrequency";
import { usePortfolioStore } from "@/app/lib/store/portfolioStore";
import RangeCalendar from "@/components/calendar/rangeCalendar";
import SingleCalendar from "@/components/calendar/singleCalendar";
import CustomSelect from "@/components/select/customSelect";
import React from "react";
import { DateRange } from "react-day-picker";

function PortfolioSetting() {
  const { setting, updateSetting } = usePortfolioStore();

  const handleDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return;

    updateSetting({
      startDate: dateRange.from,
      endDate: dateRange.to,
        rebalanceFrequency: setting.rebalanceFrequency,
      });
    
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">백테스팅 설정</h3>
      <div className="space-y-4">
    
        <RangeCalendar
          selected={
            setting?.startDate && setting?.endDate
              ? { from: setting.startDate, to: setting.endDate }
              : undefined
          }
          onSelect={handleDateRange}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            리밸런싱 주기
          </label>

          <CustomSelect<RebalanceFrequency>
            items={rebalanceOptions}
            value={setting?.rebalanceFrequency}
            onSelect={(value: RebalanceFrequency) =>
              updateSetting({ rebalanceFrequency: value })
            }
            mode="single"
          />
        </div>
      </div>
    </div>
  );
}

export default PortfolioSetting;
