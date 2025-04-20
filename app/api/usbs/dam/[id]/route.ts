import { NextResponse } from "next/server"

// Baraj bilgisi alma
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const damId = params.id

  if (!damId) {
    return NextResponse.json({ error: "Baraj ID'si gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek USBS API'sine bağlanma girişimi
    // Bu kısım, gerçek API erişimi olduğunda güncellenecek
    // Şimdilik, mock veri döndürüyoruz

    // Mock baraj verileri
    const mockDams = {
      "1": {
        id: "1",
        name: "Ömerli Barajı",
        capacity: 386.5,
        currentVolume: 220.3,
        fillRate: 57,
        dischargeRate: 12.5,
        lastUpdated: new Date().toISOString(),
      },
      "2": {
        id: "2",
        name: "Darlık Barajı",
        capacity: 107.5,
        currentVolume: 68.8,
        fillRate: 64,
        dischargeRate: 5.2,
        lastUpdated: new Date().toISOString(),
      },
      "3": {
        id: "3",
        name: "Çaygören Barajı",
        capacity: 144.0,
        currentVolume: 52.0,
        fillRate: 36,
        dischargeRate: 8.3,
        lastUpdated: new Date().toISOString(),
      },
      "4": {
        id: "4",
        name: "Oymapınar Barajı",
        capacity: 300.0,
        currentVolume: 180.0,
        fillRate: 60,
        dischargeRate: 42.5,
        lastUpdated: new Date().toISOString(),
      },
      "5": {
        id: "5",
        name: "Apa Barajı",
        capacity: 450.0,
        currentVolume: 112.5,
        fillRate: 25,
        dischargeRate: 6.8,
        lastUpdated: new Date().toISOString(),
      },
      "6": {
        id: "6",
        name: "Keban Barajı",
        capacity: 31000.0,
        currentVolume: 18600.0,
        fillRate: 60,
        dischargeRate: 650.0,
        lastUpdated: new Date().toISOString(),
      },
      "7": {
        id: "7",
        name: "Ilısu Barajı",
        capacity: 10400.0,
        currentVolume: 5200.0,
        fillRate: 50,
        dischargeRate: 450.0,
        lastUpdated: new Date().toISOString(),
      },
      "8": {
        id: "8",
        name: "Borçka Barajı",
        capacity: 418.0,
        currentVolume: 334.4,
        fillRate: 80,
        dischargeRate: 120.0,
        lastUpdated: new Date().toISOString(),
      },
    }

    const damData = mockDams[damId]

    if (!damData) {
      return NextResponse.json({ error: "Baraj bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(damData)
  } catch (error) {
    console.error("USBS baraj verisi çekme hatası:", error)
    return NextResponse.json({ error: "USBS baraj verisi çekilemedi" }, { status: 500 })
  }
}
