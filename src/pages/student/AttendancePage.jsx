import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';
const statusMap = { present: {label:'Keldi', cls:'badge-success'}, absent: {label:'Kelmadi', cls:'badge-danger'}, late: {label:'Kech keldi', cls:'badge-warning'}, excused: {label:'Sababli', cls:'badge-info'} };

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.attendance().then(r => setRecords(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header"><div><h2>✅ Mening Davomatim</h2></div></div>
      <div className="card">
        {!records.length ? <div className="empty-state"><div className="empty-state-icon">✅</div><h4>Davomat yozuvlari yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Sana</th><th>Guruh</th><th>Holat</th></tr></thead>
          <tbody>{records.map((r,i) => {
            const s = statusMap[r.status] || {label:r.status, cls:'badge-muted'};
            return <tr key={r.id || i}><td>{i+1}</td><td>{fmtDate(r.date)}</td><td>{r.group_id}</td>
              <td><span className={`badge ${s.cls}`}>{s.label}</span></td></tr>;
          })}</tbody>
        </table></div>}
      </div>
    </>
  );
}
