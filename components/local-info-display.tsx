"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Globe, Clock, Sun, Cloud } from "lucide-react"

interface LocalInfoDisplayProps {
  location: {
    latitude: number
    longitude: number
  }
}

interface LocalInfo {
  timezone: string
  localTime: string
  country: string
  region: string
  sunrise: string
  sunset: string
}

export default function LocalInfoDisplay({ location }: LocalInfoDisplayProps) {
  const [localInfo, setLocalInfo] = useState<LocalInfo | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLocalInfo = async () => {
      setLoading(true)
      setError(null)

      try {
        // Yerel bilgileri almak için sunucu API rotamızı kullan
        const response = await fetch(`/api/local-info?lat=${location.latitude}&lon=${location.longitude}`)

        if (!response.ok) {
          throw new Error("Yerel bilgiler alınamadı")
        }

        const data = await response.json()

        // Demo amaçlı, mock veriler oluşturuyoruz
        // Gerçek bir uygulamada, bu veriler API'den gelecektir
        const now = new Date()
        const mockLocalInfo: LocalInfo = {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localTime: now.toLocaleTimeString(),
          country: "Türkiye",
          region: "Ankara",
          sunrise: new Date(now.setHours(6, 30)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sunset: new Date(now.setHours(19, 45)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        setLocalInfo(mockLocalInfo)
      } catch (err) {
        console.error("Yerel bilgiler alınırken hata:", err)
        setError("Yerel bilgiler yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    if (location) {
      fetchLocalInfo()
    }
  }, [location])

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

  if (!localInfo) {
    return <div className="text-center py-8 text-gray-500">Yerel bilgi mevcut değil</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center">
          <Globe className="h-5 w-5 mr-2 text-blue-500" />
          {localInfo.region}, {localInfo.country}
        </h3>
        <p className="text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {localInfo.localTime} ({localInfo.timezone})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Yerel Saat</CardTitle>
            <CardDescription>Bulunduğunuz konumdaki mevcut saat</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{localInfo.localTime}</div>
                <div className="text-sm text-gray-500">{localInfo.timezone}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Gün Işığı</CardTitle>
            <CardDescription>Gün doğumu ve gün batımı saatleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sun className="h-6 w-6 text-yellow-500 mr-2" />
                <div>
                  <div className="text-sm font-medium">Gün Doğumu</div>
                  <div className="text-lg">{localInfo.sunrise}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Cloud className="h-6 w-6 text-blue-300 mr-2" />
                <div>
                  <div className="text-sm font-medium">Gün Batımı</div>
                  <div className="text-lg">{localInfo.sunset}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Konum Bilgileri</CardTitle>
          <CardDescription>Mevcut konumunuz hakkında detaylar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500">Ülke</div>
              <div className="text-lg">{localInfo.country}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Bölge</div>
              <div className="text-lg">{localInfo.region}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Enlem</div>
              <div className="text-lg">{location.latitude.toFixed(6)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">Boylam</div>
              <div className="text-lg">{location.longitude.toFixed(6)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
