import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapContext } from '../context/MapContext'

// Fix broken default icon paths in Vite/Webpack builds
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

function createIncidentIcon(severity = 'medium') {
  const colors = { high: '#ef4444', medium: '#f97316', low: '#eab308' }
  const color = colors[severity] || colors.medium
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:12px;height:12px;background:${color};border-radius:50%;
        border:2px solid rgba(255,255,255,0.4);box-shadow:0 0 0 4px ${color}40;position:relative;
      ">
        <div style="
          position:absolute;inset:-6px;border-radius:50%;
          background:${color};opacity:0.15;
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
      </div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -10],
  })
}

// Pulsing blue crosshair for the feed-selected location
function createFocusIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:#3b82f6;border:2px solid rgba(255,255,255,0.7);
          box-shadow:0 0 0 5px rgba(59,130,246,0.3);
        "></div>
        <div style="
          position:absolute;inset:-8px;border-radius:50%;
          border:1.5px solid rgba(59,130,246,0.5);
          animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  })
}

// Inner component: must live inside MapContainer to use useMap()
function MapFlyController() {
  const map = useMap()
  const { selectedCoordinates } = useMapContext()

  useEffect(() => {
    if (selectedCoordinates) {
      map.flyTo([selectedCoordinates.lat, selectedCoordinates.lng], 7, {
        animate: true,
        duration: 1.2,
      })
    }
  }, [selectedCoordinates, map])

  return null
}

const mapEvents = [
  { id: 1, lat: 48.35, lng: 31.17, headline: 'Artillery exchanges reported along eastern front lines', region: 'Ukraine', severity: 'high', source: 'OSINT Monitor' },
  { id: 2, lat: 32.08, lng: 34.78, headline: 'Heightened air defense activity observed over central region', region: 'Israel / Gaza', severity: 'high', source: 'Satellite Feed' },
  { id: 3, lat: 15.35, lng: 42.76, headline: 'Commercial shipping rerouting as naval threat persists', region: 'Red Sea', severity: 'medium', source: 'SIGINT Monitor' },
  { id: 4, lat: 33.87, lng: 35.49, headline: 'Cross-border fire incidents logged in southern sector', region: 'Lebanon', severity: 'medium', source: 'HUMINT Network' },
  { id: 5, lat: 24.88, lng: 67.09, headline: 'Maritime surveillance uptick near strategic chokepoint', region: 'Arabian Sea', severity: 'low', source: 'Satellite Feed' },
  { id: 6, lat: 35.69, lng: 139.69, headline: 'Increased carrier group activity in contested waters', region: 'Taiwan Strait', severity: 'medium', source: 'SIGINT Monitor' },
]

function popupStyle(children) {
  return (
    <div style={{
      background: '#18181b',
      border: '1px solid #3f3f46',
      borderRadius: '8px',
      padding: '10px 12px',
      maxWidth: '200px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {children}
    </div>
  )
}

export default function ConflictMap() {
  const { selectedCoordinates } = useMapContext()

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <p className="text-[11px] font-semibold text-zinc-200 tracking-widest uppercase">Tactical Map</p>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-zinc-600 uppercase tracking-wide">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Low</span>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 overflow-hidden">
        <MapContainer
          center={[35.0, 35.0]}
          zoom={4}
          style={{ height: '100%', width: '100%', background: '#09090b' }}
          zoomControl={false}
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap &copy; CARTO'
          />

          {/* Listens to context and calls map.flyTo */}
          <MapFlyController />

          {/* Static incident markers */}
          {mapEvents.map((event) => (
            <Marker key={event.id} position={[event.lat, event.lng]} icon={createIncidentIcon(event.severity)}>
              <Popup closeButton={false}>
                {popupStyle(
                  <>
                    <p style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                      {event.region} · {event.source}
                    </p>
                    <p style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: '1.4', margin: 0 }}>
                      {event.headline}
                    </p>
                  </>
                )}
              </Popup>
            </Marker>
          ))}

          {/* Dynamic marker for feed-selected location */}
          {selectedCoordinates && (
            <Marker
              position={[selectedCoordinates.lat, selectedCoordinates.lng]}
              icon={createFocusIcon()}
            >
              <Popup closeButton={false}>
                {popupStyle(
                  <>
                    <p style={{ fontSize: '9px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                      Feed Alert · Geolocated
                    </p>
                    <p style={{ fontSize: '12px', color: '#e4e4e7', lineHeight: '1.4', margin: 0 }}>
                      {selectedCoordinates.headline || 'Location from OSINT feed'}
                    </p>
                  </>
                )}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
