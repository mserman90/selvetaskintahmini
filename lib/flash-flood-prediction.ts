// HOMS (Hydrology Operational Multipurpose System) bileşenleri kullanılarak ani su baskınları tahmini

// Ani su baskını risk seviyeleri
export type FlashFloodRiskLevel = "LOW" | "MODERATE" | "HIGH" | "EXTREME"

// Ani su baskını tahmin sonucu
export interface FlashFloodPrediction {
  riskLevel: FlashFloodRiskLevel
  confidence: number // 0-1 arası güven seviyesi
  leadTime: number // Dakika cinsinden önceden tahmin süresi
  estimatedRunoff: number // mm cinsinden tahmini yüzey akışı
  warningMessage: string
  affectedArea: {
    center: { lat: number; lon: number }
    radiusKm: number
  }
  timestamp: string
  validUntil: string
  source: string
}

// HOMS J04 - Yağış-Akış Modeli parametreleri
export interface J04RainfallRunoffParams {
  rainfallIntensity: number // mm/saat
  rainfallDuration: number // saat
  antecedentRainfall: number // Son 5 gündeki toplam yağış (mm)
  soilMoisture: number // 0-1 arası
  landCover: string // "urban", "forest", "agricultural", "barren"
  slope: number // Eğim (%)
  imperviousArea: number // Geçirimsiz alan yüzdesi (0-100)
}

// HOMS J10 - Taşkın Öteleme parametreleri
export interface J10FloodRoutingParams {
  channelLength: number // km
  channelSlope: number // m/km
  channelRoughness: number // Manning katsayısı
  crossSectionArea: number // m²
  initialFlow: number // m³/s
  lateralInflow: number // m³/s/km
}

// HOMS J15 - Ani Taşkın Tahmin Sistemi parametreleri
export interface J15FlashFloodParams {
  rainfallThreshold: number // mm/saat
  flashFloodGuidance: number // mm
  basinResponseTime: number // saat
  warningThresholds: {
    moderate: number
    high: number
    extreme: number
  }
}

// Ani su baskını tahmini için HOMS J04 (Yağış-Akış Modeli) uygulaması
export function applyJ04RainfallRunoffModel(params: J04RainfallRunoffParams): number {
  // Basitleştirilmiş Yağış-Akış modeli (SCS Curve Number yöntemi benzeri)
  const { rainfallIntensity, rainfallDuration, antecedentRainfall, soilMoisture, landCover, slope, imperviousArea } =
    params

  // Arazi örtüsüne göre başlangıç CN (Curve Number) değeri
  let curveNumber = 0
  switch (landCover) {
    case "urban":
      curveNumber = 90 + imperviousArea / 10
      break
    case "forest":
      curveNumber = 55 + slope / 5
      break
    case "agricultural":
      curveNumber = 70 + slope / 4
      break
    case "barren":
      curveNumber = 80 + slope / 3
      break
    default:
      curveNumber = 75
  }

  // Önceki yağışlar ve toprak nemi için CN ayarlaması
  curveNumber = curveNumber + (antecedentRainfall / 10) * (1 - curveNumber / 100)
  curveNumber = curveNumber + soilMoisture * 15

  // CN değerini 100'den büyük olmayacak şekilde sınırla
  curveNumber = Math.min(curveNumber, 99.5)

  // Potansiyel maksimum tutulma (S) hesabı (mm)
  const s = 25400 / curveNumber - 254

  // Toplam yağış (mm)
  const rainfall = rainfallIntensity * rainfallDuration

  // Başlangıç soyutlaması (Ia) hesabı (mm)
  const ia = 0.2 * s

  // Yüzey akışı hesabı (mm)
  let runoff = 0
  if (rainfall > ia) {
    runoff = Math.pow(rainfall - ia, 2) / (rainfall - ia + s)
  }

  return runoff
}

