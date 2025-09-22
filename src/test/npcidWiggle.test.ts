import { beforeAll, describe, expect, test } from "vitest";
import { _getMobs, _setSelected, NPC_TYPES, place, remove, step } from "../lineOfSight";
import { checkPosition } from "./utils";

// tests that shamans wiggle correctly
describe("wiggling tests", () => {
  describe("placement order", () => {
    test("check npcs are sorted by npcid", () => {
      _setSelected([0, 0], NPC_TYPES.SERPENT_SHAMAN);
      place();
      _setSelected([0, 1], NPC_TYPES.SHOCKWAVE_COLOSSUS);
      place();
      _setSelected([0, 2], NPC_TYPES.MINOTAUR);
      place();
      _setSelected([0, 3], NPC_TYPES.JAVELIN_COLOSSUS);
      place();
      _setSelected([0, 4], NPC_TYPES.MANTICORE);
      place();
      const mobs = _getMobs();
      expect(mobs.map(mob => mob[2])).toEqual([NPC_TYPES.MANTICORE, NPC_TYPES.SERPENT_SHAMAN, NPC_TYPES.JAVELIN_COLOSSUS, NPC_TYPES.SHOCKWAVE_COLOSSUS, NPC_TYPES.MINOTAUR]);
    });
  });

  describe("shaman front, manti back", () => {
    beforeAll(() => {
      remove();
      _setSelected([11, 9], NPC_TYPES.SERPENT_SHAMAN);
      place();
      _setSelected([12, 9], NPC_TYPES.MANTICORE);
      place();
    });

    test("check manticore moves before shaman", () => {
      // manti wiggles north
      _setSelected([7, 8], NPC_TYPES.PLAYER);
      step();
      const [manticore, shaman] = _getMobs();
      checkPosition(manticore, 11, 8);
      checkPosition(shaman, 11, 9);
    });
  });

  describe("manti front, shaman back", () => {
    beforeAll(() => {
      remove();
      _setSelected([11, 9], NPC_TYPES.MANTICORE);
      place();
      _setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      place();
    });

    test("check manticore moves before shaman", () => {
      // manti wiggles north, and shaman moves west
      _setSelected([7, 8], NPC_TYPES.PLAYER);
      step();
      const [manticore] = _getMobs();
      checkPosition(manticore, 11, 8);
    });

    test("check shaman wiggles west", () => {
      const [, shaman] = _getMobs();
      checkPosition(shaman, 13, 9);
    })
  });

  describe("javelin front, shaman back", () => {
    beforeAll(() => {
      remove();
      _setSelected([11, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      place();
      _setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      place();
    });

    test("check shaman moves before javelin", () => {
      // no destacking north
      _setSelected([7, 8], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin] = _getMobs();
      checkPosition(shaman, 14, 8);
      checkPosition(javelin, 11, 8);
    });

    test("check javelin wiggles west", () => {
      // no destacking south
      _setSelected([7, 10], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin] = _getMobs();
      checkPosition(shaman, 14, 9);
      checkPosition(javelin, 11, 9);
    })
  });


  describe("shaman front, javelin back", () => {
    beforeAll(() => {
      remove();
      _setSelected([12, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      place();
      _setSelected([11, 9], NPC_TYPES.SERPENT_SHAMAN);
      place();
    });

    test("check shaman moves before javelin", () => {
      // no destacking north
      _setSelected([7, 8], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin] = _getMobs();
      checkPosition(shaman, 11, 8);
      checkPosition(javelin, 12, 8);
    });

    test("check javelin wiggles west", () => {
      // destacking south: shaman moves south, javelin moves west
      _setSelected([7, 10], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin] = _getMobs();
      checkPosition(shaman, 11, 9);
      checkPosition(javelin, 11, 8);
    })
  });

  describe("javelin -> shaman -> javelin", () => {
    beforeAll(() => {
      remove();
      _setSelected([11, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      place();
      _setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      place();
      _setSelected([15, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      place();
    });

    test("check shaman moves before javelins", () => {
      // no destacking north
      _setSelected([7, 8], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin, javelin2] = _getMobs();
      checkPosition(shaman, 14, 8);
      checkPosition(javelin, 11, 8);
      checkPosition(javelin2, 15, 8);
    });

    test("check javelin wiggles west", () => {
      // destacking south: front jav and shaman moves south, back javelin moves west
      _setSelected([7, 10], NPC_TYPES.PLAYER);
      step();
      const [shaman, javelin, javelin2] = _getMobs();
      checkPosition(shaman, 14, 9);
      checkPosition(javelin, 11, 9);
      checkPosition(javelin2, 14, 8);
    })
  });
});