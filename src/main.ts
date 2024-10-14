import { Coordinates, Mob, MobExtra, MobSpec, TapeEntry } from "./types";
import { blockedTileRanges } from "./constants";

import "./style.css";
import { canBounce } from "./venator";

const SIZE = [1, 1, 3, 2, 3, 3, 3];
const RANGE = [10, 10, 15, 1, 15, 1, 15];
const CD = [0, 5, 5, 5, 10, 5, 5];
const img_sources = [
  "",
  "serpent_shaman.png", // 10 range
  "javelin_colossus.png", // 15 range
  "jaguar_warrior.png",
  "manticore.png",
  "minotaur.png",
  "shockwave_colossus.png",
];

const colors = ["red", "cyan", "lime", "orange", "purple", "brown", "blue"];

const img_sources_north = img_sources;
export const MANTICORE = 4;
const MANTICORE_RANGE_FIRST = "r";
const MANTICORE_MAGE_FIRST = "m";
const MANTICORE_ATTACKS = ["lime", "blue", "red"];
const DEFAULT_MANTICORE_MODE = MANTICORE_RANGE_FIRST;
// values are indexes into MANTICORE_ATTACKS
const MANTICORE_PATTERNS: { [patternName: string]: number[] } = {
  [MANTICORE_RANGE_FIRST]: [0, 1, 2],
  [MANTICORE_MAGE_FIRST]: [1, 0, 2],
};
const MANTICORE_DELAY = 5;

const MINOTAUR = 5;
const MINOTAUR_HEAL_RANGE = 7;
const MINOTAUR_HEAL_COLOR = "purple";

const DELAY_FIRST_ATTACK_TICKS = 3;

var pillars = [
  [8, 10],
  [23, 10],
  [8, 25],
  [23, 25],
];
var filters = [true, true, true, true];

var spawns: Coordinates[] = [
  [3, 19],
  [9, 17],
  [3, 14],
  [13, 14],
  [16, 13],
  [19, 14],
  [17, 9],
  [13, 20],
  [19, 20],
  [16, 24],
  [24, 16],
  [28, 14],
  [28, 19],
];

var mode = 0;
// only used for manticore at the moment
var modeExtra: MobExtra = null;
var degen = false;
var b5Tile = [5, 15];
var selected = [...b5Tile];
var mobs: Mob[] = [];
var showSpawns = true;
var showPlayerLoS = true;
var showZukSpots = true;
var checker = true;
let mousedOverNpc: number | null = null;

// tape for mobs
var tape: TapeEntry[] = [];
var playerTape: Coordinates[] = [];
// tape selection, [start, end
var tapeSelectionRange = null;

let tickCount = 0;

let replay: Coordinates[] | null = null;
let replayTick: number | null = null;
let replayAuto: ReturnType<typeof setTimeout> | null = null;

let draggingNpcIndex: number | null = null;
let draggingNpcOffset: Coordinates | null = null;

function doAutoTick() {
  if (!replayAuto) {
    return;
  }
  step();
  drawWave();
}
function toggleAutoReplay() {
  if (replayAuto) {
    clearTimeout(replayAuto);
    replayAuto = null;
    drawWave();
  } else {
    replayAuto = setTimeout(() => doAutoTick(), 600);
  }
}

const MAX_EXPORT_LENGTH = 128;

let manticoreTicksRemaining: { [mobIndex: number]: number } = {};

let mapElement: HTMLCanvasElement | null = <HTMLCanvasElement>(
  document.getElementById("map")
);
let delayFirstAttack: HTMLInputElement | null = null;
let showVenatorBounce: HTMLInputElement | null = null;
let replayAutoButton: HTMLButtonElement | null = null;
let copyReplayUrlButton: HTMLButtonElement | null = null;
let replayIndicator: HTMLDivElement | null = null;

var ctx: CanvasRenderingContext2D | null = null;
var size = 20;
const MAP_WIDTH = 34;
const MAP_HEIGHT = 34;
const TICKER_WIDTH = 9;
const CANVAS_WIDTH = size * MAP_WIDTH + TICKER_WIDTH * size;
const CANVAS_HEIGHT = size * MAP_HEIGHT;