// Ani su baskını tahmini için HOMS J10 (Taşkın Öteleme) uygulaması
export function applyJ10FloodRouting(params: J10FloodRoutingParams, inflow: number): number {
  // Basitleştirilmiş Muskingum yöntemi
  const { channelLength, channelSlope, channelRoughness, crossSectionArea, initialFlow, lateralInflow } = params

  // Muskingum parametreleri
  const k = channelLength / (0.5 * Math.sqrt(channelSlope)) // Öteleme zamanı (saat)
  const x = 0.3 // Ağırlık faktörü (0-0.5 arası)

  // Yanal giriş etkisi
  const lateralEffect = lateralInflow * channelLength

  // Çıkış akışı hesabı
  const c0 = (-k * x + 0.5) / (k - k * x + 0.5)
  const c1 = (k * x + 0.5) / (k - k * x + 0.5)
  const c2 = (k - k * x - 0.5) / (k - k * x + 0.5)

  const outflow = c0 * inflow + c1 * initialFlow + c2 * initialFlow + lateralEffect

  return Math.max(0, outflow) // Negatif değer olmamasını sağla
}

// Ani su baskını tahmini için HOMS J15 (Ani Taşkın Tahmin Sistemi) uygulaması
export function applyJ15FlashFloodWarningSystem(
  params: J15FlashFloodParams,
  calculatedRunoff: number,
  rainfallIntensity: number,
  location: { lat: number; lon: number },
): FlashFloodPrediction {
  const { rainfallThreshold, flashFloodGuidance, basinResponseTime, warningThresholds } = params

  // Ani su baskını riski hesabı
  const ffgRatio = calculatedRunoff / flashFloodGuidance
  const intensityRatio = rainfallIntensity / rainfallThreshold

  // Risk seviyesi belirleme
  let riskLevel: FlashFloodRiskLevel = "LOW"
  let confidence = 0.5
  let warningMessage = "Ani su baskını riski düşük."
  let radiusKm = 5

  if (ffgRatio > warningThresholds.extreme || intensityRatio > 2.0) {
    riskLevel = "EXTREME"
    confidence = 0.9
    warningMessage = "ÇOK ACİL! Ani ve şiddetli su baskını riski. Derhal yüksek bölgelere çıkın!"
    radiusKm = 15
  } else if (ffgRatio > warningThresholds.high || intensityRatio > 1.5) {
    riskLevel = "HIGH"
    confidence = 0.8
    warningMessage = "ACİL! Ani su baskını riski yüksek. Dere yataklarından uzaklaşın ve güvenli bölgelere geçin."
    radiusKm = 12
  } else if (ffgRatio > warningThresholds.moderate || intensityRatio > 1.0) {
    riskLevel = "MODERATE"
    confidence = 0.7
    warningMessage = "DİKKAT! Ani su baskını riski mevcut. Dere yataklarına yaklaşmayın ve gelişmeleri takip edin."
    radiusKm = 8
  }

  // Önceden tahmin süresi (dakika)
  const leadTime = basinResponseTime * 60 * (1 - ffgRatio / 2)

  // Zaman damgaları
  const now = new Date()
  const validUntil = new Date(now.getTime() + leadTime * 60 * 1000)

  return {
    riskLevel,
    confidence,
    leadTime: Math.round(leadTime),
    estimatedRunoff: calculatedRunoff,
    warningMessage,
    affectedArea: {
      center: { lat: location.lat, lon: location.lon },
      radiusKm,
    },
    timestamp: now.toISOString(),
    validUntil: validUntil.toISOString(),
    source: "HOMS J04-J10-J15 Entegre Ani Taşkın Tahmin Sistemi",
  }
}

