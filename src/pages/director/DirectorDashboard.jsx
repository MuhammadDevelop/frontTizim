import { useState, useEffect } from 'react';
import { DirectorAPI } from '../../api/client';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';

export default function DirectorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DirectorAPI.dashboard().then(r => setData(r.data)).catch(e => alert(e.response?.data?.detail || 'Xato')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /><p style={{color:'var(--text-muted)'}}>Yuklanmoqda...</p></div>;
  if (!data) return <div className="empty-state"><div className="empty-state-icon">⚠️</div><h4>Ma'lumot yuklanmadi</h4></div>;

  const f = data.finance || {};
  return (
    <>
      <div className="page-header"><div><h2>📊 Dashboard</h2><p>Joriy oy statistikasi</p></div></div>
      <div className="stats-row cols-4">
        <div className="stat-card" style={{'--accent-color':'#3B82F6','--icon-bg':'rgba(59,130,246,0.15)'}}>
          <div className="stat-icon">👨‍🏫</div>
          <div><div className="stat-value">{data.teachers_count}</div><div className="stat-label">O'qituvchilar</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#EC4899','--icon-bg':'rgba(236,72,153,0.15)'}}>
          <div className="stat-icon">🎓</div>
          <div><div className="stat-value">{data.students_count}</div><div className="stat-label">O'quvchilar</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#6C63FF','--icon-bg':'rgba(108,99,255,0.15)'}}>
          <div className="stat-icon">📚</div>
          <div><div className="stat-value">{data.courses_count}</div><div className="stat-label">Kurslar</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#10B981','--icon-bg':'rgba(16,185,129,0.15)'}}>
          <div className="stat-icon">👥</div>
          <div><div className="stat-value">{data.groups_count}</div><div className="stat-label">Guruhlar</div></div>
        </div>
      </div>
      <div className="stats-row cols-3">
        <div className="stat-card" style={{'--accent-color':'#10B981'}}>
          <div className="stat-icon">💰</div>
          <div><div className="stat-value">{fmt(f.total_income)}</div><div className="stat-label">Jami daromad</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#EF4444'}}>
          <div className="stat-icon">💸</div>
          <div><div className="stat-value">{fmt(f.total_expenses)}</div><div className="stat-label">Xarajatlar</div></div>
        </div>
        <div className="stat-card" style={{'--accent-color':'#F59E0B'}}>
          <div className="stat-icon">⏳</div>
          <div><div className="stat-value">{f.pending_payments || 0}</div><div className="stat-label">Kutilayotgan to'lovlar</div></div>
        </div>
      </div>
    </>
  );
}
