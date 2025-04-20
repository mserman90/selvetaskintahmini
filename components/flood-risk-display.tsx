"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Droplets, Info, AlertCircle, CheckCircle2, MapPin } from "lucide-react"
import { calculateFloodRisk, checkBasinStatus } from "@/lib/flood-risk"
import type { WeatherData } from "@/lib/types"
import { fetchWeatherData } from "@/lib/weather-api"
import { getFloodHazardMapImageUrl } from "@/lib/flood-hazard-maps"
import type { FloodHazardZone } from "@/lib/flood-hazard-maps"

interface FloodRiskDisplayProps {
  location: {
    latitude: number
    longitude: number
  }
}

export default function FloodRiskDisplay({ location }: FloodRiskDisplayProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [floodRisk, setFloodRisk] = useState<{
    riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
    riskScore: number
    riskFactors: string[]
    recommendations: string[]
    floodHazardZones?: FloodHazardZone[]
    isInFloodZone?: boolean
  } | null>(null)
  const [basinStatus, setBasinStatus] = useState<{
    basinName: string
    waterLevel: number
    floodRisk: "LOW" | "MEDIUM" | "HIGH" | "EXTREME"
    lastUpdated: string
    basinData?: any
    floodHazardData?: any
  } | null>(null)
  const [activeTab, setActiveTab] = useState("risk")
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const loadData = async () => {
      setLoading(true)
      try {
        // Hava durumu verilerini çek
        const data = await fetchWeatherData(
          "openweathermap",
          "accprecip",
          location.latitude,
          location.longitude,
          48, // 48 saatlik tahmin
        )
        setWeatherData(data)

        // Havza durumunu kontrol et
        const basin = await checkBasinStatus(location.latitude, location.longitude)
        setBasinStatus(basin)

        // Sel riski hesapla
        const risk = await calculateFloodRisk(data, basin.basinData, basin.floodHazardData)
        setFloodRisk(risk)

        // Taşkın tehlike haritası görüntüsü URL'i oluştur
        const imageUrl = getFloodHazardMapImageUrl(location.latitude, location.longitude)
        setMapImageUrl(imageUrl)
      } catch (error) {
        console.error("Sel riski verisi yüklenirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    if (location) {
      loadData()
    }
  }, [location, isMounted])

  // Risk seviyesine göre renk belirleme
  const getRiskColor = (riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME") => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "EXTREME":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Risk seviyesine göre ikon belirleme
  const getRiskIcon = (riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME") => {
    switch (riskLevel) {
      case "LOW":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "MEDIUM":
        return <Info className="h-5 w-5 text-yellow-600" />
      case "HIGH":
        return <AlertCircle className="h-5 w-5 text-orange-600" />
      case "EXTREME":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  // Risk seviyesine göre metin belirleme
  const getRiskText = (riskLevel: "LOW" | "MEDIUM" | "HIGH" | "EXTREME") => {
    switch (riskLevel) {
      case "LOW":
        return "Düşük Risk"
      case "MEDIUM":
        return "Orta Risk"
      case "HIGH":
        return "Yüksek Risk"
      case "EXTREME":
        return "Çok Yüksek Risk"
    }
  }

  // Progress bar rengi belirleme
  const getProgressColor = (value: number) => {
    if (value >= 70) return "bg-red-600"
    if (value >= 40) return "bg-orange-500"
    if (value >= 20) return "bg-yellow-500"
    return "bg-green-500"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!weatherData || !floodRisk || !basinStatus) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Sel riski verisi yüklenemedi. Lütfen daha sonra tekrar deneyin.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="risk">Sel Riski</TabsTrigger>
          <TabsTrigger value="basin">Havza Durumu</TabsTrigger>
          <TabsTrigger value="hazard-map">Tehlike Haritası</TabsTrigger>
        </TabsList>

        <TabsContent value="risk" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sel ve Taşkın Risk Analizi</CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRiskColor(
                    floodRisk.riskLevel,
                  )}`}
                >
                  {getRiskIcon(floodRisk.riskLevel)}
                  <span className="ml-1">{getRiskText(floodRisk.riskLevel)}</span>
                </div>
              </div>
              <CardDescription>
                {weatherData.location.name} için {new Date().toLocaleDateString("tr-TR")} tarihli risk değerlendirmesi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Risk Skoru</span>
                  <span className="font-medium">{floodRisk.riskScore}/100</span>
                </div>
                <Progress value={floodRisk.riskScore} className={getProgressColor(floodRisk.riskScore)} />
              </div>

              {floodRisk.isInFloodZone && (
                <Alert className="bg-red-50 border-red-200 text-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertTitle>Taşkın Tehlike Bölgesi</AlertTitle>
                  <AlertDescription className="text-sm">
                    Bu konum, taşkın tehlike haritalarına göre taşkın riski taşıyan bir bölgede yer almaktadır. Lütfen
                    gerekli önlemleri alın ve resmi uyarıları takip edin.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <h3 className="font-medium">Risk Faktörleri</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {floodRisk.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Öneriler</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {floodRisk.recommendations.map((recommendation, index) => (
                    <li key={index}>{recommendation}</li>
                  ))}
                </ul>
              </div>

              <Alert className="mt-4">
                <Droplets className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription className="text-xs">
                  Bu risk değerlendirmesi, meteorolojik tahminler, havza verileri ve Tarım ve Orman Bakanlığı Su
                  Yönetimi Genel Müdürlüğü tarafından hazırlanan 500 yıllık taşkın tekerrür debili tehlike haritaları ve
                  taşkın yönetim planları kullanılarak yapılmıştır. Gerçek durumlar farklılık gösterebilir. Her zaman
                  resmi uyarıları takip edin.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basin" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{basinStatus.basinName}</CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRiskColor(
                    basinStatus.floodRisk,
                  )}`}
                >
                  {getRiskIcon(basinStatus.floodRisk)}
                  <span className="ml-1">{getRiskText(basinStatus.floodRisk)}</span>
                </div>
              </div>
              <CardDescription>Son güncelleme: {basinStatus.lastUpdated}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Su Seviyesi</span>
                  <span className="font-medium">%{Math.round(basinStatus.waterLevel)}</span>
                </div>
                <Progress value={basinStatus.waterLevel} className={getProgressColor(basinStatus.waterLevel)} />
              </div>

              {basinStatus.basinData?.rivers && basinStatus.basinData.rivers.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Nehir Durumları</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {basinStatus.basinData.rivers.map((river) => (
                      <div
                        key={river.id}
                        className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-blue-800">{river.name}</div>
                          <div className="text-xs text-blue-600">
                            Su seviyesi: {river.currentLevel.toFixed(1)}m (Normal: {river.normalLevel.toFixed(1)}m)
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            river.currentLevel > river.floodLevel
                              ? "bg-red-100 text-red-800"
                              : river.currentLevel > river.normalLevel * 1.2
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {river.currentLevel > river.floodLevel
                            ? "Taşkın Seviyesi"
                            : river.currentLevel > river.normalLevel * 1.2
                              ? "Yüksek"
                              : "Normal"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {basinStatus.basinData?.dams && basinStatus.basinData.dams.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Baraj Durumları</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {basinStatus.basinData.dams.map((dam) => (
                      <div
                        key={dam.id}
                        className="bg-blue-50 p-3 rounded-lg border border-blue-100 flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-blue-800">{dam.name}</div>
                          <div className="text-xs text-blue-600">
                            Doluluk: %{dam.fillRate.toFixed(0)} ({dam.currentVolume.toFixed(1)} milyon m³)
                          </div>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            dam.fillRate > 90
                              ? "bg-red-100 text-red-800"
                              : dam.fillRate > 70
                                ? "bg-orange-100 text-orange-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {dam.fillRate > 90 ? "Kritik" : dam.fillRate > 70 ? "Yüksek" : "Normal"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription className="text-xs">
                  Havza verileri, DSİ ve ilgili kurumlardan alınan bilgiler doğrultusunda hazırlanmıştır. Daha detaylı
                  bilgi için{" "}
                  <a
                    href="https://usbs.tarimorman.gov.tr/usbs/VatandasGirisi/Index"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    USBS
                  </a>{" "}
                  sistemini ziyaret edebilirsiniz.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hazard-map" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>500 Yıllık Taşkın Tehlike Haritası</CardTitle>
                {floodRisk.isInFloodZone && (
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    <span>Taşkın Bölgesi</span>
                  </div>
                )}
              </div>
              <CardDescription>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {weatherData.location.name} ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-[300px]">
                {mapImageUrl ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Taşkın tehlike haritası görüntüsü (500 yıllık tekerrür debili)
                    </p>
                    <img
                      src={mapImageUrl || "/placeholder.svg"}
                      alt="Taşkın Tehlike Haritası"
                      className="max-w-full max-h-[250px] mx-auto border border-gray-300 rounded"
                    />
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Taşkın tehlike haritası görüntüsü yüklenemedi</p>
                  </div>
                )}
              </div>

              {floodRisk.floodHazardZones && floodRisk.floodHazardZones.length > 0 ? (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Taşkın Tehlike Bölgeleri</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {floodRisk.floodHazardZones.map((zone) => (
                      <div
                        key={zone.id}
                        className={`p-3 rounded-lg border flex justify-between items-center ${getRiskColor(
                          zone.riskLevel,
                        )}`}
                      >
                        <div>
                          <div className="font-medium">{zone.name}</div>
                          <div className="text-xs">
                            {zone.recurrencePeriod} yıllık tekerrür periyodu | Kaynak: {zone.source}
                          </div>
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-white">
                          {getRiskText(zone.riskLevel)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Bilgilendirme</AlertTitle>
                  <AlertDescription className="text-sm">
                    Bu konum için tanımlanmış taşkın tehlike bölgesi bulunmamaktadır. Ancak, bu durum sel riskinin
                    olmadığı anlamına gelmez. Lütfen hava durumu tahminlerini ve resmi uyarıları takip etmeye devam
                    edin.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mt-4 space-y-2">
                <h3 className="font-medium">Taşkın Tehlike Haritaları Hakkında</h3>
                <p className="text-sm text-gray-600">
                  500 yıllık taşkın tekerrür debili tehlike haritaları, 500 yılda bir görülebilecek büyüklükteki
                  taşkınların etki alanlarını gösterir. Bu haritalar, taşkın riski taşıyan bölgelerin belirlenmesi,
                  yapılaşma kararlarının alınması ve afet yönetimi planlarının hazırlanması için önemli bir kaynaktır.
                </p>
                <p className="text-sm text-gray-600">
                  Haritalar, DSİ (Devlet Su İşleri) tarafından hazırlanmakta ve düzenli olarak güncellenmektedir. Taşkın
                  tehlike haritalarında gösterilen bölgelerde yaşıyorsanız, sel sigortası yaptırmanız ve acil durum
                  planlarınızı hazırlamanız önerilir.
                </p>
                <p className="text-sm text-gray-600">
                  Bu değerlendirmeler, Tarım ve Orman Bakanlığı Su Yönetimi Genel Müdürlüğü tarafından hazırlanan Taşkın
                  Yönetim Planları'ndaki veriler ve metodolojiler kullanılarak yapılmaktadır. Daha detaylı bilgi için
                  "Yönetim Planları" sekmesini inceleyebilirsiniz.
                </p>
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription className="text-xs">
                  Taşkın tehlike haritaları, DSİ ve ilgili kurumlardan alınan veriler doğrultusunda hazırlanmıştır. Daha
                  detaylı bilgi için{" "}
                  <a href="https://dsi.gov.tr" target="_blank" rel="noopener noreferrer" className="underline">
                    DSİ
                  </a>{" "}
                  web sitesini ziyaret edebilirsiniz.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
