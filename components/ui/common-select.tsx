"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/index";
import { Input } from "@/components/ui/input";
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
  /** Bật ô tìm kiếm option trong dropdown. */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchText?: string;
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
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  emptySearchText = "Không tìm thấy kết quả",
}: CommonSelectProps) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectId = id ?? "common-select";
  const valueStr = value ?? "";
  const optionValues = options.map((opt) => String(opt.value));
  const resolvedValue = optionValues.includes(valueStr)
    ? valueStr
    : options[0]?.value != null
      ? String(options[0].value)
      : "";
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!searchable || normalizedSearchTerm.length === 0) {
      return options;
    }

    return options.filter((opt) =>
      opt.label.toLowerCase().includes(normalizedSearchTerm)
    );
  }, [normalizedSearchTerm, options, searchable]);

  useEffect(() => {
    if (!isOpen || !searchable) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [filteredOptions.length, isOpen, searchable]);

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
        onOpenChange={(isOpen) => {
          setIsOpen(isOpen);
          if (!isOpen) {
            setSearchTerm("");
          }
        }}
      >
        <SelectTrigger id={selectId} className={triggerClassName}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[280px] overflow-y-auto">
          {searchable && (
            <div className="sticky -top-1 z-10 bg-white py-2">
              <Input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => event.stopPropagation()}
                onKeyDownCapture={(event) => event.stopPropagation()}
                placeholder={searchPlaceholder}
                className="h-8"
              />
            </div>
          )}
          {filteredOptions.length === 0 && (
            <div className="text-muted-foreground px-2 py-1.5 text-sm">
              {emptySearchText}
            </div>
          )}
          {filteredOptions.map((opt) => (
            <SelectItem key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
