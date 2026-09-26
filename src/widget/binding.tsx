import React from "react";
import { getFormValue, useWidgetForm } from "./context";
import { useIsomorphicLayoutEffect } from "./hooks";
import { applyStateAction, read, set } from "./state";

export type StateUpdater = (updater: (previous: unknown) => unknown) => void;
export const WidgetStateContext = React.createContext<{ state: unknown; onStateChange?: StateUpdater }>({ state: undefined });
const DefaultsContext = React.createContext<Record<string, unknown>>({});

export function seedStateDefaults(state: unknown, initial: Record<string, unknown>) {
  let next = state;
  for (const [key, value] of Object.entries(initial)) {
    if (read(next, [key]) === undefined) next = applyStateAction(next, { patchState: set([key], value) });
  }
  return next;
}

export function writeBinding(state: unknown, path: string, value: unknown) {
  return applyStateAction(state, { patchState: set(path, value) });
}

/** Seed whole declared roots before a leaf, so sibling defaults cannot be lost. */
export function seedBindingDefault(state: unknown, path: string, value: unknown, defaults: Record<string, unknown>) {
  const next = seedStateDefaults(state, defaults);
  return read(next, path) === undefined ? writeBinding(next, path, value) : next;
}

export function normalizeSliderBinding(value: number | number[]) {
  return Array.isArray(value) && value.length === 1 ? value[0] : value;
}

export function State({ initial = {}, children, renderChildren }: {
  initial?: Record<string, unknown>;
  children?: React.ReactNode;
  renderChildren?: (state: unknown, defaults: Record<string, unknown>) => React.ReactNode;
}) {
  const [defaults] = React.useState(initial);
  const outer = React.useContext(DefaultsContext);
  const { state, onStateChange } = React.useContext(WidgetStateContext);
  const layered = React.useMemo(() => ({ ...outer, ...defaults }), [outer, defaults]);
  const seeded = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    onStateChange?.(previous => seedStateDefaults(previous, layered));
  }, [onStateChange, layered]);
  return <DefaultsContext.Provider value={layered}>
    {renderChildren ? renderChildren(seedStateDefaults(state, layered), defaults) : children}
  </DefaultsContext.Provider>;
}

export function useWidgetStateBinding<T>(bind: string | undefined, fallback: T, seed: unknown = fallback) {
  const { state, onStateChange } = React.useContext(WidgetStateContext);
  const defaults = React.useContext(DefaultsContext);
  const fromState = bind ? read(state, bind) : undefined;
  const fromDefaults = bind ? read(seedStateDefaults(state, defaults), bind) : undefined;
  const value = (fromState !== undefined ? fromState : fromDefaults !== undefined ? fromDefaults : fallback) as T;
  const [initial] = React.useState(() => ({ bind, value: fromDefaults !== undefined ? fromDefaults : seed, defaults }));
  const seeded = React.useRef(false);
  useIsomorphicLayoutEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    if (initial.bind && initial.value !== undefined) {
      onStateChange?.(previous => seedBindingDefault(previous, initial.bind!, initial.value, initial.defaults));
    }
  }, [initial, onStateChange]);
  const setValue = (next: T) => {
    if (bind) onStateChange?.(previous => writeBinding(previous, bind, next));
  };
  return [value, setValue, Boolean(bind)] as const;
}

export function fieldId(name?: string) {
  return name?.replace(/[^a-zA-Z0-9_-]/g, "-");
}

/** Shared controlled/bound/form/local precedence, preserving each control's payload. */
export function useControlValue<T>({ bind, name: explicitName, value: controlled, defaultValue, fallback, toForm }: {
  bind?: string; name?: string; value?: T; defaultValue?: T; fallback: T; toForm?: (value: T) => unknown;
}) {
  const name = explicitName ?? bind;
  const form = useWidgetForm();
  const [local, setLocal] = React.useState(defaultValue ?? fallback);
  const [bound, setBound, isBound] = useWidgetStateBinding(bind, local, defaultValue);
  const stored = name && form ? getFormValue(form.values, name) : undefined;
  const value = controlled !== undefined ? controlled : isBound ? bound : stored !== undefined ? stored as T : local;
  const formValue = toForm ? toForm(value) : value;
  const serialized = JSON.stringify(formValue);
  React.useEffect(() => {
    if (name && form && (controlled !== undefined || isBound || stored === undefined) && JSON.stringify(stored) !== serialized) {
      form.setValue(name, formValue);
    }
  }, [name, form, controlled, isBound, stored, serialized, formValue]);
  const update = (next: T) => {
    setLocal(next);
    setBound(next);
    if (name && form) {
      const submitted = controlled !== undefined ? controlled : next;
      form.setValue(name, toForm ? toForm(submitted) : submitted);
    }
  };
  return [value, update, name] as const;
}
