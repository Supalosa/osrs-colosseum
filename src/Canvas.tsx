import React, { useEffect, useImperativeHandle, useRef } from "react";

import {
  step,
  toggleAutoReplay,
  setMode,
  remove,
  place,
  togglePlayerLoS,
  copySpawnURL,
  copyReplayURL,
  reset,
  initCanvas,
  onCanvasDblClick,
  onCanvasRightClick,
  onCanvasMouseWheel,
  onCanvasMouseDown,
  onCanvasMouseUp,
  onCanvasMouseMove,
  setFromWaveStart,
  setMantimayhem3,
  setShowVenatorBounce,
  handleKeyDown,
  LoSListener,
  registerLoSListener,
  drawWave,
  onCanvasMouseOut,
} from "./lineOfSight";

export type CanvasProps = LoSListener & {
  fromWaveStart: boolean;
  mantimayhem3: boolean;
  showVenatorBounce: boolean;
  onMouseUp: React.MouseEventHandler;
  onMantimayhem3Changed: (mantimayhem3: boolean) => void;
};

export type CanvasHandle = {
  step: typeof step;
  toggleAutoReplay: typeof toggleAutoReplay;
  setMode: typeof setMode;
  remove: typeof remove;
  place: typeof place;
  togglePlayerLoS: typeof togglePlayerLoS;
  copySpawnURL: typeof copySpawnURL;
  copyReplayURL: typeof copyReplayURL;
  reset: typeof reset;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const Canvas = React.forwardRef<CanvasHandle, CanvasProps>(
  (props, ref) => {
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
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const eventHandler: LoSListener = {
      onHasReplayChanged,
      onCanSaveReplayChanged,
      onIsReplayingChanged,
      onReplayTickChanged,
      onFromWaveStartChanged,
      onMantimayhem3Changed,
    };

    useEffect(() => {
      const canvas = canvasRef.current!;
      registerLoSListener(eventHandler);
      initCanvas(canvas);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        // cleanup on unmount
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, []);

    useEffect(() => {
      setFromWaveStart(fromWaveStart);
      drawWave();
    }, [fromWaveStart]);

    useEffect(() => {
      setShowVenatorBounce(showVenatorBounce);
      drawWave();
    }, [showVenatorBounce]);

    useEffect(() => {
      setMantimayhem3(mantimayhem3);
      drawWave();
    }, [mantimayhem3]);

    useImperativeHandle(ref, () => ({
      step: () => {
        step();
        drawWave();
      },
      toggleAutoReplay,
      setMode,
      remove,
      place,
      togglePlayerLoS,
      copySpawnURL,
      copyReplayURL,
      reset,
    }));

    return (
      <canvas
        ref={canvasRef}
        id="map"
        onSelect={() => false}
        onContextMenu={onCanvasRightClick}
        onMouseDown={onCanvasMouseDown}
        onMouseUp={(e) => {
          onCanvasMouseUp(e);
          onMouseUp?.(e);
        }}
        onDoubleClick={onCanvasDblClick}
        onWheel={onCanvasMouseWheel}
        onMouseMove={onCanvasMouseMove}
        onMouseOut={onCanvasMouseOut}
        onDragEnter={(e) => e.preventDefault()}
        onDragEnd={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
      />
    );
  }
);
