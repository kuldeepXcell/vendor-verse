import { Progress } from "@/components/ui/progress";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

const DEFAULT_FILL_MS = 3000;

type AnimatedProgressProps = {
  value: number;
  className?: string;
  indicatorClassName?: string;
  delayMs?: number;
  durationMs?: number;
};

export function AnimatedProgress({
  value,
  className,
  indicatorClassName,
  delayMs = 0,
  durationMs = DEFAULT_FILL_MS,
}: AnimatedProgressProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const current = useAnimatedNumber(value, {
    enabled: inView,
    duration: durationMs,
    delayMs,
  });

  return (
    <div ref={ref} className="w-full">
      <Progress
        instant
        value={current}
        className={className}
        indicatorClassName={indicatorClassName}
      />
    </div>
  );
}

type AnimatedBarProps = {
  percent: number;
  className?: string;
  barClassName?: string;
  delayMs?: number;
  durationMs?: number;
};

export function AnimatedBar({
  percent,
  className,
  barClassName,
  delayMs = 0,
  durationMs = DEFAULT_FILL_MS,
}: AnimatedBarProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const width = useAnimatedNumber(percent, {
    enabled: inView,
    duration: durationMs,
    delayMs,
  });

  return (
    <div ref={ref} className={cn("h-1.5 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
