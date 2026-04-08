'use client';

import { useEffect, useRef } from 'react';

export default function BakeryMap({ bakeries, center, userLocation, selectedSlug, onSelectBar }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([center?.lat || 48.8, center?.lng || 2.3], 11);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      if (center?.lat && center?.lng) {
        map.setView([center.lat, center.lng], 12);
      }

      markersRef.current.forEach(m => map.removeLayer(m));
      markersRef.current = [];

      // "You are here" pulsing blue dot
      if (userLocation?.lat && userLocation?.lng) {
        const pulseIcon = L.divIcon({
          html: `<div style="position:relative;width:18px;height:18px;">
            <div style="position:absolute;inset:0;background:rgba(59,130,246,0.3);border-radius:50%;animation:pulse 2s ease-out infinite;"></div>
            <div style="position:absolute;top:4px;left:4px;width:10px;height:10px;background:#3b82f6;border:2px solid #fff;border-radius:50%;box-shadow:0 0 6px rgba(59,130,246,0.6);"></div>
          </div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: pulseIcon, zIndexOffset: 1000 })
          .addTo(map)
          .bindTooltip('You are here', { direction: 'top', offset: [0, -10] });
        markersRef.current.push(userMarker);

        if (!document.getElementById('pulse-animation')) {
          const style = document.createElement('style');
          style.id = 'pulse-animation';
          style.textContent = '@keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3); opacity: 0; } }';
          document.head.appendChild(style);
        }
      }

      const bounds = [];

      // Separate bakeries with exact coords from city-level ones
      const exactBars = bakeries.filter(b => b.exact);
      const cityBars = bakeries.filter(b => !b.exact);

      // Add individual markers for bakeries with exact coordinates
      for (const bakery of exactBars) {
        const isSelected = bakery.slug === selectedSlug;
        const rank = bakery.rank || '';
        const isTop10 = rank && rank <= 10;
        const size = isSelected ? 28 : (isTop10 ? 26 : 22);

        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${isSelected ? '#f5f0e8' : isTop10 ? '#d4944c' : 'rgba(212,148,76,0.85)'};border:2px solid ${isSelected ? '#d4944c' : 'rgba(8,8,8,0.6)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${rank > 99 ? 7 : 9}px;font-weight:700;color:#080808;font-family:Outfit,sans-serif;box-shadow:0 1px 6px rgba(0,0,0,0.5);cursor:pointer;${isSelected ? 'z-index:1000;' : ''}">${rank}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([bakery.lat, bakery.lng], { icon })
          .addTo(map)
          .bindTooltip(`#${rank} ${bakery.name}`, {
            className: 'bakery-tooltip',
            direction: 'top',
            offset: [0, -size / 2],
          });

        marker.on('click', () => onSelectBar?.(bakery.slug));
        markersRef.current.push(marker);
        bounds.push([bakery.lat, bakery.lng]);
      }

      // Group city-level bakeries by location
      const cityGroups = {};
      for (const bakery of cityBars) {
        const key = `${bakery.lat},${bakery.lng}`;
        if (!cityGroups[key]) cityGroups[key] = { lat: bakery.lat, lng: bakery.lng, bakeries: [], city: bakery.city };
        cityGroups[key].bakeries.push(bakery);
      }

      for (const group of Object.values(cityGroups)) {
        const isSelected = group.bakeries.some(b => b.slug === selectedSlug);
        const count = group.bakeries.length;
        const size = isSelected ? 36 : Math.min(30 + Math.log10(count) * 8, 44);

        const icon = L.divIcon({
          html: `<div style="width:${size}px;height:${size}px;background:${isSelected ? '#f5f0e8' : 'rgba(212,148,76,0.85)'};border:2px solid ${isSelected ? '#d4944c' : 'rgba(8,8,8,0.6)'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${count > 99 ? 9 : 11}px;font-weight:700;color:#080808;font-family:Outfit,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:pointer;">${count}</div>`,
          className: '',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([group.lat, group.lng], { icon })
          .addTo(map)
          .bindTooltip(`${group.city} \u00b7 ${count} bakeries`, {
            className: 'bakery-tooltip',
            direction: 'top',
            offset: [0, -size / 2],
          });

        marker.on('click', () => onSelectBar?.(group.bakeries[0].slug));
        markersRef.current.push(marker);
        bounds.push([group.lat, group.lng]);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      }
    });
  }, [bakeries, center, userLocation, selectedSlug]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const observer = new ResizeObserver(() => {
      mapInstanceRef.current?.invalidateSize();
    });
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 400,
        borderRadius: 12,
        overflow: 'hidden',
        background: '#111',
      }}
    />
  );
}
