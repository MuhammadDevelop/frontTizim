import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiCheckCircle, FiUsers } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const STATUS_OPTIONS = [
  { value: 'present', label: '✅ Keldi', color: 'var(--success)' },
  { value: 'absent', label: '❌ Kelmadi', color: 'var(--danger)' },
  { value: 'late', label: '⏰ Kechikdi', color: 'var(--warning)' },
];

export default function AttendancePage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setStudents([]);
      setRecords({});
      return;
    }
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await TeacherAPI.groupStudents(selectedGroup);
        const list = Array.isArray(res.data) ? res.data : res.data?.items || [];
        setStudents(list);
        const defaultRecords = {};
        list.forEach(s => { defaultRecords[s.id] = 'present'; });
        setRecords(defaultRecords);
      } catch (err) {
        alert("O'quvchilarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedGroup]);

  const handleStatusChange = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedGroup || !date) {
      alert("Guruh va sanani tanlang!");
      return;
    }
    if (students.length === 0) {
      alert("Guruhda o'quvchilar yo'q!");
      return;
    }
    setSubmitting(true);
    try {
      const data = {
        group_id: Number(selectedGroup),
        date: date,
        records: students.map(s => ({
          student_id: s.id,
          status: records[s.id] || 'present',
        })),
      };
      await TeacherAPI.markAttendance(data);
      alert("Davomat muvaffaqiyatli saqlandi!");
    } catch (err) {
      alert("Davomatni saqlashda xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmitting(false);
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
          <h2>Davomat</h2>
          <p>O'quvchilar davomatini belgilash</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Davomat belgilash</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Guruh tanlang</label>
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
            <div className="form-group">
              <label className="form-label">Sana</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedGroup && (
        <div className="card mt-24">
          <div className="card-header">
            <h3 className="card-title">O'quvchilar ro'yxati</h3>
            <span className="badge badge-primary">
              <FiUsers style={{ marginRight: 4 }} /> {students.length} o'quvchi
            </span>
          </div>

          {loadingStudents ? (
            <div className="loading-overlay">
              <div className="spinner" />
              <p className="text-muted">O'quvchilar yuklanmoqda...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h4>O'quvchilar topilmadi</h4>
              <p>Bu guruhda o'quvchilar yo'q</p>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>O'quvchi</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id}>
                        <td>{i + 1}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.full_name}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 16 }}>
                            {STATUS_OPTIONS.map(opt => (
                              <label
                                key={opt.value}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6,
                                  cursor: 'pointer', fontSize: '0.85rem',
                                  color: records[s.id] === opt.value ? opt.color : 'var(--text-muted)',
                                  fontWeight: records[s.id] === opt.value ? 600 : 400,
                                }}
                              >
                                <input
                                  type="radio"
                                  name={`status-${s.id}`}
                                  value={opt.value}
                                  checked={records[s.id] === opt.value}
                                  onChange={() => handleStatusChange(s.id, opt.value)}
                                  style={{ accentColor: opt.color }}
                                />
                                {opt.label}
                              </label>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ padding: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? <span className="spinner" /> : <><FiCheckCircle /> Davomatni saqlash</>}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
