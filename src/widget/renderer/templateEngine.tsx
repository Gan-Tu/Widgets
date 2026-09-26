import React from "react";
import { parseExpression } from "@babel/parser";
import type * as t from "@babel/types";

import type { ComponentRegistry } from "../registry";
import { append, has, prepend, read, remove, set, safeLookup, forbiddenProperties } from "../state";
import type { ActionConfig } from "../types";

import { formatNumber } from "../format";
import { aggregate, formatDate, range, sortBy } from "./expressionHelpers";

export const WIDGET_THEME = Symbol("widgetTheme");
type Scope = Record<string | symbol, unknown>;
type JSXChild =
  | t.JSXText
  | t.JSXExpressionContainer
  | t.JSXElement
  | t.JSXFragment
  | t.JSXSpreadChild;

/**
 * Lightweight template engine for Widget UI.
 * Supports JSX elements, property bindings, DIL control flow, conditionals, and Array.map loops.
 */
// Bounded LRU: live editors (e.g. the playground) insert a new AST per keystroke,
// so an unbounded cache grows without limit over a session. The cache is shared
// by full widget templates AND per-attribute sub-expressions, so the limit must
// comfortably exceed the docs + gallery working set (~160 templates + ~60
// expressions) or a single browsing session thrashes it.
const TEMPLATE_CACHE_LIMIT = 600;
const templateCache = new Map<string, t.Expression>();
export const WIDGET_ACTION_EXPRESSION = "__widgetActionExpression";

type DeferredActionExpression = {
  [WIDGET_ACTION_EXPRESSION]: string;
  scope: Scope;
};

function normalizeDILSyntax(template: string) {
  return template.replace(/(\s)\*([A-Za-z_$][\w$-]*)=/g, "$1__dilComponentProp_$2=");
}

export function parseTemplate(template: string) {
  // Key the cache on the raw template so warm hits skip the normalization
  // regex scan entirely (parseTemplate runs once per template plus once per
  // $prop expression on every render).
  const cached = templateCache.get(template);
  if (cached) {
    // Refresh recency only near capacity: parseTemplate is called once per
    // $prop per render, and a Map delete+set per hit is pure overhead until
    // eviction pressure actually exists.
    if (templateCache.size > TEMPLATE_CACHE_LIMIT * 0.8) {
      templateCache.delete(template);
      templateCache.set(template, cached);
    }
    return cached;
  }
  const parsed = parseExpression(normalizeDILSyntax(template), {
    plugins: ["jsx", "typescript"]
  }) as t.Expression;
  if (templateCache.size >= TEMPLATE_CACHE_LIMIT) {
    const oldest = templateCache.keys().next().value;
    if (oldest !== undefined) templateCache.delete(oldest);
  }
  templateCache.set(template, parsed);
  return parsed;
}

function getViewportWidth() {
  return typeof window === "undefined" ? 1024 : window.innerWidth;
}

function currentBreakpoint() {
  const width = getViewportWidth();
  if (width >= 1280) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  if (width >= 640) return "sm";
  return "base";
}

const callbackMethods = new Set(["map", "filter", "find", "findIndex", "some", "every", "reduce"]);
const arrayMethods = new Set([...callbackMethods, "slice", "join", "includes", "indexOf", "concat", "at", "flat"]);
const stringMethods = new Set(["slice", "substring", "toUpperCase", "toLowerCase", "trim", "includes", "startsWith", "endsWith", "split", "padStart", "padEnd", "replaceAll", "at"]);

