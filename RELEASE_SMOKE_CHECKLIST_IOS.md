# iOS Release Smoke Checklist

## 1) Build ve release ayarlari
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run ios:sync`
- Xcode: Signing, Bundle Identifier, Team, capability ve In-App Purchase acik.
- Xcode: Release archive (Any iOS Device) basarili.
- Not: iOS archive Mac uzerinde alinmali. Gerekirse `npm run ios:sync` komutunu Mac'te tekrar calistir.

## 2) Cevresel degisken dogrulamasi
- Frontend:
  - `VITE_REVENUECAT_IOS_API_KEY`
  - `VITE_REVENUECAT_ENTITLEMENT_ID`
  - `VITE_REVENUECAT_OFFERING_ID` (opsiyonel)
- Backend:
  - `REVENUECAT_SECRET_API_KEY`
  - `REVENUECAT_ENTITLEMENT_ID`
  - `ENABLE_BILLING_PREVIEW=false`
- RevenueCat entitlement id ile frontend/backend entitlement id ayni.

## 3) Uctan uca urun akisi (zorunlu)
- Welcome -> onboarding -> plan ozeti -> paywall -> today -> progress -> profile.
- Today ekraninda bugunun gorevi, neden onemli, kisa ipucu ve tamamlandi aksiyonu gorunur.
- Progress ekraninda aktif gun, tamamlanan gorev, seri, gelisim alani, siradaki asama gorunur.
- Profile ekraninda plan durumu ve hesap bolumu dogru gorunur.

## 4) iOS UI guvenlik kontrolleri
- iPhone SE (kucuk ekran): onboarding, paywall modal, bottom tab tasma yapmiyor.
- Notch cihaz: ust safe area dogru, basliklar cizgiye gomulmuyor.
- Home indicator cihaz: alt tab home indicator ile cakismiyor.
- Modal ekranlar kaydirilabiliyor, butonlar ulasilabilir.
- Klavye acik senaryolarda input alanlari erisilebilir.

## 5) Gercek IAP senaryolari (StoreKit Sandbox)
- Satin alma basarili:
  - Paywall CTA ile satin alma tamamlanir.
  - Entitlement sync sonrasi `premium` aktif olur.
  - Profile plan durumu premium gorunur.
- Satin alma iptal:
  - Kullanici dostu "islem iptal edildi, plan degismedi" metni gorunur.
  - Entitlement free kalir.
- Satin alma pending:
  - "onay bekleniyor" metni gorunur.
  - Entitlement hemen premiuma cekilmez.
- Satin alma fail/offline:
  - Sakin hata metni gorunur.
  - App crash olmaz, tekrar deneme mumkun olur.
- Restore purchases:
  - Once premium almis sandbox hesapta restore premiumu geri acar.
  - Premium olmayan hesapta "aktif premium bulunamadi" metni gorunur.

## 6) Sunucu dogrulamasi ve guvenlik
- `/api/billing/sync-revenuecat` sadece gecerli account token ile cagrilir.
- `appUserID === accountId` dogrulamasi calisir.
- Sunucu RevenueCat API ile entitlement dogrular.
- Entitlement sonucu account subscription ve profile plan tier'a yansir.
- RevenueCat anahtari yoksa endpoint 503 doner (yanlis premium acilmaz).
- Preview endpoint release'te kapali kalir (`ENABLE_BILLING_PREVIEW=false`).

## 7) Son release kapisi
- Debug/test copy yok.
- Placeholder odeme metni yok.
- Onboarding ve odeme hattinda blocker crash yok.
- TestFlight build yuklenebilir ve sandbox IAP smoke tamam.
