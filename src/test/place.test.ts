import { beforeEach, describe, expect, test } from "vitest";
import { _getMobs, _setSelected, place, reset, step } from "../main";

describe("placement tests", () => {
  beforeEach(() => {
    reset();
  });

  test("empty state", () => {
    expect(_getMobs()).toEqual([]);
  });

  test("disallow placing mode 0 (player)", () => {
    _setSelected([1, 1], 0);
    place();
    expect(_getMobs()).toEqual([]);
  });

  test("place single npc", () => {
    _setSelected([1, 1], 1);
    place();
    expect(_getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });

  test("disallow placing npcs on top of each other", () => {
    _setSelected([1, 1], 1);
    place();
    _setSelected([1, 1], 1);
    place();
    expect(_getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });
});