function callSafeMethod(target: unknown, method: string, args: unknown[]): unknown {
  const number = (index: number, fallback?: number) => {
    const value = args[index] === undefined ? fallback : args[index];
    if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) throw new Error(`${method} requires numeric arguments`);
    return value;
  };
  const string = (index: number, fallback?: string) => {
    const value = args[index] === undefined ? fallback : args[index];
    if (value !== undefined && typeof value !== "string") throw new Error(`${method} requires string arguments`);
    return value as string;
  };
  const primitive = (index: number) => {
    const value = args[index];
    if (value !== null && !["undefined", "string", "number", "boolean"].includes(typeof value)) throw new Error(`${method} requires primitive arguments`);
    return value;
  };
  if (Array.isArray(target)) {
    switch (method) {
      case "slice": return Array.prototype.slice.call(target, number(0), number(1));
      case "join": return Array.prototype.join.call(target, string(0));
      case "includes": return Array.prototype.includes.call(target, primitive(0), number(1));
      case "indexOf": return Array.prototype.indexOf.call(target, primitive(0), number(1));
      case "concat": return Array.prototype.concat.call(target, ...args);
      case "at": return Array.prototype.at.call(target, number(0, 0)!);
      case "flat": {
        const depth = number(0, 1)!;
        if (depth < 0 || depth > 2) throw new Error("flat depth must be between 0 and 2");
        return Array.prototype.flat.call(target, depth);
      }
    }
  }
  if (typeof target === "string") {
    switch (method) {
      case "slice": return String.prototype.slice.call(target, number(0), number(1));
      case "substring": return String.prototype.substring.call(target, number(0, 0)!, number(1));
      case "toUpperCase": return String.prototype.toUpperCase.call(target);
      case "toLowerCase": return String.prototype.toLowerCase.call(target);
      case "trim": return String.prototype.trim.call(target);
      case "includes": return String.prototype.includes.call(target, string(0), number(1));
      case "startsWith": return String.prototype.startsWith.call(target, string(0), number(1));
      case "endsWith": return String.prototype.endsWith.call(target, string(0), number(1));
      case "split": return (String.prototype.split as (separator?: string, limit?: number) => string[]).call(target, string(0), number(1));
      case "padStart": return String.prototype.padStart.call(target, number(0, 0)!, string(1));
      case "padEnd": return String.prototype.padEnd.call(target, number(0, 0)!, string(1));
      case "replaceAll": {
        if (typeof args[0] !== "string" || typeof args[1] !== "string") throw new Error("replaceAll requires string arguments");
        return (String.prototype.replaceAll as (search: string, replacement: string) => string).call(target, args[0], args[1]);
      }
      case "at": return String.prototype.at.call(target, number(0, 0)!);
    }
  }
  if (typeof target === "number" && method === "toFixed") {
    const digits = number(0, 0)!;
    if (!Number.isInteger(digits) || digits < 0 || digits > 20) throw new Error("toFixed digits must be between 0 and 20");
    return Number.prototype.toFixed.call(target, digits);
  }
  throw new Error(`Unsupported method: ${method}`);
}

