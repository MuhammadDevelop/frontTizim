import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';
import { FiFileText, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '../../context/LanguageContext';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function MaterialsPage() {
  const { t } = useLanguage();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const groupsRes = await StudentAPI.myGroups();
        const groups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.items || [];
        const courseIds = [...new Set(groups.flatMap(g => [g.course_id, g.course?.id, g.group?.course_id]).filter(Boolean))];
        
        const allMaterials = [];
        for (const cid of courseIds) {
          try {
            const mRes = await StudentAPI.materials(cid);
            const mats = Array.isArray(mRes.data) ? mRes.data : mRes.data?.items || [];
            allMaterials.push(...mats);
          } catch (e) {
            console.error("Failed to fetch materials for course", cid, e);
          }
        }
        setMaterials(allMaterials);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
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
          <h2>{t('nav.materials') || 'Materiallar'}</h2>
          <p>Kurs materiallari va resurslar</p>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header">
          <h3 className="card-title">Materiallar ro'yxati</h3>
          <span className="badge badge-primary">
            <FiFileText style={{ marginRight: 4 }} /> {materials.length} material
          </span>
        </div>

        {materials.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📁</div>
            <h4>Materiallar topilmadi</h4>
            <p>Sizning kurslaringiz uchun hali materiallar yuklanmagan</p>
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
    </>
  );
}
