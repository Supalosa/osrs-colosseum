import React, { useEffect, useImperativeHandle, useRef } from "react";

import { step, toggleAutoReplay, setMode, remove, place, togglePlayerLoS, copySpawnURL, copyReplayURL, reset, initCanvas, onCanvasDblClick, onCanvasMouseWheel, onCanvasMouseDown, onCanvasMouseUp, onCanvasMouseMove, setFirstAttackDelayed, setShowVenatorBounce } from "./lineOfSight";

export type CanvasProps = {
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

const handleKeyDown = function (e: KeyboardEvent) {
    switch (e.keyCode) {
      case 38:
        step(true);
        break;
      case 40:
        reset();
        break;
      case 81:
        setMode(1);
        place();
        break;
      case 87:
        setMode(2);
        place();
        break;
      case 69:
        setMode(5);
        place();
        break;
      case 82:
        setMode(6);
        place();
        break;
      case 84:
        setMode(7);
        place();
        break;
      case 85:
        setMode(4);
        place();
        break;
    }
  };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export const Canvas = React.forwardRef<CanvasHandle, CanvasProps>((props, ref) => {
    const { delayFirstAttack = false, showVenatorBounce = false } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    initCanvas(canvas);
    document.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("mousedown", onCanvasMouseDown);
    canvas.addEventListener("mouseup",  onCanvasMouseUp);
    canvas.addEventListener("dblclick",  onCanvasDblClick);
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
  }, [delayFirstAttack])

  useEffect(() => {
    setShowVenatorBounce(showVenatorBounce);
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
