import styles from "./Debates.module.scss";
import { useState } from "react";
import { Link } from "react-router-dom";

const Debates = () => {
  const debates = window.electron.store.get("debates") || {};

  return (

    <div className={styles.vWrapper}>
      {/* loop through all debates */}
      {Object.keys(debates).map((key) => {
        const debate = debates[key];
        return (
          <Link to={`/debates/${key}`} key={key}>
            <div className={styles.debateLocation}>{debate.location}</div>
            <div className={styles.debateTime}>{debate.time}</div>
          </Link>
        );
      })}
    </div>
  );
};

export default Debates;
