type Options = Record<string, unknown>;
const optionsObject = (value: unknown): Options => value && typeof value === "object" ? value as Options : {};

export function formatNumber(value: unknown, style: unknown = "number", rawOptions?: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "";
  const options = optionsObject(rawOptions);
  const settings: Intl.NumberFormatOptions = {};
  if (style === "compact") settings.notation = "compact";
  if (style === "currency") { settings.style = "currency"; settings.currency = String(options.currency ?? "USD"); }
  if (style === "percent") settings.style = "percent";
  if (options.digits !== undefined) settings.maximumFractionDigits = Number(options.digits);
  if (options.minDigits !== undefined) settings.minimumFractionDigits = Number(options.minDigits);
  if (["auto", "always", "exceptZero", "never"].includes(String(options.sign))) settings.signDisplay = options.sign as Intl.NumberFormatOptions["signDisplay"];
  return `${options.prefix ?? ""}${new Intl.NumberFormat(String(options.locale ?? "en-US"), settings).format(value)}${options.suffix ?? ""}`;
}

/** Axis ticks omit integer decimals unless the caller explicitly requests precision. */
export function formatNumberTick(value: unknown, style: unknown = "number", rawOptions?: unknown) {
  const options = optionsObject(rawOptions);
  return formatNumber(value, style, {
    ...(Number.isInteger(value) && options.digits === undefined && options.minDigits === undefined
      ? { digits: 0, minDigits: 0 }
      : {}),
    ...options
  });
}
