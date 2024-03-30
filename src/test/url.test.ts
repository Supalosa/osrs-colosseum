import { expect, test } from "vitest";
import { MANTICORE, getReplayURL, getSpawnUrl } from "../main";
import { MobExtra, MobSpec } from "../types";

const createMob = (
  x: number,
  y: number,
  type: number,
  extra?: MobExtra
): MobSpec => [x, y, type, extra ?? null];

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

test("empty replay url", () => {
  // cannot generate a replay URL without an initial player location
  expect(getReplayURL([], [[0, 0]])).toBe("http://localhost:3000/?#0");
});

test("single mob replay url", () => {
  expect(getReplayURL([createMob(0, 0, 0)], [[0, 0]])).toBe(
    "http://localhost:3000/?00000.#0"
  );
});

test("replay url with moving player", () => {
  expect(
    getReplayURL(
      [createMob(0, 0, 0)],
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ]
    )
  ).toBe("http://localhost:3000/?00000.#0.257.514");
});

test("replay url with moving player, with idle ticks", () => {
  // testing run-length encoding
  expect(
    getReplayURL(
      [createMob(0, 0, 0)],
      [
        [0, 0],
        [1, 1],
        [1, 1],
        [2, 2],
        [2, 2],
        [2, 2],
      ]
    )
  ).toBe("http://localhost:3000/?00000.#0.257x2.514x3");
});
