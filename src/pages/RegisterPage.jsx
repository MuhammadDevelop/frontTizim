import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client, { DirectorAPI, StudentAPI, ReceptionAPI } from '../api/client';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import GroupCreationModal from '../components/GroupCreationModal';

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

const SUBJECT_KEYS = [
  'programming', 'english', 'math', 'physics', 'chemistry',
  'biology', 'history', 'russian', 'arabic', 'design',
];

// Fan darajalari — har bir fan uchun sub-darajalar
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
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [createdStudentId, setCreatedStudentId] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t, lang, changeLang, SUPPORTED_LANGS } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    if (raw.length < 4) { setPhone('+998 '); return; }
    setPhone(formatPhone(raw));
  };

  const handleSubjectChange = (key) => {
    setSubject(key);
    setSubjectLevel(''); // Fan o'zgarganda darajani tozalash
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
      // Register the student
      const res = await client.post('/auth/register', {
        full_name: fullName.trim(),
        phone: cleanedPhone,
        password,
        subject,
        subject_level: subjectLevel,
      });
      const { access_token, full_name, role } = res.data;
      localStorage.setItem('mp_token', access_token);
      localStorage.setItem('mp_name', full_name);
      localStorage.setItem('mp_role', role);
      // Store subject info
      localStorage.setItem('mp_subject', subject);
      localStorage.setItem('mp_subject_level', subjectLevel);

      // After registration, get the newly created student ID
      const me = await StudentAPI.me();
      const studentId = me.data.id;

      // Try to find an existing group for the selected subject
      const groupsRes = await ReceptionAPI.groups();
      const groups = groupsRes.data;
      const matchingGroup = groups.find(g => g.subject === subject);
      if (matchingGroup) {
        // Enroll student in existing group
        await ReceptionAPI.enroll(studentId, matchingGroup.id);
        alert('O\'quvchi muvaffaqiyatli guruhga qo\'shildi!');
        navigate('/dashboard', { replace: true });
        window.location.reload();
      } else {
        // Open modal to create a new group for this subject
        setCreatedStudentId(studentId);
        setGroupModalOpen(true);
      }
    } catch (err) {
      const st = err.response?.status;
      if (st === 409) setError(t('auth.errPhoneExists'));
      else if (st === 422) setError(t('auth.errInvalidData'));
      else setError(err.response?.data?.detail || t('auth.errConnection'));
    } finally {
      setLoading(false);
    }
  };

  const currentFlag = SUPPORTED_LANGS.find(l => l.code === lang)?.flag || '🇺🇿';
  const levels = SUBJECT_LEVELS[subject] || [];

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
                <span className="brand-feature-icon">🎓</span>
                <span className="brand-feature-text">{t('auth.regFeature1')}</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">📱</span>
                <span className="brand-feature-text">{t('auth.regFeature2')}</span>
              </div>
              <div className="brand-feature">
                <span className="brand-feature-icon">⭐</span>
                <span className="brand-feature-text">{t('auth.regFeature3')}</span>
              </div>
            </div>
          </div>

          <div className="login-form-panel" style={{ overflowY: 'auto', maxHeight: '95vh' }}>
            <div className="login-header">
              <h2>{t('auth.regTitle')}</h2>
              <p>{t('auth.regSubtitle')}</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('auth.fullNameLabel')}</label>
                <input type="text" className="form-control" placeholder={t('auth.fullNamePlaceholder')}
                  value={fullName} onChange={e => setFullName(e.target.value)} autoComplete="name" />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.phoneLabel')}</label>
                <input type="tel" className="form-control" placeholder={t('auth.phonePlaceholder')}
                  value={phone} onChange={handlePhoneChange} autoComplete="tel" />
              </div>

              {/* Fan tanlash */}
              <div className="form-group">
                <label className="form-label">{t('auth.subjectLabel')}</label>
                <div className="subject-grid">
                  {SUBJECT_KEYS.map(key => (
                    <button
                      key={key}
                      type="button"
                      className={`subject-option${subject === key ? ' active' : ''}`}
                      onClick={() => handleSubjectChange(key)}
                    >
                      {t(`subject.${key}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fan darajasi tanlash — faqat fan tanlangandan keyin ko'rinadi */}
              {subject && levels.length > 0 && (
                <div className="form-group">
                  <label className="form-label">{t('auth.levelLabel')}</label>
                  <div className="level-grid">
                    {levels.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        className={`level-option${subjectLevel === lvl.value ? ' active' : ''}`}
                        onClick={() => setSubjectLevel(lvl.value)}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">{t('auth.passwordLabel')}</label>
                <div className="password-wrap">
                  <input type={showPwd ? 'text' : 'password'} className="form-control"
                    placeholder={t('auth.passwordMinHint')}
                    value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                  <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                    {showPwd ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.confirmPasswordLabel')}</label>
                <input type="password" className="form-control" placeholder={t('auth.confirmPasswordPlaceholder')}
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : t('auth.registerBtn')}
              </button>
            </form>

            <div className="login-footer" style={{marginTop: 20}}>
              <p>{t('auth.hasAccount')} <Link to="/login" style={{color: 'var(--primary)', fontWeight: 600}}>{t('auth.loginLink')}</Link></p>
            </div>
          </div>
        </div>
      </div>

      {/* Guruh yaratish modali */}
      <GroupCreationModal
        isOpen={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        studentId={createdStudentId}
        subject={subject}
        onSuccess={() => {
          setGroupModalOpen(false);
          window.location.href = '/dashboard';
        }}
      />
    </>
  );
}
