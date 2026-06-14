import React, { createContext, useContext, useMemo, useState } from "react";

import { isScopedClientAction, runWidgetClientAction } from "./actions";
import { resolveDeferredActionExpression } from "./renderer/templateEngine";
import { applyStateAction, hasStateAction } from "./state";
import type { ActionConfig, ThemeMode } from "./types";

type ActionDispatcher = (action: ActionConfig, formData?: Record<string, unknown>) => void;
export type WidgetActionResult = {
  action: ActionConfig;
  formData?: Record<string, unknown>;
  clientResult?: Awaited<ReturnType<typeof runWidgetClientAction>>;
};

const WidgetActionContext = createContext<ActionDispatcher | undefined>(undefined);

export function WidgetActionProvider({
  onAction,
  state,
  onStateChange,
  children
}: {
  onAction?: ActionDispatcher;
  state?: unknown;
  onStateChange?: (updater: (previous: unknown) => unknown) => void;
  children: React.ReactNode;
}) {
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatcher = useMemo<ActionDispatcher>(() => {
    return (action, formData) => {
      const resolvedExpressionAction = resolveDeferredActionExpression(action, {
        state: stateRef.current,
        formData: formData ?? {},
        ...(formData ?? {})
      });
      if (!resolvedExpressionAction) return;
      const shouldForwardAction = Boolean(
        resolvedExpressionAction.type || resolvedExpressionAction.payload
      );
      const payload = formData
        ? { ...(resolvedExpressionAction.payload ?? {}), ...formData }
        : resolvedExpressionAction.payload;
      const resolvedAction = { ...resolvedExpressionAction, payload };
      const carriesStateAction = hasStateAction(resolvedAction);

      if (carriesStateAction) {
        onStateChange?.((previous) => applyStateAction(previous, resolvedAction));
      }

      if (isScopedClientAction(resolvedAction)) {
        void runWidgetClientAction(resolvedAction).then((clientResult) => {
          onAction?.(
            {
              type: resolvedAction.type,
              handler: resolvedAction.handler,
              loadingBehavior: resolvedAction.loadingBehavior,
              payload: {
                ...(resolvedAction.payload ?? {}),
                clientResult
              }
            },
            formData
          );
        });
        return;
      }

      if (shouldForwardAction) {
        onAction?.(
          {
            type: resolvedAction.type,
            payload: resolvedAction.payload,
            handler: resolvedAction.handler,
            loadingBehavior: resolvedAction.loadingBehavior
          },
          formData
        );
      }
    };
  }, [onAction, onStateChange]);

  return (
    <WidgetActionContext.Provider value={dispatcher}>
      {children}
    </WidgetActionContext.Provider>
  );
}

export function useWidgetAction() {
  return useContext(WidgetActionContext);
}

const WidgetThemeContext = createContext<ThemeMode>("light");

export function WidgetThemeProvider({
  theme,
  children
}: {
  theme: ThemeMode;
  children: React.ReactNode;
}) {
  return (
    <WidgetThemeContext.Provider value={theme}>
      {children}
    </WidgetThemeContext.Provider>
  );
}

export function useWidgetTheme() {
  return useContext(WidgetThemeContext);
}

type FormContextValue = {
  values: Record<string, unknown>;
  setValue: (name: string, value: unknown) => void;
};

const WidgetFormContext = createContext<FormContextValue | undefined>(undefined);

function setValueAtPath(
  source: Record<string, unknown>,
  path: string,
  value: unknown
) {
  const result = { ...source };
  const segments = path.split(".");
  let cursor: Record<string, unknown> = result;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const existing = cursor[key];
    if (typeof existing !== "object" || existing === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
  return result;
}

export function WidgetFormProvider({
  children,
  initialValues
}: {
  children: React.ReactNode;
  initialValues?: Record<string, unknown>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(
    initialValues ?? {}
  );

  const setValue = (name: string, value: unknown) => {
    setValues((prev) => setValueAtPath(prev, name, value));
  };

  const contextValue = useMemo(() => ({ values, setValue }), [values]);

  return (
    <WidgetFormContext.Provider value={contextValue}>
      {children}
    </WidgetFormContext.Provider>
  );
}

export function useWidgetForm() {
  return useContext(WidgetFormContext);
}

export function getFormValue(values: Record<string, unknown>, name: string) {
  const segments = name.split(".");
  let cursor: unknown = values;
  for (const segment of segments) {
    if (typeof cursor !== "object" || cursor === null) return undefined;
    cursor = (cursor as Record<string, unknown>)[segment];
  }
  return cursor;
}