function evaluateExpression(
  node: t.Node,
  scope: Scope,
  registry: ComponentRegistry
): unknown {
  switch (node.type) {
    case "StringLiteral":
      return node.value;
    case "NumericLiteral":
      return node.value;
    case "BooleanLiteral":
      return node.value;
    case "NullLiteral":
      return null;
    case "Identifier": {
      if (node.name === "undefined") return undefined;
      if (node.name === "null") return null;
      return safeLookup(scope, node.name);
    }
    case "TemplateLiteral": {
      let result = "";
      node.quasis.forEach((quasi, index) => {
        result += quasi.value.cooked ?? "";
        const expr = node.expressions[index];
        if (expr) {
          const value = evaluateExpression(expr, scope, registry);
          result += value !== undefined && value !== null ? String(value) : "";
        }
      });
      return result;
    }
    case "BinaryExpression": {
      const left = evaluateExpression(node.left, scope, registry);
      const right = evaluateExpression(node.right, scope, registry);
      const leftNumber = typeof left === "number" ? left : Number(left);
      const rightNumber = typeof right === "number" ? right : Number(right);
      switch (node.operator) {
        case "+":
          return typeof left === "string" || typeof right === "string"
            ? `${left ?? ""}${right ?? ""}`
            : leftNumber + rightNumber;
        case "-":
          return leftNumber - rightNumber;
        case "*":
          return leftNumber * rightNumber;
        case "/":
          return leftNumber / rightNumber;
        case "%":
          return leftNumber % rightNumber;
        case "==":
          return left == right;
        case "!=":
          return left != right;
        case "===":
          return left === right;
        case "!==":
          return left !== right;
        case ">":
          return leftNumber > rightNumber;
        case "<":
          return leftNumber < rightNumber;
        case ">=":
          return leftNumber >= rightNumber;
        case "<=":
          return leftNumber <= rightNumber;
        default:
          throw new Error(`Unsupported binary operator: ${node.operator}`);
      }
    }
    case "LogicalExpression": {
      const left = evaluateExpression(node.left, scope, registry);
      if (node.operator === "&&") {
        return left && evaluateExpression(node.right, scope, registry);
      }
      if (node.operator === "||") {
        return left || evaluateExpression(node.right, scope, registry);
      }
      if (node.operator === "??") return left ?? evaluateExpression(node.right, scope, registry);
      throw new Error(`Unsupported logical operator: ${node.operator}`);
    }
    case "ConditionalExpression": {
      const test = evaluateExpression(node.test, scope, registry);
      return test
        ? evaluateExpression(node.consequent, scope, registry)
        : evaluateExpression(node.alternate, scope, registry);
    }
    case "OptionalMemberExpression":
    case "MemberExpression": {
      const object = evaluateExpression(node.object, scope, registry);
      if (object == null) return undefined;
      const property = node.computed
        ? evaluateExpression(node.property, scope, registry)
        : (node.property as t.Identifier).name;
      return safeLookup(object, property);
    }
    case "ArrayExpression":
      return node.elements.map((element) =>
        element ? evaluateExpression(element, scope, registry) : null
      );
    case "ObjectExpression": {
      const result: Record<string, unknown> = {};
      node.properties.forEach((property) => {
        if (property.type === "ObjectProperty") {
          const key =
            property.computed ? String(evaluateExpression(property.key, scope, registry)) : property.key.type === "Identifier"
              ? property.key.name
              : property.key.type === "StringLiteral"
              ? property.key.value
              : String(evaluateExpression(property.key, scope, registry));
          if (!forbiddenProperties.has(key)) result[key] = evaluateExpression(property.value, scope, registry);
        } else {
          throw new Error(`Unsupported expression: ${property.type}`);
        }
      });
      return result;
    }
    case "UnaryExpression": {
      const value = evaluateExpression(node.argument, scope, registry) as
        | string
        | number
        | boolean;
      switch (node.operator) {
        case "!":
          return !value;
        case "+":
          return +value;
        case "-":
          return -value;
        default:
          throw new Error(`Unsupported unary operator: ${node.operator}`);
      }
    }
    case "OptionalCallExpression":
    case "CallExpression": {
      if (node.callee.type === "Identifier") {
        const args = node.arguments.map((argument) =>
          evaluateExpression(argument, scope, registry)
        );
        switch (node.callee.name) {
          case "format": return formatNumber(args[0], args[1], args[2]);
          case "formatDate": return formatDate(args[0], args[1], args[2]);
          case "sum": return aggregate(args[0], args[1]);
          case "avg": return aggregate(args[0], args[1], true);
          case "sortBy": return sortBy(args[0], args[1], args[2]);
          case "range": return range(...args);
          case "clamp": return Math.min(Number(args[2]), Math.max(Number(args[1]), Number(args[0])));
          case "abs": return Math.abs(Number(args[0]));
          case "pluralize": return `${formatNumber(args[0])} ${args[0] === 1 ? args[1] : args[2] ?? `${args[1]}s`}`;
          case "theme": return scope[WIDGET_THEME] ?? "light";
          case "size": {
            const target = args[0];
            if (Array.isArray(target) || typeof target === "string") return target.length;
            if (target && typeof target === "object") return Object.keys(target).length;
            return 0;
          }
          case "String":
            return String(args[0] ?? "");
          case "Number":
            return Number(args[0]);
          case "Boolean":
            return Boolean(args[0]);
          case "min":
            return Math.min(...args.map(Number));
          case "max":
            return Math.max(...args.map(Number));
          case "round":
            return Math.round(Number(args[0]));
          case "floor":
            return Math.floor(Number(args[0]));
          case "ceil":
            return Math.ceil(Number(args[0]));
          case "now":
            return Date.now();
          case "set":
            return set(String(args[0] ?? ""), args[1]);
          case "append":
            return append(String(args[0] ?? ""), args[1]);
          case "prepend":
            return prepend(String(args[0] ?? ""), args[1]);
          case "remove":
            return remove(String(args[0] ?? ""));
          case "has":
            return has(args[0]);
          case "read":
            return read(args[0], String(args[1] ?? ""), args[2]);
          case "bp":
            return currentBreakpoint();
          case "isMobile":
            return getViewportWidth() < 768;
          case "isDark":
            return typeof window !== "undefined" && window.matchMedia
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
              : false;
          case "bind":
            return { bind: args[0] };
          case "expr":
            return args[0];
          case "isSafeExpr":
            return true;
          case "mutateExpr":
          case "closeExpr":
            return args[0];
          default:
            break;
        }
      }

      if (node.callee.type === "MemberExpression" || node.callee.type === "OptionalMemberExpression") {
        const member = node.callee;
        const target = evaluateExpression(member.object, scope, registry);
        if (target == null && (node.type === "OptionalCallExpression" || (member.type === "OptionalMemberExpression" && member.optional))) return undefined;
        const method = member.computed ? evaluateExpression(member.property, scope, registry) : (member.property as t.Identifier).name;
        if (typeof method !== "string" || forbiddenProperties.has(method)) throw new Error(`Unsupported method: ${String(method)}`);
        const supported = Array.isArray(target) ? arrayMethods.has(method)
          : typeof target === "string" ? stringMethods.has(method)
          : typeof target === "number" && method === "toFixed";
        if (!supported) throw new Error(`Unsupported method: ${method}`);
        if (Array.isArray(target) && callbackMethods.has(method)) {
          const callback = node.arguments[0];
          if (!callback || callback.type !== "ArrowFunctionExpression" || callback.async || callback.params.some(param => param.type !== "Identifier")) {
            throw new Error(`Only arrow functions with named parameters are supported in ${method}().`);
          }
          if (method === "reduce" && node.arguments.length < 2) throw new Error("reduce requires an initial value");
          const invoke = (...values: unknown[]) => {
            const childScope = { ...scope };
            callback.params.forEach((param, index) => { if (param.type === "Identifier") childScope[param.name] = values[index]; });
            if (callback.body.type === "BlockStatement") {
              if (callback.body.body.some(statement => statement.type !== "ReturnStatement" && statement.type !== "EmptyStatement")) throw new Error("Only a return statement is supported in callbacks");
              const returned = callback.body.body.find(statement => statement.type === "ReturnStatement");
              return returned?.argument ? evaluateExpression(returned.argument, childScope, registry) : undefined;
            }
            return evaluateExpression(callback.body, childScope, registry);
          };
          switch (method) {
            case "map": return Array.prototype.map.call(target, invoke);
            case "filter": return Array.prototype.filter.call(target, invoke);
            case "find": return Array.prototype.find.call(target, invoke);
            case "findIndex": return Array.prototype.findIndex.call(target, invoke);
            case "some": return Array.prototype.some.call(target, invoke);
            case "every": return Array.prototype.every.call(target, invoke);
            case "reduce": return Array.prototype.reduce.call(target, invoke, evaluateExpression(node.arguments[1], scope, registry));
          }
        }
        const args = node.arguments.map(argument => evaluateExpression(argument, scope, registry));
        return callSafeMethod(target, method, args);
      }
      throw new Error("Unsupported function call");
    }

    case "ParenthesizedExpression":
      return evaluateExpression(node.expression, scope, registry);
    case "JSXElement":
      return renderJSX(node, scope, registry);
    case "JSXFragment":
      return renderFragment(node, scope, registry);
    case "JSXExpressionContainer":
      return evaluateExpression(node.expression, scope, registry);
    default:
      throw new Error(`Unsupported expression: ${node.type}`);
  }
}

