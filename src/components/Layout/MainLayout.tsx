import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, Badge, Switch } from 'antd';
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
  MenuUnfoldOutlined,
  FileTextOutlined,
  StockOutlined,
  MoonOutlined,
  SunOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { authState, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
      key: '/bills',
      icon: <FileTextOutlined />,
      label: 'Create Bills',
      permission: 'create_bills'
    },
    {
      key: '/stock',
      icon: <StockOutlined />,
      label: 'Stock Management',
      permission: 'manage_stock'
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
        className="glass-surface"
        theme="light"
        width={280}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <motion.div 
          className="flex items-center justify-center h-16 animated-gradient"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Title 
            level={4} 
            className="!text-white !mb-0 font-bold"
            style={{ color: 'white' }}
          >
            {collapsed ? 'AG' : '🌾 AgriERP Pro'}
          </Title>
        </motion.div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none'
          }}
          className="custom-menu"
        />
      </Sider>
      
      <Layout>
        <Header 
          className="glass-nav !p-0 flex items-center justify-between"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="ml-4 text-lg"
                size="large"
              />
            </motion.div>
          </div>
          
          <div className="flex items-center space-x-4 mr-6">
            <Space>
              <Switch
                checked={darkMode}
                onChange={setDarkMode}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                className="bg-primary"
              />
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Badge count={3} size="small">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="flex items-center text-lg"
                    size="large"
                  />
                </Badge>
              </motion.div>
            </Space>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
            >
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer px-4 py-2 rounded-xl glass-surface hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Avatar 
                  src={authState.user?.avatar} 
                  icon={<UserOutlined />}
                  size="default"
                  className="shadow-md"
                />
                <Space direction="vertical" size={0}>
                  <span className="text-sm font-semibold text-gray-800">
                    {authState.user?.name}
                  </span>
                  <span className="text-xs text-gray-600">
                    {authState.user?.role}
                  </span>
                </Space>
              </motion.div>
            </Dropdown>
          </div>
        </Header>
        
        <Content 
          className="m-6 p-8 rounded-2xl animate-fade-in"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;