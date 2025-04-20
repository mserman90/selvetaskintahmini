export interface Location {
  name: string
  lat: number
  lon: number
}

export interface WeatherData {
  location: Location
  model: string
  chartType: string
  forecastStep: number
  timePoints: string[]
  values: number[]
  summary?: {
    precipitation: string
    temperature: string
    overview: string
  }
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    borderColor: string
    backgroundColor: string
  }[]
}
