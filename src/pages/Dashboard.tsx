import React from 'react';
import { Card, Row, Col, Statistic, Typography, Progress, Table, Tag, Space } from 'antd';
import {
  ShoppingOutlined,
  ShopOutlined,
  TeamOutlined,
  DollarOutlined,
  AlertOutlined
} from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { 
    products, 
    showrooms, 
    employees, 
    orders, 
    getTotalStockValue,
    transfers 
  } = useData();
  const { authState } = useAuth();

  // Calculate statistics
  const totalProducts = products.length;
  const totalShowrooms = showrooms.length;
  const totalEmployees = employees.length;
  const totalOrders = orders.length;
  const totalStockValue = getTotalStockValue();
  const pendingOrders = orders.filter(order => order.status === 'Pending').length;
  const pendingTransfers = transfers.filter(transfer => transfer.status === 'Pending').length;

  // Recent orders for table
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Stock data for chart
  const stockData = showrooms.map(showroom => ({
    name: showroom.name.split(' ')[0], // Short name for chart
    value: getTotalStockValue(showroom.id)
  }));

  // Category distribution for pie chart
  const categoryData = [
    { name: 'Seeds', value: products.filter(p => p.category === 'Seeds').length, color: '#8884d8' },
    { name: 'Fertilizer', value: products.filter(p => p.category === 'Fertilizer').length, color: '#82ca9d' },
    { name: 'Pesticide', value: products.filter(p => p.category === 'Pesticide').length, color: '#ffc658' },
    { name: 'Equipment', value: products.filter(p => p.category === 'Equipment').length, color: '#ff7c7c' }
  ];

  // Low stock alerts
  const lowStockProducts = products.filter(product => {
    const totalStock = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
    return totalStock < 50; // Alert threshold
  });

  const orderColumns = [
    {
      title: 'Order #',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName'
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (value: number) => `₹${value.toFixed(2)}`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'Delivered' ? 'green' : 
          status === 'Approved' ? 'blue' : 'orange'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('en-IN')
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1">Dashboard</Title>
          <Text type="secondary">
            Welcome back, {authState.user?.name}! Here's what's happening in your agriculture business.
          </Text>
        </div>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ag-card">
            <Statistic
              title="Total Products"
              value={totalProducts}
              prefix={<ShoppingOutlined className="text-blue-500" />}
              valueStyle={{ color: 'hsl(var(--primary))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ag-card">
            <Statistic
              title="Showrooms"
              value={totalShowrooms}
              prefix={<ShopOutlined className="text-green-500" />}
              valueStyle={{ color: 'hsl(var(--success))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ag-card">
            <Statistic
              title="Employees"
              value={totalEmployees}
              prefix={<TeamOutlined className="text-purple-500" />}
              valueStyle={{ color: 'hsl(var(--info))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="ag-card">
            <Statistic
              title="Stock Value"
              value={totalStockValue}
              prefix={<DollarOutlined className="text-orange-500" />}
              precision={0}
              suffix="₹"
              valueStyle={{ color: 'hsl(var(--warning))' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts and Quick Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="ag-card">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text>Pending Orders</Text>
                <Tag color="orange">{pendingOrders}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text>Pending Transfers</Text>
                <Tag color="blue">{pendingTransfers}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <Text>Low Stock Items</Text>
                <Tag color="red">{lowStockProducts.length}</Tag>
              </div>
              <Progress 
                percent={Math.round((orders.filter(o => o.status === 'Delivered').length / totalOrders) * 100)} 
                strokeColor="hsl(var(--success))"
                format={(percent) => `${percent}% Delivered`}
              />
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={16}>
          <Card title="Stock Value by Showroom" className="ag-card">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Stock Value']} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Charts and Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Product Categories" className="ag-card">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <AlertOutlined />
                Low Stock Alert
              </Space>
            } 
            className="ag-card"
          >
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {lowStockProducts.length === 0 ? (
                <Text type="secondary">All products are well stocked!</Text>
              ) : (
                lowStockProducts.map(product => {
                  const totalStock = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
                  return (
                    <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <Text strong>{product.name}</Text>
                        <div className="text-xs text-gray-500">{product.category}</div>
                      </div>
                      <Tag color="red">{totalStock} {product.unit}</Tag>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Orders Table */}
      <Card title="Recent Orders" className="ag-card">
        <Table
          columns={orderColumns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;