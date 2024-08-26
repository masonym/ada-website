import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const Map = ({ placeId }) => {
  const [place, setPlace] = useState(null);
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(true);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY,
    libraries: ['places'],
  });

  const getPlaceDetails = useCallback(() => {
    if (!window.google) return;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    service.getDetails({ placeId: placeId, fields: ['name', 'formatted_address', 'rating', 'user_ratings_total', 'geometry'] }, (result, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setPlace(result);
      } else {
        console.error('Place details request failed:', status);
      }
    });
  }, [placeId]);

  useEffect(() => {
    if (isLoaded && placeId) {
      getPlaceDetails();
    }
  }, [isLoaded, placeId, getPlaceDetails]);

  const mapContainerStyle = {
    height: '400px',
    width: '800px',
    position: 'relative',
  };

  const toggleInfoWindow = () => {
    setIsInfoWindowOpen(!isInfoWindowOpen);
  };

  if (loadError) return "Error loading maps";
  if (!isLoaded) return "Loading Maps";
  if (!place) return "Loading place details...";

  const largeIcon = {
    scaledSize: new window.google.maps.Size(50, 50),
    origin: new window.google.maps.Point(0, 0),
    anchor: new window.google.maps.Point(25, 50),
  };
  const infoWindowStyle = {
    background: `white`,
    border: `1px solid #ccc`,
    padding: 15
  };

  return (
    <div style={mapContainerStyle}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }}
        zoom={18}
      >
        <Marker
          position={{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }}
          icon={largeIcon}
          onClick={toggleInfoWindow}
        />
        {isInfoWindowOpen && (
          <InfoWindow
            position={{ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }}
            onCloseClick={toggleInfoWindow}
            options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
          >
            <div style={infoWindowStyle}>
              <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 'bold' }}>{place.name}</h2>
              <p style={{ margin: '0 0 5px', fontSize: '14px' }}>{place.formatted_address}</p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default Map;