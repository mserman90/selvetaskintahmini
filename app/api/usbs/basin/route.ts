import { NextResponse } from "next/server"
import { estimateRegion } from "@/lib/flood-risk"

// Türkiye'nin havza bilgileri (gerçek veriler USBS API'sinden alınacak)
const BASIN_DATA = {
  MARMARA: {
    id: "1",
    name: "Marmara Havzası",
    code: "MAR",
    waterLevel: 45,
    floodRisk: "MEDIUM" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "1",
        name: "Ömerli Barajı",
        capacity: 386.5,
        currentVolume: 220.3,
        fillRate: 57,
        dischargeRate: 12.5,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Darlık Barajı",
        capacity: 107.5,
        currentVolume: 68.8,
        fillRate: 64,
        dischargeRate: 5.2,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "1",
        name: "Nilüfer Çayı",
        currentLevel: 2.3,
        normalLevel: 1.8,
        floodLevel: 4.5,
        flowRate: 35.2,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 12.5,
    soilMoisture: 0.45,
  },
  EGE: {
    id: "2",
    name: "Kuzey Ege Havzası",
    code: "KEG",
    waterLevel: 38,
    floodRisk: "LOW" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "3",
        name: "Çaygören Barajı",
        capacity: 144.0,
        currentVolume: 52.0,
        fillRate: 36,
        dischargeRate: 8.3,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "2",
        name: "Bakırçay",
        currentLevel: 1.8,
        normalLevel: 1.5,
        floodLevel: 3.8,
        flowRate: 28.6,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 5.2,
    soilMoisture: 0.32,
  },
  AKDENIZ: {
    id: "3",
    name: "Antalya Havzası",
    code: "ANT",
    waterLevel: 32,
    floodRisk: "LOW" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "4",
        name: "Oymapınar Barajı",
        capacity: 300.0,
        currentVolume: 180.0,
        fillRate: 60,
        dischargeRate: 42.5,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "3",
        name: "Köprüçay",
        currentLevel: 1.2,
        normalLevel: 1.0,
        floodLevel: 3.2,
        flowRate: 45.8,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 3.8,
    soilMoisture: 0.25,
  },
  IC_ANADOLU: {
    id: "4",
    name: "Konya Kapalı Havzası",
    code: "KON",
    waterLevel: 25,
    floodRisk: "LOW" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "5",
        name: "Apa Barajı",
        capacity: 450.0,
        currentVolume: 112.5,
        fillRate: 25,
        dischargeRate: 6.8,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "4",
        name: "Çarşamba Çayı",
        currentLevel: 0.8,
        normalLevel: 1.2,
        floodLevel: 2.8,
        flowRate: 12.4,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 2.1,
    soilMoisture: 0.18,
  },
  DOGU_ANADOLU: {
    id: "5",
    name: "Yukarı Fırat Havzası",
    code: "YFR",
    waterLevel: 58,
    floodRisk: "MEDIUM" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "6",
        name: "Keban Barajı",
        capacity: 31000.0,
        currentVolume: 18600.0,
        fillRate: 60,
        dischargeRate: 650.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "5",
        name: "Murat Nehri",
        currentLevel: 3.2,
        normalLevel: 2.5,
        floodLevel: 5.5,
        flowRate: 320.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 15.3,
    soilMoisture: 0.42,
    snowDepth: 25,
  },
  GUNEYDOGU_ANADOLU: {
    id: "6",
    name: "Dicle Havzası",
    code: "DIC",
    waterLevel: 42,
    floodRisk: "MEDIUM" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "7",
        name: "Ilısu Barajı",
        capacity: 10400.0,
        currentVolume: 5200.0,
        fillRate: 50,
        dischargeRate: 450.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "6",
        name: "Dicle Nehri",
        currentLevel: 4.5,
        normalLevel: 3.8,
        floodLevel: 7.2,
        flowRate: 520.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 8.7,
    soilMoisture: 0.28,
  },
  KARADENIZ: {
    id: "7",
    name: "Doğu Karadeniz Havzası",
    code: "DKD",
    waterLevel: 72,
    floodRisk: "HIGH" as const,
    lastUpdated: new Date().toISOString(),
    dams: [
      {
        id: "8",
        name: "Borçka Barajı",
        capacity: 418.0,
        currentVolume: 334.4,
        fillRate: 80,
        dischargeRate: 120.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rivers: [
      {
        id: "7",
        name: "Çoruh Nehri",
        currentLevel: 5.8,
        normalLevel: 4.2,
        floodLevel: 8.0,
        flowRate: 450.0,
        lastUpdated: new Date().toISOString(),
      },
    ],
    rainfall: 28.5,
    soilMoisture: 0.68,
  },
  DEFAULT: {
    id: "0",
    name: "Bilinmeyen Havza",
    code: "UNK",
    waterLevel: 40,
    floodRisk: "MEDIUM" as const,
    lastUpdated: new Date().toISOString(),
    dams: [],
    rivers: [],
    rainfall: 10.0,
    soilMoisture: 0.4,
  },
}

// Koordinatlara göre havza bilgisi alma
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Enlem ve boylam parametreleri gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek USBS API'sine bağlanma girişimi
    // Bu kısım, gerçek API erişimi olduğunda güncellenecek
    // Şimdilik, bölgeye göre mock veri döndürüyoruz

    const region = estimateRegion(Number.parseFloat(lat), Number.parseFloat(lon))
    const basinData = BASIN_DATA[region] || BASIN_DATA.DEFAULT

    // Gerçekçilik için bazı rastgele değişiklikler ekleyelim
    const randomFactor = Math.random() * 0.2 - 0.1 // -10% ile +10% arası
    basinData.waterLevel = Math.min(100, Math.max(0, basinData.waterLevel * (1 + randomFactor)))
    basinData.rainfall = Math.max(0, basinData.rainfall * (1 + randomFactor))
    basinData.soilMoisture = Math.min(1, Math.max(0, basinData.soilMoisture * (1 + randomFactor)))

    // Son güncelleme zamanını güncelle
    basinData.lastUpdated = new Date().toISOString()

    // Risk seviyesini güncelle
    if (basinData.waterLevel >= 80 || basinData.rainfall > 25) {
      basinData.floodRisk = "EXTREME"
    } else if (basinData.waterLevel >= 60 || basinData.rainfall > 15) {
      basinData.floodRisk = "HIGH"
    } else if (basinData.waterLevel >= 40 || basinData.rainfall > 8) {
      basinData.floodRisk = "MEDIUM"
    } else {
      basinData.floodRisk = "LOW"
    }

    return NextResponse.json(basinData)
  } catch (error) {
    console.error("USBS veri çekme hatası:", error)
    return NextResponse.json({ error: "USBS verisi çekilemedi" }, { status: 500 })
  }
}
