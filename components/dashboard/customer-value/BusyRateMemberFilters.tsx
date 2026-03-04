"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { vi } from "date-fns/locale";
import { CommonSelect } from "@/components/ui/common-select";
import type { CommonSelectOption } from "@/components/ui/common-select";
import CommonDatePicker from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Non-empty value for "All" option (Radix Select disallows value="") */
export const ALL_VALUE = "__all__";

export type PeriodMode = "day" | "week" | "month";

export interface BusyRateMemberFiltersProps {
  periodMode: PeriodMode;
  onPeriodModeChange: (value: PeriodMode) => void;
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
  selectedProjectId: string;
  onProjectChange: (value: string) => void;
  selectedTeamId: string;
  onTeamChange: (value: string) => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  projectOptions: CommonSelectOption[];
  teamOptions: CommonSelectOption[];
  periodOptions: CommonSelectOption[];
}

export function BusyRateMemberFilters({
  periodMode,
  onPeriodModeChange,
  selectedDate,
  onSelectedDateChange,
  selectedProjectId,
  onProjectChange,
  selectedTeamId,
  onTeamChange,
  nameFilter,
  onNameFilterChange,
  projectOptions,
  teamOptions,
  periodOptions,
}: BusyRateMemberFiltersProps) {
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
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">
          {t("customerValue.filterByName")}
        </Label>
        <Input
          type="text"
          placeholder={t("customerValue.filterByNamePlaceholder")}
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
          className="h-9 w-[220px]"
        />
      </div>
      <div className="flex flex-col gap-2">
        <CommonSelect
          label={t("customerValue.projectName")}
          value={selectedProjectId}
          onValueChange={onProjectChange}
          options={projectOptions}
          placeholder={t("customerValue.filterAll")}
          triggerClassName="w-[220px]"
          vertical
        />
      </div>
      <div className="flex flex-col gap-2">
        <CommonSelect
          label={t("customerValue.divisionTeam")}
          value={selectedTeamId}
          onValueChange={onTeamChange}
          options={teamOptions}
          placeholder={t("customerValue.filterAll")}
          triggerClassName="w-[220px]"
          vertical
        />
      </div>
    </div>
  );
}
