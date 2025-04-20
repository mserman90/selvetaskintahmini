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
