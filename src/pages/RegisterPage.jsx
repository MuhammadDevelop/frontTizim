import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError("Ism familiya kiriting"); return; }
    if (!phone.trim()) { setError("Telefon raqamini kiriting"); return; }
    if (!password || password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
    if (password !== confirmPassword) { setError("Parollar mos kelmaydi"); return; }

    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        full_name: fullName.trim(),
        phone: phone.trim(),
        password,
      });
      // Avtomatik login
      const { access_token, full_name, role } = res.data;
      localStorage.setItem('mp_token', access_token);
      localStorage.setItem('mp_name', full_name);
      localStorage.setItem('mp_role', role);
      navigate('/dashboard', { replace: true });
      window.location.reload();
    } catch (err) {
      const status = err.response?.status;
      if (status === 409) setError("Bu telefon raqami allaqachon ro'yxatdan o'tgan");
      else if (status === 422) setError("Ma'lumotlarni to'g'ri kiriting");
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
                <input type="tel" className="form-control" placeholder="+998 90 123 45 67"
                  value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
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
                <input type="password" className="form-control"
                  placeholder="Parolni qayta kiriting"
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
