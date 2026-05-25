import { useState, useEffect } from 'react';
import { DirectorAPI, AuthAPI } from '../../api/client';
import client from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';

const SUBJECT_LABELS = {
  programming: "Dasturlash",
  english: "Ingliz tili",
  math: "Matematika",
  physics: "Fizika",
  chemistry: "Kimyo",
  biology: "Biologiya",
  history: "Tarix",
  russian: "Rus tili",
  arabic: "Arab tili",
  design: "Dizayn",
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', password: '', subject: '' });

  const load = () => {
    setLoading(true);
    DirectorAPI.teachers()
      .then(r => setTeachers(r.data))
      .catch(e => alert(e.response?.data?.detail || 'Xato'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditId(null);
    setForm({ full_name: '', phone: '', password: '', subject: '' });
    setModal(true);
  };

  const openEdit = (t) => {
    setEditId(t.id);
    setForm({ full_name: t.full_name, phone: t.phone, password: '', subject: t.subject || '' });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        full_name: form.full_name,
        phone: form.phone,
        role: 'teacher',
        is_active: true,
        subject: form.subject || null,
      };
      if (!editId) {
        if (!form.password || form.password.length < 6) { alert("Parol kamida 6 ta belgi"); return; }
        data.password = form.password;
        await DirectorAPI.createTeacher(data);
      } else {
        if (form.password) data.password = form.password;
        await DirectorAPI.updateTeacher(editId, data);
      }
      setModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.detail || 'Xato');
    }
  };

  const handleToggle = async (id) => {
    try { await DirectorAPI.toggleTeacher(id); load(); }
    catch(e) { alert(e.response?.data?.detail || 'Xato'); }
  };

  const handleDelete = async (id) => {
    if (!confirm("O'chirishga ishonchingiz komilmi?")) return;
    try { await DirectorAPI.deleteTeacher(id); load(); }
    catch(e) { alert(e.response?.data?.detail || 'Xato'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>👨‍🏫 O'qituvchilar</h2><p>Jami: {teachers.length} ta</p></div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Qo'shish</button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : !teachers.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🏫</div>
            <h4>O'qituvchilar yo'q</h4>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th><th>Ism</th><th>Telefon</th><th>Fan</th><th>Holat</th><th>Qo'shilgan</th><th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t, i) => (
                  <tr key={t.id}>
                    <td>{i + 1}</td>
                    <td>{t.full_name}</td>
                    <td>{t.phone}</td>
                    <td>
                      {t.subject ? (
                        <span className="badge badge-primary">{SUBJECT_LABELS[t.subject] || t.subject}</span>
                      ) : (
                        <span className="badge badge-muted">Belgilanmagan</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${t.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {t.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td>{fmtDate(t.created_at)}</td>
                    <td>
                      <div className="actions-row">
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>✏️</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggle(t.id)}>
                          {t.is_active ? '🔒' : '🔓'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editId ? "O'qituvchini tahrirlash" : "Yangi O'qituvchi"}</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq ism</label>
                  <input className="form-control" value={form.full_name}
                    onChange={e => setForm({...form, full_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input className="form-control" value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Fan</label>
                  <select className="form-control" value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})} required>
                    <option value="">— Fanni tanlang —</option>
                    {Object.entries(SUBJECT_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{editId ? 'Yangi parol (ixtiyoriy)' : 'Parol'}</label>
                  <input type="password" className="form-control" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Bekor</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
