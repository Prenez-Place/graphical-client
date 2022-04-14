import styles from "./Header.module.scss";
import { Link } from "react-router-dom";
import logo from "../../assets/prenez-place-logo-128.png";

const Header = () => {
  return (
    <div className={styles.wrapper}>
      <Link to={"/"}>
        <img src={logo} alt="logo" className={styles.logo} />
      </Link>
    </div>
  );
};

export default Header;
