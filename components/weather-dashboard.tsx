"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import WeatherChart from "@/components/weather-chart"
import LocationSelector from "@/components/location-selector"
import { fetchWeatherData } from "@/lib/weather-api"
import type { ChartData, WeatherData, Location } from "@/lib/types"
import { Loader2 } from "lucide-react"

// Harita bileşenini dinamik olarak import et ve SSR'yi devre dışı bırak
const WeatherMap = dynamic(() => import("@/components/weather-map"), { ssr: false })

export default function WeatherDashboard() {
  const [loading, setLoading] = useState(true)
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    lat: 39.956,
    lon: 32.894,
    name: "Ankara",
  })
  const [selectedModel, setSelectedModel] = useState("gfs")
  const [selectedChart, setSelectedChart] = useState("accprecip")
  const [forecastStep, setForecastStep] = useState(24) // Hours ahead
  const [chartData, setChartData] = useState<ChartData | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await fetchWeatherData(
          selectedModel,
          selectedChart,
          selectedLocation.lat,
          selectedLocation.lon,
          forecastStep,
        )
        setWeatherData(data)

        // Create chart data based on the response
        if (data) {
          const chartData: ChartData = {
            labels: data.timePoints.map((tp) =>
              new Date(tp).toLocaleTimeString([], {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
              }),
            ),
            datasets: [
              {
                label:
                  selectedChart === "accprecip" ? "Yağış (mm)" : selectedChart === "2mtemp" ? "Sıcaklık (°C)" : "Değer",
                data: data.values,
                borderColor:
                  selectedChart === "accprecip" ? "#3b82f6" : selectedChart === "2mtemp" ? "#ef4444" : "#10b981",
                backgroundColor:
                  selectedChart === "accprecip"
                    ? "rgba(59, 130, 246, 0.2)"
                    : selectedChart === "2mtemp"
                      ? "rgba(239, 68, 68, 0.2)"
                      : "rgba(16, 185, 129, 0.2)",
              },
            ],
          }
          setChartData(chartData)
        }
      } catch (error) {
        console.error("Error fetching weather data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedModel, selectedChart, selectedLocation, forecastStep])

  const handleLocationChange = (location: Location) => {
    setSelectedLocation(location)
  }

  const handleModelChange = (value: string) => {
    setSelectedModel(value)
  }

  const handleChartTypeChange = (value: string) => {
    setSelectedChart(value)
  }

  const handleForecastStepChange = (value: number[]) => {
    setForecastStep(value[0])
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Konum</CardTitle>
            <CardDescription>Tahmin yapılacak konumu seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <LocationSelector selectedLocation={selectedLocation} onLocationChange={handleLocationChange} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Model ve Grafik</CardTitle>
            <CardDescription>Tahmin modeli ve grafik türünü seçin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">Tahmin Modeli</label>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Model seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openweathermap">OpenWeatherMap</SelectItem>
                  <SelectItem value="open-meteo">Open-Meteo</SelectItem>
                  <SelectItem value="gfs">GFS (Mock)</SelectItem>
                  <SelectItem value="ecmwf">ECMWF (Mock)</SelectItem>
                  <SelectItem value="icon">ICON (Mock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Grafik Türü</label>
              <Select value={selectedChart} onValueChange={handleChartTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Grafik türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accprecip">Birikimli Yağış</SelectItem>
                  <SelectItem value="2mtemp">2m Sıcaklık</SelectItem>
                  <SelectItem value="winteroverview">Kış Genel Bakış</SelectItem>
                  <SelectItem value="precipitation">Yağış</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tahmin Süresi</CardTitle>
            <CardDescription>Kaç saat ilerisini tahmin etmek istiyorsunuz?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider value={[forecastStep]} min={6} max={240} step={6} onValueChange={handleForecastStepChange} />
              <div className="text-center font-medium">
                {forecastStep} saat ({Math.floor(forecastStep / 24)} gün {forecastStep % 24} saat)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chart">Grafik</TabsTrigger>
          <TabsTrigger value="map">Harita</TabsTrigger>
        </TabsList>

        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedChart === "accprecip"
                  ? "Birikimli Yağış Tahmini"
                  : selectedChart === "2mtemp"
                    ? "2m Sıcaklık Tahmini"
                    : selectedChart === "winteroverview"
                      ? "Kış Genel Bakış"
                      : "Yağış Tahmini"}
              </CardTitle>
              <CardDescription>
                {selectedLocation.name} için {forecastStep} saatlik tahmin
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                </div>
              ) : chartData ? (
                <WeatherChart data={chartData} chartType={selectedChart} />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">Veri bulunamadı</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Türkiye Hava Durumu Haritası</CardTitle>
              <CardDescription>
                {selectedChart === "accprecip"
                  ? "Birikimli Yağış"
                  : selectedChart === "2mtemp"
                    ? "2m Sıcaklık"
                    : selectedChart === "winteroverview"
                      ? "Kış Genel Bakış"
                      : "Yağış"}{" "}
                haritası
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                </div>
              ) : (
                <WeatherMap
                  chartType={selectedChart}
                  model={selectedModel}
                  forecastStep={forecastStep}
                  selectedLocation={selectedLocation}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {weatherData && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Tahmin Özeti</CardTitle>
            <CardDescription>
              {selectedLocation.name} için {new Date().toLocaleDateString("tr-TR")} tarihli tahmin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-sky-50 p-4 rounded-lg">
                <h3 className="font-medium text-sky-900">Yağış Durumu</h3>
                <p className="mt-2">{weatherData.summary?.precipitation || "Veri yükleniyor..."}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900">Sıcaklık</h3>
                <p className="mt-2">{weatherData.summary?.temperature || "Veri yükleniyor..."}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-lg">
                <h3 className="font-medium text-emerald-900">Genel Durum</h3>
                <p className="mt-2">{weatherData.summary?.overview || "Veri yükleniyor..."}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
