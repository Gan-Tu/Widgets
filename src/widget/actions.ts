import type { ActionConfig } from "./types";

type ClientActionResult =
  | { handled: true; name: string; result?: unknown }
  | { handled: false; name?: string; reason: string };

const scopedClientActions = new Set([
  "copy",
  "add_to_calendar",
  "request_location_permission",
  "open_url",
  "email.mailto",
  "card.open"
]);

function getPayload(action: ActionConfig) {
  return action.payload ?? {};
}

function getClientActionName(action: ActionConfig) {
  return action.type ?? "";
}

function isBrowserRuntime() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

async function copyText(value: unknown) {
  if (value === undefined || value === null) {
    return { handled: false, name: "copy", reason: "copy requires payload.value" } as const;
  }

  const text = String(value);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { handled: true, name: "copy", result: { value: text } } as const;
    } catch {
      // Fall through to the legacy selection-based path below.
    }
  }

  if (!isBrowserRuntime()) {
    return { handled: false, name: "copy", reason: "clipboard is unavailable" } as const;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const success = document.execCommand("copy");
  textarea.remove();

  return success
    ? ({ handled: true, name: "copy", result: { value: text } } as const)
    : ({ handled: false, name: "copy", reason: "copy command failed" } as const);
}

function assertHttpUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

function openHttpUrl(urlValue: unknown): ClientActionResult {
  const url = assertHttpUrl(urlValue);
  if (!url) {
    return { handled: false, name: "open_url", reason: "open_url requires an http(s) payload.url" };
  }
  if (!isBrowserRuntime()) {
    return { handled: false, name: "open_url", reason: "window is unavailable" };
  }
  window.open(url.toString(), "_blank", "noopener,noreferrer");
  return { handled: true, name: "open_url", result: { url: url.toString() } };
}

function normalizeAddressList(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String).join(",");
  return value ? String(value) : "";
}

function runMailto(payload: Record<string, unknown>): ClientActionResult {
  const email =
    typeof payload.email === "object" && payload.email !== null
      ? (payload.email as Record<string, unknown>)
      : payload;

  const to = normalizeAddressList(email.to);
  const params = new URLSearchParams();
  const cc = normalizeAddressList(email.cc);
  const bcc = normalizeAddressList(email.bcc);
  const subject = email.subject ? String(email.subject) : "";
  const body = email.body ? String(email.body) : "";

  if (cc) params.set("cc", cc);
  if (bcc) params.set("bcc", bcc);
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);

  if (!to && !cc && !bcc && !subject && !body) {
    return { handled: false, name: "email.mailto", reason: "email.mailto requires at least one mailto field" };
  }
  if (!isBrowserRuntime()) {
    return { handled: false, name: "email.mailto", reason: "window is unavailable" };
  }

  const href = `mailto:${encodeURIComponent(to)}${params.toString() ? `?${params.toString()}` : ""}`;
  window.location.href = href;
  return { handled: true, name: "email.mailto", result: { href } };
}

function formatCalendarDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const compactDate = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (compactDate) return `${compactDate[1]}${compactDate[2]}${compactDate[3]}`;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function addToCalendar(payload: Record<string, unknown>): ClientActionResult {
  const item =
    typeof payload.item === "object" && payload.item !== null
      ? (payload.item as Record<string, unknown>)
      : payload;
  const title = item.title ? String(item.title) : "";
  const start = formatCalendarDate(item.date_str ?? item.start ?? item.start_date_str);
  const end = formatCalendarDate(item.end_date_str ?? item.end);

  if (!title || !start) {
    return { handled: false, name: "add_to_calendar", reason: "add_to_calendar requires item.title and item.date_str" };
  }
  if (!isBrowserRuntime()) {
    return { handled: false, name: "add_to_calendar", reason: "window is unavailable" };
  }

  const calendarUrl = new URL("https://calendar.google.com/calendar/render");
  calendarUrl.searchParams.set("action", "TEMPLATE");
  calendarUrl.searchParams.set("text", title);
  calendarUrl.searchParams.set("dates", `${start}/${end ?? start}`);
  if (item.location) calendarUrl.searchParams.set("location", String(item.location));
  if (item.description) calendarUrl.searchParams.set("details", String(item.description));
  window.open(calendarUrl.toString(), "_blank", "noopener,noreferrer");
  return { handled: true, name: "add_to_calendar", result: { url: calendarUrl.toString() } };
}

async function requestLocationPermission(): Promise<ClientActionResult> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { handled: false, name: "request_location_permission", reason: "geolocation is unavailable" };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      () => {
        resolve({
          handled: true,
          name: "request_location_permission",
          result: { permission: "granted" }
        });
      },
      (error) => {
        resolve({
          handled: false,
          name: "request_location_permission",
          reason: error.message || "location permission denied"
        });
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout: 10_000 }
    );
  });
}

function openCard(payload: Record<string, unknown>): ClientActionResult {
  if (!isBrowserRuntime()) {
    return { handled: false, name: "card.open", reason: "document is unavailable" };
  }

  const rawCardId = payload.card_id ?? payload.cardId ?? payload.id;
  const cardId = rawCardId ? String(rawCardId) : "";
  if (payload.url) return openHttpUrl(payload.url);

  if (!cardId) {
    window.dispatchEvent(new CustomEvent("widget:card-open", { detail: payload }));
    return { handled: true, name: "card.open", result: { event: "widget:card-open" } };
  }

  const escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(cardId) : cardId.replace(/"/g, '\\"');
  const target = document.querySelector(
    `[data-card-id="${escaped}"], [data-widget-card-id="${escaped}"], #${escaped}`
  );
  target?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  window.dispatchEvent(new CustomEvent("widget:card-open", { detail: { ...payload, card_id: cardId } }));
  return { handled: true, name: "card.open", result: { card_id: cardId, found: Boolean(target) } };
}

export function isScopedClientAction(action: ActionConfig) {
  return scopedClientActions.has(getClientActionName(action));
}

export async function runWidgetClientAction(action: ActionConfig): Promise<ClientActionResult> {
  const name = getClientActionName(action);
  const payload = getPayload(action);

  try {
    switch (name) {
      case "copy":
        return await copyText(payload.value ?? payload.text ?? payload.content);
      case "open_url":
        return openHttpUrl(payload.url);
      case "email.mailto":
        return runMailto(payload);
      case "add_to_calendar":
        return addToCalendar(payload);
      case "request_location_permission":
        return await requestLocationPermission();
      case "card.open":
        return openCard(payload);
      default:
        return { handled: false, name, reason: `Unsupported client action: ${name}` };
    }
  } catch (error) {
    return {
      handled: false,
      name,
      reason: error instanceof Error ? error.message : "Client action failed"
    };
  }
}
