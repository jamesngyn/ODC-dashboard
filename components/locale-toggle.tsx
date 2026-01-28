"use client";

import * as React from "react";
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

const localeFlags: Record<string, string> = {
  en: "🇺🇸",
  vi: "🇻🇳",
  ja: "🇯🇵",
};

const SUPPORTED_LOCALES = ["en", "vi", "ja"] as const;

function getLocaleCode(locale: string): string {
  const code = locale?.split("-")[0] ?? "en";
  return SUPPORTED_LOCALES.includes(code as (typeof SUPPORTED_LOCALES)[number])
    ? code
    : "en";
}

function getLocaleFlag(locale: string): string {
  return localeFlags[getLocaleCode(locale)];
}

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
          <span
            className="text-lg leading-none"
            role="img"
            aria-hidden
          >
            {getLocaleFlag(i18n.language)}
          </span>
          {localeLabels[getLocaleCode(i18n.language)]}
          <span className="sr-only">Toggle locale</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((lng) => (
          <DropdownMenuItem
            key={lng}
            onClick={() => handleChangeLanguage(lng)}
            className={getLocaleCode(i18n.language) === lng ? "bg-accent" : ""}
          >
            <span
              className="mr-2 text-lg leading-none"
              role="img"
              aria-hidden
            >
              {localeFlags[lng]}
            </span>
            {localeLabels[lng]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
