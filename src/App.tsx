import {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { MobType, MobExtra } from "./types";
import { ManticoreOverlay } from "./ManticoreOverlay";
import { LineOfSight } from "./lineOfSight";

import "./App.css";
import { NpcType } from "./constants";

function App() {
  const [isDragging, setDragging] = useState(false);

  // note: this is a bit janky (it's set here on first mount + in lineOnSight in parse)
  const [fromWaveStart, setFromWaveStart] = useState(
    parent.location.hash?.includes("ws"),
  );
  const [mantimayhem3, setMantimayhem3] = useState(
    parent.location.hash?.includes("mm3"),
  );
  const [showVenatorBounce, setShowVenatorBounce] = useState(false);

  const [currentReplayLength, setCurrentReplayLength] = useState<number | null>(
    null,
  );
  const [isReplaying, setIsReplaying] = useState(false);
  const [canSaveReplay, setCanSaveReplay] = useState(false);
  const [replayTick, setReplayTick] = useState(0);

  const [lineOfSight, setLineOfSight] = useState<LineOfSight | null>(null);

  function handleCanvas(canvas: HTMLCanvasElement | null) {
    if (lineOfSight) {
      return;
    }
    if (!canvas) {
      return;
    }
    const newLos = new LineOfSight();
    newLos.initDOM(canvas);
    newLos.registerLoSListener({
      onHasReplayChanged: (_hasReplay, replayLength) =>
        setCurrentReplayLength(replayLength ?? null),
      onCanSaveReplayChanged: setCanSaveReplay,
      onIsReplayingChanged: setIsReplaying,
      onReplayTickChanged: setReplayTick,
      onFromWaveStartChanged: setFromWaveStart,
      onMantimayhem3Changed: setMantimayhem3,
    });
    setLineOfSight(newLos);
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      lineOfSight?.handleKeyDown(e);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [lineOfSight]);

  const handleMaybeDrop = () => {
    if (isDragging) {
      lineOfSight?.place();
    }
    setDragging(false);
  };

  const DraggableUnitButton = useCallback((
    props: Omit<UnitButtonProps, "lineOfSight"> & {
      mode: NpcType;
      extra?: MobExtra;
    },
  ) => {
    const { mode, extra } = props;
    return (
      <UnitButton
        {...props}
        lineOfSight={lineOfSight}
        onMouseDown={(e) => {
          lineOfSight?.setMode(mode, extra);
          setDragging(true);
          e.preventDefault();
        }}
        onClick={(e) => {
          lineOfSight?.setMode(mode, extra, true);
          setDragging(true);
          e.preventDefault();
          e.stopPropagation();
        }}
      />
    );
  }, [lineOfSight]);

  return (
    <>
      <div className="frame units-frame" onMouseUp={() => setDragging(false)}>
        {/* this div houses the clear & place npc buttons *column* */}
        <div className="controls-column">
          {/* this div houses the clear & place npc buttons *row* within the column*/}
          <div className="controls-row">
            <button onClick={() => lineOfSight?.remove()}>Clear</button>
            <button onClick={() => lineOfSight?.place()}>Place NPC</button>
          </div>
          {/* this is the row below the clear & place npc buttons row that acts as a placeholder */}
          <div className="controls-placeholder">
            {mantimayhem3 && <div style={{ height: "64px" }}></div>}
          </div>
        </div>
        {/* this div houses the player & npc buttons *column* */}
        <div className="units-column">
          {/* this div houses the player & npc buttons *row* within the column */}
          <div className="units-row">
            <DraggableUnitButton
              mode={0}
              image="./player.png"
              borderColor="red"
              tooltip="Place the Player by dragging onto the map."
            />
            <DraggableUnitButton
              mode={1}
              image="./serpent_shaman.png"
              borderColor="cyan"
              tooltip="Place a Serpent Shaman by dragging onto the map (spawned at the start at the wave)"
            />
            <DraggableUnitButton
              mode={2}
              image="./javelin_colossus.png"
              borderColor="lime"
              tooltip="Place a Javelin Colossus by dragging onto the map."
            />
            <DraggableUnitButton
              mode={3}
              image="./jaguar_warrior.png"
              borderColor="orange"
              tooltip="Place a Jaguar Warrior by dragging onto the map."
            />
            <DraggableUnitButton
              mode={4}
              extra="u"
              overlay={null}
              image="./manticore.png"
              borderColor="purple"
              tooltip="Place an Unknown Manticore by dragging onto the map."
            />
            <DraggableUnitButton
              mode={4}
              extra="r"
              overlay={<ManticoreOverlay order={["range", "mage", "melee"]} />}
              image="./manticore.png"
              borderColor="purple"
              tooltip="Place a charged Manticore (range first) by dragging onto the map. Toggle charged/uncharged by right clicking"
            />
            <DraggableUnitButton
              mode={4}
              extra="m"
              overlay={<ManticoreOverlay order={["mage", "range", "melee"]} />}
              image="./manticore.png"
              borderColor="purple"
              tooltip="Place a charged Manticore (mage first) by dragging onto the map. Toggle charged/uncharged by right clicking"
            />
            <DraggableUnitButton
              mode={5}
              image="./minotaur.png"
              borderColor="purple"
              tooltip="Place a Minotaur by dragging onto the map."
            />
            <DraggableUnitButton
              mode={6}
              image="./shockwave_colossus.png"
              borderColor="purple"
              tooltip="Place a Shockwave Colossus by dragging onto the map."
            />
            <DraggableUnitButton
              mode={7}
              overlay={
                <span style={{ fontSize: 16, fontWeight: "bold" }}>+</span>
              }
              image="./serpent_shaman.png"
              borderColor="cyan"
              tooltip='Place a Reinforcement Serpent Shaman. These "wiggle" differently from shamans spawned at the start of the wave.'
            />
          </div>
          {/* this is the mantimayhem 3 units row that appear conditionally */}
          {mantimayhem3 && (
            <div className="units-row mm3-row">
              {/* 3 placeholder units on the left */}
              <div style={{ width: 64, height: 64 }}></div>
              <div style={{ width: 64, height: 64 }}></div>
              <div style={{ width: 64, height: 64 }}></div>
              <DraggableUnitButton
                mode={4}
                extra="Mrm"
                overlay={
                  <ManticoreOverlay order={["melee", "range", "mage"]} />
                }
                image="./manticore.png"
                borderColor="purple"
                tooltip="MM3: Place a charged Manticore (melee-range-mage) by dragging onto the map. Toggle charged/uncharged by right clicking"
              />
              <DraggableUnitButton
                mode={4}
                extra="Mmr"
                overlay={
                  <ManticoreOverlay order={["melee", "mage", "range"]} />
                }
                image="./manticore.png"
                borderColor="purple"
                tooltip="MM3: Place a charged Manticore (melee-mage-range) by dragging onto the map. Toggle charged/uncharged by right clicking"
              />
              <DraggableUnitButton
                mode={4}
                extra="rMm"
                overlay={
                  <ManticoreOverlay order={["range", "melee", "mage"]} />
                }
                image="./manticore.png"
                borderColor="purple"
                tooltip="MM3: Place a charged Manticore (range-melee-mage) by dragging onto the map. Toggle charged/uncharged by right clicking"
              />
              <DraggableUnitButton
                mode={4}
                extra="mMr"
                overlay={
                  <ManticoreOverlay order={["mage", "melee", "range"]} />
                }
                image="./manticore.png"
                borderColor="purple"
                tooltip="MM3: Place a charged Manticore (mage-melee-range) by dragging onto the map. Toggle charged/uncharged by right clicking"
              />
              {/* 2 placeholder units on the right */}
              <div style={{ width: 64, height: 64 }}></div>
              <div style={{ width: 64, height: 64 }}></div>
            </div>
          )}
        </div>
      </div>

      <div className="frame">
        <button
          onClick={() => lineOfSight?.togglePlayerLoS()}
          aria-label="Show the currently selected unit's Line of Sight"
          data-microtip-position="bottom"
          role="tooltip"
        >
          Toggle LoS
        </button>
        <button onClick={() => lineOfSight?.copySpawnURL()}>
          Copy Spawn URL
        </button>
        <button
          id="copyReplayUrlButton"
          disabled={!canSaveReplay}
          onClick={() => lineOfSight?.copyReplayURL()}
          aria-label="Copy the current tick diagram as replay (or select a segment). Max 32 ticks"
          data-microtip-position="bottom"
          role="tooltip"
        >
          Copy Replay URL
        </button>
        <button
          id="exportReplayButton"
          disabled={!canSaveReplay}
          onClick={() => lineOfSight?.exportReplay()}
          aria-label="Export .webm animation of the replay"
          data-microtip-position="bottom"
          role="tooltip"
        >
          Export Video
        </button>
        <div>
          <input
            type="checkbox"
            checked={fromWaveStart ? true : false}
            onChange={(e) => setFromWaveStart(e.target.checked)}
            aria-label="NPCs will not attack for 3t after wave start, cannot move on the first tick, have melee distance second tick"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>From wave start</span>
        </div>
        <div>
          <input
            type="checkbox"
            checked={mantimayhem3 ? true : false}
            onChange={(e) => setMantimayhem3(e.target.checked)}
            aria-label="Mantimayhem 3: Manticores can have random orb attack orders"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>Mantimayhem 3</span>
        </div>
        <div>
          <input
            type="checkbox"
            value={showVenatorBounce ? "true" : "false"}
            onChange={(e) => setShowVenatorBounce(e.target.checked)}
            aria-label="Mouse over an NPC to show nearby NPCs that a Venator bow will bounce to"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>Venator</span>
        </div>
      </div>
      <div className="frame">
        <span id="replayIndicator">
          {currentReplayLength ? (
            <strong>
              <span style={{ color: "#FF0000" }}>
                Replay: Tick {replayTick} / {currentReplayLength}
              </span>
            </strong>
          ) : null}
        </span>
        Controls:
        <button
          onClick={() => lineOfSight?.reset()}
          title="hotkey: down or mousewheel up"
        >
          &laquo; Reset
        </button>
        <button
          onClick={() => lineOfSight?.toggleAutoReplay()}
          id="replayAutoButton"
          hidden={currentReplayLength === null}
        >
          {isReplaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => lineOfSight?.step()}
          title="hotkey: up or mousewheel down"
        >
          Step
        </button>
      </div>
      <canvas
        ref={handleCanvas}
        onSelect={() => false}
        onContextMenu={(e) => lineOfSight?.onCanvasRightClick(e)}
        onMouseDown={(e) => lineOfSight?.onCanvasMouseDown(e)}
        onMouseUp={(e) => {
          lineOfSight?.onCanvasMouseUp(e);
          handleMaybeDrop?.();
        }}
        onDoubleClick={(e) => lineOfSight?.onCanvasDblClick(e)}
        onWheel={(e) => lineOfSight?.onCanvasMouseWheel(e)}
        onMouseMove={(e) => lineOfSight?.onCanvasMouseMove(e)}
        onMouseOut={() => lineOfSight?.onCanvasMouseOut()}
      />
      <p className="footer">
        Based on{" "}
        <a href="https://ifreedive-osrs.github.io/">ifreedive's tool</a> which
        is in turn based on some code from{" "}
        <a href="https://bistools.github.io/inferno.html">Backseat's tool</a>,
        adapted by{" "}
        <a href="https://github.com/Supalosa/osrs-colosseum">Supalosa</a> for
        Colosseum.{" "}
        <a href="https://github.com/Supalosa/osrs-colosseum/issues">
          [Issue tracker]
        </a>
      </p>
    </>
  );
}

type UnitButtonProps = {
  lineOfSight: LineOfSight | null;
  onMouseDown?: MouseEventHandler;
  onClick?: MouseEventHandler;
  image: string;
  overlay?: React.ReactNode;
  borderColor: CSSProperties["color"];
  tooltip: string;
  width?: number;
  height?: number;
};

const UnitButton = ({
  onMouseDown,
  onClick,
  image,
  overlay = null,
  borderColor,
  tooltip,
  width = 64,
  height = 64,
}: UnitButtonProps) => {
  return (
    <button
      className="UnitButton"
      onMouseDown={onMouseDown}
      onClick={onClick}
      style={{ borderColor, width, height, textAlign: "center", padding: 0 }}
      aria-label={tooltip}
      data-microtip-position="bottom"
      role="tooltip"
    >
      {overlay && <div className="overlay">{overlay}</div>}
      <img src={image} height="50" draggable="false" />
    </button>
  );
};

export default App;
