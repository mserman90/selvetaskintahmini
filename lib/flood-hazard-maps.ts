// 500 yıllık taşkın tekerrür debili tehlike haritaları modülü

// Taşkın tehlike bölgesi tipi
export interface FloodHazardZone {
  id: string
  name: string
  recurrencePeriod: number // Yıl cinsinden tekerrür periyodu (100, 500 vb.)
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
  description: string
  lastUpdated: string
  source: string
  geometry?: {
    type: string
    coordinates: number[][][] // GeoJSON Polygon koordinatları
  }
}

// Taşkın tehlike haritası sonucu
export interface FloodHazardMapResult {
  isInFloodZone: boolean
  zones: FloodHazardZone[]
  nearestZoneDistance?: number // Metre cinsinden en yakın taşkın bölgesine mesafe
  elevation?: number // Metre cinsinden yükseklik
  riverDistance?: number // Metre cinsinden en yakın nehre mesafe
}

// Koordinatlara göre taşkın tehlike bölgelerini kontrol etme
export async function checkFloodHazardZones(lat: number, lon: number): Promise<FloodHazardMapResult> {
  try {
    // Gerçek bir API'ye bağlanma girişimi
    const response = await fetch(`/api/flood-hazard-maps?lat=${lat}&lon=${lon}`)

    if (!response.ok) {
      throw new Error(`Taşkın tehlike haritaları API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Taşkın tehlike haritaları verisi çekme hatası:", error)
    throw error
  }
}

// Taşkın tehlike bölgesi detaylarını alma
export async function getFloodHazardZoneDetails(zoneId: string): Promise<FloodHazardZone> {
  try {
    // Gerçek bir API'ye bağlanma girişimi
    const response = await fetch(`/api/flood-hazard-maps/zone/${zoneId}`)

    if (!response.ok) {
      throw new Error(`Taşkın tehlike bölgesi API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Taşkın tehlike bölgesi verisi çekme hatası:", error)
    throw error
  }
}

// Taşkın tehlike haritası görüntüsü URL'i oluşturma
export function getFloodHazardMapImageUrl(lat: number, lon: number, zoom = 12): string {
  return `/api/flood-hazard-maps/image?lat=${lat}&lon=${lon}&zoom=${zoom}`
}

// Taşkın tehlike bölgesi risk seviyesine göre açıklama
export function getFloodHazardRiskDescription(riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"): string {
  switch (riskLevel) {
    case "LOW":
      return "Düşük riskli taşkın bölgesi. 500 yıllık tekerrür periyoduna sahip taşkınlarda etkilenebilir."
    case "MEDIUM":
      return "Orta riskli taşkın bölgesi. 100-500 yıllık tekerrür periyoduna sahip taşkınlarda etkilenebilir."
    case "HIGH":
      return "Yüksek riskli taşkın bölgesi. 50-100 yıllık tekerrür periyoduna sahip taşkınlarda etkilenebilir."
    case "EXTREME":
      return "Çok yüksek riskli taşkın bölgesi. 50 yıldan daha kısa tekerrür periyoduna sahip taşkınlarda etkilenebilir."
  }
}

// Taşkın tehlike bölgesi için öneriler
export function getFloodHazardRecommendations(riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"): string[] {
  const recommendations: string[] = []

  switch (riskLevel) {
    case "EXTREME":
      recommendations.push("Bu bölgede yapılaşmadan kaçınılmalıdır")
      recommendations.push("Mevcut yapılar için sel dayanıklılık önlemleri alınmalıdır")
      recommendations.push("Acil durum tahliye planları hazırlanmalıdır")
      recommendations.push("Sel sigortası yaptırılması önemle tavsiye edilir")
      break
    case "HIGH":
      recommendations.push("Yapılaşma için özel izin ve önlemler gereklidir")
      recommendations.push("Binaların zemin katları su basmasına karşı korunmalıdır")
      recommendations.push("Değerli eşyalar ve tesisatlar yüksek seviyelere taşınmalıdır")
      recommendations.push("Sel sigortası yaptırılması tavsiye edilir")
      break
    case "MEDIUM":
      recommendations.push("Yapılaşma için sel risk değerlendirmesi yapılmalıdır")
      recommendations.push("Drenaj sistemleri güçlendirilmelidir")
      recommendations.push("Sel erken uyarı sistemleri kurulmalıdır")
      break
    case "LOW":
      recommendations.push("Standart sel önlemleri yeterlidir")
      recommendations.push("Drenaj sistemlerinin düzenli bakımı yapılmalıdır")
      break
  }

  return recommendations
}
