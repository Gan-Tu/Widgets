import { Layers2 } from "lucide-react";
import type { WidgetAppearance } from "@/widget/types";

export function AppearanceToggle({ appearance, onChange }: {
  appearance: WidgetAppearance;
  onChange: (appearance: WidgetAppearance) => void;
}) {
  const enabled = appearance === "glass";
  return (
    <button
      type="button"
      className="appearance-toggle"
      aria-label="Liquid glass appearance"
      aria-pressed={enabled}
      title={enabled ? "Switch to standard appearance" : "Try liquid glass appearance"}
      onClick={() => onChange(enabled ? "default" : "glass")}
    >
      <Layers2 size={15} strokeWidth={1.6} aria-hidden />
      <span>Glass</span>
      <span className="appearance-toggle-indicator" aria-hidden><span /></span>
    </button>
  );
}
