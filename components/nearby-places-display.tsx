"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, AlertTriangle, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NearbyPlacesDisplayProps {
  location: {
    latitude: number
    longitude: number
  }
}

interface Place {
  id: string
  name: string
  vicinity: string
  types: string[]
  distance: number
  icon: string
}

export default function NearbyPlacesDisplay({ location }: NearbyPlacesDisplayProps) {
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>("restaurant")

  useEffect(() => {
    const fetchNearbyPlaces = async () => {
      setLoading(true)
      setError(null)

      try {
        // Yakındaki yerleri almak için sunucu API rotamızı kullan
        const response = await fetch(`/api/places?lat=${location.latitude}&lon=${location.longitude}&type=${category}`)

        if (!response.ok) {
          throw new Error("Yakındaki yerler alınamadı")
        }

        const data = await response.json()

        // Gerçek bir Places API entegrasyonumuz olmadığı için demo amaçlı mock veriler
        const mockPlaces: Place[] = [
          {
            id: "1",
            name: "Yerel Kahve Dükkanı",
            vicinity: "123 Ana Cadde",
            types: ["cafe", "restaurant"],
            distance: 0.3,
            icon: "☕",
          },
          {
            id: "2",
            name: "Şehir Parkı",
            vicinity: "456 Park Caddesi",
            types: ["park", "tourist_attraction"],
            distance: 0.7,
            icon: "🌳",
          },
          {
            id: "3",
            name: "Merkez Restoran",
            vicinity: "789 Yemek Sokak",
            types: ["restaurant", "bar"],
            distance: 1.2,
            icon: "🍽️",
          },
          {
            id: "4",
            name: "Topluluk Kütüphanesi",
            vicinity: "101 Kitap Sokak",
            types: ["library", "establishment"],
            distance: 1.5,
            icon: "📚",
          },
          {
            id: "5",
            name: "Yerel Market",
            vicinity: "202 Alışveriş Bulvarı",
            types: ["grocery_or_supermarket", "store"],
            distance: 0.9,
            icon: "🛒",
          },
        ]

        setPlaces(mockPlaces)
      } catch (err) {
        console.error("Yakındaki yerler alınırken hata:", err)
        setError("Yakındaki yerler yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    if (location) {
      fetchNearbyPlaces()
    }
  }, [location, category])

  const categories = [
    { id: "restaurant", name: "Restoranlar" },
    { id: "cafe", name: "Kafeler" },
    { id: "park", name: "Parklar" },
    { id: "store", name: "Mağazalar" },
    { id: "attraction", name: "Turistik Yerler" },
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={category === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {places.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Yakında yer bulunamadı</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.map((place) => (
            <Card key={place.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      <span className="mr-2">{place.icon}</span>
                      {place.name}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {place.vicinity}
                    </CardDescription>
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {place.distance} km
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 capitalize">
                    {place.types.slice(0, 2).join(", ").replace(/_/g, " ")}
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Navigation className="h-4 w-4 mr-1" />
                    <span className="text-xs">Yol Tarifi</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
