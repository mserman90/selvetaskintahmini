"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, FileText, ExternalLink, MapPin, Download, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

// Taşkın Yönetim Planları verileri
const managementPlans = [
  {
    id: 1,
    name: "Yeşilırmak Havzası Taşkın Yönetim Planı",
    region: "Yeşilırmak Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/Ye%C5%9Fil%C4%B1rmak%20Havzas%C4%B1%20Ta%C5%9Fk%C4%B1n%20Y%C3%B6netim%20Plan%C4%B1.pdf",
    description:
      "Yeşilırmak Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
  {
    id: 2,
    name: "Susurluk Havzası Taşkın Yönetim Planı",
    region: "Susurluk Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/SUSURLUK%20HAVZASI%20TA%C5%9EKIN%20Y%C3%96NET%C4%B0M%20PLANI.pdf",
    description:
      "Susurluk Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
  {
    id: 3,
    name: "Batı Karadeniz Havzası Taşkın Yönetim Planı",
    region: "Batı Karadeniz Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/BATI%20KARADEN%C4%B0Z%20HAVZASI%20TA%C5%9EKIN%20Y%C3%96NET%C4%B0M%20PLANI.pdf",
    description:
      "Batı Karadeniz Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
  {
    id: 4,
    name: "Antalya Havzası Taşkın Yönetim Planı",
    region: "Antalya Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/ANTALYA%20HAVZASI%20TA%C5%9EKIN%20Y%C3%96NET%C4%B0M%20PLANI.pdf",
    description:
      "Antalya Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
  {
    id: 5,
    name: "Büyük Menderes Havzası Taşkın Yönetim Planı",
    region: "Büyük Menderes Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/B%C3%9CY%C3%9CK%20MENDERES%20HAVZASI%20TA%C5%9EKIN%20Y%C3%96NET%C4%B0M%20PLANI.pdf",
    description:
      "Büyük Menderes Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
  {
    id: 6,
    name: "Ceyhan Havzası Taşkın Yönetim Planı",
    region: "Ceyhan Havzası",
    date: "2019",
    url: "https://www.tarimorman.gov.tr/SYGM/Belgeler/Ta%C5%9Fk%C4%B1n%20Y%C3%B6netimi/CEYHAN%20HAVZASI%20TA%C5%9EKIN%20Y%C3%96NET%C4%B0M%20PLANI.pdf",
    description:
      "Ceyhan Havzası için hazırlanan taşkın yönetim planı, havzadaki taşkın risklerini ve alınması gereken önlemleri içerir.",
  },
]

// Örnek taşkın tehlike haritaları
const floodHazardMapExamples = [
  {
    id: 1,
    title: "Q500 Taşkın Tehlike Haritası - Yeşilırmak",
    description: "500 yıllık tekerrür debili taşkın tehlike haritası örneği (Yeşilırmak Havzası)",
    imageUrl: "/images/flood-map-example-1.png",
    legend: [
      { color: "#ff0000", label: "Çok Yüksek Risk ({'>'}2m su derinliği)" },
      { color: "#ff8800", label: "Yüksek Risk (1-2m su derinliği)" },
      { color: "#ffcc00", label: "Orta Risk (0.5-1m su derinliği)" },
      { color: "#ffff00", label: "Düşük Risk ({'<'}0.5m su derinliği)" },
    ],
    details:
      "Bu harita, Yeşilırmak Nehri'nin 500 yıllık tekerrür debisinde oluşabilecek taşkın alanlarını göstermektedir. Renkler, taşkın sırasında oluşabilecek su derinliğini temsil eder.",
  },
  {
    id: 2,
    title: "Q100 Taşkın Tehlike Haritası - Susurluk",
    description: "100 yıllık tekerrür debili taşkın tehlike haritası örneği (Susurluk Havzası)",
    imageUrl: "/images/flood-map-example-2.png",
    legend: [
      { color: "#ff0000", label: "Çok Yüksek Risk ({'>'}2m su derinliği)" },
      { color: "#ff8800", label: "Yüksek Risk (1-2m su derinliği)" },
      { color: "#ffcc00", label: "Orta Risk (0.5-1m su derinliği)" },
      { color: "#ffff00", label: "Düşük Risk ({'<'}0.5m su derinliği)" },
    ],
    details:
      "Bu harita, Susurluk Havzası'ndaki nehirlerin 100 yıllık tekerrür debisinde oluşabilecek taşkın alanlarını göstermektedir. Renkler, taşkın sırasında oluşabilecek su derinliğini temsil eder.",
  },
  {
    id: 3,
    title: "Taşkın Risk Haritası - Batı Karadeniz",
    description: "Taşkın risk haritası örneği (Batı Karadeniz Havzası)",
    imageUrl: "/images/flood-map-example-3.png",
    legend: [
      { color: "#ff0000", label: "Çok Yüksek Risk" },
      { color: "#ff8800", label: "Yüksek Risk" },
      { color: "#ffcc00", label: "Orta Risk" },
      { color: "#ffff00", label: "Düşük Risk" },
    ],
    details:
      "Bu harita, Batı Karadeniz Havzası'ndaki taşkın risklerini göstermektedir. Risk seviyeleri, su derinliği, akış hızı ve potansiyel ekonomik/sosyal etkilerin bir kombinasyonu olarak hesaplanmıştır.",
  },
  {
    id: 4,
    title: "Taşkın Yayılım Haritası - Antalya",
    description: "Taşkın yayılım haritası örneği (Antalya Havzası)",
    imageUrl: "/images/flood-map-example-4.png",
    legend: [
      { color: "#0000ff", label: "Q500 Taşkın Yayılımı" },
      { color: "#00aaff", label: "Q100 Taşkın Yayılımı" },
      { color: "#00ffff", label: "Q50 Taşkın Yayılımı" },
      { color: "#aaffff", label: "Q10 Taşkın Yayılımı" },
    ],
    details:
      "Bu harita, Antalya Havzası'ndaki farklı tekerrür debilerinde (Q10, Q50, Q100, Q500) oluşabilecek taşkın yayılım alanlarını göstermektedir. Mavi tonları, farklı tekerrür periyotlarını temsil eder.",
  },
]

export default function ManagementPlansDisplay() {
  const [activeTab, setActiveTab] = useState("plans")
  const [selectedMap, setSelectedMap] = useState<number | null>(null)

  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Taşkın Yönetim Planları ve Tehlike Haritaları</AlertTitle>
        <AlertDescription>
          Tarım ve Orman Bakanlığı Su Yönetimi Genel Müdürlüğü tarafından hazırlanan taşkın yönetim planları ve tehlike
          haritaları, taşkın risklerinin değerlendirilmesi ve yönetilmesi için önemli kaynaklardır.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="plans">Yönetim Planları</TabsTrigger>
          <TabsTrigger value="maps">Tehlike Haritaları</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tüm Taşkın Yönetim Planları</CardTitle>
              <CardDescription>
                Tarım ve Orman Bakanlığı Su Yönetimi Genel Müdürlüğü tarafından yayınlanan tüm taşkın yönetim planlarına
                erişin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" asChild>
                <a
                  href="https://www.tarimorman.gov.tr/SYGM/Sayfalar/Detay.aspx?SayfaId=53"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Bakanlık Sayfasını Ziyaret Et
                </a>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4">
            {managementPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {plan.region} ({plan.date})
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex justify-between items-center">
                    <a
                      href={plan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Planı Görüntüle
                    </a>
                    <Button variant="outline" size="sm" className="flex items-center" asChild>
                      <a href={plan.url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4 mr-1" />
                        PDF İndir
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maps" className="mt-0 space-y-6">
          {/* USBS Tehlike Haritaları Erişimi */}
          <Card className="border-2 border-blue-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                USBS Taşkın Tehlike Haritaları
              </CardTitle>
              <CardDescription>
                Ulusal Su Bilgi Sistemi üzerinden güncel taşkın tehlike haritalarına erişin
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <Info className="h-10 w-10 text-blue-600 mr-3 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">
                      USBS Vatandaş Portalı, taşkın tehlike haritalarına erişim sağlar:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>500 yıllık taşkın tekerrür debili tehlike haritaları</li>
                      <li>Taşkın risk haritaları ve analizleri</li>
                      <li>Havza bazlı taşkın yönetim planları</li>
                      <li>Taşkın erken uyarı sistemleri</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <div className="p-4 bg-white">
                    <h3 className="font-medium text-sm mb-2">Tehlike Haritalarına Erişim Adımları:</h3>
                    <ol className="list-decimal pl-5 text-sm space-y-1">
                      <li>USBS Vatandaş Portalına giriş yapın</li>
                      <li>"Taşkın Bilgi Sistemi" menüsünü seçin</li>
                      <li>"Taşkın Tehlike Haritaları" bölümüne gidin</li>
                      <li>İlgilendiğiniz bölgeyi harita üzerinde seçin veya arama yapın</li>
                      <li>Görüntülemek istediğiniz tehlike haritası katmanını seçin</li>
                    </ol>
                  </div>
                </div>

                <Button className="w-full" asChild>
                  <a
                    href="https://usbs.tarimorman.gov.tr/usbs/VatandasGirisi/Index"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    USBS Vatandaş Portalına Git
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Örnek Tehlike Haritaları */}
          <Card>
            <CardHeader>
              <CardTitle>Örnek Taşkın Tehlike Haritaları</CardTitle>
              <CardDescription>USBS'de bulunan taşkın tehlike haritalarına benzer örnekler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {floodHazardMapExamples.map((map) => (
                  <Card
                    key={map.id}
                    className="overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => setSelectedMap(map.id)}
                  >
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      <img
                        src={map.imageUrl || "/placeholder.svg"}
                        alt={map.title}
                        className="object-cover w-full h-full"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                        <Button variant="secondary" size="sm" className="flex items-center">
                          <ZoomIn className="h-4 w-4 mr-1" />
                          Detayları Görüntüle
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm">{map.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{map.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seçilen harita detayları */}
          {selectedMap && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle>{floodHazardMapExamples.find((m) => m.id === selectedMap)?.title}</CardTitle>
                <CardDescription>
                  {floodHazardMapExamples.find((m) => m.id === selectedMap)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={floodHazardMapExamples.find((m) => m.id === selectedMap)?.imageUrl || "/placeholder.svg"}
                    alt={floodHazardMapExamples.find((m) => m.id === selectedMap)?.title}
                    className="w-full h-auto"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Harita Lejantı</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {floodHazardMapExamples
                      .find((m) => m.id === selectedMap)
                      ?.legend.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-4 h-4 mr-2 rounded-sm" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm">{item.label}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Harita Açıklaması</h3>
                  <p className="text-sm text-gray-700">
                    {floodHazardMapExamples.find((m) => m.id === selectedMap)?.details}
                  </p>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Bilgilendirme</AlertTitle>
                  <AlertDescription className="text-xs">
                    Bu harita örnek amaçlıdır. Gerçek ve güncel taşkın tehlike haritalarına USBS Vatandaş Portalı
                    üzerinden erişebilirsiniz. Taşkın tehlike haritaları, bölgesel koşullara ve güncel verilere göre
                    değişiklik gösterebilir.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedMap(null)}>
                    Kapat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tehlike Haritaları Hakkında Bilgi */}
          <Card>
            <CardHeader>
              <CardTitle>Taşkın Tehlike Haritaları Nasıl Yorumlanır?</CardTitle>
              <CardDescription>
                Taşkın tehlike haritalarını doğru şekilde okumak ve yorumlamak için bilmeniz gerekenler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Tekerrür Debisi Nedir?</h3>
                <p className="text-sm text-gray-700">
                  Tekerrür debisi (Q), belirli bir zaman periyodunda (örneğin 100 yıl veya 500 yıl) bir kez aşılması
                  beklenen debi değeridir. Örneğin, Q100 (100 yıllık tekerrür debisi), ortalama olarak her 100 yılda bir
                  aşılması beklenen debi değerini ifade eder.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Renk Kodları Ne Anlama Gelir?</h3>
                <p className="text-sm text-gray-700">
                  Taşkın tehlike haritalarında genellikle şu renk kodları kullanılır:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <span className="text-red-600 font-medium">Kırmızı</span>: Çok yüksek risk - Derin su ({">"}2m)
                    ve/veya yüksek akış hızı
                  </li>
                  <li>
                    <span className="text-orange-600 font-medium">Turuncu</span>: Yüksek risk - Orta derinlikte su
                    (1-2m)
                  </li>
                  <li>
                    <span className="text-yellow-600 font-medium">Sarı</span>: Orta risk - Sığ su (0.5-1m)
                  </li>
                  <li>
                    <span className="text-yellow-300 font-medium">Açık Sarı</span>: Düşük risk - Çok sığ su ({"<"}0.5m)
                  </li>
                  <li>
                    <span className="text-blue-600 font-medium">Mavi tonları</span>: Farklı tekerrür periyotlarındaki
                    taşkın yayılımları
                  </li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Harita Türleri</h3>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>
                    <span className="font-medium">Taşkın Tehlike Haritaları</span>: Su derinliği ve yayılımını gösterir
                  </li>
                  <li>
                    <span className="font-medium">Taşkın Risk Haritaları</span>: Tehlikenin potansiyel etkilerini
                    (ekonomik, sosyal, çevresel) gösterir
                  </li>
                  <li>
                    <span className="font-medium">Taşkın Yayılım Haritaları</span>: Farklı tekerrür periyotlarında suyun
                    yayılacağı alanları gösterir
                  </li>
                </ul>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Önemli Not</AlertTitle>
                <AlertDescription className="text-sm">
                  Taşkın tehlike haritaları, yapılaşma kararları, sigorta değerlendirmeleri ve acil durum planlaması
                  için önemli kaynaklardır. Taşkın tehlike bölgesinde yaşıyorsanız, sel sigortası yaptırmanız ve acil
                  durum planınızı hazırlamanız önerilir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
