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

export function record(
  canvas: HTMLCanvasElement,
  onStep: (saveRecording: () => void) => void,
) {
  const captureStream = canvas.captureStream();
  const mediaRecorder = new MediaRecorder(captureStream, {
    mimeType: "video/webm; codecs=vp9",
  });
  const chunks: Blob[] = [];
  function step() {
    let finished = false;
    onStep(() => {
      finished = true;
      mediaRecorder.stop();
    });
    if (!finished) {
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
