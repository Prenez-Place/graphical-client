import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Keywords from "./Keywords";
import Recording from "./Recording";
import Debates from "./Debates";
import Debate from "./Debate";
import Header from "./Header";
import Footer from "./Footer";
import Settings from "./Settings";
import styles from "./App.module.scss";
import "./index.scss"

declare global {
  interface Window {
    electron: {
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        // any other methods you've defined...
      };
    };
  }
}

export default function App() {
  return (
    <Router>
      <div className={styles.vWrapper}>
        <Header />
        <div className={styles.mainContent}>
          <Routes>
            <Route path="/settings" element={<Settings />} />
            <Route path="/recording" element={<Recording />} />
            <Route path="/debates" element={<Debates />} />
            <Route path="/debates/:id" element={<Debate />} />
            <Route path="/keywords" element={<Keywords />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}
