'use client';

import React from 'react';
import { Header } from 'antd/es/layout/layout';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { PiFarmBold } from 'react-icons/pi';
import { Avatar, Dropdown, Typography, Space, Badge } from 'antd';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

const AppHeader = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getUserTypeLabel = () => {
    if (!user) return '';
    if (user.is_admin) return 'Administrador';
    if (user.is_producer) return 'Produtor';
    if (user.is_technical) return 'Técnico';
    if (user.is_coop_manager) return 'Gerente de Cooperativa';
    if (user.is_gov) return 'Governo';
    return 'Usuário';
  };

  const getUserTypeColor = () => {
    if (!user) return 'default';
    if (user.is_admin) return 'red';
    if (user.is_producer) return 'green';
    if (user.is_technical) return 'green';
    if (user.is_coop_manager) return 'green';
    if (user.is_gov) return 'green';
    return 'green';
  };

  const getFirstName = () => {
    if (!user || !user.name) return '';
    return user.name.split(' ')[0];
  };

  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
            {user?.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge color={getUserTypeColor()} />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {getUserTypeLabel()}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            {user?.email}
          </Text>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Meu Perfil',
      onClick: () => router.push('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Sair',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{ position: 'fixed', width: '100%', zIndex: '1', paddingLeft: '16px' }}
      className='!bg-green-600 border-green-700 flex items-center justify-between shadow-md'
    >
      <div className='flex items-center gap-2' style={{ marginLeft: '0' }}>
        <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
          <PiFarmBold className="text-2xl text-green-600" />
        </div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>CAPRINOVAÇÃO</div>
      </div>

      {isAuthenticated && user && (
        <Dropdown 
          menu={{ items: menuItems }} 
          placement="bottomRight" 
          arrow
          trigger={['click']}
        >
          <div className='flex items-center gap-2 cursor-pointer hover:bg-green-700 px-3 py-2 rounded transition-colors'>
            <Text 
              strong 
              style={{ 
                fontSize: '14px',
                color: 'white'
              }}
            >
              {getFirstName()}
            </Text>
            <Avatar
              size={36}
              icon={<UserOutlined />}
              style={{ backgroundColor: 'white', color: '#16a34a' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </Avatar>
          </div>
        </Dropdown>
      )}
    </Header>
  );
};

export default AppHeader;