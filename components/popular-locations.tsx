"use client"

import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"

interface PopularLocationsProps {
  onSelectLocation: (lat: number, lon: number, name: string) => void
}

const popularLocations = [
  { name: "Ankara", lat: 39.956, lon: 32.894 },
  { name: "İstanbul", lat: 41.015, lon: 28.979 },
  { name: "İzmir", lat: 38.423, lon: 27.143 },
  { name: "Antalya", lat: 36.897, lon: 30.713 },
  { name: "Bursa", lat: 40.183, lon: 29.067 },
  // Sel riski yüksek iller
  { name: "Rize", lat: 41.025, lon: 40.517 },
  { name: "Artvin", lat: 41.182, lon: 41.819 },
  { name: "Trabzon", lat: 41.005, lon: 39.723 },
  { name: "Giresun", lat: 40.912, lon: 38.389 },
  { name: "Samsun", lat: 41.292, lon: 36.331 },
  { name: "Hatay", lat: 36.202, lon: 36.16 },
  { name: "Mersin", lat: 36.812, lon: 34.641 },
  { name: "Edirne", lat: 41.677, lon: 26.556 },
  { name: "Düzce", lat: 40.843, lon: 31.162 },
  { name: "Kastamonu", lat: 41.376, lon: 33.775 },
]

export default function PopularLocations({ onSelectLocation }: PopularLocationsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Popüler Konumlar</h3>
      <p className="text-xs text-gray-500 mb-2">Büyük şehirler ve sel riski yüksek bölgeler</p>
      <div className="flex flex-wrap gap-2">
        {popularLocations.map((location) => (
          <Button
            key={location.name}
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={() => onSelectLocation(location.lat, location.lon, location.name)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {location.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
