import { Link, To } from "react-router-dom";
import styles from "./Dashboard.module.scss";

const DashLink = ({ to, title }: { to: To; title: string }) => {
  return (
    <div className={styles.hWrapper}>
      <Link to={to}>
        <div className={styles.link}>
          <p>{title}</p>
        </div>
      </Link>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className={styles.hWrapper}>
      <DashLink to="/recording" title="Démarrer un nouveau débat" />
      <DashLink to="/debates" title="Historique des débats" />
      <DashLink to="/keywords" title="Mots clés & fragments" />
    </div>
  );
};

export default Dashboard;
