'use client';

import { Layout } from 'antd';
import AppHeader from '@/components/Header';
import Sider from 'antd/es/layout/Sider';
import AppSideMenu from '@/components/AppSideMenu';
import { Content } from 'antd/es/layout/layout';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

// Páginas que não devem ter o layout padrão (header e menu lateral)
const noLayoutPages = ['/login', '/register', '/forgot-password'];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const isNoLayoutPage = noLayoutPages.includes(pathname);

  return (
    <ProtectedRoute>
      {isNoLayoutPage ? (
        // Páginas sem layout (login, registro, etc)
        children
      ) : (
        // Páginas com layout padrão
        <Layout>
          <AppHeader />
          <Layout hasSider>
            <Sider
              theme="light"
              style={{
                position: 'fixed',
                top: '64px',
                left: '0',
                borderRight: '1px solid #e5e7eb',
                height: 'calc(100vh - 64px)',
                backgroundColor: '#f9fafb',
                overflowY: 'auto',
                overflowX: 'hidden',
              }}
            >
              <AppSideMenu />
            </Sider>
            <Layout style={{ marginLeft: '200px', marginTop: '50px' }}>
              <Content style={{ padding: '16px', minHeight: 'calc(100vh - 64px)' }}>
                {children}
              </Content>
            </Layout>
          </Layout>
        </Layout>
      )}
    </ProtectedRoute>
  );
}

