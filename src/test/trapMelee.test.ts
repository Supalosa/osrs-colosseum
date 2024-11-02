import { beforeAll, describe, expect, test } from "vitest";
import { _getMobs, _setSelected, place, reset, step } from "../lineOfSight";
import { Mob } from "../types";
import { checkIdleStep, checkMove } from "./utils";

describe("trapped melee tests", () => {
  beforeAll(() => {
    // this is a sequential test, so only reset state at the start
    reset();
  });

  test("empty state", () => {
    expect(_getMobs()).toEqual([]);
  });

  const meleer: Mob = [8, 13, 3, 8, 13, 0, null];

  test("place single melee npc", () => {
    _setSelected([meleer[0], meleer[1]], meleer[2]);
    place();
    expect(_getMobs()).toEqual([meleer]);
  });

  test("check npc moves towards player", () => {
    _setSelected([7, 8], 0);
    step();
    checkMove(meleer, 7, 12);
  });

  test("check npc gets stuck on pillar", () => {
    step();
    checkMove(meleer, 7, 12);
  });

  test("check npc slides across pillar", () => {
    _setSelected([11, 7], 0);
    step();
    checkMove(meleer, 8, 12);
  });

  test("check npc comes around pillar", () => {
    step();
    checkMove(meleer, 9, 12);
    step();
    checkMove(meleer, 10, 12);
    step();
    // 2x2 npc can move diagonally around pillar
    checkMove(meleer, 11, 11);
    step();
    checkMove(meleer, 11, 10);
    step();
    // attacks player here
    checkMove(meleer, 11, 9, 5);
  });

  test("check npc gets corner trapped", () => {
    _setSelected([10, 7], 0);
    step();
    checkIdleStep(meleer);
  });

  test("check npc is still corner trapped after moving north", () => {
    _setSelected([10, 6], 0);
    step();
    checkMove(meleer, 11, 8);
  });
});
