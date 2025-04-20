import { NextResponse } from "next/server"

// Taşkın tehlike haritası görüntüsü
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")
  const zoom = searchParams.get("zoom") || "12"

  if (!lat || !lon) {
    return NextResponse.json({ error: "Enlem ve boylam parametreleri gereklidir" }, { status: 400 })
  }

  try {
    // Gerçek bir sistemde, burada taşkın tehlike haritası görüntüsü oluşturulur
    // Şimdilik, statik bir görüntü URL'i döndürüyoruz

    // Gerçek bir API'ye yönlendirme yapılabilir
    // Örneğin: DSİ veya AFAD'ın taşkın haritaları servisi

    // Burada örnek olarak bir placeholder görüntü döndürüyoruz
    const imageUrl = `/placeholder.svg?height=500&width=800&text=Taşkın+Tehlike+Haritası+(${lat},${lon})`

    // Gerçek bir sistemde, görüntüyü doğrudan döndürebiliriz
    // Şimdilik, URL'i JSON olarak döndürüyoruz
    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("Taşkın tehlike haritası görüntüsü oluşturma hatası:", error)
    return NextResponse.json({ error: "Taşkın tehlike haritası görüntüsü oluşturulamadı" }, { status: 500 })
  }
}
