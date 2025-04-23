import { NextResponse } from "next/server"
import type { EvacuationInfo, SafeZone, EvacuationRoute, DangerZone, GeoPoint } from "@/lib/evacuation-routes"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "Enlem ve boylam parametreleri gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek bir sistemde, burada bir veritabanı sorgusu veya harici API çağrısı yapılır
    // Bu örnekte, mock veri döndürüyoruz

    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    // Mock tahliye verisi oluştur
    const evacuationInfo = generateMockEvacuationData(latitude, longitude)

    return NextResponse.json(evacuationInfo)
  } catch (error) {
    console.error("Tahliye rotaları verisi oluşturma hatası:", error)
    return NextResponse.json({ error: "Tahliye rotaları verisi oluşturulamadı" }, { status: 500 })
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
