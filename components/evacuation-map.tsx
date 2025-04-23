"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Home,
  Mountain,
  Tent,
  School,
  Stethoscope,
  Flag,
  Droplet,
  AlertTriangle,
  BracketsIcon as Bridge,
  RouteIcon as Road,
  MapPin,
  Navigation,
  Info,
  Clock,
  ShipWheelIcon as Wheelchair,
  X,
  RefreshCw,
  List,
  Map,
} from "lucide-react"
import {
  getEvacuationInfo,
  type SafeZone,
  type EvacuationRoute,
  type DangerZone,
  getSafeZoneIcon,
  getSafeZoneColor,
  getRouteRiskColor,
  getDangerZoneIcon,
  getDangerZoneColor,
  formatDistance,
  formatTime,
} from "@/lib/evacuation-routes"

interface EvacuationMapProps {
  location: {
    latitude: number
    longitude: number
  }
  locationName: string
}

// Harita merkezi güncelleme bileşeni
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function EvacuationMap({ location, locationName }: EvacuationMapProps) {
  const [loading, setLoading] = useState(true)
  const [evacuationInfo, setEvacuationInfo] = useState<{
    safeZones: SafeZone[]
    routes: EvacuationRoute[]
    dangerZones: DangerZone[]
    lastUpdated: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("map")
  const [selectedSafeZone, setSelectedSafeZone] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Harita merkezi
  const mapCenter: [number, number] = [location.latitude, location.longitude]
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const loadEvacuationInfo = async () => {
      if (!location) return

      setLoading(true)
      setError(null)
      setRefreshing(true)

      try {
        const data = await getEvacuationInfo(location.latitude, location.longitude)
        setEvacuationInfo(data)
      } catch (error) {
        console.error("Tahliye rotaları yüklenirken hata:", error)
        setError("Tahliye rotaları yüklenemedi. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    loadEvacuationInfo()
  }, [location])

  // Güvenli bölge seçildiğinde ilgili rotaları göster
  useEffect(() => {
    if (selectedSafeZone && evacuationInfo) {
      // İlgili güvenli bölgeye ait rotaları bul
      const routes = evacuationInfo.routes.filter((route) => route.safeZoneId === selectedSafeZone)

      // İlk rotayı seç
      if (routes.length > 0 && !selectedRoute) {
        setSelectedRoute(routes[0].id)
      }

      // Harita varsa, güvenli bölgeye zoom yap
      if (mapRef.current && selectedSafeZone) {
        const safeZone = evacuationInfo.safeZones.find((zone) => zone.id === selectedSafeZone)
        if (safeZone) {
          mapRef.current.setView([safeZone.location.lat, safeZone.location.lng], 14)
        }
      }
    }
  }, [selectedSafeZone, evacuationInfo, selectedRoute])

  // Yenile butonu işleyicisi
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      const data = await getEvacuationInfo(location.latitude, location.longitude)
      setEvacuationInfo(data)
    } catch (error) {
      console.error("Tahliye rotaları yenilenirken hata:", error)
      setError("Tahliye rotaları yenilenemedi. Lütfen daha sonra tekrar deneyin.")
    } finally {
      setRefreshing(false)
    }
  }

  // Güvenli bölge ikonu oluştur
  const createSafeZoneIcon = (type: string) => {
    const iconName = getSafeZoneIcon(type)
    const iconColor = getSafeZoneColor(type)

    let iconComponent
    switch (iconName) {
      case "home":
        iconComponent = <Home className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "mountain":
        iconComponent = <Mountain className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "tent":
        iconComponent = <Tent className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "school":
        iconComponent = <School className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "stethoscope":
        iconComponent = <Stethoscope className="h-6 w-6" style={{ color: iconColor }} />
        break
      default:
        iconComponent = <Flag className="h-6 w-6" style={{ color: iconColor }} />
    }

    return L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2" style="border-color: ${iconColor}">
              <div style="color: ${iconColor}">${iconComponent}</div>
            </div>`,
      className: "custom-div-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }

  // Tehlikeli bölge ikonu oluştur
  const createDangerZoneIcon = (type: string, riskLevel: string) => {
    const iconName = getDangerZoneIcon(type)
    const iconColor = getDangerZoneColor(riskLevel)

    let iconComponent
    switch (iconName) {
      case "droplet":
        iconComponent = <Droplet className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "mountain-snow":
        iconComponent = <Mountain className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "bridge":
        iconComponent = <Bridge className="h-6 w-6" style={{ color: iconColor }} />
        break
      case "road":
        iconComponent = <Road className="h-6 w-6" style={{ color: iconColor }} />
        break
      default:
        iconComponent = <AlertTriangle className="h-6 w-6" style={{ color: iconColor }} />
    }

    return L.divIcon({
      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2" style="border-color: ${iconColor}">
              <div style="color: ${iconColor}">${iconComponent}</div>
            </div>`,
      className: "custom-div-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    })
  }

  // Tehlikeli bölge tipi için ikon bileşeni
  const getDangerZoneIconComponent = (type: string) => {
    switch (type) {
      case "FLOOD":
        return <Droplet className="h-4 w-4 mr-1" />
      case "LANDSLIDE":
        return <Mountain className="h-4 w-4 mr-1" />
      case "BRIDGE_FAILURE":
        return <Bridge className="h-4 w-4 mr-1" />
      case "ROAD_DAMAGE":
        return <Road className="h-4 w-4 mr-1" />
      default:
        return <AlertTriangle className="h-4 w-4 mr-1" />
    }
  }

  // Güvenli bölge tipi için ikon bileşeni
  const getSafeZoneIconComponent = (type: string) => {
    switch (type) {
      case "SHELTER":
        return <Home className="h-4 w-4 mr-1" />
      case "HIGH_GROUND":
        return <Mountain className="h-4 w-4 mr-1" />
      case "EMERGENCY_CENTER":
        return <Tent className="h-4 w-4 mr-1" />
      case "HOSPITAL":
        return <Stethoscope className="h-4 w-4 mr-1" />
      case "SCHOOL":
        return <School className="h-4 w-4 mr-1" />
      default:
        return <Flag className="h-4 w-4 mr-1" />
    }
  }

  // Risk seviyesi için renk ve metin
  const getRiskLevelBadge = (riskLevel: string) => {
    let color = ""
    let text = ""

    switch (riskLevel) {
      case "LOW":
        color = "bg-green-100 text-green-800 border-green-200"
        text = "Düşük Risk"
        break
      case "MEDIUM":
        color = "bg-yellow-100 text-yellow-800 border-yellow-200"
        text = "Orta Risk"
        break
      case "HIGH":
        color = "bg-orange-100 text-orange-800 border-orange-200"
        text = "Yüksek Risk"
        break
      case "EXTREME":
        color = "bg-red-100 text-red-800 border-red-200"
        text = "Çok Yüksek Risk"
        break
      default:
        color = "bg-gray-100 text-gray-800 border-gray-200"
        text = "Bilinmeyen Risk"
    }

    return <Badge className={color}>{text}</Badge>
  }

  if (!isMounted) {
    return <div>Harita yükleniyor...</div>
  }

  if (loading && !evacuationInfo) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-[500px] w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (error && !evacuationInfo) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!evacuationInfo) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Bilgi</AlertTitle>
        <AlertDescription>Tahliye rotaları verisi bulunamadı.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Tahliye Rotaları</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-1">{refreshing ? "Yenileniyor..." : "Yenile"}</span>
          </Button>
        </div>
        <CardDescription>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {locationName} ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="map" className="flex items-center">
                <Map className="h-4 w-4 mr-2" />
                Harita
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Liste
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="map" className="mt-0">
            <div className="h-[500px] relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(map) => {
                  mapRef.current = map
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Mevcut konum işaretleyicisi */}
                <Marker position={mapCenter}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-medium">Mevcut Konumunuz</h3>
                      <p className="text-sm text-gray-600">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>

                {/* Güvenli bölgeler */}
                {evacuationInfo.safeZones.map((zone) => (
                  <Marker
                    key={zone.id}
                    position={[zone.location.lat, zone.location.lng]}
                    icon={L.divIcon({
                      html: `<div class="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2" style="border-color: ${getSafeZoneColor(
                        zone.type,
                      )}">
                              <div style="color: ${getSafeZoneColor(zone.type)}">${getSafeZoneIconComponent(
                                zone.type,
                              )}</div>
                            </div>`,
                      className: "custom-div-icon",
                      iconSize: [40, 40],
                      iconAnchor: [20, 20],
                    })}
                    eventHandlers={{
                      click: () => {
                        setSelectedSafeZone(zone.id)
                      },
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <h3 className="font-medium">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.description}</p>
                        <div className="mt-2 text-sm">
                          <div>Kapasite: {zone.capacity} kişi</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {zone.hasWater && <Badge variant="outline">Su</Badge>}
                            {zone.hasFood && <Badge variant="outline">Yiyecek</Badge>}
                            {zone.hasMedicalSupport && <Badge variant="outline">Tıbbi Destek</Badge>}
                            {zone.isAccessible && (
                              <Badge variant="outline" className="flex items-center">
                                <Wheelchair className="h-3 w-3 mr-1" />
                                Erişilebilir
                              </Badge>
                            )}
                          </div>
                          {zone.contactInfo && <div className="mt-1">İletişim: {zone.contactInfo}</div>}
                        </div>
                        <Button size="sm" className="mt-2 w-full" onClick={() => setSelectedSafeZone(zone.id)}>
                          Rotaları Göster
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Seçili güvenli bölgeye ait rotalar */}
                {selectedSafeZone &&
                  evacuationInfo.routes
                    .filter((route) => route.safeZoneId === selectedSafeZone)
                    .map((route) => (
                      <Polyline
                        key={route.id}
                        positions={route.path.map((p) => [p.lat, p.lng])}
                        pathOptions={{
                          color: getRouteRiskColor(route.riskLevel),
                          weight: selectedRoute === route.id ? 6 : 3,
                          opacity: route.isClosed ? 0.5 : 1,
                          dashArray: route.isClosed ? "5, 10" : "",
                        }}
                        eventHandlers={{
                          click: () => {
                            setSelectedRoute(route.id)
                          },
                        }}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-medium">{route.name}</h3>
                            <p className="text-sm text-gray-600">{route.description}</p>
                            <div className="mt-2 text-sm">
                              <div className="flex items-center">
                                <Navigation className="h-4 w-4 mr-1" />
                                Mesafe: {formatDistance(route.distance)}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Tahmini Süre: {formatTime(route.estimatedTime)}
                              </div>
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Risk: {getRiskLevelBadge(route.riskLevel)}
                              </div>
                              {route.isAccessible && (
                                <div className="flex items-center mt-1">
                                  <Wheelchair className="h-4 w-4 mr-1" />
                                  Engelli Erişimine Uygun
                                </div>
                              )}
                              {route.isClosed && (
                                <div className="flex items-center mt-1 text-red-600">
                                  <X className="h-4 w-4 mr-1" />
                                  Yol Kapalı: {route.closureReason}
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => setSelectedRoute(route.id)}
                              variant={selectedRoute === route.id ? "default" : "outline"}
                            >
                              {selectedRoute === route.id ? "Seçili Rota" : "Bu Rotayı Seç"}
                            </Button>
                          </div>
                        </Popup>
                      </Polyline>
                    ))}

                {/* Tehlikeli bölgeler */}
                {evacuationInfo.dangerZones.map((zone) => (
                  <Polygon
                    key={zone.id}
                    positions={zone.area.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: getDangerZoneColor(zone.riskLevel),
                      fillColor: getDangerZoneColor(zone.riskLevel),
                      fillOpacity: 0.3,
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-medium">{zone.name}</h3>
                        <p className="text-sm text-gray-600">{zone.description}</p>
                        <div className="mt-2 text-sm">
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Risk: {getRiskLevelBadge(zone.riskLevel)}
                          </div>
                          <div className="flex items-center mt-1">
                            {getDangerZoneIconComponent(zone.type)}
                            Tip:{" "}
                            {zone.type === "FLOOD"
                              ? "Sel Bölgesi"
                              : zone.type === "LANDSLIDE"
                                ? "Heyelan Bölgesi"
                                : zone.type === "BRIDGE_FAILURE"
                                  ? "Hasarlı Köprü"
                                  : zone.type === "ROAD_DAMAGE"
                                    ? "Hasarlı Yol"
                                    : "Tehlikeli Bölge"}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                ))}

                <MapUpdater center={mapCenter} />
              </MapContainer>
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0 px-6 pb-6">
            <div className="space-y-6">
              {/* Güvenli Bölgeler Listesi */}
              <div>
                <h3 className="text-lg font-medium mb-2">Güvenli Bölgeler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {evacuationInfo.safeZones.map((zone) => (
                    <Card
                      key={zone.id}
                      className={`overflow-hidden cursor-pointer transition-colors ${
                        selectedSafeZone === zone.id ? "border-2 border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedSafeZone(zone.id)}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center">
                          {getSafeZoneIconComponent(zone.type)}
                          {zone.name}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {zone.type === "SHELTER"
                            ? "Barınma Alanı"
                            : zone.type === "HIGH_GROUND"
                              ? "Yüksek Bölge"
                              : zone.type === "EMERGENCY_CENTER"
                                ? "Acil Durum Merkezi"
                                : zone.type === "HOSPITAL"
                                  ? "Hastane"
                                  : zone.type === "SCHOOL"
                                    ? "Okul"
                                    : "Güvenli Bölge"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-3">
                        <p className="text-sm mb-2">{zone.description}</p>
                        <div className="text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Kapasite:</span>
                            <span className="font-medium">{zone.capacity} kişi</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {zone.hasWater && <Badge variant="outline">Su</Badge>}
                            {zone.hasFood && <Badge variant="outline">Yiyecek</Badge>}
                            {zone.hasMedicalSupport && <Badge variant="outline">Tıbbi Destek</Badge>}
                            {zone.isAccessible && (
                              <Badge variant="outline" className="flex items-center">
                                <Wheelchair className="h-3 w-3 mr-1" />
                                Erişilebilir
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button size="sm" className="w-full">
                          Rotaları Göster
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Seçili Güvenli Bölge için Rotalar */}
              {selectedSafeZone && (
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {evacuationInfo.safeZones.find((z) => z.id === selectedSafeZone)?.name} için Tahliye Rotaları
                  </h3>
                  <div className="space-y-4">
                    {evacuationInfo.routes
                      .filter((route) => route.safeZoneId === selectedSafeZone)
                      .map((route) => (
                        <Card
                          key={route.id}
                          className={`overflow-hidden cursor-pointer transition-colors ${
                            selectedRoute === route.id ? "border-2 border-blue-500" : ""
                          } ${route.isClosed ? "opacity-60" : ""}`}
                          onClick={() => setSelectedRoute(route.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">{route.name}</CardTitle>
                              {getRiskLevelBadge(route.riskLevel)}
                            </div>
                            <CardDescription className="text-xs">{route.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center">
                                <Navigation className="h-4 w-4 mr-1 text-blue-600" />
                                <span>Mesafe: {formatDistance(route.distance)}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1 text-blue-600" />
                                <span>Süre: {formatTime(route.estimatedTime)}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {route.isAccessible && (
                                <Badge variant="outline" className="flex items-center">
                                  <Wheelchair className="h-3 w-3 mr-1" />
                                  Erişilebilir
                                </Badge>
                              )}
                              {route.isClosed && (
                                <Badge variant="destructive" className="flex items-center">
                                  <X className="h-3 w-3 mr-1" />
                                  Yol Kapalı
                                </Badge>
                              )}
                            </div>
                            {route.isClosed && route.closureReason && (
                              <div className="mt-2 text-sm text-red-600">
                                <AlertTriangle className="h-4 w-4 inline mr-1" />
                                {route.closureReason}
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button
                              size="sm"
                              className="w-full"
                              variant={selectedRoute === route.id ? "default" : "outline"}
                              disabled={route.isClosed}
                            >
                              {selectedRoute === route.id
                                ? "Seçili Rota"
                                : route.isClosed
                                  ? "Kullanılamaz"
                                  : "Bu Rotayı Seç"}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

              {/* Tehlikeli Bölgeler */}
              <div>
                <h3 className="text-lg font-medium mb-2">Tehlikeli Bölgeler</h3>
                <div className="space-y-2">
                  {evacuationInfo.dangerZones.map((zone) => (
                    <Alert
                      key={zone.id}
                      className={
                        zone.riskLevel === "EXTREME"
                          ? "bg-red-50 border-red-200"
                          : zone.riskLevel === "HIGH"
                            ? "bg-orange-50 border-orange-200"
                            : "bg-yellow-50 border-yellow-200"
                      }
                    >
                      <div className="flex items-start">
                        {getDangerZoneIconComponent(zone.type)}
                        <div>
                          <AlertTitle className="flex items-center">
                            {zone.name} {getRiskLevelBadge(zone.riskLevel)}
                          </AlertTitle>
                          <AlertDescription>{zone.description}</AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500 pt-2">
        <div>Son güncelleme: {new Date(evacuationInfo.lastUpdated).toLocaleString()}</div>
        <div>
          <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => setActiveTab("map")}>
            Haritaya Dön
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
