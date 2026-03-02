import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  mainValue: string | number;
  subValue?: string | number;
  subLabel?: string;
  progress?: number;
  trend?: string;
  formulaInput?: string;
  formulaExpression?: string;
  formulaRatio?: string;
  formula?: string;
  accentClassName?: string;
  bgClassName?: string;
  progressBarClassName?: string;
  iconBadge?: React.ReactNode;
  iconBadgeClassName?: string;
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
      <span className="text-foreground/90 font-semibold">{label}</span>
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
  bgClassName,
  progressBarClassName,
  iconBadge,
  iconBadgeClassName,
  className,
}: MetricCardProps) {
  const usePastelStyle = Boolean(bgClassName);

  return (
    <Card
      className={cn(
        usePastelStyle
          ? "rounded-xl border-0 text-zinc-900 shadow-md dark:text-zinc-100"
          : "bg-card text-card-foreground",
        usePastelStyle && bgClassName,
        !usePastelStyle && accentClassName,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={cn(
            "text-sm font-medium",
            usePastelStyle ? "text-zinc-900 dark:text-zinc-100" : undefined
          )}
        >
          {title}
        </CardTitle>
        {iconBadge && (
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
              iconBadgeClassName ??
                (usePastelStyle
                  ? "bg-emerald-100/80 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-muted")
            )}
          >
            {iconBadge}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "text-2xl font-bold",
            usePastelStyle && "text-3xl text-zinc-900 dark:text-zinc-100"
          )}
        >
          {mainValue}
        </div>
        {(subValue || subLabel) && (
          <p
            className={cn(
              "text-xs",
              usePastelStyle
                ? "text-zinc-700 dark:text-zinc-300"
                : "text-muted-foreground"
            )}
          >
            {subValue && (
              <span className="mr-1 font-medium text-zinc-900 dark:text-zinc-100">
                {subValue}
              </span>
            )}
            {subLabel}
          </p>
        )}
        {typeof progress === "number" &&
          (progressBarClassName ? (
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200/80 dark:bg-zinc-700/50">
              <div
                className={cn(
                  "h-full rounded-full transition-[width]",
                  progressBarClassName
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          ) : (
            <Progress value={progress} className="mt-3 h-2" />
          ))}
        {trend && (
          <p className="mt-1 text-xs font-medium text-green-500">{trend}</p>
        )}

        <div className="mt-3 space-y-1.5 border-t border-zinc-200/60 pt-3 text-[11px] leading-snug dark:border-zinc-700/60">
          {formulaInput && (
            <p className="text-muted-foreground dark:text-zinc-400">
              <FormulaLine text={formulaInput} />
            </p>
          )}
          {formulaExpression && (
            <p className="text-muted-foreground dark:text-zinc-400">
              <FormulaLine text={formulaExpression} />
            </p>
          )}
          {formulaRatio && (
            <p className="text-muted-foreground dark:text-zinc-400">
              <FormulaLine text={formulaRatio} />
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
