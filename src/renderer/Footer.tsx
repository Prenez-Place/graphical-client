import styles from "./Footer.module.scss";
import { useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [airPlaineMode, setAirPlaineMode] = useState(false);
  return (
    <div>
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
      <div>
        <Link to={'/settings'}>Settings</Link>
      </div>
    </div>
  );
};

export default Footer;
