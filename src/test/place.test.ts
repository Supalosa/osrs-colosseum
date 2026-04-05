import { beforeEach, describe, expect, test } from "vitest";
import { LineOfSight } from "../lineOfSight";

describe("placement tests", () => {
  let los: LineOfSight;

  beforeEach(() => {
    los = new LineOfSight();
  });

  test("empty state", () => {
    expect(los._getMobs()).toEqual([]);
  });

  test("disallow placing mode 0 (player)", () => {
    los._setSelected([1, 1], 0);
    los.place();
    expect(los._getMobs()).toEqual([]);
  });

  test("place single npc", () => {
    los._setSelected([1, 1], 1);
    los.place();
    expect(los._getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });

  test("disallow placing npcs on top of each other", () => {
    los._setSelected([1, 1], 1);
    los.place();
    los._setSelected([1, 1], 1);
    los.place();
    expect(los._getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });
});
