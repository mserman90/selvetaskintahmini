"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Droplets, Clock, Info, AlertCircle, MapPin, Bell } from "lucide-react"
import { predictFlashFloods, type FlashFloodPrediction, type FlashFloodRiskLevel } from "@/lib/flash-flood-prediction"
import { fetchWeatherData } from "@/lib/weather-api"
import type { WeatherData } from "@/lib/types"
import {
  getAlertSettings,
  shouldSendAlert,
  getActiveAlertChannels,
  sendAlert,
  getAlertHistory,
  browserSupportsNotifications,
  sendBrowserNotification,
} from "@/lib/alert-system"
import AlertSystemManager from "@/components/alert-system-manager"

interface FlashFloodPredictionDisplayProps {
  location: {
    latitude: number
    longitude: number
  }
}

export default function FlashFloodPredictionDisplay({ location }: FlashFloodPredictionDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [prediction, setPrediction] = useState<FlashFloodPrediction | null>(null)
  const [activeTab, setActiveTab] = useState("prediction")
  const [error, setError] = useState<string | null>(null)
  const [showAlertSystem, setShowAlertSystem] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)
      setAlertSent(false)

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

        // Ani su baskını tahmini yap
        const flashFloodPrediction = await predictFlashFloods({ lat: location.latitude, lon: location.longitude }, data)
        setPrediction(flashFloodPrediction)

        // Uyarı gönderme koşullarını kontrol et
        const alertSettings = getAlertSettings()
        const alertHistory = getAlertHistory()
        const lastAlert = alertHistory.length > 0 ? alertHistory[0] : null

        // Uyarı gönderme koşulları sağlanıyorsa uyarı gönder
        if (shouldSendAlert(flashFloodPrediction.riskLevel, alertSettings, lastAlert?.timestamp)) {
          const activeChannels = getActiveAlertChannels(alertSettings, flashFloodPrediction.riskLevel)

          if (activeChannels.length > 0) {
            // Kanal iletişim bilgilerini topla
            const contactInfo: { [key: string]: string } = {}
            activeChannels.forEach((channel) => {
              contactInfo[channel] = alertSettings.channels[channel].contactInfo
            })

            // Uyarı gönder
            const alertRecord = await sendAlert(
              flashFloodPrediction.riskLevel,
              {
                name: data.location.name,
                lat: location.latitude,
                lon: location.longitude,
              },
              flashFloodPrediction.leadTime,
              activeChannels,
              contactInfo,
            )

            // Tarayıcı bildirimi gönder
            if (
              activeChannels.includes("PUSH") &&
              browserSupportsNotifications() &&
              Notification.permission === "granted"
            ) {
              sendBrowserNotification("Ani Su Baskını Uyarısı", {
                body: alertRecord.message,
                icon: "/favicon.ico",
                tag: alertRecord.id,
              })
            }

            setAlertSent(true)
          }
        }
      } catch (error) {
        console.error("Ani su baskını tahmini yüklenirken hata:", error)
        setError("Ani su baskını tahmini yapılamadı. Lütfen daha sonra tekrar deneyin.")
      } finally {
        setLoading(false)
      }
    }

    if (location) {
      loadData()
    }
  }, [location])

  // Risk seviyesine göre renk belirleme
  const getRiskColor = (riskLevel: FlashFloodRiskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "EXTREME":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  // Risk seviyesine göre ikon belirleme
  const getRiskIcon = (riskLevel: FlashFloodRiskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return <Droplets className="h-5 w-5 text-green-600" />
      case "MODERATE":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case "HIGH":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "EXTREME":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
    }
  }

  // Risk seviyesine göre metin belirleme
  const getRiskText = (riskLevel: FlashFloodRiskLevel) => {
    switch (riskLevel) {
      case "LOW":
        return "Düşük Risk"
      case "MODERATE":
        return "Orta Risk"
      case "HIGH":
        return "Yüksek Risk"
      case "EXTREME":
        return "Çok Yüksek Risk"
    }
  }

  // Progress bar rengi belirleme
  const getProgressColor = (value: number) => {
    if (value >= 80) return "bg-red-600"
    if (value >= 60) return "bg-orange-500"
    if (value >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  // Güven seviyesini yüzdeye çevirme
  const confidenceToPercent = (confidence: number) => {
    return Math.round(confidence * 100)
  }

  // Önceden tahmin süresini formatla
  const formatLeadTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} dakika`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours} saat ${remainingMinutes > 0 ? `${remainingMinutes} dakika` : ""}`
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!prediction || !weatherData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Ani su baskını tahmini yapılamadı. Lütfen daha sonra tekrar deneyin.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="prediction">Ani Su Baskını Tahmini</TabsTrigger>
          <TabsTrigger value="methodology">Metodoloji</TabsTrigger>
          <TabsTrigger value="alert-system">Uyarı Sistemi</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Ani Su Baskını Tahmini</CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getRiskColor(
                    prediction.riskLevel,
                  )}`}
                >
                  {getRiskIcon(prediction.riskLevel)}
                  <span className="ml-1">{getRiskText(prediction.riskLevel)}</span>
                </div>
              </div>
              <CardDescription>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {weatherData.location.name} ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {prediction.riskLevel !== "LOW" && (
                <Alert className={getRiskColor(prediction.riskLevel)}>
                  {getRiskIcon(prediction.riskLevel)}
                  <AlertTitle>{getRiskText(prediction.riskLevel)}</AlertTitle>
                  <AlertDescription className="text-sm font-medium">{prediction.warningMessage}</AlertDescription>
                </Alert>
              )}

              {alertSent && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <AlertTitle>Uyarı Gönderildi</AlertTitle>
                  <AlertDescription className="text-sm">
                    Bu tahmin için otomatik uyarı gönderildi. Uyarı ayarlarınızı "Uyarı Sistemi" sekmesinden
                    yönetebilirsiniz.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tahmini Yüzey Akışı</span>
                    <span className="font-medium">{prediction.estimatedRunoff.toFixed(1)} mm</span>
                  </div>
                  <Progress
                    value={Math.min(prediction.estimatedRunoff * 2, 100)}
                    className={getProgressColor(prediction.estimatedRunoff * 2)}
                  />
                  <p className="text-xs text-gray-500">Yağış sonucu oluşacak tahmini yüzey akışı miktarı</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Tahmin Güven Seviyesi</span>
                    <span className="font-medium">%{confidenceToPercent(prediction.confidence)}</span>
                  </div>
                  <Progress value={confidenceToPercent(prediction.confidence)} className="bg-blue-500" />
                  <p className="text-xs text-gray-500">Tahmin modelinin güven seviyesi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                  <Clock className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Önceden Tahmin Süresi</h3>
                    <p className="text-sm text-blue-600 mt-1">{formatLeadTime(prediction.leadTime)}</p>
                    <p className="text-xs text-blue-500 mt-1">
                      Bu süre, olası bir ani su baskını öncesinde sahip olduğunuz hazırlık zamanını gösterir
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg flex items-start">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Etkilenebilecek Alan</h3>
                    <p className="text-sm text-blue-600 mt-1">{prediction.affectedArea.radiusKm} km yarıçaplı bölge</p>
                    <p className="text-xs text-blue-500 mt-1">Belirtilen merkez etrafındaki potansiyel etki alanı</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <Info className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-medium">Tahmin Detayları</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-600">Tahmin Zamanı:</div>
                  <div>{new Date(prediction.timestamp).toLocaleString()}</div>

                  <div className="text-gray-600">Geçerlilik Süresi:</div>
                  <div>{new Date(prediction.validUntil).toLocaleString()}</div>

                  <div className="text-gray-600">Veri Kaynağı:</div>
                  <div>{prediction.source}</div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={() => setActiveTab("alert-system")} className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  Uyarı Sistemini Yönet
                </Button>
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription className="text-xs">
                  Bu tahmin, HOMS (Hydrology Operational Multipurpose System) J04, J10 ve J15 bileşenleri kullanılarak
                  yapılmıştır. Tahminler, mevcut hava durumu verileri ve arazi özellikleri dikkate alınarak
                  hesaplanmaktadır. Gerçek durumlar farklılık gösterebilir. Her zaman resmi uyarıları takip edin.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>HOMS Bileşenleri ve Metodoloji</CardTitle>
              <CardDescription>Ani su baskını tahmininde kullanılan HOMS bileşenleri ve metodolojisi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Badge className="mr-2 bg-blue-600">J04</Badge>
                    Yağış-Akış Modeli
                  </h3>
                  <p className="text-sm mt-2">
                    HOMS J04 bileşeni, yağış verilerini kullanarak yüzey akışını hesaplar. Bu model, SCS Curve Number
                    yöntemini temel alır ve şu faktörleri dikkate alır:
                  </p>
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    <li>Yağış yoğunluğu ve süresi</li>
                    <li>Önceki yağışlar ve toprak nemi</li>
                    <li>Arazi örtüsü ve eğim</li>
                    <li>Geçirimsiz alan yüzdesi</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Badge className="mr-2 bg-blue-600">J10</Badge>
                    Taşkın Öteleme
                  </h3>
                  <p className="text-sm mt-2">
                    HOMS J10 bileşeni, hesaplanan yüzey akışının nehir ve dere yataklarında nasıl ilerleyeceğini ve
                    zaman içinde nasıl değişeceğini modellemek için kullanılır. Bu model, Muskingum yöntemini temel alır
                    ve şu faktörleri dikkate alır:
                  </p>
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    <li>Kanal uzunluğu ve eğimi</li>
                    <li>Kanal pürüzlülüğü (Manning katsayısı)</li>
                    <li>Kesit alanı</li>
                    <li>Başlangıç akışı ve yanal giriş</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-blue-800 flex items-center">
                    <Badge className="mr-2 bg-blue-600">J15</Badge>
                    Ani Taşkın Tahmin Sistemi
                  </h3>
                  <p className="text-sm mt-2">
                    HOMS J15 bileşeni, J04 ve J10 bileşenlerinden gelen verileri kullanarak ani su baskını riskini
                    değerlendirir ve uyarı üretir. Bu sistem şu faktörleri dikkate alır:
                  </p>
                  <ul className="list-disc pl-5 text-sm mt-2 space-y-1">
                    <li>Yağış eşik değerleri</li>
                    <li>Ani taşkın rehber değerleri (FFG)</li>
                    <li>Havza tepki süresi</li>
                    <li>Uyarı eşik değerleri</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Entegre Sistem Çalışma Prensibi</h3>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Hava durumu verilerinden yağış bilgileri çıkarılır</li>
                  <li>J04 bileşeni kullanılarak yüzey akışı hesaplanır</li>
                  <li>J10 bileşeni kullanılarak taşkın ötelemesi yapılır</li>
                  <li>J15 bileşeni kullanılarak risk seviyesi ve uyarı mesajı belirlenir</li>
                  <li>Sonuçlar, önceden tahmin süresi ve etkilenecek alan bilgisiyle birlikte sunulur</li>
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Bilgilendirme</AlertTitle>
                <AlertDescription className="text-sm">
                  HOMS (Hydrology Operational Multipurpose System), Dünya Meteoroloji Örgütü (WMO) tarafından
                  geliştirilen ve hidrolojik tahminler için kullanılan bir sistemdir. J04, J10 ve J15 bileşenleri, ani
                  su baskınları tahmini için özel olarak tasarlanmış modüllerdir.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert-system" className="mt-0">
          <AlertSystemManager
            location={{
              name: weatherData.location.name,
              latitude: location.latitude,
              longitude: location.longitude,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
