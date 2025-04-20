"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

// WeatherDashboard bileşenini dinamik olarak import et ve SSR'yi devre dışı bırak
const WeatherDashboard = dynamic(() => import("@/components/weather-dashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
    </div>
  ),
})

export default function WeatherDashboardWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      }
    >
      <WeatherDashboard />
    </Suspense>
  )
}
