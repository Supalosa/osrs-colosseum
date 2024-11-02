import React, { useEffect, useImperativeHandle, useRef } from "react";

import { step, toggleAutoReplay, setMode, remove, place, togglePlayerLoS, copySpawnURL, copyReplayURL, reset, initCanvas } from "./lineOfSight";

export type CanvasHandle = {
    step: typeof step,
    toggleAutoReplay: typeof toggleAutoReplay,
    setMode: typeof setMode,
    remove: typeof remove;
    place: typeof place;
    togglePlayerLoS: typeof togglePlayerLoS;
    copySpawnURL: typeof copySpawnURL;
    copyReplayURL: typeof copyReplayURL;
    reset: typeof reset;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const Canvas = React.forwardRef<CanvasHandle, {}>((props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    initCanvas(canvasRef.current!);
  }, []);

  useImperativeHandle(ref, () => ({
    step,
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
    />
  );
});