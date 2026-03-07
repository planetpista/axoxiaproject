import React from 'react';
import { MapPin, Package, Euro, Clock, Navigation } from 'lucide-react';
import { Delivery } from '../../types/admin';

interface DeliveryCardProps {
  delivery: Delivery;
  distance?: number;
  duration?: number;
  onClick: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({ 
  delivery, 
  distance, 
  duration, 
  onClick 
}) => {
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-green-200 bg-green-50',
      medium: 'border-yellow-200 bg-yellow-50',
      high: 'border-orange-200 bg-orange-50',
      urgent: 'border-red-200 bg-red-50'
    };
    return colors[priority as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getPriorityTextColor = (priority: string) => {
    const colors = {
      low: 'text-green-800',
      medium: 'text-yellow-800',
      high: 'text-orange-800',
      urgent: 'text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-800';
  };

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all duration-200 ${getPriorityColor(delivery.priority)}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Package size={18} className="text-purple-600" />
          <span className="font-semibold text-gray-900">{delivery.trackingNumber}</span>
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityTextColor(delivery.priority)} bg-white`}>
          {delivery.priority}
        </span>
      </div>

      {/* Route */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-700 truncate">{delivery.origin}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-700 truncate">{delivery.destination}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Package size={12} />
          <span>{delivery.weight} kg</span>
        </div>
        <div className="flex items-center gap-1">
          <Euro size={12} />
          <span>€{delivery.cost}</span>
        </div>
        {distance && (
          <div className="flex items-center gap-1">
            <Navigation size={12} />
            <span>{distance.toFixed(1)} km</span>
          </div>
        )}
        {duration && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{Math.round(duration / 60)} min</span>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="text-xs text-gray-500">
        {delivery.category}
      </div>
    </div>
  );
};

export default DeliveryCard;