import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Keywords from './Keywords';
import Recording from "./Recording";

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
      <Routes>
        <Route path="/recording" element={<Recording />} />
        <Route path="/keywords" element={<Keywords />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
