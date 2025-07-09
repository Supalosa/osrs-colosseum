import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { _getMobs, _setSelected, place, remove, setFromWaveStart, step } from "../lineOfSight";
import { Mob } from "../types";
import { checkIdleStep, checkMove } from "./utils";

describe("fromWaveStart tests", () => {
  beforeAll(() => {
    setFromWaveStart(true);
  });

  afterAll(() => {
    setFromWaveStart(false);
  });

  describe("movement checks", () => {
    beforeAll(() => {
      remove();
    });

    const javelin: Mob = [20, 13, 2, 20, 13, 0, null];

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

  
  describe("attack delay checks", () => {
    beforeAll(() => {
      remove();
    });

    const javelin: Mob = [12, 12, 2, 12, 12, 0, null];

    test("place single javelin", () => {
      _setSelected([javelin[0], javelin[1]], javelin[2]);
      place();
      _setSelected([16, 16], 0);
      expect(_getMobs()).toEqual([javelin]);
    });

    test("check npc doesn't attack on first tick", () => {
      step();
      checkIdleStep(javelin);
    });

    test("check npc doesn't attack on second tick", () => {
      step();
      // it moves for one tick but doesn't attack
      checkMove(javelin, 13, 13);
    });

    test("check npc doesn't attack on third tick", () => {
      step();
      checkIdleStep(javelin);
    });

    test("check npc fires on the fourth tick", () => {
      step();
      const mobs = _getMobs();
      expect(mobs[0][5]).toEqual(5);
    });
  });
});
