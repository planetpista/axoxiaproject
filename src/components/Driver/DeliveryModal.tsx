import React, { useState, useEffect } from 'react';
import { X, MapPin, Package, Euro, Clock, Navigation, ExternalLink } from 'lucide-react';
import { Delivery } from '../../types/admin';
import { 
  geocodeAddress, 
  calculateRoute, 
  generateGoogleMapsLink, 
  generateWazeLink,
  Coordinates,
  RouteResult
} from '../../services/locationService';

interface DeliveryModalProps {
  delivery: Delivery;
  driverLocation?: Coordinates;
  onAccept: (deliveryId: string) => void;
  onClose: () => void;
}

const DeliveryModal: React.FC<DeliveryModalProps> = ({
  delivery,
  driverLocation,
  onAccept,
  onClose
}) => {
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRouteInfo = async () => {
      try {
        // Geocode pickup and dropoff locations
        const [pickupResult, dropoffResult] = await Promise.all([
          geocodeAddress(delivery.origin),
          geocodeAddress(delivery.destination)
        ]);

        if (pickupResult && dropoffResult) {
          setPickupCoords(pickupResult.coordinates);
          setDropoffCoords(dropoffResult.coordinates);

          // Calculate route if driver location is available
          if (driverLocation) {
            const route = await calculateRoute(driverLocation, pickupResult.coordinates);
            setRouteInfo(route);
          }
        }
      } catch (error) {
        console.error('Error loading route info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRouteInfo();
  }, [delivery, driverLocation]);

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
              <p className="text-sm text-gray-600">{delivery.trackingNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Priority and Category */}
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(delivery.priority)}`}>
              {delivery.priority} priority
            </span>
            <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full">
              {delivery.category}
            </span>
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Route</h3>
            
            {/* Pickup */}
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-4 h-4 bg-green-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-green-800">Pickup</p>
                <p className="text-sm text-green-700">{delivery.origin}</p>
              </div>
            </div>

            {/* Dropoff */}
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="font-medium text-red-800">Drop-off</p>
                <p className="text-sm text-red-700">{delivery.destination}</p>
              </div>
            </div>
          </div>

          {/* Distance and Duration */}
          {routeInfo && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Navigation size={16} />
                  <span className="text-sm font-medium">Distance</span>
                </div>
                <p className="text-lg font-bold text-blue-800">
                  {formatDistance(routeInfo.distance)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Clock size={16} />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-lg font-bold text-blue-800">
                  {formatDuration(routeInfo.duration)}
                </p>
              </div>
            </div>
          )}

          {/* Package Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Package Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Weight: {delivery.weight} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro size={16} className="text-gray-400" />
                <span className="text-sm text-gray-600">Value: €{delivery.cost}</span>
              </div>
            </div>
            {delivery.dimensions && (
              <div className="text-sm text-gray-600">
                Dimensions: {delivery.dimensions.length} × {delivery.dimensions.width} × {delivery.dimensions.height} cm
              </div>
            )}
            {delivery.insurance && (
              <div className="text-sm text-green-600 font-medium">
                ✓ Insured (€{delivery.insuranceCost})
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {pickupCoords && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Navigation</h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={generateGoogleMapsLink(pickupCoords, driverLocation)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">Google Maps</span>
                </a>
                <a
                  href={generateWazeLink(pickupCoords)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  <ExternalLink size={16} />
                  <span className="text-sm font-medium">Waze</span>
                </a>
              </div>
            </div>
          )}

          {/* Notes */}
          {delivery.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Notes</h3>
              <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {delivery.notes}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Close
          </button>
          <button
            onClick={() => onAccept(delivery.id)}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            Accept Delivery
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryModal;