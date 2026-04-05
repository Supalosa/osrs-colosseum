import { beforeAll, describe, expect, test } from "vitest";
import { LineOfSight } from "../lineOfSight";
import { checkPosition } from "./utils";
import { NPC_TYPES } from "../constants";

// tests that shamans wiggle correctly
describe("wiggling tests", () => {
  let los: LineOfSight;

  describe("placement order", () => {
    test("check npcs are sorted by npcid", () => {
      los = new LineOfSight();
      los._setSelected([0, 0], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
      los._setSelected([0, 1], NPC_TYPES.SHOCKWAVE_COLOSSUS);
      los.place();
      los._setSelected([0, 2], NPC_TYPES.MINOTAUR);
      los.place();
      los._setSelected([0, 3], NPC_TYPES.JAVELIN_COLOSSUS);
      los.place();
      los._setSelected([0, 4], NPC_TYPES.MANTICORE);
      los.place();
      const mobs = los._getMobs();
      expect(mobs.map(mob => mob[2])).toEqual([NPC_TYPES.MANTICORE, NPC_TYPES.SERPENT_SHAMAN, NPC_TYPES.JAVELIN_COLOSSUS, NPC_TYPES.SHOCKWAVE_COLOSSUS, NPC_TYPES.MINOTAUR]);
    });
  });

  describe("shaman front, manti back", () => {
    beforeAll(() => {
      los = new LineOfSight();
      los._setSelected([11, 9], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
      los._setSelected([12, 9], NPC_TYPES.MANTICORE);
      los.place();
    });

    test("check manticore moves before shaman", () => {
      // manti wiggles north
      los._setSelected([7, 8], NPC_TYPES.PLAYER);
      los.step();
      const [manticore, shaman] = los._getMobs();
      checkPosition(manticore, 11, 8);
      checkPosition(shaman, 11, 9);
    });
  });

  describe("manti front, shaman back", () => {
    beforeAll(() => {
      los.remove();
      los._setSelected([11, 9], NPC_TYPES.MANTICORE);
      los.place();
      los._setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
    });

    test("check manticore moves before shaman", () => {
      // manti wiggles north, and shaman moves west
      los._setSelected([7, 8], NPC_TYPES.PLAYER);
      los.step();
      const [manticore] = los._getMobs();
      checkPosition(manticore, 11, 8);
    });

    test("check shaman wiggles west", () => {
      const [, shaman] = los._getMobs();
      checkPosition(shaman, 13, 9);
    })
  });

  describe("javelin front, shaman back", () => {
    beforeAll(() => {
      los.remove();
      los._setSelected([11, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      los.place();
      los._setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
    });

    test("check shaman moves before javelin", () => {
      // no destacking north
      los._setSelected([7, 8], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin] = los._getMobs();
      checkPosition(shaman, 14, 8);
      checkPosition(javelin, 11, 8);
    });

    test("check javelin wiggles west", () => {
      // no destacking south
      los._setSelected([7, 10], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin] = los._getMobs();
      checkPosition(shaman, 14, 9);
      checkPosition(javelin, 11, 9);
    })
  });


  describe("shaman front, javelin back", () => {
    beforeAll(() => {
      los.remove();
      los._setSelected([12, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      los.place();
      los._setSelected([11, 9], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
    });

    test("check shaman moves before javelin", () => {
      // no destacking north
      los._setSelected([7, 8], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin] = los._getMobs();
      checkPosition(shaman, 11, 8);
      checkPosition(javelin, 12, 8);
    });

    test("check javelin wiggles west", () => {
      // destacking south: shaman moves south, javelin moves west
      los._setSelected([7, 10], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin] = los._getMobs();
      checkPosition(shaman, 11, 9);
      checkPosition(javelin, 11, 8);
    })
  });

  describe("javelin -> shaman -> javelin", () => {
    beforeAll(() => {
      los.remove();
      los._setSelected([11, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      los.place();
      los._setSelected([14, 9], NPC_TYPES.SERPENT_SHAMAN);
      los.place();
      los._setSelected([15, 9], NPC_TYPES.JAVELIN_COLOSSUS);
      los.place();
    });

    test("check shaman moves before javelins", () => {
      // no destacking north
      los._setSelected([7, 8], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin, javelin2] = los._getMobs();
      checkPosition(shaman, 14, 8);
      checkPosition(javelin, 11, 8);
      checkPosition(javelin2, 15, 8);
    });

    test("check javelin wiggles west", () => {
      // destacking south: front jav and shaman moves south, back javelin moves west
      los._setSelected([7, 10], NPC_TYPES.PLAYER);
      los.step();
      const [shaman, javelin, javelin2] = los._getMobs();
      checkPosition(shaman, 14, 9);
      checkPosition(javelin, 11, 9);
      checkPosition(javelin2, 14, 8);
    })
  });
});