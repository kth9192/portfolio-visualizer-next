"use client";

import {
  RebalanceFrequency,
  rebalanceOptions,
} from "@/app/interface/enum/rebanalceFrequency";
import { PortfolioCreateSchemaType } from "@/app/interface/schema/portfolio";
import CustomSelect from "@/components/select/customSelect";
import DateSelect from "@/components/select/dateSelect";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

function PortfolioSetting() {
  const { control } = useFormContext<PortfolioCreateSchemaType>();

  const [date, setDate] = useState<Date | undefined>(undefined);

  const [year] = useState<number | undefined>();
  const [month] = useState<number | undefined>();

  // const watchedVal = useWatch({
  //   control,
  //   name: [
  //     "setting.startDate",
  //     "setting.endDate",
  //     "setting.rebalanceFrequency",
  //   ],
  // });

  useEffect(() => {
    if (year === undefined || month === undefined) return;
    setDate(new Date(year, month - 1, 1));
  }, [year, month]);

  useEffect(() => {
    console.log(date);
  }, [date]);

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">백테스팅 설정</h3>
      <div className="space-y-4">
        <FormField
          control={control}
          name="setting.startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>시작일</FormLabel>

              <FormControl>
                <DateSelect
                  value={field.value}
                  onSelect={(value: Date) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="setting.endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>종료일</FormLabel>

              <FormControl>
                <DateSelect
                  value={field.value}
                  onSelect={(value: Date) => field.onChange(value)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* <Controller
          control={control}
          name="setting"
          render={({ field }) => (
            <RangeCalendar
              selected={
                field.value.startDate && field.value.endDate
                  ? {
                      from: new Date(field.value.startDate),
                      to: new Date(field.value.endDate),
                    }
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
        /> */}

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
            render={({ field }) => {
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
