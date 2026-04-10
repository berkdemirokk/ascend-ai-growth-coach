# Ascend Growth Coach

Ascend, her gun tek bir ogretici gorev veren ve seviyene gore ilerleme rotasi cizen bir kisisel gelisim sistemidir.

## Mevcut urun durumu

- Gunluk mission, unit, checkpoint ve streak akisi aktif.
- Premium planda adaptif rota, haftalik review, 7 gunluk plan ve planli gorev kuyrugu var.
- Gorevler, profil, haftalik rota ve planli gorevler server-backed session ile eslenebilir.
- Hesap e-posta ile baglanirsa ilerleme baska cihazda geri yuklenebilir.
- AI sunucusu yoksa uygulama guvenli sekilde yerel rehberlik modunda devam eder.

## Gelistirme

1. Bagimliliklari kur:
   `npm install`
2. Gelistirme sunucusunu baslat:
   `npm run dev`
3. Uretim build'i al:
   `npm run build`

## Yerel AI sunucusu baglama

1. `.env.example` dosyasini `.env.local` olarak kopyala.
2. `OLLAMA_BASE_URL` degerini Ollama calisan makineye gore ayarla.
3. Frontend baska bir cihazdan acilacaksa `VITE_AI_BACKEND_URL` degerini bu proxy'nin ag adresine cevir.
4. Proxy'yi baslat:
   `npm run ai:server`
5. Frontend'i baslat:
   `npm run dev`

Saglik kontrolu:

`http://127.0.0.1:8787/api/health`

## iOS sync

Capacitor iOS projesini guncellemek icin:

`npm run ios:sync`

## iOS IAP (RevenueCat + StoreKit)

1. `.env.local` dosyasina su anahtarlari gir:
   - `VITE_REVENUECAT_IOS_API_KEY`
   - `VITE_REVENUECAT_ENTITLEMENT_ID`
   - `VITE_REVENUECAT_OFFERING_ID` (opsiyonel)
   - `REVENUECAT_SECRET_API_KEY`
   - `REVENUECAT_ENTITLEMENT_ID`
   - `ENABLE_BILLING_PREVIEW=false`
2. RevenueCat dashboard:
   - iOS App olustur.
   - App Store Connect subscription product id'lerini bagla.
   - `premium` (veya kullandiginiz entitlement id) entitlement'ini urunlere map et.
3. App Store Connect:
   - Auto-renewable subscription urunlerini olustur.
   - In-App Purchase capability ve banking/tax sozlesmeleri tamam olsun.
4. iOS cihaz veya simulator:
   - Sandbox tester ile login ol.
   - satin alma / iptal / pending / fail / restore senaryolarini dogrula.
5. Tum adimlar icin ayrintili kontrol listesi:
   - `RELEASE_SMOKE_CHECKLIST_IOS.md`

## Production notu

Bu repo release adayi seviyesine yaklasti. Public release oncesi zorunlu kontrol:

- iOS cihazda manuel onboarding -> paywall -> today -> progress -> profile smoke
- RevenueCat + StoreKit sandbox odeme senaryolari
- TestFlight UAT ve crash/log takibi
