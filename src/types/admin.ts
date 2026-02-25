export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'courier' | 'client';
  phone: string;
  address: string;
  createdAt: string;
  isActive: boolean;
}

export interface Delivery {
  id: string;
  trackingNumber: string;
  senderId: string;
  recipientId: string;
  courierId?: string;
  category: 'Mail' | 'Parcel' | 'Container';
  status: 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  origin: string;
  destination: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  cost: number;
  currency: string;
  insurance: boolean;
  insuranceCost: number;
  estimatedDelivery: string;
  actualDelivery?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  courierId: string;
  deliveryIds: string[];
  status: 'planned' | 'active' | 'completed';
  estimatedDuration: number;
  actualDuration?: number;
  distance: number;
  startTime: string;
  endTime?: string;
  waypoints: {
    address: string;
    deliveryId: string;
    estimatedTime: string;
    actualTime?: string;
    status: 'pending' | 'completed' | 'failed';
  }[];
}

export interface Alert {
  id: string;
  type: 'delay' | 'incident' | 'system' | 'payment';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  deliveryId?: string;
  userId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  deliveryId: string;
  type: 'revenue' | 'cost' | 'refund';
  amount: number;
  currency: string;
  description: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface DashboardStats {
  totalDeliveries: number;
  activeDeliveries: number;
  completedDeliveries: number;
  failedDeliveries: number;
  totalRevenue: number;
  totalCosts: number;
  activeUsers: number;
  activeCouriers: number;
  averageDeliveryTime: number;
  onTimeDeliveryRate: number;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  status?: string;
  courier?: string;
  client?: string;
  category?: string;
}