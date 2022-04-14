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

export const createDebateRecorder = (stream: MediaStream, location: string) => {
  const recorder = new MediaRecorder(stream);
  const id = new Date().getTime().toString();
  recorder.id = id;
  window.electron.recorders.initNewDebateRecord(id);
  recorder.ondataavailable = async (e) => {
    const blob = new Blob([e.data], { type: e.data.type });
    const buffer = await blobToBuffer(blob);
    const isLast = recorder.state === "inactive";
    const savingResult = await window.electron.recorders.saveDebateRecordPart([recorder.id, buffer, isLast]);
    if (isLast) {
      const [recordingPath, recordingHash] = savingResult;
      const debate = {
        location,
        time: parseInt(recorder.id),
        recording: recordingPath,
        recordingHash: recordingHash,
      };
      window.electron.store.set(`debates.${id}`, debate);
      window.electron.web3.newDebate(id);
    }
  };
  return recorder;
};

export const fragmentRecorderTimeslice = 4 * 1000;

export const createFragmentRecorder = (stream: MediaStream, location: string) => {
  const recorder = new MediaRecorder(stream);
  const id = new Date().getTime().toString();
  recorder.id = id;
  window.electron.recorders.initNewFragmentRecord(id);
  recorder.ondataavailable = async (e) => {
    // in case the debate has been ended and the recorder dropped, just ask to clear pending data
    if (recorder.dropped) {
      window.electron.recorders.dropFragmentRecordParts(recorder.id);
      return;
    }
    // otherwise, process the data
    const blob = new Blob([e.data], { type: e.data.type });
    const buffer = await blobToBuffer(blob);
    const isLast = recorder.state === "inactive";
    const savingResult = await
      window.electron.recorders.saveFragmentRecordPart([recorder.id, buffer, isLast, recorder.currentKeyword]);
    const time = new Date().getTime();
    if (isLast) {
      const recordingPath = savingResult;
      window.electron.store.set(`fragments.${id}`, {
        location,
        time,
        recording: recordingPath,
        keyword: recorder.currentKeyword,
      });
      window.electron.web3.newFragment(id);
    }
  };
  return recorder;
};
