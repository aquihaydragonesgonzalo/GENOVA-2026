
import React, { useEffect, useRef } from 'react';
import { Activity } from '../types';
import { ROMAN_WALK_TRACK, GPX_WAYPOINTS } from '../constants';
import L from 'leaflet';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

interface MapProps {
  activities: Activity[];
  userLocation: { lat: number, lng: number } | null;
  focusedLocation: { lat: number, lng: number } | null;
}

const MapComponent: React.FC<MapProps> = ({ activities, userLocation, focusedLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([44.4107, 8.9328], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    layersRef.current.forEach(layer => layer.remove());
    layersRef.current = [];

    const defaultIcon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });

    activities.forEach(act => {
      const marker = L.marker([act.coords.lat, act.coords.lng], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(`
        <div style="padding: 10px; font-family: 'Roboto Condensed', sans-serif; max-width: 200px;">
          <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1e3a8a; font-size: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">${act.title}</h3>
          <p style="margin: 6px 0; font-size: 11px; color: #1e3a8a; font-weight: bold;">${act.locationName}</p>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; line-height: 1.4;">${act.description}</p>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${act.coords.lat},${act.coords.lng}" 
             target="_blank" 
             style="display: block; background: #1e3a8a; color: white; text-align: center; padding: 8px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 10px; letter-spacing: 0.5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
             INDICACIONES (Google Maps)
          </a>
        </div>
      `);
      layersRef.current.push(marker);
    });

    GPX_WAYPOINTS.forEach(wpt => {
      const circleMarker = L.circleMarker([wpt.lat, wpt.lng], {
        radius: 6,
        fillColor: "#BE123C",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);
      circleMarker.bindPopup(`<div style="font-size: 12px; font-weight: bold; color: #BE123C;">${wpt.name}</div>`);
      layersRef.current.push(circleMarker);
    });

    if (ROMAN_WALK_TRACK.length > 0) {
      const trackLine = L.polyline(ROMAN_WALK_TRACK, {
        color: '#1e3a8a',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 12'
      }).addTo(map);
      layersRef.current.push(trackLine);
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.5);"></div>',
        iconSize: [18, 18]
      });
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);
      layersRef.current.push(marker);
    }
  }, [activities, userLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && focusedLocation) {
      mapInstanceRef.current.flyTo([focusedLocation.lat, focusedLocation.lng], 16);
    }
  }, [focusedLocation]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default MapComponent;
