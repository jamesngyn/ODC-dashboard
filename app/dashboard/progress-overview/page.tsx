import { type Metadata } from "next";
import { ProgressOverviewWidget } from "@/components/dashboard/ProgressOverviewWidget";

export const metadata: Metadata = {
  title: "Progress Overview | ODC Dashboard",
  description: "Project status distribution and key insights.",
};

export default function ProgressOverviewPage() {
  return (
    <div className="flex-1 space-y-4">
      <ProgressOverviewWidget />
    </div>
  );
}
