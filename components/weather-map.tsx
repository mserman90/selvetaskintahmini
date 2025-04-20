"use client"

import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import type { Location } from "@/lib/types"
import { getWeatherMapTileUrl } from "@/lib/api-services"

interface WeatherMapProps {
  chartType: string
  model: string
  forecastStep: number
  selectedLocation: Location
}

// Fix for Leaflet marker icon in Next.js
const markerIcon = new Icon({
  iconUrl: "/placeholder.svg?height=41&width=25",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function MapUpdater({ selectedLocation }: { selectedLocation: Location }) {
  const map = useMap()

  useEffect(() => {
    map.setView([selectedLocation.lat, selectedLocation.lon], 7)
  }, [map, selectedLocation])

  return null
}

// OpenWeatherMap katman türünü belirle
function getLayerType(chartType: string): string {
  switch (chartType) {
    case "accprecip":
    case "precipitation":
      return "precipitation_new"
    case "2mtemp":
      return "temp_new"
    case "winteroverview":
      return "snow"
    default:
      return "clouds_new"
  }
}

export default function WeatherMap({ chartType, model, forecastStep, selectedLocation }: WeatherMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const mapRef = useRef<any>(null)
  const layerType = getLayerType(chartType)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="h-full w-full flex items-center justify-center">Loading map...</div>
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[selectedLocation.lat, selectedLocation.lon]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hava durumu katmanı - Sunucu taraflı API üzerinden */}
        {model === "openweathermap" && (
          <TileLayer url={getWeatherMapTileUrl(layerType, "{z}", "{x}", "{y}")} opacity={0.6} />
        )}

        <Marker position={[selectedLocation.lat, selectedLocation.lon]} icon={markerIcon}>
          <Popup>
            <div className="text-center">
              <h3 className="font-medium">{selectedLocation.name}</h3>
              <p className="text-sm text-gray-600">
                {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        <MapUpdater selectedLocation={selectedLocation} />
      </MapContainer>

      <div className="mt-2 text-center text-sm text-gray-500">
        <p>
          {model.toUpperCase()} modeli, {forecastStep} saatlik tahmin
        </p>
      </div>
    </div>
  )
}
