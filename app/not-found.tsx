"use client";

import React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto grid min-h-screen max-w-xl place-content-center px-10 text-center">
      <p className="mr-7 w-auto py-2 text-xl font-black transition-all duration-300 ease-linear md:py-4">
        {t("notFound.message")}
      </p>
      <div className="mx-auto mt-8 w-full max-w-lg md:mt-0">
        <Button size="lg" className="w-full font-bold">
          <Link href="/" className="pb-1 text-zinc-100 dark:text-zinc-800">
            {t("notFound.findYourDad")}
          </Link>{" "}
        </Button>
      </div>
    </div>
  );
}
