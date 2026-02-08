import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { RodeoVote } from './pages/RodeoVote';
import { AdminDashboard } from './pages/AdminDashboard';
import { DbDiagnostic } from './pages/DbDiagnostic';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote/:link" element={<RodeoVote />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/db-diagnostic" element={<DbDiagnostic />} />
      </Routes>
    </Router>
  );
}

export default App;
