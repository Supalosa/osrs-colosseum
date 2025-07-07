import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { _getMobs, _setSelected, place, reset, setFromWaveStart, step } from "../lineOfSight";
import { Mob } from "../types";
import { checkMove } from "./utils";

describe("fromWaveStart tests", () => {
  beforeAll(() => {
    // this is a sequential test, so only reset state at the start
    reset();
    setFromWaveStart(true);
  });

  afterAll(() => {
    setFromWaveStart(false);
  })

  test("empty state", () => {
    expect(_getMobs()).toEqual([]);
  });
  
  const javelin: Mob = [20, 13, 2, 20, 13, 0, null] satisfies Mob;

  test("place single javelin", () => {
    _setSelected([javelin[0], javelin[1]], javelin[2]);
    place();
    expect(_getMobs()).toEqual([javelin]);
  });

  test("check npc doesn't move on first tick", () => {
    _setSelected([7, 8], 0);
    step();
    checkMove(javelin, 20, 13);
  });

  test("check npc moves on second tick", () => {
    step();
    checkMove(javelin, 19, 12);
  });
});
