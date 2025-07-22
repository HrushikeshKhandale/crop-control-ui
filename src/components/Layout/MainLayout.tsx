import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button, Badge, Switch, Tooltip } from 'antd';
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
  SunOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { authState, logout, hasPermission } = useAuth();
  const { actualTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      permission: 'view_dashboard',
      className: 'tour-dashboard'
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      permission: 'view_products',
      className: 'tour-products'
    },
    {
      key: '/showrooms',
      icon: <ShopOutlined />,
      label: 'Showrooms',
      permission: 'view_showrooms'
    },
    {
      key: '/orders',
      icon: <ShoppingCartOutlined />,
      label: 'Orders',
      permission: 'view_orders',
      className: 'tour-orders'
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
      permission: 'view_reports',
      className: 'tour-reports'
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
      key: 'help',
      label: 'Start Tour',
      icon: <QuestionCircleOutlined />
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
    } else if (key === 'help') {
      // Restart tour
      if ((window as any).startAgriTour) {
        (window as any).startAgriTour();
      }
    }
  };

  return (
    <Layout className="min-h-screen">
      <AnimatePresence>
        <motion.div
          initial={{ x: -256, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Sider 
            trigger={null} 
            collapsible 
            collapsed={collapsed}
            className="ag-sidebar tour-sidebar shadow-xl"
            theme="light"
            width={280}
            collapsedWidth={80}
          >
            <motion.div 
              className="flex items-center justify-center h-20 ag-gradient relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-90"></div>
              <div className="relative z-10 flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-emerald-600 font-bold text-lg">🌾</span>
                </div>
                {!collapsed && (
                  <div>
                    <Title 
                      level={4} 
                      className="!text-white !mb-0 font-bold tracking-wide"
                    >
                      AgriERP Pro
                    </Title>
                    <Text className="text-green-100 text-xs">
                      Agriculture Management
                    </Text>
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="p-4">
              <Menu
                theme="light"
                mode="inline"
                selectedKeys={[location.pathname]}
                items={menuItems.map(item => ({
                  ...item,
                  label: (
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center ${item.className || ''}`}
                    >
                      <span className="flex-1">{item.label}</span>
                    </motion.div>
                  )
                }))}
                onClick={handleMenuClick}
                className="border-none bg-transparent"
                style={{
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </Sider>
        </motion.div>
      </AnimatePresence>
      
      <Layout>
        <Header className="ag-navbar !p-0 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className="ml-6 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                size="large"
              />
            </motion.div>
            <div className="ml-4 hidden sm:block">
              <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {authState.user?.name?.split(' ')[0]}!
              </Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mr-6">
            <Tooltip title={`Switch to ${actualTheme === 'light' ? 'dark' : 'light'} mode`}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="tour-theme-toggle"
              >
                <Switch
                  checked={actualTheme === 'dark'}
                  onChange={toggleTheme}
                  checkedChildren={<MoonOutlined />}
                  unCheckedChildren={<SunOutlined />}
                  className="bg-gray-200 dark:bg-gray-700"
                />
              </motion.div>
            </Tooltip>

            <Tooltip title="Notifications">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="tour-notifications"
              >
                <Badge count={3} size="small" className="cursor-pointer">
                  <Button
                    type="text"
                    icon={<BellOutlined />}
                    className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                    size="large"
                  />
                </Badge>
              </motion.div>
            </Tooltip>
            
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick
              }}
              placement="bottomRight"
              trigger={['click']}
            >
              <motion.div 
                className="flex items-center space-x-3 cursor-pointer px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 tour-profile"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar 
                  src={authState.user?.avatar} 
                  icon={<UserOutlined />}
                  size={40}
                  className="border-2 border-white shadow-md"
                />
                <Space direction="vertical" size={0} className="hidden sm:block">
                  <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {authState.user?.name}
                  </Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">
                    {authState.user?.role}
                  </Text>
                </Space>
              </motion.div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;