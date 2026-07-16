import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <div
      className={cn("motion-fade-up", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

type StaggerGridProps = {
  children: ReactNode;
  className?: string;
  staggerMs?: number;
};

export function StaggerGrid({ children, className, staggerMs = 60 }: StaggerGridProps) {
  return (
    <div className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <FadeIn key={i} delay={i * staggerMs}>
              {child}
            </FadeIn>
          ))
        : children}
    </div>
  );
}

type AnimatedChartBarProps = {
  segments: [number, number, number];
  max: number;
  index: number;
};

export function AnimatedChartBar({ segments, max, index }: AnimatedChartBarProps) {
  const [a, b, c] = segments;
  const delay = index * 40;

  return (
    <div className="flex h-full flex-col justify-end gap-0.5">
      <div
        className="chart-bar w-full rounded-t-sm bg-muted-foreground/25"
        style={{ height: `${(c / max) * 100}%`, animationDelay: `${delay}ms` }}
      />
      <div
        className="chart-bar w-full bg-accent"
        style={{ height: `${(b / max) * 100}%`, animationDelay: `${delay + 30}ms` }}
      />
      <div
        className="chart-bar w-full rounded-b-sm bg-primary"
        style={{ height: `${(a / max) * 100}%`, animationDelay: `${delay + 60}ms` }}
      />
    </div>
  );
}
