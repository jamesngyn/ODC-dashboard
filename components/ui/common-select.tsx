"use client";

import { cn } from "@/lib/utils/index";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  /** Layout dọc: label trên, field dưới. */
  vertical?: boolean;
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
  vertical = false,
}: CommonSelectProps) => {
  const selectId = id ?? "common-select";
  const valueStr = value ?? "";
  const optionValues = options.map((opt) => String(opt.value));
  const resolvedValue = optionValues.includes(valueStr)
    ? valueStr
    : options[0]?.value != null
      ? String(options[0].value)
      : "";

  return (
    <div
      className={cn(
        "gap-2",
        vertical ? "flex flex-col items-stretch" : "flex items-center"
      )}
    >
      {label !== undefined && (
        <Label
          htmlFor={selectId}
          className={cn(
            "text-sm font-medium",
            !vertical && "shrink-0",
            labelClassName
          )}
        >
          {label}
        </Label>
      )}
      <Select
        value={resolvedValue === "" ? undefined : resolvedValue}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[280px] overflow-y-auto">
          {options.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