function initDOM() {
  mapElement = document.getElementById("map") as HTMLCanvasElement;
  ctx = mapElement.getContext("2d");
  mapElement.width = CANVAS_WIDTH;
  mapElement.height = CANVAS_HEIGHT;
  delayFirstAttack = document.getElementById(
    "delayFirstAttack"
  ) as HTMLInputElement;
  showVenatorBounce = document.getElementById(
    "showVenatorBounce"
  ) as HTMLInputElement;
  replayAutoButton = document.getElementById(
    "replayAutoButton"
  ) as HTMLButtonElement;
  copyReplayUrlButton = document.getElementById(
    "copyReplayUrlButton"
  ) as HTMLButtonElement;
  replayIndicator = document.getElementById(
    "replayIndicator"
  ) as HTMLDivElement;
  return mapElement;
}

document.addEventListener("DOMContentLoaded", function () {
  initDOM();
  var spawn = parent.location.search
    .replace("?", "")
    .split(".")
    .filter((s) => !!s);
  for (var i = 0; i < spawn.length; i++) {
    if (spawn[i] === "degeN") {
      toggleNS();
    } else {
      var lx = parseInt(spawn[i].slice(0, 2));
      var ly = parseInt(spawn[i].slice(2, 4));
      var lm = parseInt(spawn[i].slice(4));
      var extra = spawn[i].slice(5) || null;
      mobs.push([lx, ly, lm, lx, ly, 0, extra as MobExtra]);
    }
  }
  sortMobs();
  var hash = parent.location.hash
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
    replay = hash.flatMap((section) => decodeSection(section));
    replayTick = 0;
    selected = replay[0];
    step();
    replayAuto = setTimeout(() => doAutoTick(), 600);
  }
  drawWave();
});
mapElement?.addEventListener("mousedown", function (e) {
  var x = e.offsetX;
  var y = e.offsetY;
  var selectedNpcIndex = null;
  x = Math.floor(x / size);
  y = Math.floor(y / size);
  if (x < MAP_WIDTH) {
    if (replay) {
      stopReplay();
    }
    for (var i = 0; i < mobs.length; i++) {
      if (doesCollide(x, y, 1, mobs[i][0], mobs[i][1], SIZE[mobs[i][2]])) {
        selectedNpcIndex = i;
        break;
      }
    }
    if (selectedNpcIndex === null) {
      selected[0] = x;
      selected[1] = y;
    } else {
      // start drag
      draggingNpcIndex = selectedNpcIndex;
      draggingNpcOffset = [
        x - mobs[selectedNpcIndex][0],
        y - mobs[selectedNpcIndex][1],
      ];
    }
  } else if (x <= CANVAS_WIDTH && y >= 0 && y <= tape.length + 1) {
    const tapeIndex = Math.floor(y);
    tapeSelectionRange = [tapeIndex];
  }
  drawWave();
});
mapElement?.addEventListener("mouseup", function (e) {
  var x = e.offsetX;
  var y = e.offsetY;
  x = Math.floor(x / size);
  y = Math.floor(y / size);
  if (tapeSelectionRange?.length === 1) {
    if (x >= MAP_WIDTH && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT) {
      const endY = Math.min(y + 1, tape.length);
      tapeSelectionRange = [tapeSelectionRange[0], endY];
    }
  }
  draggingNpcIndex = null;
  draggingNpcOffset = null;
  drawWave();
});
mapElement?.addEventListener("dblclick", function (e) {
  var x = e.offsetX;
  var y = e.offsetY;
  x = Math.floor(x / size);
  y = Math.floor(y / size);
  if (x < MAP_WIDTH) {
    for (var i = 0; i < mobs.length; i++) {
      if (doesCollide(x, y, 1, mobs[i][0], mobs[i][1], SIZE[mobs[i][2]])) {
        mobs.splice(i, 1);
        break;
      }
    }
    drawWave();
  }
});
mapElement?.addEventListener("wheel", function (e) {
  if (e.deltaY > 0) {
    step();
    drawWave();
  } else {
    reset();
    drawWave();
  }
});
document.addEventListener("keydown", function (e) {
  switch (e.keyCode) {
    case 38:
      step();
      drawWave();
      break;
    case 40:
      reset();
      drawWave();
      break;
    case 81:
      mode = 1;
      place();
      drawWave();
      break;
    case 87:
      mode = 2;
      place();
      drawWave();
      break;
    case 69:
      mode = 5;
      place();
      drawWave();
      break;
    case 82:
      mode = 6;
      place();
      drawWave();
      break;
    case 84:
      mode = 7;
      place();
      drawWave();
      break;
    case 85:
      mode = 4;
      place();
      drawWave();
      break;
  }
});
mapElement?.addEventListener("mousemove", function (e) {
  // dragging
  var x = e.offsetX;
  var y = e.offsetY;
  x = Math.floor(x / size);
  y = Math.floor(y / size);
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y > MAP_HEIGHT) {
    return;
  }
  var mouseIcon = "auto";
  var dirty = false;
  var wasMousedOverNpc = mousedOverNpc;
  mousedOverNpc = null;
  for (var i = 0; i < mobs.length; i++) {
    if (doesCollide(x, y, 1, mobs[i][0], mobs[i][1], SIZE[mobs[i][2]])) {
      mouseIcon = "move";
      mousedOverNpc = i;
      break;
    }
  }
  dirty ||= mousedOverNpc !== wasMousedOverNpc;

  mapElement!.style.cursor = mouseIcon;
  if (e.buttons & 0x1) {
    if (draggingNpcIndex !== null && draggingNpcOffset !== null) {
      mobs[draggingNpcIndex][0] = x - draggingNpcOffset[0];
      mobs[draggingNpcIndex][1] = y - draggingNpcOffset[1];
      mobs[draggingNpcIndex][3] = x - draggingNpcOffset[0];
      mobs[draggingNpcIndex][4] = y - draggingNpcOffset[1];
    } else if (mode > 0) {
      selected[0] = x;
      selected[1] = y;
    }
    dirty = true;
  }
  if (dirty) {
    drawWave();
  }
});
function getBaseUrl() {
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
  if (degen) {
    url = url.concat(".degeN");
  }
  return url;
}

const getMobSpec = (mob: Mob): MobSpec =>
  [mob[0], mob[1], mob[2], mob[6]] as MobSpec;

function copySpawnURL() {
  const mobSpecs = mobs.filter((mob) => mob[2] > 0).map(getMobSpec);
  var url = getSpawnUrl(mobSpecs);
  copyQ(url);
  alert("Spawn URL Copied!");
}
export function copyReplayURL() {
  if (tapeSelectionRange?.length != 2) {
    return null;
  }
  const upperBoundInclusive = Math.min(
    tapeSelectionRange[1] + 1,
    tapeSelectionRange[0] + MAX_EXPORT_LENGTH
  );
  var mobTicks = tape.slice(tapeSelectionRange[0], upperBoundInclusive);
  var playerTicks = playerTape.slice(
    tapeSelectionRange[0],
    upperBoundInclusive
  );

  // get the mob positions/specs at the start of the selection
  const mobSpecs = mobTicks[0].map(
    (value, mobIdx) =>
      [
        (value >> 16) & 0xff,
        (value >> 24) & 0xff,
        mobs[mobIdx][2],
        mobs[mobIdx][6],
      ] as MobSpec
  );
  var url = getReplayURL(mobSpecs, playerTicks);
  copyQ(url);
  alert("Replay URL Copied!");
}

export function getReplayURL(mobSpecs: MobSpec[], playerTicks: Coordinates[]) {
  var url = getSpawnUrl(mobSpecs);
  url = url.concat("#");
  var playerLocations = playerTicks.map(encodeCoordinate);
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
  return url;
}
function encodeCoordinate(coords: Coordinates) {
  return (coords[0] & 0xff) | ((coords[1] & 0xff) << 8);
}
function decodeCoordinates(coords: number): Coordinates {
  return [coords & 0xff, (coords >> 8) & 0xff];
}
function toggleSpawns() {
  showSpawns = !showSpawns;
  drawWave();
}
function togglePlayerLoS() {
  showPlayerLoS = !showPlayerLoS;
  drawWave();
}
function toggleZukSpots() {
  showZukSpots = !showZukSpots;
  drawWave();
}
function toggleNS() {
  mapElement?.classList.toggle("south");
  degen = !degen;
  drawWave();
}
function toggleChecker() {
  checker = !checker;
  drawWave();
}
function isPillar(x: number, y: number) {
  var isPillar = false;
  for (var j = 0; j < pillars.length; j++) {
    if (filters[j]) {
      isPillar =
        doesCollide(x, y, 1, pillars[j][0], pillars[j][1], 3) || isPillar;
    }
  }
  if (y >= 0 && y < blockedTileRanges.length) {
    const ranges = blockedTileRanges[y];
    for (var j = 0; j < ranges.length; ++j) {
      const range = ranges[j];
      if (x >= range[0] && x < range[1]) {
        return true;
      }
    }
  }
  return isPillar;
}
function hasLOS(
  x1: number,
  y1: number,
  // target x, y
  x2: number,
  y2: number,
  s = 1,
  r = 1,
  isNPC = false
) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (
    isPillar(x1, y1) ||
    isPillar(x2, y2) ||
    doesCollide(x1, y1, s, x2, y2, 1)
  ) {
    return false;
  }
  //assume range 1 is melee
  if (r == 1) {
    return (
      (dx < s && dx >= 0 && (dy == 1 || dy == -s)) ||
      (dy > -s && dy <= 0 && (dx == -1 || dx == s))
    );
  }
  if (isNPC) {
    var tx = Math.max(x1, Math.min(x1 + s - 1, x2));
    var ty = Math.max(y1 - s + 1, Math.min(y1, y2));
    return hasLOS(x2, y2, tx, ty, 1, r, false);
  }
  let dxAbs = Math.abs(dx);
  let dyAbs = Math.abs(dy);
  if (dxAbs > r || dyAbs > r) {
    return false;
  } //iFreedive
  if (dxAbs > dyAbs) {
    let xTile = x1;
    let y = (y1 << 16) + 0x8000;
    let slope = Math.trunc((dy << 16) / dxAbs); // Integer division
    let xInc = dx > 0 ? 1 : -1;
    if (dy < 0) {
      y -= 1; // For correct rounding
    }
    while (xTile !== x2) {
      xTile += xInc;
      let yTile = y >>> 16;
      if (isPillar(xTile, yTile)) {
        return false;
      }
      y += slope;
      let newYTile = y >>> 16;
      if (newYTile !== yTile && isPillar(xTile, newYTile)) {
        return false;
      }
    }
  } else {
    let yTile = y1;
    let x = (x1 << 16) + 0x8000;
    let slope = Math.trunc((dx << 16) / dyAbs); // Integer division
    let yInc = dy > 0 ? 1 : -1;
    if (dx < 0) {
      x -= 1; // For correct rounding
    }
    while (yTile !== y2) {
      yTile += yInc;
      let xTile = x >>> 16;
      if (isPillar(xTile, yTile)) {
        return false;
      }
      x += slope;
      let newXTile = x >>> 16;
      if (newXTile !== xTile && isPillar(newXTile, yTile)) {
        return false;
      }
    }
  }
  return true;
}
function doesCollide(
  x: number,
  y: number,
  s: number,
  x2: number,
  y2: number,
  s2: number
) {
  if (x > x2 + s2 - 1 || x + s - 1 < x2 || y - s + 1 > y2 || y < y2 - s2 + 1) {
    return false;
  }
  return true;
}
function legalPosition(x: number, y: number, size: number, index: number) {
  if (y - (size - 1) < 0 || x + (size - 1) > MAP_WIDTH) {
    return false;
  }
  var collision = false;
  for (var i = 0; i < pillars.length; i++) {
    if (
      filters[i] &&
      doesCollide(x, y, size, pillars[i][0], pillars[i][1], 3)
    ) {
      return false;
    }
  }
  // test collisions with walls
  for (var yy = y - size + 1; yy <= y; yy++) {
    const ranges = blockedTileRanges[yy];
    for (var j = 0; j < ranges.length; ++j) {
      const range = ranges[j];
      if (x + size > range[0] && x < range[1]) {
        return false;
      }
    }
  }
  for (var i = 0; i < mobs.length; i++) {
    if (mobs[i][2] < 8) {
      if (
        i != index &&
        doesCollide(x, y, size, mobs[i][0], mobs[i][1], SIZE[mobs[i][2]])
      ) {
        return false;
      }
    }
  }
  return !collision;
}
function sortMobs() {
  mobs.sort(function (a, b) {
    return a[2] - b[2];
  });
}
export function place() {
  if (mode > 0) {
    //x y mode ox oy cooldown extra
    //prevent 2 mobs on same tile
    for (var i = 0; i < mobs.length; i++) {
      if (mobs[i][3] == selected[0] && mobs[i][4] == selected[1]) {
        return;
      }
    }
    mobs.push([
      selected[0],
      selected[1],
      mode,
      selected[0],
      selected[1],
      0,
      modeExtra,
    ]);
    sortMobs();
  }
  mode = 0;
  modeExtra = null;
  drawWave();
}
export function step() {
  if (replay && replayTick !== null) {
    if (replay[replayTick]) {
      selected = replay[replayTick];
    } else {
      reset();
    }
    replayTick++;
    if (replayAuto) {
      clearTimeout(replayAuto);
      replayAuto = setTimeout(() => doAutoTick(), 600);
    }
  }
  if (mode == 0 && mobs.length > 0) {
    const canAttack = delayFirstAttack?.checked
      ? tickCount >= DELAY_FIRST_ATTACK_TICKS
      : true;
    var line: TapeEntry = [];
    let manticoreFiredThisTick = false;
    for (var i = 0; i < mobs.length; i++) {
      if (mobs[i][2] < 8) {
        var mob = mobs[i];
        mob[5]--;
        var x = mob[0];
        var y = mob[1];
        var t = mob[2];
        var s = SIZE[t];
        var r = RANGE[t];
        var attacked = 0;
        //move
        if (!hasLOS(x, y, selected[0], selected[1], s, r, true)) {
          var dx = x + Math.sign(selected[0] - x);
          var dy = y + Math.sign(selected[1] - y);
          //allows corner safespotting
          if (doesCollide(dx, dy, s, selected[0], selected[1], 1)) {
            dy = mob[1];
          }
          // 1x1 cannot cut corners around pillars for some reason
          if (
            legalPosition(dx, dy, s, i) &&
            (s > 1 ||
              (legalPosition(dx, y, s, i) && legalPosition(x, dy, s, i)))
          ) {
            // move diagonally
            mob[0] = dx;
            mob[1] = dy;
          } else if (legalPosition(dx, y, s, i)) {
            mob[0] = dx;
          } else if (legalPosition(x, dy, s, i)) {
            mob[1] = dy;
          }
        }
        x = mob[0];
        y = mob[1];
        //attack
        if (canAttack && hasLOS(x, y, selected[0], selected[1], s, r, true)) {
          if (mob[5] <= 0) {
            if (mob[2] === MANTICORE) {
              if (!manticoreFiredThisTick) {
                manticoreTicksRemaining[i] = 3;
                attacked = 1;
                mob[5] = CD[t];
                // Delay any other mantis if they are ready to attack
                manticoreFiredThisTick = true;
              }
            } else {
              attacked = 1;
              mob[5] = CD[t];
            } 
          }
        }
        // pack the positions into 3rd and 4th byte (2nd byte is manticore attack style)
        const value = attacked | ((x & 0xff) << 16) | ((y & 0xff) << 24);
        line.push(value);
      }
    }
    Object.entries(manticoreTicksRemaining).forEach(([idx, ticks]) => {
      const index = Number(idx);
      if (ticks > 0 && mobs[index]) {
        const manticoreMode = mobs[index][6] || DEFAULT_MANTICORE_MODE;
        const manticoreStyles = MANTICORE_PATTERNS[manticoreMode];
        const currentStyle = manticoreStyles[3 - ticks];
        const prevLine = line[index];
        line[index] = 1 | (currentStyle << 8) | (prevLine & 0xffff0000);
        manticoreTicksRemaining[index] = ticks - 1;
      } else {
        delete manticoreTicksRemaining[index];
      }
    });
    if (manticoreFiredThisTick) {
      delayAllReadyMantis(MANTICORE_DELAY);
    }
    playerTape.push([selected[0], selected[1]]);
    tape.push(line);
  }
  tickCount++;
}
function delayAllReadyMantis(ticks: number) {
  mobs.filter((mob) => mob[2] === MANTICORE && mob[5] <= 0).forEach((mob) => {
    mob[5] = ticks;
  });

}
function stopReplay() {
  replay = null;
  replayTick = null;
}
function remove() {
  mobs = [];
  stopReplay();
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  window.location.href = url.toString();
  reset();
  drawWave();
}

