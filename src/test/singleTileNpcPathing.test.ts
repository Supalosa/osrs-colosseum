import { beforeAll, describe, test } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { Mob } from "../types";
import { checkMove } from "./utils";

// for example, serpent shaman
describe("single tile NPC pathing", () => {
  let los: LineOfSight;

  const shaman: Mob = [8, 7, 1, 8, 7, 0, null];
  beforeAll(() => {
    // this is a sequential test, so only reset state at the start
    los = new LineOfSight();
    los._setSelected([shaman[0], shaman[1]], shaman[2]);
    los.place();
  });

  test("check 1x1 npc cannot move diagonally to path to player", () => {
    los._setSelected([7, 20], 0);
    los.step();
    checkMove(los, shaman, 7, 7);
    los.step();
    checkMove(los, shaman, 7, 8);
  });

  test("check 1x1 npc cannot move diagonally to attack player", () => {
    los._setSelected([10, 7], 0);
    los.step();
    checkMove(los, shaman, 7, 7, 5);
  });
});
