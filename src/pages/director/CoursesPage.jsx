import { useState, useEffect } from 'react';
import { DirectorAPI } from '../../api/client';

const fmt = (n) => n != null ? new Intl.NumberFormat('uz-UZ').format(Number(n)) + " so'm" : '—';

// Tayyor kurs nomlari ro'yxati
const COURSE_NAMES = [
  { value: 'Python Backend', icon: '🐍' },
  { value: 'Frontend Development', icon: '🌐' },
  { value: 'Full Stack', icon: '💻' },
  { value: 'Java Development', icon: '☕' },
  { value: 'Mobile Development', icon: '📱' },
  { value: 'Flutter/Dart', icon: '🦋' },
  { value: 'React Native', icon: '⚛️' },
  { value: 'Data Science', icon: '📊' },
  { value: 'Machine Learning', icon: '🤖' },
  { value: 'Cyber Security', icon: '🔐' },
  { value: 'DevOps', icon: '⚙️' },
  { value: 'UI/UX Design', icon: '🎨' },
  { value: 'Graphic Design', icon: '🖌️' },
  { value: 'English Language', icon: '🇬🇧' },
  { value: 'IELTS Preparation', icon: '📝' },
  { value: 'Russian Language', icon: '🇷🇺' },
  { value: 'Arabic Language', icon: '🕌' },
  { value: 'Matematika', icon: '📐' },
  { value: 'Fizika', icon: '⚡' },
  { value: 'Kimyo', icon: '🧪' },
  { value: 'Biologiya', icon: '🧬' },
  { value: 'Tarix', icon: '📜' },
  { value: 'Robototexnika', icon: '🤖' },
  { value: 'Scratch Programming', icon: '🧩' },
  { value: 'C++ Programming', icon: '⚡' },
  { value: 'Go Language', icon: '🔵' },
  { value: 'Database Administration', icon: '🗄️' },
  { value: 'SMM & Marketing', icon: '📣' },
  { value: 'Video Editing', icon: '🎬' },
  { value: '3D Modeling', icon: '🎲' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration_months: 3 });

  const load = () => {
    setLoading(true);
    DirectorAPI.courses().then(r => setCourses(r.data)).catch(e => alert(e.response?.data?.detail || 'Xato')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) { alert("Kurs nomini tanlang!"); return; }
    try { await DirectorAPI.createCourse({ ...form, price: Number(form.price), duration_months: Number(form.duration_months) }); setModal(false); load(); }
    catch (err) { alert(err.response?.data?.detail || 'Xato'); }
  };

  const selectedCourse = COURSE_NAMES.find(c => c.value === form.name);

  return (
    <>
      <div className="page-header">
        <div><h2>📚 Kurslar</h2></div>
        <div className="page-header-actions"><button className="btn btn-primary" onClick={() => { setForm({name:'',description:'',price:'',duration_months:3}); setModal(true); }}>+ Kurs qo'shish</button></div>
      </div>
      <div className="card">
        {loading ? <div className="loading-overlay"><div className="spinner" /></div> :
        !courses.length ? <div className="empty-state"><div className="empty-state-icon">📚</div><h4>Kurslar yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Nomi</th><th>Narxi</th><th>Davomiyligi</th><th>Holat</th></tr></thead>
          <tbody>{courses.map((c,i) => (
            <tr key={c.id}><td>{i+1}</td><td>{c.name}</td><td>{fmt(c.price)}</td><td>{c.duration_months} oy</td>
              <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-danger'}`}>{c.is_active ? 'Faol' : 'Nofaol'}</span></td></tr>
          ))}</tbody>
        </table></div>}
      </div>

      {modal && <div className="modal-overlay" onClick={() => setModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-header"><div className="modal-title">Yangi Kurs</div><button className="modal-close" onClick={() => setModal(false)}>✕</button></div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Kurs nomini tanlang</label>
                <div className="course-select-grid">
                  {COURSE_NAMES.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      className={`course-select-option${form.name === c.value ? ' active' : ''}`}
                      onClick={() => setForm({...form, name: c.value})}
                    >
                      <span className="course-select-icon">{c.icon}</span>
                      <span className="course-select-label">{c.value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group"><label className="form-label">Tavsif</label>
                <input className="form-control" placeholder="Kurs haqida qisqacha ma'lumot" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Narxi (so'm)</label>
                  <input type="number" className="form-control" placeholder="500000" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
                <div className="form-group"><label className="form-label">Davomiyligi (oy)</label>
                  <input type="number" className="form-control" value={form.duration_months} onChange={e => setForm({...form, duration_months: e.target.value})} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Bekor</button>
              <button type="submit" className="btn btn-primary" disabled={!form.name}>Saqlash</button>
            </div>
          </form>
        </div>
      </div>}
    </>
  );
}
