import React from "react";

import { useWidgetAction } from "./context";
import type { ActionConfig } from "./types";

/** useLayoutEffect that no-ops (via useEffect) on the server, avoiding the SSR warning. */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * Dispatch an action with extra payload keys via the dispatcher's second
 * argument: the dispatcher merges the payload itself AND exposes it to
 * deferred $-action expressions — a local pre-merge does neither for
 * deferred actions.
 */
export function useActionInvoker() {
  const dispatch = useWidgetAction();
  return React.useCallback(
    (action: ActionConfig | undefined, payload: Record<string, unknown> = {}) => {
      if (!action || !dispatch) return;
      dispatch(action, payload);
    },
    [dispatch]
  );
}

/**
 * Observe an element's size: runs `onMeasure` once on mount (before paint)
 * and again on every resize. In environments without ResizeObserver, a single
 * requestAnimationFrame retry gives late layout (fonts, images) one more shot.
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onMeasure: (node: T) => void
) {
  const callbackRef = React.useRef(onMeasure);
  callbackRef.current = onMeasure;

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => callbackRef.current(node);

    measure();
    if (typeof ResizeObserver === "undefined") {
      if (typeof window === "undefined") return;
      const frameId = window.requestAnimationFrame(measure);
      return () => window.cancelAnimationFrame(frameId);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [ref]);
}

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