// Ani su baskını tahmini yapan ana fonksiyon
export async function predictFlashFloods(
  location: { lat: number; lon: number },
  weatherData: any,
  terrainData?: any,
): Promise<FlashFloodPrediction> {
  try {
    // Varsayılan arazi verileri (gerçek bir sistemde API'den alınır)
    const defaultTerrainData = {
      landCover: "urban",
      slope: 5, // %
      imperviousArea: 60, // %
      soilMoisture: 0.5, // 0-1 arası
      channelLength: 10, // km
      channelSlope: 2, // m/km
      channelRoughness: 0.035, // Manning katsayısı
      crossSectionArea: 20, // m²
      basinResponseTime: 2, // saat
    }

    // Arazi verileri
    const terrain = terrainData || defaultTerrainData

    // Hava durumu verilerinden yağış bilgilerini çıkar
    const rainfallData = extractRainfallData(weatherData)

    // HOMS J04 parametreleri
    const j04Params: J04RainfallRunoffParams = {
      rainfallIntensity: rainfallData.intensity,
      rainfallDuration: rainfallData.duration,
      antecedentRainfall: rainfallData.antecedent,
      soilMoisture: terrain.soilMoisture,
      landCover: terrain.landCover,
      slope: terrain.slope,
      imperviousArea: terrain.imperviousArea,
    }

    // HOMS J04 modelini uygula
    const calculatedRunoff = applyJ04RainfallRunoffModel(j04Params)

    // HOMS J10 parametreleri
    const j10Params: J10FloodRoutingParams = {
      channelLength: terrain.channelLength,
      channelSlope: terrain.channelSlope,
      channelRoughness: terrain.channelRoughness,
      crossSectionArea: terrain.crossSectionArea,
      initialFlow: rainfallData.initialFlow,
      lateralInflow: calculatedRunoff / 3.6 / terrain.channelLength, // mm'yi m³/s/km'ye dönüştür
    }

    // HOMS J10 modelini uygula
    const peakFlow = applyJ10FloodRouting(j10Params, calculatedRunoff / 3.6) // mm'yi m³/s'ye dönüştür

    // HOMS J15 parametreleri
    const j15Params: J15FlashFloodParams = {
      rainfallThreshold: 20, // mm/saat
      flashFloodGuidance: 30, // mm
      basinResponseTime: terrain.basinResponseTime,
      warningThresholds: {
        moderate: 0.7,
        high: 0.9,
        extreme: 1.2,
      },
    }

    // HOMS J15 modelini uygula
    const prediction = applyJ15FlashFloodWarningSystem(j15Params, calculatedRunoff, rainfallData.intensity, location)

    return prediction
  } catch (error) {
    console.error("Ani su baskını tahmini hatası:", error)

    // Hata durumunda varsayılan düşük riskli tahmin döndür
    return {
      riskLevel: "LOW",
      confidence: 0.3,
      leadTime: 120,
      estimatedRunoff: 0,
      warningMessage: "Ani su baskını tahmini yapılamadı. Varsayılan olarak düşük risk kabul edildi.",
      affectedArea: {
        center: { lat: location.lat, lon: location.lon },
        radiusKm: 5,
      },
      timestamp: new Date().toISOString(),
      validUntil: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      source: "HOMS J04-J10-J15 Entegre Ani Taşkın Tahmin Sistemi (Hata Durumu)",
    }
  }
}

// Hava durumu verilerinden yağış bilgilerini çıkarma
function extractRainfallData(weatherData: any): {
  intensity: number
  duration: number
  antecedent: number
  initialFlow: number
} {
  // Gerçek bir sistemde, hava durumu API'sinden gelen verilerden yağış bilgileri çıkarılır
  // Bu örnekte basitleştirilmiş bir yaklaşım kullanıyoruz

  try {
    // Eğer weatherData bir WeatherData nesnesi ise
    if (weatherData.values && weatherData.timePoints) {
      // Son 6 saatteki yağış miktarını hesapla (mm)
      const recentValues = weatherData.values.slice(0, 6)
      const totalRecent = recentValues.reduce((sum: number, val: number) => sum + val, 0)

      // Yağış yoğunluğu (mm/saat)
      const intensity = totalRecent / 6

      // Yağış süresi (saat)
      const duration = recentValues.filter((v: number) => v > 0).length || 1

      // Önceki yağış (son 5 gündeki toplam, mm)
      const antecedent = totalRecent * 2 // Basitleştirilmiş hesaplama

      // Başlangıç akışı (m³/s) - basitleştirilmiş hesaplama
      const initialFlow = totalRecent * 0.1

      return {
        intensity,
        duration,
        antecedent,
        initialFlow,
      }
    }

    // Eğer weatherData farklı bir formatta ise veya yeterli veri yoksa
    // varsayılan değerler kullan
    return {
      intensity: 10, // mm/saat
      duration: 2, // saat
      antecedent: 20, // mm
      initialFlow: 2, // m³/s
    }
  } catch (error) {
    console.error("Yağış verisi çıkarma hatası:", error)

    // Hata durumunda varsayılan değerler
    return {
      intensity: 5, // mm/saat
      duration: 1, // saat
      antecedent: 10, // mm
      initialFlow: 1, // m³/s
    }
  }
}
