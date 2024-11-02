import { useRef, useState } from "react";
import "./App.css";
import { Canvas, CanvasHandle } from "./Canvas";

function App() {
  const [isDragging, setDragging] = useState(false);

  const [firstAttackDelayed, setFirstAttackDelayed] = useState(false);
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
  };

  return (
    <>
      <div className="frame" onMouseUp={stopDragging}>
        <button onClick={() => canvas.current?.remove()}>Clear</button>
        <button onClick={() => canvas.current?.place()}>Place NPC</button>
        <button
          onMouseDown={() => setMode(0)}
          onMouseUp={stopDragging}
          style={{ borderColor: "red" }}
        >
          Player
        </button>
        <button
          onMouseDown={() => setMode(1)}
          onMouseUp={stopDragging}
          style={{ borderColor: "cyan" }}
        >
          Serpent
        </button>
        <button
          onMouseDown={() => setMode(2)}
          onMouseUp={stopDragging}
          style={{ borderColor: "lime" }}
        >
          Javelin
        </button>
        <button
          onMouseDown={() => setMode(3)}
          onMouseUp={stopDragging}
          style={{ borderColor: "orange" }}
        >
          Jaguar
        </button>
        <button
          onMouseDown={() => setMode(4, "r")}
          onMouseUp={stopDragging}
          style={{ borderColor: "purple" }}
        >
          Manti (Range)
        </button>
        <button
          onMouseDown={() => setMode(4, "m")}
          onMouseUp={stopDragging}
          style={{ borderColor: "purple" }}
        >
          Manti (Mage)
        </button>
        <button
          onMouseDown={() => setMode(5)}
          onMouseUp={stopDragging}
          style={{ borderColor: "brown" }}
        >
          Minotaur
        </button>
        <button
          onMouseDown={() => setMode(6)}
          onMouseUp={stopDragging}
          style={{ borderColor: "blue" }}
        >
          Shockwave
        </button>
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
            value={firstAttackDelayed ? "true" : "false"}
            onChange={(e) => setFirstAttackDelayed(e.target.checked)}
            aria-label="NPCs will not attack for 3t after wave start"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>Delay first attack by 3t</span>
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
        delayFirstAttack={firstAttackDelayed}
        onCanSaveReplayChanged={setCanSaveReplay}
        onHasReplayChanged={(_hasReplay, replayLength) =>
          setCurrentReplayLength(replayLength ?? null)
        }
        onIsReplayingChanged={setIsReplaying}
        onReplayTickChanged={setReplayTick}
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
