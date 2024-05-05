const RANGE = 2;

const isInRange = ([x, y]: [number, number], [x2, y2]: [number, number]) => {
  let dxAbs = Math.abs(x - x2);
  let dyAbs = Math.abs(y - y2);
  return dxAbs <= RANGE && dyAbs <= RANGE;
};

// *all* of the coordinates in `to` have to be in range
const anyInRange = (from: [number, number][], to: [number, number][]) => {
    return from.some(f => to.every(t => isInRange(f, t)));
};

// https://docs.google.com/document/d/e/2PACX-1vR5Sc78Wg6UDmKZ4QTtkuG9NtcM-GjFEaofZ77Z0MhM9NF5CeqLNCTx6E7l3JA6pBQxIsw--vRX8Y7M/pub
export function canBounce(
  x: number,
  y: number,
  size: number,
  x2: number,
  y2: number,
  size2: number
): boolean {
  const [sw, centerSw, center] = getScanTiles(x, y, size);
  const [sw2, centerSw2, center2] = getScanTiles(x2, y2, size2);
  switch (size) {
    case 1:
    case 3:
    case 5:
        // odd size sends bounce if it finds targets SW and CENTER tiles from its CENTER tile
        return anyInRange([center], [sw2, center2]);
    case 2:
        const all2x2 = getAllTiles(x, y, size);
        if (size2 <= 3) {
            // If it finds targets CENTER tile from any of its tiles (monster is ≤ 3x3).
            return anyInRange(all2x2, [center2]);
        } else if (size2 <= 5) {
            //If it finds targets CENTER and CENTER SW tile from any of its tiles (monster is ≥ 4x4).
            return anyInRange(all2x2, [centerSw2, center2]);
        }
        break;
    case 4:
        // 4x4 sends bounce if it finds targets SW and CENTER SW tiles from any of its middle 2x2 tiles.
        const middle2x2 = getAllTiles(x + 1, y - 1, size);
        return anyInRange(middle2x2, [sw2, centerSw2]);
  }
  throw new Error(`Unsupported bounce check (sizes ${size} vs ${size2})`);
}

type Tile = [number, number];

/**
 *
 * @param x
 * @param y
 * @param size
 * @returns SW, CENTER SW and CENTER tile respectively
 */
function getScanTiles(x: number, y: number, size: number): [Tile, Tile, Tile] {
  switch (size) {
    case 1:
    case 2:
      return [
        [x, y],
        [x, y],
        [x, y],
      ];
    case 3:
      return [
        [x, y],
        [x + 1, y - 1],
        [x, y],
      ];
    case 4:
    case 5:
      return [
        [x, y],
        [x + 1, y - 1],
        [x - 2, y - 2],
      ];
    default:
      throw new Error(`Unsupported NPC size ${size}`);
  }
}

function getAllTiles(x: number, y: number, size: number): Tile[] {
    const res: [number, number][] = [];
    for (let dx = 0; dx < size; ++dx) {
        for (let dy = 0; dy < size; ++dy) {
            res.push([x + dx, y - dy]);
        }
    }
    return res;
};