import { NextResponse } from "next/server"

// OpenWeatherMap harita karoları için proxy endpoint
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const layer = searchParams.get("layer") || "precipitation_new"
  const z = searchParams.get("z") || "0"
  const x = searchParams.get("x") || "0"
  const y = searchParams.get("y") || "0"

  // API anahtarını sunucu tarafında güvenli bir şekilde kullan
  const apiKey = process.env.OPENWEATHERMAP_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API anahtarı bulunamadı" }, { status: 500 })
  }

  try {
    const url = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${apiKey}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`OpenWeatherMap harita karolu hatası: ${response.status}`)
    }

    // Harita karosunu doğrudan ilet
    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("OpenWeatherMap harita karolu çekme hatası:", error)
    return NextResponse.json({ error: "Harita karolu çekilemedi" }, { status: 500 })
  }
}
