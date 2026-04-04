import { Mob, MobSpec } from "./types";

export const convertMobSpecToMob = (mobSpec: MobSpec): Mob => [
  mobSpec[0], // x
  mobSpec[1], // y
  mobSpec[2], // type
  mobSpec[0], // initial X
  mobSpec[1], // initial Y
  0, // attack delay
  mobSpec[3], // extra
];

// https://discourse.wicg.io/t/allow-non-realtime-use-of-mediarecorder/2308/
export function record(
  canvas: HTMLCanvasElement,
  onStep: () => boolean,
  onFinish: () => void,
) {
  const captureStream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(captureStream, {
    mimeType: "video/webm; codecs=vp9",
    videoBitsPerSecond: 5_000_000, // 5 Mbps
  });
  const chunks: Blob[] = [];
  function step() {
    const finished = onStep();
    if (finished) {
        // give another 600ms to record the last "step" and then let the caller clean up the canvas.
        setTimeout(() => {
            mediaRecorder.stop();
            onFinish();
        }, 600);
    } else {
      setTimeout(step, 600);
    }
  }
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size === 0) {
      return;
    }
    chunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, {
      type: "video/webm",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = "los-replay.webm";
    a.click();
    URL.revokeObjectURL(url);
  };
  mediaRecorder.start();
  step();
}
