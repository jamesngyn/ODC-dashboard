"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/index";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  /** Bật ô tìm kiếm option trong dropdown (CommandInput + filter). */
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
  const [open, setOpen] = useState(false);
  const selectId = id ?? "common-select";

  const valueStr = value ?? "";
  const optionValues = options.map((opt) => String(opt.value));
  const resolvedSelection = useMemo(() => {
    if (optionValues.includes(valueStr)) return valueStr;
    if (options[0]?.value != null) return String(options[0].value);
    return "";
  }, [optionValues, options, valueStr]);

  const selectedLabel = useMemo(() => {
    const found = options.find((opt) => String(opt.value) === resolvedSelection);
    return found?.label ?? placeholder ?? "";
  }, [options, placeholder, resolvedSelection]);

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
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={selectId}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-between font-normal",
              !resolvedSelection && "text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="truncate">{selectedLabel}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          style={{ width: "var(--radix-popover-trigger-width)" }}
        >
          <Command
            shouldFilter={searchable ? undefined : false}
            filter={
              searchable
                ? (itemValue, search) => {
                    const normalized = String(itemValue).toLowerCase();
                    const option = options.find(
                      (o) => String(o.value).toLowerCase() === normalized
                    );
                    if (!option) return 0;
                    if (
                      option.label
                        .toLowerCase()
                        .includes(search.trim().toLowerCase())
                    ) {
                      return 1;
                    }
                    return 0;
                  }
                : undefined
            }
          >
            {searchable ? (
              <CommandInput placeholder={searchPlaceholder} className="h-9" />
            ) : null}
            <CommandList>
              <CommandEmpty>{emptySearchText}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const optValue = String(opt.value);
                  const isSelected = optValue === resolvedSelection;
                  return (
                    <CommandItem
                      key={optValue}
                      value={optValue}
                      onSelect={() => {
                        onValueChange(optValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 shrink-0",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
