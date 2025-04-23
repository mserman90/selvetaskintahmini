"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, RefreshCw, AlertTriangle, Compass, Info } from "lucide-react"
import WeatherDisplay from "@/components/weather-display"
import LocalInfoDisplay from "@/components/local-info-display"
import PopularLocations from "@/components/popular-locations"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { debounce } from "@/lib/utils"
import FloodRiskDisplay from "@/components/flood-risk-display"
import ManagementPlansDisplay from "@/components/management-plans-display"
import FlashFloodPredictionDisplay from "@/components/flash-flood-prediction-display"
import AlertSystemManager from "@/components/alert-system-manager"

// Konum tipi tanımı
interface Location {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

// Hata tipleri tanımı
type LocationErrorType = "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN"

interface LocationError {
  type: LocationErrorType
  message: string
}

export default function LocationBasedDataExplorer() {
  // Bileşen fonksiyonunun başında
  const [isBrowser, setIsBrowser] = useState(false)

  // Konum verisi için state
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<LocationError | null>(null)
  const [activeTab, setActiveTab] = useState<string>("flood")
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [isGeolocationAvailable, setIsGeolocationAvailable] = useState<boolean>(false)
  const [showManualInput, setShowManualInput] = useState<boolean>(false) // Varsayılan olarak false (otomatik konum)
  const [locationName, setLocationName] = useState<string>("Konum Belirleniyor...") // Başlangıç durumu

  // Diğer state tanımlamalarından sonra bunu ekleyin
  const [manualLocation, setManualLocation] = useState<{
    latitude: string
    longitude: string
  }>({
    latitude: "39.956", // Varsayılan olarak Ankara
    longitude: "32.894",
  })

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Kısıtlı bir ortamda olup olmadığımızı kontrol et (iframe, önizleme, vb.)
  useEffect(() => {
    if (!isBrowser) return

    // iframe içinde olup olmadığımızı kontrol et
    const isInIframe = window !== window.parent

    // Tarayıcıda konum belirlemenin mevcut olup olmadığını kontrol et
    const hasGeolocation = "geolocation" in navigator

    // Konum belirlemenin muhtemelen mevcut olup olmadığını ayarla
    setIsGeolocationAvailable(hasGeolocation && !isInIframe)

    // Kısıtlı bir ortamdaysak, varsayılan olarak manuel girişi göster
    if (!hasGeolocation || isInIframe) {
      setShowManualInput(true)

      // Varsayılan konumu ayarla
      const defaultLocation = {
        latitude: 39.956,
        longitude: 32.894,
        accuracy: 1000,
        timestamp: Date.now(),
      }
      setLocation(defaultLocation)
      setLocationName("Ankara")
      setLoading(false)
    } else {
      // Konum belirleme mevcut ise, otomatik olarak konumu al
      getLocation()
    }
  }, [isBrowser])

  // Konum alma fonksiyonu
  const getLocation = useCallback(() => {
    if (!isBrowser) return

    if (!isGeolocationAvailable) {
      setError({
        type: "UNKNOWN",
        message: "Bu ortamda konum belirleme kullanılamıyor",
      })
      setShowManualInput(true)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setLocationName("Konum Belirleniyor...")

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          }

          setLocation(newLocation)
          try {
            localStorage.setItem("lastLocation", JSON.stringify(newLocation))
            setLocationName("Mevcut Konum")
            localStorage.setItem("lastLocationName", "Mevcut Konum")
          } catch (e) {
            console.error("localStorage'a kaydetme hatası:", e)
          }
          setLoading(false)
          setRefreshing(false)
        },
        (error) => {
          let errorType: LocationErrorType = "UNKNOWN"
          let errorMessage = "Bilinmeyen bir hata oluştu"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorType = "PERMISSION_DENIED"
              errorMessage =
                "Kullanıcı konum belirleme isteğini reddetti veya konum belirleme izin politikası tarafından devre dışı bırakıldı"
              break
            case error.POSITION_UNAVAILABLE:
              errorType = "POSITION_UNAVAILABLE"
              errorMessage = "Konum bilgisi kullanılamıyor"
              break
            case error.TIMEOUT:
              errorType = "TIMEOUT"
              errorMessage = "Kullanıcı konumunu alma isteği zaman aşımına uğradı"
              break
          }

          setError({ type: errorType, message: errorMessage })
          setShowManualInput(true)
          setLoading(false)
          setRefreshing(false)

          // Hata durumunda varsayılan konumu ayarla
          const defaultLocation = {
            latitude: 39.956,
            longitude: 32.894,
            accuracy: 1000,
            timestamp: Date.now(),
          }
          setLocation(defaultLocation)
          setLocationName("Ankara (Varsayılan)")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 dakika
        },
      )
    } catch (e) {
      console.error("Konum belirleme hatası:", e)
      setError({
        type: "UNKNOWN",
        message: "Konum belirlemeye erişilemedi. Bu, tarayıcı kısıtlamaları veya izin politikası nedeniyle olabilir.",
      })
      setShowManualInput(true)
      setLoading(false)
      setRefreshing(false)

      // Hata durumunda varsayılan konumu ayarla
      const defaultLocation = {
        latitude: 39.956,
        longitude: 32.894,
        accuracy: 1000,
        timestamp: Date.now(),
      }
      setLocation(defaultLocation)
      setLocationName("Ankara (Varsayılan)")
    }
  }, [isGeolocationAvailable, isBrowser])

  // Çok fazla çağrıyı önlemek için debounce edilmiş getLocation versiyonu
  const debouncedGetLocation = useCallback(debounce(getLocation, 1000), [getLocation])

  // Verileri manuel olarak yenileme fonksiyonu
  const handleRefresh = () => {
    setRefreshing(true)
    if (isGeolocationAvailable && !showManualInput) {
      getLocation()
    } else {
      // Manuel koordinatlar kullanılıyorsa sadece bir yenileme simüle et
      setTimeout(() => setRefreshing(false), 1000)
    }
  }

  // Manuel konum gönderimini işleme
  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newLocation = {
      latitude: Number.parseFloat(manualLocation.latitude),
      longitude: Number.parseFloat(manualLocation.longitude),
      accuracy: 1000, // Manuel giriş için varsayılan doğruluk
      timestamp: Date.now(),
    }

    setLocation(newLocation)
    try {
      localStorage.setItem("lastLocation", JSON.stringify(newLocation))
      setLocationName("Özel Konum")
      localStorage.setItem("lastLocationName", "Özel Konum")
    } catch (e) {
      console.error("localStorage'a kaydetme hatası:", e)
    }
    setError(null)
    setLoading(false)
  }

  const handleManualLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setManualLocation((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Popüler konum seçimini işleme
  const handlePopularLocationSelect = (lat: number, lon: number, name: string) => {
    const newLocation = {
      latitude: lat,
      longitude: lon,
      accuracy: 1000, // Manuel giriş için varsayılan doğruluk
      timestamp: Date.now(),
    }

    setLocation(newLocation)
    try {
      localStorage.setItem("lastLocation", JSON.stringify(newLocation))
      setLocationName(name)
      localStorage.setItem("lastLocationName", name)
    } catch (e) {
      console.error("localStorage'a kaydetme hatası:", e)
    }
    setError(null)
    setLoading(false)

    // Manuel giriş alanlarını eşleşecek şekilde güncelle
    setManualLocation({
      latitude: lat.toString(),
      longitude: lon.toString(),
    })
  }

  // Manuel giriş ve konum belirleme arasında geçiş
  const toggleLocationMethod = () => {
    if (showManualInput) {
      // Konum belirlemeye geç
      if (isGeolocationAvailable) {
        setShowManualInput(false)
        getLocation()
      }
    } else {
      // Manuel girişe geç
      setShowManualInput(true)
    }
  }

  // İki nokta arasındaki mesafeyi Haversine formülü kullanarak hesaplama
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Dünya'nın yarıçapı (km)
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Mesafe (km)
    return d
  }

  function deg2rad(deg: number): number {
    return deg * (Math.PI / 180)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-blue-500" />
              {locationName}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Yenile
            </Button>
          </CardTitle>
          <CardDescription>
            {loading ? (
              <Skeleton className="h-4 w-full" />
            ) : location ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <span className="flex items-center">
                  <Compass className="mr-1 h-4 w-4 text-blue-500" />
                  Enlem: {location.latitude.toFixed(6)}, Boylam: {location.longitude.toFixed(6)}
                </span>
                {!showManualInput && (
                  <span className="text-gray-500 text-xs">(Doğruluk: ±{Math.round(location.accuracy)} metre)</span>
                )}
              </div>
            ) : (
              "Konum verisi mevcut değil"
            )}
          </CardDescription>
        </CardHeader>

        {error && (
          <CardContent className="pt-0 pb-4">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Konum Hatası</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          </CardContent>
        )}

        {!isGeolocationAvailable && !error && (
          <CardContent className="pt-0 pb-4">
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Konum Belirleme Kullanılamıyor</AlertTitle>
              <AlertDescription>
                Bu ortamda konum belirleme kullanılamıyor. Bu, bir iframe veya önizlemede görüntülediğiniz için
                olabilir. Lütfen bunun yerine manuel koordinatları kullanın.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {showManualInput && (
          <CardContent className="pt-0 pb-4">
            <form onSubmit={handleManualLocationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="latitude" className="text-sm font-medium">
                    Enlem
                  </label>
                  <input
                    id="latitude"
                    name="latitude"
                    type="text"
                    value={manualLocation.latitude}
                    onChange={handleManualLocationChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="örn. 39.956"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="longitude" className="text-sm font-medium">
                    Boylam
                  </label>
                  <input
                    id="longitude"
                    name="longitude"
                    type="text"
                    value={manualLocation.longitude}
                    onChange={handleManualLocationChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="örn. 32.894"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Bu Koordinatları Kullan</Button>
                {isGeolocationAvailable && (
                  <Button variant="outline" onClick={toggleLocationMethod} type="button">
                    Konum Belirlemeyi Dene
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-4">
              <PopularLocations onSelectLocation={handlePopularLocationSelect} />
            </div>
          </CardContent>
        )}

        {!showManualInput && isGeolocationAvailable && (
          <CardContent className="pt-0 pb-4">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={toggleLocationMethod}>
                Koordinatları Manuel Gir
              </Button>
            </div>
          </CardContent>
        )}

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="flood">Sel Riski</TabsTrigger>
              <TabsTrigger value="flash-flood">Ani Su Baskını</TabsTrigger>
              <TabsTrigger value="alerts">Uyarı Sistemi</TabsTrigger>
              <TabsTrigger value="weather">Hava Durumu</TabsTrigger>
              <TabsTrigger value="plans">Yönetim Planları</TabsTrigger>
              <TabsTrigger value="info">Yerel Bilgi</TabsTrigger>
            </TabsList>

            <TabsContent value="flood" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : location ? (
                <FloodRiskDisplay location={location} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Sel riski bilgilerini görüntülemek için lütfen konum verisi sağlayın
                </div>
              )}
            </TabsContent>

            <TabsContent value="flash-flood" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : location ? (
                <FlashFloodPredictionDisplay location={location} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ani su baskını tahminlerini görüntülemek için lütfen konum verisi sağlayın
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : location ? (
                <AlertSystemManager
                  location={{
                    name: locationName,
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Uyarı sistemini görüntülemek için lütfen konum verisi sağlayın
                </div>
              )}
            </TabsContent>

            <TabsContent value="weather" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : location ? (
                <WeatherDisplay location={location} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Hava durumu bilgilerini görüntülemek için lütfen konum verisi sağlayın
                </div>
              )}
            </TabsContent>

            <TabsContent value="plans" className="mt-0">
              <ManagementPlansDisplay />
            </TabsContent>

            <TabsContent value="info" className="mt-0">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : location ? (
                <LocalInfoDisplay location={location} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Yerel bilgileri görüntülemek için lütfen konum verisi sağlayın
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between text-xs text-gray-500 pt-2">
          <div>Son güncelleme: {location ? new Date(location.timestamp).toLocaleString() : "Hiç"}</div>
          <div>{showManualInput ? "Manuel koordinatlar kullanılıyor" : "Konum belirleme verisi kullanılıyor"}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
