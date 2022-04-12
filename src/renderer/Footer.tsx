import styles from "./Footer.module.scss";
import { useState } from "react";

const Footer = () => {
  const [airPlaineMode, setAirPlaineMode] = useState(false);
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={airPlaineMode}
          onChange={() => setAirPlaineMode(!airPlaineMode)}
        />
        AirPlaine Mode
      </label>
    </div>
  );
};

export default Footer;