export function evaluateTemplateExpression(
  expression: string,
  scope: Scope,
  registry: ComponentRegistry = {}
) {
  return evaluateExpression(parseTemplate(expression), scope, registry);
}

function evaluateStringExpression(
  expression: string,
  scope: Scope,
  registry: ComponentRegistry
) {
  try {
    return evaluateExpression(parseTemplate(expression), scope, registry);
  } catch (error) {
    console.warn(
      `[WidgetRenderer] Failed to evaluate expression "${expression}":`,
      error
    );
    return undefined;
  }
}

function createDeferredActionExpression(
  expression: string,
  scope: Scope
): DeferredActionExpression {
  return { [WIDGET_ACTION_EXPRESSION]: expression, scope };
}

export function resolveDeferredActionExpression(
  action: unknown,
  scope: Scope
): ActionConfig | undefined {
  if (
    typeof action === "object" &&
    action !== null &&
    WIDGET_ACTION_EXPRESSION in action &&
    typeof (action as DeferredActionExpression)[WIDGET_ACTION_EXPRESSION] === "string"
  ) {
    const deferred = action as DeferredActionExpression;
    const resolved = evaluateTemplateExpression(
      deferred[WIDGET_ACTION_EXPRESSION],
      { ...deferred.scope, ...scope }
    );
    return typeof resolved === "object" && resolved !== null
      ? (resolved as ActionConfig)
      : undefined;
  }
  return action as ActionConfig;
}

