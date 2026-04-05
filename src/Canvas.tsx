import React, {
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

import { LoSListener, LineOfSight } from "./lineOfSight";
import { useOnChange } from "./useOnChange";

export type CanvasProps = LoSListener & {
  fromWaveStart: boolean;
  mantimayhem3: boolean;
  showVenatorBounce: boolean;
  onMouseUp: React.MouseEventHandler;
  onMantimayhem3Changed: (mantimayhem3: boolean) => void;
};

export type CanvasHandle = {
  step: LineOfSight["step"];
  toggleAutoReplay: LineOfSight["toggleAutoReplay"];
  setMode: LineOfSight["setMode"];
  remove: LineOfSight["remove"];
  place: LineOfSight["place"];
  exportReplay: LineOfSight["exportReplay"];
  togglePlayerLoS: LineOfSight["togglePlayerLoS"];
  copySpawnURL: LineOfSight["copySpawnURL"];
  copyReplayURL: LineOfSight["copyReplayURL"];
  reset: LineOfSight["reset"];
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const Canvas = React.forwardRef<CanvasHandle, CanvasProps>(
  (props, ref) => {
    const [lineOfSight, setLineOfSight] = useState<LineOfSight | null>(null);

    const {
      fromWaveStart,
      mantimayhem3,
      showVenatorBounce,
      onHasReplayChanged,
      onIsReplayingChanged,
      onCanSaveReplayChanged,
      onReplayTickChanged,
      onFromWaveStartChanged,
      onMantimayhem3Changed,
      onMouseUp,
    } = props;

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
        onHasReplayChanged,
        onCanSaveReplayChanged,
        onIsReplayingChanged,
        onReplayTickChanged,
        onFromWaveStartChanged,
        onMantimayhem3Changed,
      });
      setLineOfSight(newLos);
    }

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!lineOfSight) {
          return;
        }
        lineOfSight.handleKeyDown(e);
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [lineOfSight]);

    useOnChange(() => {
      if (!lineOfSight) {
        return;
      }
      lineOfSight.setFromWaveStart(fromWaveStart);
      lineOfSight.drawWave();
    }, fromWaveStart);

    useOnChange(() => {
      if (!lineOfSight) {
        return;
      }
      lineOfSight.setFromWaveStart(showVenatorBounce);
      lineOfSight.drawWave();
    }, showVenatorBounce);

    useOnChange(() => {
      if (!lineOfSight) {
        return;
      }
      lineOfSight.setMantimayhem3(mantimayhem3);
      lineOfSight.drawWave();
    }, mantimayhem3);

    // TODO clean this handling up
    useImperativeHandle(ref, () => ({
      step: () => lineOfSight?.step(true),
      toggleAutoReplay: () => lineOfSight?.toggleAutoReplay(),
      setMode: (...args) => lineOfSight?.setMode(...args),
      remove: () => lineOfSight?.remove(),
      place: () => lineOfSight?.place(),
      reset: () => lineOfSight?.reset(),
      togglePlayerLoS: () => lineOfSight?.togglePlayerLoS(),
      copySpawnURL: () => lineOfSight?.copySpawnURL(),
      copyReplayURL: () => lineOfSight?.copyReplayURL(),
      exportReplay: () => lineOfSight?.exportReplay(),
    }));

    return (
      <canvas
        ref={handleCanvas}
        id="map"
        onSelect={() => false}
        onContextMenu={(e) => lineOfSight?.onCanvasRightClick(e)}
        onMouseDown={(e) => lineOfSight?.onCanvasMouseDown(e)}
        onMouseUp={(e) => {
          lineOfSight?.onCanvasMouseUp(e);
          onMouseUp?.(e);
        }}
        onDoubleClick={(e) => lineOfSight?.onCanvasDblClick(e)}
        onWheel={(e) => lineOfSight?.onCanvasMouseWheel(e)}
        onMouseMove={(e) => lineOfSight?.onCanvasMouseMove(e)}
        onMouseOut={() => lineOfSight?.onCanvasMouseOut()}
        onDragEnter={(e) => e.preventDefault()}
        onDragEnd={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
      />
    );
  },
);
