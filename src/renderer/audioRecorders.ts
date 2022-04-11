import { Buffer } from "buffer";

const blobToBuffer = (blob: Blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        const buffer = Buffer.from(reader.result);
        resolve(buffer);
      }
    };
    reader.readAsArrayBuffer(blob);
  });
};

export const debateRecorderTimeslice = 60 * 1000;

export const createDebateRecorder = (stream: MediaStream) => {
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = async (e) => {
    const blob = new Blob([e.data], { type: e.data.type });
    const buffer = await blobToBuffer(blob);
    const isLast = recorder.state === "inactive";
    window.electron.recorders.saveDebateRecordPart([buffer, isLast]);
  };
  return recorder;
};
