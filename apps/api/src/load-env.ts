import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

type EnvRecord = Record<string, string>;

function parseEnvFile(contents: string): EnvRecord {
  const lines: readonly string[] = contents.split(/\r?\n/);
  const env: EnvRecord = {};
  for (const line of lines) {
    const trimmed: string = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex: number = trimmed.indexOf("=");
    if (eqIndex <= 0) {
      continue;
    }
    const key: string = trimmed.slice(0, eqIndex).trim();
    const rawValue: string = trimmed.slice(eqIndex + 1).trim();
    const unquotedValue: string = rawValue.replace(/^"|"$/g, "").replace(/^'|'$/g, "");
    env[key] = unquotedValue;
  }
  return env;
}

function applyEnvFile(filePath: string): void {
  if (!existsSync(filePath)) {
    return;
  }
  const fileContents: string = readFileSync(filePath, "utf8");
  const envFromFile: EnvRecord = parseEnvFile(fileContents);
  for (const [key, value] of Object.entries(envFromFile)) {
    if (process.env[key] === undefined || key === "DATABASE_URL") {
      process.env[key] = value;
    }
  }
}

/** Load repo + app env files before any module reads DATABASE_URL. */
export function loadEnvFiles(): void {
  const currentFilePath: string = fileURLToPath(import.meta.url);
  const currentDir: string = dirname(currentFilePath);
  const packageDir: string = resolve(currentDir, "..");
  const repoRoot: string = resolve(packageDir, "..", "..");
  const candidatePaths: readonly string[] = [
    resolve(repoRoot, "apps/saas-web/.env.local"),
    resolve(repoRoot, ".env.local"),
    resolve(repoRoot, ".env"),
    resolve(packageDir, ".env.local"),
    resolve(packageDir, ".env"),
  ];
  for (const filePath of candidatePaths) {
    applyEnvFile(filePath);
  }
}

loadEnvFiles();
