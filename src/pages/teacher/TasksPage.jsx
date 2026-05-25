import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiClipboard, FiPlus } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const TASK_TYPES = [
  { value: 'homework', label: 'Uy vazifasi' },
  { value: 'test', label: 'Test' },
  { value: 'classwork', label: 'Sinf ishi' },
];

const typeLabel = (t) => TASK_TYPES.find(x => x.value === t)?.label || t;
const typeBadge = (t) => {
  if (t === 'test') return 'badge-danger';
  if (t === 'classwork') return 'badge-info';
  return 'badge-warning';
};

export default function TasksPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', type: 'homework', max_score: '', due_date: '',
  });

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await TeacherAPI.myGroups();
        setGroups(Array.isArray(res.data) ? res.data : res.data?.items || []);
      } catch (err) {
        alert("Guruhlarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const fetchTasks = async (gid) => {
    if (!gid) { setTasks([]); return; }
    setLoadingTasks(true);
    try {
      const res = await TeacherAPI.tasks(gid);
      setTasks(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      alert("Topshiriqlarni yuklashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => { fetchTasks(selectedGroup); }, [selectedGroup]);

  const openCreate = () => {
    setForm({ title: '', description: '', type: 'homework', max_score: '', due_date: '' });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Sarlavha majburiy!");
      return;
    }
    setSaving(true);
    try {
      await TeacherAPI.createTask({
        group_id: Number(selectedGroup),
        title: form.title,
        description: form.description,
        type: form.type,
        max_score: form.max_score ? Number(form.max_score) : null,
        due_date: form.due_date || null,
      });
      setShowModal(false);
      fetchTasks(selectedGroup);
    } catch (err) {
      alert("Xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loadingGroups) {
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
          <h2>Topshiriqlar</h2>
          <p>Guruh bo'yicha topshiriqlar boshqaruvi</p>
        </div>
        <div className="page-header-actions">
          {selectedGroup && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FiPlus /> Yangi topshiriq
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Guruhni tanlang</h3>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Guruh</label>
            <select
              className="form-control"
              value={selectedGroup}
              onChange={e => setSelectedGroup(e.target.value)}
            >
              <option value="">— Guruh tanlang —</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedGroup && (
        <div className="card mt-24">
          <div className="card-header">
            <h3 className="card-title">Topshiriqlar ro'yxati</h3>
            <span className="badge badge-primary">
              <FiClipboard style={{ marginRight: 4 }} /> {tasks.length} topshiriq
            </span>
          </div>

          {loadingTasks ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="text-muted">Topshiriqlar yuklanmoqda...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📝</div>
              <h4>Topshiriqlar topilmadi</h4>
              <p>Bu guruhda hali topshiriqlar yo'q</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sarlavha</th>
                    <th>Tur</th>
                    <th>Max ball</th>
                    <th>Muddat</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t, i) => (
                    <tr key={t.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.title}</div>
                          {t.description && (
                            <div className="text-sm text-muted mt-8" style={{ maxWidth: 400 }}>{t.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${typeBadge(t.type)}`}>{typeLabel(t.type)}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.max_score ?? '—'}</td>
                      <td>{fmtDate(t.due_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Yangi topshiriq</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Sarlavha</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    placeholder="Topshiriq sarlavhasi"
                    value={form.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tavsif</label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Topshiriq haqida..."
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Turi</label>
                    <select
                      name="type"
                      className="form-control"
                      value={form.type}
                      onChange={handleChange}
                    >
                      {TASK_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Max ball</label>
                    <input
                      type="number"
                      name="max_score"
                      className="form-control"
                      placeholder="100"
                      value={form.max_score}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Muddat</label>
                  <input
                    type="date"
                    name="due_date"
                    className="form-control"
                    value={form.due_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
