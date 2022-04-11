import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Recording.module.scss";

enum RecordingStage {
  NotRecording = 1,
  Recording = 2,
  RecordingFinished = 3,
}

const Recording = () => {
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState(RecordingStage.NotRecording);

  const navigate = useNavigate();

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
          <button onClick={() => setStage(RecordingStage.Recording)}>
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
          <button onClick={() => {
            navigate("/");
          }}>
            Valider
          </button>
        )}
      </>
    </>
  );
};

export default Recording;
