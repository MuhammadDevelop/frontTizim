import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { StudentAPI } from '../api/client';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, lang, changeLang, SUPPORTED_LANGS } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);

  // Student attendance gate: bugun davomat belgilangan yoki yo'q
  const [attendanceChecked, setAttendanceChecked] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // O'quvchi uchun: bugungi davomatni tekshirish
  useEffect(() => {
    if (user?.role !== 'student') {
      setAttendanceMarked(true);
      setAttendanceChecked(true);
      return;
    }

    // Sessiondan tekshirish
    const todayKey = `mp_attendance_${new Date().toISOString().slice(0, 10)}`;
    if (sessionStorage.getItem(todayKey) === 'done') {
      setAttendanceMarked(true);
      setAttendanceChecked(true);
      return;
    }

    setAttendanceChecked(true);
    setAttendanceMarked(false);
  }, [user]);

  // O'quvchi davomat tugmasini bosganda
  const handleMarkAttendance = () => {
    setAttendanceLoading(true);
    // Davomatni belgilash — session saqlash
    const todayKey = `mp_attendance_${new Date().toISOString().slice(0, 10)}`;
    sessionStorage.setItem(todayKey, 'done');
    setTimeout(() => {
      setAttendanceMarked(true);
      setAttendanceLoading(false);
    }, 800);
  };

  if (!user) return null;

  const isStudent = user.role === 'student';
  const isLocked = isStudent && !attendanceMarked;

  const NAV_CONFIG = {
    superadmin: [
      { to: 'stats', icon: '📊', label: t('nav.stats'), section: t('section.main') },
      { to: 'directors', icon: '🏫', label: t('nav.directors'), section: t('section.management') },
      { to: 'all-users', icon: '👥', label: t('nav.allUsers'), section: t('section.management') },
    ],
    director: [
      { to: 'dashboard', icon: '📊', label: t('nav.dashboard'), section: t('section.main') },
      { to: 'teachers', icon: '👨‍🏫', label: t('nav.teachers'), section: t('section.staff') },
      { to: 'courses', icon: '📚', label: t('nav.courses'), section: t('section.education') },
      { to: 'groups', icon: '👥', label: t('nav.groups'), section: t('section.education') },
      { to: 'finance', icon: '💰', label: t('nav.finance'), section: t('section.report') },
    ],
    reception: [
      { to: 'students', icon: '🎓', label: t('nav.students'), section: t('section.main') },
      { to: 'enroll', icon: '📋', label: t('nav.enroll'), section: t('section.main') },
      { to: 'reception-groups', icon: '👥', label: 'Guruhlar', section: t('section.main') },
      { to: 'payments', icon: '💳', label: t('nav.payments'), section: t('section.finance') },
    ],
    teacher: [
      { to: 'my-groups', icon: '👥', label: t('nav.myGroups'), section: t('section.main') },
      { to: 'attendance', icon: '✅', label: t('nav.attendance'), section: t('section.lesson') },
      { to: 'lessons', icon: '📖', label: t('nav.lessons'), section: t('section.lesson') },
      { to: 'tasks', icon: '📝', label: t('nav.tasks'), section: t('section.grading') },
      { to: 'bonuses', icon: '⭐', label: t('nav.bonuses'), section: t('section.grading') },
      { to: 'materials', icon: '📁', label: t('nav.materials'), section: t('section.content') },
    ],
    student: [
      { to: 'attendance', icon: '✅', label: t('nav.sAttendance'), section: t('section.main'), alwaysOpen: true },
      { to: 'my-groups', icon: '👥', label: t('nav.sMyGroups'), section: t('section.main') },
      { to: 'tasks', icon: '📝', label: t('nav.sTasks'), section: t('section.learning') },
      { to: 'grades', icon: '🏆', label: t('nav.grades'), section: t('section.learning') },
      { to: 'tests', icon: '📋', label: t('nav.tests'), section: t('section.learning') },
      { to: 'bonuses', icon: '⭐', label: t('nav.sBonuses'), section: t('section.learning') },
      { to: 'payments', icon: '💳', label: t('nav.sPayments'), section: t('section.finance') },
      { to: 'profile', icon: '👤', label: t('nav.profile'), section: t('section.account') },
    ],
  };

  const navItems = NAV_CONFIG[user.role] || [];
  const avatar = user.name ? user.name[0].toUpperCase() : '?';
  const roleLabel = t(`role.${user.role}`) || user.role;

  const handleLogout = () => {
    if (window.confirm(t('app.logoutConfirm'))) {
      logout();
      window.location.href = '/login';
    }
  };

  // Group nav items by section
  const sections = [];
  let lastSection = null;
  navItems.forEach(item => {
    if (item.section !== lastSection) {
      sections.push({ title: item.section, items: [] });
      lastSection = item.section;
    }
    sections[sections.length - 1].items.push(item);
  });

  const currentLang = SUPPORTED_LANGS.find(l => l.code === lang) || SUPPORTED_LANGS[0];

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">🏫</div>
          <div>
            <div className="brand-title">{t('app.name')}</div>
            <div className="brand-subtitle">{t('app.subtitle')}</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="user-avatar">{avatar}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role-text">{roleLabel}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((sec, si) => (
            <div key={si}>
              <div className="nav-section-title">{sec.title}</div>
              {sec.items.map(item => {
                const locked = isLocked && !item.alwaysOpen;
                return (
                  <NavLink
                    key={item.to}
                    to={locked ? '#' : item.to}
                    className={({ isActive }) => `nav-item${isActive && !locked ? ' active' : ''}${locked ? ' nav-item-locked' : ''}`}
                    onClick={(e) => {
                      if (locked) {
                        e.preventDefault();
                        return;
                      }
                      setSidebarOpen(false);
                    }}
                    title={locked ? 'Avval davomatni belgilang!' : ''}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {locked && <span className="nav-lock-icon">🔒</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout} type="button">
            <span>🚪</span>
            <span>{t('app.logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>
          <div className="topbar-actions">
            {/* Language Switcher */}
            <div className="lang-switcher" ref={langRef}>
              <button className="topbar-btn" onClick={() => setLangOpen(!langOpen)} title="Language">
                <span>{currentLang.flag}</span>
                <span className="lang-code">{lang.toUpperCase()}</span>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {SUPPORTED_LANGS.map(l => (
                    <button
                      key={l.code}
                      className={`lang-option ${l.code === lang ? 'active' : ''}`}
                      onClick={() => { changeLang(l.code); setLangOpen(false); }}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang && <span className="lang-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button className="topbar-btn theme-toggle-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
              <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            <span className="topbar-username">{user.name}</span>
          </div>
        </header>
        <div className="page-content">
          {/* Student attendance gate overlay */}
          {isLocked && (
            <div className="attendance-gate">
              <div className="attendance-gate-card">
                <div className="attendance-gate-icon">✅</div>
                <h2>Davomatni belgilang!</h2>
                <p>Tizimning boshqa bo'limlariga kirish uchun avval bugungi davomatingizni tasdiqlang.</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleMarkAttendance}
                  disabled={attendanceLoading}
                  style={{ marginTop: 16, minWidth: 200 }}
                >
                  {attendanceLoading ? <span className="spinner" /> : '✅ Davomatni belgilash'}
                </button>
                <p style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          {/* Oddiy kontent — faqat davomat belgilangandan keyin */}
          {!isLocked && <Outlet />}
        </div>
      </main>
    </div>
  );
}
