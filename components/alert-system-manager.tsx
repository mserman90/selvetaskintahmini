"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bell,
  BellOff,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  Send,
  History,
  Settings,
  MapPin,
  AlertCircle,
  PhoneCall,
  Siren,
} from "lucide-react"
import {
  type AlertSettings,
  type AlertRecord,
  type AlertChannel,
  type FlashFloodRiskLevel,
  defaultAlertSettings,
  getAlertSettings,
  saveAlertSettings,
  getAlertHistory,
  sendTestAlert,
  browserSupportsNotifications,
  requestNotificationPermission,
} from "@/lib/alert-system"

interface AlertSystemManagerProps {
  location?: {
    name: string
    latitude: number
    longitude: number
  }
}

export default function AlertSystemManager({ location }: AlertSystemManagerProps) {
  const [settings, setSettings] = useState<AlertSettings>(defaultAlertSettings)
  const [alertHistory, setAlertHistory] = useState<AlertRecord[]>([])
  const [activeTab, setActiveTab] = useState("settings")
  const [loading, setLoading] = useState(true)
  const [testAlertSending, setTestAlertSending] = useState(false)
  const [testAlertResult, setTestAlertResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null)

  // Sayfa yüklendiğinde ayarları ve geçmişi yükle
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Ayarları yükle
        const savedSettings = getAlertSettings()
        setSettings(savedSettings)

        // Uyarı geçmişini yükle
        const history = getAlertHistory()
        setAlertHistory(history)

        // Bildirim izni durumunu kontrol et
        if (browserSupportsNotifications()) {
          setNotificationPermission(Notification.permission)
        }
      } catch (error) {
        console.error("Uyarı sistemi verileri yüklenirken hata:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Ayarları kaydet
  const handleSaveSettings = () => {
    saveAlertSettings(settings)
    setTestAlertResult({
      success: true,
      message: "Uyarı ayarları başarıyla kaydedildi.",
    })

    // 3 saniye sonra mesajı temizle
    setTimeout(() => {
      setTestAlertResult(null)
    }, 3000)
  }

  // Test uyarısı gönder
  const handleSendTestAlert = async () => {
    setTestAlertSending(true)
    setTestAlertResult(null)

    try {
      const result = await sendTestAlert(settings)

      if (result) {
        setTestAlertResult({
          success: true,
          message: "Test uyarısı başarıyla gönderildi.",
        })

        // Uyarı geçmişini güncelle
        setAlertHistory([result, ...alertHistory])
      } else {
        setTestAlertResult({
          success: false,
          message: "Test uyarısı gönderilemedi. Ayarlarınızı kontrol edin.",
        })
      }
    } catch (error) {
      console.error("Test uyarısı gönderilirken hata:", error)
      setTestAlertResult({
        success: false,
        message: "Test uyarısı gönderilirken bir hata oluştu.",
      })
    } finally {
      setTestAlertSending(false)
    }
  }

  // Bildirim izni iste
  const handleRequestNotificationPermission = async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission ? "granted" : "denied")
  }

  // Ayarları güncelle
  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  // Kanal ayarlarını güncelle
  const updateChannelSettings = (channel: AlertChannel, enabled: boolean, contactInfo?: string) => {
    setSettings((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: {
          enabled,
          contactInfo: contactInfo !== undefined ? contactInfo : prev.channels[channel].contactInfo,
        },
      },
    }))
  }

  // Sessiz saat ayarlarını güncelle
  const updateQuietHours = (enabled: boolean, start?: string, end?: string, overrideForCritical?: boolean) => {
    setSettings((prev) => ({
      ...prev,
      quietHours: {
        enabled,
        start: start !== undefined ? start : prev.quietHours?.start || "22:00",
        end: end !== undefined ? end : prev.quietHours?.end || "07:00",
        overrideForCritical:
          overrideForCritical !== undefined ? overrideForCritical : prev.quietHours?.overrideForCritical || true,
      },
    }))
  }

  // Risk seviyesi için ikon
  const getRiskIcon = (riskLevel: FlashFloodRiskLevel) => {
    switch (riskLevel) {
      case "EXTREME":
        return <Siren className="h-4 w-4 text-red-600" />
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "MODERATE":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "LOW":
        return <Info className="h-4 w-4 text-green-600" />
    }
  }

  // Kanal için ikon
  const getChannelIcon = (channel: AlertChannel) => {
    switch (channel) {
      case "SMS":
        return <MessageSquare className="h-4 w-4" />
      case "EMAIL":
        return <Mail className="h-4 w-4" />
      case "PUSH":
        return <Bell className="h-4 w-4" />
      case "PHONE_CALL":
        return <Phone className="h-4 w-4" />
      case "EMERGENCY_SERVICES":
        return <PhoneCall className="h-4 w-4" />
    }
  }

  // Durum için ikon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT":
      case "DELIVERED":
      case "ACKNOWLEDGED":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  // Tarih formatla
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-blue-500" />
            Ani Su Baskını Uyarı Sistemi
          </span>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            aria-label="Uyarı sistemini etkinleştir/devre dışı bırak"
          />
        </CardTitle>
        <CardDescription>Belirli bir risk seviyesinin üzerinde otomatik uyarı gönderen sistem</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Uyarı Ayarları
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Uyarı Geçmişi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            {!settings.enabled && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Uyarı Sistemi Devre Dışı</AlertTitle>
                <AlertDescription>
                  Uyarı sistemi şu anda devre dışı. Uyarıları almak için sistemi etkinleştirin.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Uyarı Eşiği</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Hangi risk seviyesinden itibaren uyarı almak istediğinizi seçin
                </p>
                <Select
                  value={settings.minRiskLevel}
                  onValueChange={(value: FlashFloodRiskLevel) => updateSettings({ minRiskLevel: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Risk seviyesi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW" className="flex items-center">
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-green-500">Düşük</Badge>
                        Tüm uyarıları al
                      </div>
                    </SelectItem>
                    <SelectItem value="MODERATE">
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-yellow-500">Orta</Badge>
                        Orta ve üzeri risk uyarıları
                      </div>
                    </SelectItem>
                    <SelectItem value="HIGH">
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-orange-500">Yüksek</Badge>
                        Sadece yüksek ve çok yüksek risk uyarıları
                      </div>
                    </SelectItem>
                    <SelectItem value="EXTREME">
                      <div className="flex items-center">
                        <Badge className="mr-2 bg-red-500">Çok Yüksek</Badge>
                        Sadece çok yüksek risk uyarıları
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Uyarı Kanalları</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Uyarıları hangi kanallar üzerinden almak istediğinizi seçin
                </p>

                <div className="space-y-4">
                  {/* SMS Kanalı */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        SMS Uyarıları
                      </Label>
                      <p className="text-sm text-muted-foreground">Ani su baskını uyarılarını SMS olarak alın</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Switch
                        checked={settings.channels.SMS.enabled}
                        onCheckedChange={(checked) => updateChannelSettings("SMS", checked)}
                      />
                      {settings.channels.SMS.enabled && (
                        <Input
                          placeholder="Telefon numarası"
                          value={settings.channels.SMS.contactInfo}
                          onChange={(e) => updateChannelSettings("SMS", true, e.target.value)}
                          className="w-48"
                        />
                      )}
                    </div>
                  </div>

                  {/* E-posta Kanalı */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        E-posta Uyarıları
                      </Label>
                      <p className="text-sm text-muted-foreground">Ani su baskını uyarılarını e-posta olarak alın</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Switch
                        checked={settings.channels.EMAIL.enabled}
                        onCheckedChange={(checked) => updateChannelSettings("EMAIL", checked)}
                      />
                      {settings.channels.EMAIL.enabled && (
                        <Input
                          placeholder="E-posta adresi"
                          value={settings.channels.EMAIL.contactInfo}
                          onChange={(e) => updateChannelSettings("EMAIL", true, e.target.value)}
                          className="w-48"
                        />
                      )}
                    </div>
                  </div>

                  {/* Tarayıcı Bildirimleri */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Bell className="h-4 w-4 mr-2" />
                        Tarayıcı Bildirimleri
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Ani su baskını uyarılarını tarayıcı bildirimi olarak alın
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Switch
                        checked={settings.channels.PUSH.enabled}
                        onCheckedChange={(checked) => updateChannelSettings("PUSH", checked)}
                      />
                      {settings.channels.PUSH.enabled && (
                        <div className="flex items-center">
                          {notificationPermission !== "granted" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleRequestNotificationPermission}
                              className="text-xs"
                            >
                              Bildirim İzni İste
                            </Button>
                          )}
                          {notificationPermission === "granted" && <Badge className="bg-green-500">İzin Verildi</Badge>}
                          {notificationPermission === "denied" && <Badge className="bg-red-500">İzin Reddedildi</Badge>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telefon Araması */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        Telefon Araması
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Yüksek ve çok yüksek risk durumlarında otomatik telefon araması alın
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Switch
                        checked={settings.channels.PHONE_CALL.enabled}
                        onCheckedChange={(checked) => updateChannelSettings("PHONE_CALL", checked)}
                      />
                      {settings.channels.PHONE_CALL.enabled && (
                        <Input
                          placeholder="Telefon numarası"
                          value={settings.channels.PHONE_CALL.contactInfo}
                          onChange={(e) => updateChannelSettings("PHONE_CALL", true, e.target.value)}
                          className="w-48"
                        />
                      )}
                    </div>
                  </div>

                  {/* Acil Durum Servisleri */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base flex items-center">
                        <Siren className="h-4 w-4 mr-2 text-red-500" />
                        Acil Durum Servisleri
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Çok yüksek risk durumlarında acil durum servislerine otomatik bildirim gönder
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Switch
                        checked={settings.channels.EMERGENCY_SERVICES.enabled}
                        onCheckedChange={(checked) => updateChannelSettings("EMERGENCY_SERVICES", checked)}
                      />
                      {settings.channels.EMERGENCY_SERVICES.enabled && (
                        <Input
                          placeholder="Acil durum numarası"
                          value={settings.channels.EMERGENCY_SERVICES.contactInfo}
                          onChange={(e) => updateChannelSettings("EMERGENCY_SERVICES", true, e.target.value)}
                          className="w-48"
                          disabled
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Sessiz Saatler</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Belirli saatlerde uyarı almak istemiyorsanız sessiz saatleri ayarlayın
                </p>

                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Sessiz Saatler
                    </Label>
                    <p className="text-sm text-muted-foreground">Belirlenen saatler arasında uyarı almayın</p>
                  </div>
                  <Switch
                    checked={settings.quietHours?.enabled || false}
                    onCheckedChange={(checked) => updateQuietHours(checked)}
                  />
                </div>

                {settings.quietHours?.enabled && (
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Başlangıç Saati</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.start}
                          onChange={(e) => updateQuietHours(true, e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Bitiş Saati</Label>
                        <Input
                          type="time"
                          value={settings.quietHours.end}
                          onChange={(e) => updateQuietHours(true, undefined, e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="override-critical"
                        checked={settings.quietHours.overrideForCritical}
                        onCheckedChange={(checked) => updateQuietHours(true, undefined, undefined, checked)}
                      />
                      <Label htmlFor="override-critical">Çok yüksek risk durumlarında sessiz saatleri yoksay</Label>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Bildirim Yarıçapı</h3>
                <p className="text-sm text-gray-500 mb-2">Hangi mesafedeki uyarıları almak istediğinizi ayarlayın</p>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Bildirim Yarıçapı</span>
                    <span className="font-medium">{settings.notificationRadius} km</span>
                  </div>
                  <Slider
                    value={[settings.notificationRadius]}
                    min={5}
                    max={100}
                    step={5}
                    onValueChange={(value) => updateSettings({ notificationRadius: value[0] })}
                  />
                  <p className="text-xs text-gray-500">
                    Konumunuzdan {settings.notificationRadius} km yarıçapındaki ani su baskını uyarılarını alacaksınız.
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium">Bekleme Süresi</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Aynı bölge için tekrar uyarı almadan önce geçmesi gereken süreyi ayarlayın
                </p>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Bekleme Süresi</span>
                    <span className="font-medium">{settings.cooldownPeriod} dakika</span>
                  </div>
                  <Slider
                    value={[settings.cooldownPeriod]}
                    min={0}
                    max={240}
                    step={15}
                    onValueChange={(value) => updateSettings({ cooldownPeriod: value[0] })}
                  />
                  <p className="text-xs text-gray-500">
                    {settings.cooldownPeriod === 0
                      ? "Bekleme süresi yok, tüm uyarıları alacaksınız."
                      : `Aynı bölge için ${settings.cooldownPeriod} dakika içinde tekrar uyarı almayacaksınız.`}
                  </p>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleSendTestAlert} disabled={testAlertSending}>
                  {testAlertSending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span> Test Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Test Uyarısı Gönder
                    </>
                  )}
                </Button>
                <Button onClick={handleSaveSettings}>Ayarları Kaydet</Button>
              </div>

              {testAlertResult && (
                <Alert variant={testAlertResult.success ? "default" : "destructive"} className="mt-4">
                  {testAlertResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>{testAlertResult.success ? "Başarılı" : "Hata"}</AlertTitle>
                  <AlertDescription>{testAlertResult.message}</AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Uyarı Geçmişi</h3>
              <Badge variant="outline" className="font-normal">
                {alertHistory.length} uyarı
              </Badge>
            </div>

            {alertHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BellOff className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Henüz hiç uyarı gönderilmedi.</p>
                <p className="text-sm mt-1">
                  Uyarı ayarlarınızı yapılandırın ve test uyarısı göndererek sistemi test edin.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertHistory.map((alert) => (
                  <Card key={alert.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {getRiskIcon(alert.riskLevel)}
                          <CardTitle className="text-base ml-2">
                            {alert.riskLevel === "EXTREME"
                              ? "Çok Yüksek Risk Uyarısı"
                              : alert.riskLevel === "HIGH"
                                ? "Yüksek Risk Uyarısı"
                                : alert.riskLevel === "MODERATE"
                                  ? "Orta Risk Uyarısı"
                                  : "Düşük Risk Bildirimi"}
                          </CardTitle>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            alert.status === "SENT" || alert.status === "DELIVERED" || alert.status === "ACKNOWLEDGED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : alert.status === "FAILED"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          <span className="flex items-center">
                            {getStatusIcon(alert.status)}
                            <span className="ml-1">
                              {alert.status === "SENT"
                                ? "Gönderildi"
                                : alert.status === "DELIVERED"
                                  ? "İletildi"
                                  : alert.status === "ACKNOWLEDGED"
                                    ? "Onaylandı"
                                    : alert.status === "FAILED"
                                      ? "Başarısız"
                                      : "Beklemede"}
                            </span>
                          </span>
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {alert.location.name} ({alert.location.lat.toFixed(4)}, {alert.location.lon.toFixed(4)})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm mb-3">{alert.message}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {alert.channels.map((channel) => (
                          <Badge key={channel} variant="secondary" className="text-xs">
                            <span className="flex items-center">
                              {getChannelIcon(channel)}
                              <span className="ml-1">
                                {channel === "SMS"
                                  ? "SMS"
                                  : channel === "EMAIL"
                                    ? "E-posta"
                                    : channel === "PUSH"
                                      ? "Bildirim"
                                      : channel === "PHONE_CALL"
                                        ? "Telefon"
                                        : "Acil Servis"}
                              </span>
                            </span>
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>Gönderim: {formatDate(alert.timestamp)}</span>
                        {alert.acknowledgedAt && <span>Onay: {formatDate(alert.acknowledgedAt)}</span>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500 pt-2">
        <div>
          {settings.enabled ? (
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Uyarı sistemi aktif
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <XCircle className="h-3 w-3 mr-1" /> Uyarı sistemi devre dışı
            </span>
          )}
        </div>
        <div>Son güncelleme: {new Date().toLocaleString()}</div>
      </CardFooter>
    </Card>
  )
}
