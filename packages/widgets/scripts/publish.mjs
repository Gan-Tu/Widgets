import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const argv = process.env.npm_config_argv ? JSON.parse(process.env.npm_config_argv) : null;
const original = argv?.original ?? [];

if (original[0] === "publish") {
  process.exit(0);
}

if (!process.stdin.isTTY) {
  console.error("Publish requires an interactive terminal to confirm the version bump.");
  process.exit(1);
}

const pkgPath = new URL("../package.json", import.meta.url);
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const currentVersion = pkg.version;

const match = /^(\d+)\.(\d+)\.(\d+)(?:-.+)?$/.exec(currentVersion);
if (!match) {
  console.error(`Unsupported version format: ${currentVersion}`);
  process.exit(1);
}

const nextVersion = `${match[1]}.${Number(match[2]) + 1}.0`;
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question(
  `Bump version ${currentVersion} -> ${nextVersion} and publish? (y/N) `
);
await rl.close();

if (!/^y(es)?$/i.test(answer.trim())) {
  console.log("Publish canceled.");
  process.exit(1);
}

execSync(`npm version ${nextVersion} --no-git-tag-version`, { stdio: "inherit" });
execSync("npm run build", { stdio: "inherit" });
execSync("npm publish --access public --ignore-scripts", { stdio: "inherit" });
