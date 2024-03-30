import { expect } from "vitest";
import { Mob, MobExtra, MobSpec } from "../types";
import { _getMobs } from "../main";

export const createMob = (
  x: number,
  y: number,
  type: number,
  extra?: MobExtra
): MobSpec => [x, y, type, extra ?? null];

export const checkMove = (
  npc: Mob,
  x: number,
  y: number,
  attacked: number | false = false
) => {
  npc[0] = x;
  npc[1] = y;
  if (!attacked) {
    npc[5]--;
  } else {
    npc[5] = attacked;
  }
  expect(_getMobs()).toContainEqual(npc);
};

export const checkIdleStep = (npc: Mob) => {
  npc[5]--;
  expect(_getMobs()).toContainEqual(npc);
};
