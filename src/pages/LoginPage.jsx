import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError("Telefon raqamini kiriting"); return; }
    if (!password || password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    setLoading(true);
    try {
      const { role } = await login(phone.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422) setError("Telefon raqami yoki parol noto'g'ri");
      else if (status === 403) setError("Hisobingiz bloklangan");
      else setError(err.response?.data?.detail || "Xato yuz berdi");
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
                <input type="tel" className="form-control" placeholder="+998 90 123 45 67"
                  value={phone} onChange={e => setPhone(e.target.value)} autoComplete="username" />
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
