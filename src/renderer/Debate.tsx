import styles from "./Debate.module.scss";
import { useParams } from "react-router-dom";

const Debate = () => {
  const { id } = useParams();
  const debate = window.electron.store.get(`debates.${id}`) || {};

  return (
    <div className={styles.vWrapper}>
      <h1>Historique des débats / {debate.location}</h1>
      <div className={styles.card}>
        <p>{debate.location}</p>
        <p>{new Date(debate.time).toISOString().split("T")[0]}</p>
        <audio controls>
          <source src={`atom://${debate.recording}`} type="audio/mpeg" />
        </audio>
      </div>
    </div>
  );
};

export default Debate;
