import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface MapProps {
    address: string;
}

const Map: React.FC<MapProps> = ({ address }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initMap = async (lat: number, lng: number) => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
                version: "weekly",
            });

            try {
                const { Map } = await loader.importLibrary("maps");

                const position = { lat, lng };
                const mapOptions: google.maps.MapOptions = {
                    center: position,
                    zoom: 17,
                };

                if (mapRef.current) {
                    new Map(mapRef.current, mapOptions);
                }
            } catch (error) {
                console.error("Error initializing map:", error);
                setError("Failed to initialize Google Maps.");
            }
        };

        const geocodeAddress = async (address: string) => {
            const loader = new Loader({
                apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY as string,
                version: "weekly",
            });

            try {
                const { Geocoder } = await loader.importLibrary("geocoding");
                const geocoder = new Geocoder();

                const results = await geocoder.geocode({ address });

                if (results.results.length > 0) {
                    const { location } = results.results[0].geometry;
                    initMap(location.lat(), location.lng());
                } else {
                    setError("No results found for the given address.");
                }
            } catch (error) {
                console.error("Geocoding error:", error);
                setError("Failed to geocode the address.");
            }
        };

        if (address) {
            geocodeAddress(address);
        }
    }, [address]);

    return (
        <div>
            {error && <p className="text-red-500">{error}</p>}
            <div style={{ width: "100%", height: "400px" }} ref={mapRef} />
        </div>
    );
};

export default Map;