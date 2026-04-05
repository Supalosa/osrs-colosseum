import { Coordinates, Mob, MobExtra, MobSpec, ReplayData, TapeEntry } from "./types";
import { blockedTileRanges, DELAY_FIRST_ATTACK_TICKS, MANTICORE, MANTICORE_ATTACKS, MANTICORE_CHARGE_TIME, MANTICORE_DELAY, MANTICORE_PATTERNS, MINOTAUR, MINOTAUR_HEAL_COLOR, MINOTAUR_HEAL_RANGE, MM3_PATTERNS, MODE_PLAYER, NPC_INFO, NPC_TYPES, NpcType, STANDARD_PATTERNS } from "./constants";

import { canBounce } from "./venator";
import { computeReplayBounds, convertMobSpecToMob, copyQ, decodeURL, encodeCoordinate, extendBounds, getMobSpec, getReplayURL, getSpawnUrl, record } from "./utils";

export type LoSListener = {
  onHasReplayChanged: (hasReplay: boolean, replayLength: number | null) => void;
  onIsReplayingChanged: (isReplaying: boolean) => void;
  onCanSaveReplayChanged: (canReplay: boolean) => void;
  onReplayTickChanged: (tick: number) => void;
  onFromWaveStartChanged: (fromWaveStart: boolean) => void;
  onMantimayhem3Changed: (mantimayhem3: boolean) => void;
};

const PILLAR_COORDS = [
  [8, 10],
  [23, 10],
  [8, 25],
  [23, 25],
];

const SPAWNS: Coordinates[] = [
  [3, 19],
  [9, 17],
  [3, 14],
  [13, 14],
  [19, 14],
  [17, 9],
  [13, 20],
  [19, 20],
  [16, 24],
  [24, 16],
  [28, 14],
  [28, 19],
];
const B5_ORIGIN_TILE: Coordinates = [7, 15];

const MAX_EXPORT_LENGTH = 128;
const TILE_SIZE = 20;
const MAP_WIDTH = 34;
const MAP_HEIGHT = 34;
const TICKER_WIDTH = 9;
const TICKER_START_X = MAP_WIDTH * TILE_SIZE;
const CANVAS_WIDTH = TICKER_START_X + TICKER_WIDTH * TILE_SIZE;
const CANVAS_HEIGHT = TILE_SIZE * MAP_HEIGHT;

const CHECKER = true;

export class LineOfSight {

  /**
   * Current selection mode.
   */
  mode: NpcType = NPC_TYPES.PLAYER;
  // only used for manticore at the moment
  modeExtra: MobExtra = null;

  /**
   * The location of the actual cursor.
   */
  cursorLocation: Coordinates | null = null;
  /**
   * The location of the player.
   */
  selected: Coordinates = [...B5_ORIGIN_TILE];
  stepStartPosition: Coordinates | null = null;
  mousedOverNpc: number | null = null;

  mobs: Mob[] = [];
  // tape for mobs
  tape: TapeEntry[] = [];
  playerTape: Coordinates[] = [];
  tapeSelectionRange: number[] | null = null; // tape selection, [start, end. TODO remove

  tickCount = 0;

  // Visualisation settings
  showSpawns = true;
  showPlayerLoS = true;
  fromWaveStart: boolean = false;
  mantimayhem3: boolean = false;
  showVenatorBounce: boolean = false;

  replay: Coordinates[] | null = null;
  replayTick: number | null = null;
  replayAuto: ReturnType<typeof setTimeout> | null = null;

  draggingNpcIndex: number | null = null;
  draggingNpcOffset: Coordinates | null = null;

  manticoreTicksRemaining: { [mobIndex: number]: number } = {};

  mapElement: HTMLCanvasElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  losListener: LoSListener | null = null;
  
  images: (HTMLImageElement | null)[] = [];
  
  hasLoadedSpawns = false;

  public initDOM(mapElement: HTMLCanvasElement) {
    this.mapElement = mapElement;
    this.ctx = mapElement.getContext('2d')!;
    this.mapElement.width = CANVAS_WIDTH;
    this.mapElement.height = CANVAS_HEIGHT;
    this.loadSpawns();
    this.drawWave();

    // Preload images
    Object.values(NPC_INFO).forEach(({ img }, i) => {
      if (img.length === 0) {
        return null;
      }
      const image = new Image();
      image.src = img;
      image.onload = () => {
        this.images[i] = image;
        this.drawWave();
      };
    });
  }

  private doAutoTick() {
    if (!this.replayAuto) {
      return;
    }
    this.step();
    this.drawWave();
  }

  public toggleAutoReplay() {
    if (this.replayAuto) {
      clearTimeout(this.replayAuto);
      this.replayAuto = null;
    } else {
      this.replayAuto = setTimeout(() => this.doAutoTick(), 600);
    }
    this.updateUi();
  }

