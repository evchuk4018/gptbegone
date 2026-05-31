import type { ChatMode } from "../types";

export function normalizeMode(mode: ChatMode): ChatMode {
  if (mode.flash) {
    return { flash: true, thinking: false };
  }
  return mode;
}
