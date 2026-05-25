import React, { useState, useEffect } from 'react';
import { FiUsers } from 'react-icons/fi';
import { SuperAdminAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  director: 'Direktor',
  teacher: 'O\'qituvchi',
  reception: 'Resepshen',
  student: 'O\'quvchi',
};

const ROLE_BADGES = {
  superadmin: 'badge-danger',
  director: 'badge-warning',
  teacher: 'badge-success',
  reception: 'badge-muted',
  student: 'badge-success',
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAPI.allUsers(role || undefined);
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert('Foydalanuvchilarni yuklashda xatolik: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Foydalanuvchilar</h1>
        </div>
        <div className="page-header-actions">
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Barcha rollar</option>
            <option value="superadmin">Super Admin</option>
            <option value="director">Direktor</option>
            <option value="teacher">O'qituvchi</option>
            <option value="reception">Resepshen</option>
            <option value="student">O'quvchi</option>
          </select>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiUsers /></div>
          <p>Foydalanuvchilar topilmadi</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ism</th>
                  <th>Telefon</th>
                  <th>Rol</th>
                  <th>Holat</th>
                  <th>Qo'shilgan</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.full_name}</td>
                    <td>{u.phone}</td>
                    <td>
                      <span className={`badge ${ROLE_BADGES[u.role] || 'badge-muted'}`}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td>{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
