// Otomatik uyarı sistemi için tip tanımlamaları ve yardımcı fonksiyonlar

import type { FlashFloodRiskLevel } from "./flash-flood-prediction"

// Uyarı kanalı türleri
export type AlertChannel = "SMS" | "EMAIL" | "PUSH" | "PHONE_CALL" | "EMERGENCY_SERVICES"

// Uyarı durumu
export type AlertStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED" | "ACKNOWLEDGED"

// Uyarı önceliği
export type AlertPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

// Uyarı kaydı
export interface AlertRecord {
  id: string
  timestamp: string
  riskLevel: FlashFloodRiskLevel
  message: string
  location: {
    name: string
    lat: number
    lon: number
  }
  channels: AlertChannel[]
  status: AlertStatus
  priority: AlertPriority
  acknowledgedAt?: string
  sentTo: string[]
}

// Uyarı ayarları
export interface AlertSettings {
  enabled: boolean
  minRiskLevel: FlashFloodRiskLevel
  channels: {
    [key in AlertChannel]: {
      enabled: boolean
      contactInfo: string
    }
  }
  quietHours?: {
    enabled: boolean
    start: string // "HH:MM" formatında
    end: string // "HH:MM" formatında
    overrideForCritical: boolean
  }
  notificationRadius: number // km cinsinden
  cooldownPeriod: number // dakika cinsinden, aynı bölge için tekrar uyarı göndermeden önce beklenecek süre
}

// Varsayılan uyarı ayarları
export const defaultAlertSettings: AlertSettings = {
  enabled: true,
  minRiskLevel: "MODERATE", // En az "MODERATE" risk seviyesinde uyarı gönder
  channels: {
    SMS: {
      enabled: true,
      contactInfo: "",
    },
    EMAIL: {
      enabled: true,
      contactInfo: "",
    },
    PUSH: {
      enabled: true,
      contactInfo: "browser", // Varsayılan olarak tarayıcı bildirimleri
    },
    PHONE_CALL: {
      enabled: false,
      contactInfo: "",
    },
    EMERGENCY_SERVICES: {
      enabled: false,
      contactInfo: "112", // Türkiye acil durum numarası
    },
  },
  notificationRadius: 25, // 25 km yarıçapındaki uyarılar için bildirim gönder
  cooldownPeriod: 60, // 60 dakika içinde aynı bölge için tekrar uyarı gönderme
}

// Risk seviyesine göre uyarı önceliği belirleme
export function getAlertPriorityFromRiskLevel(riskLevel: FlashFloodRiskLevel): AlertPriority {
  switch (riskLevel) {
    case "EXTREME":
      return "CRITICAL"
    case "HIGH":
      return "HIGH"
    case "MODERATE":
      return "MEDIUM"
    case "LOW":
    default:
      return "LOW"
  }
}

// Uyarı mesajı oluşturma
export function generateAlertMessage(riskLevel: FlashFloodRiskLevel, locationName: string, leadTime: number): string {
  const formattedLeadTime =
    leadTime < 60 ? `${leadTime} dakika` : `${Math.floor(leadTime / 60)} saat ${leadTime % 60} dakika`

  switch (riskLevel) {
    case "EXTREME":
      return `ACİL DURUM UYARISI: ${locationName} bölgesinde yaklaşık ${formattedLeadTime} içinde çok şiddetli ani su baskını bekleniyor. DERHAL güvenli bölgeye geçin!`
    case "HIGH":
      return `ACİL UYARI: ${locationName} bölgesinde yaklaşık ${formattedLeadTime} içinde ani su baskını riski yüksek. Dere yataklarından uzaklaşın ve güvenli bölgelere geçin.`
    case "MODERATE":
      return `UYARI: ${locationName} bölgesinde yaklaşık ${formattedLeadTime} içinde ani su baskını olasılığı var. Dere yataklarına yaklaşmayın ve gelişmeleri takip edin.`
    case "LOW":
    default:
      return `BİLGİ: ${locationName} bölgesinde ani su baskını riski düşük seviyede. Normal önlemleri alın ve hava durumunu takip edin.`
  }
}

