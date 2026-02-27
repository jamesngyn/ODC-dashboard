import React, { useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/icons";
import { X } from "lucide-react";

interface CommonDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  visibleClearButton?: boolean;
  icon?: React.ReactNode;
  buttonClassName?: string;
  placeholder?: string;
  disabledDates?: (date: Date) => boolean;
}

const CommonDatePicker: React.FC<CommonDatePickerProps> = ({
  value,
  onChange,
  disabled,
  visibleClearButton = false,
  icon,
  buttonClassName,
  placeholder,
  disabledDates,
}) => {
  const { t } = useTranslation();
  const date = value ? dayjs(value).toDate() : undefined;
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex w-full items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={clsx(
              "flex h-10 w-full items-center justify-between border border-gray-300 bg-white px-3 font-normal text-gray-700",
              date ? "text-gray-900" : "text-gray-400",
              buttonClassName
            )}
            disabled={disabled}
          >
            {date
              ? format(date, "dd/MM/yyyy", { locale: vi })
              : placeholder || "mm/dd/yyyy"}
            <div className="flex items-center gap-1">
              {icon && <span className="ml-2 flex items-center">{icon}</span>}
              {date && !disabled && visibleClearButton && (
                <button
                  type="button"
                  className="cursor-pointer text-xs text-neutral-400 hover:text-red-500"
                  onClick={() => onChange("")}
                  tabIndex={-1}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[240px] w-auto p-0" align="start">
          <Calendar
            fullWidth
            mode="single"
            selected={date}
            onSelect={(date) => {
              setOpen(false);
              if (date) {
                onChange(format(date, "yyyy-MM-dd"));
              }
            }}
            disabled={disabledDates || disabled}
            locale={vi}
            initialFocus
            captionLayout="dropdown"
            fromYear={1900}
            toYear={2100}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommonDatePicker;
