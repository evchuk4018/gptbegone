import { describe, expect, it } from "vitest";
import { normalizeMode } from "./mode";

describe("normalizeMode", () => {
  it("forces thinking false when flash is true", () => {
    expect(normalizeMode({ thinking: true, flash: true })).toEqual({
      thinking: false,
      flash: true
    });
  });

  it("keeps mode unchanged when flash is false", () => {
    expect(normalizeMode({ thinking: true, flash: false })).toEqual({
      thinking: true,
      flash: false
    });
  });
});
