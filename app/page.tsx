import LocationExplorerWrapper from "@/components/location-explorer-wrapper"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">Sel ve Taşkın Tahmini</h1>
        <p className="text-center text-gray-600 mb-2">Konum bazlı sel ve taşkın risk değerlendirmesi</p>
        <p className="text-center text-gray-500 text-sm mb-8">
          Tarım ve Orman Bakanlığı Su Yönetimi Genel Müdürlüğü taşkın yönetim planları verileri kullanılmaktadır
        </p>

        <LocationExplorerWrapper />
      </div>
    </main>
  )
}
