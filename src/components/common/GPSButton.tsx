import React, { useState } from 'react';
import { MapPin, Loader } from 'lucide-react';
import { getCurrentPosition, reverseGeocode, Coordinates } from '../../services/locationService';

interface GPSButtonProps {
  onLocationFound: (coordinates: Coordinates, address: string) => void;
  onError?: (error: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const GPSButton: React.FC<GPSButtonProps> = ({ 
  onLocationFound, 
  onError, 
  className = '',
  size = 'md'
}) => {
  const [loading, setLoading] = useState(false);

  const handleGetLocation = async () => {
    setLoading(true);
    try {
      const coordinates = await getCurrentPosition();
      const address = await reverseGeocode(coordinates);
      
      onLocationFound(coordinates, address || 'Unknown location');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get location';
      onError?.(errorMessage);
      console.error('GPS error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'p-2 text-sm',
    md: 'p-3',
    lg: 'p-4 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button
      onClick={handleGetLocation}
      disabled={loading}
      className={`flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${sizeClasses[size]} ${className}`}
      title="Get current location"
    >
      {loading ? (
        <Loader size={iconSizes[size]} className="animate-spin" />
      ) : (
        <MapPin size={iconSizes[size]} />
      )}
      {size !== 'sm' && (
        <span>{loading ? 'Getting location...' : 'Use GPS'}</span>
      )}
    </button>
  );
};

export default GPSButton;