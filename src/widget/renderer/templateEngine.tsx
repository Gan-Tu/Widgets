import React from "react";
import { parseExpression } from "@babel/parser";
import type * as t from "@babel/types";

import type { ComponentRegistry } from "../registry";

type Scope = Record<string, unknown>;

/**
 * Lightweight template engine for Widget UI.
 * Supports JSX elements, property bindings, conditionals, and Array.map loops.
 */
const templateCache = new Map<string, t.Expression>();

export function parseTemplate(template: string) {
  const cached = templateCache.get(template);
  if (cached) return cached;
  const parsed = parseExpression(template, {
    plugins: ["jsx", "typescript"]
  }) as t.Expression;
  templateCache.set(template, parsed);
  return parsed;
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
  child: t.JSXText | t.JSXExpressionContainer | t.JSXElement | t.JSXFragment | t.JSXSpreadChild,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode[] {
  if (child.type === "JSXSpreadChild") {
    return [];
  }
  if (child.type === "JSXText") {
    const text = child.value.replace(/\s+/g, " ").trim();
    if (text) {
      console.warn("Text nodes are not allowed in Widget UI templates.");
    }
    return [];
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
  return [renderJSX(child, scope, registry)];
}

function renderJSX(
  node: t.JSXElement,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode {
  const nameNode = node.openingElement.name;
  const componentName =
    nameNode.type === "JSXIdentifier"
      ? nameNode.name
      : nameNode.type === "JSXMemberExpression"
      ? nameNode.property.name
      : "";

  const Component = registry[componentName];
  if (!Component) {
    throw new Error(`Unknown widget component: ${componentName}`);
  }

  const props: Record<string, unknown> = {};
  node.openingElement.attributes.forEach((attr) => {
    if (attr.type !== "JSXAttribute") return;
    const key = attr.name.name as string;
    if (attr.value === null || attr.value === undefined) {
      props[key] = true;
      return;
    }
    if (attr.value.type === "StringLiteral") {
      props[key] = attr.value.value;
      return;
    }
    if (attr.value.type === "JSXExpressionContainer") {
      props[key] = evaluateExpression(attr.value.expression, scope, registry);
    }
  });

  const children = node.children.flatMap((child) =>
    normalizeChild(child, scope, registry)
  );

  const textOnlyComponents = new Set([
    "Text",
    "Title",
    "Caption",
    "Badge",
    "Button",
    "Label",
    "Markdown"
  ]);
  const filteredChildren =
    textOnlyComponents.has(componentName) ? [] : children;

  return React.createElement(Component, props, ...filteredChildren);
}

export function renderTemplate(
  template: string,
  scope: Scope,
  registry: ComponentRegistry
): React.ReactNode {
  const ast = parseTemplate(template);
  return evaluateExpression(ast, scope, registry) as React.ReactNode;
}
