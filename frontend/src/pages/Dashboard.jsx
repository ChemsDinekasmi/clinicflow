import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api/client';

const CARDS = [
  { key: 'totalPatients', label: 'Total patients' },
  { key: 'todayAppointments', label: 'Rendez-vous du jour' },
  { key: 'pendingCount', label: 'En attente' },
  { key: 'confirmedCount', label: 'Confirmés' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data)).catch((err) => setError(errorMessage(err)));
  }, []);

  return (
    <>
      <h2>Dashboard</h2>
      {error && <div className="alert">{error}</div>}
      <div className="stats">
        {CARDS.map((c) => (
          <div key={c.key} className={`card stat stat-${c.key}`}>
            <div className="stat-value">{stats ? stats[c.key] : '…'}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}
