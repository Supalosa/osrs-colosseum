import { CSSProperties, useRef, useState } from "react";
import "./App.css";
import { Canvas, CanvasHandle } from "./Canvas";
import { MobType, MobExtra } from "./types";
import { ManticoreOverlay } from "./ManticoreOverlay";

function App() {
  const [isDragging, setDragging] = useState(false);

  // note: this is a bit janky (it's set here on first mount + in lineOnSight in parse)
  const [fromWaveStart, setFromWaveStart] = useState(parent.location.hash?.endsWith("ws"));
  const [showVenatorBounce, setShowVenatorBounce] = useState(false);

  const [currentReplayLength, setCurrentReplayLength] = useState<number | null>(
    null
  );
  const [isReplaying, setIsReplaying] = useState(false);
  const [canSaveReplay, setCanSaveReplay] = useState(false);
  const [replayTick, setReplayTick] = useState(0);

  const canvas = useRef<CanvasHandle>(null);

  const setMode: CanvasHandle["setMode"] = (...args) => {
    canvas.current?.setMode(...args);
    setDragging(true);
  };

  const handleMaybeDrop = () => {
    if (isDragging) {
      canvas.current?.place();
    }
    setDragging(false);
  };

  const stopDragging = (e: React.MouseEvent) => {
    setDragging(false);
    e.preventDefault();
    e.stopPropagation();
  };

  type UnitButtonProps = {
    mode: MobType;
    extra?: MobExtra;
    image: string;
    overlay?: React.ReactNode;
    borderColor: CSSProperties["color"];
    tooltip: string;
    width?: number;
    height?: number;
  };

  const UnitButton = ({
    mode,
    extra = null,
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
        onMouseDown={(e) => {
          setMode(mode, extra);
          e.preventDefault();
        }}
        onClick={(e) => {
          setMode(mode, extra, true);
          stopDragging(e);
        }}
        style={{ borderColor, width, height, textAlign: "center", padding: 0 }}
        aria-label={tooltip}
        data-microtip-position="bottom"
        role="tooltip"
      >
        {overlay && <div className="overlay">{overlay}</div>}
        <img src={image} height="56" draggable="false" />
      </button>
    );
  };

  return (
    <>
      <div className="frame" onMouseUp={stopDragging}>
        <button onClick={() => canvas.current?.remove()}>Clear</button>
        <button onClick={() => canvas.current?.place()}>Place NPC</button>
        <UnitButton
          mode={0}
          image="./player.png"
          borderColor="red"
          tooltip="Place the Player by dragging onto the map."
        />
        <UnitButton
          mode={1}
          image="./serpent_shaman.png"
          borderColor="cyan"
          tooltip="Place a Serpent Shaman by dragging onto the map."
        />
        <UnitButton
          mode={2}
          image="./javelin_colossus.png"
          borderColor="lime"
          tooltip="Place a Javelin Colossus by dragging onto the map."
        />
        <UnitButton
          mode={3}
          image="./jaguar_warrior.png"
          borderColor="orange"
          tooltip="Place a Jaguar Warrior by dragging onto the map."
        />
        <UnitButton
          mode={4}
          extra="u"
          overlay={null}
          image="./manticore.png"
          borderColor="purple"
          tooltip="Place an Unknown Manticore by dragging onto the map."
        />
        <UnitButton
          mode={4}
          extra="r"
          overlay={<ManticoreOverlay order={["range", "mage", "melee"]} />}
          image="./manticore.png"
          borderColor="purple"
          tooltip="Place a charged Manticore (range first) by dragging onto the map. Toggle charged/uncharged by right clicking"
        />
        <UnitButton
          mode={4}
          extra="m"
          overlay={<ManticoreOverlay order={["mage", "range", "melee"]} />}
          image="./manticore.png"
          borderColor="purple"
          tooltip="Place a charged Manticore (mage first) by dragging onto the map. Toggle charged/uncharged by right clicking"
        />
        <UnitButton
          mode={5}
          image="./minotaur.png"
          borderColor="purple"
          tooltip="Place a Minotaur by dragging onto the map."
        />
        <UnitButton
          mode={6}
          image="./shockwave_colossus.png"
          borderColor="purple"
          tooltip="Place a Shockwave Colossus by dragging onto the map."
        />
      </div>
      <div className="frame">
        Toggle:
        <button
          onClick={() => canvas.current?.togglePlayerLoS()}
          aria-label="Show the currently selected unit's Line of Sight"
          data-microtip-position="bottom"
          role="tooltip"
        >
          LoS
        </button>
        <button onClick={() => canvas.current?.copySpawnURL()}>
          Copy Spawn URL
        </button>
        <button
          id="copyReplayUrlButton"
          disabled={canSaveReplay}
          onClick={() => canvas.current?.copyReplayURL()}
          aria-label="Copy the current tick diagram as replay (or select a segment). Max 32 ticks"
          data-microtip-position="bottom"
          role="tooltip"
        >
          Copy Replay URL
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
          onClick={() => canvas.current?.reset()}
          title="hotkey: down or mousewheel up"
        >
          &laquo; Reset
        </button>
        <button
          onClick={() => canvas.current?.toggleAutoReplay()}
          id="replayAutoButton"
          hidden={currentReplayLength === null}
        >
          {isReplaying ? "Pause" : "Play"}
        </button>
        <button
          onClick={() => canvas?.current?.step()}
          title="hotkey: up or mousewheel down"
        >
          Step
        </button>
      </div>
      <Canvas
        ref={canvas}
        showVenatorBounce={showVenatorBounce}
        fromWaveStart={fromWaveStart}
        onCanSaveReplayChanged={setCanSaveReplay}
        onHasReplayChanged={(_hasReplay, replayLength) =>
          setCurrentReplayLength(replayLength ?? null)
        }
        onIsReplayingChanged={setIsReplaying}
        onReplayTickChanged={setReplayTick}
        onFromWaveStartChanged={setFromWaveStart}
        onMouseUp={handleMaybeDrop}
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

export default App;
