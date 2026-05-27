import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client, { AuthAPI } from '../api/client';

// Telefon raqamni formatlash: +998 XX XXX XX XX
function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) { /* OK */ }
  else if (digits.length > 0 && !digits.startsWith('998')) {
    if (digits.startsWith('9') && digits.length <= 9) digits = '998' + digits;
  }
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '+' + digits;
  if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
  if (digits.length <= 8) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5);
  if (digits.length <= 10) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8);
  return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 10) + ' ' + digits.slice(10, 12);
}
function cleanPhone(formatted) {
  const digits = formatted.replace(/\D/g, '');
  return digits ? '+' + digits : '';
}

const SUBJECTS = [
  { value: 'programming', label: '💻 Dasturlash' },
  { value: 'english', label: '🇬🇧 Ingliz tili' },
  { value: 'math', label: '📐 Matematika' },
  { value: 'physics', label: '⚡ Fizika' },
  { value: 'chemistry', label: '🧪 Kimyo' },
  { value: 'biology', label: '🧬 Biologiya' },
  { value: 'history', label: '📜 Tarix' },
  { value: 'russian', label: '🇷🇺 Rus tili' },
  { value: 'arabic', label: '🕌 Arab tili' },
  { value: 'design', label: '🎨 Dizayn' },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (raw.length < 4) { setPhone('+998 '); return; }
    setPhone(formatPhone(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) { setError("Ism familiya kiriting"); return; }
    const cleanedPhone = cleanPhone(phone);
    if (!cleanedPhone || cleanedPhone.length < 13) { setError("Telefon raqamini to'liq kiriting"); return; }
    if (!password || password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    if (password !== confirmPassword) { setError("Parollar mos kelmaydi"); return; }
    if (!subject) { setError("Fan tanlang"); return; }

    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        full_name: fullName.trim(),
        phone: cleanedPhone,
        password,
        subject,
      });
      const { access_token, full_name, role } = res.data;
      localStorage.setItem('mp_token', access_token);
      localStorage.setItem('mp_name', full_name);
      localStorage.setItem('mp_role', role);
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      const st = err.response?.status;
      if (st === 409) setError("Bu telefon raqami allaqachon ro'yxatdan o'tgan");
      else if (st === 422) setError("Ma'lumotlarni to'g'ri kiriting");
      else setError(err.response?.data?.detail || "Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-brand">
            <div><div className="brand-logo-lg">🏫</div></div>
            <div className="brand-main">
              <h1>Markaz<br/>Platformasi</h1>
              <p>O'quv markazingizni samarali boshqarish uchun yagona platforma. Xavfsiz, tez va qulay.</p>
            </div>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="brand-feature-icon">🎓</span>
                <span className="brand-feature-text">O'quvchi sifatida ro'yxatdan o'ting</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">📱</span>
                <span className="brand-feature-text">10 ta fandan birini tanlang</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">⭐</span>
                <span className="brand-feature-text">Baholar va bonuslarni kuzating</span>
              </div>
            </div>
          </div>

          <div className="login-form-panel">
            <div className="login-header">
              <h2>Ro'yxatdan o'tish 📝</h2>
              <p>O'quvchi sifatida hisob yarating</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Ism Familiya</label>
                <input type="text" className="form-control" placeholder="Ismingiz va familiyangiz"
                  value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
              </div>

              <div className="form-group">
                <label className="form-label">Telefon raqami</label>
                <input type="tel" className="form-control" placeholder="+998 93 105 01 16"
                  value={phone} onChange={handlePhoneChange} autoComplete="tel" />
              </div>

              <div className="form-group">
                <label className="form-label">Fan tanlang</label>
                <div className="subject-grid">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      className={`subject-option${subject === s.value ? ' active' : ''}`}
                      onClick={() => setSubject(s.value)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Parol</label>
                <div className="password-wrap">
                  <input type={showPwd ? 'text' : 'password'} className="form-control"
                    placeholder="Kamida 6 ta belgi"
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Parolni tasdiqlang</label>
                <input type="password" className="form-control" placeholder="Parolni qayta kiriting"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : "Ro'yxatdan o'tish"}
              </button>
            </form>

            <div className="login-footer" style={{marginTop: 20}}>
              <p>Hisobingiz bormi? <Link to="/login" style={{color: 'var(--primary)', fontWeight: 600}}>Kirish</Link></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
