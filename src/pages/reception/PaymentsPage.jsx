import { useState, useEffect } from 'react';
import { ReceptionAPI } from '../../api/client';
import { FiDollarSign, FiPlus, FiFilter } from 'react-icons/fi';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Naqd' },
  { value: 'card', label: 'Karta' },
  { value: 'transfer', label: "O'tkazma" },
];

const typeLabel = (t) => PAYMENT_TYPES.find(p => p.value === t)?.label || t;

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    student_id: '',
    amount: '',
    month: '',
    payment_type: 'cash',
  });

  const fetchPayments = async (m) => {
    setLoading(true);
    try {
      const res = await ReceptionAPI.payments(null, m || null);
      setPayments(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      alert("To'lovlarni yuklashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(month); }, [month]);

  const openCreate = () => {
    setForm({ student_id: '', amount: '', month: month, payment_type: 'cash' });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.student_id || !form.amount || !form.month) {
      alert("Barcha maydonlarni to'ldiring!");
      return;
    }
    setSaving(true);
    try {
      await ReceptionAPI.createPayment({
        student_id: Number(form.student_id),
        amount: Number(form.amount),
        month: form.month,
        payment_type: form.payment_type,
      });
      setShowModal(false);
      fetchPayments(month);
    } catch (err) {
      alert("Xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>To'lovlar</h2>
          <p>O'quvchi to'lovlarini boshqarish</p>
        </div>
        <div className="page-header-actions">
          <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FiFilter />
            <input
              type="month"
              className="form-control"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{ width: 180 }}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Yangi to'lov
          </button>
        </div>
      </div>

      <div className="stats-row cols-2">
        <div className="stat-card" style={{ '--accent-color': 'var(--primary)' }}>
          <div className="stat-icon" style={{ color: 'var(--primary)' }}><FiDollarSign /></div>
          <div className="stat-content">
            <div className="stat-value">{payments.length}</div>
            <div className="stat-label">Jami to'lovlar</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
          <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.15)' }}><FiDollarSign /></div>
          <div className="stat-content">
            <div className="stat-value">{fmt(totalAmount)}</div>
            <div className="stat-label">Jami summa</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">To'lovlar ro'yxati</h3>
        </div>
        {loading ? (
          <div className="loading-overlay">
            <div className="spinner" />
            <p className="text-muted">Yuklanmoqda...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h4>To'lovlar topilmadi</h4>
            <p>Tanlangan oy uchun to'lovlar mavjud emas</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>O'quvchi ID</th>
                  <th>Summa</th>
                  <th>Oy</th>
                  <th>Turi</th>
                  <th>Holat</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{i + 1}</td>
                    <td>{p.student_id}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 600 }}>{fmt(p.amount)}</td>
                    <td>{p.month || '—'}</td>
                    <td>
                      <span className="badge badge-info">{typeLabel(p.payment_type)}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.status === 'paid' || p.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                        {p.status === 'paid' || p.status === 'confirmed' ? 'Tasdiqlangan' : p.status || 'Kutilmoqda'}
                      </span>
                    </td>
                    <td>{fmtDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Yangi to'lov</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">O'quvchi ID</label>
                  <input
                    type="number"
                    name="student_id"
                    className="form-control"
                    placeholder="O'quvchi IDsini kiriting"
                    value={form.student_id}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Summa (so'm)</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    placeholder="500000"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Oy</label>
                    <input
                      type="month"
                      name="month"
                      className="form-control"
                      value={form.month}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To'lov turi</label>
                    <select
                      name="payment_type"
                      className="form-control"
                      value={form.payment_type}
                      onChange={handleChange}
                    >
                      {PAYMENT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "To'lov qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
