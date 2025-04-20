import { NextResponse } from "next/server"
import { estimateRegion } from "@/lib/flood-risk"
import type { FloodHazardZone, FloodHazardMapResult } from "@/lib/flood-hazard-maps"

// Türkiye'nin bölgelerine göre taşkın tehlike bölgeleri (simülasyon)
const FLOOD_HAZARD_ZONES: Record<string, FloodHazardZone[]> = {
  MARMARA: [
    {
      id: "mar-500-1",
      name: "Marmara 500 Yıllık Taşkın Bölgesi - Nilüfer Çayı",
      recurrencePeriod: 500,
      riskLevel: "MEDIUM",
      description: "Nilüfer Çayı ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-05-15T00:00:00Z",
      source: "DSİ Bursa Bölge Müdürlüğü",
    },
    {
      id: "mar-100-1",
      name: "Marmara 100 Yıllık Taşkın Bölgesi - Nilüfer Çayı",
      recurrencePeriod: 100,
      riskLevel: "HIGH",
      description: "Nilüfer Çayı ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-05-15T00:00:00Z",
      source: "DSİ Bursa Bölge Müdürlüğü",
    },
  ],
  EGE: [
    {
      id: "ege-500-1",
      name: "Ege 500 Yıllık Taşkın Bölgesi - Gediz Nehri",
      recurrencePeriod: 500,
      riskLevel: "MEDIUM",
      description: "Gediz Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-06-20T00:00:00Z",
      source: "DSİ İzmir Bölge Müdürlüğü",
    },
  ],
  AKDENIZ: [
    {
      id: "akd-500-1",
      name: "Akdeniz 500 Yıllık Taşkın Bölgesi - Köprüçay",
      recurrencePeriod: 500,
      riskLevel: "MEDIUM",
      description: "Köprüçay ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-04-10T00:00:00Z",
      source: "DSİ Antalya Bölge Müdürlüğü",
    },
  ],
  IC_ANADOLU: [
    {
      id: "ica-500-1",
      name: "İç Anadolu 500 Yıllık Taşkın Bölgesi - Kızılırmak",
      recurrencePeriod: 500,
      riskLevel: "LOW",
      description: "Kızılırmak ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-03-05T00:00:00Z",
      source: "DSİ Ankara Bölge Müdürlüğü",
    },
  ],
  DOGU_ANADOLU: [
    {
      id: "da-500-1",
      name: "Doğu Anadolu 500 Yıllık Taşkın Bölgesi - Murat Nehri",
      recurrencePeriod: 500,
      riskLevel: "HIGH",
      description: "Murat Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-07-12T00:00:00Z",
      source: "DSİ Elazığ Bölge Müdürlüğü",
    },
    {
      id: "da-100-1",
      name: "Doğu Anadolu 100 Yıllık Taşkın Bölgesi - Murat Nehri",
      recurrencePeriod: 100,
      riskLevel: "EXTREME",
      description: "Murat Nehri ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-07-12T00:00:00Z",
      source: "DSİ Elazığ Bölge Müdürlüğü",
    },
  ],
  GUNEYDOGU_ANADOLU: [
    {
      id: "gda-500-1",
      name: "Güneydoğu Anadolu 500 Yıllık Taşkın Bölgesi - Dicle Nehri",
      recurrencePeriod: 500,
      riskLevel: "MEDIUM",
      description: "Dicle Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-08-18T00:00:00Z",
      source: "DSİ Diyarbakır Bölge Müdürlüğü",
    },
  ],
  KARADENIZ: [
    {
      id: "krd-500-1",
      name: "Karadeniz 500 Yıllık Taşkın Bölgesi - Çoruh Nehri",
      recurrencePeriod: 500,
      riskLevel: "HIGH",
      description: "Çoruh Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-09-25T00:00:00Z",
      source: "DSİ Trabzon Bölge Müdürlüğü",
    },
    {
      id: "krd-100-1",
      name: "Karadeniz 100 Yıllık Taşkın Bölgesi - Çoruh Nehri",
      recurrencePeriod: 100,
      riskLevel: "EXTREME",
      description: "Çoruh Nehri ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-09-25T00:00:00Z",
      source: "DSİ Trabzon Bölge Müdürlüğü",
    },
    {
      id: "krd-50-1",
      name: "Karadeniz 50 Yıllık Taşkın Bölgesi - Çoruh Nehri",
      recurrencePeriod: 50,
      riskLevel: "EXTREME",
      description: "Çoruh Nehri ve çevresini kapsayan 50 yıllık tekerrür debili taşkın tehlike bölgesi",
      lastUpdated: "2023-09-25T00:00:00Z",
      source: "DSİ Trabzon Bölge Müdürlüğü",
    },
  ],
  DEFAULT: [],
}

// Koordinatlara göre taşkın tehlike bölgelerini kontrol etme
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Enlem ve boylam parametreleri gereklidir" }, { status: 400 })
  }

  try {
    // Bölgeyi tahmin et
    const region = estimateRegion(Number.parseFloat(lat), Number.parseFloat(lon))

    // Bölgeye ait taşkın tehlike bölgelerini al
    const hazardZones = FLOOD_HAZARD_ZONES[region] || []

    // Gerçek bir sistemde, burada koordinatların taşkın bölgesi içinde olup olmadığı
    // GeoJSON polygon içinde nokta kontrolü ile yapılır
    // Burada basit bir simülasyon yapıyoruz

    // Rastgele bir değer ile taşkın bölgesinde olup olmadığını belirle
    // Gerçek bir sistemde bu, koordinatların taşkın poligonu içinde olup olmadığına göre belirlenir
    const randomFactor = Math.random()
    const isInFloodZone = randomFactor < 0.4 // %40 ihtimalle taşkın bölgesinde

    // Taşkın bölgesinde değilse, en yakın bölgeye mesafeyi hesapla (simülasyon)
    const nearestZoneDistance = isInFloodZone ? 0 : Math.floor(Math.random() * 5000) + 500 // 500-5500m arası

    // Yükseklik bilgisi (simülasyon)
    const elevation = Math.floor(Math.random() * 100) + 50 // 50-150m arası

    // En yakın nehre mesafe (simülasyon)
    const riverDistance = Math.floor(Math.random() * 2000) + 100 // 100-2100m arası

    // Sonuç oluştur
    const result: FloodHazardMapResult = {
      isInFloodZone,
      zones: isInFloodZone ? hazardZones : [],
      nearestZoneDistance: isInFloodZone ? 0 : nearestZoneDistance,
      elevation,
      riverDistance,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Taşkın tehlike haritaları verisi çekme hatası:", error)
    return NextResponse.json({ error: "Taşkın tehlike haritaları verisi çekilemedi" }, { status: 500 })
  }
}
