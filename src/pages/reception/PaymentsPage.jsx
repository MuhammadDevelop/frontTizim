import { useState, useEffect } from 'react';
import { ReceptionAPI } from '../../api/client';
import { FiDollarSign, FiPlus, FiFilter } from 'react-icons/fi';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDateTime = (d) => d ? `${fmtDate(d)}, ${fmtTime(d)}` : '—';

const PAYMENT_TYPES = [
  { value: 'cash', label: 'Naqd' },
  { value: 'card', label: 'Karta' },
  { value: 'transfer', label: "O'tkazma" },
];

const typeLabel = (t) => PAYMENT_TYPES.find(p => p.value === t)?.label || t;

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    student_id: '',
    amount: '',
    month: '',
    payment_type: 'cash',
  });

  // O'quvchilar ro'yxatini yuklash
  const fetchStudents = async () => {
    try {
      const res = await ReceptionAPI.students(0, 500);
      setStudents(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      console.error("O'quvchilarni yuklashda xato:", err);
    }
  };

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

  useEffect(() => { fetchStudents(); }, []);
  useEffect(() => { fetchPayments(month); }, [month]);

  // O'quvchi ma'lumotlarini topish
  const getStudentInfo = (studentId) => {
    const s = students.find(st => st.id === studentId);
    return s ? { name: s.full_name, phone: s.phone } : { name: `ID: ${studentId}`, phone: '—' };
  };

  // Yangi oy bo'lganda to'lov nol bo'lsin
  const getNextMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const openCreate = () => {
    setForm({ student_id: '', amount: '', month: getNextMonth(), payment_type: 'cash' });
    setSearchQuery('');
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // O'quvchi tanlash uchun filtrlangan ro'yxat
  const filteredStudents = students.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.full_name?.toLowerCase().includes(q) || s.phone?.includes(q);
  });

  const handleSelectStudent = (s) => {
    setForm({ ...form, student_id: s.id });
    setSearchQuery(`${s.full_name} — ${s.phone}`);
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
  const selectedStudent = form.student_id ? students.find(s => s.id === Number(form.student_id)) : null;

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
                  <th>O'quvchi</th>
                  <th>Telefon</th>
                  <th>Summa</th>
                  <th>Oy</th>
                  <th>Turi</th>
                  <th>Holat</th>
                  <th>Sana va vaqt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => {
                  const info = getStudentInfo(p.student_id);
                  return (
                    <tr key={p.id || i}>
                      <td>{i + 1}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {p.student_name || info.name}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {p.student_phone || info.phone}
                      </td>
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
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {fmtDateTime(p.paid_at || p.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <h3 className="modal-title">Yangi to'lov</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* O'quvchi qidirish va tanlash */}
                <div className="form-group">
                  <label className="form-label">O'quvchini qidiring (ism yoki telefon)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ismini yoki telefon raqamini yozing..."
                    value={searchQuery}
                    onChange={e => { setSearchQuery(e.target.value); setForm({ ...form, student_id: '' }); }}
                    autoFocus
                  />
                  {searchQuery && !form.student_id && (
                    <div className="student-search-results">
                      {filteredStudents.length === 0 ? (
                        <div className="student-search-empty">O'quvchi topilmadi</div>
                      ) : (
                        filteredStudents.slice(0, 6).map(s => (
                          <button
                            key={s.id}
                            type="button"
                            className="student-search-item"
                            onClick={() => handleSelectStudent(s)}
                          >
                            <div className="student-search-name">{s.full_name}</div>
                            <div className="student-search-phone">{s.phone}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Tanlangan o'quvchi ma'lumotlari */}
                {selectedStudent && (
                  <div className="selected-student-card">
                    <div className="selected-student-avatar">
                      {selectedStudent.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="selected-student-info">
                      <div className="selected-student-name">{selectedStudent.full_name}</div>
                      <div className="selected-student-phone">{selectedStudent.phone}</div>
                    </div>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => {
                      setForm({ ...form, student_id: '' });
                      setSearchQuery('');
                    }}>✕</button>
                  </div>
                )}

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
                    <label className="form-label">To'lov oyi</label>
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

                {/* Hozirgi vaqt ko'rsatish */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', background: 'rgba(108,99,255,0.08)',
                  borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: 'var(--text-secondary)'
                }}>
                  <span>🕐</span>
                  <span>To'lov sanasi: <strong>{new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={saving || !form.student_id}>
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
