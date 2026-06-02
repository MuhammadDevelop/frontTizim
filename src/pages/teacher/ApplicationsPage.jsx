import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import client from '../../api/client'; // Import raw client for my-courses
import { FiUsers, FiPlus, FiCheckSquare } from 'react-icons/fi';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApps, setSelectedApps] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    course_id: '',
    name: '',
    schedule: '',
    max_students: 15,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().slice(0, 10)
  });

  const load = async () => {
    setLoading(true);
    try {
      // 1. Fetch applications
      const res = await TeacherAPI.applications();
      setApplications(Array.isArray(res.data) ? res.data : []);
      // 2. Fetch teacher's courses
      const courseRes = await client.get('/teacher/my-courses');
      setCourses(Array.isArray(courseRes.data) ? courseRes.data : []);
    } catch (err) {
      alert("Xatolik: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    if (selectedApps.includes(id)) {
      setSelectedApps(selectedApps.filter(appId => appId !== id));
    } else {
      setSelectedApps([...selectedApps, id]);
    }
  };

  const openGroupModal = () => {
    if (selectedApps.length === 0) {
      alert("Iltimos, guruhga qo'shish uchun kamida 1 ta o'quvchini tanlang!");
      return;
    }
    setForm({ ...form, name: `Yangi guruh (${selectedApps.length} ta o'quvchi)` });
    setModal(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!form.course_id) {
      alert("Iltimos, guruh qaysi kursga tegishliligini tanlang.");
      return;
    }
    try {
      const payload = {
        ...form,
        application_ids: selectedApps
      };
      await TeacherAPI.createGroupFromApplications(payload);
      alert("Guruh muvaffaqiyatli yaratildi va o'quvchilar qo'shildi!");
      setModal(false);
      setSelectedApps([]);
      load();
    } catch (err) {
      alert("Xatolik: " + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) {
    return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>📄 O'quvchilar Arizalari</h2>
          <p>Sizning faningizga ro'yxatdan o'tgan o'quvchilar ro'yxati</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openGroupModal} disabled={selectedApps.length === 0}>
            <FiPlus style={{ marginRight: 8 }} /> Guruh yaratish ({selectedApps.length})
          </button>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>Arizalar yo'q</h4>
            <p>Sizning faningizga hozircha yangi arizalar kelib tushmagan.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}></th>
                  <th>O'quvchi Ismi</th>
                  <th>Telefon</th>
                  <th>Fan (Daraja)</th>
                  <th>Holati</th>
                  <th>Sana</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.id} className={selectedApps.includes(app.id) ? "selected-row" : ""}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedApps.includes(app.id)}
                        onChange={() => toggleSelect(app.id)}
                        style={{ width: 20, height: 20, cursor: 'pointer' }}
                      />
                    </td>
                    <td>{app.student?.full_name || 'Noma\'lum'}</td>
                    <td>{app.student?.phone || '-'}</td>
                    <td>
                      <span className="badge badge-primary">{app.subject}</span>
                      {app.level && <span className="badge badge-secondary" style={{marginLeft: 4}}>{app.level}</span>}
                    </td>
                    <td>
                      <span className="badge badge-warning">Kutmoqda</span>
                    </td>
                    <td>{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Guruh yaratish Modali */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Tanlangan o'quvchilardan guruh yaratish</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateGroup}>
              <div className="modal-body">
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                  Siz tanlagan <strong>{selectedApps.length}</strong> ta o'quvchi ushbu yangi guruhga qo'shiladi.
                </div>

                <div className="form-group">
                  <label className="form-label">Kurs (Qaysi kurs uchun?)</label>
                  <select className="form-control" value={form.course_id}
                    onChange={e => setForm({...form, course_id: parseInt(e.target.value) || ''})} required>
                    <option value="">— Kursni tanlang —</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {courses.length === 0 && (
                    <small style={{ color: 'var(--danger)', marginTop: 4, display: 'block' }}>
                      Sizda hech qanday kurs yo'q! Oldin kurs yaratilishi kerak. (Direktorga murojaat qiling).
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Guruh Nomi</label>
                  <input type="text" className="form-control" value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})} required placeholder="Masalan: Frontend 1-guruh" />
                </div>

                <div className="form-group">
                  <label className="form-label">Dars kunlari/vaqti</label>
                  <input type="text" className="form-control" value={form.schedule}
                    onChange={e => setForm({...form, schedule: e.target.value})} placeholder="Dush-Chor-Jum 18:00" />
                </div>

                <div className="form-group">
                  <label className="form-label">Maksimal O'quvchilar Soni</label>
                  <input type="number" className="form-control" value={form.max_students}
                    onChange={e => setForm({...form, max_students: parseInt(e.target.value) || 15})} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Boshlanish Sanasi</label>
                    <input type="date" className="form-control" value={form.start_date}
                      onChange={e => setForm({...form, start_date: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tugash Sanasi</label>
                    <input type="date" className="form-control" value={form.end_date}
                      onChange={e => setForm({...form, end_date: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={!form.course_id}>Guruhni saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
