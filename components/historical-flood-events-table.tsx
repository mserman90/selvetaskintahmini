"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  Download,
  Filter,
  Info,
  MapPin,
  RefreshCw,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react"
import {
  getHistoricalFloodEvents,
  type HistoricalFloodEvent,
  ImpactLevel,
  getImpactLevelColor,
} from "@/lib/historical-flood-events"

interface HistoricalFloodEventsTableProps {
  location: {
    latitude: number
    longitude: number
  }
  locationName: string
}

export default function HistoricalFloodEventsTable({ location, locationName }: HistoricalFloodEventsTableProps) {
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<(HistoricalFloodEvent & { distance?: number })[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("table")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof HistoricalFloodEvent>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterImpactLevel, setFilterImpactLevel] = useState<ImpactLevel | "ALL">("ALL")
  const [radius, setRadius] = useState(50)
  const [refreshing, setRefreshing] = useState(false)

  // Verileri yükle
  useEffect(() => {
    loadData()
  }, [location, radius])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    setRefreshing(true)

    try {
      const data = await getHistoricalFloodEvents(location.latitude, location.longitude, radius)
      setEvents(data)
    } catch (error) {
      console.error("Geçmiş ani su baskını olayları yüklenirken hata:", error)
      setError("Geçmiş ani su baskını olayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Verileri yenile
  const handleRefresh = () => {
    loadData()
  }

  // Arama, sıralama ve filtreleme işlemleri
  const filteredEvents = events
    .filter((event) => {
      // Arama terimini uygula
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          event.location.name.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.source.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter((event) => {
      // Etki seviyesi filtresini uygula
      if (filterImpactLevel !== "ALL") {
        return event.impactLevel === filterImpactLevel
      }
      return true
    })
    .sort((a, b) => {
      // Sıralama uygula
      if (sortField === "date") {
        return sortDirection === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      }

      if (sortField === "impactLevel") {
        const impactOrder = {
          [ImpactLevel.LOW]: 1,
          [ImpactLevel.MODERATE]: 2,
          [ImpactLevel.HIGH]: 3,
          [ImpactLevel.EXTREME]: 4,
        }
        return sortDirection === "asc"
          ? impactOrder[a.impactLevel] - impactOrder[b.impactLevel]
          : impactOrder[b.impactLevel] - impactOrder[a.impactLevel]
      }

      if (
        sortField === "maxWaterLevel" ||
        sortField === "affectedArea" ||
        sortField === "affectedPeople" ||
        sortField === "economicLoss"
      ) {
        return sortDirection === "asc"
          ? (a[sortField] as number) - (b[sortField] as number)
          : (b[sortField] as number) - (a[sortField] as number)
      }

      if (sortField === "distance" && a.distance !== undefined && b.distance !== undefined) {
        return sortDirection === "asc" ? a.distance - b.distance : b.distance - a.distance
      }

      return 0
    })

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Para birimi formatla
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Sıralama değiştir
  const toggleSort = (field: keyof HistoricalFloodEvent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Yeni bir alan seçildiğinde varsayılan olarak azalan sıralama
    }
  }

  // CSV olarak dışa aktar
  const exportToCSV = () => {
    const headers = [
      "Tarih",
      "Konum",
      "Etki Seviyesi",
      "Maks. Su Seviyesi (cm)",
      "Etkilenen Alan (km²)",
      "Etkilenen Kişi",
      "Ekonomik Kayıp (TL)",
      "Açıklama",
      "Kaynak",
      "Mesafe (km)",
    ]

    const csvData = filteredEvents.map((event) => [
      formatDate(event.date),
      event.location.name,
      event.impactLevel,
      event.maxWaterLevel,
      event.affectedArea,
      event.affectedPeople,
      event.economicLoss,
      event.description,
      event.source,
      event.distance,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `ani-su-baskini-olaylari-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading && events.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Hata</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Geçmiş Ani Su Baskını Olayları</CardTitle>
            <CardDescription>
              <div className="flex items-center mt-1">
                <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                {locationName} çevresindeki {radius} km yarıçap içindeki geçmiş olaylar
              </div>
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Yenile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <TabsList className="mb-2 sm:mb-0">
              <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
              <TabsTrigger value="stats">İstatistikler</TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>

              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrele
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Etki Seviyesi</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setFilterImpactLevel("ALL")}>
                      Tümü {filterImpactLevel === "ALL" && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterImpactLevel(ImpactLevel.LOW)}>
                      Düşük {filterImpactLevel === ImpactLevel.LOW && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterImpactLevel(ImpactLevel.MODERATE)}>
                      Orta {filterImpactLevel === ImpactLevel.MODERATE && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterImpactLevel(ImpactLevel.HIGH)}>
                      Yüksek {filterImpactLevel === ImpactLevel.HIGH && "✓"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterImpactLevel(ImpactLevel.EXTREME)}>
                      Çok Yüksek {filterImpactLevel === ImpactLevel.EXTREME && "✓"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4" />
                      {radius} km
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Yarıçap</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRadius(10)}>10 km {radius === 10 && "✓"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRadius(25)}>25 km {radius === 25 && "✓"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRadius(50)}>50 km {radius === 50 && "✓"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRadius(100)}>100 km {radius === 100 && "✓"}</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRadius(200)}>200 km {radius === 200 && "✓"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={exportToCSV} className="flex items-center">
                  <Download className="mr-2 h-4 w-4" />
                  Dışa Aktar
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="table" className="mt-0">
            {filteredEvents.length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Sonuç Bulunamadı</AlertTitle>
                <AlertDescription>
                  Belirtilen kriterlere uygun geçmiş ani su baskını olayı bulunamadı. Lütfen arama kriterlerinizi
                  değiştirin veya yarıçapı genişletin.
                </AlertDescription>
              </Alert>
            ) : (
              <Table>
                <TableCaption>
                  Toplam {filteredEvents.length} olay bulundu | Son güncelleme: {new Date().toLocaleString("tr-TR")}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Tarih
                        {sortField === "date" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Konum</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("impactLevel")}>
                      <div className="flex items-center">
                        Etki Seviyesi
                        {sortField === "impactLevel" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("maxWaterLevel")}>
                      <div className="flex items-center">
                        Maks. Su Seviyesi
                        {sortField === "maxWaterLevel" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("affectedPeople")}>
                      <div className="flex items-center">
                        Etkilenen Kişi
                        {sortField === "affectedPeople" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("economicLoss")}>
                      <div className="flex items-center">
                        Ekonomik Kayıp
                        {sortField === "economicLoss" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort("distance")}>
                      <div className="flex items-center">
                        Mesafe
                        {sortField === "distance" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? (
                              <SortAsc className="h-4 w-4" />
                            ) : (
                              <SortDesc className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((event) => (
                    <TableRow key={event.id} className="cursor-pointer hover:bg-gray-50" onClick={() => {}}>
                      <TableCell className="font-medium">{formatDate(event.date)}</TableCell>
                      <TableCell>{event.location.name}</TableCell>
                      <TableCell>
                        <Badge className={getImpactLevelColor(event.impactLevel)}>{event.impactLevel}</Badge>
                      </TableCell>
                      <TableCell>{event.maxWaterLevel} cm</TableCell>
                      <TableCell>{event.affectedPeople.toLocaleString("tr-TR")}</TableCell>
                      <TableCell>{formatCurrency(event.economicLoss)}</TableCell>
                      <TableCell>{event.distance?.toFixed(1)} km</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Etki Seviyesine Göre Dağılım</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.values(ImpactLevel).map((level) => {
                      const count = events.filter((e) => e.impactLevel === level).length
                      const percentage = events.length > 0 ? Math.round((count / events.length) * 100) : 0
                      return (
                        <div key={level} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Badge className={getImpactLevelColor(level)}>{level}</Badge>
                            <span className="text-sm font-medium">
                              {count} olay ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
                                level === ImpactLevel.LOW
                                  ? "bg-green-500"
                                  : level === ImpactLevel.MODERATE
                                    ? "bg-yellow-500"
                                    : level === ImpactLevel.HIGH
                                      ? "bg-orange-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Yıllara Göre Dağılım</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Array.from(new Set(events.map((e) => new Date(e.date).getFullYear())).values())
                      .sort((a, b) => b - a)
                      .map((year) => {
                        const yearEvents = events.filter((e) => new Date(e.date).getFullYear() === year)
                        const count = yearEvents.length
                        const percentage = events.length > 0 ? Math.round((count / events.length) * 100) : 0
                        return (
                          <div key={year} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{year}</span>
                              <span className="text-sm font-medium">
                                {count} olay ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Özet İstatistikler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm text-blue-700">Toplam Olay</div>
                      <div className="text-2xl font-bold text-blue-900">{events.length}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="text-sm text-red-700">Toplam Can Kaybı</div>
                      <div className="text-2xl font-bold text-red-900">
                        {events.reduce((sum, event) => sum + (event.casualties || 0), 0)}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <div className="text-sm text-yellow-700">Etkilenen Kişi</div>
                      <div className="text-2xl font-bold text-yellow-900">
                        {events.reduce((sum, event) => sum + event.affectedPeople, 0).toLocaleString("tr-TR")}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-green-700">Toplam Ekonomik Kayıp</div>
                      <div className="text-2xl font-bold text-green-900">
                        {formatCurrency(events.reduce((sum, event) => sum + event.economicLoss, 0))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ortalama Değerler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Su Seviyesi:</span>
                      <span className="font-medium">
                        {(
                          events.reduce((sum, event) => sum + event.maxWaterLevel, 0) / Math.max(1, events.length)
                        ).toFixed(1)}{" "}
                        cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Etkilenen Alan:</span>
                      <span className="font-medium">
                        {(
                          events.reduce((sum, event) => sum + event.affectedArea, 0) / Math.max(1, events.length)
                        ).toFixed(1)}{" "}
                        km²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Yağış Miktarı:</span>
                      <span className="font-medium">
                        {(events.reduce((sum, event) => sum + event.rainfall, 0) / Math.max(1, events.length)).toFixed(
                          1,
                        )}{" "}
                        mm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Olay Süresi:</span>
                      <span className="font-medium">
                        {(events.reduce((sum, event) => sum + event.duration, 0) / Math.max(1, events.length)).toFixed(
                          1,
                        )}{" "}
                        saat
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Müdahale Süresi:</span>
                      <span className="font-medium">
                        {(
                          events.reduce((sum, event) => sum + event.responseTime, 0) / Math.max(1, events.length)
                        ).toFixed(0)}{" "}
                        dakika
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Bilgilendirme</AlertTitle>
          <AlertDescription className="text-xs">
            Bu veriler, geçmiş ani su baskını olaylarını göstermektedir. Veriler, AFAD, Meteoroloji Genel Müdürlüğü, DSİ
            ve yerel yönetimlerden derlenmiştir. Geçmiş olaylar, gelecekteki riskleri değerlendirmek için önemli bir
            gösterge olabilir, ancak her bölgenin kendine özgü koşulları olduğunu unutmayın.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
