"use client";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeatureNotDeveloped({
  content,
}: {
  content?: string;
}) {
  const { t } = useTranslation();
  return (
    <Empty className="min-h-[200px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        <EmptyDescription>
          {content ?? t("common.featureNotDeveloped")}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
