import type { WeatherData } from "./types"
import { fetchOpenWeatherMapForecast, fetchOpenMeteoForecast } from "./api-services"

// Gerçek API'lerden hava durumu verisi çekme
export async function fetchWeatherData(
  model: string,
  chartType: string,
  lat: number,
  lon: number,
  forecastStep: number,
): Promise<WeatherData> {
  try {
    // API seçimi (model parametresine göre)
    if (model === "gfs" || model === "openweathermap") {
      return await fetchOpenWeatherMapData(chartType, lat, lon, forecastStep)
    } else if (model === "ecmwf" || model === "open-meteo") {
      return await fetchOpenMeteoData(chartType, lat, lon, forecastStep)
    } else {
      // Desteklenmeyen model için mock veri döndür
      return generateMockData(model, chartType, lat, lon, forecastStep)
    }
  } catch (error) {
    console.error("Hava durumu verisi çekme hatası:", error)
    // Hata durumunda mock veri döndür
    return generateMockData(model, chartType, lat, lon, forecastStep)
  }
}

// OpenWeatherMap API'den veri çekme ve dönüştürme
async function fetchOpenWeatherMapData(
  chartType: string,
  lat: number,
  lon: number,
  forecastStep: number,
): Promise<WeatherData> {
  try {
    const data = await fetchOpenWeatherMapForecast(lat, lon)

    // Maksimum tahmin adımını kontrol et (OpenWeatherMap 5 günlük tahmin sunar = 40 adım)
    const maxStep = Math.min(forecastStep / 3, 39) // 3 saatlik adımlar

    // Zaman noktaları ve değerleri hazırla
    const timePoints: string[] = []
    const values: number[] = []

    // Seçilen grafik türüne göre veri hazırla
    for (let i = 0; i <= maxStep; i++) {
      if (i < data.list.length) {
        const item = data.list[i]
        timePoints.push(item.dt_txt)

        if (chartType === "accprecip" || chartType === "precipitation") {
          // Yağış verisi (mm)
          const precipitation = (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0)

          if (chartType === "accprecip") {
            // Birikimli yağış için önceki değerleri topla
            const prevValue = i > 0 ? values[i - 1] : 0
            values.push(prevValue + precipitation)
          } else {
            values.push(precipitation)
          }
        } else if (chartType === "2mtemp") {
          // 2m sıcaklık (°C)
          values.push(item.main.temp)
        } else if (chartType === "winteroverview") {
          // Kış genel bakış için kar yağışı (varsa)
          values.push(item.snow?.["3h"] || 0)
        } else {
          // Varsayılan olarak sıcaklık
          values.push(item.main.temp)
        }
      }
    }

    // Özet bilgileri hazırla
    let precipSummary = "Yağış beklenmiyor."
    let tempSummary = "Sıcaklıklar mevsim normallerinde seyredecek."
    let overviewSummary = "Genel olarak açık ve güneşli hava bekleniyor."

    // Toplam yağış ve ortalama sıcaklık hesapla
    const totalPrecip = data.list
      .slice(0, 8)
      .reduce((sum, item) => sum + (item.rain?.["3h"] || 0) + (item.snow?.["3h"] || 0), 0)
    const avgTemp = data.list.slice(0, 8).reduce((sum, item) => sum + item.main.temp, 0) / 8

    // Yağış özeti
    if (totalPrecip > 10) {
      precipSummary = `Toplam ${totalPrecip.toFixed(1)} mm yağış bekleniyor. Şemsiyenizi almayı unutmayın!`
      overviewSummary = "Yağışlı ve bulutlu bir hava bekleniyor."
    } else if (totalPrecip > 0) {
      precipSummary = `Toplam ${totalPrecip.toFixed(1)} mm hafif yağış bekleniyor.`
      overviewSummary = "Parçalı bulutlu ve ara ara yağışlı bir hava bekleniyor."
    }

    // Sıcaklık özeti
    if (avgTemp > 25) {
      tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin üzerinde seyredecek.`
      overviewSummary = "Sıcak ve bunaltıcı bir hava bekleniyor."
    } else if (avgTemp < 10) {
      tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin altında seyredecek.`
      overviewSummary = "Soğuk ve serin bir hava bekleniyor."
    }

    return {
      location: { name: data.city.name, lat, lon },
      model: "openweathermap",
      chartType,
      forecastStep,
      timePoints,
      values,
      summary: {
        precipitation: precipSummary,
        temperature: tempSummary,
        overview: overviewSummary,
      },
    }
  } catch (error) {
    console.error("OpenWeatherMap veri dönüştürme hatası:", error)
    throw error
  }
}

