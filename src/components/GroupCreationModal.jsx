import { useState, useEffect } from 'react';
import { DirectorAPI, ReceptionAPI } from '../api/client';

const DAYS_UZ = [
  { value: 'monday',    label: 'Dushanba' },
  { value: 'tuesday',   label: 'Seshanba' },
  { value: 'wednesday', label: 'Chorshanba' },
  { value: 'thursday',  label: 'Payshanba' },
  { value: 'friday',    label: 'Juma' },
  { value: 'saturday',  label: 'Shanba' },
  { value: 'sunday',    label: 'Yakshanba' },
];

const ODD_DAYS  = ['monday', 'wednesday', 'friday'];
const EVEN_DAYS = ['tuesday', 'thursday', 'saturday'];

export default function GroupCreationModal({ isOpen, onClose, onSuccess, studentId, subject }) {
  const [teachers, setTeachers]         = useState([]);
  const [teacherId, setTeacherId]       = useState('');
  const [groupName, setGroupName]       = useState('');
  const [startTime, setStartTime]       = useState('09:00');
  const [endTime, setEndTime]           = useState('11:00');
  const [selectedDays, setSelectedDays] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  // O'qituvchilar ro'yxatini yuklash
  useEffect(() => {
    if (!isOpen) return;
    DirectorAPI.teachers()
      .then(r => setTeachers(r.data || []))
      .catch(() => setTeachers([]));
    // Standart nom
    setGroupName(subject ? `${subject.charAt(0).toUpperCase() + subject.slice(1)}-1` : '');
  }, [isOpen, subject]);

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const selectPreset = (days) => setSelectedDays(days);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!groupName.trim())  { setError("Guruh nomini kiriting"); return; }
    if (!teacherId)          { setError("O'qituvchini tanlang"); return; }
    if (selectedDays.length === 0) { setError("Kamida bitta kun tanlang"); return; }
    if (!startTime || !endTime)    { setError("Dars vaqtini kiriting"); return; }

    setLoading(true);
    try {
      // 1. Yangi guruh yaratish
      const groupRes = await ReceptionAPI.createGroup({
        name: groupName.trim(),
        subject,
        teacher_id: Number(teacherId),
        days: selectedDays,
        start_time: startTime,
        end_time: endTime,
      });
      const newGroupId = groupRes.data.id;

      // 2. O'quvchini shu guruhga qo'shish
      if (studentId) {
        await ReceptionAPI.enroll(studentId, newGroupId);
      }

      onSuccess && onSuccess(groupRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Guruh yaratishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 520, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">➕ Yangi Guruh Yaratish</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
              <strong style={{ color: 'var(--primary)' }}>{subject}</strong> fani uchun guruh topilmadi.
              Yangi guruh yarating.
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 1.5rem 1.5rem' }}>
          {/* Guruh nomi */}
          <div className="form-group">
            <label className="form-label">Guruh nomi</label>
            <input
              type="text"
              className="form-control"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="Masalan: JavaScript-1"
            />
          </div>

          {/* O'qituvchi */}
          <div className="form-group">
            <label className="form-label">O'qituvchi</label>
            <select
              className="form-control"
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
            >
              <option value="">— O'qituvchini tanlang —</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.full_name} {t.subject ? `(${t.subject})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Dars vaqti */}
          <div className="form-group">
            <label className="form-label">Dars vaqti</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="time"
                className="form-control"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{ flex: 1 }}
              />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>—</span>
              <input
                type="time"
                className="form-control"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Kunlar */}
          <div className="form-group">
            <label className="form-label">Dars kunlari</label>

            {/* Tez tanlov */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                type="button"
                className={`badge ${JSON.stringify(selectedDays.slice().sort()) === JSON.stringify([...ODD_DAYS].sort()) ? 'badge-primary' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 12 }}
                onClick={() => selectPreset(ODD_DAYS)}
              >
                D-Ch-J
              </button>
              <button
                type="button"
                className={`badge ${JSON.stringify(selectedDays.slice().sort()) === JSON.stringify([...EVEN_DAYS].sort()) ? 'badge-primary' : 'badge-secondary'}`}
                style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 12 }}
                onClick={() => selectPreset(EVEN_DAYS)}
              >
                S-P-Sh
              </button>
              <button
                type="button"
                style={{ cursor: 'pointer', padding: '4px 10px', borderRadius: 20, border: 'none', fontSize: 12, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                onClick={() => setSelectedDays([])}
              >
                Tozalash
              </button>
            </div>

            {/* Kun tugmalari */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DAYS_UZ.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `2px solid ${selectedDays.includes(d.value) ? 'var(--primary)' : 'var(--border)'}`,
                    background: selectedDays.includes(d.value) ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: selectedDays.includes(d.value) ? '#fff' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Xato xabari */}
          {error && (
            <div className="login-error" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          {/* Tugmalar */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onClose}
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : '✅ Guruh yaratish va qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