function getJSXComponentName(nameNode: t.JSXElement["openingElement"]["name"]): string {
  if (nameNode.type === "JSXIdentifier") return nameNode.name;
  if (nameNode.type === "JSXMemberExpression") {
    return `${getJSXComponentName(nameNode.object as t.JSXElement["openingElement"]["name"])}.${nameNode.property.name}`;
  }
  return "";
}

function renderFragment(
  node: t.JSXFragment,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode {
  const children = node.children.flatMap((child) =>
    normalizeChild(child, scope, registry)
  );
  return React.createElement(React.Fragment, null, ...children);
}

function normalizeChild(
  child: JSXChild,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode[] {
  if (child.type === "JSXSpreadChild") throw new Error("Spread children are unsupported");
  if (child.type === "JSXText") {
    const text = child.value.replace(/\s+/g, " ").trim();
    return text ? [text] : [];
  }
  if (child.type === "JSXExpressionContainer") {
    const value = evaluateExpression(child.expression, scope, registry);
    if (Array.isArray(value)) {
      const dropFunctions = (value: unknown): React.ReactNode => Array.isArray(value)
        ? value.map(dropFunctions)
        : typeof value === "function" ? null : value as React.ReactNode;
      return value.map(dropFunctions);
    }
    if (typeof value === "function" || value === false || value === null || value === undefined) return [];
    return [value as React.ReactNode];
  }
  if (child.type === "JSXFragment") {
    return [renderFragment(child, scope, registry)];
  }
  const value = renderJSX(child, scope, registry);
  return Array.isArray(value) ? value : [value];
}

function renderChildren(
  children: JSXChild[],
  scope: Scope,
  registry: ComponentRegistry
) {
  return children.flatMap((child) => normalizeChild(child, scope, registry));
}

function withImplicitKeys(children: React.ReactNode[], prefix: string) {
  return children.map((child, index) => {
    if (!React.isValidElement(child) || child.key != null) return child;
    return React.cloneElement(child, { key: `${prefix}-${index}` });
  });
}

function buildProps(
  node: t.JSXElement,
  scope: Scope,
  registry: ComponentRegistry
) {
  const props: Record<string, unknown> = {};
  node.openingElement.attributes.forEach((attr) => {
    if (attr.type !== "JSXAttribute") throw new Error("Spread attributes are unsupported");
    const rawKey = attr.name.name as string;
    const isComponentProp = rawKey.startsWith("__dilComponentProp_");
    const isExpressionProp = rawKey.startsWith("$");
    const key = isComponentProp
      ? rawKey.replace("__dilComponentProp_", "")
      : isExpressionProp
      ? rawKey.slice(1)
      : rawKey;
    const isActionExpressionProp = isExpressionProp && key.endsWith("Action");
    if (attr.value === null || attr.value === undefined) {
      props[key] = true;
      return;
    }
    if (attr.value.type === "StringLiteral") {
      props[key] = isActionExpressionProp
        ? createDeferredActionExpression(attr.value.value, scope)
        : isExpressionProp
        ? evaluateStringExpression(attr.value.value, scope, registry)
        : attr.value.value;
      return;
    }
    if (attr.value.type === "JSXExpressionContainer") {
      props[key] = evaluateExpression(attr.value.expression, scope, registry);
    }
  });
  for (const key of Object.keys(props)) {
    if (typeof props[key] === "function") props[key] = undefined;
  }
  return props;
}

function renderRepeatedChildren(
  node: t.JSXElement,
  props: Record<string, unknown>,
  scope: Scope,
  registry: ComponentRegistry,
  componentName: "Each" | "AnimateGroup"
) {
  const items = Array.isArray(props.of) ? props.of : [];
  const itemName = typeof props.item === "string" ? props.item : "item";
  const indexName = typeof props.index === "string" ? props.index : "index";
  const Component = registry[componentName];
  const rendered = items.map((item, index) => {
    const childScope = { ...scope, [itemName]: item, [indexName]: index };
    return React.createElement(
      React.Fragment,
      { key: String((item as Record<string, unknown>)?.id ?? index) },
      ...renderChildren(node.children, childScope, registry)
    );
  });

  if (componentName === "Each" || !Component) return rendered;
  return React.createElement(Component, props, ...rendered);
}

function isElseElement(child: JSXChild) {
  return (
    child.type === "JSXElement" &&
    ["Show.Else", "Show.ElseIf"].includes(getJSXComponentName(child.openingElement.name))
  );
}

// `when`/`visible` use plain truthiness when the attribute is present, and
// default to showing when it's absent. Presence is checked with `in` on the
// built props: buildProps assigns the key for every JSX attribute (including
// `$`- and `*`-prefixed forms, and expressions that evaluate to undefined),
// so `"when" in props` is exactly attribute-presence — a value check alone
// would wrongly treat `$when="item.popular"` on items without the field as
// "show".
function renderShow(
  node: t.JSXElement,
  props: Record<string, unknown>,
  scope: Scope,
  registry: ComponentRegistry
) {
  const shouldShow =
    "when" in props || "visible" in props ? Boolean(props.when ?? props.visible) : true;
  const mainChildren = node.children.filter((child) => !isElseElement(child));
  const branches = node.children.filter(isElseElement) as t.JSXElement[];
  const elseNode = shouldShow ? undefined : branches.find(child =>
    getJSXComponentName(child.openingElement.name) === "Show.ElseIf" && Boolean(buildProps(child, scope, registry).when)
  ) ?? branches.find(child => getJSXComponentName(child.openingElement.name) === "Show.Else");
  const children = shouldShow
    ? renderChildren(mainChildren, scope, registry)
    : elseNode
    ? renderChildren(elseNode.children, scope, registry)
    : [];
  return withImplicitKeys(children, "show");
}

function renderScoped(
  node: t.JSXElement,
  props: Record<string, unknown>,
  scope: Scope,
  registry: ComponentRegistry
) {
  const values =
    typeof props.values === "object" && props.values !== null
      ? (props.values as Scope)
      : {};
  const childScope = { ...scope, ...values };
  return withImplicitKeys(renderChildren(node.children, childScope, registry), "scope");
}

function renderAnimate(
  node: t.JSXElement,
  props: Record<string, unknown>,
  scope: Scope,
  registry: ComponentRegistry
) {
  const itemNodes = node.children.filter(
    (child): child is t.JSXElement =>
      child.type === "JSXElement" &&
      getJSXComponentName(child.openingElement.name) === "Animate.Item"
  );
  const selected = itemNodes.find((itemNode) => {
    const itemProps = buildProps(itemNode, scope, registry);
    return "when" in itemProps ? Boolean(itemProps.when) : true;
  });
  const children = selected ? renderChildren(selected.children, scope, registry) : [];
  const Component = registry.Animate ?? React.Fragment;
  return React.createElement(Component, props, ...children);
}

function renderJSX(
  node: t.JSXElement,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode {
  const componentName = getJSXComponentName(node.openingElement.name);

  const props = buildProps(node, scope, registry);

  if (componentName === "Each" || componentName === "AnimateGroup") {
    return renderRepeatedChildren(node, props, scope, registry, componentName);
  }
  if (componentName === "Show") {
    return renderShow(node, props, scope, registry);
  }
  if (componentName === "State") {
    return React.createElement(registry.State, {
      ...props,
      renderChildren: (state: unknown, defaults: Scope) => {
        const declared = Object.fromEntries(Object.keys(defaults).map(key => [key, safeLookup(state, key)]));
        return withImplicitKeys(renderChildren(node.children, {
          ...scope, ...declared, state, [WIDGET_THEME]: scope[WIDGET_THEME]
        }, registry), "state");
      }
    });
  }
  if (componentName === "Scope") {
    return renderScoped(node, props, scope, registry);
  }
  if (componentName === "Animate") {
    return renderAnimate(node, props, scope, registry);
  }
  if (componentName === "Show.Else" || componentName === "Show.ElseIf" || componentName === "Animate.Item") {
    return null;
  }

  const Component = registry[componentName];
  if (!Component) {
    throw new Error(`Unknown widget component: ${componentName}`);
  }

  const children = renderChildren(node.children, scope, registry);

  return React.createElement(Component, props, ...children);
}

export function renderTemplate(
  template: string,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode {
  const ast = parseTemplate(template);
  return evaluateExpression(ast, scope, registry) as React.ReactNode;
}
