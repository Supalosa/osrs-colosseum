import React, { useEffect, useImperativeHandle, useRef } from "react";

import { step, toggleAutoReplay, setMode, remove, place, togglePlayerLoS, copySpawnURL, copyReplayURL, reset, initCanvas, onCanvasDblClick, onCanvasMouseWheel, onCanvasMouseDown, onCanvasMouseUp, onCanvasMouseMove, setFirstAttackDelayed, setShowVenatorBounce, handleKeyDown, LoSListener, registerLoSListener, drawWave } from "./lineOfSight";

export type CanvasProps = LoSListener & {
    delayFirstAttack: boolean;
    showVenatorBounce: boolean;
}

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
export const Canvas = React.forwardRef<CanvasHandle, CanvasProps>((props, ref) => {
    const { delayFirstAttack, showVenatorBounce, onHasReplayChanged,  onIsReplayingChanged, onCanSaveReplayChanged, onReplayTickChanged } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const eventHandler: LoSListener = {
      onHasReplayChanged,
      onCanSaveReplayChanged,
      onIsReplayingChanged,
      onReplayTickChanged,
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    registerLoSListener(eventHandler);
    initCanvas(canvas);
    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mouseup", onCanvasMouseUp);
    canvas.addEventListener("dblclick", onCanvasDblClick);
    canvas.addEventListener("wheel",  onCanvasMouseWheel);
    canvas.addEventListener("mousemove", onCanvasMouseMove);
    return () => {
        // cleanup on unmount
        document.removeEventListener("keydown", handleKeyDown);
        canvas.removeEventListener("mousedown", onCanvasMouseDown);
        canvas.removeEventListener("mouseup",  onCanvasMouseUp);
        canvas.removeEventListener("dblclick",  onCanvasDblClick);
        canvas.removeEventListener("wheel",  onCanvasMouseWheel);
        canvas.removeEventListener("mousemove", onCanvasMouseMove);
    };
  }, []);

  useEffect(() => {
    setFirstAttackDelayed(delayFirstAttack);
    drawWave();
  }, [delayFirstAttack])

  useEffect(() => {
    setShowVenatorBounce(showVenatorBounce);
    drawWave();
  }, [showVenatorBounce]);

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
