import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    StudentAPI.me()
      .then(r => {
        const d = r.data || {};
        setProfile(d);
        setForm({ full_name: d.full_name || '', phone: d.phone || '', email: d.email || '', birth_date: d.birth_date || '', address: d.address || '', bio: d.bio || '' });
      })
      .catch(() => {
        // Use local data as fallback
        const fallback = { full_name: user?.name || '', phone: '', email: '', birth_date: '', address: '', bio: '', groups_count: 0, average_score: 0, total_tasks: 0, attendance_rate: 0, created_at: '' };
        setProfile(fallback);
        setForm({ full_name: fallback.full_name, phone: '', email: '', birth_date: '', address: '', bio: '' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      await StudentAPI.updateMe(form);
      setProfile(p => ({ ...p, ...form }));
      setEditing(false);
      setMsg('✅');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('❌');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  if (!profile) return <div className="empty-state"><div className="empty-state-icon">👤</div><h4>{t('app.noData')}</h4></div>;

  const avatar = (profile.full_name || user?.name || '?')[0].toUpperCase();

  return (
    <>
      <div className="page-header"><div><h2>👤 {t('profile.title')}</h2></div></div>

      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-lg">{avatar}</div>
        <div className="profile-hero-info">
          <h2>{profile.full_name || user?.name}</h2>
          <p className="text-muted">{t('role.student')}</p>
          {profile.created_at && <p className="text-sm text-muted">{t('profile.memberSince')}: {new Date(profile.created_at).toLocaleDateString()}</p>}
        </div>
        <button className="btn btn-secondary" onClick={() => setEditing(!editing)}>
          {editing ? t('app.cancel') : `✏️ ${t('profile.editProfile')}`}
        </button>
      </div>

      {msg && <div style={{ textAlign: 'center', padding: 8, fontSize: '1.2rem' }}>{msg}</div>}

      {/* Stats */}
      <div className="stats-row cols-4" style={{ marginTop: 24 }}>
        <div className="stat-card" style={{ '--accent-color': '#6C63FF' }}><div className="stat-icon">👥</div>
          <div><div className="stat-value">{profile.groups_count || 0}</div><div className="stat-label">{t('profile.groups')}</div></div></div>
        <div className="stat-card" style={{ '--accent-color': '#10B981' }}><div className="stat-icon">📊</div>
          <div><div className="stat-value">{profile.average_score || 0}</div><div className="stat-label">{t('profile.avgScore')}</div></div></div>
        <div className="stat-card" style={{ '--accent-color': '#3B82F6' }}><div className="stat-icon">📝</div>
          <div><div className="stat-value">{profile.total_tasks || 0}</div><div className="stat-label">{t('profile.totalTasks')}</div></div></div>
        <div className="stat-card" style={{ '--accent-color': '#F59E0B' }}><div className="stat-icon">✅</div>
          <div><div className="stat-value">{profile.attendance_rate || 0}%</div><div className="stat-label">{t('profile.attendanceRate')}</div></div></div>
      </div>

      {/* Info Card */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-title">📋 {t('profile.personalInfo')}</div>
        </div>
        <div className="card-body">
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('profile.fullName')}</label>
                  <input className="form-control" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('profile.phone')}</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('profile.email')}</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('profile.birthDate')}</label>
                  <input className="form-control" type="date" value={form.birth_date} onChange={e => setForm(p => ({ ...p, birth_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.address')}</label>
                <input className="form-control" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.bio')}</label>
                <textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>{t('app.cancel')}</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? '...' : t('profile.saveChanges')}</button>
              </div>
            </div>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.fullName')}</span><span>{profile.full_name || '—'}</span></div>
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.phone')}</span><span>{profile.phone || '—'}</span></div>
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.email')}</span><span>{profile.email || '—'}</span></div>
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.birthDate')}</span><span>{profile.birth_date || '—'}</span></div>
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.address')}</span><span>{profile.address || '—'}</span></div>
              <div className="profile-info-item"><span className="profile-info-label">{t('profile.bio')}</span><span>{profile.bio || '—'}</span></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
