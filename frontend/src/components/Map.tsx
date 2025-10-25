import React, { useMemo, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import InfoTooltip from './InfoTooltip';

type Props = {
  brand: string;
  geography: Record<string, number>; // country -> count
  onCountryClick: (country: string) => void;
  disabled?: boolean;
};

type MapStyle = 'osm' | 'carto-light' | 'carto-dark' | 'carto-voyager' | 'esri-street' | 'esri-gray';

const MAP_TILES: Record<MapStyle, { url: string; attribution: string; name: string }> = {
  'esri-street': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    name: 'Esri Street Map'
  },
  'carto-light': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: 'CartoDB Positron (Light)'
  },
  'carto-dark': {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: 'CartoDB Dark Matter'
  },
  'carto-voyager': {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    name: 'CartoDB Voyager'
  },
  'osm': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
    name: 'OpenStreetMap (Standard)'
  },
  'esri-gray': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    name: 'Esri Gray Canvas'
  }
};

// Country centroids for interactive markers (ISO2 -> [lat, lon]) minimal subset
const COUNTRY_CENTROIDS: Record<string, [number, number]> = {
  US: [39.8, -98.6],
  CA: [56.1, -106.3],
  GB: [54.0, -2.0],
  DE: [51.2, 10.5],
  FR: [46.2, 2.2],
  ES: [40.4, -3.7],
  IT: [41.9, 12.6],
  IN: [21.0, 78.0],
  CN: [35.8, 104.2],
  JP: [36.2, 138.3],
  BR: [-14.2, -51.9],
  MX: [23.6, -102.5],
  AU: [-25.3, 133.8],
  NZ: [-41.0, 174.9],
  ZA: [-30.6, 22.9],
  NG: [9.1, 8.7],
  KE: [-0.0, 37.9],
  EG: [26.8, 30.8],
  RU: [61.5, 105.3],
  UA: [48.4, 31.1],
  SE: [60.1, 18.6],
  NO: [60.5, 8.5],
  FI: [64.0, 26.0],
  DK: [56.2, 9.5],
  NL: [52.1, 5.3],
  BE: [50.8, 4.5],
  PL: [52.2, 19.1],
  CZ: [49.8, 15.5],
  AT: [47.5, 14.6],
  CH: [46.8, 8.2],
  PT: [39.4, -8.2],
  IE: [53.3, -8.0],
  TR: [39.0, 35.2],
  IL: [31.0, 35.0],
  SA: [24.0, 45.0],
  AE: [23.4, 53.8],
  IR: [32.4, 54.3],
  PK: [30.4, 69.3],
  BD: [23.7, 90.4],
  ID: [-0.8, 113.9],
  PH: [12.9, 122.8],
  TH: [15.8, 101.0],
  VN: [15.9, 106.3],
  MY: [4.2, 102.0],
  SG: [1.35, 103.8],
  AR: [-38.4, -63.6],
  CL: [-35.7, -71.5],
  CO: [4.6, -74.1],
  PE: [-9.2, -75.0],
  VE: [6.4, -66.6]
};

