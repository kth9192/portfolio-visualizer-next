"use client";

import {
  RebalanceFrequency,
  rebalanceOptions,
} from "@/app/interface/enum/rebanalceFrequency";
import { usePortfolioStore } from "@/lib/store/portfolioStore";
import RangeCalendar from "@/components/calendar/rangeCalendar";
import SingleCalendar from "@/components/calendar/singleCalendar";
import CustomSelect from "@/components/select/customSelect";
import React from "react";
import { DateRange } from "react-day-picker";
import { PortfolioCreateSchemaType } from "@/app/interface/schema/portfolio";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Watch } from "lucide-react";

function PortfolioSetting() {
  // const { setting, updateSetting } = usePortfolioStore();

  const { register, control, watch, setValue } =
    useFormContext<PortfolioCreateSchemaType>();

  const watchedVal = useWatch({
    control,
    name: [
      "setting.startDate",
      "setting.endDate",
      "setting.rebalanceFrequency",
    ],
  });

  const [startDate, endDate, rebalanceFrequency] = watchedVal;

  const handleDateRange = (dateRange: DateRange | undefined) => {
    if (!dateRange?.from || !dateRange?.to) return;

    setValue("setting.startDate", dateRange.from, {
      shouldValidate: true,
    });
    setValue("setting.endDate", dateRange.to, {
      shouldValidate: true,
    });
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">백테스팅 설정</h3>
      <div className="space-y-4">
        <Controller
          control={control}
          name="setting"
          render={({ field }) => (
            <RangeCalendar
              selected={
                field.value.startDate && field.value.endDate
                  ? { from: new Date(field.value.startDate), to: new Date(field.value.endDate) }
                  : undefined
              }
              onSelect={(dateRange: DateRange | undefined) =>
                field.onChange({
                  startDate: dateRange?.from,
                  endDate: dateRange?.to,
                  rebalanceFrequency: field.value.rebalanceFrequency,
                })
              }
            />
          )}
        />

        {/* <RangeCalendar
          selected={
            startDate && endDate
              ? { from: startDate, to: endDate }
              : undefined
          }
          onSelect={handleDateRange}
        /> */}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            리밸런싱 주기
          </label>

          <Controller
            control={control}
            name="setting.rebalanceFrequency"
            render={({ field, fieldState }) => {
         
              return (
                <CustomSelect<RebalanceFrequency>
                  items={rebalanceOptions}
                  value={field.value as RebalanceFrequency}
                  onSelect={(value: RebalanceFrequency) =>
                    field.onChange(value as RebalanceFrequency)
                  }
                  mode="single"
                />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default PortfolioSetting;
