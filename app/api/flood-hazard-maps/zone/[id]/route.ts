import { NextResponse } from "next/server"
import type { FloodHazardZone } from "@/lib/flood-hazard-maps"

// Tüm taşkın tehlike bölgelerini içeren bir liste (gerçek bir sistemde veritabanından gelir)
const ALL_FLOOD_HAZARD_ZONES: Record<string, FloodHazardZone> = {
  "mar-500-1": {
    id: "mar-500-1",
    name: "Marmara 500 Yıllık Taşkın Bölgesi - Nilüfer Çayı",
    recurrencePeriod: 500,
    riskLevel: "MEDIUM",
    description: "Nilüfer Çayı ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-05-15T00:00:00Z",
    source: "DSİ Bursa Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [29.0, 40.1],
          [29.1, 40.1],
          [29.1, 40.2],
          [29.0, 40.2],
          [29.0, 40.1],
        ],
      ],
    },
  },
  "mar-100-1": {
    id: "mar-100-1",
    name: "Marmara 100 Yıllık Taşkın Bölgesi - Nilüfer Çayı",
    recurrencePeriod: 100,
    riskLevel: "HIGH",
    description: "Nilüfer Çayı ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-05-15T00:00:00Z",
    source: "DSİ Bursa Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [29.02, 40.12],
          [29.08, 40.12],
          [29.08, 40.18],
          [29.02, 40.18],
          [29.02, 40.12],
        ],
      ],
    },
  },
  "ege-500-1": {
    id: "ege-500-1",
    name: "Ege 500 Yıllık Taşkın Bölgesi - Gediz Nehri",
    recurrencePeriod: 500,
    riskLevel: "MEDIUM",
    description: "Gediz Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-06-20T00:00:00Z",
    source: "DSİ İzmir Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [27.0, 38.5],
          [27.2, 38.5],
          [27.2, 38.7],
          [27.0, 38.7],
          [27.0, 38.5],
        ],
      ],
    },
  },
  "akd-500-1": {
    id: "akd-500-1",
    name: "Akdeniz 500 Yıllık Taşkın Bölgesi - Köprüçay",
    recurrencePeriod: 500,
    riskLevel: "MEDIUM",
    description: "Köprüçay ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-04-10T00:00:00Z",
    source: "DSİ Antalya Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [31.0, 36.8],
          [31.2, 36.8],
          [31.2, 37.0],
          [31.0, 37.0],
          [31.0, 36.8],
        ],
      ],
    },
  },
  "ica-500-1": {
    id: "ica-500-1",
    name: "İç Anadolu 500 Yıllık Taşkın Bölgesi - Kızılırmak",
    recurrencePeriod: 500,
    riskLevel: "LOW",
    description: "Kızılırmak ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-03-05T00:00:00Z",
    source: "DSİ Ankara Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [33.0, 39.5],
          [33.2, 39.5],
          [33.2, 39.7],
          [33.0, 39.7],
          [33.0, 39.5],
        ],
      ],
    },
  },
  "da-500-1": {
    id: "da-500-1",
    name: "Doğu Anadolu 500 Yıllık Taşkın Bölgesi - Murat Nehri",
    recurrencePeriod: 500,
    riskLevel: "HIGH",
    description: "Murat Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-07-12T00:00:00Z",
    source: "DSİ Elazığ Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [39.0, 38.5],
          [39.2, 38.5],
          [39.2, 38.7],
          [39.0, 38.7],
          [39.0, 38.5],
        ],
      ],
    },
  },
  "da-100-1": {
    id: "da-100-1",
    name: "Doğu Anadolu 100 Yıllık Taşkın Bölgesi - Murat Nehri",
    recurrencePeriod: 100,
    riskLevel: "EXTREME",
    description: "Murat Nehri ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-07-12T00:00:00Z",
    source: "DSİ Elazığ Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [39.05, 38.55],
          [39.15, 38.55],
          [39.15, 38.65],
          [39.05, 38.65],
          [39.05, 38.55],
        ],
      ],
    },
  },
  "gda-500-1": {
    id: "gda-500-1",
    name: "Güneydoğu Anadolu 500 Yıllık Taşkın Bölgesi - Dicle Nehri",
    recurrencePeriod: 500,
    riskLevel: "MEDIUM",
    description: "Dicle Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-08-18T00:00:00Z",
    source: "DSİ Diyarbakır Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [40.0, 37.5],
          [40.2, 37.5],
          [40.2, 37.7],
          [40.0, 37.7],
          [40.0, 37.5],
        ],
      ],
    },
  },
  "krd-500-1": {
    id: "krd-500-1",
    name: "Karadeniz 500 Yıllık Taşkın Bölgesi - Çoruh Nehri",
    recurrencePeriod: 500,
    riskLevel: "HIGH",
    description: "Çoruh Nehri ve çevresini kapsayan 500 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-09-25T00:00:00Z",
    source: "DSİ Trabzon Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [41.0, 41.0],
          [41.2, 41.0],
          [41.2, 41.2],
          [41.0, 41.2],
          [41.0, 41.0],
        ],
      ],
    },
  },
  "krd-100-1": {
    id: "krd-100-1",
    name: "Karadeniz 100 Yıllık Taşkın Bölgesi - Çoruh Nehri",
    recurrencePeriod: 100,
    riskLevel: "EXTREME",
    description: "Çoruh Nehri ve çevresini kapsayan 100 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-09-25T00:00:00Z",
    source: "DSİ Trabzon Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [41.05, 41.05],
          [41.15, 41.05],
          [41.15, 41.15],
          [41.05, 41.15],
          [41.05, 41.05],
        ],
      ],
    },
  },
  "krd-50-1": {
    id: "krd-50-1",
    name: "Karadeniz 50 Yıllık Taşkın Bölgesi - Çoruh Nehri",
    recurrencePeriod: 50,
    riskLevel: "EXTREME",
    description: "Çoruh Nehri ve çevresini kapsayan 50 yıllık tekerrür debili taşkın tehlike bölgesi",
    lastUpdated: "2023-09-25T00:00:00Z",
    source: "DSİ Trabzon Bölge Müdürlüğü",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [41.07, 41.07],
          [41.13, 41.07],
          [41.13, 41.13],
          [41.07, 41.13],
          [41.07, 41.07],
        ],
      ],
    },
  },
}

// Taşkın tehlike bölgesi detaylarını alma
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const zoneId = params.id

  if (!zoneId) {
    return NextResponse.json({ error: "Taşkın tehlike bölgesi ID'si gereklidir" }, { status: 400 })
  }

  try {
    // Taşkın tehlike bölgesi detaylarını al
    const zoneDetails = ALL_FLOOD_HAZARD_ZONES[zoneId]

    if (!zoneDetails) {
      return NextResponse.json({ error: "Taşkın tehlike bölgesi bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(zoneDetails)
  } catch (error) {
    console.error("Taşkın tehlike bölgesi verisi çekme hatası:", error)
    return NextResponse.json({ error: "Taşkın tehlike bölgesi verisi çekilemedi" }, { status: 500 })
  }
}
