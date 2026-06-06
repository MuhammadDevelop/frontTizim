import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';
import { FiBookOpen } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function LessonsPage() {
  const { t } = useLanguage();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const groupsRes = await StudentAPI.myGroups();
        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.items || [];
        const groupIds = [...new Set(groups.flatMap(g => [g.group_id, g.group?.id, g.id]).filter(Boolean))];
        
        const allLessons = [];
        for (const gid of groupIds) {
          try {
            const lRes = await StudentAPI.lessons(gid);
            const data = Array.isArray(lRes.data) ? lRes.data : lRes.data?.items || [];
            allLessons.push(...data);
          } catch (e) {
            console.error("Failed to fetch lessons for group", gid, e);
          }
        }
        allLessons.sort((a, b) => new Date(b.date) - new Date(a.date));
        setLessons(allLessons);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>{t('nav.lessons') || 'Darslar'}</h2>
          <p>Mening darslarim</p>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header">
          <h3 className="card-title">Darslar ro'yxati</h3>
          <span className="badge badge-primary">
            <FiBookOpen style={{ marginRight: 4 }} /> {lessons.length} dars
          </span>
        </div>

        {lessons.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📖</div>
            <h4>Darslar topilmadi</h4>
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
    </>
  );
}
