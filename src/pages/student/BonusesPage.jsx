import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

export default function BonusesPage() {
  const [bonuses, setBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    StudentAPI.bonuses()
      .then(r => setBonuses(Array.isArray(r.data) ? r.data : []))
      .catch(e => {
        // 401 xatosini interceptor o'zi boshqaradi
        if (e.response?.status !== 401) {
          setError(e.response?.data?.detail || "Bonuslarni yuklashda xato");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPoints = bonuses.reduce((s, b) => s + (b.points || 0), 0);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  
  return (
    <>
      <div className="page-header"><div><h2>⭐ Mening Bonuslarim</h2></div></div>

      {error && (
        <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <div className="stats-row cols-2">
        <div className="stat-card" style={{'--accent-color':'#F59E0B'}}><div className="stat-icon">⭐</div>
          <div><div className="stat-value">{totalPoints}</div><div className="stat-label">Jami ball</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#6C63FF'}}><div className="stat-icon">🎯</div>
          <div><div className="stat-value">{bonuses.length}</div><div className="stat-label">Bonuslar soni</div></div></div>
      </div>
      <div className="card">
        {!bonuses.length ? <div className="empty-state"><div className="empty-state-icon">⭐</div><h4>Bonuslar yo'q</h4><p>Hozircha sizga bonus berilmagan</p></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Ball</th><th>Sabab</th><th>Sana</th></tr></thead>
          <tbody>{bonuses.map((b,i) => (
            <tr key={b.id || i}><td>{i+1}</td>
              <td><span className={`badge ${b.points > 0 ? 'badge-success' : 'badge-danger'}`}>{b.points > 0 ? '+' : ''}{b.points}</span></td>
              <td>{b.reason || '—'}</td><td>{fmtDate(b.created_at)}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
