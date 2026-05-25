import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiBookOpen, FiPlus } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function LessonsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [lessons, setLessons] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ topic: '', description: '', date: '' });

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

  const fetchLessons = async (gid) => {
    if (!gid) { setLessons([]); return; }
    setLoadingLessons(true);
    try {
      const res = await TeacherAPI.lessons(gid);
      setLessons(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      alert("Darslarni yuklashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => { fetchLessons(selectedGroup); }, [selectedGroup]);

  const openCreate = () => {
    setForm({ topic: '', description: '', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.date) {
      alert("Mavzu va sana majburiy!");
      return;
    }
    setSaving(true);
    try {
      await TeacherAPI.createLesson({
        group_id: Number(selectedGroup),
        topic: form.topic,
        description: form.description,
        date: form.date,
      });
      setShowModal(false);
      fetchLessons(selectedGroup);
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
          <h2>Darslar</h2>
          <p>Guruh bo'yicha darslar ro'yxati</p>
        </div>
        <div className="page-header-actions">
          {selectedGroup && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FiPlus /> Yangi dars
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
            <h3 className="card-title">Darslar ro'yxati</h3>
            <span className="badge badge-primary">
              <FiBookOpen style={{ marginRight: 4 }} /> {lessons.length} dars
            </span>
          </div>

          {loadingLessons ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="text-muted">Darslar yuklanmoqda...</p>
            </div>
          ) : lessons.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📖</div>
              <h4>Darslar topilmadi</h4>
              <p>Bu guruhda hali darslar yo'q</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mavzu</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((l, i) => (
                    <tr key={l.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{l.topic}</div>
                          {l.description && (
                            <div className="text-sm text-muted mt-8" style={{ maxWidth: 400 }}>{l.description}</div>
                          )}
                        </div>
                      </td>
                      <td>{fmtDate(l.date)}</td>
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
              <h3 className="modal-title">Yangi dars</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Mavzu</label>
                  <input
                    type="text"
                    name="topic"
                    className="form-control"
                    placeholder="Dars mavzusi"
                    value={form.topic}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tavsif</label>
                  <textarea
                    name="description"
                    className="form-control"
                    placeholder="Dars haqida qisqacha..."
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Sana</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={form.date}
                    onChange={handleChange}
                    required
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
