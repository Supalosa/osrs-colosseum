import { Mob, MobSpec, ReplayData } from "./types";

export const convertMobSpecToMob = (mobSpec: MobSpec): Mob => [
  mobSpec[0], // x
  mobSpec[1], // y
  mobSpec[2], // type
  mobSpec[0], // initial X
  mobSpec[1], // initial Y
  0, // attack delay
  mobSpec[3], // extra
];

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
