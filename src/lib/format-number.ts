export function parseCompactNumber(input: string): {
  value: number;
  prefix: string;
  suffix: string;
  decimals: number;
} {
  const trimmed = input.trim();
  const prefixMatch = trimmed.match(/^([+$%-]+)/);
  const prefix = prefixMatch?.[1] ?? "";
  const rest = prefixMatch ? trimmed.slice(prefix.length) : trimmed;

  const suffixMatch = rest.match(/([KMB%]+)$/i);
  const suffix = suffixMatch?.[1] ?? "";
  const core = suffixMatch ? rest.slice(0, -suffix.length) : rest;

  const numeric = Number(core.replace(/[$,]/g, ""));
  const multiplier =
    suffix.toUpperCase() === "K"
      ? 1_000
      : suffix.toUpperCase() === "M"
        ? 1_000_000
        : suffix.toUpperCase() === "B"
          ? 1_000_000_000
          : 1;

  const value = Number.isFinite(numeric) ? numeric * multiplier : 0;
  const decimals = core.includes(".") ? (core.split(".")[1]?.length ?? 0) : 0;

  return { value, prefix, suffix, decimals };
}

export function formatAnimatedNumber(
  animated: number,
  options: {
    prefix?: string;
    suffix?: string;
    decimals?: number;
    compact?: boolean;
  } = {},
): string {
  const { prefix = "", suffix = "", decimals = 0, compact = false } = options;

  if (compact && suffix) {
    const displaySuffix = suffix.toUpperCase();
    const base =
      displaySuffix === "M"
        ? animated / 1_000_000
        : displaySuffix === "K"
          ? animated / 1_000
          : displaySuffix === "B"
            ? animated / 1_000_000_000
            : animated;
    return `${prefix}${base.toFixed(decimals)}${suffix}`;
  }

  if (prefix === "$" || prefix.includes("$")) {
    return `${prefix}${Math.round(animated).toLocaleString("en-US")}${suffix}`;
  }

  if (decimals > 0) {
    return `${prefix}${animated.toFixed(decimals)}${suffix}`;
  }

  return `${prefix}${Math.round(animated).toLocaleString("en-US")}${suffix}`;
}
