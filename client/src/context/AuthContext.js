import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const validateUser = async () => {
      try {
        const data = await authService.getProfile();
        setUser({ username: data.username });
      } catch (err) {
        authService.logout();
        localStorage.removeItem('username');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, []);

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser({ username: data.username });
    localStorage.setItem('username', data.username);
    return data;
  };

  const register = async (username, password) => {
    const data = await authService.register(username, password);
    setUser({ username: data.username });
    localStorage.setItem('username', data.username);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
