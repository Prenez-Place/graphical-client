import styles from "./Footer.module.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import settingsLogo from "../../assets/settings.svg";
import airplaneModeOnLogo from "../../assets/airplane-mode-on.svg";
import airplaneModeOffLogo from "../../assets/airplane-mode-off.svg";

const Footer = () => {
  const [airPlaineMode, setAirPlaineMode] = useState(false);
  return (
    <div className={styles.wrapper}>
      <div className={styles.airplaneMode} onClick={() => setAirPlaineMode(!airPlaineMode)}>
        {airPlaineMode ? (
          <img src={airplaneModeOnLogo} alt="airplaine mode on" />
        ) : (
          <img src={airplaneModeOffLogo} alt="airplaine mode off" />
        )}
      </div>

      <div className={styles.settingsLogo}>
        <Link to={"settings"}>
          <img src={settingsLogo} alt="settings" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
