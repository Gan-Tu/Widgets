import React from "react";
import { useLocation } from "react-router-dom";
import { z } from "zod";

import { WidgetRenderer } from "@/widget";

const RenderSchema = z.any();

type RenderPayload = {
  template: string;
  data: unknown;
  theme?: "light" | "dark";
  background?: string;
};

type ParsedPayload = {
  payload: RenderPayload;
  error: string | null;
};

const defaultTemplate = `
<Card size="sm">
  <Title value="Widget preview" size="lg" />
  <Text value="Provide template + data to render." color="secondary" />
</Card>
`.trim();

const defaultPayload: RenderPayload = {
  template: defaultTemplate,
  data: {},
  theme: "light",
  background: "#ffffff"
};

const decodeBase64 = (value: string) => {
  try {
    return atob(value);
  } catch {
    return value;
  }
};

const parsePayload = (search: string): ParsedPayload => {
  const params = new URLSearchParams(search);
  const fromWindow =
    typeof window !== "undefined"
      ? (window as Window & { __WIDGET_INPUT__?: unknown }).__WIDGET_INPUT__
      : undefined;

  let payload: RenderPayload | null = null;
  let error: string | null = null;

  if (fromWindow) {
    if (typeof fromWindow === "string") {
      try {
        payload = JSON.parse(fromWindow) as RenderPayload;
      } catch (innerError) {
        error =
          innerError instanceof Error
            ? innerError.message
            : "Invalid widget payload string";
      }
    } else if (typeof fromWindow === "object") {
      payload = fromWindow as RenderPayload;
    }
  }

  const payloadParam = params.get("payload");
  if (!payload && payloadParam) {
    try {
      payload = JSON.parse(decodeBase64(payloadParam)) as RenderPayload;
    } catch (innerError) {
      error =
        innerError instanceof Error
          ? innerError.message
          : "Invalid payload parameter";
    }
  }

  if (!payload) {
    const templateParam =
      params.get("template64") ?? params.get("template") ?? "";
    const dataParam = params.get("data64") ?? params.get("data") ?? "";
    const themeParam = params.get("theme") ?? undefined;
    const backgroundParam = params.get("background") ?? undefined;

    const template = params.get("template64")
      ? decodeBase64(templateParam)
      : templateParam;
    let data: unknown = {};

    if (dataParam) {
      try {
        data = JSON.parse(
          params.get("data64") ? decodeBase64(dataParam) : dataParam
        );
      } catch (innerError) {
        error =
          innerError instanceof Error
            ? innerError.message
            : "Invalid data parameter";
      }
    }

    payload = {
      template: template || defaultTemplate,
      data,
      theme: themeParam === "dark" ? "dark" : "light",
      background: backgroundParam ?? "#ffffff"
    };
  }

  if (!payload) {
    payload = defaultPayload;
  }

  return { payload, error };
};

export function RenderPage() {
  const location = useLocation();
  const { payload, error } = React.useMemo(
    () => parsePayload(location.search),
    [location.search]
  );

  React.useEffect(() => {
    const background = payload.background ?? "#ffffff";
    document.body.style.background = background;
    document.body.style.backgroundImage = "none";
    document.body.style.margin = "0";
  }, [payload.background]);

  return (
    <div
      data-widget-host
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "24px",
        background: payload.background ?? "#ffffff"
      }}
    >
      {error ? (
        <div
          style={{
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            color: "#dc2626",
            fontSize: "12px"
          }}
        >
          {error}
        </div>
      ) : (
        <WidgetRenderer
          template={payload.template}
          schema={RenderSchema}
          data={payload.data}
          theme={payload.theme ?? "light"}
        />
      )}
    </div>
  );
}
