import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';

export default function MyGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentAPI.myGroups().then(r => setGroups(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header"><div><h2>👥 Mening Guruhlarim</h2></div></div>
      {!groups.length ? <div className="empty-state"><div className="empty-state-icon">👥</div><h4>Hali hech qanday guruhga yozilmagansiz</h4></div> :
      <div className="stats-row cols-3">
        {groups.map(g => (
          <div key={g.id || g.group_id} className="stat-card" style={{'--accent-color':'#6C63FF'}}>
            <div className="stat-icon">📚</div>
            <div>
              <div className="stat-value" style={{fontSize:'1.1rem'}}>{g.group_name || g.name}</div>
              <div className="stat-label">{g.course_name || 'Kurs'}</div>
              <div className="stat-label" style={{marginTop:4}}>{g.schedule || ''}</div>
            </div>
          </div>
        ))}
      </div>}
    </>
  );
}
