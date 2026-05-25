import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Har so'rovda JWT token qo'shish
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('mp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 xatosida logout
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ═══ AUTH ═══
export const AuthAPI = {
  login: (phone, password) => client.post('/auth/login', { phone, password }),
  register: (data) => client.post('/auth/register', data),
  subjects: () => client.get('/auth/subjects'),
};

// ═══ SUPERADMIN ═══
export const SuperAdminAPI = {
  stats: () => client.get('/superadmin/stats'),
  directors: () => client.get('/superadmin/directors'),
  allUsers: (role) => client.get(`/superadmin/users${role ? `?role=${role}` : ''}`),
  createDir: (data) => client.post('/superadmin/directors', data),
  updateDir: (id, data) => client.put(`/superadmin/directors/${id}`, data),
  deleteDir: (id) => client.delete(`/superadmin/directors/${id}`),
  toggleDir: (id) => client.patch(`/superadmin/directors/${id}/toggle-active`),
};

// ═══ DIRECTOR ═══
export const DirectorAPI = {
  dashboard: () => client.get('/director/dashboard'),
  teachers: () => client.get('/director/teachers'),
  createTeacher: (data) => client.post('/director/teachers', data),
  updateTeacher: (id, data) => client.put(`/director/teachers/${id}`, data),
  deleteTeacher: (id) => client.delete(`/director/teachers/${id}`),
  toggleTeacher: (id) => client.patch(`/director/teachers/${id}/toggle-active`),
  courses: () => client.get('/director/courses'),
  createCourse: (data) => client.post('/director/courses', data),
  updateCourse: (id, data) => client.put(`/director/courses/${id}`, data),
  deleteCourse: (id) => client.delete(`/director/courses/${id}`),
  groups: (courseId) => client.get(`/director/groups${courseId ? `?course_id=${courseId}` : ''}`),
  createGroup: (data) => client.post('/director/groups', data),
  updateGroup: (id, data) => client.put(`/director/groups/${id}`, data),
  financeSummary: (month) => client.get(`/director/finance/summary?month=${month}`),
  payments: (sid, month) => client.get(`/director/finance/payments?${sid ? `student_id=${sid}&` : ''}${month ? `month=${month}` : ''}`),
  createPayment: (data) => client.post('/director/finance/payments', data),
  salaries: (tid, month) => client.get(`/director/finance/salaries?${tid ? `teacher_id=${tid}&` : ''}${month ? `month=${month}` : ''}`),
  createSalary: (data) => client.post('/director/finance/salaries', data),
};

// ═══ RECEPTION ═══
export const ReceptionAPI = {
  students: (skip, limit) => client.get(`/reception/students?skip=${skip || 0}&limit=${limit || 50}`),
  getStudent: (id) => client.get(`/reception/students/${id}`),
  createStudent: (data) => client.post('/reception/students', data),
  updateStudent: (id, data) => client.put(`/reception/students/${id}`, data),
  toggleStudent: (id) => client.patch(`/reception/students/${id}/toggle-active`),
  enroll: (sid, gid) => client.post(`/reception/students/${sid}/enroll/${gid}`),
  unenroll: (sid, gid) => client.delete(`/reception/students/${sid}/unenroll/${gid}`),
  groups: () => client.get('/reception/groups'),
  payments: (sid, month) => client.get(`/reception/payments?${sid ? `student_id=${sid}&` : ''}${month ? `month=${month}` : ''}`),
  createPayment: (data) => client.post('/reception/payments', data),
  updatePayment: (id, data) => client.put(`/reception/payments/${id}`, data),
};

// ═══ TEACHER ═══
export const TeacherAPI = {
  myGroups: () => client.get('/teacher/my-groups'),
  groupStudents: (gid) => client.get(`/teacher/groups/${gid}/students`),
  attendance: (gid, df, dt) => client.get(`/teacher/attendance/group/${gid}${df ? `?date_from=${df}` : ''}${dt ? `&date_to=${dt}` : ''}`),
  markAttendance: (data) => client.post('/teacher/attendance', data),
  lessons: (gid) => client.get(`/teacher/lessons/group/${gid}`),
  createLesson: (data) => client.post('/teacher/lessons', data),
  tasks: (gid) => client.get(`/teacher/tasks/group/${gid}`),
  createTask: (data) => client.post('/teacher/tasks', data),
  gradeTask: (stid, data) => client.post(`/teacher/student-tasks/${stid}/grade`, data),
  bonuses: (sid) => client.get(`/teacher/bonuses/student/${sid}`),
  addBonus: (data) => client.post('/teacher/bonuses', data),
  materials: (cid) => client.get(`/teacher/materials/course/${cid}`),
  addMaterial: (data) => client.post('/teacher/materials', data),
};

// ═══ STUDENT ═══
export const StudentAPI = {
  me: () => client.get('/student/me'),
  updateMe: (data) => client.put('/student/me', data),
  myGroups: () => client.get('/student/my-groups'),
  attendance: () => client.get('/student/attendance'),
  tasks: () => client.get('/student/tasks'),
  gradesSummary: () => client.get('/student/grades/summary'),
  bonuses: () => client.get('/student/bonuses'),
  payments: () => client.get('/student/payments'),
};

export default client;
