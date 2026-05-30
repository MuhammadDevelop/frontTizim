import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './layouts/DashboardLayout';
import { lazy, Suspense } from 'react';

// ─── Lazy imports ────────────────────────────────────────

// Director
const DirectorDashboard = lazy(() => import('./pages/director/DirectorDashboard'));
const TeachersPage = lazy(() => import('./pages/director/TeachersPage'));
const CoursesPage = lazy(() => import('./pages/director/CoursesPage'));
const GroupsPage = lazy(() => import('./pages/director/GroupsPage'));
const FinancePage = lazy(() => import('./pages/director/FinancePage'));

// Reception
const StudentsPage = lazy(() => import('./pages/reception/StudentsPage'));
const EnrollPage = lazy(() => import('./pages/reception/EnrollPage'));
const RPaymentsPage = lazy(() => import('./pages/reception/PaymentsPage'));
const RGroupsPage = lazy(() => import('./pages/reception/GroupsPage'));

// Teacher
const TMyGroupsPage = lazy(() => import('./pages/teacher/MyGroupsPage'));
const TAttendancePage = lazy(() => import('./pages/teacher/AttendancePage'));
const LessonsPage = lazy(() => import('./pages/teacher/LessonsPage'));
const TTasksPage = lazy(() => import('./pages/teacher/TasksPage'));
const TBonusesPage = lazy(() => import('./pages/teacher/BonusesPage'));
const MaterialsPage = lazy(() => import('./pages/teacher/MaterialsPage'));

// Student
const SMyGroupsPage = lazy(() => import('./pages/student/MyGroupsPage'));
const SAttendancePage = lazy(() => import('./pages/student/AttendancePage'));
const STasksPage = lazy(() => import('./pages/student/TasksPage'));
const GradesPage = lazy(() => import('./pages/student/GradesPage'));
const SBonusesPage = lazy(() => import('./pages/student/BonusesPage'));
const SPaymentsPage = lazy(() => import('./pages/student/PaymentsPage'));
const STestsPage = lazy(() => import('./pages/student/TestsPage'));
const SProfilePage = lazy(() => import('./pages/student/ProfilePage'));

// SuperAdmin
const StatsPage = lazy(() => import('./pages/superadmin/StatsPage'));
const DirectorsPage = lazy(() => import('./pages/superadmin/DirectorsPage'));
const UsersPage = lazy(() => import('./pages/superadmin/UsersPage'));

// ─── Loading fallback ─────────────────────────────────────
const Loading = () => (
  <div className="loading-overlay">
    <div className="spinner spinner-lg" />
    <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
  </div>
);

// ─── Protected Route ──────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ─── Role-based component selector ────────────────────────
function RoleSwitch({ teacher, student, fallback }) {
  const { user } = useAuth();
  if (user?.role === 'teacher') return teacher;
  if (user?.role === 'student') return student;
  return fallback || teacher || student;
}

// ─── Role-based default redirect ──────────────────────────
function RoleRedirect() {
  const { user } = useAuth();
  const defaults = {
    superadmin: 'stats',
    director: 'dashboard',
    reception: 'students',
    teacher: 'my-groups',
    student: 'my-groups',
  };
  return <Navigate to={defaults[user?.role] || 'dashboard'} replace />;
}

// ─── App ──────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardLayout /></ProtectedRoute>
            }>
              <Route index element={<RoleRedirect />} />

              {/* Director */}
              <Route path="dashboard" element={<DirectorDashboard />} />
              <Route path="teachers" element={<TeachersPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="finance" element={<FinancePage />} />

              {/* Reception */}
              <Route path="students" element={<StudentsPage />} />
              <Route path="enroll" element={<EnrollPage />} />
              <Route path="reception-groups" element={<RGroupsPage />} />

              {/* Shared paths — role-based switching */}
              <Route path="my-groups" element={
                <RoleSwitch
                  teacher={<TMyGroupsPage />}
                  student={<SMyGroupsPage />}
                />
              } />
              <Route path="attendance" element={
                <RoleSwitch
                  teacher={<TAttendancePage />}
                  student={<SAttendancePage />}
                />
              } />
              <Route path="tasks" element={
                <RoleSwitch
                  teacher={<TTasksPage />}
                  student={<STasksPage />}
                />
              } />
              <Route path="bonuses" element={
                <RoleSwitch
                  teacher={<TBonusesPage />}
                  student={<SBonusesPage />}
                />
              } />
              <Route path="payments" element={
                <RoleSwitch
                  teacher={<RPaymentsPage />}
                  student={<SPaymentsPage />}
                  fallback={<RPaymentsPage />}
                />
              } />

              {/* Teacher only */}
              <Route path="lessons" element={<LessonsPage />} />
              <Route path="materials" element={<MaterialsPage />} />

              {/* Student only */}
              <Route path="grades" element={<GradesPage />} />
              <Route path="tests" element={<STestsPage />} />
              <Route path="profile" element={<SProfilePage />} />

              {/* SuperAdmin */}
              <Route path="stats" element={<StatsPage />} />
              <Route path="directors" element={<DirectorsPage />} />
              <Route path="all-users" element={<UsersPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
