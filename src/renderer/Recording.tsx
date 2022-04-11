import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { debateRecorderTimeslice, createDebateRecorder } from "./audioRecorders";
import styles from "./Recording.module.scss";

let debateRecorder: MediaRecorder | null = null;

enum RecordingStage {
  NotRecording = 1,
  Recording = 2,
  RecordingFinished = 3,
}

const Recording = () => {
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState(RecordingStage.NotRecording);

  const navigate = useNavigate();

  const onStartRecording = async () => {
    setStage(RecordingStage.Recording);

    // access a media stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // start recording of the entire debate
    debateRecorder = createDebateRecorder(stream);
    debateRecorder.start(debateRecorderTimeslice);
  };

  const onFinishRecording = () => {
    // Terminate the recording
    debateRecorder?.stop();
    // Go to /
    navigate('/');
  }

  return location.length < 1 ? (
    <button onClick={() => {
      setLocation(new Date().getTime().toString());
    }}>
      Localisation du débat (exemple: Gif-sur-Yvette)
    </button>
  ) : (
    <>
      <p>{`📍 ${location}`}</p>
      <>
        {stage === RecordingStage.NotRecording ? (
          <button onClick={onStartRecording}>
            Démarrer le débat
          </button>
        ) : stage === RecordingStage.Recording ? (
          <div>
            <button onClick={() => setStage(RecordingStage.RecordingFinished)}>
              Terminer le débat
            </button>
            <p>keywords go here</p>
          </div>
        ) : (
          <div>
            <button onClick={onFinishRecording}>
              Valider
            </button>
            <button onClick={() => setStage(RecordingStage.Recording)}>
              cancel
            </button>
          </div>
        )}
      </>
    </>
  );
};

export default Recording;
