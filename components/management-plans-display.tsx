"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, FileText, ExternalLink, MapPin, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

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

export default function ManagementPlansDisplay() {
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle>Taşkın Yönetim Planları Hakkında</AlertTitle>
        <AlertDescription>
          Taşkın Yönetim Planları, Tarım ve Orman Bakanlığı Su Yönetimi Genel Müdürlüğü tarafından hazırlanan, taşkın
          risklerinin değerlendirilmesi ve yönetilmesi için stratejiler içeren resmi dokümanlardır. Bu planlar, sel ve
          taşkın risk değerlendirmesinde kullanılan temel kaynaklardır.
        </AlertDescription>
      </Alert>

      {/* USBS Tehlike Haritaları Erişimi - YENİ EKLENEN BÖLÜM */}
      <Card className="border-2 border-blue-300">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
            USBS Taşkın Tehlike Haritaları
          </CardTitle>
          <CardDescription>Ulusal Su Bilgi Sistemi üzerinden güncel taşkın tehlike haritalarına erişin</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Info className="h-10 w-10 text-blue-600 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium mb-1">USBS Vatandaş Portalı, taşkın tehlike haritalarına erişim sağlar:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>500 yıllık taşkın tekerrür debili tehlike haritaları</li>
                  <li>Taşkın risk haritaları ve analizleri</li>
                  <li>Havza bazlı taşkın yönetim planları</li>
                  <li>Taşkın erken uyarı sistemleri</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <div className="bg-gray-100 p-4 text-center">
                <img
                  src="/placeholder.svg?height=200&width=400&text=USBS+Taşkın+Tehlike+Haritaları+Örneği"
                  alt="USBS Taşkın Tehlike Haritaları Örneği"
                  className="mx-auto rounded-lg border border-gray-300"
                />
              </div>
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
    </div>
  )
}
