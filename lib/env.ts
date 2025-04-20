// API durumunu kontrol etmek için yardımcı fonksiyonlar
// NOT: API anahtarları artık burada saklanmıyor, bunun yerine sunucu taraflı API'ler kullanılıyor

// API servisinin kullanılabilir olup olmadığını kontrol et
export function isServiceAvailable(service: string): boolean {
  // Bu fonksiyon artık API anahtarlarını kontrol etmiyor
  // Bunun yerine, servislerin kullanılabilirliğini kontrol ediyor
  switch (service) {
    case "openweathermap":
      return true // Sunucu taraflı API üzerinden her zaman kullanılabilir
    case "open-meteo":
      return true // API anahtarı gerektirmez
    default:
      return false
  }
}
