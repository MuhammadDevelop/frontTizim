import { useState, useEffect } from 'react';
import { ReceptionAPI, DirectorAPI } from '../../api/client';

const DAYS_UZ = {
  monday: 'Du', tuesday: 'Se', wednesday: 'Ch',
  thursday: 'Pa', friday: 'Ju', saturday: 'Sh', sunday: 'Ya',
};

const SUBJECT_LABELS = {
  programming: '💻 Dasturlash', english: '🇬🇧 Ingliz tili',
  math: '📐 Matematika', physics: '⚛️ Fizika',
  chemistry: '🧪 Kimyo', biology: '🧬 Biologiya',
  history: '📜 Tarix', russian: '🇷🇺 Rus tili',
  arabic: '🕌 Arab tili', design: '🎨 Dizayn',
};

const DAY_OPTIONS = [
  { value: 'monday',    label: 'Dushanba' },
  { value: 'tuesday',   label: 'Seshanba' },
  { value: 'wednesday', label: 'Chorshanba' },
  { value: 'thursday',  label: 'Payshanba' },
  { value: 'friday',    label: 'Juma' },
  { value: 'saturday',  label: 'Shanba' },
  { value: 'sunday',    label: 'Yakshanba' },
];

export default function ReceptionGroupsPage() {
  const [groups, setGroups]       = useState([]);
  const [teachers, setTeachers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');

  const [form, setForm] = useState({
    name: '', subject: '', teacher_id: '',
    start_time: '09:00', end_time: '11:00', days: [],
  });

  const load = () => {
    setLoading(true);
    Promise.all([ReceptionAPI.groups(), DirectorAPI.teachers()])
      .then(([gr, tr]) => { setGroups(gr.data || []); setTeachers(tr.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openModal = () => {
    setForm({ name: '', subject: '', teacher_id: '', start_time: '09:00', end_time: '11:00', days: [] });
    setError('');
    setShowModal(true);
  };

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      days: prev.days.includes(day) ? prev.days.filter(d => d !== day) : [...prev.days, day],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim())     { setError("Guruh nomini kiriting"); return; }
    if (!form.subject)          { setError("Fanni tanlang"); return; }
    if (!form.teacher_id)       { setError("O'qituvchini tanlang"); return; }
    if (form.days.length === 0) { setError("Kamida bitta kun tanlang"); return; }

    setSaving(true);
    try {
      await ReceptionAPI.createGroup({
        name: form.name.trim(),
        subject: form.subject,
        teacher_id: Number(form.teacher_id),
        days: form.days,
        start_time: form.start_time,
        end_time: form.end_time,
      });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const filtered = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase()) ||
    g.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h2>👥 Guruhlar</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            Jami: <strong>{groups.length}</strong> guruh
          </p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          ➕ Yangi guruh
        </button>
      </div>

      {/* ─── Search ─── */}
      <div className="card" style={{ padding: '0.75rem 1.25rem', marginBottom: 16 }}>
        <input
          className="form-control"
          placeholder="🔍 Guruh nomi yoki fan bo'yicha qidirish..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 14 }}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="card">
        {loading ? (
          <div className="loading-overlay"><div className="spinner" /></div>
        ) : !filtered.length ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h4>{search ? 'Qidiruv natijasi topilmadi' : 'Guruhlar mavjud emas'}</h4>
            {!search && (
              <button className="btn btn-primary" onClick={openModal} style={{ marginTop: 12 }}>
                ➕ Guruh qo'shish
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Guruh nomi</th>
                  <th>Fan</th>
                  <th>O'qituvchi</th>
                  <th>Vaqt</th>
                  <th>Kunlar</th>
                  <th>O'quvchilar</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, i) => (
                  <tr key={g.id}>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{i + 1}</td>
                    <td><strong>{g.name}</strong></td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: 12 }}>
                        {SUBJECT_LABELS[g.subject] || g.subject || '—'}
                      </span>
                    </td>
                    <td>{g.teacher_name || g.teacher?.full_name || '—'}</td>
                    <td style={{ fontSize: 13 }}>
                      {g.start_time && g.end_time ? `${g.start_time} – ${g.end_time}` : g.schedule || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {(g.days || []).map(d => (
                          <span key={d} style={{
                            background: 'var(--primary-soft)', color: 'var(--primary)',
                            borderRadius: 4, padding: '2px 6px', fontSize: 11, fontWeight: 600,
                          }}>
                            {DAYS_UZ[d] || d}
                          </span>
                        ))}
                        {(!g.days || g.days.length === 0) && (
                          <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {g.student_count ?? g.students?.length ?? 0} ta
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${g.is_active !== false ? 'badge-success' : 'badge-danger'}`}>
                        {g.is_active !== false ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Create Modal ─── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: 520, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2 className="modal-title">➕ Yangi Guruh</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Guruh ma'lumotlarini to'ldiring</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '0 1.5rem 1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Guruh nomi</label>
                <input type="text" className="form-control" placeholder="Masalan: JavaScript-1"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Fan</label>
                <select className="form-control" value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                  <option value="">— Fanni tanlang —</option>
                  {Object.entries(SUBJECT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">O'qituvchi</label>
                <select className="form-control" value={form.teacher_id}
                  onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))}>
                  <option value="">— O'qituvchini tanlang —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Dars vaqti</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="time" className="form-control" style={{ flex: 1 }}
                    value={form.start_time}
                    onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>—</span>
                  <input type="time" className="form-control" style={{ flex: 1 }}
                    value={form.end_time}
                    onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Dars kunlari</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  {[
                    { label: 'D-Ch-J', days: ['monday', 'wednesday', 'friday'] },
                    { label: 'S-P-Sh', days: ['tuesday', 'thursday', 'saturday'] },
                  ].map(preset => (
                    <button key={preset.label} type="button"
                      onClick={() => setForm(p => ({ ...p, days: preset.days }))}
                      style={{
                        padding: '4px 12px', borderRadius: 20, border: 'none', fontSize: 12, cursor: 'pointer',
                        background: JSON.stringify(form.days.slice().sort()) === JSON.stringify(preset.days.slice().sort())
                          ? 'var(--primary)' : 'var(--bg-tertiary)',
                        color: JSON.stringify(form.days.slice().sort()) === JSON.stringify(preset.days.slice().sort())
                          ? '#fff' : 'var(--text-secondary)',
                      }}>
                      {preset.label}
                    </button>
                  ))}
                  <button type="button" onClick={() => setForm(p => ({ ...p, days: [] }))}
                    style={{ padding: '4px 12px', borderRadius: 20, border: 'none', fontSize: 12, cursor: 'pointer', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    Tozalash
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DAY_OPTIONS.map(d => (
                    <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                      style={{
                        padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        border: `2px solid ${form.days.includes(d.value) ? 'var(--primary)' : 'var(--border)'}`,
                        background: form.days.includes(d.value) ? 'var(--primary)' : 'var(--bg-secondary)',
                        color: form.days.includes(d.value) ? '#fff' : 'var(--text-primary)',
                        transition: 'all 0.2s',
                      }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && <div className="login-error" style={{ marginBottom: 12 }}>{error}</div>}

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }}
                  onClick={() => setShowModal(false)} disabled={saving}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving}>
                  {saving ? <span className="spinner" /> : '✅ Guruh yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
