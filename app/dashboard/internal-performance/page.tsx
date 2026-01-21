import { FeatureNotDeveloped } from "@/components/dashboard/FeatureNotDeveloped";

export default function InternalPerformancePage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Internal Performance
        </h2>
      </div>
      <FeatureNotDeveloped />
    </div>
  );
}
