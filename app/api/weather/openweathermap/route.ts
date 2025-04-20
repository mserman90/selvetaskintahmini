import { NextResponse } from "next/server"

// OpenWeatherMap API için sunucu taraflı endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat") || "39.956"
  const lon = searchParams.get("lon") || "32.894"
  const endpoint = searchParams.get("endpoint") || "forecast" // forecast veya weather

  // API anahtarını sunucu tarafında güvenli bir şekilde kullan
  const apiKey = process.env.OPENWEATHERMAP_API_KEY || "62bc64d515f8934e1a20f8c23268df81"

  try {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&units=metric&lang=tr&appid=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OpenWeatherMap API hatası: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("OpenWeatherMap veri çekme hatası:", error)
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 })
  }
}
