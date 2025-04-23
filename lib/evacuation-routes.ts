// Tahliye rotaları için tip tanımlamaları ve yardımcı fonksiyonlar

// Konum tipi
export interface GeoPoint {
  lat: number
  lng: number
}

// Güvenli bölge tipi
export interface SafeZone {
  id: string
  name: string
  location: GeoPoint
  type: "SHELTER" | "HIGH_GROUND" | "EMERGENCY_CENTER" | "HOSPITAL" | "SCHOOL"
  capacity: number
  hasWater: boolean
  hasFood: boolean
  hasMedicalSupport: boolean
  isAccessible: boolean
  description: string
  contactInfo?: string
}

// Tahliye rotası tipi
export interface EvacuationRoute {
  id: string
  name: string
  description: string
  path: GeoPoint[]
  safeZoneId: string
  distance: number // metre cinsinden
  estimatedTime: number // dakika cinsinden
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  isAccessible: boolean // Engelli erişimine uygun mu?
  isClosed: boolean // Yol kapalı mı?
  closureReason?: string
  lastUpdated: string
}

// Tehlikeli bölge tipi
export interface DangerZone {
  id: string
  name: string
  description: string
  area: GeoPoint[] // Polygon koordinatları
  riskLevel: "MEDIUM" | "HIGH" | "EXTREME"
  type: "FLOOD" | "LANDSLIDE" | "BRIDGE_FAILURE" | "ROAD_DAMAGE"
  lastUpdated: string
}

// Tahliye bilgisi tipi
export interface EvacuationInfo {
  safeZones: SafeZone[]
  routes: EvacuationRoute[]
  dangerZones: DangerZone[]
  lastUpdated: string
}

// Koordinatlara göre tahliye bilgisi alma
export async function getEvacuationInfo(lat: number, lng: number): Promise<EvacuationInfo> {
  try {
    // Gerçek bir API'den veri çekme (simülasyon)
    const response = await fetch(`/api/evacuation-routes?lat=${lat}&lng=${lng}`)

    if (!response.ok) {
      throw new Error(`Tahliye rotaları API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Tahliye rotaları verisi çekme hatası:", error)
    // Hata durumunda mock veri döndür
    return generateMockEvacuationData(lat, lng)
  }
}

// Mock tahliye verisi oluşturma
function generateMockEvacuationData(lat: number, lng: number): EvacuationInfo {
  // Mevcut konumun etrafında rastgele güvenli bölgeler oluştur
  const safeZones: SafeZone[] = [
    {
      id: "sz1",
      name: "Acil Durum Toplanma Alanı 1",
      location: { lat: lat + 0.01, lng: lng + 0.01 },
      type: "EMERGENCY_CENTER",
      capacity: 500,
      hasWater: true,
      hasFood: true,
      hasMedicalSupport: true,
      isAccessible: true,
      description: "Ana acil durum toplanma alanı. 24 saat açık ve tam donanımlı.",
      contactInfo: "112",
    },
    {
      id: "sz2",
      name: "Yüksek Tepe",
      location: { lat: lat - 0.008, lng: lng + 0.015 },
      type: "HIGH_GROUND",
      capacity: 200,
      hasWater: false,
      hasFood: false,
      hasMedicalSupport: false,
      isAccessible: false,
      description: "Şehrin en yüksek noktası. Sel sularından etkilenmez.",
    },
    {
      id: "sz3",
      name: "Merkez İlkokulu",
      location: { lat: lat + 0.005, lng: lng - 0.012 },
      type: "SCHOOL",
      capacity: 350,
      hasWater: true,
      hasFood: true,
      hasMedicalSupport: false,
      isAccessible: true,
      description: "Geçici barınma alanı olarak düzenlenmiş okul binası.",
      contactInfo: "0312 555 1234",
    },
    {
      id: "sz4",
      name: "Devlet Hastanesi",
      location: { lat: lat - 0.015, lng: lng - 0.008 },
      type: "HOSPITAL",
      capacity: 250,
      hasWater: true,
      hasFood: true,
      hasMedicalSupport: true,
      isAccessible: true,
      description: "Tam donanımlı hastane. Acil durum jeneratörü ve ek kapasitesi mevcut.",
      contactInfo: "0312 555 5678",
    },
  ]

  // Her güvenli bölge için rotalar oluştur
  const routes: EvacuationRoute[] = []

  safeZones.forEach((zone, index) => {
    // Ana rota
    const mainPath = generatePath(lat, lng, zone.location.lat, zone.location.lng, 5)
    routes.push({
      id: `route-${index}-1`,
      name: `${zone.name} Ana Rotası`,
      description: `${zone.name}'na giden ana tahliye rotası`,
      path: mainPath,
      safeZoneId: zone.id,
      distance: calculateDistance(mainPath) * 1000, // km'den m'ye çevir
      estimatedTime: Math.round((calculateDistance(mainPath) * 1000) / 50), // 50m/dk yürüme hızı
      riskLevel: "LOW",
      isAccessible: zone.isAccessible,
      isClosed: false,
      lastUpdated: new Date().toISOString(),
    })

    // Alternatif rota
    const altPath = generatePath(lat, lng, zone.location.lat, zone.location.lng, 8, true)
    routes.push({
      id: `route-${index}-2`,
      name: `${zone.name} Alternatif Rotası`,
      description: `${zone.name}'na giden alternatif tahliye rotası`,
      path: altPath,
      safeZoneId: zone.id,
      distance: calculateDistance(altPath) * 1000,
      estimatedTime: Math.round((calculateDistance(altPath) * 1000) / 50),
      riskLevel: index === 0 ? "MEDIUM" : index === 1 ? "HIGH" : "LOW",
      isAccessible: index !== 1,
      isClosed: index === 1,
      closureReason: index === 1 ? "Köprü hasarlı" : undefined,
      lastUpdated: new Date().toISOString(),
    })
  })

  // Tehlikeli bölgeler oluştur
  const dangerZones: DangerZone[] = [
    {
      id: "dz1",
      name: "Dere Yatağı",
      description: "Ani su baskını riski yüksek dere yatağı",
      area: [
        { lat: lat + 0.005, lng: lng - 0.005 },
        { lat: lat + 0.008, lng: lng - 0.003 },
        { lat: lat + 0.007, lng: lng + 0.005 },
        { lat: lat + 0.003, lng: lng + 0.004 },
        { lat: lat + 0.005, lng: lng - 0.005 },
      ],
      riskLevel: "EXTREME",
      type: "FLOOD",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "dz2",
      name: "Hasarlı Köprü",
      description: "Sel nedeniyle hasar görmüş köprü",
      area: [
        { lat: lat - 0.003, lng: lng + 0.008 },
        { lat: lat - 0.002, lng: lng + 0.009 },
        { lat: lat - 0.001, lng: lng + 0.008 },
        { lat: lat - 0.002, lng: lng + 0.007 },
        { lat: lat - 0.003, lng: lng + 0.008 },
      ],
      riskLevel: "HIGH",
      type: "BRIDGE_FAILURE",
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "dz3",
      name: "Heyelan Bölgesi",
      description: "Yağış nedeniyle heyelan riski olan bölge",
      area: [
        { lat: lat - 0.01, lng: lng - 0.002 },
        { lat: lat - 0.008, lng: lng - 0.001 },
        { lat: lat - 0.006, lng: lng - 0.003 },
        { lat: lat - 0.008, lng: lng - 0.005 },
        { lat: lat - 0.01, lng: lng - 0.002 },
      ],
      riskLevel: "MEDIUM",
      type: "LANDSLIDE",
      lastUpdated: new Date().toISOString(),
    },
  ]

  return {
    safeZones,
    routes,
    dangerZones,
    lastUpdated: new Date().toISOString(),
  }
}

