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
  Statistic
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShopOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useData, Showroom } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;

const Showrooms: React.FC = () => {
  const { showrooms, addShowroom, updateShowroom, deleteShowroom, getTotalStockValue } = useData();
  const { hasPermission } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingShowroom, setEditingShowroom] = useState<Showroom | null>(null);
  const [form] = Form.useForm();

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
        <div className="space-y-1">
          <div className="font-medium text-lg">{record.name}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <EnvironmentOutlined className="mr-1" />
            {record.location}
          </div>
        </div>
      ),
      width: 250
    },
    {
      title: 'Contact Person',
      key: 'contact',
      render: (_, record: Showroom) => (
        <div className="space-y-1">
          <div className="font-medium">{record.contactPerson}</div>
          <div className="flex items-center text-gray-500 text-sm">
            <PhoneOutlined className="mr-1" />
            {record.phone}
          </div>
          <div className="flex items-center text-gray-500 text-sm">
            <MailOutlined className="mr-1" />
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
            valueStyle={{ fontSize: '16px' }}
          />
        );
      },
      width: 150
    },
    {
      title: 'Status',
      key: 'status',
      render: () => (
        <Tag color="green">Active</Tag>
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
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this showroom?"
            description="This will remove all associated stock and data."
            onConfirm={() => deleteShowroom(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
      width: 100
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingShowroom) {
        updateShowroom(editingShowroom.id, values);
      } else {
        addShowroom(values);
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1">Showrooms</Title>
          <p className="text-gray-600">Manage your agriculture showroom locations</p>
        </div>
        {hasPermission('manage_showrooms') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Showroom
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="ag-card">
            <Statistic
              title="Total Showrooms"
              value={showrooms.length}
              prefix={<ShopOutlined />}
              valueStyle={{ color: 'hsl(var(--primary))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="ag-card">
            <Statistic
              title="Total Stock Value"
              value={getTotalStockValue()}
              prefix="₹"
              precision={0}
              valueStyle={{ color: 'hsl(var(--success))' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="ag-card">
            <Statistic
              title="Average Stock Value"
              value={showrooms.length > 0 ? getTotalStockValue() / showrooms.length : 0}
              prefix="₹"
              precision={0}
              valueStyle={{ color: 'hsl(var(--info))' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search */}
      <Card className="ag-card">
        <Input
          placeholder="Search showrooms..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="max-w-md"
        />
      </Card>

      {/* Showrooms Table */}
      <Card className="ag-card">
        <Table
          columns={columns}
          dataSource={filteredShowrooms}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} showrooms`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingShowroom ? 'Edit Showroom' : 'Add New Showroom'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText={editingShowroom ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Showroom Name"
            rules={[{ required: true, message: 'Please input showroom name!' }]}
          >
            <Input placeholder="Enter showroom name" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please input location!' }]}
          >
            <Input placeholder="City, State" />
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="contactPerson"
                label="Contact Person"
                rules={[{ required: true, message: 'Please input contact person!' }]}
              >
                <Input placeholder="Manager name" />
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
                <Input placeholder="+91 XXXXXXXXXX" />
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
            <Input placeholder="showroom@email.com" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Showrooms;