const Map: React.FC<Props> = ({ brand, geography, onCountryClick, disabled = false }) => {
  const [mapStyle, setMapStyle] = useState<MapStyle>('esri-street');

  // Color-coded ranges with distinct colors
  const getMarkerStyle = (count: number) => {
    if (count >= 100) {
      return { color: '#8B0000', fillColor: '#DC143C', radius: 18 }; // Dark red -> Crimson (100+)
    } else if (count >= 50) {
      return { color: '#CC0000', fillColor: '#FF4444', radius: 15 }; // Red (50-100)
    } else if (count >= 20) {
      return { color: '#E65100', fillColor: '#FF6F00', radius: 12 }; // Dark orange (20-50)
    } else if (count >= 10) {
      return { color: '#F57C00', fillColor: '#FFA726', radius: 10 }; // Orange (10-20)
    } else if (count >= 5) {
      return { color: '#FBC02D', fillColor: '#FFEB3B', radius: 8 }; // Yellow (5-10)
    } else {
      return { color: '#7CB342', fillColor: '#AED581', radius: 6 }; // Light green (1-5)
    }
  };

  const markers = Object.entries(geography)
    .filter(([cc, cnt]) => COUNTRY_CENTROIDS[cc] && cnt >= 3)
    .map(([cc, cnt]) => {
      const [lat, lon] = COUNTRY_CENTROIDS[cc];
      const style = getMarkerStyle(cnt);
      return (
        <CircleMarker
          key={cc}
          center={[lat, lon] as [number, number]}
          radius={style.radius}
          pathOptions={{
            color: style.color,
            fillColor: style.fillColor,
            fillOpacity: disabled ? 0.3 : 0.75,
            weight: 2,
            opacity: disabled ? 0.4 : 0.9
          }}
          eventHandlers={{
            click: (e: LeafletMouseEvent) => {
              if (disabled) return;
              e.originalEvent.stopPropagation();
              e.originalEvent.preventDefault();
              // Remove focus outline
              e.target.getElement()?.blur();
              onCountryClick(cc);
            },
            mouseover: (e: LeafletMouseEvent) => {
              if (disabled) return;
              const marker = e.target;
              marker.setRadius(style.radius * 1.5);
            },
            mouseout: (e: LeafletMouseEvent) => {
              if (disabled) return;
              const marker = e.target;
              marker.setRadius(style.radius);
            }
          }}
          bubblingMouseEvents={false}
        >
          <Tooltip
            direction="top"
            offset={[0, -10]}
            opacity={0.95}
            permanent={false}
          >
            <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
              <strong>{cc}</strong>: {cnt} articles<br/>
              <span style={{ fontSize: '11px', fontStyle: 'italic' }}>Click to generate insights</span>
            </div>
          </Tooltip>
        </CircleMarker>
      );
    });

  const currentTile = MAP_TILES[mapStyle];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 12 }}>
        <select
          value={mapStyle}
          onChange={(e) => setMapStyle(e.target.value as MapStyle)}
          style={{ fontSize: 13, padding: '6px 10px' }}
        >
          {(Object.keys(MAP_TILES) as MapStyle[]).map((key) => (
            <option key={key} value={key}>
              {MAP_TILES[key].name}
            </option>
          ))}
        </select>
      </div>
      <div className="map-wrapper" style={{ width: '100%', borderRadius: 8, overflow: 'hidden', cursor: disabled ? 'not-allowed' : 'default' }}>
        <MapContainer
          center={[15, 20]}
          zoom={1}
          minZoom={1}
          maxZoom={18}
          maxBounds={[[-90, -180], [90, 180]]}
          maxBoundsViscosity={1.0}
          style={{ width: '100%', height: '100%', opacity: disabled ? 0.6 : 1 }}
        >
          <TileLayer
            attribution={currentTile.attribution}
            url={currentTile.url}
            key={mapStyle}
          />
          {markers}
        </MapContainer>
        <style>{`
          .map-wrapper {
            height: 380px;
          }
          .map-wrapper .leaflet-container {
            border-radius: 8px;
          }
          @media (max-width: 768px) {
            .map-wrapper {
              height: 260px;
            }
          }
          @media (max-width: 480px) {
            .map-wrapper {
              height: 200px;
            }
          }
          /* Custom zoom control styling */
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1) !important;
          }
          .leaflet-control-zoom a {
            background-color: #ffffff !important;
            color: #2c3e50 !important;
            border: 1px solid rgba(44, 62, 80, 0.1) !important;
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
            font-size: 20px !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
          }
          .leaflet-control-zoom a:hover {
            background-color: #fc7753 !important;
            color: #ffffff !important;
            border-color: #fc7753 !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(252, 119, 83, 0.3) !important;
          }
          .leaflet-control-zoom a:first-child {
            border-top-left-radius: 8px !important;
            border-top-right-radius: 8px !important;
            border-bottom: none !important;
          }
          .leaflet-control-zoom a:last-child {
            border-bottom-left-radius: 8px !important;
            border-bottom-right-radius: 8px !important;
          }
          .leaflet-control-zoom-in {
            font-family: 'Manrope', sans-serif !important;
          }
          .leaflet-control-zoom-out {
            font-family: 'Manrope', sans-serif !important;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Map;
