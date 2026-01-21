import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { FEATURE_NOT_DEVELOPED } from "@/constants/common";
import { Construction } from "lucide-react";

export function FeatureNotDeveloped({
  content = FEATURE_NOT_DEVELOPED,
}: {
  content?: string;
}) {
  return (
    <Empty className="min-h-[200px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        <EmptyDescription>{content}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
