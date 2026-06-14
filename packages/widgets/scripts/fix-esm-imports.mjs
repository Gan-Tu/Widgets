import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = resolve(fileURLToPath(import.meta.url), "..");
const packageDir = resolve(scriptDir, "..");
const distDir = resolve(packageDir, "dist");

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      yield* walk(path);
    } else if (path.endsWith(".js") || path.endsWith(".d.ts")) {
      yield path;
    }
  }
}

function hasKnownExtension(specifier) {
  return Boolean(extname(specifier));
}

function resolveSpecifier(filePath, specifier) {
  if (!specifier.startsWith(".")) return specifier;
  if (hasKnownExtension(specifier)) return specifier;

  const target = resolve(dirname(filePath), specifier);
  if (existsSync(`${target}.js`)) return `${specifier}.js`;
  if (existsSync(join(target, "index.js"))) return `${specifier}/index.js`;

  return specifier;
}

const fromPattern = /(from\s*["'])(\.{1,2}\/[^"']+)(["'])/g;
const importPattern = /(import\s*["'])(\.{1,2}\/[^"']+)(["'])/g;

for (const filePath of walk(distDir)) {
  const source = readFileSync(filePath, "utf8");
  const next = source
    .replace(fromPattern, (_match, prefix, specifier, suffix) => {
      return `${prefix}${resolveSpecifier(filePath, specifier)}${suffix}`;
    })
    .replace(importPattern, (_match, prefix, specifier, suffix) => {
      return `${prefix}${resolveSpecifier(filePath, specifier)}${suffix}`;
    });

  if (next !== source) {
    writeFileSync(filePath, next);
  }
}
