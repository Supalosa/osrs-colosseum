import { beforeAll, describe, expect, test } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { Mob } from "../types";
import { checkIdleStep, checkMove } from "./utils";

describe("trapped melee tests", () => {
  let los: LineOfSight;

  beforeAll(() => {
    // this is a sequential test, so only reset state at the start
    los = new LineOfSight();
  });

  test("empty state", () => {
    expect(los._getMobs()).toEqual([]);
  });

  const meleer: Mob = [8, 13, 3, 8, 13, 0, null];

  test("place single melee npc", () => {
    los._setSelected([meleer[0], meleer[1]], meleer[2]);
    los.place();
    expect(los._getMobs()).toEqual([meleer]);
  });

  test("check npc moves towards player", () => {
    los._setSelected([7, 8], 0);
    los.step();
    checkMove(los, meleer, 7, 12);
  });

  test("check npc gets stuck on pillar", () => {
    los.step();
    checkMove(los, meleer, 7, 12);
  });

  test("check npc slides across pillar", () => {
    los._setSelected([11, 7], 0);
    los.step();
    checkMove(los, meleer, 8, 12);
  });

  test("check npc comes around pillar", () => {
    los.step();
    checkMove(los, meleer, 9, 12);
    los.step();
    checkMove(los, meleer, 10, 12);
    los.step();
    // 2x2 npc can move diagonally around pillar
    checkMove(los, meleer, 11, 11);
    los.step();
    checkMove(los, meleer, 11, 10);
    los.step();
    // attacks player here
    checkMove(los, meleer, 11, 9, 5);
  });

  test("check npc gets corner trapped", () => {
    los._setSelected([10, 7], 0);
    los.step();
    checkIdleStep(los, meleer);
  });

  test("check npc is still corner trapped after moving north", () => {
    los._setSelected([10, 6], 0);
    los.step();
    checkMove(los, meleer, 11, 8);
  });
});
