import { beforeEach, describe, expect, test } from "vitest";
import { LineOfSight } from "../lineOfSight";

describe("player WASD movement", () => {
  let los: LineOfSight;

  beforeEach(() => {
    los = new LineOfSight();
    los._setSelected([15, 15], 0);
  });

  test("walks 1 tile when run is off", () => {
    los.setRun(false);
    los.movePlayer(0, -1); // W
    expect(los.selected).toEqual([15, 14]);
  });

  test("runs 2 tiles when run is on", () => {
    los.setRun(true);
    los.movePlayer(0, -1); // W
    expect(los.selected).toEqual([15, 13]);
  });

  test("moves diagonally", () => {
    los.setRun(false);
    los.movePlayer(1, -1); // W+D
    expect(los.selected).toEqual([16, 14]);
    los.movePlayer(-1, 1); // S+A
    expect(los.selected).toEqual([15, 15]);
  });

  test("runs 2 tiles diagonally", () => {
    los.setRun(true);
    los.movePlayer(-1, 1); // S+A
    expect(los.selected).toEqual([13, 17]);
  });

  test("blocked by pillars", () => {
    // pillar occupies x 8-10, y 8-10 (base [8, 10], size 3)
    los._setSelected([7, 9], 0);
    los.setRun(false);
    los.movePlayer(1, 0); // D into the pillar
    expect(los.selected).toEqual([7, 9]);
  });

  test("cannot cut corners diagonally, slides along instead", () => {
    // pillar at base [8, 10] occupies x 8-10, y 8-10; player just west of its
    // south-west corner
    los._setSelected([7, 10], 0);
    los.setRun(false);
    los.movePlayer(1, 1); // S+D: diagonal target [8, 11] is free, but the
    // cardinal tile [8, 10] is pillar, so the corner cannot be cut
    expect(los.selected).toEqual([7, 11]);
  });

  test("run stops early when second tile is blocked", () => {
    los._setSelected([6, 9], 0);
    los.setRun(true);
    los.movePlayer(1, 0); // D; second tile [8, 9] is pillar
    expect(los.selected).toEqual([7, 9]);
  });

  test("each move advances the simulation by one tick, even at run", () => {
    los.setRun(true);
    expect(los.tickCount).toEqual(0);
    los.movePlayer(0, -1);
    expect(los.tickCount).toEqual(1);
    los.setRun(false);
    los.movePlayer(0, -1);
    expect(los.tickCount).toEqual(2);
  });

  test("a fully blocked move does not advance the tick", () => {
    los._setSelected([7, 9], 0);
    los.setRun(false);
    los.movePlayer(1, 0); // D into the pillar
    expect(los.selected).toEqual([7, 9]);
    expect(los.tickCount).toEqual(0);
  });

  test("reset returns the player to where they stood before the first move", () => {
    los.setRun(true);
    los.movePlayer(0, -1);
    los.movePlayer(0, -1);
    expect(los.selected).toEqual([15, 11]);
    los.reset();
    expect(los.selected).toEqual([15, 15]);
  });
});
