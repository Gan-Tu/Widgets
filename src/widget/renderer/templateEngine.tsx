import React from "react";
import { parseExpression } from "@babel/parser";
import type * as t from "@babel/types";

import type { ComponentRegistry } from "../registry";
import { append, has, prepend, read, remove, set } from "../state";
import type { ActionConfig } from "../types";

type Scope = Record<string, unknown>;
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
  const normalizedTemplate = normalizeDILSyntax(template);
  const cached = templateCache.get(normalizedTemplate);
  if (cached) return cached;
  const parsed = parseExpression(normalizedTemplate, {
    plugins: ["jsx", "typescript"]
  }) as t.Expression;
  templateCache.set(normalizedTemplate, parsed);
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
      return scope[node.name];
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
      throw new Error(`Unsupported logical operator: ${node.operator}`);
    }
    case "ConditionalExpression": {
      const test = evaluateExpression(node.test, scope, registry);
      return test
        ? evaluateExpression(node.consequent, scope, registry)
        : evaluateExpression(node.alternate, scope, registry);
    }
    case "MemberExpression": {
      const object = evaluateExpression(node.object, scope, registry);
      const property = node.computed
        ? evaluateExpression(node.property, scope, registry)
        : (node.property as t.Identifier).name;
      if (object == null) return undefined;
      const record = object as Record<string, unknown>;
      return record[property as string];
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
            property.key.type === "Identifier"
              ? property.key.name
              : property.key.type === "StringLiteral"
              ? property.key.value
              : String(evaluateExpression(property.key, scope, registry));
          result[key] = evaluateExpression(property.value, scope, registry);
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
    case "CallExpression": {
      if (node.callee.type === "Identifier") {
        const args = node.arguments.map((argument) =>
          argument.type === "SpreadElement" ? undefined : evaluateExpression(argument, scope, registry)
        );
        switch (node.callee.name) {
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

      if (
        node.callee.type === "MemberExpression" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "map"
      ) {
        const target = evaluateExpression(node.callee.object, scope, registry);
        if (!Array.isArray(target)) return [];
        const callback = node.arguments[0];
        if (!callback || callback.type !== "ArrowFunctionExpression") {
          throw new Error("Only arrow functions are supported in map().");
        }
        return target.map((item, index) => {
          const childScope: Scope = { ...scope };
          const params = callback.params;
          if (params[0] && params[0].type === "Identifier") {
            childScope[params[0].name] = item;
          }
          if (params[1] && params[1].type === "Identifier") {
            childScope[params[1].name] = index;
          }
          if (callback.body.type === "BlockStatement") {
            const returnStatement = callback.body.body.find(
              (statement) => statement.type === "ReturnStatement"
            ) as t.ReturnStatement | undefined;
            if (!returnStatement || !returnStatement.argument) return null;
            return evaluateExpression(returnStatement.argument, childScope, registry);
          }
          return evaluateExpression(callback.body, childScope, registry);
        });
      }
      throw new Error("Only .map() calls are supported in templates.");
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
    return evaluateTemplateExpression(expression, scope, registry);
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
  if (child.type === "JSXSpreadChild") {
    return [];
  }
  if (child.type === "JSXText") {
    const text = child.value.replace(/\s+/g, " ").trim();
    return text ? [text] : [];
  }
  if (child.type === "JSXExpressionContainer") {
    const value = evaluateExpression(child.expression, scope, registry);
    if (Array.isArray(value)) return value as React.ReactNode[];
    if (value === false || value === null || value === undefined) return [];
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
    if (attr.type !== "JSXAttribute") return;
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
    getJSXComponentName(child.openingElement.name) === "Show.Else"
  );
}

function renderShow(
  node: t.JSXElement,
  props: Record<string, unknown>,
  scope: Scope,
  registry: ComponentRegistry
) {
  const shouldShow = props.when !== false && props.visible !== false;
  const mainChildren = node.children.filter((child) => !isElseElement(child));
  const elseNode = node.children.find(isElseElement) as t.JSXElement | undefined;
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
    return itemProps.when !== false;
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
  if (componentName === "Scope") {
    return renderScoped(node, props, scope, registry);
  }
  if (componentName === "Animate") {
    return renderAnimate(node, props, scope, registry);
  }
  if (componentName === "Show.Else" || componentName === "Animate.Item") {
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
