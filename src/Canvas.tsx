import React, { useEffect, useRef } from "react";

import { onCanvasLoaded } from "./lineOfSight";

export const Canvas = React.forwardRef(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    console.log("canvas:", canvasRef.current);
    onCanvasLoaded(canvasRef.current!);
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      id="map"
      onSelect={() => false}
      onContextMenu={() => false}
    />
  );
});
