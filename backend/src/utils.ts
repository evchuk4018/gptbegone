import path from "node:path";
import { randomUUID } from "node:crypto";

export const appDataDir = path.resolve(process.cwd(), "data");
export const defaultModelsDir = path.resolve(process.cwd(), "models", "llama-cpp");

export function createId(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function assertNever(_: never): never {
  throw new Error("Unexpected value");
}
