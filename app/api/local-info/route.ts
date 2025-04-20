import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // In a real application, you would use a geocoding API or timezone API
    // For this example, we'll return mock data

    const now = new Date()

    // Mock data for demonstration
    const localInfo = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localTime: now.toLocaleTimeString(),
      country: "United States",
      region: "California",
      sunrise: new Date(now.setHours(6, 30)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sunset: new Date(now.setHours(19, 45)).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    return NextResponse.json(localInfo)
  } catch (error) {
    console.error("Error fetching local info:", error)
    return NextResponse.json({ error: "Failed to fetch local information" }, { status: 500 })
  }
}
