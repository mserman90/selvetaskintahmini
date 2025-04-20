"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Cloud, Droplets, Thermometer, Wind, AlertTriangle, Sun, CloudRain, Snowflake } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WeatherDisplayProps {
  location: {
    latitude: number
    longitude: number
  }
}

interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  description: string
  icon: string
  main: string
  cityName: string
}

export default function WeatherDisplay({ location }: WeatherDisplayProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [usingCached, setUsingCached] = useState<boolean>(false)

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true)
      setError(null)
      setUsingCached(false)

      try {
        // Hava durumu verilerini almak için sunucu API rotamızı kullan
        const response = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`)

        if (!response.ok) {
          throw new Error(`Hava durumu verileri alınamadı: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        const newWeatherData = {
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          main: data.weather[0].main,
          cityName: data.name,
        }

        setWeatherData(newWeatherData)

        // Hava durumu verilerini önbelleğe al
        try {
          localStorage.setItem("lastWeatherData", JSON.stringify(newWeatherData))
          localStorage.setItem("weatherDataTimestamp", Date.now().toString())
        } catch (e) {
          console.error("localStorage'a kaydetme hatası:", e)
        }
      } catch (err) {
        console.error("Hava durumu verileri alınırken hata:", err)

        // Mevcut ise önbelleğe alınmış hava durumu verilerini kullanmayı dene
        try {
          const cachedWeather = localStorage.getItem("lastWeatherData")
          const cachedTimestamp = localStorage.getItem("weatherDataTimestamp")

          if (cachedWeather) {
            setWeatherData(JSON.parse(cachedWeather))
            setUsingCached(true)

            // Önbelleğe alınmış verimiz varsa farklı bir hata mesajı göster
            if (cachedTimestamp) {
              const timestamp = new Date(Number.parseInt(cachedTimestamp))
              setError(
                `${timestamp.toLocaleString()} tarihli önbelleğe alınmış veriler kullanılıyor. Yeni veriler alınamadı.`,
              )
            } else {
              setError("Önbelleğe alınmış veriler kullanılıyor. Yeni veriler alınamadı.")
            }
          } else {
            setError("Hava durumu verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.")
          }
        } catch (e) {
          console.error("localStorage erişim hatası:", e)
          setError("Hava durumu verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.")
        }
      } finally {
        setLoading(false)
      }
    }

    if (location) {
      fetchWeatherData()
    }
  }, [location])

  // Verileri yeniden alma fonksiyonu
  const handleRetry = () => {
    if (location) {
      setLoading(true)
      setError(null)

      // Görsel geri bildirim vermek için kısa bir gecikme sonrasında al
      setTimeout(() => {
        const fetchWeatherData = async () => {
          try {
            const response = await fetch(`/api/weather?lat=${location.latitude}&lon=${location.longitude}`)

            if (!response.ok) {
              throw new Error(`Hava durumu verileri alınamadı: ${response.status}`)
            }

            const data = await response.json()

            if (data.error) {
              throw new Error(data.error)
            }

            const newWeatherData = {
              temperature: data.main.temp,
              feelsLike: data.main.feels_like,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
              description: data.weather[0].description,
              icon: data.weather[0].icon,
              main: data.weather[0].main,
              cityName: data.name,
            }

            setWeatherData(newWeatherData)
            setUsingCached(false)
            setError(null)

            // Hava durumu verilerini önbelleğe al
            try {
              localStorage.setItem("lastWeatherData", JSON.stringify(newWeatherData))
              localStorage.setItem("weatherDataTimestamp", Date.now().toString())
            } catch (e) {
              console.error("localStorage'a kaydetme hatası:", e)
            }
          } catch (err) {
            console.error("Hava durumu verileri yeniden alınırken hata:", err)
            setError("Hava durumu verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.")
          } finally {
            setLoading(false)
          }
        }

        fetchWeatherData()
      }, 500)
    }
  }

  // Hava durumu ikonu alma fonksiyonu
  const getWeatherIcon = (main: string) => {
    switch (main.toLowerCase()) {
      case "clear":
        return <Sun className="h-12 w-12 text-yellow-500" />
      case "clouds":
        return <Cloud className="h-12 w-12 text-gray-500" />
      case "rain":
      case "drizzle":
        return <CloudRain className="h-12 w-12 text-blue-500" />
      case "snow":
        return <Snowflake className="h-12 w-12 text-blue-300" />
      default:
        return <Cloud className="h-12 w-12 text-gray-500" />
    }
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

  if (error && !weatherData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <span>{error}</span>
          <Button size="sm" onClick={handleRetry} className="self-start mt-2">
            Tekrar Dene
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!weatherData) {
    return <div className="text-center py-8 text-gray-500">Hava durumu verisi mevcut değil</div>
  }

  return (
    <div className="space-y-4">
      {error && usingCached && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={handleRetry}>
              Tekrar Dene
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h3 className="text-xl font-semibold">{weatherData.cityName}</h3>
        <p className="text-gray-500 capitalize">{weatherData.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center mb-4 sm:mb-0">
          {getWeatherIcon(weatherData.main)}
          <div className="ml-4">
            <div className="text-3xl font-bold">{Math.round(weatherData.temperature)}°C</div>
            <div className="text-sm text-gray-500">Hissedilen {Math.round(weatherData.feelsLike)}°C</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Droplets className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-medium">Nem</div>
              <div>{weatherData.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center">
            <Wind className="h-5 w-5 text-blue-500 mr-2" />
            <div>
              <div className="text-sm font-medium">Rüzgar</div>
              <div>{weatherData.windSpeed} m/s</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Thermometer className="h-5 w-5 text-red-500 mr-2" />
              <div>
                <div className="text-sm font-medium">Sıcaklık</div>
                <div className="text-lg">{Math.round(weatherData.temperature)}°C</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Droplets className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <div className="text-sm font-medium">Nem</div>
                <div className="text-lg">{weatherData.humidity}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Wind className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <div className="text-sm font-medium">Rüzgar Hızı</div>
                <div className="text-lg">{weatherData.windSpeed} m/s</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
