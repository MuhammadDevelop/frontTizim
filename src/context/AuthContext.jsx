import { createContext, useContext, useState, useEffect } from 'react';
import { AuthAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('mp_token');
    const name = localStorage.getItem('mp_name');
    const role = localStorage.getItem('mp_role');
    if (token && name && role) {
      setUser({ token, name, role });
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await AuthAPI.login(phone, password);
    const { access_token, full_name, role } = res.data;
    localStorage.setItem('mp_token', access_token);
    localStorage.setItem('mp_name', full_name);
    localStorage.setItem('mp_role', role);
    setUser({ token: access_token, name: full_name, role });
    return { role };
  };

  const logout = () => {
    localStorage.removeItem('mp_token');
    localStorage.removeItem('mp_name');
    localStorage.removeItem('mp_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
