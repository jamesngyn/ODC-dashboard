import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  mainValue: string | number;
  subValue?: string | number;
  subLabel?: string;
  progress?: number;
  trend?: string;
  className?: string;
}

export function MetricCard({
  title,
  mainValue,
  subValue,
  subLabel,
  progress,
  trend,
  className,
}: MetricCardProps) {
  return (
    <Card className={cn("bg-card text-card-foreground", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{mainValue}</div>
        {(subValue || subLabel) && (
          <p className="text-xs text-muted-foreground">
            {subValue && <span className="text-foreground font-medium mr-1">{subValue}</span>}
            {subLabel}
          </p>
        )}
        {typeof progress === "number" && (
          <Progress value={progress} className="mt-3 h-2" />
        )}
        {trend && (
          <p className="text-xs text-green-500 mt-1 font-medium">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
