import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Switch, 
  Button, 
  Typography, 
  Row, 
  Col,
  message,
  Divider,
  Select
} from 'antd';
import { 
  SaveOutlined,
  SettingOutlined 
} from '@ant-design/icons';
import { LocalStorageService, STORAGE_KEYS } from '../utils/localStorage';

const { Title, Text } = Typography;
const { Option } = Select;

interface Settings {
  appTitle: string;
  companyName: string;
  gstNumber: string;
  address: string;
  defaultGst: number;
  currency: string;
  theme: string;
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Load current settings
  const currentSettings: Settings = LocalStorageService.get(STORAGE_KEYS.SETTINGS, {
    appTitle: 'AgriERP Pro',
    companyName: 'Green Fields Agriculture',
    gstNumber: '22AAAAA0000A1Z5',
    address: '123 Agriculture Hub, Farm City, State - 123456',
    defaultGst: 12,
    currency: 'INR',
    theme: 'light',
    notifications: {
      email: true,
      sms: true,
      whatsapp: true
    }
  });

  // Initialize form with current settings
  React.useEffect(() => {
    form.setFieldsValue(currentSettings);
  }, [form]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      LocalStorageService.set(STORAGE_KEYS.SETTINGS, values);
      message.success('Settings saved successfully!');
      
      // Update document title
      document.title = values.appTitle;
    } catch (error) {
      console.error('Failed to save settings:', error);
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    const defaultSettings: Settings = {
      appTitle: 'AgriERP Pro',
      companyName: 'Green Fields Agriculture',
      gstNumber: '22AAAAA0000A1Z5',
      address: '123 Agriculture Hub, Farm City, State - 123456',
      defaultGst: 12,
      currency: 'INR',
      theme: 'light',
      notifications: {
        email: true,
        sms: true,
        whatsapp: true
      }
    };
    
    form.setFieldsValue(defaultSettings);
    message.info('Settings reset to default values');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2} className="!mb-1">Settings</Title>
          <p className="text-gray-600">Configure application preferences and company information</p>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
      >
        {/* Application Settings */}
        <Card title="Application Settings" className="ag-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="appTitle"
                label="Application Title"
                rules={[{ required: true, message: 'Please input application title!' }]}
              >
                <Input placeholder="AgriERP Pro" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="theme"
                label="Theme"
              >
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="currency"
                label="Default Currency"
              >
                <Select>
                  <Option value="INR">INR (₹)</Option>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="defaultGst"
                label="Default GST Rate (%)"
                rules={[{ required: true, message: 'Please input default GST rate!' }]}
              >
                <InputNumber min={0} max={100} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Company Information */}
        <Card title="Company Information" className="ag-card">
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="companyName"
                label="Company Name"
                rules={[{ required: true, message: 'Please input company name!' }]}
              >
                <Input placeholder="Green Fields Agriculture" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="gstNumber"
                label="GST Number"
                rules={[{ required: true, message: 'Please input GST number!' }]}
              >
                <Input placeholder="22AAAAA0000A1Z5" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Company Address"
            rules={[{ required: true, message: 'Please input company address!' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter complete company address" />
          </Form.Item>
        </Card>

        {/* Notification Settings */}
        <Card title="Notification Preferences" className="ag-card">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Text strong>Email Notifications</Text>
                <div className="text-sm text-gray-500">Receive notifications via email</div>
              </div>
              <Form.Item name={['notifications', 'email']} valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>

            <Divider className="!my-3" />

            <div className="flex justify-between items-center">
              <div>
                <Text strong>SMS Notifications</Text>
                <div className="text-sm text-gray-500">Receive notifications via SMS</div>
              </div>
              <Form.Item name={['notifications', 'sms']} valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>

            <Divider className="!my-3" />

            <div className="flex justify-between items-center">
              <div>
                <Text strong>WhatsApp Notifications</Text>
                <div className="text-sm text-gray-500">Receive notifications via WhatsApp</div>
              </div>
              <Form.Item name={['notifications', 'whatsapp']} valuePropName="checked" className="!mb-0">
                <Switch />
              </Form.Item>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card title="Data Management" className="ag-card">
          <div className="space-y-4">
            <div>
              <Text strong>Export Data</Text>
              <div className="text-sm text-gray-500 mb-2">Download all your data in JSON format</div>
              <Button onClick={() => {
                const allData = {
                  products: LocalStorageService.get(STORAGE_KEYS.PRODUCTS, []),
                  showrooms: LocalStorageService.get(STORAGE_KEYS.SHOWROOMS, []),
                  employees: LocalStorageService.get(STORAGE_KEYS.EMPLOYEES, []),
                  orders: LocalStorageService.get(STORAGE_KEYS.ORDERS, []),
                  transfers: LocalStorageService.get(STORAGE_KEYS.TRANSFERS, []),
                  attendance: LocalStorageService.get(STORAGE_KEYS.ATTENDANCE, []),
                  salaryRecords: LocalStorageService.get(STORAGE_KEYS.SALARY_RECORDS, []),
                  settings: LocalStorageService.get(STORAGE_KEYS.SETTINGS, {})
                };
                
                const dataStr = JSON.stringify(allData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `agrierp_data_${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
                
                message.success('Data exported successfully!');
              }}>
                Export All Data
              </Button>
            </div>

            <Divider />

            <div>
              <Text strong className="text-red-600">Reset All Data</Text>
              <div className="text-sm text-gray-500 mb-2">This will delete all your data permanently</div>
              <Button 
                danger 
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
                    LocalStorageService.clear();
                    window.location.reload();
                  }
                }}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Card className="ag-card">
          <div className="flex justify-between">
            <Button onClick={resetToDefault}>
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button onClick={() => form.resetFields()}>
                Cancel Changes
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default Settings;