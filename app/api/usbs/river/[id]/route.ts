import { NextResponse } from "next/server"

// Nehir bilgisi alma
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const riverId = params.id

  if (!riverId) {
    return NextResponse.json({ error: "Nehir ID'si gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek USBS API'sine bağlanma girişimi
    // Bu kısım, gerçek API erişimi olduğunda güncellenecek
    // Şimdilik, mock veri döndürüyoruz

    // Mock nehir verileri
    const mockRivers = {
      "1": {
        id: "1",
        name: "Nilüfer Çayı",
        currentLevel: 2.3,
        normalLevel: 1.8,
        floodLevel: 4.5,
        flowRate: 35.2,
        lastUpdated: new Date().toISOString(),
      },
      "2": {
        id: "2",
        name: "Bakırçay",
        currentLevel: 1.8,
        normalLevel: 1.5,
        floodLevel: 3.8,
        flowRate: 28.6,
        lastUpdated: new Date().toISOString(),
      },
      "3": {
        id: "3",
        name: "Köprüçay",
        currentLevel: 1.2,
        normalLevel: 1.0,
        floodLevel: 3.2,
        flowRate: 45.8,
        lastUpdated: new Date().toISOString(),
      },
      "4": {
        id: "4",
        name: "Çarşamba Çayı",
        currentLevel: 0.8,
        normalLevel: 1.2,
        floodLevel: 2.8,
        flowRate: 12.4,
        lastUpdated: new Date().toISOString(),
      },
      "5": {
        id: "5",
        name: "Murat Nehri",
        currentLevel: 3.2,
        normalLevel: 2.5,
        floodLevel: 5.5,
        flowRate: 320.0,
        lastUpdated: new Date().toISOString(),
      },
      "6": {
        id: "6",
        name: "Dicle Nehri",
        currentLevel: 4.5,
        normalLevel: 3.8,
        floodLevel: 7.2,
        flowRate: 520.0,
        lastUpdated: new Date().toISOString(),
      },
      "7": {
        id: "7",
        name: "Çoruh Nehri",
        currentLevel: 5.8,
        normalLevel: 4.2,
        floodLevel: 8.0,
        flowRate: 450.0,
        lastUpdated: new Date().toISOString(),
      },
    }

    const riverData = mockRivers[riverId]

    if (!riverData) {
      return NextResponse.json({ error: "Nehir bulunamadı" }, { status: 404 })
    }

    return NextResponse.json(riverData)
  } catch (error) {
    console.error("USBS nehir verisi çekme hatası:", error)
    return NextResponse.json({ error: "USBS nehir verisi çekilemedi" }, { status: 500 })
  }
}