  public exportReplay() {
    if (!this.mapElement) {
      return;
    }
    const { playerPositions, mobSpecs } = this.getReplayData();
    const rawBounds = computeReplayBounds({ playerPositions, mobSpecs }, NPC_INFO);
    const bounds = extendBounds(rawBounds, 4, MAP_WIDTH, MAP_HEIGHT); // extend visible area by 4 tiles
    const playAreaWidth = (bounds.maxX - bounds.minX + 1) * TILE_SIZE;
    const playAreaHeight = (bounds.maxY - bounds.minY + 1) * TILE_SIZE;

    const sourceContext = this.mapElement.getContext('2d')!;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = playAreaWidth + TICKER_WIDTH * TILE_SIZE;
    exportCanvas.height = playAreaHeight;

    this.reset();
    this.mobs = mobSpecs.map(convertMobSpecToMob);
    this.replay = playerPositions;
    this.replayTick = 0;
    this.selected = this.replay[0];

    record(exportCanvas, () => {
      if (this.replayTick === null || !this.replay) {
        return true;
      }
      if (this.replayTick >= this.replay.length) {
        // need to draw the wave one more time to be included in the video
        this.drawWave();
        return true;
      }
      this.step(true);
      // copy relevant play area to exportCanvas
      const imageContent = sourceContext.getImageData(bounds.minX * TILE_SIZE, bounds.minY * TILE_SIZE, playAreaWidth, playAreaHeight);
      exportCanvas.getContext('2d')?.putImageData(imageContent, 0, 0);
      // copy ticker to exportCanvas
      const tickerContent = sourceContext.getImageData(TICKER_START_X, 0, TICKER_WIDTH * TILE_SIZE, CANVAS_HEIGHT);
      exportCanvas.getContext('2d')?.putImageData(tickerContent, playAreaWidth, 0);
      return false;
    }, () => {
        this.replay = null;
        this.replayTick = null;
        this.reset();
        // Would be nice to set the state back to the original here.
    });
  }

  public setFromWaveStart = (val: boolean) => {
    this.fromWaveStart = val;
    this.losListener?.onFromWaveStartChanged(val);
  };

  public setMantimayhem3 = (val: boolean) => {
    this.mantimayhem3 = val;
    this.losListener?.onMantimayhem3Changed(val);
  };

  public setShowVenatorBounce = (show: boolean) => {
    this.showVenatorBounce = show;
  };

  public handleKeyDown(e: KeyboardEvent) {
    switch (e.keyCode) {
      case 38:
        this.step(true);
        break;
      case 40:
        this.reset();
        break;
    }
  };

  public onCanvasMouseDown(e: React.MouseEvent) {
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    var selectedNpcIndex = null;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (x < MAP_WIDTH) {
      if (this.replay) {
        this.stopReplay();
      }
      for (var i = 0; i < this.mobs.length; i++) {
        if (this.doesCollide(x, y, 1, this.mobs[i][0], this.mobs[i][1], NPC_INFO[this.mobs[i][2]].size)) {
          selectedNpcIndex = i;
          break;
        }
      }
      if (selectedNpcIndex === null) {
        if (this.mode === MODE_PLAYER) {
          // move player
          this.selected = [x, y];
        }
        this.cursorLocation = [x, y];
      } else {
        // start drag
        this.draggingNpcIndex = selectedNpcIndex;
        this.draggingNpcOffset = [
          x - this.mobs[selectedNpcIndex][0],
          y - this.mobs[selectedNpcIndex][1],
        ];
        this.cursorLocation = null;
      }
    } else if (x <= CANVAS_WIDTH && y >= 0 && y <= this.tape.length + 1) {
      const tapeIndex = Math.floor(y);
      this.tapeSelectionRange = [tapeIndex];
    }
    this.drawWave();
  };

  public onCanvasMouseUp(e: React.MouseEvent) {
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (this.tapeSelectionRange?.length === 1) {
      if (x >= MAP_WIDTH && x <= CANVAS_WIDTH && y >= 0 && y <= CANVAS_HEIGHT) {
        const endY = Math.min(y + 1, this.tape.length);
        this.tapeSelectionRange = [this.tapeSelectionRange[0], endY];
      }
    }
    this.draggingNpcIndex = null;
    this.draggingNpcOffset = null;
    this.drawWave();
  };

  public onCanvasDblClick(e: React.MouseEvent) {
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (x < MAP_WIDTH) {
      for (var i = 0; i < this.mobs.length; i++) {
        if (this.doesCollide(x, y, 1, this.mobs[i][0], this.mobs[i][1], NPC_INFO[this.mobs[i][2]].size)) {
          this.removeMob(i);
          break;
        }
      }
      this.drawWave();
    }
  };

  public onCanvasRightClick(e: React.MouseEvent) {
    e.preventDefault();
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (x < MAP_WIDTH) {
      for (var i = 0; i < this.mobs.length; i++) {
        if (this.doesCollide(x, y, 1, this.mobs[i][0], this.mobs[i][1], NPC_INFO[this.mobs[i][2]].size)) {
          // Only toggle charged state for manticores
          if (this.mobs[i][2] === MANTICORE) {
            const currentExtra = this.mobs[i][6];
            const originalExtra = this.mobs[i][7];

            // Don't toggle unknown manticores
            if (currentExtra === null || originalExtra === "u") {
              break;
            }

            // Toggle between charged and uncharged
            const isCurrentlyUncharged = currentExtra.startsWith("u");
            if (isCurrentlyUncharged) {
              // Switch to charged: remove 'u' prefix
              this.mobs[i][6] = currentExtra.substring(1) as MobExtra;
              this.mobs[i][7] = currentExtra.substring(1) as MobExtra; // Update originalExtra too
            } else {
              // Switch to uncharged: add 'u' prefix
              const uncharged = ("u" + currentExtra) as MobExtra;
              this.mobs[i][6] = uncharged;
              this.mobs[i][7] = uncharged; // Update originalExtra too
            }
            this.mobs[i][5] = 0; // Reset attack delay
          }
          break;
        }
      }
      this.drawWave();
    }
    return false;
  };

  public onCanvasMouseWheel(e: React.WheelEvent) {
    if (e.deltaY > 0) {
      this.step();
      this.drawWave();
    } else {
      this.reset();
      this.drawWave();
    }
  };

  public onCanvasMouseOut() {
    // delete dragged npc if out of map
    if (this.draggingNpcIndex !== null) {
      this.removeMob(this.draggingNpcIndex);
      this.draggingNpcIndex = null;
      this.drawWave();
    }
  };

