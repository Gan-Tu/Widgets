import type { ActionConfig } from "./types";

export type StatePatch =
  | { op: "set"; path: string | Array<string | number>; value: unknown }
  | { op: "append"; path: string | Array<string | number>; value: unknown }
  | { op: "prepend"; path: string | Array<string | number>; value: unknown }
  | { op: "remove"; path: string | Array<string | number> };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function cloneContainer(value: unknown) {
  if (Array.isArray(value)) return [...value];
  if (isRecord(value)) return { ...value };
  return {};
}

function normalizePath(path: string | Array<string | number>) {
  return Array.isArray(path)
    ? path.map(String)
    : path
        .split(".")
        .map((segment) => segment.trim())
        .filter(Boolean);
}

function setChild(container: Record<string, unknown> | unknown[], key: string, value: unknown) {
  if (Array.isArray(container)) {
    if (key === "-") {
      container.push(value);
      return;
    }
    if (key === "-1") {
      container.unshift(value);
      return;
    }
    container[Number(key)] = value;
    return;
  }
  container[key] = value;
}

function getChild(container: Record<string, unknown> | unknown[], key: string) {
  return Array.isArray(container) ? container[Number(key)] : container[key];
}

function removeChild(container: Record<string, unknown> | unknown[], key: string) {
  if (Array.isArray(container)) {
    container.splice(Number(key), 1);
    return;
  }
  delete container[key];
}

function updateAtPath(
  source: unknown,
  path: string | Array<string | number>,
  updater: (current: unknown, parent: Record<string, unknown> | unknown[], key: string) => void
) {
  const segments = normalizePath(path);
  if (!segments.length) return source;

  const root = cloneContainer(source);
  let cursor = root as Record<string, unknown> | unknown[];

  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    const existing = getChild(cursor, key);
    const next = cloneContainer(existing);
    setChild(cursor, key, next);
    cursor = next as Record<string, unknown> | unknown[];
  }

  const leaf = segments[segments.length - 1];
  updater(getChild(cursor, leaf), cursor, leaf);
  return root;
}

function applyPatch(source: unknown, patch: StatePatch) {
  switch (patch.op) {
    case "set":
      return updateAtPath(source, patch.path, (_current, parent, key) => setChild(parent, key, patch.value));
    case "append":
      return updateAtPath(source, patch.path, (current, parent, key) => {
        const list = Array.isArray(current) ? current : [];
        setChild(parent, key, [...list, patch.value]);
      });
    case "prepend":
      return updateAtPath(source, patch.path, (current, parent, key) => {
        const list = Array.isArray(current) ? current : [];
        setChild(parent, key, [patch.value, ...list]);
      });
    case "remove":
      return updateAtPath(source, patch.path, (_current, parent, key) => removeChild(parent, key));
    default:
      return source;
  }
}

export function set(path: string | Array<string | number>, value: unknown): StatePatch {
  return { op: "set", path, value };
}

export function append(path: string | Array<string | number>, value: unknown): StatePatch {
  return { op: "append", path, value };
}

export function prepend(path: string | Array<string | number>, value: unknown): StatePatch {
  return { op: "prepend", path, value };
}

export function remove(path: string | Array<string | number>): StatePatch {
  return { op: "remove", path };
}

export function has(value: unknown) {
  if (Array.isArray(value) || typeof value === "string") return value.length > 0;
  if (isRecord(value)) return Object.keys(value).length > 0;
  return value !== undefined && value !== null && value !== false;
}

export function read(source: unknown, path: string | Array<string | number>, fallback?: unknown) {
  let cursor = source;
  for (const segment of normalizePath(path)) {
    if (cursor == null) return fallback;
    cursor = Array.isArray(cursor)
      ? cursor[Number(segment)]
      : (cursor as Record<string, unknown>)[segment];
  }
  return cursor ?? fallback;
}

export function applyStateAction(state: unknown, action: ActionConfig) {
  let next = state;

  if (isRecord(action.updateState)) {
    next = isRecord(next) ? { ...next, ...action.updateState } : { ...action.updateState };
  }

  if (action.replaceState !== undefined) {
    next = action.replaceState;
  }

  const patches = action.patchState === undefined
    ? []
    : Array.isArray(action.patchState)
    ? action.patchState
    : [action.patchState];

  for (const patch of patches) {
    if (isRecord(patch) && typeof patch.op === "string" && "path" in patch) {
      next = applyPatch(next, patch as StatePatch);
    }
  }

  return next;
}

export function hasStateAction(action: ActionConfig) {
  return (
    action.updateState !== undefined ||
    action.replaceState !== undefined ||
    action.patchState !== undefined
  );
}
