import React from 'react';
import GPSButton from './common/GPSButton';
import { Coordinates } from '../services/locationService';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  showGPS?: boolean;
  onLocationFound?: (coordinates: Coordinates, address: string) => void;
  onLocationError?: (error: string) => void;
}

const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  children, 
  showGPS = false,
  onLocationFound,
  onLocationError
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          {title}
        </h3>
        {showGPS && onLocationFound && onLocationError && (
          <GPSButton
            onLocationFound={onLocationFound}
            onError={onLocationError}
            size="sm"
          />
        )}
      </div>
      {children}
    </div>
  );
};

export default FormSection;