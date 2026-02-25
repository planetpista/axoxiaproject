import React, { useState } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, X, Filter, Search } from 'lucide-react';
import { Alert } from '../../types/admin';
import { format } from 'date-fns';

interface AlertsManagementProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
  onDismissAlert: (id: string) => void;
  onCreateAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
}

const AlertsManagement: React.FC<AlertsManagementProps> = ({
  alerts,
  onMarkAsRead,
  onDismissAlert,
  onCreateAlert
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newAlert, setNewAlert] = useState({
    type: 'system' as 'delay' | 'incident' | 'system' | 'payment',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    title: '',
    message: '',
    deliveryId: '',
    userId: '',
    isRead: false
  });

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesType = typeFilter === 'all' || alert.type === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const criticalCount = alerts.filter(alert => alert.severity === 'critical').length;

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      critical: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      low: Info,
      medium: Bell,
      high: AlertTriangle,
      critical: AlertTriangle
    };
    return icons[severity as keyof typeof icons] || Info;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      delay: 'bg-yellow-100 text-yellow-800',
      incident: 'bg-red-100 text-red-800',
      system: 'bg-blue-100 text-blue-800',
      payment: 'bg-green-100 text-green-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateAlert = () => {
    onCreateAlert(newAlert);
    setNewAlert({
      type: 'system',
      severity: 'medium',
      title: '',
      message: '',
      deliveryId: '',
      userId: '',
      isRead: false
    });
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts Management</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-sm text-gray-600">
              {unreadCount} unread alerts
            </span>
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                <AlertTriangle size={16} />
                {criticalCount} critical alerts
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Bell size={20} />
          Create Alert
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="delay">Delay</option>
              <option value="incident">Incident</option>
              <option value="system">System</option>
              <option value="payment">Payment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const SeverityIcon = getSeverityIcon(alert.severity);
          return (
            <div
              key={alert.id}
              className={`bg-white rounded-lg p-6 shadow-sm border-l-4 ${
                alert.isRead ? 'border-gray-200' : getSeverityColor(alert.severity).split(' ')[2]
              } ${!alert.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <SeverityIcon size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${!alert.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {alert.title}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(alert.type)}`}>
                        {alert.type}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{alert.message}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                      {alert.deliveryId && (
                        <span>Delivery: {alert.deliveryId.slice(0, 8)}</span>
                      )}
                      {alert.userId && (
                        <span>User: {alert.userId.slice(0, 8)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!alert.isRead && (
                    <button
                      onClick={() => onMarkAsRead(alert.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Mark as read"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    title="Dismiss alert"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredAlerts.length === 0 && (
          <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">There are no alerts matching your current filters.</p>
          </div>
        )}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Alert</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Alert title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Alert message..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="system">System</option>
                    <option value="delay">Delay</option>
                    <option value="incident">Incident</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery ID (Optional)</label>
                <input
                  type="text"
                  value={newAlert.deliveryId}
                  onChange={(e) => setNewAlert({ ...newAlert, deliveryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Related delivery ID..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID (Optional)</label>
                <input
                  type="text"
                  value={newAlert.userId}
                  onChange={(e) => setNewAlert({ ...newAlert, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Related user ID..."
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsManagement;