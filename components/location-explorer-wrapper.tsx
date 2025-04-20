"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// SSR devre dışı bırakılmış bileşeni içe aktar
const LocationBasedDataExplorer = dynamic(() => import("@/components/location-based-data-explorer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
})

export default function LocationExplorerWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[600px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LocationBasedDataExplorer />
    </Suspense>
  )
}
