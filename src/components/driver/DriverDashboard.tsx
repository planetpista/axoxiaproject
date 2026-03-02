import React, { useState, useEffect } from 'react';
import { Package, MapPin, Clock, CheckCircle, AlertTriangle, Navigation, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface DriverDashboardProps {
  onBack: () => void;
  currentUser: any;
}

interface Delivery {
  id: string;
  tracking_number: string;
  status: string;
  priority: string;
  origin: string;
  destination: string;
  weight: number;
  cost: number;
  estimated_delivery: string;
  actual_delivery?: string;
  created_at: string;
  category: string;
  sender_id: string;
  recipient_id: string;
}

interface DriverProfile {
  country: string;
  city: string;
  vehicle_type: string;
  account_type: string;
  is_available: boolean;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ onBack, currentUser }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    fetchDriverData();
  }, [currentUser]);

  const fetchDriverData = async () => {
    try {
      // Fetch driver profile
      const { data: profileData, error: profileError } = await supabase
        .from('driver_profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (profileError) throw profileError;
      setDriverProfile(profileData);

      // Fetch assigned deliveries
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('courier_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (deliveriesError) throw deliveriesError;
      setDeliveries(deliveriesData || []);
    } catch (error) {
      console.error('Error fetching driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'delivered') {
        updates.actual_delivery = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updates)
        .eq('id', deliveryId);

      if (error) throw error;

      // Update local state
      setDeliveries(prev => prev.map(delivery => 
        delivery.id === deliveryId 
          ? { ...delivery, ...updates }
          : delivery
      ));

      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
  };

  const toggleAvailability = async () => {
    if (!driverProfile) return;

    try {
      const newAvailability = !driverProfile.is_available;
      const { error } = await supabase
        .from('driver_profiles')
        .update({ is_available: newAvailability })
        .eq('user_id', currentUser.id);

      if (error) throw error;

      setDriverProfile(prev => prev ? { ...prev, is_available: newAvailability } : null);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: deliveries.length,
    assigned: deliveries.filter(d => d.status === 'assigned').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    todayDeliveries: deliveries.filter(d => {
      const today = new Date().toDateString();
      return new Date(d.estimated_delivery).toDateString() === today;
    }).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600">Welcome back, {currentUser?.profile?.first_name || 'Driver'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <button
                  onClick={toggleAvailability}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                    driverProfile?.is_available
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {driverProfile?.is_available ? 'Available' : 'Unavailable'}
                </button>
              </div>
              <button
                onClick={onBack}
                className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Driver Profile Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentUser?.profile?.first_name} {currentUser?.profile?.last_name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>📍 {driverProfile?.city}, {driverProfile?.country}</span>
                  <span>🚗 {driverProfile?.vehicle_type}</span>
                  <span>👤 {driverProfile?.account_type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assigned}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Navigation className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayDeliveries}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deliveries List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">My Deliveries</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {delivery.tracking_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {delivery.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {delivery.origin} → {delivery.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(delivery.priority)}`}>
                        {delivery.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {delivery.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {delivery.estimated_delivery ? format(new Date(delivery.estimated_delivery), 'MMM dd, HH:mm') : 'TBD'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {deliveries.length === 0 && (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries assigned</h3>
              <p className="text-gray-600">You don't have any deliveries assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Management Modal */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Manage Delivery - {selectedDelivery.tracking_number}
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Current Status: 
                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDelivery.status)}`}>
                    {selectedDelivery.status.replace('_', ' ')}
                  </span>
                </p>
              </div>
              
              <div className="space-y-3">
                {selectedDelivery.status === 'assigned' && (
                  <button
                    onClick={() => updateDeliveryStatus(selectedDelivery.id, 'in_transit')}
                    className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
                  >
                    Start Transit
                  </button>
                )}
                
                {selectedDelivery.status === 'in_transit' && (
                  <button
                    onClick={() => updateDeliveryStatus(selectedDelivery.id, 'delivered')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Mark as Delivered
                  </button>
                )}
                
                {(selectedDelivery.status === 'assigned' || selectedDelivery.status === 'in_transit') && (
                  <button
                    onClick={() => updateDeliveryStatus(selectedDelivery.id, 'failed')}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Report Issue
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;