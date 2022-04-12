import styles from './Header.module.scss';
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const pathname = useLocation().pathname;
  return (
    <div>
      <Link to={'/'}>
        Home
      </Link>
      {pathname !== '/' && (
        <Link to={'..'}>
          🔙
        </Link>
      )}
    </div>
  );
};

export default Header;
