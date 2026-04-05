import { MANTICORE } from "./constants";
import { Coordinates, Mob, MobExtra, MobSpec, ReplayData } from "./types";

export const convertMobSpecToMob = (mobSpec: MobSpec): Mob => [
  mobSpec[0], // x
  mobSpec[1], // y
  mobSpec[2], // type
  mobSpec[0], // initial X
  mobSpec[1], // initial Y
  0, // attack delay
  mobSpec[3], // extra
];

export function getMobSpec(mob: Mob): MobSpec {
  // For manticores, use the original extra value if it exists
  if (mob[2] === MANTICORE && mob[7] !== undefined) {
    return [mob[0], mob[1], mob[2], mob[7]] as MobSpec;
  }
  // For non-manticores or old format, use the current extra value
  return [mob[0], mob[1], mob[2], mob[6]] as MobSpec;
};

// https://discourse.wicg.io/t/allow-non-realtime-use-of-mediarecorder/2308/
export function record(
  canvas: HTMLCanvasElement,
  onStep: () => boolean,
  onFinish: () => void,
) {
  const captureStream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(captureStream, {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 10_000_000,
  });
  const chunks: Blob[] = [];
  function step() {
    const finished = onStep();
    if (finished) {
        // give another 600ms to record the last "step" and then let the caller clean up the canvas.
        setTimeout(() => {
            mediaRecorder.stop();
            onFinish();
        }, 600);
    } else {
      setTimeout(step, 600);
    }
  }
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size === 0) {
      return;
    }
    chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "los-replay.webm";
    a.click();
    URL.revokeObjectURL(url);
  };
  mediaRecorder.start();
  step();
}


export type Bounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
export function computeReplayBounds(replay: ReplayData, NPC_INFO: Record<number, { size: number }>): Bounds {
    let minPlayerX = Number.MAX_VALUE;
    let maxPlayerX = Number.MIN_VALUE;
    let minPlayerY = Number.MAX_VALUE;
    let maxPlayerY = Number.MIN_VALUE;
    // Easy to get the player's position throughout the replay.
    for (const pos of replay.playerPositions) {
        if (pos[0] < minPlayerX) {
            minPlayerX = pos[0];
        }
        if (pos[0] > maxPlayerX) {
            maxPlayerX = pos[0];
        }
        if (pos[1] < minPlayerY) {
            minPlayerY = pos[1];
        }
        if (pos[1] > maxPlayerY) {
            maxPlayerY = pos[1];
        }
    }
    // For mobs, they might move to the player's X or Y position (and we need to take their size into account)
    let minX = minPlayerX;
    let maxX = maxPlayerX;
    let minY = minPlayerY;
    let maxY = maxPlayerY;
    for (const [x, y, type] of replay.mobSpecs) {
        const size = NPC_INFO[type]?.size || 1;
        if (x < minX) {
            minX = x;
        }
        if (x + size - 1 > maxX) {
            maxX = x + size - 1;
        }
        if (maxPlayerX + size - 1 > maxX) {
            maxX = maxPlayerX + size - 1;
        }
        if (y - size + 1 < minY) {
            minY = y - size + 1;
        }
        if (minPlayerY - size + 1 < minY) {
            minY = minPlayerY - size + 1;
        }
        if (y > maxY) {
            maxY = y;
        }
    }
    return { minX, maxX, minY, maxY };
}

export function extendBounds(bounds: Bounds, extension: number, mapWidth: number, mapHeight: number): Bounds {
    return {
        minX: Math.max(0, bounds.minX - extension),
        maxX: Math.min(mapWidth - 1, bounds.maxX + extension),
        minY: Math.max(0, bounds.minY - extension),
        maxY: Math.min(mapHeight - 1, bounds.maxY + extension),
    }
}

