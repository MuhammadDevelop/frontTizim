import { useState, useEffect } from 'react';
import { DirectorAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DirectorAPI.groups().then(r => setGroups(r.data)).catch(e => alert(e.response?.data?.detail || 'Xato')).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header"><div><h2>👥 Guruhlar</h2></div></div>
      <div className="card">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
        !groups.length ? <div className="empty-state"><div className="empty-state-icon">👥</div><h4>Guruhlar yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Nomi</th><th>Jadval</th><th>Max talabalar</th><th>Boshlanish</th><th>Holat</th></tr></thead>
          <tbody>{groups.map((g,i) => (
            <tr key={g.id}><td>{i+1}</td><td>{g.name}</td><td>{g.schedule || '—'}</td><td>{g.max_students}</td>
              <td>{fmtDate(g.start_date)}</td>
              <td><span className={`badge ${g.is_active ? 'badge-success' : 'badge-danger'}`}>{g.is_active ? 'Faol' : 'Nofaol'}</span></td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
