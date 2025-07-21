import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Typography, 
  Card, 
  Tag, 
  Avatar, 
  Modal, 
  Form, 
  InputNumber, 
  Upload,
  message,
  Popconfirm,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useData, Product } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

const { Title } = Typography;
const { Option } = Select;

const Products: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, showrooms } = useData();
  const { hasPermission } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, record: Product) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            src={record.image} 
            shape="square" 
            size={48}
            className="flex-shrink-0"
          />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-sm text-gray-500">{record.description}</div>
          </div>
        </div>
      ),
      width: 250
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag className={`category-${category.toLowerCase()}`}>
          {category}
        </Tag>
      ),
      width: 120
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record: Product) => (
        <div>
          <div className="font-medium">₹{record.price}/{record.unit}</div>
          <div className="text-sm text-gray-500">GST: {record.gst}%</div>
        </div>
      ),
      width: 120
    },
    {
      title: 'Stock by Showroom',
      key: 'stock',
      render: (_, record: Product) => (
        <div className="space-y-1">
          {showrooms.map(showroom => {
            const stock = record.stock[showroom.id] || 0;
            return (
              <div key={showroom.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{showroom.name.split(' ')[0]}:</span>
                <Tag color={stock < 10 ? 'red' : stock < 50 ? 'orange' : 'green'}>
                  {stock} {record.unit}
                </Tag>
              </div>
            );
          })}
        </div>
      ),
      width: 200
    },
    {
      title: 'Total Stock',
      key: 'totalStock',
      render: (_, record: Product) => {
        const total = Object.values(record.stock).reduce((sum, qty) => sum + qty, 0);
        return (
          <Tag color={total < 50 ? 'red' : total < 200 ? 'orange' : 'green'}>
            {total} {record.unit}
          </Tag>
        );
      },
      width: 100
    }
  ];

  if (hasPermission('manage_products')) {
    columns.push({
      title: 'Actions',
      key: 'actions',
      render: (_, record: Product) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => deleteProduct(record.id)}
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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue({
      ...product,
      ...Object.fromEntries(
        showrooms.map(showroom => [`stock_${showroom.id}`, product.stock[showroom.id] || 0])
      )
    });
    setIsModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({
      ...Object.fromEntries(
        showrooms.map(showroom => [`stock_${showroom.id}`, 0])
      )
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Extract stock data
      const stock: Record<string, number> = {};
      showrooms.forEach(showroom => {
        stock[showroom.id] = values[`stock_${showroom.id}`] || 0;
        delete values[`stock_${showroom.id}`];
      });

      const productData = {
        ...values,
        stock
      };

      if (editingProduct) {
        updateProduct(editingProduct.id, productData);
      } else {
        addProduct(productData);
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
          <Title level={2} className="!mb-1">Products</Title>
          <p className="text-gray-600">Manage your agriculture product inventory</p>
        </div>
        {hasPermission('manage_products') && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Add Product
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="ag-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Input
              placeholder="Search products..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              className="w-full"
            >
              <Option value="Seeds">Seeds</Option>
              <Option value="Fertilizer">Fertilizer</Option>
              <Option value="Pesticide">Pesticide</Option>
              <Option value="Equipment">Equipment</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Products Table */}
      <Card className="ag-card">
        <Table
          columns={columns}
          dataSource={filteredProducts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} products`
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        okText={editingProduct ? 'Update' : 'Create'}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            category: 'Seeds',
            unit: 'kg',
            price: 0,
            gst: 12
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: 'Please input product name!' }]}
              >
                <Input placeholder="Enter product name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please select category!' }]}
              >
                <Select>
                  <Option value="Seeds">Seeds</Option>
                  <Option value="Fertilizer">Fertilizer</Option>
                  <Option value="Pesticide">Pesticide</Option>
                  <Option value="Equipment">Equipment</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="unit"
                label="Unit"
                rules={[{ required: true, message: 'Please input unit!' }]}
              >
                <Input placeholder="kg, liters, pieces" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Price per Unit (₹)"
                rules={[{ required: true, message: 'Please input price!' }]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="gst"
                label="GST (%)"
                rules={[{ required: true, message: 'Please input GST!' }]}
              >
                <InputNumber min={0} max={100} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={3} placeholder="Product description..." />
          </Form.Item>

          <Form.Item
            name="image"
            label="Product Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <Title level={5}>Stock by Showroom</Title>
          <Row gutter={[16, 16]}>
            {showrooms.map(showroom => (
              <Col xs={24} md={8} key={showroom.id}>
                <Form.Item
                  name={`stock_${showroom.id}`}
                  label={showroom.name}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;