import React, { useState, useEffect } from 'react';
import { MapPin, Package, RefreshCw, Filter, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Delivery } from '../../types/admin';
import { 
  getCurrentPosition, 
  geocodeAddress, 
  calculateDistance,
  Coordinates 
} from '../../services/locationService';
import GPSButton from '../common/GPSButton';
import DeliveryCard from './DeliveryCard';
import DeliveryModal from './DeliveryModal';

interface AvailableDeliveriesProps {
  currentUser: any;
}

interface DeliveryWithDistance extends Delivery {
  distance?: number;
  duration?: number;
}

const AvailableDeliveries: React.FC<AvailableDeliveriesProps> = ({ currentUser }) => {
  const [deliveries, setDeliveries] = useState<DeliveryWithDistance[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>('');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [sortBy, setSortBy] = useState<'distance' | 'priority' | 'price'>('distance');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchAvailableDeliveries();
  }, []);

  useEffect(() => {
    if (driverLocation) {
      calculateDeliveryDistances();
    }
  }, [driverLocation, deliveries]);

  useEffect(() => {
    filterAndSortDeliveries();
  }, [deliveries, maxDistance, sortBy, driverLocation]);

  const fetchAvailableDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('status', 'pending')
        .is('courier_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load available deliveries');
    } finally {
      setLoading(false);
    }
  };

  const calculateDeliveryDistances = async () => {
    if (!driverLocation) return;

    const deliveriesWithDistance = await Promise.all(
      deliveries.map(async (delivery) => {
        try {
          const pickupResult = await geocodeAddress(delivery.origin);
          if (pickupResult) {
            const distance = calculateDistance(driverLocation, pickupResult.coordinates);
            return { ...delivery, distance };
          }
          return delivery;
        } catch (error) {
          console.error('Error calculating distance for delivery:', delivery.id, error);
          return delivery;
        }
      })
    );

    setDeliveries(deliveriesWithDistance);
  };

  const filterAndSortDeliveries = () => {
    let filtered = [...deliveries];

    // Filter by distance if driver location is available
    if (driverLocation) {
      filtered = filtered.filter(delivery => 
        !delivery.distance || delivery.distance <= maxDistance
      );
    }

    // Sort deliveries
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority as keyof typeof priorityOrder] - 
                 priorityOrder[b.priority as keyof typeof priorityOrder];
        
        case 'price':
          return b.cost - a.cost;
        
        default:
          return 0;
      }
    });

    setFilteredDeliveries(filtered);
  };

  const handleLocationFound = (coordinates: Coordinates, address: string) => {
    setDriverLocation(coordinates);
    setLocationAddress(address);
    setError('');
  };

  const handleLocationError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleAcceptDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          courier_id: currentUser.id,
          status: 'assigned'
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // Remove the accepted delivery from the list
      setDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      setSelectedDelivery(null);
      
      // Show success message (you can implement a toast notification here)
      alert('Delivery accepted successfully!');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      alert('Failed to accept delivery. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading available deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Deliveries</h2>
          <p className="text-gray-600">
            {filteredDeliveries.length} deliveries available
            {driverLocation && ` within ${maxDistance} km`}
          </p>
        </div>
        <button
          onClick={fetchAvailableDeliveries}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Location and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* GPS Location */}
          <div className="flex items-center gap-4">
            <GPSButton
              onLocationFound={handleLocationFound}
              onError={handleLocationError}
              className="flex-shrink-0"
            />
            {driverLocation && locationAddress && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-green-600" />
                <span>Current location: {locationAddress}</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Max distance:</label>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
                disabled={!driverLocation}
              >
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100 km</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'priority' | 'price')}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="distance">Distance</option>
                <option value="priority">Priority</option>
                <option value="price">Price</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries Grid */}
      {filteredDeliveries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeliveries.map((delivery) => (
            <DeliveryCard
              key={delivery.id}
              delivery={delivery}
              distance={delivery.distance}
              duration={delivery.duration}
              onClick={() => setSelectedDelivery(delivery)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries available</h3>
          <p className="text-gray-600 mb-4">
            {driverLocation 
              ? `No deliveries found within ${maxDistance} km of your location.`
              : 'Enable GPS to see deliveries near you, or check back later.'
            }
          </p>
          {!driverLocation && (
            <GPSButton
              onLocationFound={handleLocationFound}
              onError={handleLocationError}
              size="lg"
            />
          )}
        </div>
      )}

      {/* Delivery Modal */}
      {selectedDelivery && (
        <DeliveryModal
          delivery={selectedDelivery}
          driverLocation={driverLocation}
          onAccept={handleAcceptDelivery}
          onClose={() => setSelectedDelivery(null)}
        />
      )}
    </div>
  );
};

export default AvailableDeliveries;