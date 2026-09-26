import { read } from "../state";

type Options = Record<string, unknown>;
const optionsObject = (value: unknown): Options => value && typeof value === "object" ? value as Options : {};

export function formatDate(value: unknown, style: unknown = "medium", rawOptions?: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return "";
  const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (typeof value === "string") {
    if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/.test(value)) return "";
    const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00Z`);
    if (!Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)) return "";
  }
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (!Number.isFinite(date.getTime()) || (dateOnly && date.toISOString().slice(0, 10) !== value)) return "";
  const options = optionsObject(rawOptions);
  const locale = String(options.locale ?? "en-US");
  if (style === "iso") return date.toISOString().slice(0, 10);
  if (style === "relative") {
    const seconds = (date.getTime() - Date.now()) / 1000;
    const units: [Intl.RelativeTimeFormatUnit, number][] = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60], ["second", 1]];
    const [unit, divisor] = units.find(([, duration]) => Math.abs(seconds) >= duration) ?? units[units.length - 1];
    return new Intl.RelativeTimeFormat(locale).format(Math.round(seconds / divisor), unit);
  }
  const styles: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric" },
    weekday: { weekday: "short", month: "short", day: "numeric" },
    time: { hour: "numeric", minute: "2-digit" },
    datetime: { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
  };
  return new Intl.DateTimeFormat(locale, {
    ...(styles[String(style)] ?? styles.medium),
    timeZone: dateOnly ? "UTC" : options.timeZone === undefined ? undefined : String(options.timeZone)
  }).format(date);
}

export function aggregate(list: unknown, key: unknown, mean = false) {
  const values = (Array.isArray(list) ? list : []).map(item => key === undefined ? item : read(item, String(key)))
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const total = values.reduce((acc, value) => acc + value, 0);
  return mean && values.length ? total / values.length : total;
}

export function sortBy(list: unknown, key?: unknown, direction?: unknown) {
  return (Array.isArray(list) ? [...list] : []).sort((a, b) => {
    const left = key === undefined ? a : read(a, String(key));
    const right = key === undefined ? b : read(b, String(key));
    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;
    const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left).localeCompare(String(right));
    return direction === "desc" ? -comparison : comparison;
  });
}

export function range(...args: unknown[]) {
  const start = args.length === 1 ? 0 : args[0];
  const end = args.length === 1 ? args[0] : args[1];
  const step = args[2] ?? 1;
  if (![start, end, step].every(value => typeof value === "number" && Number.isFinite(value)) || step === 0) throw new Error("range requires finite numbers and a nonzero step");
  const count = Math.min(1000, Math.max(0, Math.ceil(((end as number) - (start as number)) / (step as number))));
  return Array.from({ length: count }, (_, index) => (start as number) + index * (step as number));
}
