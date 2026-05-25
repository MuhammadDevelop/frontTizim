import { useState, useEffect } from 'react';
import { ReceptionAPI } from '../../api/client';
import { FiUserPlus, FiUsers, FiLayers } from 'react-icons/fi';

export default function EnrollPage() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [gRes, sRes] = await Promise.all([
          ReceptionAPI.groups(),
          ReceptionAPI.students(0, 50),
        ]);
        setGroups(Array.isArray(gRes.data) ? gRes.data : gRes.data?.items || []);
        setStudents(Array.isArray(sRes.data) ? sRes.data : sRes.data?.items || []);
      } catch (err) {
        alert("Ma'lumotlarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedGroup) {
      alert("O'quvchi va guruhni tanlang!");
      return;
    }
    setEnrolling(true);
    try {
      await ReceptionAPI.enroll(selectedStudent, selectedGroup);
      alert("O'quvchi guruhga muvaffaqiyatli yozildi!");
      setSelectedStudent('');
      setSelectedGroup('');
    } catch (err) {
      alert("Yozishda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setEnrolling(false);
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
          <h2>Guruhga yozish</h2>
          <p>O'quvchilarni guruhlarga biriktirish</p>
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
        <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
          <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(67,217,173,0.15)' }}><FiLayers /></div>
          <div className="stat-content">
            <div className="stat-value">{groups.length}</div>
            <div className="stat-label">Jami guruhlar</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">O'quvchini guruhga yozish</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">O'quvchi tanlang</label>
              <select
                className="form-control"
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
              >
                <option value="">— O'quvchi tanlang —</option>
                {students.filter(s => s.is_active !== false).map(s => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Guruh tanlang</label>
              <select
                className="form-control"
                value={selectedGroup}
                onChange={e => setSelectedGroup(e.target.value)}
              >
                <option value="">— Guruh tanlang —</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} {g.course_name ? `(${g.course_name})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-24">
            <button
              className="btn btn-primary btn-lg"
              onClick={handleEnroll}
              disabled={enrolling || !selectedStudent || !selectedGroup}
            >
              {enrolling ? <span className="spinner" /> : <><FiUserPlus /> Yozish</>}
            </button>
          </div>
        </div>
      </div>

      {students.length === 0 && groups.length === 0 && (
        <div className="card mt-24">
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h4>Ma'lumot topilmadi</h4>
            <p>Avval o'quvchi va guruhlar qo'shilishi kerak</p>
          </div>
        </div>
      )}
    </>
  );
}
