import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Typography, 
  Card, 
  Tag, 
  Modal, 
  Form, 
  Popconfirm,
  Row,
  Col,
  Statistic,
  Select,
  message,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  SwapOutlined,
  UserAddOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useData, Showroom } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Showrooms: React.FC = () => {
  const { showrooms, products, addShowroom, updateShowroom, deleteShowroom, getTotalStockValue, transferStock } = useData();
  const { hasPermission, authState } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  const [selectedShowroom, setSelectedShowroom] = useState<any>(null);
  const [form] = Form.useForm();
  const [credentialsForm] = Form.useForm();

  // Filter showrooms
  const filteredShowrooms = showrooms.filter(showroom => {
    return showroom.name.toLowerCase().includes(searchText.toLowerCase()) ||
           showroom.location.toLowerCase().includes(searchText.toLowerCase()) ||
           showroom.contactPerson.toLowerCase().includes(searchText.toLowerCase());
  });

  const columns = [
    {
      title: 'Showroom',
      key: 'showroom',
      render: (_, record: Showroom) => (
        <motion.div 
          className="space-y-1"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold text-lg text-gray-800 dark:text-gray-200">{record.name}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <EnvironmentOutlined className="mr-1 text-blue-500" />
            {record.location}
          </div>
        </motion.div>
      ),
      width: 250
    },
    {
      title: 'Contact Person',
      key: 'contact',
      render: (_, record: Showroom) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-800 dark:text-gray-200">{record.contactPerson}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <PhoneOutlined className="mr-1 text-green-500" />
            {record.phone}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MailOutlined className="mr-1 text-blue-500" />
            {record.email}
          </div>
        </div>
      ),
      width: 200
    },
    {
      title: 'Stock Value',
      key: 'stockValue',
      render: (_, record: Showroom) => {
        const value = getTotalStockValue(record.id);
        return (
          <Statistic
            value={value}
            prefix="₹"
            precision={0}
            valueStyle={{ 
              fontSize: '16px',
              color: value > 100000 ? 'hsl(var(--success))' : 'hsl(var(--warning))'
            }}
          />
        );
      },
      width: 150
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green" className="status-success">
          Active
        </Tag>
      ),
      width: 100
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('en-IN'),
      width: 120
    }
  ];

  if (hasPermission('manage_showrooms')) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record: Showroom) => (
        <Space wrap>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
              className="hover:border-blue-400 hover:text-blue-500"
            />
          </motion.div>
          
          {authState.user?.role === 'Super Admin' && (
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                icon={<UserAddOutlined />}
                size="small"
                onClick={() => handleCreateCredentials(record)}
                className="hover:border-green-400 hover:text-green-500"
                title="Create User Credentials"
              />
            </motion.div>
          )}

          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              icon={<SwapOutlined />}
              size="small"
              onClick={() => handleTransfer(record)}
              className="hover:border-orange-400 hover:text-orange-500"
              title="Transfer Stock"
            />
          </motion.div>
          
          <Popconfirm
            title="Are you sure you want to delete this showroom?"
            description="This will remove all associated stock and data."
            onConfirm={() => deleteShowroom(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                className="hover:border-red-400"
              />
            </motion.div>
          </Popconfirm>
        </Space>
      ),
      width: 160
    } as any);
  }

  const handleEdit = (showroom: Showroom) => {
    setEditingShowroom(showroom);
    form.setFieldsValue(showroom);
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingShowroom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleCreateCredentials = (showroom: Showroom) => {
    setSelectedShowroom(showroom);
    credentialsForm.resetFields();
    credentialsForm.setFieldsValue({
      username: showroom.name.toLowerCase().replace(/\s+/g, ''),
      email: showroom.email,
      role: 'Showroom Manager',
      status: 'Active',
      permissions: ['view_products', 'manage_products', 'view_orders', 'manage_orders']
    });
    setCredentialsModalVisible(true);
  };

  const handleTransfer = (showroom: Showroom) => {
    setSelectedShowroom(showroom);
    setTransferModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingShowroom) {
        updateShowroom(editingShowroom.id, values);
        message.success('Showroom updated successfully');
      } else {
        const newShowroom = {
          id: Date.now().toString(),
          ...values,
          createdAt: new Date().toISOString(),
          status: 'Active'
        };
        addShowroom(newShowroom);
        message.success('Showroom added successfully');
        
        // If super admin, offer to create credentials
        if (authState.user?.role === 'Super Admin') {
          setSelectedShowroom(newShowroom);
          setTimeout(() => {
            setCredentialsModalVisible(true);
          }, 500);
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingShowroom(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCredentialsSubmit = async () => {
    try {
      const values = await credentialsForm.validateFields();
      // In a real app, this would create user credentials in the backend
      console.log('Creating credentials for showroom:', selectedShowroom?.name, values);
      message.success(`User credentials created for ${selectedShowroom?.name}`);
      setCredentialsModalVisible(false);
      setSelectedShowroom(null);
      credentialsForm.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleTransferSubmit = async (values: any) => {
    try {
      transferStock(values.fromShowroomId, values.toShowroomId, values.productId, values.quantity);
      message.success('Stock transfer initiated successfully');
      setTransferModalVisible(false);
      setSelectedShowroom(null);
    } catch (error) {
      message.error('Failed to transfer stock');
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1 text-gray-800 dark:text-gray-200">
            Showrooms Management
          </Title>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your agriculture showroom locations and operations
          </p>
        </div>
        {hasPermission('manage_showrooms') && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-none shadow-lg"
              size="large"
            >
              Add Showroom
            </Button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Summary Cards */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={8}>
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="ag-card-modern hover-lift">
              <Statistic
                title="Total Showrooms"
                value={showrooms.length}
                prefix={<ShopOutlined className="text-blue-500" />}
                valueStyle={{ color: 'hsl(var(--primary))' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={8}>
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="ag-card-modern hover-lift">
              <Statistic
                title="Total Stock Value"
                value={getTotalStockValue()}
                prefix="₹"
                precision={0}
                valueStyle={{ color: 'hsl(var(--success))' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={8}>
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="ag-card-modern hover-lift">
              <Statistic
                title="Average Stock Value"
                value={showrooms.length > 0 ? getTotalStockValue() / showrooms.length : 0}
                prefix="₹"
                precision={0}
                valueStyle={{ color: 'hsl(var(--info))' }}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Enhanced Search */}
      <Card className="ag-card-modern">
        <Input
          placeholder="Search showrooms by name, location, or contact person..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="max-w-md"
          size="large"
        />
      </Card>

      {/* Enhanced Showrooms Table */}
      <Card className="ag-card-modern overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredShowrooms}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} showrooms`,
            className: "px-4"
          }}
          scroll={{ x: 1000 }}
          className="custom-table"
        />
      </Card>

      {/* Enhanced Add/Edit Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <ShopOutlined className="text-green-500" />
            <span>{editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}</span>
          </div>
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingShowroom(null);
        }}
        width={700}
        okText={editingShowroom ? 'Update Showroom' : 'Create Showroom'}
        className="modern-modal"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Showroom Name"
            rules={[{ required: true, message: 'Please input showroom name!' }]}
          >
            <Input placeholder="Enter showroom name" size="large" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input location!' }]}
          >
            <Input placeholder="City, State, Country" size="large" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please input contact person!' }]}
              >
                <Input placeholder="Manager name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[
                  { required: true, message: 'Please input phone number!' },
                  { pattern: /^[+]?[\d\s-()]+$/, message: 'Please enter a valid phone number!' }
                ]}
              >
                <Input placeholder="+91 XXXXXXXXXX" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input placeholder="showroom@email.com" size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Credentials Modal for Super Admin */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <KeyOutlined className="text-blue-500" />
            <span>Create User Credentials - {selectedShowroom?.name}</span>
          </div>
        }
        open={credentialsModalVisible}
        onOk={handleCredentialsSubmit}
        onCancel={() => {
          setCredentialsModalVisible(false);
          setSelectedShowroom(null);
          credentialsForm.resetFields();
        }}
        width={600}
        okText="Create Credentials"
        className="modern-modal"
      >
        <Form
          form={credentialsForm}
          layout="vertical"
          className="mt-4"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email address" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter password' }]}
          >
            <Input.Password placeholder="Enter password" size="large" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select size="large" placeholder="Select role">
                  <Select.Option value="Showroom Manager">Showroom Manager</Select.Option>
                  <Select.Option value="Employee">Employee</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select size="large" placeholder="Select status">
                  <Select.Option value="Active">Active</Select.Option>
                  <Select.Option value="Inactive">Inactive</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="permissions"
            label="Permissions"
          >
            <Select mode="multiple" placeholder="Select permissions" size="large">
              <Select.Option value="view_products">View Products</Select.Option>
              <Select.Option value="manage_products">Manage Products</Select.Option>
              <Select.Option value="view_orders">View Orders</Select.Option>
              <Select.Option value="manage_orders">Manage Orders</Select.Option>
              <Select.Option value="view_employees">View Employees</Select.Option>
              <Select.Option value="manage_employees">Manage Employees</Select.Option>
              <Select.Option value="view_reports">View Reports</Select.Option>
              <Select.Option value="view_transfers">View Transfers</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Stock Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <SwapOutlined className="text-orange-500" />
            <span>Transfer Stock from {selectedShowroom?.name}</span>
          </div>
        }
        open={transferModalVisible}
        onCancel={() => {
          setTransferModalVisible(false);
          setSelectedShowroom(null);
        }}
        footer={null}
        width={700}
        className="modern-modal"
      >
        <TransferForm 
          onSubmit={handleTransferSubmit}
          showrooms={showrooms.filter(s => s.id !== selectedShowroom?.id)}
          products={products}
          fromShowroom={selectedShowroom}
        />
      </Modal>
    </motion.div>
  );
};

// Transfer Form Component
const TransferForm: React.FC<{
  onSubmit: (values: any) => void;
  showrooms: Showroom[];
  products: any[];
  fromShowroom: Showroom;
}> = ({ onSubmit, showrooms, products, fromShowroom }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit({
        ...values,
        fromShowroomId: fromShowroom.id,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'Pending'
      });
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="mt-4"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            name="toShowroomId"
            label="Transfer To"
            rules={[{ required: true, message: 'Please select destination showroom' }]}
          >
            <Select placeholder="Select showroom" size="large">
              {showrooms.map(showroom => (
                <Select.Option key={showroom.id} value={showroom.id}>
                  {showroom.name} - {showroom.location}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="productId"
            label="Product"
            rules={[{ required: true, message: 'Please select product' }]}
          >
            <Select placeholder="Select product" size="large">
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name} - Available: {product.stock[fromShowroom.id] || 0}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <Input type="number" min={1} placeholder="Enter quantity" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Select placeholder="Select reason" size="large">
              <Select.Option value="Stock Shortage">Stock Shortage</Select.Option>
              <Select.Option value="Demand Redistribution">Demand Redistribution</Select.Option>
              <Select.Option value="Inventory Balancing">Inventory Balancing</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="notes"
        label="Additional Notes"
      >
        <Input.TextArea placeholder="Any additional notes..." rows={3} />
      </Form.Item>

      <div className="flex justify-end space-x-2 mt-6">
        <Button onClick={() => form.resetFields()}>
          Reset
        </Button>
        <Button type="primary" onClick={handleSubmit}>
          Submit Transfer Request
        </Button>
      </div>
    </Form>
  );
};

export default Showrooms;