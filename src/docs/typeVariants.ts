type Variants = {
  /** Human-friendly label shown in docs (optional). */
  label?: string;
  /** Allowed literal values. */
  values: string[];
};

/**
 * A curated map of common Widget UI "enum-like" type aliases to their allowed values.
 *
 * This intentionally does NOT include huge unions like `WidgetIcon` because rendering
 * hundreds of values inline makes docs noisy; those get special UX elsewhere (Icon library).
 */
export const typeVariantsByAlias: Record<string, Variants> = {
  ThemeMode: { values: ["light", "dark"] },
  ControlVariant: { values: ["solid", "soft", "outline", "ghost"] },
  ControlSize: { values: ["3xs", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
  TextAlign: { values: ["start", "center", "end"] },
  TextSize: { values: ["xs", "sm", "md", "lg", "xl"] },
  TitleSize: { values: ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] },
  CaptionSize: { values: ["sm", "md", "lg"] },
  IconSize: { values: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"] },
  Alignment: { values: ["start", "center", "end", "baseline", "stretch"] },
  Justification: { values: ["start", "center", "end", "between", "around", "evenly", "stretch"] },
  RadiusValue: {
    values: ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "full", "100%", "none"]
  }
};

function uniqStable(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function extractQuotedLiterals(type: string): string[] {
  const out: string[] = [];
  // Double-quoted literals: "sm" | "md"
  for (const match of type.matchAll(/"([^"]+)"/g)) out.push(match[1] ?? "");
  // Single-quoted literals: 'sm' | 'md'
  for (const match of type.matchAll(/'([^']+)'/g)) out.push(match[1] ?? "");
  return out.filter(Boolean);
}

/**
 * Given a `PropDoc.type` string, attempt to extract a discrete set of allowed values.
 *
 * - Expands known alias types (e.g. `ControlVariant`).
 * - Extracts string literal unions from inline types (e.g. `"sm" | "md"`).
 * - Returns `null` if nothing useful/finite is found, or if the set is too large.
 */
export function getAllowedVariants(type: string): string[] | null {
  const trimmed = type.trim();
  const alias = typeVariantsByAlias[trimmed];
  if (alias) return uniqStable(alias.values);

  const literals = uniqStable(extractQuotedLiterals(trimmed));
  if (literals.length === 0) return null;

  // Avoid rendering super-long lists in the docs table.
  if (literals.length > 24) return null;

  return literals;
}


