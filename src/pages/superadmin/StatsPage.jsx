import { useState, useEffect } from 'react';
import { SuperAdminAPI } from '../../api/client';

const labelMap = {
  directors: 'Direktorlar',
  teachers: "O'qituvchilar",
  students: "O'quvchilar",
  reception: 'Qabul xodimlari',
  active: 'Faol foydalanuvchilar',
  blocked: 'Bloklangan',
  courses: 'Kurslar',
  groups: 'Guruhlar',
  payments: "To'lovlar",
  users: 'Foydalanuvchilar',
};

const iconMap = {
  directors: '🏫',
  teachers: '👨‍🏫',
  students: '🎓',
  reception: '📋',
  active: '✅',
  blocked: '🔒',
  courses: '📚',
  groups: '👥',
  payments: '💳',
  users: '👤',
};

const colorMap = {
  directors: '#6C63FF',
  teachers: '#3B82F6',
  students: '#EC4899',
  reception: '#F59E0B',
  active: '#10B981',
  blocked: '#EF4444',
  courses: '#10B981',
  groups: '#F59E0B',
  payments: '#EF4444',
  users: '#8B5CF6',
};

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SuperAdminAPI.stats()
      .then(r => setStats(r.data))
      .catch(e => alert(e.response?.data?.detail || 'Xato'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  if (!stats) return <div className="empty-state"><div className="empty-state-icon">📊</div><h4>Statistika topilmadi</h4></div>;

  // Flatten: agar qiymat obyekt bo'lsa, ichidagi kalitlarni ham chiqaramiz
  const flatItems = [];
  Object.entries(stats).forEach(([key, val]) => {
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      // Nested obyektni alohida kartalar qilib chiqaramiz
      Object.entries(val).forEach(([subKey, subVal]) => {
        flatItems.push({ key: subKey, value: Number(subVal) || 0 });
      });
    } else {
      flatItems.push({ key, value: Number(val) || 0 });
    }
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h2>📊 Platforma Statistikasi</h2>
          <p>Umumiy ko'rsatkichlar</p>
        </div>
      </div>
      <div className="stats-row cols-4">
        {flatItems.map(({ key, value }) => (
          <div
            key={key}
            className="stat-card"
            style={{
              '--accent-color': colorMap[key] || '#6C63FF',
              '--icon-bg': (colorMap[key] || '#6C63FF') + '25',
            }}
          >
            <div className="stat-icon">{iconMap[key] || '📊'}</div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
