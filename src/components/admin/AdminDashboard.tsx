import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Dashboard from './Dashboard';
import OperationsTracking from './OperationsTracking';
import UserManagement from './UserManagement';
import FinancialTracking from './FinancialTracking';
import AlertsManagement from './AlertsManagement';
import { 
  DashboardStats, 
  Delivery, 
  Route, 
  User, 
  FinancialRecord, 
  Alert 
} from '../../types/admin';

interface AdminDashboardProps {
  onLogout: () => void;
  userRole: 'admin' | 'courier' | 'client';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, userRole }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Mock data - in a real app, this would come from your backend
  const [stats] = useState<DashboardStats>({
    totalDeliveries: 1247,
    activeDeliveries: 89,
    completedDeliveries: 1098,
    failedDeliveries: 60,
    totalRevenue: 125000,
    totalCosts: 75000,
    activeUsers: 342,
    activeCouriers: 28,
    averageDeliveryTime: 24,
    onTimeDeliveryRate: 94.5
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: '1',
      trackingNumber: 'AXX001234',
      senderId: 'user1',
      recipientId: 'user2',
      courierId: 'courier1',
      category: 'Parcel',
      status: 'in_transit',
      priority: 'medium',
      origin: 'Paris, France',
      destination: 'Cotonou, Benin',
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
      cost: 25,
      currency: 'EUR',
      insurance: true,
      insuranceCost: 5,
      estimatedDelivery: '2024-01-15T10:00:00Z',
      notes: 'Handle with care',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-01-12T14:30:00Z'
    },
    {
      id: '2',
      trackingNumber: 'AXX001235',
      senderId: 'user3',
      recipientId: 'user4',
      category: 'Mail',
      status: 'pending',
      priority: 'high',
      origin: 'Beijing, China',
      destination: 'Lyon, France',
      weight: 0.5,
      dimensions: { length: 25, width: 18, height: 2 },
      cost: 5,
      currency: 'EUR',
      insurance: false,
      insuranceCost: 0,
      estimatedDelivery: '2024-01-18T16:00:00Z',
      notes: 'Express delivery',
      createdAt: '2024-01-11T09:15:00Z',
      updatedAt: '2024-01-11T09:15:00Z'
    }
  ]);

  const [routes] = useState<Route[]>([
    {
      id: 'route1',
      courierId: 'courier1',
      deliveryIds: ['1'],
      status: 'active',
      estimatedDuration: 48,
      distance: 4500,
      startTime: '2024-01-12T08:00:00Z',
      waypoints: [
        {
          address: 'Paris, France',
          deliveryId: '1',
          estimatedTime: '2024-01-12T08:00:00Z',
          status: 'completed'
        },
        {
          address: 'Cotonou, Benin',
          deliveryId: '1',
          estimatedTime: '2024-01-15T10:00:00Z',
          status: 'pending'
        }
      ]
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: 'user1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'client',
      phone: '+33123456789',
      address: '123 Rue de la Paix, Paris, France',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'courier1',
      email: 'marie.courier@axoxia.com',
      firstName: 'Marie',
      lastName: 'Courier',
      role: 'courier',
      phone: '+33987654321',
      address: '456 Avenue des Champs, Lyon, France',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    },
    {
      id: 'admin1',
      email: 'admin@axoxia.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+33555123456',
      address: 'Axoxia HQ, Paris, France',
      createdAt: '2024-01-01T00:00:00Z',
      isActive: true
    }
  ]);

  const [financialRecords] = useState<FinancialRecord[]>([
    {
      id: 'fin1',
      deliveryId: '1',
      type: 'revenue',
      amount: 25,
      currency: 'EUR',
      description: 'Parcel delivery payment',
      paymentMethod: 'PayPal',
      paymentStatus: 'completed',
      createdAt: '2024-01-10T08:00:00Z'
    },
    {
      id: 'fin2',
      deliveryId: '1',
      type: 'cost',
      amount: 15,
      currency: 'EUR',
      description: 'Courier payment',
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'completed',
      createdAt: '2024-01-10T08:00:00Z'
    }
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert1',
      type: 'delay',
      severity: 'high',
      title: 'Delivery Delay',
      message: 'Delivery AXX001234 is experiencing delays due to weather conditions',
      deliveryId: '1',
      isRead: false,
      createdAt: '2024-01-12T15:00:00Z'
    },
    {
      id: 'alert2',
      type: 'system',
      severity: 'medium',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight from 2-4 AM',
      isRead: true,
      createdAt: '2024-01-11T10:00:00Z'
    }
  ]);

  const handleUpdateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(delivery => 
      delivery.id === id ? { ...delivery, ...updates } : delivery
    ));
  };

  const handleAssignCourier = (deliveryId: string, courierId: string) => {
    handleUpdateDelivery(deliveryId, { courierId, status: 'assigned' });
  };

  const handleCreateUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => 
      user.id === id ? { ...user, ...updates } : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const handleMarkAlertAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const handleCreateAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: `alert_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleExportReport = (filters: any) => {
    console.log('Exporting report with filters:', filters);
    // In a real app, this would generate and download a report
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'operations':
        return (
          <OperationsTracking
            deliveries={deliveries}
            routes={routes}
            onUpdateDelivery={handleUpdateDelivery}
            onAssignCourier={handleAssignCourier}
          />
        );
      case 'users':
        return (
          <UserManagement
            users={users}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'financial':
        return (
          <FinancialTracking
            financialRecords={financialRecords}
            onExportReport={handleExportReport}
          />
        );
      case 'alerts':
        return (
          <AlertsManagement
            alerts={alerts}
            onMarkAsRead={handleMarkAlertAsRead}
            onDismissAlert={handleDismissAlert}
            onCreateAlert={handleCreateAlert}
          />
        );
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      userRole={userRole}
      onLogout={onLogout}
    >
      {renderCurrentPage()}
    </AdminLayout>
  );
};

export default AdminDashboard;