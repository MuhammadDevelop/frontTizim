import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiAward, FiStar, FiUsers } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function BonusesPage() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [bonuses, setBonuses] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingBonuses, setLoadingBonuses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ points: '', reason: '' });

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
    if (!selectedGroup) { setStudents([]); setSelectedStudent(''); setBonuses([]); return; }
    const fetchStudents = async () => {
      setLoadingStudents(true);
      try {
        const res = await TeacherAPI.groupStudents(selectedGroup);
        setStudents(Array.isArray(res.data) ? res.data : res.data?.items || []);
        setSelectedStudent('');
        setBonuses([]);
      } catch (err) {
        alert("O'quvchilarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [selectedGroup]);

  useEffect(() => {
    if (!selectedStudent) { setBonuses([]); return; }
    const fetchBonuses = async () => {
      setLoadingBonuses(true);
      try {
        const res = await TeacherAPI.bonuses(selectedStudent);
        setBonuses(Array.isArray(res.data) ? res.data : res.data?.items || []);
      } catch (err) {
        alert("Bonuslarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoadingBonuses(false);
      }
    };
    fetchBonuses();
  }, [selectedStudent]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !form.points) {
      alert("O'quvchi va ball majburiy!");
      return;
    }
    setSaving(true);
    try {
      await TeacherAPI.addBonus({
        student_id: Number(selectedStudent),
        points: Number(form.points),
        reason: form.reason,
      });
      setForm({ points: '', reason: '' });
      // Refresh bonuses
      const res = await TeacherAPI.bonuses(selectedStudent);
      setBonuses(Array.isArray(res.data) ? res.data : res.data?.items || []);
      alert("Bonus muvaffaqiyatli qo'shildi!");
    } catch (err) {
      alert("Xato: " + (err.response?.data?.detail || err.message));
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = bonuses.reduce((sum, b) => sum + (Number(b.points) || 0), 0);

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
          <h2>Bonuslar</h2>
          <p>O'quvchilarga bonus ball berish</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">O'quvchi tanlash</h3>
        </div>
        <div className="card-body">
          <div className="form-row">
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
            <div className="form-group">
              <label className="form-label">O'quvchi</label>
              <select
                className="form-control"
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                disabled={!selectedGroup || loadingStudents}
              >
                <option value="">
                  {loadingStudents ? 'Yuklanmoqda...' : "— O'quvchi tanlang —"}
                </option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <>
          <div className="stats-row cols-2 mt-24">
            <div className="stat-card" style={{ '--accent-color': 'var(--warning)' }}>
              <div className="stat-icon" style={{ color: 'var(--warning)', background: 'rgba(245,158,11,0.15)' }}><FiStar /></div>
              <div className="stat-content">
                <div className="stat-value">{totalPoints}</div>
                <div className="stat-label">Jami ball</div>
              </div>
            </div>
            <div className="stat-card" style={{ '--accent-color': 'var(--primary)' }}>
              <div className="stat-icon" style={{ color: 'var(--primary)' }}><FiAward /></div>
              <div className="stat-content">
                <div className="stat-value">{bonuses.length}</div>
                <div className="stat-label">Bonuslar soni</div>
              </div>
            </div>
          </div>

          <div className="card mt-24">
            <div className="card-header">
              <h3 className="card-title">Bonus berish</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Ball</label>
                    <input
                      type="number"
                      name="points"
                      className="form-control"
                      placeholder="10"
                      value={form.points}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sabab</label>
                    <input
                      type="text"
                      name="reason"
                      className="form-control"
                      placeholder="Bonus sababi"
                      value={form.reason}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="mt-16">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner" /> : <><FiAward /> Bonus berish</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card mt-24">
            <div className="card-header">
              <h3 className="card-title">Bonus tarixi</h3>
            </div>

            {loadingBonuses ? (
              <div className="loading-overlay">
                <div className="spinner" />
                <p className="text-muted">Yuklanmoqda...</p>
              </div>
            ) : bonuses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏅</div>
                <h4>Bonuslar topilmadi</h4>
                <p>Bu o'quvchiga hali bonus berilmagan</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Ball</th>
                      <th>Sabab</th>
                      <th>Sana</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonuses.map((b, i) => (
                      <tr key={b.id || i}>
                        <td>{i + 1}</td>
                        <td>
                          <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                            +{b.points}
                          </span>
                        </td>
                        <td>{b.reason || '—'}</td>
                        <td>{fmtDate(b.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