// İki nokta arasında rastgele bir rota oluştur
function generatePath(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  numPoints: number,
  isAlternative = false,
): GeoPoint[] {
  const path: GeoPoint[] = []
  path.push({ lat: startLat, lng: startLng })

  // Başlangıç ve bitiş arasında rastgele noktalar oluştur
  const latDiff = endLat - startLat
  const lngDiff = endLng - startLng

  for (let i = 1; i < numPoints - 1; i++) {
    const ratio = i / (numPoints - 1)
    const randomFactor = isAlternative ? 0.008 : 0.004 // Alternatif rota daha dolambaçlı
    const randomLat = (Math.random() - 0.5) * randomFactor
    const randomLng = (Math.random() - 0.5) * randomFactor

    path.push({
      lat: startLat + latDiff * ratio + randomLat,
      lng: startLng + lngDiff * ratio + randomLng,
    })
  }

  path.push({ lat: endLat, lng: endLng })
  return path
}

// Haversine formülü ile iki nokta arasındaki mesafeyi hesapla (km)
function calculateDistance(path: GeoPoint[]): number {
  let totalDistance = 0

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i]
    const p2 = path[i + 1]

    const R = 6371 // Dünya'nın yarıçapı (km)
    const dLat = deg2rad(p2.lat - p1.lat)
    const dLng = deg2rad(p2.lng - p1.lng)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(p1.lat)) * Math.cos(deg2rad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    totalDistance += distance
  }

  return totalDistance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Güvenli bölge tipi için ikon ve renk belirleme
export function getSafeZoneIcon(type: string): string {
  switch (type) {
    case "SHELTER":
      return "home"
    case "HIGH_GROUND":
      return "mountain"
    case "EMERGENCY_CENTER":
      return "tent"
    case "HOSPITAL":
      return "stethoscope"
    case "SCHOOL":
      return "school"
    default:
      return "flag"
  }
}

export function getSafeZoneColor(type: string): string {
  switch (type) {
    case "SHELTER":
      return "#4CAF50" // Yeşil
    case "HIGH_GROUND":
      return "#9C27B0" // Mor
    case "EMERGENCY_CENTER":
      return "#2196F3" // Mavi
    case "HOSPITAL":
      return "#F44336" // Kırmızı
    case "SCHOOL":
      return "#FF9800" // Turuncu
    default:
      return "#607D8B" // Gri
  }
}

// Rota risk seviyesi için renk belirleme
export function getRouteRiskColor(riskLevel: string): string {
  switch (riskLevel) {
    case "LOW":
      return "#4CAF50" // Yeşil
    case "MEDIUM":
      return "#FF9800" // Turuncu
    case "HIGH":
      return "#F44336" // Kırmızı
    default:
      return "#607D8B" // Gri
  }
}

// Tehlikeli bölge tipi için ikon ve renk belirleme
export function getDangerZoneIcon(type: string): string {
  switch (type) {
    case "FLOOD":
      return "droplet"
    case "LANDSLIDE":
      return "mountain-snow"
    case "BRIDGE_FAILURE":
      return "bridge"
    case "ROAD_DAMAGE":
      return "road"
    default:
      return "alert-triangle"
  }
}

export function getDangerZoneColor(riskLevel: string): string {
  switch (riskLevel) {
    case "MEDIUM":
      return "#FF9800" // Turuncu
    case "HIGH":
      return "#F44336" // Kırmızı
    case "EXTREME":
      return "#9C27B0" // Mor
    default:
      return "#607D8B" // Gri
  }
}

// Mesafeyi formatla
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters.toFixed(0)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

// Süreyi formatla
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} dk`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours} sa ${remainingMinutes > 0 ? `${remainingMinutes} dk` : ""}`
}
