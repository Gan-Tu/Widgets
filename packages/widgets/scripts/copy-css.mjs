import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, "..");
const repoRoot = resolve(packageDir, "..", "..");

const source = resolve(repoRoot, "src/widget/widget.css");
const target = resolve(packageDir, "dist/widget.css");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
