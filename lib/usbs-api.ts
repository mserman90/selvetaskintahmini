// USBS (Ulusal Su Bilgi Sistemi) API istemcisi

// API yanıt tipleri
export interface USBSBasinData {
  id: string
  name: string
  code: string
  waterLevel: number // Yüzde olarak (0-100)
  floodRisk: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
  lastUpdated: string
  dams: USBSDamData[]
  rivers: USBSRiverData[]
  rainfall: number // Son 24 saatteki yağış miktarı (mm)
  soilMoisture: number // Toprak nemi (0-1 arası)
  snowDepth?: number // Kar kalınlığı (cm), varsa
}

export interface USBSDamData {
  id: string
  name: string
  capacity: number // Milyon metreküp
  currentVolume: number // Milyon metreküp
  fillRate: number // Yüzde olarak (0-100)
  dischargeRate: number // Metreküp/saniye
  lastUpdated: string
}

export interface USBSRiverData {
  id: string
  name: string
  currentLevel: number // Metre
  normalLevel: number // Metre
  floodLevel: number // Metre
  flowRate: number // Metreküp/saniye
  lastUpdated: string
}

// Koordinatlara göre havza bilgisi alma
export async function getBasinDataByCoordinates(lat: number, lon: number): Promise<USBSBasinData | null> {
  try {
    // USBS API endpoint'i
    const response = await fetch(`/api/usbs/basin?lat=${lat}&lon=${lon}`)

    if (!response.ok) {
      throw new Error(`USBS API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("USBS veri çekme hatası:", error)
    return null
  }
}

// Havza kodu ile havza bilgisi alma
export async function getBasinDataByCode(code: string): Promise<USBSBasinData | null> {
  try {
    // USBS API endpoint'i
    const response = await fetch(`/api/usbs/basin/${code}`)

    if (!response.ok) {
      throw new Error(`USBS API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("USBS veri çekme hatası:", error)
    return null
  }
}

// Baraj bilgisi alma
export async function getDamData(damId: string): Promise<USBSDamData | null> {
  try {
    // USBS API endpoint'i
    const response = await fetch(`/api/usbs/dam/${damId}`)

    if (!response.ok) {
      throw new Error(`USBS API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("USBS baraj verisi çekme hatası:", error)
    return null
  }
}

// Nehir bilgisi alma
export async function getRiverData(riverId: string): Promise<USBSRiverData | null> {
  try {
    // USBS API endpoint'i
    const response = await fetch(`/api/usbs/river/${riverId}`)

    if (!response.ok) {
      throw new Error(`USBS API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("USBS nehir verisi çekme hatası:", error)
    return null
  }
}
