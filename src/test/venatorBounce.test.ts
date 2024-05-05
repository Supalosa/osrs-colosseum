import { describe, expect, test } from "vitest";
import { canBounce } from "../venator";

// https://docs.google.com/spreadsheets/d/e/2PACX-1vSN8AyqTbbBAuazJBoqlCw3EuG7_nuW4YVyQDtl6cNlisc1OQj7RAE7qZSrR9YPOl_fYv3-WnGoRIFb/pubhtml
describe("venator bounce tests 1x1 source", () => {
  test("cannot bounce to 1x1 3 tiles away", () => {
    expect(canBounce(0, 0, 1, 3, 0, 1)).toBe(false);
  });
  
  test("can bounce to all 1x1 2 tiles away", () => {
    for (let x = -2; x <= 2; ++x) {
      for (let y = -2; y <= 2; ++y) {
        expect(canBounce(0, 0, 1, x, y, 1)).toBe(true);
      }
    }
  });
});
