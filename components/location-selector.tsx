"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Location } from "@/lib/types"

interface LocationSelectorProps {
  selectedLocation: Location
  onLocationChange: (location: Location) => void
}

// Türkiye'deki büyük şehirler
const locations: Location[] = [
  { name: "Ankara", lat: 39.956, lon: 32.894 },
  { name: "İstanbul", lat: 41.015, lon: 28.979 },
  { name: "İzmir", lat: 38.423, lon: 27.143 },
  { name: "Antalya", lat: 36.897, lon: 30.713 },
  { name: "Bursa", lat: 40.183, lon: 29.067 },
  { name: "Adana", lat: 37.0, lon: 35.321 },
  { name: "Konya", lat: 37.874, lon: 32.493 },
  { name: "Gaziantep", lat: 37.066, lon: 37.378 },
  { name: "Şanlıurfa", lat: 37.159, lon: 38.796 },
  { name: "Kayseri", lat: 38.732, lon: 35.487 },
  { name: "Samsun", lat: 41.292, lon: 36.331 },
  { name: "Trabzon", lat: 41.005, lon: 39.723 },
  { name: "Erzurum", lat: 39.904, lon: 41.268 },
  { name: "Diyarbakır", lat: 37.913, lon: 40.217 },
  { name: "Eskişehir", lat: 39.767, lon: 30.526 },
]

export default function LocationSelector({ selectedLocation, onLocationChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // İstemci tarafında olduğumuzu kontrol et
  useEffect(() => {
    setMounted(true)
  }, [])

  // Sunucu tarafında render edilirken içeriği gösterme
  if (!mounted) {
    return (
      <div className="flex flex-col space-y-4">
        <Button variant="outline" className="justify-between">
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-sky-600" />
            {selectedLocation.name}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-sky-600" />
              {selectedLocation.name}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[200px]">
          <Command>
            <CommandInput placeholder="Şehir ara..." />
            <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
            <CommandList>
              <CommandGroup heading="Şehirler">
                {locations.map((location) => (
                  <CommandItem
                    key={location.name}
                    value={location.name}
                    onSelect={() => {
                      onLocationChange(location)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedLocation.name === location.name ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Enlem:</span>
          <span className="font-medium">{selectedLocation.lat.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Boylam:</span>
          <span className="font-medium">{selectedLocation.lon.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}
