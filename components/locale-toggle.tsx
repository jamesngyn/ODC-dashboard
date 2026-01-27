"use client";

import * as React from "react";
import { FlagIcon, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeLabels: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
  ja: "日本語",
};

export function LocaleToggle() {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lng: string) => {
     i18n.changeLanguage(lng);
     localStorage.setItem("i18nextLng", lng);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="flex w-full items-center gap-2 border-none"
        >
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          {localeLabels[i18n.language]}
          <span className="sr-only">Toggle locale</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(localeLabels).map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => handleChangeLanguage(lng)}
            className={i18n.language === lng ? "bg-accent" : ""}
          >
            {localeLabels[lng]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
