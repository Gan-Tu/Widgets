import type { z } from "zod";
import { WidgetRenderer, type WidgetRendererProps } from "@/widget/WidgetRenderer";
import { useWidgetAppearance } from "@/widget/theme";
import { GlassPreview } from "./GlassPreview";

export function SiteWidgetRenderer<T extends z.ZodTypeAny>(props: WidgetRendererProps<T>) {
  const inherited = useWidgetAppearance();
  const glass = (props.appearance ?? inherited) === "glass";
  // Keep the same tree when switching appearance, preserving form and control state.
  return <GlassPreview className={glass ? "site-glass-preview" : "site-glass-preview site-glass-preview--standard"} enabled={glass} theme={props.theme}>
    <WidgetRenderer {...props} />
  </GlassPreview>;
}
