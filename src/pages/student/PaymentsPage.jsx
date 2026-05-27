import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.payments().then(r => setPayments(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.amount || 0), 0);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header"><div><h2>💳 Mening To'lovlarim</h2></div></div>
      <div className="stats-row cols-2">
        <div className="stat-card" style={{'--accent-color':'#10B981'}}><div className="stat-icon">💰</div>
          <div><div className="stat-value">{fmt(totalPaid)}</div><div className="stat-label">Jami to'langan</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#3B82F6'}}><div className="stat-icon">📄</div>
          <div><div className="stat-value">{payments.length}</div><div className="stat-label">To'lovlar soni</div></div></div>
      </div>
      <div className="card">
        {!payments.length ? <div className="empty-state"><div className="empty-state-icon">💳</div><h4>To'lovlar yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Summa</th><th>Oy</th><th>Turi</th><th>Holat</th><th>To'langan</th></tr></thead>
          <tbody>{payments.map((p,i) => (
            <tr key={p.id || i}><td>{i+1}</td><td>{fmt(p.amount)}</td><td>{p.month}</td>
              <td>{p.payment_type || '—'}</td>
              <td><span className={`badge ${p.status==='paid'?'badge-success':p.status==='pending'?'badge-warning':'badge-danger'}`}>
                {p.status==='paid'?"To'landi":p.status==='pending'?'Kutilmoqda':"Muddati o'tdi"}</span></td>
              <td>{fmtDate(p.paid_at)}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
