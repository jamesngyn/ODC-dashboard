import { QualityKPIDashboard } from "@/components/dashboard/quality-kpi/QualityKPIDashboard";

export default function QualityKPIPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quality KPI</h2>
      </div>
      <QualityKPIDashboard />
    </div>
  );
}