  public onCanvasMouseMove(e: React.MouseEvent) {
    // dragging
    var x = e.nativeEvent.offsetX;
    var y = e.nativeEvent.offsetY;
    x = Math.floor(x / TILE_SIZE);
    y = Math.floor(y / TILE_SIZE);
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y > MAP_HEIGHT) {
      return;
    }
    var mouseIcon = "auto";
    var dirty = false;
    var wasMousedOverNpc = this.mousedOverNpc;
    this.mousedOverNpc = null;
    for (var i = 0; i < this.mobs.length; i++) {
      if (this.doesCollide(x, y, 1, this.mobs[i][0], this.mobs[i][1], NPC_INFO[this.mobs[i][2]].size)) {
        mouseIcon = "move";
        this.mousedOverNpc = i;
        break;
      }
    }
    dirty ||= this.mousedOverNpc !== wasMousedOverNpc;

    this.mapElement!.style.cursor = mouseIcon;
    if (e.buttons & 0x1) {
      // holding left button
      if (this.draggingNpcIndex !== null && this.draggingNpcOffset !== null) {
        this.mobs[this.draggingNpcIndex][0] = x - this.draggingNpcOffset[0];
        this.mobs[this.draggingNpcIndex][1] = y - this.draggingNpcOffset[1];
        this.mobs[this.draggingNpcIndex][3] = x - this.draggingNpcOffset[0];
        this.mobs[this.draggingNpcIndex][4] = y - this.draggingNpcOffset[1];
        this.cursorLocation = null;
      } else if (this.mode > MODE_PLAYER) {
        this.cursorLocation = [x, y];
      } else {
        this.cursorLocation = [x, y];
        this.selected = [x, y];
      }
      dirty = true;
    }
    if (dirty) {
      this.drawWave();
    }
  };

  private loadSpawns() {
    if (this.hasLoadedSpawns) {
      return;
    }
    this.hasLoadedSpawns = true;
    const { mobs: decodedMobs, isFromWaveStart, isMantiMayhem3, playerCoordinates, isReplay } = decodeURL(new URL(window.location.toString()));
    this.mobs = decodedMobs;
    this.sortMobs();
    this.setFromWaveStart(isFromWaveStart);
    this.setMantimayhem3(isMantiMayhem3);
    if (!playerCoordinates) {
      return;
    }

    if (isReplay) {
      // This is a replay URL - start the replay
      this.replay = playerCoordinates;
      this.replayTick = 0;
      this.selected = this.replay[0];
      this.step();
      this.replayAuto = setTimeout(() => this.doAutoTick(), 600);
    } else {
      // This is a spawn URL with just a player position - set position without starting replay
      this.selected = playerCoordinates[0];
    }
  }

  public copySpawnURL() {
    // TODO: this should be unified with copyReplayURL (perhaps if there's nothing in the ticker, we just copy the spawn URL)
    const mobSpecs = this.mobs.filter((mob) => mob[2] > MODE_PLAYER).map(getMobSpec);
    var url = getSpawnUrl(mobSpecs);

    // Check if player has been moved from starting position
    const playerMoved = this.selected[0] !== B5_ORIGIN_TILE[0] || this.selected[1] !== B5_ORIGIN_TILE[1];

    // Build hash fragments
    const hashParts = [];

    // Add player position if moved
    if (playerMoved) {
      hashParts.push(encodeCoordinate(this.selected));
    }

    // Add flags if enabled  
    if (this.fromWaveStart) {
      hashParts.push("_ws");
    }
    if (this.mantimayhem3) {
      hashParts.push("_mm3");
    }

    // Add hash if there are any parts
    if (hashParts.length > 0) {
      url = url.concat("#" + hashParts.join(""));
    }

    copyQ(url);
    alert("Spawn URL Copied!");
  }

  private getReplayData(): ReplayData {
    let lowerBound, upperBoundInclusive;
    if (this.tapeSelectionRange?.length === 2) {
      // TODO: remove tapeSelectionRange
      lowerBound = this.tapeSelectionRange[0];
      upperBoundInclusive = Math.min(
        this.tapeSelectionRange[1] + 1,
        this.tapeSelectionRange[0] + MAX_EXPORT_LENGTH
      );
    } else {
      lowerBound = 0;
      upperBoundInclusive = Math.min(this.tape.length, MAX_EXPORT_LENGTH);
    }
    var mobTicks = this.tape.slice(lowerBound, upperBoundInclusive);
    var playerPositions = this.playerTape.slice(lowerBound, upperBoundInclusive);

    // get the mob positions/specs at the start of the selection
    const mobSpecs = mobTicks[0].map(
      (value, mobIdx) =>
        [
          (value >> 16) & 0xff,
          (value >> 24) & 0xff,
          this.mobs[mobIdx][2],
          // Use original extra value for manticores if available
          this.mobs[mobIdx][2] === MANTICORE && this.mobs[mobIdx][7] !== undefined
            ? this.mobs[mobIdx][7]
            : this.mobs[mobIdx][6],
        ] as MobSpec
    );
    return { playerPositions, mobSpecs };
  }

  public copyReplayURL() {
    var url = getReplayURL(this.getReplayData(), this.fromWaveStart);
    copyQ(url);
    alert("Replay URL Copied!");
  }

  public togglePlayerLoS() {
    this.showPlayerLoS = !this.showPlayerLoS;
    this.drawWave();
  }

  private isPillar(x: number, y: number) {
    var isPillar = false;
    for (var j = 0; j < PILLAR_COORDS.length; j++) {
      isPillar = this.doesCollide(x, y, 1, PILLAR_COORDS[j][0], PILLAR_COORDS[j][1], 3) || isPillar;
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

  private removeMob(index: number) {
    this.mobs.splice(index, 1);
    this.tape = this.tape.map((entries) => {
      return entries.filter((_mobData, i) => i !== index);
    });
  }

  private hasLOS(
    x1: number,
    y1: number,
    // target x, y
    x2: number,
    y2: number,
    s = 1,
    r = 1,
    isNPC = false
  ): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (
      this.isPillar(x1, y1) ||
      this.isPillar(x2, y2) ||
      this.doesCollide(x1, y1, s, x2, y2, 1)
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
      return this.hasLOS(x2, y2, tx, ty, 1, r, false);
    }
    const dxAbs = Math.abs(dx);
    const dyAbs = Math.abs(dy);
    if (dxAbs > r || dyAbs > r) {
      return false;
    } //iFreedive
    if (dxAbs > dyAbs) {
      let xTile = x1;
      let y = (y1 << 16) + 0x8000;
      const slope = Math.trunc((dy << 16) / dxAbs); // Integer division
      const xInc = dx > 0 ? 1 : -1;
      if (dy < 0) {
        y -= 1; // For correct rounding
      }
      while (xTile !== x2) {
        xTile += xInc;
        const yTile = y >>> 16;
        if (this.isPillar(xTile, yTile)) {
          return false;
        }
        y += slope;
        const newYTile = y >>> 16;
        if (newYTile !== yTile && this.isPillar(xTile, newYTile)) {
          return false;
        }
      }
    } else {
      let yTile = y1;
      let x = (x1 << 16) + 0x8000;
      const slope = Math.trunc((dx << 16) / dyAbs); // Integer division
      const yInc = dy > 0 ? 1 : -1;
      if (dx < 0) {
        x -= 1; // For correct rounding
      }
      while (yTile !== y2) {
        yTile += yInc;
        const xTile = x >>> 16;
        if (this.isPillar(xTile, yTile)) {
          return false;
        }
        x += slope;
        const newXTile = x >>> 16;
        if (newXTile !== xTile && this.isPillar(newXTile, yTile)) {
          return false;
        }
      }
    }
    return true;
  }

  private doesCollide(
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

  private legalPosition(x: number, y: number, size: number, index: number) {
    if (y - (size - 1) < 0 || x + (size - 1) > MAP_WIDTH) {
      return false;
    }
    var collision = false;
    for (var i = 0; i < PILLAR_COORDS.length; i++) {
      if (this.doesCollide(x, y, size, PILLAR_COORDS[i][0], PILLAR_COORDS[i][1], 3)) {
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
    for (var i = 0; i < this.mobs.length; i++) {
      if (this.mobs[i][2] < 8) {
        if (
          i != index &&
          this.doesCollide(x, y, size, this.mobs[i][0], this.mobs[i][1], NPC_INFO[this.mobs[i][2]].size)
        ) {
          return false;
        }
      }
    }
    return !collision;
  }

  private sortMobs() {
    this.mobs = this.mobs.sort(function (a, b) {
      const aId = NPC_INFO[a[2]].id;
      const bId = NPC_INFO[b[2]].id;
      return aId - bId;
    });
  }

  public place() {
    if (this.cursorLocation) {
      if (this.mode > 0) {
        //x y mode ox oy cooldown extra
        //prevent 2 mobs on same tile
        for (var i = 0; i < this.mobs.length; i++) {
          if (
            this.mobs[i][3] == this.cursorLocation[0] &&
            this.mobs[i][4] == this.cursorLocation[1]
          ) {
            return;
          }
        }
        // Create mob array
        const newMob: Mob = [
          this.cursorLocation[0],
          this.cursorLocation[1],
          this.mode,
          this.cursorLocation[0],
          this.cursorLocation[1],
          0,
          this.modeExtra,
        ];

        // Store original extra for manticores
        if (this.mode === MANTICORE && this.modeExtra) {
          newMob.push(this.modeExtra);
        }

        this.mobs.push(newMob);
        this.sortMobs();
        // Only reset mode after successfully placing an NPC
        this.mode = 0;
        this.modeExtra = null;
      } else {
        this.selected = [...this.cursorLocation];
      }
      this.cursorLocation = null;
      this.drawWave();
    }
  }

  private advanceReplay() {
    if (this.replay && this.replayTick !== null) {
      if (this.replay[this.replayTick]) {
        this.selected = this.replay[this.replayTick];
      } else {
        this.reset();
      }
      this.replayTick++;
      if (this.replayAuto) {
        clearTimeout(this.replayAuto);
        this.replayAuto = setTimeout(() => this.doAutoTick(), 600);
      }
    }
  }

  private moveMobs(canMove: boolean, canGainLos: boolean) {
    for (var i = 0; i < this.mobs.length; i++) {
      if (this.mobs[i][2] < 8) {
        var mob = this.mobs[i];
          mob[5]--; // Decrement cooldown
          var x = mob[0];
          var y = mob[1];
          var t = mob[2];
          const { size: s, range: r } = NPC_INFO[t];

        if (canMove && !(canGainLos && this.hasLOS(x, y, this.selected[0], this.selected[1], s, r, true))) {
          var dx = x + Math.sign(this.selected[0] - x);
          var dy = y + Math.sign(this.selected[1] - y);
          //allows corner safespotting
          if (this.doesCollide(dx, dy, s, this.selected[0], this.selected[1], 1)) {
            dy = mob[1];
          }
          // 1x1 cannot cut corners around pillars for some reason
          if (
            this.legalPosition(dx, dy, s, i) &&
            (s > 1 ||
              (this.legalPosition(dx, y, s, i) && this.legalPosition(x, dy, s, i)))
          ) {
            // move diagonally
            mob[0] = dx;
            mob[1] = dy;
          } else if (this.legalPosition(dx, y, s, i)) {
            mob[0] = dx;
          } else if (this.legalPosition(x, dy, s, i)) {
            mob[1] = dy;
          }
        }
      }
    }
  }

  private handleManticoreCharging(canAttack: boolean) {
    // Find manticores that should start charging
    let manticoresStartingToCharge: number[] = [];
    for (var i = 0; i < this.mobs.length; i++) {
      if (this.mobs[i][2] === MANTICORE) {
        const mob = this.mobs[i];
        const currentExtra = mob[6];
        const x = mob[0];
        const y = mob[1];

        const isUncharged = currentExtra?.startsWith('u') ?? false;

        if (isUncharged && canAttack && this.hasLOS(x, y, this.selected[0], this.selected[1], NPC_INFO[MANTICORE].size, NPC_INFO[MANTICORE].range, true)) {
          manticoresStartingToCharge.push(i);
        }
      }
    }

    if (manticoresStartingToCharge.length === 0) {
      return;
    }

    // Check if there's already a charged/charging manticore to inherit from
    let establishedStyle: string | null = null;
    for (var i = 0; i < this.mobs.length; i++) {
      if (this.mobs[i][2] === MANTICORE && !manticoresStartingToCharge.includes(i)) {
        const mob = this.mobs[i];
        const currentExtra = mob[6];

        const isChargedOrCharging = currentExtra && !currentExtra.startsWith('u');

        if (isChargedOrCharging) {
          establishedStyle = currentExtra;
          break;
        }
      }
    }

    // Determine styles for the charging manticores
    let knownStyles: string[] = [];
    if (!establishedStyle) {
      for (const idx of manticoresStartingToCharge) {
        const originalExtra = this.mobs[idx][7];
        if (originalExtra && originalExtra !== "u") {
          const baseStyle = originalExtra.startsWith("u") ? originalExtra.substring(1) : originalExtra;
          if (!knownStyles.includes(baseStyle)) {
            knownStyles.push(baseStyle);
          }
        }
      }
    }

    let groupSelectedStyle: MobExtra | null = null;
    if (knownStyles.length > 1) {
      groupSelectedStyle = knownStyles[Math.floor(Math.random() * knownStyles.length)] as MobExtra;
    }

    let randomStyleForUnknowns: MobExtra | null = null;

    for (const idx of manticoresStartingToCharge) {
      const mob = this.mobs[idx];
      const originalExtra = mob[7];
      const currentExtra = mob[6];

      let chargedStyle: MobExtra = null;

      if (establishedStyle) {
        chargedStyle = establishedStyle as MobExtra;
      } else if (groupSelectedStyle) {
        chargedStyle = groupSelectedStyle;
      } else if (currentExtra && currentExtra.startsWith("u") && currentExtra.length > 1) {
        chargedStyle = currentExtra.substring(1) as MobExtra;
      } else if (currentExtra === "u") {
        if (knownStyles.length === 1) {
          chargedStyle = knownStyles[0] as MobExtra;
        } else if (knownStyles.length > 1) {
          chargedStyle = groupSelectedStyle;
        } else {
          if (!randomStyleForUnknowns) {
            const patterns = this.mantimayhem3 ? MM3_PATTERNS : STANDARD_PATTERNS;
            randomStyleForUnknowns = patterns[Math.floor(Math.random() * patterns.length)] as MobExtra;
          }
          chargedStyle = randomStyleForUnknowns;
        }
      }

      if (chargedStyle) {
        mob[6] = chargedStyle;
        mob[5] = MANTICORE_CHARGE_TIME;
      }

      if (originalExtra === "u" && chargedStyle &&
        !establishedStyle && knownStyles.length === 0) {
        mob[7] = ("u" + chargedStyle) as MobExtra;
      }
    }
  }

  private processAttacks(canAttack: boolean): { line: TapeEntry, manticoreFired: boolean } {
    let line: TapeEntry = [];
    let manticoreFiredThisTick = false;

    for (var i = 0; i < this.mobs.length; i++) {
      if (this.mobs[i][2] < 8) {
        var mob = this.mobs[i];
        var x = mob[0];
        var y = mob[1];
        var t = mob[2];
        const { size: s, range: r } = NPC_INFO[t];
        var attacked = 0;

        if (canAttack && this.hasLOS(x, y, this.selected[0], this.selected[1], s, r, true)) {
          if (mob[2] === MANTICORE) {
            const currentExtra = mob[6];
            const isCharged = currentExtra && !currentExtra.startsWith('u');

            if (isCharged && mob[5] <= 0 && !manticoreFiredThisTick) {
              this.manticoreTicksRemaining[i] = 3;
              attacked = 1;
              mob[5] = NPC_INFO[t].cd;
              manticoreFiredThisTick = true;
            }
          } else {
            if (mob[5] <= 0) {
              attacked = 1;
              mob[5] = NPC_INFO[t].cd;
            }
          }
        }
        const value = attacked | ((x & 0xff) << 16) | ((y & 0xff) << 24);
        line.push(value);
      }
    }

    return { line, manticoreFired: manticoreFiredThisTick };
  }

  private recordManticoreOrbSequence(line: TapeEntry) {
    Object.entries(this.manticoreTicksRemaining).forEach(([idx, ticks]) => {
      const index = Number(idx);
      if (ticks > 0 && this.mobs[index]) {
        const manticoreMode = this.mobs[index][6]!;
        const manticoreStyles = MANTICORE_PATTERNS[manticoreMode];
        const currentStyle = manticoreStyles[3 - ticks];
        const prevLine = line[index];
        line[index] = 1 | (currentStyle << 8) | (prevLine & 0xffff0000);
        this.manticoreTicksRemaining[index] = ticks - 1;
      } else {
        delete this.manticoreTicksRemaining[index];
      }
    });
  }

  public step(draw: boolean = false) {
    // Capture the player's position when stepping begins
    if (this.tickCount === 0 && !this.replay) {
      this.stepStartPosition = [...this.selected];
    }

    this.advanceReplay();

    if (this.mode == 0 && this.mobs.length > 0) {
      const canAttack = this.fromWaveStart ? this.tickCount >= DELAY_FIRST_ATTACK_TICKS : true;
      const canMove = this.fromWaveStart ? this.tickCount > 0 : true;
      const canGainLos = this.fromWaveStart ? this.tickCount > 1 : true;

      // Move all mobs
      this.moveMobs(canMove, canGainLos);

      // Handle manticore charging
      this.handleManticoreCharging(canAttack);

      // Process attacks
      const { line, manticoreFired } = this.processAttacks(canAttack);

      // Record manticore orb progression in attack tape
      this.recordManticoreOrbSequence(line);

      if (manticoreFired) {
        this.delayAllReadyMantis();
      }

      // Record this tick's player position and mob actions to history
      this.playerTape.push([this.selected[0], this.selected[1]]);
      this.tape.push(line);
    }
    this.tickCount++;
    if (draw) {
      this.drawWave();
    }
  }

  private delayAllReadyMantis() {
    this.mobs
      .filter((mob) => {
        if (mob[2] !== MANTICORE || mob[5] > 0) return false;
        const currentExtra = mob[6];
        // Check if charged (not starting with 'u')
        return currentExtra && !currentExtra.startsWith('u');
      })
      .forEach((mob) => {
        mob[5] = MANTICORE_DELAY;
      });
  }

  private stopReplay() {
    this.replay = null;
    this.replayTick = null;
    if (this.replayAuto) {
      clearTimeout(this.replayAuto);
    }
    this.replayAuto = null;
    this.updateUi();
  }

  public remove() {
    this.mobs = [];
    this.stopReplay();
    this.selected = [...B5_ORIGIN_TILE];
    this.stepStartPosition = null;
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    window.location.href = url.toString();
    this.reset();
    this.drawWave();
  }

  public reset() {
    for (var i = 0; i < this.mobs.length; i++) {
      this.mobs[i][0] = this.mobs[i][3];
      this.mobs[i][1] = this.mobs[i][4];
      this.mobs[i][5] = 0;

      // Reset manticores to their original state
      if (this.mobs[i][2] === MANTICORE) {
        const originalExtra = this.mobs[i][7];
        if (originalExtra !== undefined) {
          // Restore the original extra value
          this.mobs[i][6] = originalExtra;
        }
      }
    }
    this.manticoreTicksRemaining = {};
    this.tape = [];
    this.playerTape = [];
    this.tapeSelectionRange = null;
    this.tickCount = 0;
    if (this.replay) {
      this.replayTick = 0;
      this.selected = this.replay[0];
    } else if (this.stepStartPosition) {
      // Reset player to position at start of stepping (like replay mode does)
      this.selected = [...this.stepStartPosition];
    }
    this.draggingNpcIndex = null;
    this.draggingNpcOffset = null;
    this.cursorLocation = null;
    this.drawWave();
  }

  public setMode(m: number, extra?: MobExtra, initPosition: boolean = false) {
    if (initPosition && this.cursorLocation === null) {
      this.cursorLocation = [...this.selected];
    }
    this.mode = m;
    this.modeExtra = extra ?? null;
    this.drawWave();
  }

  private drawLOS(
    x: number,
    y: number,
    s: number,
    r: number,
    isNPC: boolean,
    color = "red"
  ) {
    if (!this.ctx) {
      return;
    }
    if (this.showPlayerLoS) {
      this.ctx.globalAlpha = 0.15;
    } else {
      this.ctx.globalAlpha = 0;
    }

    for (var i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
      this.ctx.fillStyle = color;

      var x2 = i % MAP_WIDTH;
      var y2 = Math.floor(i / MAP_HEIGHT);

      if (this.hasLOS(x, y, x2, y2, s, r, isNPC)) {
        this.ctx.fillRect(x2 * TILE_SIZE, y2 * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
    this.ctx.globalAlpha = 1;
  }

  // currently, only one LoS listener is allowed.
  public registerLoSListener(listener: LoSListener) {
    this.losListener = listener;
  }

  private updateUi() {
    // currently, we always fire events
    this.losListener?.onIsReplayingChanged(!!this.replayAuto);
    this.losListener?.onHasReplayChanged(
      !!this.replay && this.replayTick !== null && !!this.replay[this.replayTick],
      this.replay?.length ?? null
    );
    this.losListener?.onCanSaveReplayChanged(!this.replayAuto && this.tape.length > 0 && this.tape.length <= 32);
    this.losListener?.onReplayTickChanged(this.replayTick ?? 0);
  }

  public drawWave() {
    this.updateUi();
    if (!this.ctx || !this.mapElement) {
      return;
    }
    const ctx = this.ctx;
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, this.mapElement.width, this.mapElement.height);

    const scale = (p: number) => p * TILE_SIZE;
    function drawManticorePattern(pattern: number[], x: number, y: number, isTransparent: boolean = false) {
      pattern.forEach((colorIndex, index) => {
        if (!ctx) {
          return;
        }
        const color = MANTICORE_ATTACKS[colorIndex];
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        if (isTransparent) {
          ctx.globalAlpha = 0.35;
        }
        ctx.beginPath();
        ctx.arc(scale(x + 2.5), scale(y - index + 0.5), TILE_SIZE / 2, 0, Math.PI * 2);
        ctx.fill();
        if (isTransparent) {
          ctx.globalAlpha = 1;
        }
      });
    }

    const checkerColor = CHECKER ? "#eee" : "#fff";
    for (var i = 0; i < MAP_WIDTH * MAP_HEIGHT; i++) {
      const x = i % MAP_WIDTH;
      const y = Math.floor(i / MAP_WIDTH);
      ctx.fillStyle = (i + (y % 2)) % 2 ? "#fff" : checkerColor;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
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
    for (var i = 0; i < PILLAR_COORDS.length; i++) {
      ctx.fillRect(
        PILLAR_COORDS[i][0] * TILE_SIZE,
        (PILLAR_COORDS[i][1] + 1) * TILE_SIZE,
        3 * TILE_SIZE,
        -3 * TILE_SIZE
      );
    }
    if (this.showSpawns) {
      ctx.globalAlpha = 0.35;
    } else {
      ctx.globalAlpha = 0;
    }
    ctx.fillStyle = "#999";
    for (var i = 0; i < SPAWNS.length; i++) {
      ctx.fillRect(
        SPAWNS[i][0] * TILE_SIZE,
        (SPAWNS[i][1] + 1) * TILE_SIZE,
        3 * TILE_SIZE,
        -3 * TILE_SIZE
      );
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#9F9";
    ctx.fillRect(scale(B5_ORIGIN_TILE[0]), scale(B5_ORIGIN_TILE[1]), TILE_SIZE, TILE_SIZE);
    ctx.globalAlpha = 1;
    //mobs
    for (var i = 0; i < this.mobs.length; i++) {
      var x = this.mobs[i][0];
      var y = this.mobs[i][1];
      const t = this.mobs[i][2];
      var { size: s, range: r, color: c } = NPC_INFO[t];
      ctx.fillStyle = ctx.strokeStyle = c;
      if (t < 8) {
        ctx.fillRect(x * TILE_SIZE, (y + 1) * TILE_SIZE, 1 * TILE_SIZE, -1 * TILE_SIZE);
        ctx.strokeRect(x * TILE_SIZE + 1, (y + 1) * TILE_SIZE - 1, s * TILE_SIZE, -s * TILE_SIZE);
      }
      if (this.mode == 0 && this.hasLOS(x, y, this.selected[0], this.selected[1], s, r, true)) {
        ctx.fillStyle = "black";
        ctx.fillRect(x * TILE_SIZE, (y + 1) * TILE_SIZE, (1 * TILE_SIZE) / 4, (-1 * TILE_SIZE) / 4);
      }
    }
    if (this.draggingNpcIndex !== null) {
      // currently dragging an NPC, draw its LOS
      const t = this.mobs[this.draggingNpcIndex][2];
      this.drawLOS(
        this.mobs[this.draggingNpcIndex][0],
        this.mobs[this.draggingNpcIndex][1],
        NPC_INFO[t].size,
        NPC_INFO[t].range,
        t > 0,
        NPC_INFO[t].color
      );
      // draw minotaur line-of-sight (from center tile as if it were a player)
      if (t === MINOTAUR) {
        this.drawLOS(
          this.mobs[this.draggingNpcIndex][0] + 1,
          this.mobs[this.draggingNpcIndex][1] - 1,
          1,
          MINOTAUR_HEAL_RANGE,
          false,
          MINOTAUR_HEAL_COLOR
        );
      }
    } else if (this.cursorLocation) {
      // currently placing an NPC, draw its LOS
      var { size: s, range: r, color: c } = NPC_INFO[this.mode];
      this.drawLOS(this.cursorLocation[0], this.cursorLocation[1], s, r, this.mode > 0, c);

      // draw minotaur line-of-sight (from center tile as if it were a player)
      if (this.mode === MINOTAUR) {
        this.drawLOS(
          this.cursorLocation[0] + 1,
          this.cursorLocation[1] - 1,
          1,
          MINOTAUR_HEAL_RANGE,
          false,
          MINOTAUR_HEAL_COLOR
        );
      }
    }

    var { size: s, range: r, color: c } = NPC_INFO[NPC_TYPES.PLAYER];

    // draw player
    ctx.fillStyle = ctx.strokeStyle = c;
    ctx.fillRect(
      this.selected[0] * TILE_SIZE,
      (this.selected[1] + 1) * TILE_SIZE,
      1 * TILE_SIZE,
      -1 * TILE_SIZE
    );
    ctx.strokeRect(
      this.selected[0] * TILE_SIZE,
      (this.selected[1] + 1) * TILE_SIZE,
      s * TILE_SIZE,
      -s * TILE_SIZE
    );
    if (this.images[0]) {
      ctx.drawImage(
        this.images[0]!,
        this.selected[0] * TILE_SIZE,
        (this.selected[1] - s + 1) * TILE_SIZE,
        s * TILE_SIZE,
        s * TILE_SIZE
      );
    }

    if (this.cursorLocation) {
      var { size: s, range: r, color: c } = NPC_INFO[this.mode];
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = ctx.strokeStyle = c;
      ctx.fillRect(
        this.cursorLocation[0] * TILE_SIZE,
        (this.cursorLocation[1] + 1) * TILE_SIZE,
        1 * TILE_SIZE,
        -1 * TILE_SIZE
      );
      ctx.strokeRect(
        this.cursorLocation[0] * TILE_SIZE,
        (this.cursorLocation[1] + 1) * TILE_SIZE,
        s * TILE_SIZE,
        -s * TILE_SIZE
      );
      // draw image for anything that's not a player
      if (this.images[this.mode] && this.mode !== 0 && this.mode !== MODE_PLAYER) {
        ctx.drawImage(
          this.images[this.mode]!,
          this.cursorLocation[0] * TILE_SIZE,
          (this.cursorLocation[1] - s + 1) * TILE_SIZE,
          s * TILE_SIZE,
          s * TILE_SIZE
        );
      }
      if (this.mode === MANTICORE && this.modeExtra) {
        // Don't draw orbs for unknown manticores
        if (this.modeExtra !== "u") {
          const colorPattern = MANTICORE_PATTERNS[this.modeExtra];
          const isUncharged = this.modeExtra.startsWith("u");
          drawManticorePattern(colorPattern, this.cursorLocation[0], this.cursorLocation[1], isUncharged);
        }
      }
      ctx.globalAlpha = 1;
    }
    // ticker tape
    const offset = TICKER_START_X;
    const tickerStartY = (idx: number) => TILE_SIZE * idx;
    for (var i = 0; i < this.tape.length; i++) {
      if (this.fromWaveStart && i < DELAY_FIRST_ATTACK_TICKS) {
        ctx.fillStyle = i % 2 == 0 ? "#666" : "#777";
      } else {
        ctx.fillStyle = i % 2 == 0 ? "#ddd" : "#eee";
      }
      ctx.fillRect(offset, TILE_SIZE * i, TILE_SIZE * TICKER_WIDTH, TILE_SIZE);
      for (var j = 0; j < this.tape[i].length; j++) {
        const value = this.tape[i][j];
        var attacked = value & 0xff;
        var t = this.mobs[j][2];
        if (t > 0 && attacked) {
          ctx.fillStyle = NPC_INFO[t].color;
          ctx.fillRect(offset + TILE_SIZE * j, tickerStartY(i), TILE_SIZE, TILE_SIZE);
        }
        if (attacked && t === MANTICORE) {
          const pattern = (value >> 8) & 0xff;
          ctx.fillStyle = MANTICORE_ATTACKS[pattern];
          ctx.beginPath();
          ctx.arc(
            offset + TILE_SIZE * (j + 0.5),
            TILE_SIZE * (i + 0.5),
            TILE_SIZE / 2,
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
    if (this.tapeSelectionRange?.length) {
      ctx.fillStyle = "yellow";
      ctx.globalAlpha = 0.25;
      const tapeStartY = this.tapeSelectionRange[0];
      const tapeEndY =
        this.tapeSelectionRange.length >= 2 ? this.tapeSelectionRange[1] : tapeStartY + 1;
      ctx.fillRect(
        offset,
        tickerStartY(tapeStartY),
        TILE_SIZE * TICKER_WIDTH,
        (tapeEndY - tapeStartY) * TILE_SIZE
      );
      ctx.globalAlpha = 1;
    }
    // mobs
    const minotaurs = this.mobs.filter((m) => m[2] === MINOTAUR);
    for (var i = 0; i < this.mobs.length; i++) {
      const [x, y, t] = this.mobs[i];
      const s = NPC_INFO[this.mobs[i][2]].size;
      // Skip player (type 0) - should never be in mobs array
      if (!t || t === 0 || t === MODE_PLAYER) {
        continue;
      }
      if (this.images[t] && t !== 0) {
        ctx.drawImage(
          this.images[t],
          x * TILE_SIZE,
          (y - s + 1) * TILE_SIZE,
          s * TILE_SIZE,
          s * TILE_SIZE
        );
      }
      const mobExtra = this.mobs[i][6];
      if (t === MANTICORE && mobExtra && mobExtra !== "u") {
        const colorPattern = MANTICORE_PATTERNS[mobExtra];
        // Check if uncharged by looking at the extra string
        const isUncharged = mobExtra.startsWith('u');
        drawManticorePattern(colorPattern, x, y, isUncharged);
      }

      // only odd-size npcs are healable for now
      if (s % 2 == 1) {
        const centerOffset = (s - 1) / 2;
        ctx.lineWidth = 3;
        for (const [mX, mY] of minotaurs) {
          if (
            this.hasLOS(
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
            ctx.moveTo((mX + 1.5) * TILE_SIZE, (mY - 0.5) * TILE_SIZE);
            ctx.lineTo((x + s / 2) * TILE_SIZE, (y - s / 2 + 1) * TILE_SIZE);
            ctx.stroke();
          }
        }
        ctx.lineWidth = 1;
      }

      if (this.showVenatorBounce && this.mousedOverNpc !== null && this.mousedOverNpc !== i) {
        // venator bounce candidate
        ctx.strokeStyle = "#ff69b4";
        ctx.lineWidth = 5;
        const [sX, sY, sT] = this.mobs[this.mousedOverNpc];
        if (canBounce(sX, sY, NPC_INFO[sT].size, this.mobs[i][0], this.mobs[i][1], s)) {
          ctx.strokeRect(x * TILE_SIZE, (y - s + 1) * TILE_SIZE, TILE_SIZE * s, TILE_SIZE * s);
        }
        ctx.lineWidth = 1;
      }
    }

    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "red";
    ctx.fillText("North", (MAP_WIDTH / 2) * TILE_SIZE, 4);
    ctx.fillStyle = "white";
    ctx.fillText("South", (MAP_WIDTH / 2) * TILE_SIZE, (MAP_HEIGHT - 1) * TILE_SIZE + 4);
  }

  // exposed for testing
  public _setSelected(
    s: Coordinates,
    _mode: number,
    _extra: MobExtra | null = null
  ) {
    this.selected = s;
    this.cursorLocation = s;
    this.mode = _mode;
    this.modeExtra = _extra;
  }

  public _getMobs() {
    return this.mobs;
  }
}
