import { useInView } from "@/hooks/use-in-view";
import { useAnimatedNumber } from "@/hooks/use-animated-number";
import { formatAnimatedNumber, parseCompactNumber } from "@/lib/format-number";
import { cn } from "@/lib/utils";

type AnimatedCounterProps = {
  value: string | number;
  className?: string;
  duration?: number;
};

function NumericCounter({
  target,
  className,
  duration,
}: {
  target: number;
  className?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const animated = useAnimatedNumber(target, { enabled: inView, duration });
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {Math.round(animated).toLocaleString("en-US")}
    </span>
  );
}

function StringCounter({
  raw,
  className,
  duration,
}: {
  raw: string;
  className?: string;
  duration?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const parsed = parseCompactNumber(raw);
  const animated = useAnimatedNumber(parsed.value, { enabled: inView, duration });
  const display = formatAnimatedNumber(animated, {
    prefix: parsed.prefix,
    suffix: parsed.suffix,
    decimals: parsed.decimals,
    compact: Boolean(parsed.suffix),
  });
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  );
}

export function AnimatedCounter({ value, className, duration }: AnimatedCounterProps) {
  if (typeof value === "number") {
    return <NumericCounter target={value} className={className} duration={duration} />;
  }
  return <StringCounter raw={value} className={className} duration={duration} />;
}
