import { useState, useEffect } from 'react';
import { ReceptionAPI } from '../../api/client';
import { FiUsers, FiPlus, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', password: '', role: 'student' });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await ReceptionAPI.students(0, 50);
      setStudents(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      alert("O'quvchilarni yuklashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ full_name: '', phone: '', password: '', role: 'student' });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({ full_name: s.full_name || '', phone: s.phone || '', password: '', role: 'student' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim() || !form.phone.trim()) {
      alert("Ism va telefon majburiy!");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const payload = { full_name: form.full_name, phone: form.phone };
        if (form.password) payload.password = form.password;
        await ReceptionAPI.updateStudent(editing.id, payload);
      } else {
        if (!form.password || form.password.length < 6) {
          alert("Parol kamida 6 ta belgi bo'lishi kerak");
          setSaving(false);
          return;
        }
        await ReceptionAPI.createStudent(form);
      }
      closeModal();
      fetchStudents();
    } catch (err) {
      alert("Xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await ReceptionAPI.toggleStudent(id);
      fetchStudents();
    } catch (err) {
      alert("Holatni o'zgartirishda xato: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
        <p className="text-muted">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>O'quvchilar</h2>
          <p>Barcha o'quvchilarni boshqarish</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Yangi o'quvchi
          </button>
        </div>
      </div>

      <div className="stats-row cols-2">
        <div className="stat-card" style={{ '--accent-color': 'var(--primary)' }}>
          <div className="stat-icon" style={{ color: 'var(--primary)' }}><FiUsers /></div>
          <div className="stat-content">
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">Jami o'quvchilar</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--success)' }}>
          <div className="stat-icon" style={{ color: 'var(--success)', background: 'rgba(16,185,129,0.15)' }}><FiUsers /></div>
          <div className="stat-content">
            <div className="stat-value">{students.filter(s => s.is_active).length}</div>
            <div className="stat-label">Faol o'quvchilar</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">O'quvchilar ro'yxati</h3>
        </div>
        {students.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h4>O'quvchilar topilmadi</h4>
            <p>Yangi o'quvchi qo'shish uchun yuqoridagi tugmani bosing</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ism</th>
                  <th>Telefon</th>
                  <th>Holat</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.full_name}</td>
                    <td>{s.phone}</td>
                    <td>
                      <span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {s.is_active ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td>
                      <div className="actions-row">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)} title="Tahrirlash">
                          <FiEdit2 />
                        </button>
                        <button
                          className={`btn btn-sm ${s.is_active ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggle(s.id)}
                          title={s.is_active ? "O'chirish" : "Yoqish"}
                        >
                          {s.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editing ? "O'quvchini tahrirlash" : "Yangi o'quvchi"}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq ism</label>
                  <input
                    type="text"
                    name="full_name"
                    className="form-control"
                    placeholder="Ism familiya"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="+998 90 123 45 67"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parol {editing && '(bo\'sh qoldirsa o\'zgarmaydi)'}</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Kamida 6 ta belgi"
                    value={form.password}
                    onChange={handleChange}
                    {...(!editing && { required: true, minLength: 6 })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : (editing ? 'Saqlash' : 'Qo\'shish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
