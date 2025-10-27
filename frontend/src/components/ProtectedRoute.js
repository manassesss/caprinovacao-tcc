'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Spin } from 'antd';

// Páginas públicas que não precisam de autenticação
const publicPages = ['/login', '/register', '/forgot-password'];

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se não está autenticado e não está numa página pública, redireciona para login
    if (!loading && !isAuthenticated && !publicPages.includes(pathname)) {
      router.push('/login');
      return;
    }
    
    // Se está autenticado e está numa página de login/registro, redireciona para home
    if (!loading && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // Se não está autenticado e não é página pública, não mostra nada (vai redirecionar)
  if (!isAuthenticated && !publicPages.includes(pathname)) {
    return null;
  }

  // Se está autenticado e está em página de login/registro, não mostra nada (vai redirecionar)
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return null;
  }

  return children;
}

