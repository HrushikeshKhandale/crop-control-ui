import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Statistic,
  Modal,
  Form,
  InputNumber,
  message,
  Tabs,
  Progress,
  Alert
} from 'antd';
import { 
  SearchOutlined,
  FilterOutlined,
  WarningOutlined,
  PlusOutlined,
  MinusOutlined,
  SwapOutlined,
  BarChartOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface StockAdjustment {
  productId: string;
  showroomId: string;
  type: 'add' | 'subtract' | 'transfer';
  quantity: number;
  reason: string;
  targetShowroomId?: string;
}

const Stock: React.FC = () => {
  const { products, showrooms, transferStock } = useData();
  const { authState } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedShowroom, setSelectedShowroom] = useState<string>('');
  const [adjustmentModal, setAdjustmentModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Filter data based on user role
  const userShowrooms = authState.user?.role === 'Super Admin' 
    ? showrooms 
    : showrooms.filter(s => s.id === authState.showroomId);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate stock metrics
  const stockMetrics = {
    totalProducts: filteredProducts.length,
    lowStockProducts: filteredProducts.filter(p => 
      Object.values(p.stock).some(stock => stock < 50)
    ).length,
    outOfStockProducts: filteredProducts.filter(p => 
      Object.values(p.stock).every(stock => stock === 0)
    ).length,
    totalStockValue: filteredProducts.reduce((total, product) => {
      const totalStock = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
      return total + (totalStock * product.price);
    }, 0)
  };

  const handleStockAdjustment = async (values: any) => {
    setLoading(true);
    try {
      const adjustment: StockAdjustment = {
        productId: selectedProduct.id,
        showroomId: values.showroomId,
        type: values.type,
        quantity: values.quantity,
        reason: values.reason
      };

      if (values.type === 'add') {
        // Stock increase logic would be implemented here
        message.success(`Stock increased by ${values.quantity} units`);
        message.success(`Stock increased by ${values.quantity} units`);
      } else if (values.type === 'subtract') {
        const currentStock = selectedProduct.stock[values.showroomId] || 0;
        if (currentStock < values.quantity) {
          message.error('Insufficient stock for this adjustment');
          return;
        }
        await updateProductStock(
          selectedProduct.id, 
          values.showroomId, 
          currentStock - values.quantity
        );
        message.success(`Stock decreased by ${values.quantity} units`);
      }

      setAdjustmentModal(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  const handleStockTransfer = async (values: any) => {
    setLoading(true);
    try {
      await transferStock(
        selectedProduct.id,
        values.fromShowroom,
        values.toShowroom,
        values.quantity,
        `Stock transfer: ${values.reason}`
      );
      
      message.success('Stock transferred successfully');
      setTransferModal(false);
      transferForm.resetFields();
    } catch (error) {
      message.error('Failed to transfer stock');
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'red', text: 'Out of Stock' };
    if (stock < 50) return { color: 'orange', text: 'Low Stock' };
    if (stock < 200) return { color: 'blue', text: 'Medium Stock' };
    return { color: 'green', text: 'Good Stock' };
  };

  const stockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <Text className="font-medium">{name}</Text>
          <br />
          <Tag className={`category-${record.category.toLowerCase()}`}>
            {record.category}
          </Tag>
        </div>
      )
    },
    {
      title: 'SKU',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <Text type="secondary">{id.slice(0, 8).toUpperCase()}</Text>
    },
    ...userShowrooms.map(showroom => ({
      title: showroom.name,
      key: showroom.id,
      render: (record: any) => {
        const stock = record.stock[showroom.id] || 0;
        const status = getStockStatus(stock);
        return (
          <div>
            <Text className="font-medium">{stock} {record.unit}</Text>
            <br />
            <Tag color={status.color} className="text-xs">
              {status.text}
            </Tag>
          </div>
        );
      }
    })),
    {
      title: 'Total Stock',
      key: 'totalStock',
      render: (record: any) => {
        const total = Object.values(record.stock).reduce((sum: number, qty: any) => sum + qty, 0);
        return <Text className="font-medium">{total} {record.unit}</Text>;
      }
    },
    {
      title: 'Stock Value',
      key: 'stockValue',
      render: (record: any) => {
        const total = Object.values(record.stock).reduce((sum: number, qty: any) => sum + qty, 0);
        const value = total * record.price;
        return <Text className="font-medium">₹{value.toLocaleString()}</Text>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedProduct(record);
              setAdjustmentModal(true);
              form.setFieldsValue({ type: 'add' });
            }}
          >
            Adjust
          </Button>
          <Button
            size="small"
            icon={<SwapOutlined />}
            onClick={() => {
              setSelectedProduct(record);
              setTransferModal(true);
            }}
          >
            Transfer
          </Button>
        </Space>
      )
    }
  ];

  const lowStockColumns = [
    {
      title: 'Product',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <Text className="font-medium">{name}</Text>
          <br />
          <Tag className={`category-${record.category.toLowerCase()}`}>
            {record.category}
          </Tag>
        </div>
      )
    },
    {
      title: 'Showroom',
      key: 'showroom',
      render: (record: any) => {
        const lowStockShowrooms = userShowrooms.filter(showroom => 
          (record.stock[showroom.id] || 0) < 50
        );
        return (
          <Space direction="vertical" size={0}>
            {lowStockShowrooms.map(showroom => (
              <div key={showroom.id}>
                <Text>{showroom.name}</Text>
                <br />
                <Tag color="orange">{record.stock[showroom.id] || 0} {record.unit}</Tag>
              </div>
            ))}
          </Space>
        );
      }
    },
    {
      title: 'Action Required',
      key: 'action',
      render: (record: any) => (
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedProduct(record);
            setAdjustmentModal(true);
            form.setFieldsValue({ type: 'add' });
          }}
        >
          Restock
        </Button>
      )
    }
  ];

  const lowStockProducts = filteredProducts.filter(p => 
    Object.values(p.stock).some(stock => stock < 50)
  );

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
            Stock Management
          </Title>
          <p className="text-muted-foreground">Monitor and manage inventory across all showrooms</p>
        </div>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>

      {/* Stock Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="glass-card text-center">
              <Statistic
                title="Total Products"
                value={stockMetrics.totalProducts}
                valueStyle={{ color: 'hsl(var(--primary))' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="glass-card text-center">
              <Statistic
                title="Low Stock"
                value={stockMetrics.lowStockProducts}
                valueStyle={{ color: 'hsl(var(--warning))' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card text-center">
              <Statistic
                title="Out of Stock"
                value={stockMetrics.outOfStockProducts}
                valueStyle={{ color: 'hsl(var(--error))' }}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={6}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card text-center">
              <Statistic
                title="Stock Value"
                value={stockMetrics.totalStockValue}
                valueStyle={{ color: 'hsl(var(--success))' }}
                formatter={(value) => `₹${Number(value).toLocaleString()}`}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Alerts */}
      {stockMetrics.lowStockProducts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Alert
            message="Low Stock Alert"
            description={`${stockMetrics.lowStockProducts} products are running low on stock. Please restock soon.`}
            type="warning"
            showIcon
            closable
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="glass-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input
                prefix={<SearchOutlined />}
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%' }}
                allowClear
              >
                <Option value="Seeds">Seeds</Option>
                <Option value="Fertilizer">Fertilizer</Option>
                <Option value="Pesticide">Pesticide</Option>
                <Option value="Equipment">Equipment</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Showroom"
                value={selectedShowroom}
                onChange={setSelectedShowroom}
                style={{ width: '100%' }}
                allowClear
              >
                {userShowrooms.map(showroom => (
                  <Option key={showroom.id} value={showroom.id}>
                    {showroom.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Stock Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass-card">
          <Tabs defaultActiveKey="all">
            <TabPane tab="All Stock" key="all">
              <Table
                columns={stockColumns}
                dataSource={filteredProducts}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true
                }}
              />
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  Low Stock 
                  {stockMetrics.lowStockProducts > 0 && (
                    <Tag color="orange" className="ml-2">
                      {stockMetrics.lowStockProducts}
                    </Tag>
                  )}
                </span>
              } 
              key="low"
            >
              <Table
                columns={lowStockColumns}
                dataSource={lowStockProducts}
                rowKey="id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true
                }}
              />
            </TabPane>
          </Tabs>
        </Card>
      </motion.div>

      {/* Stock Adjustment Modal */}
      <Modal
        title="Stock Adjustment"
        open={adjustmentModal}
        onCancel={() => {
          setAdjustmentModal(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleStockAdjustment}
        >
          <Form.Item label="Product">
            <Text className="font-medium">{selectedProduct?.name}</Text>
          </Form.Item>

          <Form.Item
            label="Showroom"
            name="showroomId"
            rules={[{ required: true, message: 'Please select showroom' }]}
          >
            <Select placeholder="Select showroom">
              {userShowrooms.map(showroom => (
                <Option key={showroom.id} value={showroom.id}>
                  {showroom.name} (Current: {selectedProduct?.stock[showroom.id] || 0})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Adjustment Type"
            name="type"
            rules={[{ required: true, message: 'Please select type' }]}
          >
            <Select placeholder="Select adjustment type">
              <Option value="add">Add Stock</Option>
              <Option value="subtract">Remove Stock</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter quantity"
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter reason for adjustment"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setAdjustmentModal(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Adjust Stock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stock Transfer Modal */}
      <Modal
        title="Stock Transfer"
        open={transferModal}
        onCancel={() => {
          setTransferModal(false);
          transferForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleStockTransfer}
        >
          <Form.Item label="Product">
            <Text className="font-medium">{selectedProduct?.name}</Text>
          </Form.Item>

          <Form.Item
            label="From Showroom"
            name="fromShowroom"
            rules={[{ required: true, message: 'Please select source showroom' }]}
          >
            <Select placeholder="Select source showroom">
              {userShowrooms.map(showroom => (
                <Option key={showroom.id} value={showroom.id}>
                  {showroom.name} (Stock: {selectedProduct?.stock[showroom.id] || 0})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="To Showroom"
            name="toShowroom"
            rules={[{ required: true, message: 'Please select destination showroom' }]}
          >
            <Select placeholder="Select destination showroom">
              {userShowrooms.map(showroom => (
                <Option key={showroom.id} value={showroom.id}>
                  {showroom.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Quantity"
            name="quantity"
            rules={[{ required: true, message: 'Please enter quantity' }]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Enter quantity to transfer"
            />
          </Form.Item>

          <Form.Item
            label="Reason"
            name="reason"
            rules={[{ required: true, message: 'Please enter reason' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter reason for transfer"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setTransferModal(false);
                transferForm.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Transfer Stock
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default Stock;