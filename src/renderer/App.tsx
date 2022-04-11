import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import Keywords from './Keywords';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/keywords" element={<Keywords />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}
