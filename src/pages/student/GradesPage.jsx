import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

export default function GradesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.gradesSummary().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">🏆</div><h4>Baholar topilmadi</h4></div>;

  return (
    <>
      <div className="page-header"><div><h2>🏆 Mening Baholarim</h2></div></div>
      <div className="stats-row cols-3">
        <div className="stat-card" style={{'--accent-color':'#10B981'}}><div className="stat-icon">📊</div>
          <div><div className="stat-value">{data.average_score || 0}</div><div className="stat-label">O'rtacha ball</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#3B82F6'}}><div className="stat-icon">📝</div>
          <div><div className="stat-value">{data.total_tasks || 0}</div><div className="stat-label">Jami vazifalar</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#6C63FF'}}><div className="stat-icon">✅</div>
          <div><div className="stat-value">{data.graded_tasks || 0}</div><div className="stat-label">Baholangan</div></div></div>
      </div>
      {data.grades && data.grades.length > 0 && <div className="card">
        <div className="card-header"><div className="card-title">Batafsil baholar</div></div>
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Vazifa</th><th>Ball</th><th>Izoh</th></tr></thead>
          <tbody>{data.grades.map((g,i) => (
            <tr key={i}><td>{i+1}</td><td>{g.task_title || g.title}</td>
              <td><span className={`badge ${g.score >= 80 ? 'badge-success' : g.score >= 50 ? 'badge-warning' : 'badge-danger'}`}>{g.score}/{g.max_score || 100}</span></td>
              <td>{g.feedback || '—'}</td></tr>
          ))}</tbody>
        </table></div>
      </div>}
    </>
  );
}
