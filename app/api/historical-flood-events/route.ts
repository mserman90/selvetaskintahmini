import { NextResponse } from "next/server"
import { sampleHistoricalFloodEvents, calculateDistance } from "@/lib/historical-flood-events"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lon = Number.parseFloat(searchParams.get("lon") || "0")
  const radius = Number.parseFloat(searchParams.get("radius") || "50")
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  const startDate = searchParams.get("startDate") || undefined
  const endDate = searchParams.get("endDate") || undefined

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Geçerli enlem ve boylam değerleri gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek bir API'ye bağlanmak yerine örnek verileri kullanıyoruz
    // Gerçek bir uygulamada, burada veritabanı sorgusu veya harici API çağrısı yapılır

    // Belirtilen konuma belirli bir yarıçap içindeki olayları filtrele
    let filteredEvents = sampleHistoricalFloodEvents.filter((event) => {
      const distance = calculateDistance(lat, lon, event.location.lat, event.location.lon)
      return distance <= radius
    })

    // Tarih filtreleri varsa uygula
    if (startDate) {
      const startDateTime = new Date(startDate).getTime()
      filteredEvents = filteredEvents.filter((event) => new Date(event.date).getTime() >= startDateTime)
    }

    if (endDate) {
      const endDateTime = new Date(endDate).getTime()
      filteredEvents = filteredEvents.filter((event) => new Date(event.date).getTime() <= endDateTime)
    }

    // Olayları tarihe göre sırala (en yeniden en eskiye)
    filteredEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Limit uygula
    filteredEvents = filteredEvents.slice(0, limit)

    // Her olay için mevcut konuma olan mesafeyi hesapla ve ekle
    const eventsWithDistance = filteredEvents.map((event) => {
      const distance = calculateDistance(lat, lon, event.location.lat, event.location.lon)
      return {
        ...event,
        distance: Number.parseFloat(distance.toFixed(1)),
      }
    })

    return NextResponse.json({
      events: eventsWithDistance,
      total: eventsWithDistance.length,
      location: { lat, lon },
      radius,
    })
  } catch (error) {
    console.error("Geçmiş ani su baskını olayları getirilirken hata:", error)
    return NextResponse.json({ error: "Geçmiş ani su baskını olayları getirilirken bir hata oluştu" }, { status: 500 })
  }
}
