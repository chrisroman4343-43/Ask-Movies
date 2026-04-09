import { createContext, useContext, useState } from 'react'

const MapContext = createContext(null)

export function MapProvider({ children }) {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)
  const [activeTab, setActiveTab] = useState('feed')

  // Switches to the map tab and pans to the given location.
  // Optional headline is forwarded so the map can show it in a popup.
  function focusOnLocation(lat, lng, headline = null) {
    setSelectedCoordinates({ lat, lng, headline })
    setActiveTab('map')
  }

  return (
    <MapContext.Provider value={{ selectedCoordinates, activeTab, setActiveTab, focusOnLocation }}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext() {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
