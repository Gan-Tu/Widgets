import { execSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = resolve(fileURLToPath(import.meta.url), "..");
const packageDir = resolve(scriptDir, "..");
const repoRoot = resolve(packageDir, "..", "..");

const input = resolve(packageDir, "styles.input.css");
const output = resolve(packageDir, "dist", "styles.css");
const content = [
  resolve(repoRoot, "src/widget/**/*.{ts,tsx}"),
  resolve(repoRoot, "src/components/ui/**/*.{ts,tsx}")
].join(",");

mkdirSync(resolve(packageDir, "dist"), { recursive: true });
rmSync(resolve(packageDir, "dist", "widget.css"), { force: true });

const tailwindBin = resolve(repoRoot, "node_modules", ".bin", "tailwindcss");
const command = `\"${tailwindBin}\" -i \"${input}\" -o \"${output}\" --content \"${content}\"`;

execSync(command, { stdio: "inherit" });
