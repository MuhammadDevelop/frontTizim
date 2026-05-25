import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiFileText, FiPlus, FiExternalLink } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function MaterialsPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [courseId, setCourseId] = useState('');
  const [materials, setMaterials] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', link_url: '' });

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

  useEffect(() => {
    if (!selectedGroup) {
      setCourseId('');
      setMaterials([]);
      return;
    }
    const group = groups.find(g => String(g.id) === String(selectedGroup));
    const cid = group?.course_id || group?.course?.id || '';
    setCourseId(cid);

    if (cid) {
      fetchMaterials(cid);
    } else {
      setMaterials([]);
    }
  }, [selectedGroup, groups]);

  const fetchMaterials = async (cid) => {
    setLoadingMaterials(true);
    try {
      const res = await TeacherAPI.materials(cid);
      setMaterials(Array.isArray(res.data) ? res.data : res.data?.items || []);
    } catch (err) {
      alert("Materiallarni yuklashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoadingMaterials(false);
    }
  };

  const openCreate = () => {
    setForm({ title: '', description: '', link_url: '' });
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
    if (!courseId) {
      alert("Kurs aniqlanmadi! Guruhni qayta tanlang.");
      return;
    }
    setSaving(true);
    try {
      await TeacherAPI.addMaterial({
        course_id: Number(courseId),
        title: form.title,
        description: form.description,
        link_url: form.link_url,
      });
      setShowModal(false);
      fetchMaterials(courseId);
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
          <h2>Materiallar</h2>
          <p>Kurs materiallari boshqaruvi</p>
        </div>
        <div className="page-header-actions">
          {selectedGroup && courseId && (
            <button className="btn btn-primary" onClick={openCreate}>
              <FiPlus /> Yangi material
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Guruh / kursni tanlang</h3>
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
                <option key={g.id} value={g.id}>
                  {g.name} {g.course_name || g.course?.name ? `(${g.course_name || g.course?.name})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedGroup && (
        <div className="card mt-24">
          <div className="card-header">
            <h3 className="card-title">Materiallar ro'yxati</h3>
            <span className="badge badge-primary">
              <FiFileText style={{ marginRight: 4 }} /> {materials.length} material
            </span>
          </div>

          {loadingMaterials ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="text-muted">Materiallar yuklanmoqda...</p>
            </div>
          ) : !courseId ? (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <h4>Kurs topilmadi</h4>
              <p>Bu guruhga kurs biriktirilmagan</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <h4>Materiallar topilmadi</h4>
              <p>Bu kurs uchun hali materiallar qo'shilmagan</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Sarlavha</th>
                    <th>Havola</th>
                    <th>Sana</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m, i) => (
                    <tr key={m.id || i}>
                      <td>{i + 1}</td>
                      <td>
                        <div>
                          <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{m.title}</div>
                          {m.description && (
                            <div className="text-sm text-muted mt-8" style={{ maxWidth: 400 }}>{m.description}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {m.link_url ? (
                          <a href={m.link_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <FiExternalLink /> Ochish
                          </a>
                        ) : '—'}
                      </td>
                      <td>{fmtDate(m.created_at)}</td>
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
              <h3 className="modal-title">Yangi material</h3>
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
                    placeholder="Material sarlavhasi"
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
                    placeholder="Material haqida..."
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Havola (URL)</label>
                  <input
                    type="url"
                    name="link_url"
                    className="form-control"
                    placeholder="https://..."
                    value={form.link_url}
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
