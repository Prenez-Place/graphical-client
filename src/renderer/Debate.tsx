import styles from "./Debate.module.scss";
import { useState } from "react";
import { useParams } from "react-router-dom";

const Debate = () => {
  const {id} = useParams();
  const debate = window.electron.store.get(`debates.${id}`) || {};

  return (
    <div>
      <p>{debate.location}</p>
      <p>{debate.time}</p>
      <p>{debate.recordingHash}</p>
      <audio controls>
        <source src={`atom://${debate.recording}`} type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default Debate;
