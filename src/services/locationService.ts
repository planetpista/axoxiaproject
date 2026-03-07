import axios from 'axios';

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImExYWY4ZTQyN2I5OTRmODBhNzNiODdlOWJiZDMwYzI5IiwiaCI6Im11cm11cjY0In0=';
const ORS_BASE_URL = 'https://api.openrouteservice.org';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodeResult {
  coordinates: Coordinates;
  address: string;
  confidence: number;
}

export interface RouteResult {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: Coordinates[];
}

// Geocode an address to coordinates
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
  try {
    const response = await axios.get(`${ORS_BASE_URL}/geocode/search`, {
      params: {
        api_key: ORS_API_KEY,
        text: address,
        size: 1
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      const feature = response.data.features[0];
      return {
        coordinates: {
          lng: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1]
        },
        address: feature.properties.label,
        confidence: feature.properties.confidence
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (coordinates: Coordinates): Promise<string | null> => {
  try {
    const response = await axios.get(`${ORS_BASE_URL}/geocode/reverse`, {
      params: {
        api_key: ORS_API_KEY,
        'point.lon': coordinates.lng,
        'point.lat': coordinates.lat,
        size: 1
      }
    });

    if (response.data.features && response.data.features.length > 0) {
      return response.data.features[0].properties.label;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

// Calculate route between two points
export const calculateRoute = async (
  start: Coordinates,
  end: Coordinates
): Promise<RouteResult | null> => {
  try {
    const response = await axios.post(
      `${ORS_BASE_URL}/v2/directions/driving-car`,
      {
        coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
        format: 'json'
      },
      {
        headers: {
          'Authorization': ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.summary.distance,
        duration: route.summary.duration,
        coordinates: route.geometry.coordinates.map((coord: number[]) => ({
          lng: coord[0],
          lat: coord[1]
        }))
      };
    }
    return null;
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
};

// Get current GPS position
export const getCurrentPosition = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Generate Google Maps navigation link
export const generateGoogleMapsLink = (destination: Coordinates, origin?: Coordinates): string => {
  const baseUrl = 'https://www.google.com/maps/dir/';
  if (origin) {
    return `${baseUrl}${origin.lat},${origin.lng}/${destination.lat},${destination.lng}`;
  }
  return `${baseUrl}/${destination.lat},${destination.lng}`;
};

// Generate Waze navigation link
export const generateWazeLink = (destination: Coordinates): string => {
  return `https://waze.com/ul?ll=${destination.lat}%2C${destination.lng}&navigate=yes`;
};