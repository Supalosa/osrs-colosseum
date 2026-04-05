import { beforeAll, describe, expect, test } from "vitest";
import { LineOfSight} from "../lineOfSight";
import { Mob } from "../types";
import { checkIdleStep, checkMove } from "./utils";

describe("fromWaveStart tests", () => {
  let los: LineOfSight;

  describe("movement checks", () => {
    const javelin: Mob = [20, 13, 2, 20, 13, 0, null];

    beforeAll(() => {
      los = new LineOfSight();
      los.setFromWaveStart(true);
    });

    test("place single javelin", () => {
      los._setSelected([javelin[0], javelin[1]], javelin[2]);
      los.place();
      expect(los._getMobs()).toEqual([javelin]);
    });

    test("check npc doesn't move on first tick", () => {
      los._setSelected([7, 8], 0);
      los.step();
      checkMove(los, javelin, 20, 13);
    });

    test("check npc moves on second tick", () => {
      los.step();
      checkMove(los, javelin, 19, 12);
    });
  });

  
  describe("attack delay checks", () => {
    const javelin: Mob = [12, 12, 2, 12, 12, 0, null];
    beforeAll(() => {
      los = new LineOfSight();
      los.setFromWaveStart(true);
    });

    test("place single javelin", () => {
      los._setSelected([javelin[0], javelin[1]], javelin[2]);
      los.place();
      los._setSelected([16, 16], 0);
      expect(los._getMobs()).toEqual([javelin]);
    });

    test("check npc doesn't attack on first tick", () => {
      los.step();
      checkIdleStep(los, javelin);
    });

    test("check npc doesn't attack on second tick", () => {
      los.step();
      // it moves for one tick but doesn't attack
      checkMove(los, javelin, 13, 13);
    });

    test("check npc doesn't attack on third tick", () => {
      los.step();
      checkIdleStep(los, javelin);
    });

    test("check npc fires on the fourth tick", () => {
      los.step();
      const mobs = los._getMobs();
      expect(mobs[0][5]).toEqual(5);
    });
  });
});
