'use client';

import React from 'react';
import { Result, Button } from 'antd';
import { useRouter } from 'next/navigation';
import { HomeOutlined, LeftOutlined } from '@ant-design/icons';

export default function NotFound() {
  const router = useRouter();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Result
        status="404"
        title="404"
        subTitle="Desculpe, a página que você está procurando não existe."
        extra={[
          <Button 
            key="back" 
            icon={<LeftOutlined />} 
            onClick={() => router.back()}
          >
            Voltar
          </Button>,
          <Button 
            key="home" 
            type="primary" 
            icon={<HomeOutlined />} 
            onClick={() => router.push('/')}
          >
            Ir para Home
          </Button>,
        ]}
      />
    </div>
  );
}

