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
  onCanvasMouseWheel,
  onCanvasMouseDown,
  onCanvasMouseUp,
  onCanvasMouseMove,
  setFromWaveStart,
  setShowVenatorBounce,
  handleKeyDown,
  LoSListener,
  registerLoSListener,
  drawWave,
  onCanvasMouseOut,
} from "./lineOfSight";

export type CanvasProps = LoSListener & {
  fromWaveStart: boolean;
  showVenatorBounce: boolean;
  onMouseUp: React.MouseEventHandler;
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
      showVenatorBounce,
      onHasReplayChanged,
      onIsReplayingChanged,
      onCanSaveReplayChanged,
      onReplayTickChanged,
      onMouseUp,
    } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const eventHandler: LoSListener = {
      onHasReplayChanged,
      onCanSaveReplayChanged,
      onIsReplayingChanged,
      onReplayTickChanged,
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
        onContextMenu={() => false}
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
