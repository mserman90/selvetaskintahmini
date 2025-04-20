// OpenWeatherMap ve Open-Meteo API'leri için servis fonksiyonları

// OpenWeatherMap API için tip tanımlamaları
export interface OpenWeatherMapResponse {
  list: {
    dt: number
    main: {
      temp: number
      feels_like: number
      temp_min: number
      temp_max: number
      pressure: number
      humidity: number
    }
    weather: {
      id: number
      main: string
      description: string
      icon: string
    }[]
    clouds: {
      all: number
    }
    wind: {
      speed: number
      deg: number
    }
    rain?: {
      "3h"?: number
    }
    snow?: {
      "3h"?: number
    }
    dt_txt: string
  }[]
  city: {
    name: string
    coord: {
      lat: number
      lon: number
    }
    country: string
  }
}

// Open-Meteo API için tip tanımlamaları
export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  hourly_units: {
    time: string
    temperature_2m: string
    precipitation: string
    rain: string
    snowfall: string
    cloud_cover: string
    wind_speed_10m: string
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation: number[]
    rain: number[]
    snowfall: number[]
    cloud_cover: number[]
    wind_speed_10m: number[]
  }
}

// OpenWeatherMap API'den 5 günlük tahmin verisi çekme (sunucu taraflı API üzerinden)
export async function fetchOpenWeatherMapForecast(lat: number, lon: number): Promise<OpenWeatherMapResponse> {
  try {
    // Kendi sunucu taraflı API endpoint'imizi kullan
    const response = await fetch(`/api/weather/openweathermap?lat=${lat}&lon=${lon}&endpoint=forecast`)

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("OpenWeatherMap veri çekme hatası:", error)
    throw error
  }
}

// OpenWeatherMap API'den mevcut hava durumu verisi çekme (sunucu taraflı API üzerinden)
export async function fetchOpenWeatherMapCurrent(lat: number, lon: number) {
  try {
    // Kendi sunucu taraflı API endpoint'imizi kullan
    const response = await fetch(`/api/weather/openweathermap?lat=${lat}&lon=${lon}&endpoint=weather`)

    if (!response.ok) {
      throw new Error(`API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("OpenWeatherMap mevcut hava durumu çekme hatası:", error)
    throw error
  }
}

// Open-Meteo API'den tahmin verisi çekme (API anahtarı gerektirmez)
export async function fetchOpenMeteoForecast(lat: number, lon: number): Promise<OpenMeteoResponse> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&timezone=auto`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Open-Meteo API hatası: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Open-Meteo veri çekme hatası:", error)
    throw error
  }
}

// OpenWeatherMap harita karolu URL'i oluşturma (sunucu taraflı API üzerinden)
export function getWeatherMapTileUrl(layer: string, z: number, x: number, y: number): string {
  return `/api/weather/map-tile?layer=${layer}&z=${z}&x=${x}&y=${y}`
}
