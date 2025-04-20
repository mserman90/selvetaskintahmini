"use client"

import { useEffect, useRef, useState } from "react"
import type { ChartData } from "@/lib/types"

// Chart.js'yi dinamik olarak import et
let Chart: any

export default function WeatherChart({ data, chartType }: { data: ChartData; chartType: string }) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)

  // İstemci tarafında olduğumuzu kontrol et
  useEffect(() => {
    setIsClient(true)

    // Chart.js'yi dinamik olarak import et
    const loadChart = async () => {
      const chartModule = await import("chart.js")
      Chart = chartModule.Chart
      Chart.register(...chartModule.registerables)
    }

    loadChart()
  }, [])

  // Chart.js grafiğini oluştur
  useEffect(() => {
    if (!isClient || !chartRef.current || !Chart) return

    // Destroy existing chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Create new chart
    chartInstance.current = new Chart(ctx, {
      type: chartType === "accprecip" || chartType === "precipitation" ? "bar" : "line",
      data: {
        labels: data.labels,
        datasets: data.datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: chartType === "accprecip" || chartType === "precipitation",
            title: {
              display: true,
              text:
                chartType === "accprecip" || chartType === "precipitation"
                  ? "Yağış (mm)"
                  : chartType === "2mtemp"
                    ? "Sıcaklık (°C)"
                    : "Değer",
            },
          },
          x: {
            title: {
              display: true,
              text: "Zaman",
            },
          },
        },
        plugins: {
          tooltip: {
            mode: "index",
            intersect: false,
          },
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text:
              chartType === "accprecip"
                ? "Birikimli Yağış Tahmini"
                : chartType === "2mtemp"
                  ? "2m Sıcaklık Tahmini"
                  : chartType === "winteroverview"
                    ? "Kış Genel Bakış"
                    : "Yağış Tahmini",
          },
        },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, chartType, isClient])

  if (!isClient) {
    return <div className="h-full w-full flex items-center justify-center">Grafik yükleniyor...</div>
  }

  return <canvas ref={chartRef} />
}
