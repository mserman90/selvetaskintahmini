import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const type = searchParams.get("type") || "restaurant"

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
  }

  try {
    // In a real application, you would use a Places API like Google Places
    // For this example, we'll return mock data

    // Mock data for demonstration
    const places = [
      {
        id: "1",
        name: "Local Coffee Shop",
        vicinity: "123 Main St",
        types: ["cafe", "restaurant"],
        distance: 0.3,
        icon: "☕",
      },
      {
        id: "2",
        name: "City Park",
        vicinity: "456 Park Ave",
        types: ["park", "tourist_attraction"],
        distance: 0.7,
        icon: "🌳",
      },
      {
        id: "3",
        name: "Downtown Restaurant",
        vicinity: "789 Food St",
        types: ["restaurant", "bar"],
        distance: 1.2,
        icon: "🍽️",
      },
      {
        id: "4",
        name: "Community Library",
        vicinity: "101 Book Ln",
        types: ["library", "establishment"],
        distance: 1.5,
        icon: "📚",
      },
      {
        id: "5",
        name: "Local Supermarket",
        vicinity: "202 Shop Blvd",
        types: ["grocery_or_supermarket", "store"],
        distance: 0.9,
        icon: "🛒",
      },
    ]

    // Filter places based on type
    const filteredPlaces = places.filter((place) => place.types.some((t) => t.includes(type)))

    return NextResponse.json({ results: filteredPlaces })
  } catch (error) {
    console.error("Error fetching places data:", error)
    return NextResponse.json({ error: "Failed to fetch places data" }, { status: 500 })
  }
}
