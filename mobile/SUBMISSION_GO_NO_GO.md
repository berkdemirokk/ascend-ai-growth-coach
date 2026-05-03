# App Store Submission GO/NO-GO

Bu dosya, **submit'e basmadan önce** mutlaka tamamlanması gereken manuel adımları listeler. Kod tarafında tüm bilinen reject vektörleri kapatıldı (v1.0.10 b24). Aşağıdaki kutucuklardan **biri bile boşsa SUBMIT ETME** — Apple seni reject eder.

---

## A) App Store Connect — App Information

- [ ] **EULA**: App Store Connect → App → General → App Information → "License
      Agreement". Ya Apple'ın **Standard EULA**'sını seç (default), ya da
      Custom seçip kendi Terms URL'ini gir:
      `https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html`
      (Auto-renewable subscription olduğu için 3.1.2 EULA gerektirir.)


- [ ] **Age Rating: 12+** (en az). Lessons.tr.json ve lessons.en.json içinde
      "porn / NoFap", "alcohol / alkol", "smoke / sigara" geçen ders içerikleri var.
      Apple ASC anketi:
  - Sexual Content & Nudity → **Infrequent/Mild** (NoFap / porn referansı)
  - Alcohol, Tobacco, or Drug Use → **Infrequent/Mild** (alkol farkındalığı, sigara kimlik dersi)
  - Diğer hepsi: **None**
  - Sonuç: **12+** rating çıkmalı. 4+ olarak göndermek = Guideline 1.3 reject.

- [ ] **Categories**
  - Primary: **Health & Fitness**
  - Secondary: **Lifestyle**

- [ ] **Privacy Policy URL** → `https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html`
      (tarayıcıdan açılıyor mu kontrol et — GitHub Pages kapalıysa instant reject)

- [ ] **Support URL** → `https://berkdemirokk.github.io/ascend-ai-growth-coach/`

- [ ] **App Review → Sign-In Required**: işaretli (kullanıcı hesabı oluşturuyor)
- [ ] **Demo Account** (Supabase'de oluşturduğun):
  - Email: `apple-review@ascend.app` (örn.)
  - Password: güçlü şifre
  - **Notes** kutusuna yaz:
    ```
    Account creation requires email verification. The provided demo account is
    pre-verified. Premium can be tested via sandbox tester account.

    Test flow:
    1. Sign in with the demo account on Welcome screen
    2. Onboarding → pick a path → finish
    3. Open today's lesson, complete teaching/quiz/reflection
    4. After first lesson, ATT prompt appears (App Tracking Transparency)
    5. Settings → Premium → opens paywall (free trial 7 days)
    6. Settings → Restore Purchases works for previous buyers
    7. Settings → Delete Account fully removes the account server-side
    ```

---

## B) App Store Connect — Subscriptions (3.1.2 binding terms)

- [ ] Subscription Group: **Premium** oluşturulmuş
- [ ] **`com.ascend.premium.monthly`** product yayında (Ready to Submit)
- [ ] **`com.ascend.premium.yearly`** product yayında (Ready to Submit)
- [ ] Her iki product'a **Introductory Offer = 1 Week Free, New Subscribers**
      eklenmiş. (Paywall "7 gün ücretsiz" diyor — eklenmezse reject.)
- [ ] Localizations 3 dilde dolu (TR / EN / AR)
- [ ] Subscription Group "App Store Review Information" notu:
      "Premium unlocks all paths and removes ads. Tested via sandbox tester."

---

## C) RevenueCat Dashboard

- [ ] iOS app `com.ascend.growth` bağlı, ASC API key yüklü
- [ ] `com.ascend.premium.monthly` ve `com.ascend.premium.yearly` import edilmiş
- [ ] Entitlement **`premium`** her iki product'ı içeriyor
- [ ] Offering **`default`** Monthly + Annual paketleri içeriyor ve **Make Current** edilmiş
- [ ] iOS public API key `appl_GdTXEiIwMXBaFuHLGjwBhzlrruB` ile constants.js eşleşiyor
- [ ] **Sandbox tester** ile satın alma denemesi → entitlement aktif olduğunu doğrula

---

## D) Supabase Edge Function (5.1.1(v) account deletion)

- [ ] `supabase/functions/delete-user/index.ts` deploy edilmiş
- [ ] Function env var `SUPABASE_SERVICE_ROLE_KEY` set edilmiş
- [ ] Settings → Hesabı Sil ile bir test hesabı sildiğinde dashboard'da auth.users'tan kayıt **gerçekten** kayboluyor
- [ ] Apple review notes'a ekle: "Account deletion is fully server-side via the delete-user Supabase Edge Function."

---

## E) AdMob Hesabı

- [ ] Hesap onaylı (publisher pub-9898903071826160)
- [ ] App `com.ascend.growth` AdMob'da kayıtlı, App Store ID `6761607644` ile bağlı
- [ ] Production interstitial / rewarded / banner ad unit ID'ler aktif
- [ ] **`USE_TEST_ADS_IN_RELEASE = false`** (constants.js, doğrulandı)

---

## F) App Privacy (Nutrition Labels)

- [ ] **Data Collected (linked to user)**:
  - Contact Info → Email Address (App Functionality)
  - Identifiers → User ID (App Functionality)
  - Identifiers → Device ID (App Functionality + Third-Party Advertising)
  - Usage Data → Product Interaction (Third-Party Advertising)
- [ ] **Tracking: YES** (AdMob var, ATT prompt kodda mevcut)
- [ ] NOT collected: Location, Contacts, Photos, Browsing History, Health, Sensitive

---

## G) Build & Upload

- [ ] EAS Build production: `eas build --platform ios --profile production`
- [ ] TestFlight'a yüklendi → "Ready to Test" durumunda
- [ ] iPhone'da TestFlight üzerinden bizzat test edildi:
  - [ ] Onboarding tamamlanır + notification permission isteği gelir (boot'ta DEĞİL)
  - [ ] İlk dersten sonra ATT prompt çıkar
  - [ ] Paywall → fiyatlar yüklenir (RevenueCat sandbox)
  - [ ] Settings → Restore Purchases çalışır
  - [ ] Settings → Hesabı Sil → server-side silme + local wipe
  - [ ] Privacy ve Terms linkleri tarayıcıda açılır
  - [ ] AR diline geçince RTL düzeni doğru, paywall keys boşalmaz

---

## H) Screenshots (1290×2796, en az 3)

- [ ] Onboarding hero
- [ ] Path screen (Vivid Impact light)
- [ ] Lesson screen
- [ ] Profile / streak
- [ ] Paywall (price cards görünür)

---

## ✅ Hepsi tikli mi?

İşte o zaman **Submit for Review** → bekle 24-72 saat.

Eğer reject olursan: Resolution Center mesajını oku, hangi guideline'ı kaçırdığını gör, sadece o noktayı düzelt, **buildNumber'ı 1 artır**, yeniden submit et.
