// Geçmiş ani su baskını olayları için veri yapıları ve fonksiyonlar

// Etki seviyesi enum'u
export enum ImpactLevel {
  LOW = "Düşük",
  MODERATE = "Orta",
  HIGH = "Yüksek",
  EXTREME = "Çok Yüksek",
}

// Geçmiş ani su baskını olayı tipi
export interface HistoricalFloodEvent {
  id: string
  date: string // ISO string formatında tarih
  location: {
    name: string
    lat: number
    lon: number
    radius: number // Etkilenen alan yarıçapı (km)
  }
  impactLevel: ImpactLevel
  maxWaterLevel: number // Maksimum su seviyesi (cm)
  affectedArea: number // Etkilenen alan (km²)
  affectedPeople: number // Etkilenen kişi sayısı
  economicLoss: number // Ekonomik kayıp (TL)
  description: string
  source: string // Veri kaynağı
  images?: string[] // Olayla ilgili görsel URL'leri (opsiyonel)
  casualties?: number // Can kaybı (opsiyonel)
  duration: number // Saat cinsinden süre
  rainfall: number // mm cinsinden yağış miktarı
  responseTime: number // Dakika cinsinden müdahale süresi
}

// Geçmiş ani su baskını olaylarını getiren fonksiyon
export async function getHistoricalFloodEvents(
  lat: number,
  lon: number,
  radius = 50, // Varsayılan olarak 50 km yarıçapındaki olayları getir
  limit = 100, // Varsayılan olarak en fazla 100 olay getir
  startDate?: string, // Başlangıç tarihi (opsiyonel)
  endDate?: string, // Bitiş tarihi (opsiyonel)
): Promise<HistoricalFloodEvent[]> {
  try {
    // API endpoint'ine istek at
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      radius: radius.toString(),
      limit: limit.toString(),
    })

    if (startDate) {
      params.append("startDate", startDate)
    }

    if (endDate) {
      params.append("endDate", endDate)
    }

    const response = await fetch(`/api/historical-flood-events?${params.toString()}`)

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`)
    }

    const data = await response.json()
    return data.events
  } catch (error) {
    console.error("Geçmiş ani su baskını olayları getirilirken hata:", error)
    return [] // Hata durumunda boş dizi döndür
  }
}

// İki nokta arasındaki mesafeyi Haversine formülü kullanarak hesaplama (km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

// Etki seviyesine göre renk kodu döndüren yardımcı fonksiyon
export function getImpactLevelColor(level: ImpactLevel): string {
  switch (level) {
    case ImpactLevel.LOW:
      return "bg-green-100 text-green-800 border-green-200"
    case ImpactLevel.MODERATE:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case ImpactLevel.HIGH:
      return "bg-orange-100 text-orange-800 border-orange-200"
    case ImpactLevel.EXTREME:
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

// Örnek veri (gerçek bir API olmadığı için)
export const sampleHistoricalFloodEvents: HistoricalFloodEvent[] = [
  {
    id: "flood-2023-06-15",
    date: "2023-06-15T14:30:00Z",
    location: {
      name: "Ankara, Mamak",
      lat: 39.925,
      lon: 32.902,
      radius: 5,
    },
    impactLevel: ImpactLevel.HIGH,
    maxWaterLevel: 120,
    affectedArea: 8.5,
    affectedPeople: 1200,
    economicLoss: 5000000,
    description:
      "Şiddetli yağış sonrası Hatip Çayı taştı. Mamak ilçesinde çok sayıda ev ve iş yeri su altında kaldı. Bazı araçlar sele kapıldı.",
    source: "AFAD, Meteoroloji Genel Müdürlüğü",
    images: ["/images/flood-sample-1.jpg"],
    casualties: 0,
    duration: 6,
    rainfall: 85,
    responseTime: 45,
  },
  {
    id: "flood-2022-08-27",
    date: "2022-08-27T18:15:00Z",
    location: {
      name: "İstanbul, Esenyurt",
      lat: 41.032,
      lon: 28.672,
      radius: 7,
    },
    impactLevel: ImpactLevel.EXTREME,
    maxWaterLevel: 180,
    affectedArea: 12.3,
    affectedPeople: 3500,
    economicLoss: 15000000,
    description:
      "Aşırı yağış sonucu Haramidere taştı. Esenyurt'ta birçok ev ve iş yeri sular altında kaldı. Alt geçitlerde mahsur kalan araçlar oldu. 2 kişi hayatını kaybetti.",
    source: "AFAD, İBB Afet Koordinasyon Merkezi",
    images: ["/images/flood-sample-2.jpg"],
    casualties: 2,
    duration: 9,
    rainfall: 130,
    responseTime: 30,
  },
  {
    id: "flood-2021-11-29",
    date: "2021-11-29T08:45:00Z",
    location: {
      name: "İzmir, Bayraklı",
      lat: 38.462,
      lon: 27.173,
      radius: 4,
    },
    impactLevel: ImpactLevel.MODERATE,
    maxWaterLevel: 75,
    affectedArea: 5.2,
    affectedPeople: 800,
    economicLoss: 2500000,
    description:
      "Kış yağmurları sonrası dere yatakları taştı. Bayraklı'da bazı mahalleler sular altında kaldı. Maddi hasar oluştu.",
    source: "İzmir Büyükşehir Belediyesi, Meteoroloji 2. Bölge Müdürlüğü",
    duration: 4,
    rainfall: 65,
    responseTime: 60,
  },
  {
    id: "flood-2020-06-23",
    date: "2020-06-23T16:20:00Z",
    location: {
      name: "Bursa, Nilüfer",
      lat: 40.215,
      lon: 28.985,
      radius: 6,
    },
    impactLevel: ImpactLevel.HIGH,
    maxWaterLevel: 110,
    affectedArea: 7.8,
    affectedPeople: 1500,
    economicLoss: 4800000,
    description:
      "Ani sağanak yağış sonrası Nilüfer Çayı taştı. Çok sayıda ev ve iş yeri su altında kaldı. Bazı bölgelerde elektrik kesintileri yaşandı.",
    source: "AFAD, Bursa Büyükşehir Belediyesi",
    casualties: 0,
    duration: 5,
    rainfall: 95,
    responseTime: 40,
  },
  {
    id: "flood-2019-08-17",
    date: "2019-08-17T13:10:00Z",
    location: {
      name: "Trabzon, Araklı",
      lat: 40.742,
      lon: 39.952,
      radius: 8,
    },
    impactLevel: ImpactLevel.EXTREME,
    maxWaterLevel: 200,
    affectedArea: 15.6,
    affectedPeople: 2200,
    economicLoss: 12000000,
    description:
      "Şiddetli yağış sonrası Karadere taştı. Araklı ilçesinde çok sayıda ev yıkıldı, köprüler çöktü. 7 kişi hayatını kaybetti, 3 kişi kayboldu.",
    source: "AFAD, Trabzon Valiliği",
    images: ["/images/flood-sample-3.jpg"],
    casualties: 7,
    duration: 12,
    rainfall: 150,
    responseTime: 55,
  },
  {
    id: "flood-2023-02-05",
    date: "2023-02-05T09:30:00Z",
    location: {
      name: "Antalya, Manavgat",
      lat: 36.786,
      lon: 31.443,
      radius: 5,
    },
    impactLevel: ImpactLevel.MODERATE,
    maxWaterLevel: 80,
    affectedArea: 6.3,
    affectedPeople: 950,
    economicLoss: 3200000,
    description:
      "Kış yağmurları sonrası Manavgat Çayı taştı. Bazı tarım arazileri ve turistik tesisler su altında kaldı.",
    source: "Antalya Büyükşehir Belediyesi, Meteoroloji Genel Müdürlüğü",
    duration: 7,
    rainfall: 75,
    responseTime: 50,
  },
  {
    id: "flood-2022-04-12",
    date: "2022-04-12T11:45:00Z",
    location: {
      name: "Rize, Merkez",
      lat: 41.025,
      lon: 40.517,
      radius: 7,
    },
    impactLevel: ImpactLevel.HIGH,
    maxWaterLevel: 130,
    affectedArea: 9.2,
    affectedPeople: 1800,
    economicLoss: 7500000,
    description:
      "Bahar yağmurları sonrası İyidere ve çevresi taştı. Rize merkezde çok sayıda ev ve iş yeri su altında kaldı. Bazı yollar kapandı.",
    source: "AFAD, Rize Valiliği",
    casualties: 0,
    duration: 8,
    rainfall: 110,
    responseTime: 35,
  },
  {
    id: "flood-2021-07-14",
    date: "2021-07-14T15:50:00Z",
    location: {
      name: "Kastamonu, Bozkurt",
      lat: 41.959,
      lon: 34.029,
      radius: 10,
    },
    impactLevel: ImpactLevel.EXTREME,
    maxWaterLevel: 220,
    affectedArea: 18.7,
    affectedPeople: 4200,
    economicLoss: 25000000,
    description:
      "Aşırı yağış sonrası Ezine Çayı taştı. Bozkurt ilçesinde çok sayıda bina yıkıldı, köprüler çöktü. 82 kişi hayatını kaybetti.",
    source: "AFAD, İçişleri Bakanlığı",
    images: ["/images/flood-sample-4.jpg"],
    casualties: 82,
    duration: 24,
    rainfall: 240,
    responseTime: 120,
  },
  {
    id: "flood-2020-09-02",
    date: "2020-09-02T17:25:00Z",
    location: {
      name: "Giresun, Dereli",
      lat: 40.612,
      lon: 38.715,
      radius: 9,
    },
    impactLevel: ImpactLevel.EXTREME,
    maxWaterLevel: 190,
    affectedArea: 16.4,
    affectedPeople: 3100,
    economicLoss: 18000000,
    description:
      "Şiddetli yağış sonrası Aksu Deresi taştı. Dereli ilçesinde çok sayıda ev ve iş yeri yıkıldı. 11 kişi hayatını kaybetti.",
    source: "AFAD, Giresun Valiliği",
    images: ["/images/flood-sample-5.jpg"],
    casualties: 11,
    duration: 14,
    rainfall: 170,
    responseTime: 90,
  },
  {
    id: "flood-2019-12-22",
    date: "2019-12-22T10:15:00Z",
    location: {
      name: "Mersin, Silifke",
      lat: 36.377,
      lon: 33.936,
      radius: 6,
    },
    impactLevel: ImpactLevel.MODERATE,
    maxWaterLevel: 85,
    affectedArea: 7.1,
    affectedPeople: 1100,
    economicLoss: 3800000,
    description:
      "Kış yağmurları sonrası Göksu Nehri taştı. Silifke'de tarım arazileri ve bazı yerleşim yerleri su altında kaldı.",
    source: "Mersin Büyükşehir Belediyesi, DSİ 6. Bölge Müdürlüğü",
    duration: 6,
    rainfall: 80,
    responseTime: 65,
  },
]
