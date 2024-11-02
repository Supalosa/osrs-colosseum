import "./App.css";

function App() {
  return (
    <>
      <div className="frame">
        <button onclick="remove()">Clear</button>
        <button onclick="place()">Place NPC</button>
        <button onclick="setMode(0)" style={{ borderColor: "red" }}>
          Player
        </button>
        <button onclick="setMode(1)" style={{ borderColor: "cyan" }}>
          Serpent
        </button>
        <button onclick="setMode(2)" style={{ borderColor: "lime" }}>
          Javelin
        </button>
        <button onclick="setMode(3)" style={{ borderColor: "orange" }}>
          Jaguar
        </button>
        <button onclick="setMode(4, 'r')" style={{ borderColor: "purple" }}>
          Manti (Range)
        </button>
        <button onclick="setMode(4, 'm')" style={{ borderColor: "purple" }}>
          Manti (Mage)
        </button>
        <button onclick="setMode(5)" style={{ borderColor: "brown" }}>
          Minotaur
        </button>
        <button onclick="setMode(6)" style={{ borderColor: "blue" }}>
          Shockwave
        </button>
      </div>
      <div className="frame">
        Toggle:
        <button
          onclick="togglePlayerLoS()"
          aria-label="Show the currently selected unit's Line of Sight"
          data-microtip-position="bottom"
          role="tooltip"
        >
          LoS
        </button>
        <button onClick="copySpawnURL()">Copy Spawn URL</button>
        <button
          id="copyReplayUrlButton"
          disabled="true"
          onClick="copyReplayURL()"
          aria-label="Copy the current tick diagram as replay (or select a segment). Max 32 ticks"
          data-microtip-position="bottom"
          role="tooltip"
        >
          Copy Replay URL
        </button>
        <div>
          <input
            type="checkbox"
            id="delayFirstAttack"
            value="false"
            aria-label="NPCs will not attack for 3t after wave start"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>Delay first attack by 3t</span>
        </div>
        <div>
          <input
            type="checkbox"
            id="showVenatorBounce"
            value="false"
            aria-label="Mouse over an NPC to show nearby NPCs that a Venator bow will bounce to"
            data-microtip-position="bottom"
            role="tooltip"
          />
          <span>Venator</span>
        </div>
      </div>
      <div className="frame">
        <span id="replayIndicator"></span>
        Controls:
        <button
          onclick="reset(); drawWave();"
          title="hotkey: down or mousewheel up"
        >
          &laquo; Reset
        </button>
        <button
          onclick="toggleAutoReplay()"
          id="replayAutoButton"
          hidden="true"
        ></button>
        <button
          onclick="step(); drawWave();"
          title="hotkey: up or mousewheel down"
        >
          Step
        </button>
      </div>
      <canvas
        id="map"
        onselectstart="return false"
        oncontextmenu="return false"
      ></canvas>
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
