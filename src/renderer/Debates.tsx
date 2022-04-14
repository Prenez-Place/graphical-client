import styles from "./Debates.module.scss";
import { Link } from "react-router-dom";

const Debates = () => {
  const debates = window.electron.store.get("debates") || {};

  return (

    <div className={styles.vWrapper}>
      <h1>Historique des débats</h1>
      {/* loop through all debates */}
      {Object.keys(debates).map((key) => {
        const debate = debates[key];
        return (
          <Link to={`/debates/${key}`} key={key} className={styles.card}>
            <p>{`${debate.location} • ${new Date(debate.time).toISOString().split("T")[0]}`}</p>
          </Link>
        );
      })}
    </div>
  );
};

export default Debates;
