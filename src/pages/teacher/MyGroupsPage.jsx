import { useState, useEffect } from 'react';
import { TeacherAPI } from '../../api/client';
import { FiLayers, FiUsers, FiClock, FiBookOpen } from 'react-icons/fi';

export default function MyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await TeacherAPI.myGroups();
        setGroups(Array.isArray(res.data) ? res.data : res.data?.items || []);
      } catch (err) {
        alert("Guruhlarni yuklashda xato: " + (err.response?.data?.detail || err.message));
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
          <h2>Mening guruhlarim</h2>
          <p>Sizga biriktirilgan guruhlar ro'yxati</p>
        </div>
      </div>

      <div className="stats-row cols-2">
        <div className="stat-card" style={{ '--accent-color': 'var(--primary)' }}>
          <div className="stat-icon" style={{ color: 'var(--primary)' }}><FiLayers /></div>
          <div className="stat-content">
            <div className="stat-value">{groups.length}</div>
            <div className="stat-label">Jami guruhlar</div>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent-color': 'var(--accent)' }}>
          <div className="stat-icon" style={{ color: 'var(--accent)', background: 'rgba(67,217,173,0.15)' }}><FiUsers /></div>
          <div className="stat-content">
            <div className="stat-value">{groups.reduce((sum, g) => sum + (g.student_count || g.students_count || 0), 0)}</div>
            <div className="stat-label">Jami o'quvchilar</div>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h4>Guruhlar topilmadi</h4>
            <p>Sizga hali guruh biriktirilmagan</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {groups.map(g => (
            <div className="card" key={g.id}>
              <div className="card-header">
                <h3 className="card-title">{g.name}</h3>
                <span className="badge badge-primary">
                  <FiUsers style={{ marginRight: 4 }} />
                  {g.student_count ?? g.students_count ?? 0} o'quvchi
                </span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(g.course_name || g.course?.name) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiBookOpen style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span className="text-sm">
                        <span className="text-muted">Kurs: </span>
                        {g.course_name || g.course?.name}
                      </span>
                    </div>
                  )}
                  {g.schedule && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiClock style={{ color: 'var(--warning)', flexShrink: 0 }} />
                      <span className="text-sm">
                        <span className="text-muted">Dars jadvali: </span>
                        {g.schedule}
                      </span>
                    </div>
                  )}
                  {g.room && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FiLayers style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      <span className="text-sm">
                        <span className="text-muted">Xona: </span>
                        {g.room}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
