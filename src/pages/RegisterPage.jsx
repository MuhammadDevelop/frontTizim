import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FiUser, FiPhone, FiLock, FiBookOpen, FiStar, FiSun, FiMoon, FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

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

const SUBJECT_KEYS = [
  'programming', 'english', 'math', 'physics', 'chemistry',
  'biology', 'history', 'russian', 'arabic', 'design',
];

const SUBJECT_LEVELS = {
  programming: [
    { value: 'html_css', label: 'HTML/CSS' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'react', label: 'React' },
    { value: 'flutter', label: 'Flutter' },
    { value: 'cplus', label: 'C/C++' },
    { value: 'scratch', label: 'Scratch' },
  ],
  english: [
    { value: 'beginner', label: 'Beginner (A1)' },
    { value: 'elementary', label: 'Elementary (A2)' },
    { value: 'intermediate', label: 'Intermediate (B1)' },
    { value: 'upper_intermediate', label: 'Upper-Intermediate (B2)' },
    { value: 'advanced', label: 'Advanced (C1)' },
    { value: 'ielts', label: 'IELTS Preparation' },
  ],
  math: [
    { value: 'boshlangich', label: "Boshlang'ich" },
    { value: 'orta', label: "O'rta" },
    { value: 'olimpiada', label: 'Olimpiada' },
    { value: 'dtm', label: 'DTM tayyorlov' },
  ],
  physics: [
    { value: 'boshlangich', label: "Boshlang'ich" },
    { value: 'orta', label: "O'rta" },
    { value: 'olimpiada', label: 'Olimpiada' },
    { value: 'dtm', label: 'DTM tayyorlov' },
  ],
  chemistry: [
    { value: 'boshlangich', label: "Boshlang'ich" },
    { value: 'orta', label: "O'rta" },
    { value: 'olimpiada', label: 'Olimpiada' },
    { value: 'dtm', label: 'DTM tayyorlov' },
  ],
  biology: [
    { value: 'boshlangich', label: "Boshlang'ich" },
    { value: 'orta', label: "O'rta" },
    { value: 'olimpiada', label: 'Olimpiada' },
    { value: 'dtm', label: 'DTM tayyorlov' },
  ],
  history: [
    { value: 'boshlangich', label: "Boshlang'ich" },
    { value: 'orta', label: "O'rta" },
    { value: 'dtm', label: 'DTM tayyorlov' },
  ],
  russian: [
    { value: 'beginner', label: "Boshlang'ich (A1)" },
    { value: 'elementary', label: "Asosiy (A2)" },
    { value: 'intermediate', label: "O'rta (B1)" },
    { value: 'advanced', label: 'Yuqori (B2+)' },
  ],
  arabic: [
    { value: 'beginner', label: "Boshlang'ich" },
    { value: 'intermediate', label: "O'rta" },
    { value: 'advanced', label: 'Yuqori' },
    { value: 'quran', label: "Qur'on o'qish" },
  ],
  design: [
    { value: 'graphic', label: 'Grafik dizayn' },
    { value: 'uiux', label: 'UI/UX' },
    { value: 'web', label: 'Web dizayn' },
    { value: '3d', label: '3D modeling' },
    { value: 'video', label: 'Video montaj' },
  ],
};

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectLevel, setSubjectLevel] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, lang, changeLang, SUPPORTED_LANGS } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (raw.length < 4) { setPhone('+998 '); return; }
    setPhone(formatPhone(raw));
  };

  const handleSubjectChange = (key) => {
    setSubject(key);
    setSubjectLevel(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!fullName.trim()) { setError(t('auth.errNameRequired')); return; }
    const cleanedPhone = cleanPhone(phone);
    if (!cleanedPhone || cleanedPhone.length < 13) { setError(t('auth.errPhoneRequired')); return; }
    if (!password || password.length < 6) { setError(t('auth.errPasswordMin')); return; }
    if (password !== confirmPassword) { setError(t('auth.errPasswordMismatch')); return; }
    if (!subject) { setError(t('auth.errSubjectRequired')); return; }
    if (!subjectLevel) { setError(t('auth.errLevelRequired')); return; }

    setLoading(true);
    try {
      const res = await client.post('/auth/register', {
        full_name: fullName.trim(),
        phone: cleanedPhone,
        password,
        subject,
        subject_level: subjectLevel,
      });

      const { access_token, full_name, role } = res.data;
      
      // Update Auth context to actually store tokens and avoid 403 when calling StudentAPI later
      await login(cleanedPhone, password);

      localStorage.setItem('mp_subject', subject);
      localStorage.setItem('mp_subject_level', subjectLevel);

      // Backend now automatically places the student into the corresponding active group
      // or creates a group application for them. So we just navigate to dashboard!
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error(err);
      const st = err.response?.status;
      if (st === 409) setError("Bu telefon raqami allaqachon ro'yxatdan o'tgan! Iltimos, Tizimga kiring.");
      else if (st === 422) setError(t('auth.errInvalidData'));
      else setError(err.response?.data?.detail || t('auth.errConnection'));
    } finally {
      setLoading(false);
    }
  };

  const currentFlag = SUPPORTED_LANGS.find(l => l.code === lang)?.flag || '🇺🇿';
  const levels = SUBJECT_LEVELS[subject] || [];

  return (
    <div className={`auth-container ${theme}`}>
      <div className="auth-bg">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      <div className="auth-toolbar">
        <button className="auth-toolbar-btn bounce-hover" onClick={toggleTheme} title="Mavzuni o'zgartirish">
          {theme === 'dark' ? <FiSun className="theme-icon" /> : <FiMoon className="theme-icon" />}
        </button>

        <div className="auth-lang-switcher">
          <button className="auth-toolbar-btn bounce-hover" onClick={() => setLangOpen(!langOpen)}>
            <span className="flag-icon">{currentFlag}</span>
            <span className="lang-text">{lang.toUpperCase()}</span>
          </button>
          {langOpen && (
            <div className="auth-lang-dropdown fade-in">
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l.code}
                  className={`auth-lang-option ${lang === l.code ? 'active' : ''}`}
                  onClick={() => { changeLang(l.code); setLangOpen(false); }}
                >
                  <span className="flag-icon">{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`auth-wrapper ${mounted ? 'slide-up-fade-in' : ''}`}>
        <div className="auth-left-panel">
          <div className="brand-showcase">
            <div className="brand-logo-container float-anim">
              <img src="/logo.png" alt="Logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px'}} />
            </div>
            <h1 className="brand-title">Xush Kelibsiz!</h1>
            <p className="brand-desc">Zamonaviy ta'lim, kuchli ustozlar va interaktiv platforma orqali kelajagingizni quring.</p>
            
            <div className="feature-list">
              <div className="feature-item slide-in-left-1">
                <div className="feature-icon"><FiStar /></div>
                <span>Premium ta'lim tizimi</span>
              </div>
              <div className="feature-item slide-in-left-2">
                <div className="feature-icon"><FiBookOpen /></div>
                <span>Interaktiv darslar va vazifalar</span>
              </div>
              <div className="feature-item slide-in-left-3">
                <div className="feature-icon"><FiUser /></div>
                <span>Shaxsiy rivojlanish monitoringi</span>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-right-panel">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Ro'yxatdan O'tish</h2>
              <p>Yangi o'quvchi profilini yarating</p>
            </div>

            {error && (
              <div className="auth-error-alert shake-anim">
                <span>⚠️</span> {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group stagger-1">
                <label className="form-label">To'liq ismingiz</label>
                <div className="input-with-icon">
                  <FiUser className="input-icon" />
                  <input type="text" className="form-control" placeholder="Falonchiyev Pistonchi"
                    value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
              </div>

              <div className="form-group stagger-2">
                <label className="form-label">Telefon raqam</label>
                <div className="input-with-icon">
                  <FiPhone className="input-icon" />
                  <input type="tel" className="form-control" placeholder="+998 90 123 45 67"
                    value={phone} onChange={handlePhoneChange} />
                </div>
              </div>

              <div className="form-group stagger-3">
                <label className="form-label">Qaysi fanni o'rganmoqchisiz?</label>
                <div className="subject-grid-modern">
                  {SUBJECT_KEYS.map(key => (
                    <div
                      key={key}
                      className={`subject-card ${subject === key ? 'active' : ''}`}
                      onClick={() => handleSubjectChange(key)}
                    >
                      {t(`subject.${key}`)}
                    </div>
                  ))}
                </div>
              </div>

              {subject && levels.length > 0 && (
                <div className="form-group slide-down-fade-in">
                  <label className="form-label">Darajangizni tanlang</label>
                  <div className="level-chips">
                    {levels.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        className={`level-chip ${subjectLevel === lvl.value ? 'active' : ''}`}
                        onClick={() => setSubjectLevel(lvl.value)}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-row stagger-4">
                <div className="form-group half-width">
                  <label className="form-label">Parol</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input type={showPwd ? 'text' : 'password'} className="form-control"
                      placeholder="Min 6 ta belgi"
                      value={password} onChange={e => setPassword(e.target.value)} />
                  </div>
                </div>

                <div className="form-group half-width">
                  <label className="form-label">Parolni tasdiqlash</label>
                  <div className="input-with-icon">
                    <FiLock className="input-icon" />
                    <input type={showPwd ? 'text' : 'password'} className="form-control"
                      placeholder="Parolni qayta kiriting"
                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    <button type="button" className="password-toggle-btn" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn stagger-5" disabled={loading}>
                {loading ? <span className="loader-dots"></span> : "Boshlash"}
              </button>
            </form>

            <div className="auth-footer stagger-6">
              <p>Hisobingiz bormi? <Link to="/login" className="auth-link">Tizimga kiring</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
