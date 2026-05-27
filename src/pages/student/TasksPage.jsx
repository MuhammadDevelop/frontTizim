import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.tasks().then(r => setTasks(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header"><div><h2>📝 Mening Vazifalarim</h2></div></div>
      <div className="card">
        {!tasks.length ? <div className="empty-state"><div className="empty-state-icon">📝</div><h4>Vazifalar yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Vazifa</th><th>Ball</th><th>Holat</th><th>Muddat</th></tr></thead>
          <tbody>{tasks.map((t,i) => (
            <tr key={t.id || i}><td>{i+1}</td><td>{t.title || t.task_title}</td>
              <td>{t.score != null ? <span className="badge badge-success">{t.score}/{t.max_score || 100}</span> : <span className="badge badge-muted">Baholanmagan</span>}</td>
              <td>{t.submitted_at ? <span className="badge badge-success">Topshirildi</span> : <span className="badge badge-warning">Kutilmoqda</span>}</td>
              <td>{fmtDate(t.due_date)}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
