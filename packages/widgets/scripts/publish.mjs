import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
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
const originalPackageJson = readFileSync(pkgPath, "utf8");
const pkg = JSON.parse(originalPackageJson);
const currentVersion = pkg.version;
const registry =
  process.env.npm_config_registry ??
  captureNpm(["config", "get", "registry"]) ??
  "https://registry.npmjs.org/";

function runNpm(args) {
  execFileSync("npm", args, { stdio: "inherit" });
}

function captureNpm(args) {
  try {
    return execFileSync("npm", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return undefined;
  }
}

function requireNpmAuth() {
  const user = captureNpm(["whoami", `--registry=${registry}`]);
  if (!user) {
    console.error(`Not authenticated to ${registry}.`);
    console.error("Run `npm login --registry=https://registry.npmjs.org/` or configure an npm token, then retry.");
    process.exit(1);
  }
  console.log(`Authenticated to ${registry} as ${user}.`);
}

function restorePackageVersion() {
  writeFileSync(pkgPath, originalPackageJson);
}

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

const publishedVersion = captureNpm(["view", pkg.name, "version", `--registry=${registry}`]);
if (publishedVersion) {
  console.log(`Latest published ${pkg.name} version is ${publishedVersion}.`);
}

requireNpmAuth();

try {
  runNpm(["version", nextVersion, "--no-git-tag-version"]);
  runNpm(["run", "build"]);
  runNpm(["publish", "--access", "public", "--ignore-scripts", `--registry=${registry}`]);
} catch (error) {
  restorePackageVersion();
  console.error(`Publish failed. Restored ${pkg.name} package.json to v${currentVersion}.`);
  console.error("If npm asks for OTP or publish permission, rerun after completing npm auth for this account.");
  throw error;
}