export type DecodeURLResult = {
  isFromWaveStart: boolean;
  mobs: Mob[],
  isMantiMayhem3: boolean;
  playerCoordinates: Coordinates[] | null;
  isReplay: boolean;
}
export function decodeURL(location: URL): DecodeURLResult {
  const mobSpawns = location.search
    .replace("?", "")
    .split(".")
    .filter((s) => !!s);
  const mobs: Mob[] = [];
  for (var i = 0; i < mobSpawns.length; i++) {
    const lx = parseInt(mobSpawns[i].slice(0, 2));
    const ly = parseInt(mobSpawns[i].slice(2, 4));
    const lm = parseInt(mobSpawns[i].slice(4, 5));
    const extra = mobSpawns[i].slice(5) as MobExtra || null;
    const mobSpec: MobSpec = [lx, ly, lm, extra];
    const newMob = convertMobSpecToMob(mobSpec);
    // Store original extra for manticores
    if (lm === MANTICORE && extra) {
      newMob.push(extra as MobExtra);
    }
    mobs.push(newMob);
  }
  const hashParts = location.hash?.split("_");
  const playerCoords = hashParts?.[0];

  // Check flags
  const isFromWaveStart = hashParts?.includes("ws") || false;
  const isMantiMayhem3 = hashParts?.includes("mm3") || false;

  let playerCoordinates: Coordinates[] | null = null;
  let isReplay = false;
  const hash = playerCoords
    ?.replace("#", "")
    .split(".")
    .filter((s) => !!s);
  if (hash?.length > 0) {
    const decodeSection = (section: string) => {
      const split = section.split("x");
      const runLength = split.length > 1 ? parseInt(split[1]) : 1;
      const coordinate = decodeCoordinates(parseInt(split[0]));
      return Array(runLength).fill(coordinate);
    };
    playerCoordinates = hash.flatMap((section) => decodeSection(section));
    // Check if this is a simple spawn URL (single position) or a replay URL (multiple positions or run-length encoded)
    isReplay = playerCoordinates.length > 1 || hash.some(section => section.includes("x"));
  }

  return {
    mobs,
    isFromWaveStart,
    isMantiMayhem3,
    playerCoordinates,
    isReplay
  }
}

export function getBaseUrl() {
  if (window.location.protocol === "file:") {
    return `${window.location.protocol}//${window.location.pathname}?`;
  }
  return `${window.location.protocol}//${window.location.host}/?`;
}

export function getSpawnUrl(mobSpecs: MobSpec[]) {
  var url = getBaseUrl();
  mobSpecs.forEach(([locationX, locationY, mobType, extra]) => {
    url = url
      .concat(("00" + locationX).slice(-2))
      .concat(("00" + locationY).slice(-2))
      .concat(mobType.toString());
    if (mobType === MANTICORE && !!extra) {
      url = url.concat(extra.toString());
    }
    url = url.concat(".");
  });
  return url;
}

export function encodeCoordinate(coords: Coordinates) {
  return (coords[0] & 0xff) | ((coords[1] & 0xff) << 8);
}

function decodeCoordinates(coords: number): Coordinates {
  return [coords & 0xff, (coords >> 8) & 0xff];
}

export function getReplayURL(replayData: ReplayData, fromWaveStart: boolean = false, mantimayhem3: boolean = false) {
  const { playerPositions, mobSpecs } = replayData
  var url = getSpawnUrl(mobSpecs);
  url = url.concat("#");
  var playerLocations = playerPositions.map(encodeCoordinate);
  // run-length encoding
  var last = playerLocations[0];
  var runLength = 1;
  for (var i = 1; i < playerLocations.length; i++) {
    if (playerLocations[i] !== last) {
      url = url.concat(last.toString());
      if (runLength > 1) {
        url = url.concat(`x${runLength}`);
      }
      url = url.concat(`.`);
      runLength = 1;
    } else {
      runLength++;
    }
    last = playerLocations[i];
  }
  url = url.concat(last.toString());
  if (runLength > 1) {
    url = url.concat(`x${runLength}`);
  }
  if (fromWaveStart) {
    url = url.concat("_", "ws");
  }
  if (mantimayhem3) {
    url = url.concat("_", "mm3");
  }
  return url;
}

export function copyQ(val: string) {
  var container = document.getElementById("root")!;
  var inp = document.createElement("input");
  inp.type = "text";
  container.appendChild(inp);
  inp.value = val;
  inp.select();
  document.execCommand("Copy");
  container.removeChild(container.lastChild!);
}
