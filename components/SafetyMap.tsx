import React, { useEffect, useRef } from 'react';
import { Location } from '../types';
import L from 'leaflet';

interface SafetyMapProps {
  location: Location | null;
  status: string;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ location, status }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([0, 0], 2);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && location) {
      const { lat, lng } = location;
      mapInstance.current.setView([lat, lng], 16);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.circleMarker([lat, lng], {
          radius: 10,
          fillColor: status === 'DANGER' ? '#ef4444' : '#6366f1',
          color: '#fff',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstance.current);
      }

      // Update color based on status
      markerRef.current.setStyle({
        fillColor: status === 'DANGER' ? '#ef4444' : '#6366f1'
      });
    }
  }, [location, status]);

  const handleZoomIn = () => mapInstance.current?.zoomIn();
  const handleZoomOut = () => mapInstance.current?.zoomOut();

  return (
    <div className="relative w-full h-64 bg-slate-200 rounded-2xl overflow-hidden shadow-inner border border-slate-300">
      <div ref={mapRef} className="w-full h-full" />
      
      {!location && (
        <div className="absolute inset-0 z-[10] flex items-center justify-center bg-slate-100/50 backdrop-blur-sm">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent mb-2"></div>
            <p className="text-sm text-slate-600 font-medium">Acquiring GPS Signal...</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-[10]">
        <div className="glass px-3 py-2 rounded-lg text-xs font-bold text-slate-700">
          📍 Real-time Tracking Active
        </div>
        <div className="flex flex-col gap-1">
          <button 
            onClick={handleZoomIn}
            className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          </button>
          <button 
            onClick={handleZoomOut}
            className="bg-white p-2 rounded-full shadow-md text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyMap;