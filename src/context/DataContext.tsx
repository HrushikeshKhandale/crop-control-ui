import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LocalStorageService, STORAGE_KEYS, initializeDefaultData } from '../utils/localStorage';
import { message } from 'antd';

// Types
export interface Product {
  id: string;
  name: string;
  category: 'Seeds' | 'Fertilizer' | 'Pesticide' | 'Equipment';
  unit: string;
  price: number;
  gst: number;
  image?: string;
  description?: string;
  stock: Record<string, number>; // showroomId -> quantity
  createdAt: string;
  updatedAt?: string;
}

export interface Showroom {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  showroomId: string;
  salary: number;
  phone: string;
  email: string;
  avatar?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'UPI';
  advanceTaken: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unit: string;
    price: number;
    gst: number;
  }>;
  subtotal: number;
  totalGst: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Delivered';
  showroomId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transfer {
  id: string;
  productId: string;
  productName: string;
  fromShowroomId: string;
  toShowroomId: string;
  quantity: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedBy: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  createdAt: string;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string; // YYYY-MM format
  baseSalary: number;
  advanceTaken: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: 'Pending' | 'Paid';
  paidAt?: string;
  createdAt: string;
}

interface DataContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Showrooms
  showrooms: Showroom[];
  addShowroom: (showroom: Omit<Showroom, 'id' | 'createdAt'>) => void;
  updateShowroom: (id: string, showroom: Partial<Showroom>) => void;
  deleteShowroom: (id: string) => void;
  
  // Employees
  employees: Employee[];
  addEmployee: (employee: Omit<Employee, 'id' | 'createdAt'>) => void;
  updateEmployee: (id: string, employee: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  // Transfers
  transfers: Transfer[];
  addTransfer: (transfer: Omit<Transfer, 'id' | 'createdAt'>) => void;
  updateTransfer: (id: string, transfer: Partial<Transfer>) => void;
  approveTransfer: (id: string, approvedBy: string) => void;
  rejectTransfer: (id: string, rejectedBy: string) => void;
  
  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'createdAt'>) => void;
  updateAttendance: (id: string, record: Partial<AttendanceRecord>) => void;
  
  // Salary
  salaryRecords: SalaryRecord[];
  addSalaryRecord: (record: Omit<SalaryRecord, 'id' | 'createdAt'>) => void;
  updateSalaryRecord: (id: string, record: Partial<SalaryRecord>) => void;
  
  // Stock Management
  updateStock: (productId: string, showroomId: string, quantity: number) => void;
  transferStock: (productId: string, fromShowroom: string, toShowroom: string, quantity: number) => void;
  
  // Utility
  generateOrderNumber: () => string;
  getProductsByShowroom: (showroomId: string) => Array<Product & { availableStock: number }>;
  getTotalStockValue: (showroomId?: string) => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  // Initialize data
  useEffect(() => {
    initializeDefaultData();
  }, []);

  // State
  const [products, setProducts] = useState<Product[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.PRODUCTS, [])
  );
  
  const [showrooms, setShowrooms] = useState<Showroom[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.SHOWROOMS, [])
  );
  
  const [employees, setEmployees] = useState<Employee[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.EMPLOYEES, [])
  );
  
  const [orders, setOrders] = useState<Order[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.ORDERS, [])
  );
  
  const [transfers, setTransfers] = useState<Transfer[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.TRANSFERS, [])
  );
  
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.ATTENDANCE, [])
  );
  
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => 
    LocalStorageService.get(STORAGE_KEYS.SALARY_RECORDS, [])
  );

  // Save to localStorage whenever state changes
  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.SHOWROOMS, showrooms);
  }, [showrooms]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.TRANSFERS, transfers);
  }, [transfers]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.ATTENDANCE, attendance);
  }, [attendance]);

  useEffect(() => {
    LocalStorageService.set(STORAGE_KEYS.SALARY_RECORDS, salaryRecords);
  }, [salaryRecords]);

  // Generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = (orders.length + 1).toString().padStart(4, '0');
    return `AG${year}${month}${day}${sequence}`;
  };

  // Product operations
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
    message.success('Product added successfully');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ));
    message.success('Product updated successfully');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    message.success('Product deleted successfully');
  };

  // Similar patterns for other entities...
  // [Implementation continues with similar CRUD operations for all entities]

  // Stock management
  const updateStock = (productId: string, showroomId: string, quantity: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        return {
          ...product,
          stock: {
            ...product.stock,
            [showroomId]: quantity
          },
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    }));
  };

  const transferStock = (productId: string, fromShowroom: string, toShowroom: string, quantity: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const fromStock = product.stock[fromShowroom] || 0;
        const toStock = product.stock[toShowroom] || 0;
        
        if (fromStock >= quantity) {
          return {
            ...product,
            stock: {
              ...product.stock,
              [fromShowroom]: fromStock - quantity,
              [toShowroom]: toStock + quantity
            },
            updatedAt: new Date().toISOString()
          };
        }
      }
      return product;
    }));
  };

  // Utility functions
  const getProductsByShowroom = (showroomId: string) => {
    return products.map(product => ({
      ...product,
      availableStock: product.stock[showroomId] || 0
    }));
  };

  const getTotalStockValue = (showroomId?: string) => {
    return products.reduce((total, product) => {
      if (showroomId) {
        const stock = product.stock[showroomId] || 0;
        return total + (stock * product.price);
      }
      // Calculate total across all showrooms
      const totalStock = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
      return total + (totalStock * product.price);
    }, 0);
  };

  // More CRUD operations (shortened for brevity - implement similar patterns)
  const addShowroom = (showroomData: Omit<Showroom, 'id' | 'createdAt'>) => {
    const newShowroom: Showroom = {
      ...showroomData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setShowrooms(prev => [...prev, newShowroom]);
    message.success('Showroom added successfully');
  };

  const updateShowroom = (id: string, showroomData: Partial<Showroom>) => {
    setShowrooms(prev => prev.map(showroom => 
      showroom.id === id 
        ? { ...showroom, ...showroomData, updatedAt: new Date().toISOString() }
        : showroom
    ));
    message.success('Showroom updated successfully');
  };

  const deleteShowroom = (id: string) => {
    setShowrooms(prev => prev.filter(showroom => showroom.id !== id));
    message.success('Showroom deleted successfully');
  };

  // Employee operations
  const addEmployee = (employeeData: Omit<Employee, 'id' | 'createdAt'>) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setEmployees(prev => [...prev, newEmployee]);
    message.success('Employee added successfully');
  };

  const updateEmployee = (id: string, employeeData: Partial<Employee>) => {
    setEmployees(prev => prev.map(employee => 
      employee.id === id 
        ? { ...employee, ...employeeData, updatedAt: new Date().toISOString() }
        : employee
    ));
    message.success('Employee updated successfully');
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(employee => employee.id !== id));
    message.success('Employee deleted successfully');
  };

  // Order operations
  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString()
    };
    setOrders(prev => [...prev, newOrder]);
    
    // Update stock for ordered items
    orderData.items.forEach(item => {
      updateStock(item.productId, orderData.showroomId, 
        (products.find(p => p.id === item.productId)?.stock[orderData.showroomId] || 0) - item.quantity
      );
    });
    
    message.success('Order created successfully');
  };

  const updateOrder = (id: string, orderData: Partial<Order>) => {
    setOrders(prev => prev.map(order => 
      order.id === id 
        ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
        : order
    ));
    message.success('Order updated successfully');
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(order => order.id !== id));
    message.success('Order deleted successfully');
  };

  // Transfer operations
  const addTransfer = (transferData: Omit<Transfer, 'id' | 'createdAt'>) => {
    const newTransfer: Transfer = {
      ...transferData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setTransfers(prev => [...prev, newTransfer]);
    message.success('Transfer request created successfully');
  };

  const updateTransfer = (id: string, transferData: Partial<Transfer>) => {
    setTransfers(prev => prev.map(transfer => 
      transfer.id === id 
        ? { ...transfer, ...transferData, updatedAt: new Date().toISOString() }
        : transfer
    ));
  };

  const approveTransfer = (id: string, approvedBy: string) => {
    const transfer = transfers.find(t => t.id === id);
    if (transfer) {
      // Execute the stock transfer
      transferStock(transfer.productId, transfer.fromShowroomId, transfer.toShowroomId, transfer.quantity);
      
      // Update transfer status
      updateTransfer(id, {
        status: 'Approved',
        approvedBy,
        updatedAt: new Date().toISOString()
      });
      
      message.success('Transfer approved and executed successfully');
    }
  };

  const rejectTransfer = (id: string, rejectedBy: string) => {
    updateTransfer(id, {
      status: 'Rejected',
      approvedBy: rejectedBy,
      updatedAt: new Date().toISOString()
    });
    message.info('Transfer request rejected');
  };

  // Attendance operations
  const markAttendance = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const newRecord: AttendanceRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setAttendance(prev => [...prev, newRecord]);
    message.success('Attendance marked successfully');
  };

  const updateAttendance = (id: string, recordData: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(record => 
      record.id === id 
        ? { ...record, ...recordData }
        : record
    ));
    message.success('Attendance updated successfully');
  };

  // Salary operations
  const addSalaryRecord = (recordData: Omit<SalaryRecord, 'id' | 'createdAt'>) => {
    const newRecord: SalaryRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setSalaryRecords(prev => [...prev, newRecord]);
    message.success('Salary record created successfully');
  };

  const updateSalaryRecord = (id: string, recordData: Partial<SalaryRecord>) => {
    setSalaryRecords(prev => prev.map(record => 
      record.id === id 
        ? { ...record, ...recordData }
        : record
    ));
    message.success('Salary record updated successfully');
  };

  const value: DataContextType = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Showrooms
    showrooms,
    addShowroom,
    updateShowroom,
    deleteShowroom,
    
    // Employees
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    
    // Orders
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    
    // Transfers
    transfers,
    addTransfer,
    updateTransfer,
    approveTransfer,
    rejectTransfer,
    
    // Attendance
    attendance,
    markAttendance,
    updateAttendance,
    
    // Salary
    salaryRecords,
    addSalaryRecord,
    updateSalaryRecord,
    
    // Stock Management
    updateStock,
    transferStock,
    
    // Utility
    generateOrderNumber,
    getProductsByShowroom,
    getTotalStockValue
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};