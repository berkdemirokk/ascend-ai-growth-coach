# iOS Readiness — Next Steps

Bu turda yapılan kod değişikliklerinden sonra iOS'ta release-ready hale gelmek için gereken adımlar.

## 1. Bağımlılıkları kur (Windows veya Mac, herhangi bir yerde)

```bash
npm install
```

Yeni eklenen paketler:
- `@capacitor/haptics` — görev tamamlamada native titreşim
- `@capacitor/local-notifications` — günlük hatırlatma bildirimleri
- `@capacitor-community/apple-sign-in` — Sign in with Apple

## 2. Mac + Xcode (zorunlu — Windows'tan yapılamaz)

### 2.1 Capacitor sync
```bash
npm run ios:sync
```

### 2.2 Xcode'da capability'leri aç
`ios/App/App.xcworkspace` aç, App target → Signing & Capabilities → "+ Capability":
- **Sign in with Apple** ekle
- **Push Notifications** ekle (ileride remote push için)

### 2.3 Info.plist'e ekle
`ios/App/App/Info.plist` içine:
```xml
<key>NSUserNotificationsUsageDescription</key>
<string>Günlük görev hatırlatmaları için bildirim izni gerekiyor.</string>
```

### 2.4 App Store Connect product konfigürasyonu
Premium IAP'a **Introductory Offer → 7 days free trial** ekle. Onboarding paywall'daki "7 gün ücretsiz" copy'si bu konfigürasyona bağlı.

## 3. Backend — Apple Sign-In endpoint (zorunlu)

`server/index.mjs` içine `POST /api/account/apple-sign-in` ekle:
- Body: `{ identityToken, authorizationCode, email }`
- `identityToken`'ı Apple'ın public key'leri ile JWT olarak doğrula (jwks: `https://appleid.apple.com/auth/keys`)
- Doğrulanan `sub` claim'ini account ID olarak kullan
- Mevcut hesap varsa restore et, yoksa yeni hesap oluştur
- Response: `loginRemoteAccount` ile aynı şema (AccountLoginPayload)

Önerilen kütüphane: `jose` (npm install jose)

## 4. App Store reddetme nedenleri (kontrol et)

- [ ] **Privacy nutrition labels** — App Store Connect'te "App Privacy" doldur (data collection: account, usage)
- [ ] **App Tracking Transparency** — Reklam SDK'sı yoksa pas geçilebilir, ama emin ol
- [ ] **Account deletion** — Mevcut ✓ (`onDeleteAccount`)
- [ ] **Sign in with Apple** — UI yapıldı ✓, backend endpoint sırada
- [ ] **3. parti login varsa SIWA zorunlu** — Email/password var, SIWA da var ✓

## 5. Test sırası (TestFlight'tan önce)

1. Mac'te `npm install` → `npm run ios:sync`
2. Xcode'da capability'leri ekle
3. iPhone'a Run et:
   - Onboarding'i tamamla
   - Profile sekmesinde "Hatırlatma" kartını gör, saat ayarla
   - Görev tamamla → titreşim hisset
   - Bildirim iznini ver, ertesi gün ayarladığın saatte bildirim gelmeli
   - 1 gün kaçır, sonraki gün görevi tamamla → streak freeze devreye girip seri kırılmamalı
   - "Mevcut hesabım var" → AccountAccess'te "Apple ile devam et" görünmeli (sadece native iOS'ta)

## 6. Kalan yüksek-öncelikli işler (sonraki tur)

- iOS Widget (WidgetKit, Swift) — bugünün görevini ana ekranda göster
- Push notifications backend (FCM/APNs) — "akşam 20:00 hâlâ yapmadın" reminder
- Crashlytics veya Sentry kurulumu
- Analytics (PostHog veya Firebase Analytics)
- App Store screenshot + preview video
- Lock screen widget
- Paylaşım kartı (streak ekran görüntüsü paylaş)