// Uyarı gönderme fonksiyonu (simülasyon)
export async function sendAlert(
  riskLevel: FlashFloodRiskLevel,
  location: { name: string; lat: number; lon: number },
  leadTime: number,
  channels: AlertChannel[],
  contactInfo: { [key in AlertChannel]?: string },
): Promise<AlertRecord> {
  // Gerçek bir sistemde burada SMS, e-posta, push bildirimi vb. gönderme API'leri çağrılır
  // Bu örnekte simülasyon yapıyoruz

  const priority = getAlertPriorityFromRiskLevel(riskLevel)
  const message = generateAlertMessage(riskLevel, location.name, leadTime)
  const alertId = `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`

  // Gönderim başarı simülasyonu
  const randomSuccess = Math.random() > 0.1 // %90 başarı oranı

  // Gönderilen kişi/cihaz listesi
  const sentTo = channels.map((channel) => {
    const contact = contactInfo[channel] || "Bilinmeyen"
    return `${channel}: ${contact}`
  })

  console.log(`[UYARI SİSTEMİ] ${priority} öncelikli uyarı gönderiliyor:`, message)
  console.log(`[UYARI SİSTEMİ] Kanallar:`, channels.join(", "))
  console.log(`[UYARI SİSTEMİ] Alıcılar:`, sentTo.join(", "))

  // Gerçek bir sistemde burada gönderim sonucunu bekleriz
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const alertRecord: AlertRecord = {
    id: alertId,
    timestamp: new Date().toISOString(),
    riskLevel,
    message,
    location,
    channels,
    status: randomSuccess ? "SENT" : "FAILED",
    priority,
    sentTo,
  }

  // Uyarı kaydını sakla (gerçek bir sistemde veritabanına kaydedilir)
  saveAlertToHistory(alertRecord)

  return alertRecord
}

// Uyarı geçmişini saklama (localStorage kullanarak basit bir örnek)
export function saveAlertToHistory(alert: AlertRecord): void {
  try {
    const alertHistory = getAlertHistory()
    alertHistory.unshift(alert) // En yeni uyarıyı başa ekle

    // Maksimum 100 uyarı sakla
    if (alertHistory.length > 100) {
      alertHistory.pop()
    }

    localStorage.setItem("alertHistory", JSON.stringify(alertHistory))
  } catch (error) {
    console.error("Uyarı geçmişi kaydedilemedi:", error)
  }
}

// Uyarı geçmişini getirme
export function getAlertHistory(): AlertRecord[] {
  try {
    const history = localStorage.getItem("alertHistory")
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("Uyarı geçmişi alınamadı:", error)
    return []
  }
}

// Uyarı ayarlarını kaydetme
export function saveAlertSettings(settings: AlertSettings): void {
  try {
    localStorage.setItem("alertSettings", JSON.stringify(settings))
  } catch (error) {
    console.error("Uyarı ayarları kaydedilemedi:", error)
  }
}

// Uyarı ayarlarını getirme
export function getAlertSettings(): AlertSettings {
  try {
    const settings = localStorage.getItem("alertSettings")
    return settings ? JSON.parse(settings) : defaultAlertSettings
  } catch (error) {
    console.error("Uyarı ayarları alınamadı:", error)
    return defaultAlertSettings
  }
}

// Uyarı gönderme koşullarını kontrol etme
export function shouldSendAlert(
  riskLevel: FlashFloodRiskLevel,
  settings: AlertSettings,
  lastAlertTimestamp?: string,
): boolean {
  if (!settings.enabled) {
    return false
  }

  // Risk seviyesi kontrolü
  const riskLevels: FlashFloodRiskLevel[] = ["LOW", "MODERATE", "HIGH", "EXTREME"]
  const minRiskIndex = riskLevels.indexOf(settings.minRiskLevel)
  const currentRiskIndex = riskLevels.indexOf(riskLevel)

  if (currentRiskIndex < minRiskIndex) {
    return false
  }

  // Sessiz saat kontrolü
  if (settings.quietHours?.enabled) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    const currentTimeMinutes = currentHour * 60 + currentMinute

    const [startHour, startMinute] = settings.quietHours.start.split(":").map(Number)
    const [endHour, endMinute] = settings.quietHours.end.split(":").map(Number)
    const startTimeMinutes = startHour * 60 + startMinute
    const endTimeMinutes = endHour * 60 + endMinute

    const isQuietHours =
      endTimeMinutes > startTimeMinutes
        ? currentTimeMinutes >= startTimeMinutes && currentTimeMinutes <= endTimeMinutes
        : currentTimeMinutes >= startTimeMinutes || currentTimeMinutes <= endTimeMinutes

    if (isQuietHours && !(settings.quietHours.overrideForCritical && riskLevel === "EXTREME")) {
      return false
    }
  }

  // Bekleme süresi kontrolü
  if (lastAlertTimestamp && settings.cooldownPeriod > 0) {
    const lastAlertTime = new Date(lastAlertTimestamp).getTime()
    const now = Date.now()
    const elapsedMinutes = (now - lastAlertTime) / (1000 * 60)

    if (elapsedMinutes < settings.cooldownPeriod) {
      return false
    }
  }

  return true
}