export function reset() {
  for (var i = 0; i < mobs.length; i++) {
    mobs[i][0] = mobs[i][3];
    mobs[i][1] = mobs[i][4];
    mobs[i][5] = 0;
  }
  manticoreTicksRemaining = {};
  tape = [];
  playerTape = [];
  tapeSelectionRange = null;
  tickCount = 0;
  if (replay) {
    replayTick = 0;
    selected = replay[0];
  }
  draggingNpcIndex = null;
  draggingNpcOffset = null;
}

export function setMode(m: number, extra?: MobExtra) {
  mode = m;
  modeExtra = extra ?? null;
  drawWave();
}

function drawLOS(
  x: number,
  y: number,
  s: number,
  r: number,
  isNPC: boolean,
  color = "red"
) {
  if (!ctx) {
    return;
  }
  if (showPlayerLoS) {
    ctx.globalAlpha = 0.15;
  } else {
    ctx.globalAlpha = 0;
  }

  for (var i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
    ctx.fillStyle = color;

    var x2 = i % MAP_WIDTH;
    var y2 = Math.floor(i / MAP_HEIGHT);

    if (hasLOS(x, y, x2, y2, s, r, isNPC)) {
      ctx.fillRect(x2 * size, y2 * size, size, size);
    }
  }
  ctx.globalAlpha = 1;
}
function updateUi() {
  if (!replayAutoButton || !copyReplayUrlButton || !replayIndicator) {
    return;
  }
  if (replayAuto) {
    replayAutoButton.innerHTML = "Pause";
  } else {
    replayAutoButton.innerHTML = "Play";
  }
  if (replay && replayTick !== null && replay[replayTick]) {
    replayAutoButton.hidden = false;
  } else {
    replayAutoButton.hidden = true;
  }
  copyReplayUrlButton.disabled = tapeSelectionRange?.length != 2;
  replayIndicator.innerHTML = !!replay
    ? `<strong><span style="color: #FF0000;">Replay: Tick ${replayTick} / ${replay.length}</span></strong>`
    : "";
}
function drawWave() {
  updateUi();
  if (!ctx || !mapElement) {
    return;
  }
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, mapElement.width, mapElement.height);

  const scale = (p: number) => p * size;
  function drawManticorePattern(pattern: number[], x: number, y: number) {
    pattern.forEach((colorIndex, index) => {
      if (!ctx) {
        return;
      }
      const color = MANTICORE_ATTACKS[colorIndex];
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(scale(x + 2.5), scale(y - index + 0.5), size / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  const checkerColor = checker ? "#eee" : "#fff";
  for (var i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
    const x = i % MAP_WIDTH;
    const y = Math.floor(i / MAP_WIDTH);
    ctx.fillStyle = (i + (y % 2)) % 2 ? "#fff" : checkerColor;
    ctx.fillRect(x * size, y * size, size, size);
  }
  // colosseum border
  ctx.fillStyle = "#000";
  blockedTileRanges.forEach((ranges, y) => {
    ranges.forEach((range) => {
      if (!ctx) {
        return;
      }
      ctx.fillRect(
        scale(range[0]),
        scale(y),
        scale(range[1] - range[0]),
        scale(1)
      );
    });
  });

  //pillars
  ctx.fillStyle = "#222";
  for (var i = 0; i < pillars.length; i++) {
    if (filters[i]) {
      ctx.fillRect(
        pillars[i][0] * size,
        (pillars[i][1] + 1) * size,
        3 * size,
        -3 * size
      );
    }
  }
  if (showSpawns) {
    ctx.globalAlpha = 0.35;
  } else {
    ctx.globalAlpha = 0;
  }
  ctx.fillStyle = "#999";
  for (var i = 0; i < spawns.length; i++) {
    ctx.fillRect(
      spawns[i][0] * size,
      (spawns[i][1] + 1) * size,
      3 * size,
      -3 * size
    );
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#9F9";
  ctx.fillRect(scale(b5Tile[0]), scale(b5Tile[1]), size, size);
  ctx.globalAlpha = 1;
  //mobs
  for (var i = 0; i < mobs.length; i++) {
    var x = mobs[i][0];
    var y = mobs[i][1];
    const t = mobs[i][2];
    var s = SIZE[t];
    var r = RANGE[t];
    var c = colors[t];
    ctx.fillStyle = ctx.strokeStyle = c;
    if (t < 8) {
      ctx.fillRect(
        x * size,
        (screenY + 1) * size,
        1 * size,
        -1 * size
      );
      ctx.strokeRect(
        x * size + 1,
        (y + 1) * size - 1,
        s * size,
        -s * size
      );
    }
    if (
      mode == 0 &&
      hasLOS(x, y, selected[0], selected[1], s, r, true)
    ) {
      ctx.fillStyle = "black";
      ctx.fillRect(
        x * size,
        (y + 1) * size,
        (1 * size) / 4,
        (-1 * size) / 4
      );
    }
  }
  if (draggingNpcIndex !== null) {
    const t = mobs[draggingNpcIndex][2];
    drawLOS(
      mobs[draggingNpcIndex][0],
      mobs[draggingNpcIndex][1],
      SIZE[t],
      RANGE[t],
      t > 0,
      colors[t]
    );
    // draw minotaur line-of-sight (from center tile as if it were a player)
    if (t === MINOTAUR) {
      drawLOS(
        mobs[draggingNpcIndex][0] + 1,
        mobs[draggingNpcIndex][1] - 1,
        1,
        MINOTAUR_HEAL_RANGE,
        false,
        MINOTAUR_HEAL_COLOR
      );
    }
  } else {
    // currently dragging an NPC, draw its LOS
    var s = SIZE[mode];
    var r = RANGE[mode];
    drawLOS(selected[0], selected[1], s, r, mode > 0, colors[mode]);

    // draw minotaur line-of-sight (from center tile as if it were a player)
    if (mode === MINOTAUR) {
      drawLOS(
        selected[0] + 1,
        selected[1] - 1,
        1,
        MINOTAUR_HEAL_RANGE,
        false,
        MINOTAUR_HEAL_COLOR
      );
    }
  }
  var c = colors[mode];
  var s = SIZE[mode];
  var r = RANGE[mode];
  ctx.fillStyle = ctx.strokeStyle = c;
  if (mode < 8) {
    ctx.fillRect(
      selected[0] * size,
      (selected[1] + 1) * size,
      1 * size,
      -1 * size
    );
    ctx.strokeRect(
      selected[0] * size,
      (selected[1] + 1) * size,
      s * size,
      -s * size
    );
  }
  var current_i = new Image();
  if (mode > 0) {
    if (mapElement.classList.contains("south")) {
      current_i.src = img_sources[mode];
    } else {
      current_i.src = img_sources_north[mode];
    }
    ctx.drawImage(
      current_i,
      selected[0] * size,
      (selected[1] - s + 1) * size,
      SIZE[mode] * size,
      SIZE[mode] * size
    );
  }
  if (mode === MANTICORE && modeExtra) {
    const colorPattern = MANTICORE_PATTERNS[modeExtra];
    drawManticorePattern(colorPattern, selected[0], selected[1]);
  }
  // ticker tape
  var offset = MAP_WIDTH * size;
  const tickerStartY = (idx: number) => size * idx;
  for (var i = 0; i < tape.length; i++) {
    ctx.fillStyle = i % 2 == 0 ? "#ddd" : "#eee";
    ctx.fillRect(offset, size * i, size * TICKER_WIDTH, size);
    for (var j = 0; j < tape[i].length; j++) {
      const value = tape[i][j];
      var attacked = value & 0xff;
      var t = mobs[j][2];
      if (t > 0 && attacked) {
        ctx.fillStyle = colors[t];
        ctx.fillRect(offset + size * j, tickerStartY(i), size, size);
      }
      if (attacked && t === MANTICORE) {
        const pattern = (value >> 8) & 0xff;
        ctx.fillStyle = MANTICORE_ATTACKS[pattern];
        ctx.beginPath();
        ctx.arc(
          offset + size * (j + 0.5),
          size * (i + 0.5),
          size / 2,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.stroke();
      }
    }
  }
  // ticker tape selection
  if (tapeSelectionRange?.length) {
    ctx.fillStyle = "yellow";
    ctx.globalAlpha = 0.25;
    const tapeStartY = tapeSelectionRange[0];
    const tapeEndY =
      tapeSelectionRange.length >= 2 ? tapeSelectionRange[1] : tapeStartY + 1;
    ctx.fillRect(
      offset,
      tickerStartY(tapeStartY),
      size * TICKER_WIDTH,
      (tapeEndY - tapeStartY) * size
    );
    ctx.globalAlpha = 1;
  }
  // mobs
  const minotaurs = mobs.filter((m) => m[2] === MINOTAUR);
  for (var i = 0; i < mobs.length; i++) {
    const [x, y, t] = mobs[i];
    const s = SIZE[mobs[i][2]];
    if (!t) {
      // player
      continue;
    }
    var mob_i = new Image();
    if (mapElement.classList.contains("south")) {
      mob_i.src = img_sources[t];
    } else {
      mob_i.src = img_sources_north[t];
    }
    ctx.drawImage(mob_i, x * size, (y - s + 1) * size, s * size, s * size);
    const mobExtra = mobs[i][6];
    if (t === MANTICORE && mobExtra !== null) {
      const colorPattern = MANTICORE_PATTERNS[mobExtra];
      drawManticorePattern(colorPattern, x, y);
    }

    // only odd-size npcs are healable for now
    if (s % 2 == 1) {
      const centerOffset = (s - 1) / 2;
      ctx.lineWidth = 3;
      for (const [mX, mY] of minotaurs) {
        if (
          hasLOS(
            mX + 1,
            mY - 1,
            x + centerOffset,
            y - centerOffset,
            1,
            MINOTAUR_HEAL_RANGE,
            false
          )
        ) {
          ctx.strokeStyle = MINOTAUR_HEAL_COLOR;
          ctx.beginPath();
          ctx.moveTo((mX + 1.5) * size, (mY - 0.5) * size);
          ctx.lineTo((x + s / 2) * size, (y - s / 2 + 1) * size);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 1;
    }

    if (
      showVenatorBounce?.checked &&
      mousedOverNpc !== null &&
      mousedOverNpc !== i
    ) {
      // venator bounce candidate
      ctx.strokeStyle = "#ff69b4";
      ctx.lineWidth = 5;
      const [sX, sY, sT] = mobs[mousedOverNpc];
      if (canBounce(sX, sY, SIZE[sT], mobs[i][0], mobs[i][1], s)) {
        ctx.strokeRect(x * size, (y - s + 1) * size, size * s, size * s);
      }
      ctx.lineWidth = 1;
    }
  }

  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "red";
  ctx.fillText("North", (MAP_WIDTH / 2) * size, 4);
  ctx.fillStyle = "white";
  ctx.fillText("South", (MAP_WIDTH / 2) * size, (MAP_HEIGHT - 1) * size + 4);
}

function copyQ(val: string) {
  var container = document.getElementById("container")!;
  var inp = document.createElement("input");
  inp.type = "text";
  container.appendChild(inp);
  inp.value = val;
  inp.select();
  document.execCommand("Copy");
  container.removeChild(container.lastChild!);
}

// exposed for testing
export function _setSelected(
  s: Coordinates,
  _mode: number,
  _extra: MobExtra | null = null
) {
  selected = s;
  mode = _mode;
  modeExtra = _extra;
}

export function _getMobs() {
  return mobs;
}

// make these available to the buttons (not how I'd choose to do this...)
declare global {
  interface Window {
    remove: typeof remove;
    setMode: typeof setMode;
    place: typeof place;
    togglePlayerLoS: typeof togglePlayerLoS;
    copySpawnURL: typeof copySpawnURL;
    copyReplayURL: typeof copyReplayURL;
    step: typeof step;
    reset: typeof reset;
    drawWave: typeof drawWave;
    toggleAutoReplay: typeof toggleAutoReplay;
  }
}
window.remove = remove;
window.setMode = setMode;
window.place = place;
window.togglePlayerLoS = togglePlayerLoS;
window.copySpawnURL = copySpawnURL;
window.copyReplayURL = copyReplayURL;
window.step = step;
window.reset = reset;
window.drawWave = drawWave;
window.toggleAutoReplay = toggleAutoReplay;
