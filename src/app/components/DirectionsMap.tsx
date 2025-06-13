"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';

interface DirectionsMapProps {
  originPlaceId: string;
  destinationPlaceId: string;
  originName?: string;
  destinationName?: string;
  travelMode?: string;
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({
  originPlaceId,
  destinationPlaceId,
  originName = "Event Location",
  destinationName = "VIP Reception",
  travelMode = "WALKING"
}) => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [origin, setOrigin] = useState<google.maps.LatLngLiteral | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLngLiteral | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const fetchPlaceDetails = useCallback(async (placeId: string) => {
    return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
      if (!window.google) {
        reject("Google Maps API not loaded");
        return;
      }

      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(
        { placeId, fields: ['geometry'] },
        (result, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
            resolve({
              lat: result.geometry.location.lat(),
              lng: result.geometry.location.lng(),
            });
          } else {
            reject(`Place details request failed: ${status}`);
          }
        }
      );
    });
  }, []);

  const fetchDirections = useCallback(async () => {
    if (!window.google || !origin || !destination) return;

    const directionsService = new window.google.maps.DirectionsService();

    try {
      const result = await directionsService.route({
        origin,
        destination,
        travelMode: travelMode as google.maps.TravelMode,
      });

      setDirectionsResponse(result);
      
      if (result.routes[0]?.legs[0]) {
        setDistance(result.routes[0].legs[0].distance?.text || null);
        setDuration(result.routes[0].legs[0].duration?.text || null);
      }
    } catch (error) {
      setError("Could not calculate directions");
      console.error("Directions request failed:", error);
    }
  }, [origin, destination, travelMode]);

  useEffect(() => {
    if (isLoaded) {
      Promise.all([
        fetchPlaceDetails(originPlaceId),
        fetchPlaceDetails(destinationPlaceId)
      ])
        .then(([originResult, destinationResult]) => {
          setOrigin(originResult);
          setDestination(destinationResult);
        })
        .catch(error => {
          setError(error);
          console.error(error);
        });
    }
  }, [isLoaded, originPlaceId, destinationPlaceId, fetchPlaceDetails]);

  useEffect(() => {
    if (origin && destination) {
      fetchDirections();
    }
  }, [origin, destination, fetchDirections]);

  const mapContainerStyle = {
    height: '400px',
    width: '100%',
    borderRadius: '8px',
  };

  if (loadError) return <div className="p-4 text-red-500">Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div className="p-4">Loading Maps...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  const center = origin || { lat: 0, lng: 0 };

  return (
    <div className="w-full">
      <div style={mapContainerStyle}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={14}
          options={{
            zoomControl: true,
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
          }}
        >
          {directionsResponse && (
            <DirectionsRenderer
              directions={directionsResponse}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: "#1a73e8",
                  strokeWeight: 5,
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
      {distance && duration && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Walking Directions</h4>
          <p className="mb-1">From: <span className="font-medium">{originName}</span></p>
          <p className="mb-1">To: <span className="font-medium">{destinationName}</span></p>
          <p className="mb-1">Distance: <span className="font-medium">{distance}</span></p>
          <p>Walking time: <span className="font-medium">{duration}</span></p>
        </div>
      )}
    </div>
  );
};

export default DirectionsMap;
