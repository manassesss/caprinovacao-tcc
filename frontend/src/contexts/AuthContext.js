'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '@/services/api';
import { message } from 'antd';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se há token salvo e carrega dados do usuário
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Busca dados do usuário
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      // Se der erro, limpa o token
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      setLoading(true);
      
      // Faz login
      const response = await apiLogin(email, password);
      
      // Salva token
      localStorage.setItem('token', response.access_token);
      
      // Busca dados do usuário
      const userData = await getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      
      message.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      console.error('Erro no login:', error);
      message.error(error.message || 'Erro ao fazer login');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  async function register(userData) {
    try {
      setLoading(true);
      
      // Registra usuário
      await apiRegister(userData);
      
      // Faz login automático após registro
      const loginResult = await login(userData.email, userData.password);
      
      if (loginResult.success) {
        message.success('Cadastro realizado com sucesso!');
      }
      
      return loginResult;
    } catch (error) {
      console.error('Erro no registro:', error);
      message.error(error.message || 'Erro ao fazer cadastro');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    message.info('Você saiu da sua conta');
  }

  async function updateUser(newData) {
    setUser(prev => ({ ...prev, ...newData }));
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
}

export default AuthContext;

