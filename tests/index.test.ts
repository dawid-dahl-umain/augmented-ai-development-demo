import { describe, it, expect } from "vitest";
import { greet } from "../src/index.ts";

describe("greet", () => {
  it("returns greeting for provided name", () => {
    // Given
    const name = "CLI";
    // When
    const result = greet(name);
    // Then
    expect(result).toBe("Hello, CLI!");
  });
});
