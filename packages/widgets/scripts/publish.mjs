import { execSync } from "node:child_process";

const argv = process.env.npm_config_argv ? JSON.parse(process.env.npm_config_argv) : null;
const original = argv?.original ?? [];

if (original[0] === "publish") {
  process.exit(0);
}

execSync("npm run build", { stdio: "inherit" });
execSync("npm publish --access public --ignore-scripts", { stdio: "inherit" });
