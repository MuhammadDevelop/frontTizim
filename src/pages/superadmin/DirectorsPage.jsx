import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight, FiUsers, FiX } from 'react-icons/fi';
import { SuperAdminAPI } from '../../api/client';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function DirectorsPage() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', password: '' });

  useEffect(() => {
    fetchDirectors();
  }, []);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const res = await SuperAdminAPI.directors();
      setDirectors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      alert('Direktorlarni yuklashda xatolik: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ full_name: '', phone: '', password: '' });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ full_name: d.full_name || '', phone: d.phone || '', password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        const payload = { full_name: form.full_name, phone: form.phone };
        if (form.password) payload.password = form.password;
        await SuperAdminAPI.updateDir(editing.id, payload);
      } else {
        await SuperAdminAPI.createDir({ ...form, role: 'director' });
      }
      setShowModal(false);
      fetchDirectors();
    } catch (err) {
      alert('Saqlashda xatolik: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Direktorni o\'chirishni tasdiqlaysizmi?')) return;
    try {
      await SuperAdminAPI.deleteDir(id);
      fetchDirectors();
    } catch (err) {
      alert('O\'chirishda xatolik: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggle = async (id) => {
    try {
      await SuperAdminAPI.toggleDir(id);
      fetchDirectors();
    } catch (err) {
      alert('Holatni o\'zgartirishda xatolik: ' + (err.response?.data?.detail || err.message));
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
          <h1>Direktorlar</h1>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> Qo'shish
          </button>
        </div>
      </div>

      {directors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiUsers /></div>
          <p>Direktorlar topilmadi</p>
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
                  <th>Holat</th>
                  <th>Qo'shilgan</th>
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td>{d.full_name}</td>
                    <td>{d.phone}</td>
                    <td>
                      <span className={`badge ${d.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {d.is_active ? 'Faol' : 'Bloklangan'}
                      </span>
                    </td>
                    <td>{fmtDate(d.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(d)} title="Tahrirlash">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleToggle(d.id)} title={d.is_active ? 'Bloklash' : 'Faollashtirish'}>
                          {d.is_active ? <FiToggleRight /> : <FiToggleLeft />}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)} title="O'chirish">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Direktorni tahrirlash' : 'Yangi direktor'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">To'liq ism</label>
                  <input
                    className="form-control"
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input
                    className="form-control"
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parol{editing ? ' (bo\'sh qoldiring agar o\'zgartirmasangiz)' : ''}</label>
                  <input
                    className="form-control"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    {...(!editing ? { required: true } : {})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
