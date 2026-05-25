import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const ROLE_LABELS = {
  superadmin: '👑 SuperAdmin',
  director: '🏫 Direktor',
  reception: '📋 Qabul xodimi',
  teacher: '📚 O\'qituvchi',
  student: '🎓 O\'quvchi',
};

const NAV_CONFIG = {
  superadmin: [
    { to: 'stats', icon: '📊', label: 'Statistika', section: 'Asosiy' },
    { to: 'directors', icon: '🏫', label: 'Direktorlar', section: 'Boshqaruv' },
    { to: 'all-users', icon: '👥', label: 'Foydalanuvchilar', section: 'Boshqaruv' },
  ],
  director: [
    { to: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Asosiy' },
    { to: 'teachers', icon: '👨‍🏫', label: 'O\'qituvchilar', section: 'Xodimlar' },
    { to: 'courses', icon: '📚', label: 'Kurslar', section: 'O\'quv' },
    { to: 'groups', icon: '👥', label: 'Guruhlar', section: 'O\'quv' },
    { to: 'finance', icon: '💰', label: 'Moliya', section: 'Hisobot' },
  ],
  reception: [
    { to: 'students', icon: '🎓', label: 'O\'quvchilar', section: 'Asosiy' },
    { to: 'enroll', icon: '📋', label: 'Guruhga yozish', section: 'Asosiy' },
    { to: 'payments', icon: '💳', label: 'To\'lovlar', section: 'Moliya' },
  ],
  teacher: [
    { to: 'my-groups', icon: '👥', label: 'Mening guruhlarim', section: 'Asosiy' },
    { to: 'attendance', icon: '✅', label: 'Davomat', section: 'Dars' },
    { to: 'lessons', icon: '📖', label: 'Darslar', section: 'Dars' },
    { to: 'tasks', icon: '📝', label: 'Vazifalar', section: 'Baholash' },
    { to: 'bonuses', icon: '⭐', label: 'Bonuslar', section: 'Baholash' },
    { to: 'materials', icon: '📁', label: 'Materiallar', section: 'Kontent' },
  ],
  student: [
    { to: 'my-groups', icon: '👥', label: 'Guruhlarim', section: 'Asosiy' },
    { to: 'attendance', icon: '✅', label: 'Davomatim', section: 'Asosiy' },
    { to: 'tasks', icon: '📝', label: 'Vazifalarim', section: 'Ta\'lim' },
    { to: 'grades', icon: '🏆', label: 'Baholarim', section: 'Ta\'lim' },
    { to: 'bonuses', icon: '⭐', label: 'Bonuslarim', section: 'Ta\'lim' },
    { to: 'payments', icon: '💳', label: 'To\'lovlarim', section: 'Moliya' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const navItems = NAV_CONFIG[user.role] || [];
  const avatar = user.name ? user.name[0].toUpperCase() : '?';

  const handleLogout = () => {
    if (window.confirm('Tizimdan chiqmoqchimisiz?')) {
      logout();
      navigate('/login', { replace: true });
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

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">🏫</div>
          <div>
            <div className="brand-title">Markaz</div>
            <div className="brand-subtitle">Platformasi v1.0</div>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-card">
            <div className="user-avatar">{avatar}</div>
            <div>
              <div className="user-name">{user.name}</div>
              <div className="user-role-text">{ROLE_LABELS[user.role] || user.role}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((sec, si) => (
            <div key={si}>
              <div className="nav-section-title">{sec.title}</div>
              {sec.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.name}</div>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
