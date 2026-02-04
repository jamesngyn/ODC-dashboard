"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/index";

export interface CommonSelectOption {
  value: string;
  label: string;
}

export interface CommonSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: CommonSelectOption[];
  label?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  triggerClassName?: string;
  labelClassName?: string;
}

export const CommonSelect = ({
  value,
  onValueChange,
  options,
  label,
  id,
  placeholder,
  disabled = false,
  triggerClassName,
  labelClassName,
}: CommonSelectProps) => {
  const selectId = id ?? "common-select";

  return (
    <div className="flex items-center gap-2">
      {label !== undefined && (
        <Label
          htmlFor={selectId}
          className={cn("text-sm font-medium shrink-0", labelClassName)}
        >
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
