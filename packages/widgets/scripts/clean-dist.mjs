import { rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = resolve(fileURLToPath(import.meta.url), "..");
const packageDir = resolve(scriptDir, "..");

rmSync(resolve(packageDir, "dist"), { recursive: true, force: true });
