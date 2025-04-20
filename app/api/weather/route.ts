import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // Use OpenWeatherMap API with the API key from environment variables
    const apiKey = process.env.OPENWEATHERMAP_API_KEY

    if (!apiKey) {
      console.error("API key not found in environment variables")
      return NextResponse.json({ error: "API configuration error" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-cache", // Ensure we get fresh data
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`OpenWeatherMap API error: ${response.status}`, errorText)
      return NextResponse.json({ error: `Weather service error: ${response.status}` }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
