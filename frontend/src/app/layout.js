'use client';

import { Inter } from 'next/font/google';
import "./globals.css";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';

const inter = Inter({subsets:["latin"]});

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AntdRegistry>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
