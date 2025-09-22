import { expect } from "vitest";
import { Mob, MobExtra, MobSpec } from "../types";
import { _getMobs } from "../lineOfSight";

export const createMob = (
  x: number,
  y: number,
  type: number,
  extra?: MobExtra
): MobSpec => [x, y, type, extra ?? null];

export const checkMove = (
  // note: this NPC gets MUTATED so it is expected not to be what is passed out of _getMobs()
  mutableNpc: Mob,
  x: number,
  y: number,
  attacked: number | false = false
) => {
  mutableNpc[0] = x;
  mutableNpc[1] = y;
  if (!attacked) {
    mutableNpc[5]--;
  } else {
    mutableNpc[5] = attacked;
  }
  expect(_getMobs()).toContainEqual(mutableNpc);
};

export const checkPosition = (npc: Mob, x: number, y: number) => {
  expect(npc[0]).toBe(x);
  expect(npc[1]).toBe(y);
};

export const checkIdleStep = (npc: Mob) => {
  npc[5]--;
  expect(_getMobs()).toContainEqual(npc);
};
