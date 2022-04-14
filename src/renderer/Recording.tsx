import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  debateRecorderTimeslice,
  createDebateRecorder,
  fragmentRecorderTimeslice,
  createFragmentRecorder
} from "./audioRecorders";
import styles from "./Recording.module.scss";
import { playAudioMix } from "./audioMix";

let stream: MediaStream | null = null;
let debateRecorder: MediaRecorder | null = null;
let fragmentRecorder: MediaRecorder | null = null;

enum RecordingStage {
  NotRecording = 1,
  Recording = 2,
  RecordingFinished = 3,
}

const KeywordLauncher = ({ keyword, onLaunch }: { keyword: string, onLaunch: () => void }) => {
  return (
    <div>
      <h3>{keyword}</h3>
      <button onClick={onLaunch}>Enregistrer</button>
    </div>
  );
};

const KeywordLaunchPad = ({ oneNewRequest }: { oneNewRequest: (kw: string) => void }) => {
  const keywords = window.electron.store.get("keywords") || [];

  return (
    <div>
      <p>Indications sur l'utilisation du launchpad</p>
      {keywords.map((kw: string) => {
        return <KeywordLauncher keyword={kw} key={kw} onLaunch={() => {
          oneNewRequest(kw);
        }} />;
      })
      }
    </div>
  );
};

const Recording = () => {
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState(RecordingStage.NotRecording);

  const navigate = useNavigate();

  const onStartDebate = async () => {
    setStage(RecordingStage.Recording);

    // access a media stream
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    // start recording of the entire debate
    debateRecorder = createDebateRecorder(stream, location);
    debateRecorder.start(debateRecorderTimeslice);
    // start another recording for fragments
    fragmentRecorder = createFragmentRecorder(stream, location);
    fragmentRecorder.start(fragmentRecorderTimeslice);
  };

  const onNewFragmentRequest = (kw: string) => {
    // stop the fragment recorder and process the recorded data
    fragmentRecorder.currentKeyword = kw;
    fragmentRecorder?.stop();
    // start a new recording for the next fragment
    fragmentRecorder = createFragmentRecorder(stream!, location);
    fragmentRecorder.start(fragmentRecorderTimeslice);
    // play an audio mix of previous occurrences of the keyword
    playAudioMix(kw);
  };

  const onStopDebate = () => {
    // Terminate the debate recording
    debateRecorder?.stop();
    // Terminate the fragment recording
    fragmentRecorder.dropped = true;
    fragmentRecorder?.stop();
    // Go to /
    navigate("/");
  };

  const LocationInputForm = () => {
    const [v, setV] = useState("");
    const handleSubmit = (e) => {
      e.preventDefault();
      setLocation(v)
    }
    return (
      <div>
        <form onSubmit={handleSubmit}>
          <label>
            Lieu du débat
            <input placeholder={'Gif-sur-Yvette'} type="text" value={v} onChange={e => {
              setV(e.target.value);
            }} />
          </label>
          <input type="submit" value="Submit" disabled={v.length < 1} />
        </form>
      </div>
    );
  };

  return location.length < 1 ? (
    <LocationInputForm/>
  ) : (
    <>
      <p>{`📍 ${location}`}</p>
      <>
        {stage === RecordingStage.NotRecording ? (
          <button onClick={onStartDebate}>
            Démarrer le débat
          </button>
        ) : stage === RecordingStage.Recording ? (
          <div>
            <KeywordLaunchPad oneNewRequest={onNewFragmentRequest}/>
            <button onClick={() => setStage(RecordingStage.RecordingFinished)}>
              Terminer le débat
            </button>
          </div>
        ) : (
          <div>
            <button onClick={onStopDebate}>
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
