import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { WidgetStateContext, type StateUpdater } from "./binding";
import { isScopedClientAction, runWidgetClientAction } from "./actions";
import { resolveDeferredActionExpression } from "./renderer/templateEngine";
import { useIsomorphicLayoutEffect } from "./hooks";
import { applyStateAction, hasStateAction, read, set } from "./state";
import type { ActionConfig } from "./types";

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
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const updateState = React.useCallback<StateUpdater>((updater) => {
    stateRef.current = updater(stateRef.current);
    onStateChange?.(updater);
  }, [onStateChange]);
  const stateContext = useMemo(() => ({ state, onStateChange: updateState }), [state, updateState]);

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
        updateState((previous) => applyStateAction(previous, resolvedAction));
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
  }, [onAction, updateState]);

  return (
    <WidgetActionContext.Provider value={dispatcher}>
      <WidgetStateContext.Provider value={stateContext}>{children}</WidgetStateContext.Provider>
    </WidgetActionContext.Provider>
  );
}

export function useWidgetAction() {
  return useContext(WidgetActionContext);
}

export { WidgetThemeProvider, useWidgetTheme } from "./theme";

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
  return applyStateAction(source, { patchState: set(path, value) }) as Record<string, unknown>;
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

/**
 * Uniform change-action payload: the new value is exposed under the control's
 * `name` (falling back to "value" for unnamed controls) AND a uniform `value`
 * key, plus any control-specific extras (`checked`, `option`, `date`, ...).
 * Every onChangeAction dispatch goes through here so the contract has one owner.
 */
export function buildChangePayload(
  name: string | undefined,
  value: unknown,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  // Extras spread FIRST: when a control is named after an extra (a DatePicker
  // literally named "date"), the control's own value must win the collision.
  return { ...extras, [name ?? "value"]: value, value };
}

export function getFormValue(values: Record<string, unknown>, name: string) {
  return read(values, name);
}

/** Seed defaults once per named field, without overriding a user's existing value. */
export function useFormDefaultValue(name: string | undefined, defaultValue: unknown) {
  const form = useWidgetForm();
  useEffect(() => {
    if (name && form && defaultValue !== undefined && getFormValue(form.values, name) === undefined) {
      form.setValue(name, defaultValue);
    }
  }, [name, form, defaultValue]);
}
