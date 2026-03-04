"use client";

import { useMemo } from "react";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { useTranslation } from "react-i18next";

import { CommonSelect } from "@/components/ui/common-select";
import type { CommonSelectOption } from "@/components/ui/common-select";
import CommonDatePicker from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";

import type { PeriodMode } from "./BusyRateMemberFilters";

export interface PerformanceMemberFiltersProps {
  periodMode: PeriodMode;
  onPeriodModeChange: (value: PeriodMode) => void;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  selectedTeamId: string;
  onTeamChange: (value: string) => void;
  teamOptions: CommonSelectOption[];
  periodOptions: CommonSelectOption[];
}

export function PerformanceMemberFilters({
  periodMode,
  onPeriodModeChange,
  selectedDate,
  onSelectedDateChange,
  selectedTeamId,
  onTeamChange,
  teamOptions,
  periodOptions,
}: PerformanceMemberFiltersProps) {
  const { t } = useTranslation();

  const dateRangeDisplay = useMemo(() => {
    switch (periodMode) {
      case "day":
        return format(selectedDate, "dd/MM/yyyy", { locale: vi });
      case "week": {
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        return `${format(start, "dd/MM", { locale: vi })} - ${format(end, "dd/MM/yyyy", { locale: vi })}`;
      }
      case "month": {
        const start = startOfMonth(selectedDate);
        const end = endOfMonth(selectedDate);
        return `${format(start, "dd/MM", { locale: vi })} - ${format(end, "dd/MM/yyyy", { locale: vi })}`;
      }
    }
  }, [periodMode, selectedDate]);

  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <div className="flex flex-col gap-2">
        <CommonSelect
          label={t("customerValue.period")}
          value={periodMode}
          onValueChange={(v) => onPeriodModeChange(v as PeriodMode)}
          options={periodOptions}
          triggerClassName="w-[140px]"
          vertical
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          {t("customerValue.dateRange")}
        </Label>
        <CommonDatePicker
          value={format(selectedDate, "yyyy-MM-dd")}
          onChange={(value) => onSelectedDateChange(new Date(value))}
          displayValue={dateRangeDisplay}
          buttonClassName="w-full justify-start text-left font-normal min-w-[200px]"
        />
      </div>
    </div>
  );
}