// Aktif uyarı kanallarını getirme
export function getActiveAlertChannels(settings: AlertSettings, riskLevel: FlashFloodRiskLevel): AlertChannel[] {
  const activeChannels: AlertChannel[] = []

  Object.entries(settings.channels).forEach(([channel, config]) => {
    if (config.enabled) {
      // Kritik durumlarda acil durum servislerini ekle
      if (channel === "EMERGENCY_SERVICES" && riskLevel !== "EXTREME") {
        return
      }

      // Yüksek risk durumlarında telefon aramasını ekle
      if (channel === "PHONE_CALL" && riskLevel !== "EXTREME" && riskLevel !== "HIGH") {
        return
      }

      activeChannels.push(channel as AlertChannel)
    }
  })

  return activeChannels
}

// Tarayıcı bildirimlerini destekleyip desteklemediğini kontrol etme
export function browserSupportsNotifications(): boolean {
  return "Notification" in window
}

// Tarayıcı bildirimi izni isteme
export async function requestNotificationPermission(): Promise<boolean> {
  if (!browserSupportsNotifications()) {
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  } catch (error) {
    console.error("Bildirim izni istenemedi:", error)
    return false
  }
}

// Tarayıcı bildirimi gönderme
export function sendBrowserNotification(title: string, options?: NotificationOptions): boolean {
  if (!browserSupportsNotifications() || Notification.permission !== "granted") {
    return false
  }

  try {
    new Notification(title, options)
    return true
  } catch (error) {
    console.error("Bildirim gönderilemedi:", error)
    return false
  }
}

// Uyarı test fonksiyonu
export async function sendTestAlert(settings: AlertSettings): Promise<AlertRecord | null> {
  if (!settings.enabled) {
    console.warn("Uyarı sistemi devre dışı bırakıldığı için test uyarısı gönderilemiyor.")
    return null
  }

  const testLocation = {
    name: "Test Konumu",
    lat: 39.925533,
    lon: 32.866287,
  }

  const testRiskLevel: FlashFloodRiskLevel = "MODERATE"
  const testLeadTime = 120 // 2 saat

  const activeChannels = getActiveAlertChannels(settings, testRiskLevel)
  if (activeChannels.length === 0) {
    console.warn("Aktif uyarı kanalı bulunamadığı için test uyarısı gönderilemiyor.")
    return null
  }

  // Tarayıcı bildirimi için izin kontrolü
  if (activeChannels.includes("PUSH") && browserSupportsNotifications() && Notification.permission !== "granted") {
    await requestNotificationPermission()
  }

  // Kanal iletişim bilgilerini topla
  const contactInfo: { [key in AlertChannel]?: string } = {}
  activeChannels.forEach((channel) => {
    contactInfo[channel] = settings.channels[channel].contactInfo
  })

  // Test uyarısı gönder
  try {
    const alertRecord = await sendAlert(testRiskLevel, testLocation, testLeadTime, activeChannels, contactInfo)

    // Tarayıcı bildirimi gönder
    if (activeChannels.includes("PUSH") && browserSupportsNotifications() && Notification.permission === "granted") {
      sendBrowserNotification("Ani Su Baskını Test Uyarısı", {
        body: alertRecord.message,
        icon: "/favicon.ico",
        tag: alertRecord.id,
      })
    }

    return alertRecord
  } catch (error) {
    console.error("Test uyarısı gönderilirken hata oluştu:", error)
    return null
  }
}
