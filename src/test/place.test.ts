import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { NPC_TYPES } from "../constants";

describe("placement tests", () => {
  let los: LineOfSight;

  beforeEach(() => {
    los = new LineOfSight();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("empty state", () => {
    expect(los._getMobs()).toEqual([]);
  });

  test("disallow placing mode 0 (player)", () => {
    los._setSelected([1, 1], 0);
    los.place();
    expect(los._getMobs()).toEqual([]);
  });

  test("place single npc", () => {
    los._setSelected([1, 1], 1);
    los.place();
    expect(los._getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });

  test("disallow placing npcs on top of each other", () => {
    los._setSelected([1, 1], 1);
    los.place();
    los._setSelected([1, 1], 1);
    los.place();
    expect(los._getMobs()).toEqual([[1, 1, 1, 1, 1, 0, null]]);
  });

  test("randomise spawns without replacement and reset the wave at the current player tile", () => {
    los._setSelected([10, 19], NPC_TYPES.MANTICORE, "r");
    los.place();
    los._setSelected([20, 15], NPC_TYPES.SERPENT_SHAMAN);
    los.place();
    los._setSelected([24, 17], NPC_TYPES.JAGUAR_WARRIOR);
    los.place();
    los._setSelected([16, 18], NPC_TYPES.PLAYER);
    los.step();
    expect(los.getUiState().canSaveReplay).toBe(true);

    los._setSelected([7, 15], NPC_TYPES.PLAYER);
    vi.spyOn(Math, "random").mockReturnValue(0).mockReturnValueOnce(0.999);
    expect(los.randomiseSpawns()).toBe(true);
    const expected = [
      [28, 19, NPC_TYPES.MANTICORE, 28, 19, 0, "u", "u"],
      [13, 14, NPC_TYPES.SERPENT_SHAMAN, 13, 14, 0, null],
      [19, 14, NPC_TYPES.JAGUAR_WARRIOR, 19, 14, 0, null],
    ];
    expect(los._getMobs()).toEqual(expected);
    expect(los.getUiState().canSaveReplay).toBe(false);
    los.reset();
    expect(los._getMobs()).toEqual(expected);
    expect(los.selected).toEqual([7, 15]);
  });

  test("randomise spawns skips the occupied anchor but can use one five tiles away", () => {
    los._setSelected([10, 19], NPC_TYPES.SERPENT_SHAMAN);
    los.place();
    los._setSelected([20, 15], NPC_TYPES.JAGUAR_WARRIOR);
    los.place();
    los._setSelected([3, 19], NPC_TYPES.PLAYER);

    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(los.randomiseSpawns()).toBe(true);
    expect(los._getMobs().map(([x, y]) => [x, y])).toEqual([[9, 17], [3, 14]]);
  });

  test("keeps the setup intact when the unblocked spawns cannot fit the whole wave", () => {
    for (let x = 10; x < 20; x++) {
      los._setSelected([x, 17], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
    }
    los._setSelected([7, 15], NPC_TYPES.PLAYER);
    const before = los._getMobs().map((mob) => [...mob]);
    expect(los.randomiseSpawns()).toBe(false);
    expect(los._getMobs()).toEqual(before);
  });
});
