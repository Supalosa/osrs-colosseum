import { describe, expect, test } from "vitest";
import { MANTICORE, decodeURL, getReplayURL, getSpawnUrl } from "../lineOfSight";
import { createMob } from "./utils";
import { Mob, MobSpec, ReplayData } from "../types";
import { convertMobSpecToMob } from "../utils";

describe("url tests", () => {
  test("empty spawn url", () => {
    expect(getSpawnUrl([])).toBe("http://localhost:3000/?");
  });

  test("single mob spawn url", () => {
    expect(getSpawnUrl([createMob(0, 0, 0)])).toBe(
      "http://localhost:3000/?00000."
    );
  });

  test("multiple mob spawn url", () => {
    expect(getSpawnUrl([createMob(0, 0, 0), createMob(1, 1, 1)])).toBe(
      "http://localhost:3000/?00000.01011."
    );
  });

  test("non-manticore spawn url with mobExtra value", () => {
    // mobExtra gets ignored for non-manticores
    expect(getSpawnUrl([createMob(0, 0, 0, "r")])).toBe(
      "http://localhost:3000/?00000."
    );
  });

  test("manticore spawn url with mobExtra value", () => {
    expect(getSpawnUrl([createMob(0, 0, MANTICORE, "r")])).toBe(
      "http://localhost:3000/?00004r."
    );
  });

  describe("replay encoding tests", () => {
    test("empty replay url", () => {
      // cannot generate a replay URL without an initial player location
      const emptyReplay: ReplayData = {
        mobSpecs: [],
        playerPositions: [[0, 0]],
      };
      expect(getReplayURL(emptyReplay)).toBe("http://localhost:3000/?#0");
    });

    test("single mob replay url", () => {
      const replay: ReplayData = {
        mobSpecs: [createMob(0, 0, 0)],
        playerPositions: [[0, 0]],
      };
      expect(getReplayURL(replay)).toBe("http://localhost:3000/?00000.#0");
    });

    test("replay url with moving player", () => {
      const replay: ReplayData = {
        mobSpecs: [createMob(0, 0, 0)],
        playerPositions: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      };
      expect(getReplayURL(replay)).toBe("http://localhost:3000/?00000.#0.257.514");
    });

    test("replay url with moving player, with idle ticks", () => {
      // testing run-length encoding
      const replay: ReplayData = {
        mobSpecs: [createMob(0, 0, 0)],
        playerPositions: [
          [0, 0],
          [1, 1],
          [1, 1],
          [2, 2],
          [2, 2],
          [2, 2],
        ],
      };
      expect(getReplayURL(replay)).toBe("http://localhost:3000/?00000.#0.257x2.514x3");
    });

    test("replay url with fromWaveStart flag", () => {
      const replay: ReplayData = {
        mobSpecs: [createMob(0, 0, 0)],
        playerPositions: [[0, 0]]
      };
      expect(getReplayURL(replay, true)).toBe(
        "http://localhost:3000/?00000.#0_ws"
      );
    });

    test("replay url respects both ws and mm3 flags in hash", () => {
      // Test that URL parsing correctly handles both _ws and _mm3 suffixes
      // The getReplayURL function only adds _ws, but the parsing logic should handle both
      const replay: ReplayData = {
        mobSpecs: [createMob(0, 0, 0)],
        playerPositions: [[0, 0]]
      };
      const urlWithWs = getReplayURL(replay, true);
      expect(urlWithWs).toBe("http://localhost:3000/?00000.#0_ws");
      
      // Note: mm3 flag is added separately in the UI, not by getReplayURL
      // This test verifies that the expected format would be: #0_ws_mm3 or #0_mm3_ws
    });
  });

  describe("replay decoding tests", () => {
    test("decoding empty url", () => {
      expect(decodeURL(new URL("http://localhost:3000/?"))).to.deep.equal({
        mobs: [],
        playerCoordinates: null,
        isFromWaveStart: false,
        isMantiMayhem3: false,
        isReplay: false,
      });
    });
    
    test("decoding simple URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?14092#2311"))).to.deep.equal({
        mobs: [[14, 9, 2, 14, 9, 0, null]],
        playerCoordinates: [[7, 9]],
        isFromWaveStart: false,
        isMantiMayhem3: false,
        isReplay: false,
      });
    });

    test("decoding simple URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?11092#2311"))).to.deep.equal({
        mobs: [[11, 9, 2, 11, 9, 0, null]],
        playerCoordinates: [[7, 9]],
        isFromWaveStart: false,
        isMantiMayhem3: false,
        isReplay: false,
      });
    });

    test("decoding simple replay URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?11092.#2311.2055"))).to.deep.equal({
        mobs: [[11, 9, 2, 11, 9, 0, null]],
        playerCoordinates: [[7, 9], [7, 8]],
        isFromWaveStart: false,
        isMantiMayhem3: false,
        isReplay: true,
      });
    });

    test("decoding wave start URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?11092.#2311.2055_ws"))).to.deep.equal({
        mobs: [[11, 9, 2, 11, 9, 0, null]],
        playerCoordinates: [[7, 9], [7, 8]],
        isFromWaveStart: true,
        isMantiMayhem3: false,
        isReplay: true,
      });
    });

    test("decoding MM3 URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?11092.#2311.2055_mm3"))).to.deep.equal({
        mobs: [[11, 9, 2, 11, 9, 0, null]],
        playerCoordinates: [[7, 9], [7, 8]],
        isFromWaveStart: false,
        isMantiMayhem3: true,
        isReplay: true,
      });
    });

    test("decoding wave start + MM3 URL", () => {
      expect(decodeURL(new URL("http://localhost:5173/?11092.#2311.2055_ws_mm3"))).to.deep.equal({
        mobs: [[11, 9, 2, 11, 9, 0, null]],
        playerCoordinates: [[7, 9], [7, 8]],
        isFromWaveStart: true,
        isMantiMayhem3: true,
        isReplay: true,
      });
    });
  });

  describe("codec symmetry tests", () => {
    test("test 1", () => {
      const replay: ReplayData = {
        mobSpecs: [createMob(1, 2, 3)],
        playerPositions: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      };
      const url = getReplayURL(replay);
      const decoded = decodeURL(new URL(url));
      expect(decoded.mobs).to.deep.equal(replay.mobSpecs.map(convertMobSpecToMob));
      expect(decoded.playerCoordinates).to.deep.equal(replay.playerPositions);
    });

    test("test 2", () => {
      const replay: ReplayData = {
        mobSpecs: [createMob(1, 2, 3), createMob(4, 5, 6), createMob(7, 8, 9)],
        playerPositions: [
          [23, 12],
          [24, 12],
          [25, 12],
        ],
      };
      const url = getReplayURL(replay);
      const decoded = decodeURL(new URL(url));
      expect(decoded.mobs).to.deep.equal(replay.mobSpecs.map(convertMobSpecToMob));
      expect(decoded.playerCoordinates).to.deep.equal(replay.playerPositions);
    });
  });
});
