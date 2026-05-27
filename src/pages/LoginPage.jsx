import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Telefon raqamni formatlash: +998 XX XXX XX XX
function formatPhone(value) {
  // Faqat raqamlarni olish
  let digits = value.replace(/\D/g, '');
  
  // Agar + bilan boshlansa yoki 998 bilan boshlasa
  if (digits.startsWith('998')) {
    // 998XXXXXXXXX formatida
  } else if (digits.length > 0 && !digits.startsWith('998')) {
    // Agar foydalanuvchi 9 dan boshlasa, 998 ni qo'shamiz
    if (digits.startsWith('9') && digits.length <= 9) {
      digits = '998' + digits;
    }
  }
  
  // Raqamlarni formatlash
  if (digits.length === 0) return '';
  if (digits.length <= 3) return '+' + digits;
  if (digits.length <= 5) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3);
  if (digits.length <= 8) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5);
  if (digits.length <= 10) return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8);
  return '+' + digits.slice(0, 3) + ' ' + digits.slice(3, 5) + ' ' + digits.slice(5, 8) + ' ' + digits.slice(8, 10) + ' ' + digits.slice(10, 12);
}

// Telefon raqamdan faqat raqamlarni olish (+998XXXXXXXXX formatida)
function cleanPhone(formatted) {
  const digits = formatted.replace(/\D/g, '');
  return digits ? '+' + digits : '';
}

export default function LoginPage() {
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    // Agar foydalanuvchi hamma narsani o'chirsa
    if (raw.length < 4) {
      setPhone('+998 ');
      return;
    }
    setPhone(formatPhone(raw));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const cleanedPhone = cleanPhone(phone);
    if (!cleanedPhone || cleanedPhone.length < 13) { setError("Telefon raqamini to'liq kiriting"); return; }
    if (!password || password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    setLoading(true);
    try {
      const { role } = await login(cleanedPhone, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422) setError("Telefon raqami yoki parol noto'g'ri");
      else if (status === 403) setError("Hisobingiz bloklangan");
      else setError(err.response?.data?.detail || "Server bilan bog'lanib bo'lmadi. Qayta urinib ko'ring.");
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
                <span className="brand-feature-icon">👑</span>
                <span className="brand-feature-text">Ko'p rolli boshqaruv tizimi</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">🔐</span>
                <span className="brand-feature-text">JWT asosida xavfsiz kirish</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">📊</span>
                <span className="brand-feature-text">Real vaqt statistikasi</span>
              </div>
            </div>
          </div>

          <div className="login-form-panel">
            <div className="login-header">
              <h2>Xush kelibsiz! 👋</h2>
              <p>Davom etish uchun hisobingizga kiring</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Telefon raqami</label>
                <input type="tel" className="form-control" placeholder="+998 93 105 01 16"
                  value={phone} onChange={handlePhoneChange} autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label">Parol</label>
                <div className="password-wrap">
                  <input type={showPwd ? 'text' : 'password'} className="form-control"
                    placeholder="Parolingizni kiriting"
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Kirish'}
              </button>
            </form>

            <div className="login-footer">
              <p style={{marginBottom: 8}}>Hisobingiz yo'qmi? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600}}>Ro'yxatdan o'tish</Link></p>
              <p>Markaz Platformasi v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
