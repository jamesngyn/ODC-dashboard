import { CustomerValueDashboard } from "@/components/dashboard/customer-value/CustomerValueDashboard";

export default function CustomerValuePage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Customer Value</h2>
      </div>
      <CustomerValueDashboard />
    </div>
  );
}
