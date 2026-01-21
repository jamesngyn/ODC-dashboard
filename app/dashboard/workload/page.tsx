import { WorkloadDashboard } from "@/components/dashboard/workload/WorkloadDashboard";

export default function WorkloadPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Workload Completion</h2>
      </div>
      <WorkloadDashboard />
    </div>
  );
}
