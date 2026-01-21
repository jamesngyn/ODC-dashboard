import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HealthStatus {
  category: string; // e.g., Schedule, Budget, Quality, Scope
  status: string; // e.g., On Track, Under Budget
  color: string; // e.g., text-green-500, text-cyan-500
}

const HEALTH_DATA: HealthStatus[] = [
  { category: "Schedule", status: "On Track", color: "text-green-500" },
  { category: "Budget", status: "Under Budget", color: "text-cyan-500" },
  { category: "Quality", status: "Meeting Target", color: "text-green-500" },
  { category: "Scope", status: "Controlled", color: "text-cyan-500" },
];

export function HealthIndicators() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Health Indicators (Nghiên cứu sau)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {HEALTH_DATA.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between border-b border-gray-200 pb-2 last:border-0 last:pb-0"
            >
              <span className="text-muted-foreground font-medium">
                {item.category}
              </span>
              <span className={`font-semibold ${item.color}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
