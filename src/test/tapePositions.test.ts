import { beforeAll, describe, expect, test } from "vitest";
import { LineOfSight } from "../lineOfSight";

describe("tape position recording", () => {
  let los: LineOfSight;

  beforeAll(() => {
    los = new LineOfSight();
    los._setSelected([8, 7], 1);
    los.place();
    los._setSelected([7, 20], 0);
  });

  test("the tape records positions from before the tick's movement", () => {
    los.step();
    // the shaman moves towards the player on this tick...
    expect(los._getMobs()[0][0]).toBe(7);
    expect(los._getMobs()[0][1]).toBe(7);
    // ...but the tape entry for tick 0 must hold its position from before
    // the move (its spawn), because replays are seeded from tape[n] and
    // then re-simulate tick n: seeding with post-move positions makes the
    // replay apply every recorded player position one tick late.
    const value = los.tape[0][0];
    expect((value >> 16) & 0xff).toBe(8);
    expect((value >> 24) & 0xff).toBe(7);
  });

  test("subsequent ticks record the previous tick's end position", () => {
    los.step();
    const value = los.tape[1][0];
    expect((value >> 16) & 0xff).toBe(7);
    expect((value >> 24) & 0xff).toBe(7);
  });
});
