import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, Badge } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
  SwapOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { authState, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      permission: 'view_dashboard'
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      permission: 'view_products'
    },
    {
      key: '/showrooms',
      icon: <ShopOutlined />,
      label: 'Showrooms',
      permission: 'view_showrooms'
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: 'Orders',
      permission: 'view_orders'
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
      permission: 'view_employees'
    },
    {
      key: '/transfers',
      icon: <SwapOutlined />,
      label: 'Stock Transfers',
      permission: 'view_transfers'
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Reports',
      permission: 'view_reports'
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      permission: 'view_settings'
    }
  ].filter(item => hasPermission(item.permission));

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/settings');
    }
  };

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="ag-sidebar"
        theme="light"
        width={256}
      >
        <div className="flex items-center justify-center h-16 ag-gradient">
          <Title 
            level={4} 
            className="!text-white !mb-0"
            style={{ color: 'white' }}
          >
            {collapsed ? 'AG' : 'AgriERP Pro'}
          </Title>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none"
        />
      </Sider>
      
      <Layout>
        <Header className="ag-header !p-0 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="ml-4"
            />
          </div>
          
          <div className="flex items-center space-x-4 mr-6">
            <Badge count={3} size="small">
              <Button
                type="text"
                icon={<BellOutlined />}
                className="flex items-center"
              />
            </Badge>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <div className="flex items-center space-x-2 cursor-pointer px-3 py-1 rounded-lg hover:bg-gray-50">
                <Avatar 
                  src={authState.user?.avatar} 
                  icon={<UserOutlined />}
                  size="small"
                />
                <Space direction="vertical" size={0}>
                  <span className="text-sm font-medium">
                    {authState.user?.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {authState.user?.role}
                  </span>
                </Space>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="m-6 p-6 bg-white rounded-lg ag-shadow">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;