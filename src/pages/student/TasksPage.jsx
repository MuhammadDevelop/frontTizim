import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.tasks()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.items || []);
        // Handle nested task object if returned by backend
        const mapped = data.map(t => ({ ...t, ...(t.task || {}) }));
        // Only show tasks that are NOT tests (e.g., homework, classwork)
        setTasks(mapped.filter(t => {
          const type = t.type || t.task_type || t.task?.type;
          return type !== 'test';
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
            <tr key={t.id || i}><td>{i+1}</td>
              <td>
                <div style={{ fontWeight: 500 }}>{t.title || t.task_title || t.task?.title}</div>
                {(t.description || t.task_description || t.task?.description) && <div className="text-sm text-muted">{t.description || t.task_description || t.task?.description}</div>}
              </td>
              <td>{t.score != null ? <span className="badge badge-success">{t.score}/{t.max_score || t.task_max_score || t.task?.max_score || 100}</span> : <span className="badge badge-muted">Baholanmagan</span>}</td>
              <td>{t.submitted_at || t.score != null ? <span className="badge badge-success">Topshirildi</span> : <span className="badge badge-warning">Kutilmoqda</span>}</td>
              <td>{fmtDate(t.due_date || t.task_due_date || t.task?.due_date)}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
