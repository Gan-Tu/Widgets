import React, { createContext, useContext, useMemo, useState } from "react";

import type { ActionConfig, ThemeMode } from "./types";

type ActionDispatcher = (action: ActionConfig, formData?: Record<string, unknown>) => void;

const WidgetActionContext = createContext<ActionDispatcher | undefined>(undefined);

export function WidgetActionProvider({
  onAction,
  children
}: {
  onAction?: ActionDispatcher;
  children: React.ReactNode;
}) {
  const dispatcher = useMemo<ActionDispatcher>(() => {
    return (action, formData) => {
      if (!onAction) return;
      const payload = formData
        ? { ...(action.payload ?? {}), ...formData }
        : action.payload;
      onAction({ ...action, payload }, formData);
    };
  }, [onAction]);

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
