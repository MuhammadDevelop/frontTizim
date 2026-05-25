import { useState, useEffect } from 'react';
import { DirectorAPI } from '../../api/client';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';
const curMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };

export default function FinancePage() {
  const [month, setMonth] = useState(curMonth());
  const [summary, setSummary] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([DirectorAPI.financeSummary(month), DirectorAPI.payments(null, month)]);
      setSummary(s.data);
      setPayments(p.data);
    } catch (e) { alert(e.response?.data?.detail || 'Xato'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [month]);

  return (
    <>
      <div className="page-header">
        <div><h2>💰 Moliyaviy Hisobot</h2></div>
        <div className="page-header-actions">
          <input type="month" className="form-control" value={month} onChange={e => setMonth(e.target.value)} style={{maxWidth:180}} />
        </div>
      </div>

      {summary && <div className="stats-row cols-3">
        <div className="stat-card" style={{'--accent-color':'#10B981'}}><div className="stat-icon">📥</div>
          <div><div className="stat-value">{fmt(summary.total_income)}</div><div className="stat-label">Daromad</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#EF4444'}}><div className="stat-icon">📤</div>
          <div><div className="stat-value">{fmt(summary.total_expenses)}</div><div className="stat-label">Xarajat</div></div></div>
        <div className="stat-card" style={{'--accent-color':'#6C63FF'}}><div className="stat-icon">📊</div>
          <div><div className="stat-value">{fmt(summary.net_profit)}</div><div className="stat-label">Sof foyda</div></div></div>
      </div>}

      <div className="card">
        <div className="card-header"><div className="card-title">💳 To'lovlar ({payments.length} ta)</div></div>
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
        !payments.length ? <div className="empty-state"><div className="empty-state-icon">💳</div><h4>To'lovlar yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>O'quvchi</th><th>Summa</th><th>Oy</th><th>Holat</th><th>To'langan</th></tr></thead>
          <tbody>{payments.map(p => (
            <tr key={p.id}><td>{p.student_id}</td><td>{fmt(p.amount)}</td><td>{p.month}</td>
              <td><span className={`badge ${p.status==='paid'?'badge-success':p.status==='pending'?'badge-warning':'badge-danger'}`}>
                {p.status==='paid'?"To'landi":p.status==='pending'?'Kutilmoqda':"Muddati o'tdi"}</span></td>
              <td>{fmtDate(p.paid_at)}</td></tr>
          ))}</tbody>
        </table></div>}
      </div>
    </>
  );
}