// Open-Meteo API'den veri çekme ve dönüştürme
async function fetchOpenMeteoData(
  chartType: string,
  lat: number,
  lon: number,
  forecastStep: number,
): Promise<WeatherData> {
  try {
    const data = await fetchOpenMeteoForecast(lat, lon)

    // Maksimum tahmin adımını kontrol et
    const maxStep = Math.min(forecastStep, data.hourly.time.length - 1)

    // Zaman noktaları ve değerleri hazırla
    const timePoints = data.hourly.time.slice(0, maxStep + 1)
    const values: number[] = []

    // Seçilen grafik türüne göre veri hazırla
    for (let i = 0; i <= maxStep; i++) {
      if (chartType === "accprecip") {
        // Birikimli yağış
        let accPrecip = 0
        for (let j = 0; j <= i; j++) {
          accPrecip += data.hourly.precipitation[j]
        }
        values.push(accPrecip)
      } else if (chartType === "precipitation") {
        // Saatlik yağış
        values.push(data.hourly.precipitation[i])
      } else if (chartType === "2mtemp") {
        // 2m sıcaklık
        values.push(data.hourly.temperature_2m[i])
      } else if (chartType === "winteroverview") {
        // Kar yağışı
        values.push(data.hourly.snowfall[i])
      } else {
        // Varsayılan olarak sıcaklık
        values.push(data.hourly.temperature_2m[i])
      }
    }

    // Özet bilgileri hazırla
    const next24hPrecip = data.hourly.precipitation.slice(0, 24).reduce((sum, val) => sum + val, 0)
    const avgTemp = data.hourly.temperature_2m.slice(0, 24).reduce((sum, val) => sum + val, 0) / 24

    let precipSummary = "Yağış beklenmiyor."
    let tempSummary = "Sıcaklıklar mevsim normallerinde seyredecek."
    let overviewSummary = "Genel olarak açık ve güneşli hava bekleniyor."

    // Yağış özeti
    if (next24hPrecip > 10) {
      precipSummary = `Toplam ${next24hPrecip.toFixed(1)} mm yağış bekleniyor. Şemsiyenizi almayı unutmayın!`
      overviewSummary = "Yağışlı ve bulutlu bir hava bekleniyor."
    } else if (next24hPrecip > 0) {
      precipSummary = `Toplam ${next24hPrecip.toFixed(1)} mm hafif yağış bekleniyor.`
      overviewSummary = "Parçalı bulutlu ve ara ara yağışlı bir hava bekleniyor."
    }

    // Sıcaklık özeti
    if (avgTemp > 25) {
      tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin üzerinde seyredecek.`
      overviewSummary = "Sıcak ve bunaltıcı bir hava bekleniyor."
    } else if (avgTemp < 10) {
      tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin altında seyredecek.`
      overviewSummary = "Soğuk ve serin bir hava bekleniyor."
    }

    return {
      location: { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon },
      model: "open-meteo",
      chartType,
      forecastStep,
      timePoints,
      values,
      summary: {
        precipitation: precipSummary,
        temperature: tempSummary,
        overview: overviewSummary,
      },
    }
  } catch (error) {
    console.error("Open-Meteo veri dönüştürme hatası:", error)
    throw error
  }
}

// Mock veri oluşturma (API hatası durumunda yedek olarak kullanılır)
function generateMockData(
  model: string,
  chartType: string,
  lat: number,
  lon: number,
  forecastStep: number,
): Promise<WeatherData> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate mock time points (every 3 hours for the forecast period)
      const timePoints: string[] = []
      const values: number[] = []
      const now = new Date()

      for (let i = 0; i <= forecastStep; i += 3) {
        const timePoint = new Date(now.getTime() + i * 60 * 60 * 1000)
        timePoints.push(timePoint.toISOString())

        // Generate mock values based on chart type
        if (chartType === "accprecip") {
          // Accumulated precipitation increases over time
          values.push(Math.round((i / 3) * Math.random() * 10) / 10)
        } else if (chartType === "2mtemp") {
          // Temperature fluctuates
          const baseTemp = 15 // Base temperature
          const hourOfDay = timePoint.getHours()
          const dailyVariation = hourOfDay >= 6 && hourOfDay <= 18 ? 5 : -2 // Warmer during day
          values.push(baseTemp + dailyVariation + (Math.random() * 4 - 2))
        } else if (chartType === "precipitation") {
          // Precipitation is sporadic
          values.push(Math.random() > 0.7 ? Math.random() * 5 : 0)
        } else {
          // Default random values
          values.push(Math.random() * 10)
        }
      }

      // Generate mock summary based on the data
      let precipSummary = "Yağış beklenmiyor."
      let tempSummary = "Sıcaklıklar mevsim normallerinde seyredecek."
      let overviewSummary = "Genel olarak açık ve güneşli hava bekleniyor."

      const totalPrecip = values.reduce((sum, val) => sum + val, 0)
      const avgTemp = values.reduce((sum, val) => sum + val, 0) / values.length

      if (chartType === "accprecip" && totalPrecip > 10) {
        precipSummary = `Toplam ${totalPrecip.toFixed(1)} mm yağış bekleniyor. Şemsiyenizi almayı unutmayın!`
        overviewSummary = "Yağışlı ve bulutlu bir hava bekleniyor."
      } else if (chartType === "accprecip" && totalPrecip > 5) {
        precipSummary = `Toplam ${totalPrecip.toFixed(1)} mm hafif yağış bekleniyor.`
        overviewSummary = "Parçalı bulutlu ve ara ara yağışlı bir hava bekleniyor."
      }

      if (chartType === "2mtemp" && avgTemp > 25) {
        tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin üzerinde seyredecek.`
        overviewSummary = "Sıcak ve bunaltıcı bir hava bekleniyor."
      } else if (chartType === "2mtemp" && avgTemp < 10) {
        tempSummary = `Ortalama sıcaklık ${avgTemp.toFixed(1)}°C ile mevsim normallerinin altında seyredecek.`
        overviewSummary = "Soğuk ve serin bir hava bekleniyor."
      }

      resolve({
        location: { name: "Ankara", lat, lon },
        model,
        chartType,
        forecastStep,
        timePoints,
        values,
        summary: {
          precipitation: precipSummary,
          temperature: tempSummary,
          overview: overviewSummary,
        },
      })
    }, 1000) // Simulate network delay
  })
}
