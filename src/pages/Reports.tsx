import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Statistic, 
  Select, 
  DatePicker,
  Table,
  Tag,
  Button,
  Space,
  Tabs,
  Input,
  Radio,
  Divider,
  Progress,
  Alert
} from 'antd';
import { 
  BarChartOutlined,
  DollarOutlined,
  ShoppingOutlined,
  TeamOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
  SearchOutlined,
  FileTextOutlined,
  RiseOutlined,
  PieChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';
import dayjs from 'dayjs';
import { generateReportFromElement } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const Reports: React.FC = () => {
  const { 
    products, 
    showrooms, 
    employees, 
    orders, 
    transfers,
    getTotalStockValue,
    salaryRecords 
  } = useData();
  const { authState } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState('all');
  const [reportType, setReportType] = useState('summary');
  const [searchText, setSearchText] = useState('');

  // Filter data based on user role
  const userShowrooms = authState.user?.role === 'Super Admin' 
    ? showrooms 
    : showrooms.filter(s => s.id === authState.showroomId);

  const userOrders = authState.user?.role === 'Super Admin' 
    ? orders 
    : orders.filter(o => o.showroomId === authState.showroomId);

  const userEmployees = authState.user?.role === 'Super Admin' 
    ? employees 
    : employees.filter(e => e.showroomId === authState.showroomId);

  // Calculate date range based on period
  const getDateRange = () => {
    if (dateRange) {
      return [dateRange[0].toDate(), dateRange[1].toDate()];
    }
    
    const now = new Date();
    let startDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return [startDate, now];
  };

  const [startDate, endDate] = getDateRange();

  // Filter orders by date range
  const filteredOrders = userOrders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= startDate && orderDate <= endDate;
  });

  // Sales by showroom data
  const salesByShowroom = userShowrooms.map(showroom => {
    const showroomOrders = filteredOrders.filter(order => order.showroomId === showroom.id);
    const totalSales = showroomOrders.reduce((sum, order) => sum + order.total, 0);
    const orderCount = showroomOrders.length;
    
    return {
      name: showroom.name.split(' ')[0], // Short name for chart
      sales: totalSales,
      orders: orderCount,
      stockValue: getTotalStockValue(showroom.id)
    };
  });

  // Product category sales
  const categorySales = ['Seeds', 'Fertilizer', 'Pesticide', 'Equipment'].map(category => {
    const categoryProducts = products.filter(p => p.category === category);
    const categoryOrders = filteredOrders.flatMap(order => 
      order.items.filter(item => 
        categoryProducts.some(p => p.id === item.productId)
      )
    );
    
    const totalSales = categoryOrders.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    
    return {
      name: category,
      sales: totalSales,
      count: categoryOrders.length
    };
  });

  // Monthly sales trend (last 6 months)
  const monthlySales = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
    
    const monthOrders = userOrders.filter(order => 
      order.createdAt.startsWith(monthKey)
    );
    
    return {
      month: date.toLocaleDateString('en-IN', { month: 'short' }),
      sales: monthOrders.reduce((sum, order) => sum + order.total, 0),
      orders: monthOrders.length
    };
  });

  // Top selling products
  const topProducts = products.map(product => {
    const productOrders = filteredOrders.flatMap(order => 
      order.items.filter(item => item.productId === product.id)
    );
    
    const totalQuantity = productOrders.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = productOrders.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      quantitySold: totalQuantity,
      revenue: totalRevenue,
      stockLeft: Object.values(product.stock).reduce((sum, qty) => sum + qty, 0)
    };
  })
  .filter(product => product.quantitySold > 0)
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 10);

  // Summary statistics
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalEmployees = userEmployees.length;
  const monthlyPayroll = userEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  const exportToPDF = async () => {
    try {
      await generateReportFromElement('reports-dashboard', 'AgriERP_Report.pdf');
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  const topProductColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <div className="font-medium">{text}</div>
          <Tag className={`category-${record.category.toLowerCase()}`}>
            {record.category}
          </Tag>
        </div>
      )
    },
    {
      title: 'Qty Sold',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      render: (qty: number) => qty.toLocaleString()
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (revenue: number) => `₹${revenue.toLocaleString()}`
    },
    {
      title: 'Stock Left',
      dataIndex: 'stockLeft',
      key: 'stockLeft',
      render: (stock: number) => (
        <Tag color={stock < 50 ? 'red' : stock < 200 ? 'orange' : 'green'}>
          {stock.toLocaleString()}
        </Tag>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1 text-primary">
            <BarChartOutlined className="mr-2" />
            Advanced Reports & Analytics
          </Title>
          <p className="text-muted-foreground">Comprehensive business insights and performance metrics</p>
        </div>
        <Space>
          <Button 
            icon={<FilterOutlined />}
            onClick={() => setActiveTab('filters')}
          >
            Advanced Filters
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            onClick={exportToPDF}
          >
            Export PDF
          </Button>
          <Button 
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </Space>
      </div>

      {/* Enhanced Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={6}>
              <Text strong>Module: </Text>
              <Select
                value={selectedModule}
                onChange={setSelectedModule}
                style={{ width: '100%' }}
                className="mt-1"
              >
                <Option value="all">All Modules</Option>
                <Option value="products">Products</Option>
                <Option value="orders">Orders</Option>
                <Option value="showrooms">Showrooms</Option>
                <Option value="employees">Employees</Option>
                <Option value="transfers">Transfers</Option>
                <Option value="customers">Customers</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Text strong>Time Period: </Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: '100%' }}
                className="mt-1"
              >
                <Option value="week">Last Week</Option>
                <Option value="month">Last Month</Option>
                <Option value="quarter">Last Quarter</Option>
                <Option value="year">Last Year</Option>
                <Option value="custom">Custom Range</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Text strong>Report Type: </Text>
              <Select
                value={reportType}
                onChange={setReportType}
                style={{ width: '100%' }}
                className="mt-1"
              >
                <Option value="summary">Summary</Option>
                <Option value="detailed">Detailed</Option>
                <Option value="comparison">Comparison</Option>
                <Option value="trends">Trends</Option>
              </Select>
            </Col>
            <Col xs={24} md={6}>
              <Text strong>Custom Range: </Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '100%' }}
                className="mt-1"
                disabled={selectedPeriod !== 'custom'}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search in reports..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={12}>
              <Radio.Group value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <Radio.Button value="summary">Summary</Radio.Button>
                <Radio.Button value="detailed">Detailed</Radio.Button>
                <Radio.Button value="trends">Trends</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Reports Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
            <TabPane 
              tab={<span><RiseOutlined />Overview</span>} 
              key="overview"
            >
              <div id="reports-dashboard">
                {/* Key Metrics */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="glass-card text-center">
                        <Statistic
                          title="Total Revenue"
                          value={totalRevenue}
                          prefix={<DollarOutlined />}
                          precision={0}
                          formatter={(value) => `₹${Number(value).toLocaleString()}`}
                          valueStyle={{ color: 'hsl(var(--success))', fontSize: '1.5rem' }}
                        />
                        <Progress 
                          percent={75} 
                          showInfo={false} 
                          strokeColor="hsl(var(--success))"
                          className="mt-2"
                        />
                      </Card>
                    </motion.div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="glass-card text-center">
                        <Statistic
                          title="Total Orders"
                          value={totalOrders}
                          prefix={<ShoppingOutlined />}
                          valueStyle={{ color: 'hsl(var(--primary))', fontSize: '1.5rem' }}
                        />
                        <Progress 
                          percent={60} 
                          showInfo={false} 
                          strokeColor="hsl(var(--primary))"
                          className="mt-2"
                        />
                      </Card>
                    </motion.div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="glass-card text-center">
                        <Statistic
                          title="Avg Order Value"
                          value={averageOrderValue}
                          precision={0}
                          formatter={(value) => `₹${Number(value).toLocaleString()}`}
                          valueStyle={{ color: 'hsl(var(--info))', fontSize: '1.5rem' }}
                        />
                        <Progress 
                          percent={80} 
                          showInfo={false} 
                          strokeColor="hsl(var(--info))"
                          className="mt-2"
                        />
                      </Card>
                    </motion.div>
                  </Col>
                  <Col xs={12} sm={6}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="glass-card text-center">
                        <Statistic
                          title="Monthly Payroll"
                          value={monthlyPayroll}
                          prefix={<TeamOutlined />}
                          precision={0}
                          formatter={(value) => `₹${Number(value).toLocaleString()}`}
                          valueStyle={{ color: 'hsl(var(--warning))', fontSize: '1.5rem' }}
                        />
                        <Progress 
                          percent={45} 
                          showInfo={false} 
                          strokeColor="hsl(var(--warning))"
                          className="mt-2"
                        />
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* Charts Row 1 */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24} lg={12}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card title={<span><BarChartOutlined className="mr-2" />Sales by Showroom</span>} className="glass-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={salesByShowroom}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card title={<span><PieChartOutlined className="mr-2" />Category Performance</span>} className="glass-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={categorySales}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="sales"
                            >
                              {categorySales.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* Charts Row 2 */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Card title={<span><LineChartOutlined className="mr-2" />Sales Trend (Last 6 Months)</span>} className="glass-card">
                        <ResponsiveContainer width="100%" height={350}>
                          <ComposedChart data={monthlySales}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="month" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip 
                              formatter={(value, name) => [
                                name === 'sales' ? `₹${Number(value).toLocaleString()}` : value,
                                name === 'sales' ? 'Sales' : 'Orders'
                              ]}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--primary))" name="Sales (₹)" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--warning))" strokeWidth={3} name="Orders" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* Top Products Table */}
                <Row gutter={[16, 16]} className="mb-6">
                  <Col xs={24}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Card title={<span><FileTextOutlined className="mr-2" />Top Selling Products</span>} className="glass-card">
                        <Table
                          columns={topProductColumns}
                          dataSource={topProducts}
                          rowKey="id"
                          pagination={{
                            pageSize: 5,
                            showSizeChanger: false
                          }}
                          size="middle"
                        />
                      </Card>
                    </motion.div>
                  </Col>
                </Row>

                {/* Stock Value by Showroom */}
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <Card title={<span><BarChartOutlined className="mr-2" />Stock Value Analysis</span>} className="glass-card">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={salesByShowroom}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]}
                              contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                border: 'none',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="stockValue" fill="hsl(var(--info))" name="Stock Value (₹)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sales" fill="hsl(var(--success))" name="Sales (₹)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </motion.div>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Module Specific Reports */}
            <TabPane tab={<span><ShoppingOutlined />Orders</span>} key="orders">
              <OrderReports />
            </TabPane>
            
            <TabPane tab={<span><ShoppingOutlined />Showrooms</span>} key="showrooms">
              <ShowroomReports />
            </TabPane>
            
            <TabPane tab={<span><TeamOutlined />Employees</span>} key="employees">
              <EmployeeReports />
            </TabPane>
            
            <TabPane tab={<span><FileTextOutlined />Products</span>} key="products">
              <ProductReports />
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// Module-specific report components
const OrderReports = () => {
  const { orders } = useData();
  const { authState } = useAuth();
  
  const userOrders = authState.user?.role === 'Super Admin' 
    ? orders 
    : orders.filter(o => o.showroomId === authState.showroomId);

  const ordersByStatus = [
    { name: 'Pending', value: userOrders.filter(o => o.status === 'Pending').length, color: '#fbbf24' },
    { name: 'Approved', value: userOrders.filter(o => o.status === 'Approved').length, color: '#3b82f6' },
    { name: 'Delivered', value: userOrders.filter(o => o.status === 'Delivered').length, color: '#10b981' }
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <Card title="Orders by Status" className="glass-card">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ordersByStatus}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {ordersByStatus.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Col>
      
      <Col xs={24} lg={12}>
        <Card title="Recent Orders" className="glass-card">
          <Table
            dataSource={userOrders.slice(0, 5)}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              { title: 'Order #', dataIndex: 'orderNumber', key: 'orderNumber' },
              { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
              { title: 'Total', dataIndex: 'total', key: 'total', render: (total) => `₹${total}` },
              { title: 'Status', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'Delivered' ? 'green' : status === 'Approved' ? 'blue' : 'orange'}>{status}</Tag> }
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
};

const ShowroomReports = () => {
  const { showrooms, orders, products } = useData();
  const { authState } = useAuth();
  
  const userShowrooms = authState.user?.role === 'Super Admin' 
    ? showrooms 
    : showrooms.filter(s => s.id === authState.showroomId);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Alert 
          message="Showroom Performance" 
          description="Detailed analytics for each showroom location including sales, stock, and performance metrics."
          type="info" 
          showIcon 
          className="mb-4"
        />
      </Col>
      
      {userShowrooms.map(showroom => (
        <Col xs={24} lg={12} key={showroom.id}>
          <Card title={showroom.name} className="glass-card">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Total Orders"
                  value={orders.filter(o => o.showroomId === showroom.id).length}
                  valueStyle={{ color: 'hsl(var(--primary))' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Revenue"
                  value={orders.filter(o => o.showroomId === showroom.id).reduce((sum, o) => sum + o.total, 0)}
                  formatter={(value) => `₹${Number(value).toLocaleString()}`}
                  valueStyle={{ color: 'hsl(var(--success))' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

const EmployeeReports = () => {
  const { employees, salaryRecords } = useData();
  const { authState } = useAuth();
  
  const userEmployees = authState.user?.role === 'Super Admin' 
    ? employees 
    : employees.filter(e => e.showroomId === authState.showroomId);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card className="glass-card text-center">
          <Statistic
            title="Total Employees"
            value={userEmployees.length}
            valueStyle={{ color: 'hsl(var(--primary))' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card className="glass-card text-center">
          <Statistic
            title="Total Payroll"
            value={userEmployees.reduce((sum, emp) => sum + emp.salary, 0)}
            formatter={(value) => `₹${Number(value).toLocaleString()}`}
            valueStyle={{ color: 'hsl(var(--warning))' }}
          />
        </Card>
      </Col>
      
      <Col xs={24} lg={8}>
        <Card className="glass-card text-center">
          <Statistic
            title="Avg Salary"
            value={userEmployees.length > 0 ? userEmployees.reduce((sum, emp) => sum + emp.salary, 0) / userEmployees.length : 0}
            formatter={(value) => `₹${Number(value).toLocaleString()}`}
            valueStyle={{ color: 'hsl(var(--info))' }}
          />
        </Card>
      </Col>
    </Row>
  );
};

const ProductReports = () => {
  const { products } = useData();
  
  const categoryStats = ['Seeds', 'Fertilizer', 'Pesticide', 'Equipment'].map(category => {
    const categoryProducts = products.filter(p => p.category === category);
    const totalStock = categoryProducts.reduce((sum, p) => 
      sum + Object.values(p.stock).reduce((stockSum: number, qty: any) => stockSum + qty, 0), 0
    );
    
    return {
      category,
      count: categoryProducts.length,
      totalStock,
      avgPrice: categoryProducts.length > 0 ? categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length : 0
    };
  });

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24}>
        <Card title="Product Categories Overview" className="glass-card">
          <Table
            dataSource={categoryStats}
            rowKey="category"
            pagination={false}
            columns={[
              { title: 'Category', dataIndex: 'category', key: 'category' },
              { title: 'Products', dataIndex: 'count', key: 'count' },
              { title: 'Total Stock', dataIndex: 'totalStock', key: 'totalStock' },
              { 
                title: 'Avg Price', 
                dataIndex: 'avgPrice', 
                key: 'avgPrice',
                render: (price) => `₹${price.toFixed(2)}`
              }
            ]}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default Reports;