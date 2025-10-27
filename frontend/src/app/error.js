'use client';

import React from 'react';
import { Result, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

export default function Error({ error, reset }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Result
        status="500"
        title="Oops! Algo deu errado"
        subTitle={error.message || "Ocorreu um erro inesperado. Tente novamente."}
        extra={[
          <Button 
            key="reload" 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={() => reset()}
          >
            Tentar Novamente
          </Button>,
          <Button 
            key="home" 
            icon={<HomeOutlined />} 
            onClick={() => window.location.href = '/'}
          >
            Ir para Home
          </Button>,
        ]}
      />
    </div>
  );
}

