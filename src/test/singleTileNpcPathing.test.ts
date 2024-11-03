import { beforeAll, describe, test } from "vitest";
import { _setSelected, place, reset, step } from "../lineOfSight";
import { Mob } from "../types";
import { checkMove } from "./utils";

// for example, serpent shaman
describe("single tile NPC pathing", () => {
  const shaman: Mob = [8, 7, 1, 8, 7, 0, null];
  beforeAll(() => {
    // this is a sequential test, so only reset state at the start
    reset();
    _setSelected([shaman[0], shaman[1]], shaman[2]);
    place();
  });

  test("check 1x1 npc cannot move diagonally to path to player", () => {
    _setSelected([7, 20], 0);
    step();
    checkMove(shaman, 7, 7);
    step();
    checkMove(shaman, 7, 8);
  });

  test("check 1x1 npc cannot move diagonally to attack player", () => {
    _setSelected([10, 7], 0);
    step();
    checkMove(shaman, 7, 7, 5);
  });
});
