import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Form, 
  Input, 
  Select, 
  Table, 
  InputNumber,
  Space,
  message,
  Modal,
  Divider,
  Tag
} from 'antd';
import { 
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  DownloadOutlined,
  FileTextOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { generateOrderPDF } from '../utils/pdfGenerator';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface BillItem {
  key: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  gst: number;
  total: number;
}

const Bills: React.FC = () => {
  const { products, addOrder } = useData();
  const { authState } = useAuth();
  const [form] = Form.useForm();
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const userProducts = authState.user?.role === 'Super Admin' 
    ? products 
    : products.filter(p => p.stock[authState.showroomId || ''] > 0);

  const addBillItem = () => {
    const newItem: BillItem = {
      key: Date.now().toString(),
      productId: '',
      productName: '',
      category: '',
      quantity: 1,
      unit: '',
      price: 0,
      gst: 18,
      total: 0
    };
    setBillItems([...billItems, newItem]);
  };

  const updateBillItem = (key: string, field: string, value: any) => {
    setBillItems(prevItems => 
      prevItems.map(item => {
        if (item.key === key) {
          const updatedItem = { ...item, [field]: value };
          
          if (field === 'productId') {
            const product = products.find(p => p.id === value);
            if (product) {
              updatedItem.productName = product.name;
              updatedItem.category = product.category;
              updatedItem.unit = product.unit;
              updatedItem.price = product.price;
              updatedItem.gst = product.gst;
            }
          }
          
          // Recalculate total
          const baseAmount = updatedItem.quantity * updatedItem.price;
          const gstAmount = (baseAmount * updatedItem.gst) / 100;
          updatedItem.total = baseAmount + gstAmount;
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeBillItem = (key: string) => {
    setBillItems(billItems.filter(item => item.key !== key));
  };

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => 
      sum + (item.quantity * item.price), 0
    );
    const totalGst = billItems.reduce((sum, item) => 
      sum + ((item.quantity * item.price * item.gst) / 100), 0
    );
    const total = subtotal + totalGst;
    
    return { subtotal, totalGst, total };
  };

  const handleCreateBill = async (values: any) => {
    if (billItems.length === 0) {
      message.error('Please add at least one item to the bill');
      return;
    }

    setLoading(true);
    
    try {
      const { subtotal, totalGst, total } = calculateTotals();
      
      const orderData = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerAddress: values.customerAddress,
        items: billItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          gst: item.gst
        })),
        subtotal,
        totalGst,
        total,
        notes: values.notes || '',
        showroomId: authState.showroomId || '',
        status: 'Pending' as const
      };

      await addOrder(orderData);
      
      message.success('Bill created successfully!');
      form.resetFields();
      setBillItems([]);
      
    } catch (error) {
      message.error('Failed to create bill');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = async () => {
    const values = await form.validateFields();
    const { subtotal, totalGst, total } = calculateTotals();
    
    const billData = {
      id: `BILL-${Date.now()}`,
      orderNumber: `BILL-${Date.now()}`,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerAddress: values.customerAddress,
      items: billItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        gst: item.gst
      })),
      subtotal,
      totalGst,
      total,
      status: 'Pending' as const,
      showroomId: authState.showroomId || '',
      createdAt: new Date().toISOString()
    };

    await generateOrderPDF(billData, { companyName: 'AgriERP Pro', address: 'Farm Location', gstNumber: '12345' });
  };

  const { subtotal, totalGst, total } = calculateTotals();

  const billItemColumns = [
    {
      title: 'Product',
      dataIndex: 'productId',
      key: 'product',
      render: (productId: string, record: BillItem) => (
        <Select
          value={productId}
          onChange={(value) => updateBillItem(record.key, 'productId', value)}
          placeholder="Select product"
          style={{ width: '100%' }}
          showSearch
          filterOption={(input, option) =>
            (option?.children as unknown as string)
              ?.toLowerCase()
              ?.includes(input.toLowerCase())
          }
        >
          {userProducts.map(product => (
            <Option key={product.id} value={product.id}>
              <div>
                <div className="font-medium">{product.name}</div>
                <Text type="secondary" className="text-xs">
                  {product.category} - ₹{product.price}/{product.unit}
                </Text>
              </div>
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (quantity: number, record: BillItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateBillItem(record.key, 'quantity', value || 1)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (unit: string) => <Text>{unit}</Text>
    },
    {
      title: 'Rate',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number, record: BillItem) => (
        <InputNumber
          min={0}
          step={0.01}
          value={price}
          onChange={(value) => updateBillItem(record.key, 'price', value || 0)}
          style={{ width: '100%' }}
          formatter={value => `₹ ${value}`}
          parser={value => value!.replace('₹ ', '')}
        />
      )
    },
    {
      title: 'GST%',
      dataIndex: 'gst',
      key: 'gst',
      width: 80,
      render: (gst: number, record: BillItem) => (
        <InputNumber
          min={0}
          max={100}
          value={gst}
          onChange={(value) => updateBillItem(record.key, 'gst', value || 0)}
          style={{ width: '100%' }}
          formatter={value => `${value}%`}
          parser={value => value!.replace('%', '')}
        />
      )
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 120,
      render: (total: number) => (
        <Text className="font-medium">₹{total.toFixed(2)}</Text>
      )
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record: BillItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeBillItem(record.key)}
          size="small"
        />
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
            <FileTextOutlined className="mr-2" />
            Create Bill
          </Title>
          <p className="text-muted-foreground">Generate professional bills and invoices</p>
        </div>
        <Space>
          <Button 
            type="primary" 
            icon={<ShoppingCartOutlined />}
            onClick={() => setPreviewVisible(true)}
            disabled={billItems.length === 0}
          >
            Preview
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Customer Information */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              title="Customer Information" 
              className="glass-card"
              styles={{ body: { padding: '24px' } }}
            >
              <Form form={form} layout="vertical">
                <Form.Item
                  label="Customer Name"
                  name="customerName"
                  rules={[{ required: true, message: 'Please enter customer name' }]}
                >
                  <Input placeholder="Enter customer name" />
                </Form.Item>

                <Form.Item
                  label="Phone Number"
                  name="customerPhone"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter valid 10-digit phone number' }
                  ]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>

                <Form.Item
                  label="Address"
                  name="customerAddress"
                  rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <TextArea 
                    rows={3} 
                    placeholder="Enter customer address"
                  />
                </Form.Item>

                <Form.Item label="Notes" name="notes">
                  <TextArea 
                    rows={2} 
                    placeholder="Additional notes (optional)"
                  />
                </Form.Item>
              </Form>
            </Card>
          </motion.div>
        </Col>

        {/* Bill Items */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              title="Bill Items"
              className="glass-card"
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={addBillItem}
                >
                  Add Item
                </Button>
              }
            >
              <Table
                columns={billItemColumns}
                dataSource={billItems}
                pagination={false}
                scroll={{ x: 800 }}
                footer={() => (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text>Subtotal:</Text>
                      <Text className="font-medium">₹{subtotal.toFixed(2)}</Text>
                    </div>
                    <div className="flex justify-between">
                      <Text>Total GST:</Text>
                      <Text className="font-medium">₹{totalGst.toFixed(2)}</Text>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between">
                      <Text className="text-lg font-semibold">Grand Total:</Text>
                      <Text className="text-lg font-bold text-primary">₹{total.toFixed(2)}</Text>
                    </div>
                  </div>
                )}
              />

              <div className="mt-6 flex justify-end space-x-4">
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={handlePrintBill}
                  disabled={billItems.length === 0}
                >
                  Print Bill
                </Button>
                <Button 
                  type="primary"
                  loading={loading}
                  onClick={() => form.submit()}
                  disabled={billItems.length === 0}
                >
                  Create Bill & Save Order
                </Button>
              </div>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        title="Bill Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrintBill}>
            Print
          </Button>
        ]}
        width={800}
      >
        <div className="p-4 border rounded bg-white">
          <div className="text-center mb-6">
            <Title level={3}>AgriERP Pro</Title>
            <Text>Farm Location Address</Text>
            <br />
            <Text>GST: 12345</Text>
          </div>
          
          <Divider />
          
          <Row gutter={16} className="mb-4">
            <Col span={12}>
              <Text strong>Bill To:</Text>
              <br />
              <Text>{form.getFieldValue('customerName')}</Text>
              <br />
              <Text>{form.getFieldValue('customerPhone')}</Text>
              <br />
              <Text>{form.getFieldValue('customerAddress')}</Text>
            </Col>
            <Col span={12} className="text-right">
              <Text strong>Date:</Text> {new Date().toLocaleDateString('en-IN')}
              <br />
              <Text strong>Bill No:</Text> BILL-{Date.now()}
            </Col>
          </Row>

          <Table
            columns={[
              { title: 'Item', dataIndex: 'productName', key: 'productName' },
              { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
              { title: 'Rate', dataIndex: 'price', key: 'price', render: (price: number) => `₹${price}` },
              { title: 'Total', dataIndex: 'total', key: 'total', render: (total: number) => `₹${total.toFixed(2)}` }
            ]}
            dataSource={billItems}
            pagination={false}
            size="small"
          />

          <div className="mt-4 text-right">
            <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
            <div>GST: ₹{totalGst.toFixed(2)}</div>
            <div className="font-bold text-lg">Total: ₹{total.toFixed(2)}</div>
          </div>
        </div>
      </Modal>

      <Form form={form} onFinish={handleCreateBill} style={{ display: 'none' }} />
    </motion.div>
  );
};

export default Bills;