import React from "react";

import { useWidgetAction } from "./context";
import type { ActionConfig } from "./types";

export function useVisibleAction<T extends HTMLElement>(
  actionConfig?: ActionConfig,
  threshold = 0.5
) {
  const action = useWidgetAction();
  const ref = React.useRef<T | null>(null);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !actionConfig || !action || firedRef.current) return;

    if (typeof IntersectionObserver === "undefined") {
      action(actionConfig, { cause: "system" });
      firedRef.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || firedRef.current) return;
        firedRef.current = true;
        action(actionConfig, { cause: "system" });
        observer.disconnect();
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [action, actionConfig, threshold]);

  return ref;
}

export function useActionHandler(actionConfig?: ActionConfig) {
  const action = useWidgetAction();

  return React.useCallback(
    (formData?: Record<string, unknown>) => {
      if (!actionConfig || !action) return;
      action(actionConfig, formData);
    },
    [action, actionConfig]
  );
}
