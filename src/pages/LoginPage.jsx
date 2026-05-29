import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

// Telefon raqamni formatlash: +998 XX XXX XX XX
function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('998')) {
    // 998XXXXXXXXX formatida
  } else if (digits.length > 0 && !digits.startsWith('998')) {
    if (digits.startsWith('9') && digits.length <= 9) {
      digits = '998' + digits;
    }
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

// Fan darajalari
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

const SUBJECT_KEYS = [
  'programming', 'english', 'math', 'physics', 'chemistry',
  'biology', 'history', 'russian', 'arabic', 'design',
];

export default function LoginPage() {
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  // Login muvaffaqiyatli bo'lgandan keyin, agar student bo'lsa — daraja tanlash
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [loginResult, setLoginResult] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, lang, changeLang, SUPPORTED_LANGS } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
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
    if (!cleanedPhone || cleanedPhone.length < 13) { setError(t('auth.errPhoneRequired')); return; }
    if (!password || password.length < 6) { setError(t('auth.errPasswordMin')); return; }
    setLoading(true);
    try {
      const result = await login(cleanedPhone, password);
      // Student bo'lsa — daraja tanlash sahifasini ko'rsat
      if (result.role === 'student') {
        // Avval saqlangan darajani tekshirish
        const savedLevel = localStorage.getItem('mp_subject_level');
        const savedSubject = localStorage.getItem('mp_subject');
        if (savedLevel && savedSubject) {
          // Daraja avval tanlangan — to'g'ridan-to'g'ri kirgiz
          navigate('/dashboard', { replace: true });
        } else {
          setLoginResult(result);
          setShowLevelSelect(true);
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 422) setError(t('auth.errInvalidCreds'));
      else if (status === 403) setError(t('auth.errBlocked'));
      else setError(err.response?.data?.detail || t('auth.errServer'));
    } finally {
      setLoading(false);
    }
  };

  // Daraja tanlash va davom etish
  const handleLevelConfirm = () => {
    if (!selectedSubject || !selectedLevel) return;
    localStorage.setItem('mp_subject', selectedSubject);
    localStorage.setItem('mp_subject_level', selectedLevel);
    navigate('/dashboard', { replace: true });
  };

  const currentFlag = SUPPORTED_LANGS.find(l => l.code === lang)?.flag || '🇺🇿';
  const levels = SUBJECT_LEVELS[selectedSubject] || [];

  // Agar daraja tanlash ko'rsatilsa
  if (showLevelSelect) {
    return (
      <>
        <div className="login-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="login-page">
          <div className="login-wrapper" style={{ maxWidth: 520 }}>
            <div className="login-form-panel" style={{ width: '100%', maxWidth: 520 }}>
              <div className="login-header">
                <h2>🎓 {t('auth.subjectLabel')}</h2>
                <p>{t('auth.levelLabel')}</p>
              </div>

              <div className="login-form" style={{ gap: 20 }}>
                {/* Fan tanlash */}
                <div className="form-group">
                  <label className="form-label">{t('auth.subjectLabel')}</label>
                  <div className="subject-grid">
                    {SUBJECT_KEYS.map(key => (
                      <button
                        key={key}
                        type="button"
                        className={`subject-option${selectedSubject === key ? ' active' : ''}`}
                        onClick={() => { setSelectedSubject(key); setSelectedLevel(''); }}
                      >
                        {t(`subject.${key}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daraja tanlash */}
                {selectedSubject && levels.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">{t('auth.levelLabel')}</label>
                    <div className="level-grid">
                      {levels.map(lvl => (
                        <button
                          key={lvl.value}
                          type="button"
                          className={`level-option${selectedLevel === lvl.value ? ' active' : ''}`}
                          onClick={() => setSelectedLevel(lvl.value)}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="btn btn-primary btn-full btn-lg"
                  disabled={!selectedSubject || !selectedLevel}
                  onClick={handleLevelConfirm}
                >
                  Davom etish →
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="login-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* ─── Floating Toolbar: Theme + Lang ─── */}
      <div className="auth-toolbar">
        <button className="auth-toolbar-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Kun rejimi' : 'Tun rejimi'}>
          <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>

        <div className="auth-lang-switcher">
          <button className="auth-toolbar-btn" onClick={() => setLangOpen(!langOpen)}>
            <span>{currentFlag}</span>
            <span className="auth-lang-code">{lang.toUpperCase()}</span>
            <span className="auth-lang-arrow">{langOpen ? '▲' : '▼'}</span>
          </button>
          {langOpen && (
            <div className="auth-lang-dropdown">
              {SUPPORTED_LANGS.map(l => (
                <button
                  key={l.code}
                  className={`auth-lang-option${lang === l.code ? ' active' : ''}`}
                  onClick={() => { changeLang(l.code); setLangOpen(false); }}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                  {lang === l.code && <span className="auth-lang-check">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="login-page">
        <div className="login-wrapper">
          <div className="login-brand">
            <div><div className="brand-logo-lg">🏫</div></div>
            <div className="brand-main">
              <h1>{t('auth.brandTitle').split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br/>}</span>)}</h1>
              <p>{t('auth.brandDesc')}</p>
            </div>
            <div className="brand-features">
              <div className="brand-feature">
                <span className="brand-feature-icon">👑</span>
                <span className="brand-feature-text">{t('auth.feature1')}</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">🔐</span>
                <span className="brand-feature-text">{t('auth.feature2')}</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">📊</span>
                <span className="brand-feature-text">{t('auth.feature3')}</span>
              </div>
            </div>
          </div>

          <div className="login-form-panel">
            <div className="login-header">
              <h2>{t('auth.welcome')}</h2>
              <p>{t('auth.welcomeSub')}</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('auth.phoneLabel')}</label>
                <input type="tel" className="form-control" placeholder={t('auth.phonePlaceholder')}
                  value={phone} onChange={handlePhoneChange} autoComplete="username" />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.passwordLabel')}</label>
                <div className="password-wrap">
                  <input type={showPwd ? 'text' : 'password'} className="form-control"
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : t('auth.loginBtn')}
              </button>
            </form>

            <div className="login-footer">
              <p style={{marginBottom: 8}}>{t('auth.noAccount')} <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600}}>{t('auth.registerLink')}</Link></p>
              <p>{t('auth.platformVersion')}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
