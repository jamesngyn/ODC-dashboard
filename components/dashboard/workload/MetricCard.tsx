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
  /** Chú thích công thức: 3 dòng (đầu vào, công thức, tỉ lệ). Nếu có sẽ hiển thị thay cho formula. */
  formulaInput?: string;
  formulaExpression?: string;
  formulaRatio?: string;
  /** Chú thích công thức tính (1 đoạn, dùng khi không dùng formulaInput/Expression/Ratio). */
  formula?: string;
  /** Class cho viền trái / accent màu (vd: border-l-4 border-l-green-500). */
  accentClassName?: string;
  className?: string;
}

function FormulaLine({ text }: { text: string }) {
  const colonIndex = text.indexOf(":");
  if (colonIndex === -1) {
    return <span>{text}</span>;
  }
  const label = text.slice(0, colonIndex + 1);
  const rest = text.slice(colonIndex + 1).trim();
  return (
    <>
      <span className="font-semibold text-foreground/90">{label}</span>
      {rest ? <span className="text-muted-foreground"> {rest}</span> : null}
    </>
  );
}

export function MetricCard({
  title,
  mainValue,
  subValue,
  subLabel,
  progress,
  trend,
  formulaInput,
  formulaExpression,
  formulaRatio,
  formula,
  accentClassName,
  className,
}: MetricCardProps) {

  return (
    <Card
      className={cn(
        "bg-card text-card-foreground",
        accentClassName,
        className
      )}
    >
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
  
          <div className="mt-3 pt-3 border-t border-border/50 text-[11px] leading-snug space-y-1.5">
            {formulaInput && (
              <p className="text-muted-foreground">
                <FormulaLine text={formulaInput} />
              </p>
            )}
            {formulaExpression && (
              <p className="text-muted-foreground">
                <FormulaLine text={formulaExpression} />
              </p>
            )}
            {formulaRatio && (
              <p className="text-muted-foreground">
                <FormulaLine text={formulaRatio} />
              </p>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
