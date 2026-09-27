import { parseExpression } from "@babel/parser";
import { format } from "prettier/standalone";
import * as babel from "prettier/plugins/babel";
import * as estree from "prettier/plugins/estree";
import { highlightCode } from "./highlight.ts";

const metadata = new Set([
  "start", "end", "loc", "extra", "comments", "leadingComments", "trailingComments", "innerComments", "errors"
]);

function templateContent(source: string) {
  const ast = parseExpression(source, { plugins: ["jsx", "typescript"] });
  return JSON.stringify(ast, (key, value) => {
    if (metadata.has(key)) return undefined;
    if (key === "children" && Array.isArray(value)) {
      // Match the renderer's JSX text normalization, not React's whitespace rules.
      return value.filter((child) => child.type !== "JSXText" || child.value.trim())
        .map((child) => child.type === "JSXText"
          ? { type: "JSXText", value: child.value.replace(/\s+/g, " ").trim() }
          : child);
    }
    return value;
  });
}

/** Format a single widget expression without evaluating it or changing its data. */
export async function formatWidgetTemplate(source: string): Promise<string> {
  if (!source.trim()) return source;

  // Prettier accepts $props, but JSX cannot parse DIL's *component props.
  // Only rename actual attribute tokens; never rewrite quoted values or text.
  let prefix = "__widgetFormat_";
  while (source.includes(prefix)) prefix += "_";
  const normalized = highlightCode(source, "widget").map((token) =>
    token.kind === "binding" && token.text.startsWith("*")
      ? prefix + token.text.slice(1)
      : token.text
  ).join("");
  const originalContent = templateContent(normalized);

  const formatted = await format(normalized, {
    parser: "babel-ts",
    plugins: [babel, estree],
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: false,
    embeddedLanguageFormatting: "off"
  });

  // Prettier prints a program and may prepend an ASI safety semicolon to JSX.
  // The widget renderer accepts a single expression, so omit that one token.
  let firstToken = true;
  const expression = highlightCode(formatted, "widget").map((token) => {
    if (firstToken && token.kind !== "comment" && token.text.trim()) {
      firstToken = false;
      if (token.text === ";") return "";
    }
    return token.text;
  }).join("").trim();

  if (templateContent(expression) !== originalContent) {
    throw new Error("Formatting would change the template's content. The original was kept.");
  }

  return highlightCode(expression, "widget").map((token) =>
    token.kind === "attribute" && token.text.startsWith(prefix)
      ? "*" + token.text.slice(prefix.length)
      : token.text
  ).join("");
}
