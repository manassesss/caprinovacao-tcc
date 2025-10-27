'use client';

import React from 'react';
import { Result, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f2f5'
        }}>
          <Result
            status="500"
            title="Erro no Servidor"
            subTitle="Ops! Algo deu errado. Tente novamente mais tarde."
            extra={[
              <Button 
                key="reload" 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={() => window.location.reload()}
              >
                Recarregar Página
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
      </body>
    </html>
  );
}

