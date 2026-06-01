import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const requiredFiles = [
  "manifest.webmanifest",
  "sw.js",
  "icons/workout-192.png",
  "icons/workout-512.png",
  "icons/workout-maskable-192.png",
  "icons/workout-maskable-512.png"
];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const distDir = path.resolve(process.cwd(), "dist");
  const missing = [];

  for (const rel of requiredFiles) {
    const fullPath = path.join(distDir, rel);
    // eslint-disable-next-line no-await-in-loop
    const found = await exists(fullPath);
    if (!found) {
      missing.push(rel);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required PWA artifacts: ${missing.join(", ")}`);
  }

  const manifestPath = path.join(distDir, "manifest.webmanifest");
  const raw = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(raw);
  const iconSet = new Set((manifest.icons ?? []).map((icon) => icon.src));
  const requiredManifestIcons = [
    "/icons/workout-192.png",
    "/icons/workout-512.png",
    "/icons/workout-maskable-192.png",
    "/icons/workout-maskable-512.png"
  ];

  for (const icon of requiredManifestIcons) {
    if (!iconSet.has(icon)) {
      throw new Error(`Manifest icon is missing: ${icon}`);
    }
  }

  if (manifest.start_url !== "/workout") {
    throw new Error(`Manifest start_url must be /workout, got: ${manifest.start_url}`);
  }
}

main();
