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
]

export default function PopularLocations({ onSelectLocation }: PopularLocationsProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Popüler Konumlar</h3>
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
