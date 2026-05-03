# 🚀 SUBMIT_NEXT_STEPS — App Store'a göndermeden önce sırayla yap

Bu dosya **kod değişiklikleri tamamlandıktan sonra** Berk'in (insan) yapması
gereken manuel adımları sıralar. Ben (Claude) bu kısmı çalıştıramam: hesap
girişi, dashboard tıklamaları, fiziksel cihaz testi gerektiriyor.

Sıra önemlidir. Üst sırayı atlama, alt sıra çalışmaz.

---

## ✅ Kod tarafında zaten yapıldı (bu commit)

- Privacy policy (TR + EN) AdMob, ATT, IDFA, tüm 3rd-party'lerle birlikte
  yeniden yazıldı — `docs/privacy.html`, `docs/privacy.en.html`
- Terms of service (TR + EN) — `docs/terms.html`, `docs/terms.en.html`
- AdMob Android app ID test ID'si ile değiştirildi (iOS publish edildiği
  için Android sahte değer; ileride Android publish edersen gerçek değer ekle)
- `.github/workflows/ios-testflight.yml` (eski Capacitor workflow) silindi
- `AppContext.completedPathsCount` artık `path.duration` ile dinamik
  (eski hardcoded `>= 21` kaldırıldı)
- `HomeScreen` kullanıcı adı: profile → auth metadata → e-posta local-part →
  fallback string sırasıyla
- `cloudSync.mergeStates` per-path merge yapıyor; iki cihaz arasında progress
  kaybı oluşmaz
- Kök `.env.example` eski Capacitor/Ollama değişkenlerinden temizlendi
- `docs/app-store-submission.md` ATT yanlış bilgisi düzeltildi

---

## 1️⃣ Supabase Edge Function deploy — `delete-user`

> ⚠️ Bu yapılmazsa "Hesabı Sil" çalışmaz → Apple **kesinlikle reject** eder
> (Guideline 5.1.1(v)).

Yerel makinede (Windows OK):

```bash
# Supabase CLI kur (bir kere)
npm install -g supabase

# Login (browser açılır, link)
supabase login

# Bu repo'yu Supabase projesine bağla
cd "C:\Users\berk\new proje\ascend-ai-growth-coach\mobile"
supabase link --project-ref wihkcmgtzmdupxuyavyr

# Function deploy et
supabase functions deploy delete-user --no-verify-jwt
```

Sonra Supabase Dashboard → Edge Functions → `delete-user` → **Settings → Secrets**:

| Key                       | Value                                          |
|---------------------------|------------------------------------------------|
| `SUPABASE_URL`            | `https://wihkcmgtzmdupxuyavyr.supabase.co`     |
| `SUPABASE_SERVICE_ROLE_KEY` | (Project Settings → API → service_role)      |

> Service role key zaten `mobile/.env.local`'da `SUPABASE_SERVICE_ROLE` olarak
> var — kopyala. Asla repoya push'lama; gitignore'da olduğunu doğruladım.

**Test:** Telefonda demo hesapla giriş yap, Settings → Tehlikeli Bölge →
Hesabı Sil. Supabase dashboard → Authentication → Users altında o user'ın
kaybolduğunu doğrula.

---

## 2️⃣ Schema'yı uygula

`mobile/supabase/schema.sql` içeriğini Supabase Dashboard → SQL Editor →
New Query'ye yapıştır → **Run**. RLS policy'leri ve `user_state` tablosunu
kurar. (Daha önce yapıldıysa idempotent — sorun değil.)

---

## 3️⃣ Apple Sign-In — Supabase Auth provider configure

> Yapılmazsa Apple Sign-In kodu çalışır gibi görünür ama backend `400` döner.

1. **Apple Developer**'da:
   - Identifiers → Services IDs → **+** → "Sign in with Apple"
     - Identifier: `com.ascend.growth.web`
     - Domains: `wihkcmgtzmdupxuyavyr.supabase.co`
     - Return URLs: `https://wihkcmgtzmdupxuyavyr.supabase.co/auth/v1/callback`
   - Keys → **+** → "Sign in with Apple" → kopyala Key ID + .p8 indir
2. **Supabase Dashboard** → Authentication → Providers → **Apple** → Enable:
   - Services ID: `com.ascend.growth.web`
   - Team ID: `44B88YK392`
   - Key ID: (yukarıdan)
   - Private Key: .p8 dosyasının içeriği
3. Authorized Client IDs (alt kısım): `com.ascend.growth` (native bundle id) ekle.

---

## 4️⃣ App Store Connect — In-App Purchases

ASC → My Apps → Ascend → **Subscriptions** sekmesi.

### 4.1 Subscription Group oluştur (yoksa)
- Reference Name: `Ascend Premium`
- Localizations: TR `Ascend Premium`, EN `Ascend Premium`

### 4.2 Aylık abonelik
- **+ Create Subscription**
- Reference Name: `Monthly Premium`
- Product ID: **`com.ascend.premium.monthly`** (kod tam bunu bekliyor)
- Group: Ascend Premium
- Duration: 1 Month
- Prices: TR ₺149, US $4.99
- Localizations için `mobile/APP_STORE_LISTING.md` → "Subscription Localizations"
- Review Information: bir screenshot ekle (paywall ekranı)

### 4.3 Yıllık abonelik (HALA EKSİK — APP_STORE_LISTING.md'de işaretli)
- **+ Create Subscription**
- Reference Name: `Yearly Premium`
- Product ID: **`com.ascend.premium.yearly`**
- Group: Ascend Premium (aynı!)
- Duration: 1 Year
- Prices: TR ₺749, US $39.99
- Localizations: aynı doküman

### 4.4 Introductory Offer (ZORUNLU — paywall'da "7 gün ücretsiz" diyor)
Her iki subscription için:
- Subscription detayında → Subscription Prices → **+ Add Introductory Offer**
- Type: **Free**
- Duration: **1 Week**
- Eligibility: **New Subscribers**

Yapılmazsa "7 gün ücretsiz" copy'si Apple gözünde **yanıltıcı pazarlama** =
reject sebebi.

---

## 5️⃣ RevenueCat Dashboard

1. https://app.revenuecat.com → giriş
2. Project: Ascend (varsa) veya **+ New Project**
3. **+ App** → iOS:
   - Bundle ID: `com.ascend.growth`
   - App Store Connect API Key bağla:
     - Issuer ID: `875b8c0f-3adb-4175-b5d4-334257c02837`
     - Key ID: `CV8FXZNAR8`
     - .p8: `mobile/credentials/AuthKey_CV8FXZNAR8.p8`
4. **Products** → **Import from App Store Connect**:
   - `com.ascend.premium.monthly` ve `.yearly` görünmeli (ASC'de oluşturulmuşsa)
5. **Entitlements** → **+ New** → Identifier: **`premium`**
   - Her iki ürünü bu entitlement'a bağla
6. **Offerings** → **+ New** → Identifier: **`default`**
   - Add Package → Type: **Monthly** → product `.monthly`
   - Add Package → Type: **Annual** → product `.yearly`
   - Sayfanın üstünde **"Make Current"** (kritik — kod `offerings.current` bekliyor)
7. **API Keys** → iOS Public Key kopyala → kod ile karşılaştır:
   - `mobile/src/config/constants.js` → `REVENUECAT_CONFIG.API_KEY_IOS`
   - Mevcut: `appl_GdTXEiIwMXBaFuHLGjwBhzlrruB`
   - Farklıysa güncelle, commit, yeni build

---

## 6️⃣ App Store Connect — App Information

- **Localizations:** Turkish (Primary) + English (US). `APP_STORE_LISTING.md`
  içeriğinden kopyala-yapıştır
- **Categories:** Primary `Health & Fitness`, Secondary `Productivity`
- **Age Rating:** 12+ (`APP_STORE_LISTING.md`'de detay)
- **URLs:**
  - Privacy Policy: `https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html`
  - Terms: `https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html`
  - Support URL: `mailto:berkkdemirok@gmail.com` (basit)
- **App Privacy Nutrition Labels:** `docs/app-store-submission.md` içindeki
  güncel listeyi kullan (IDFA + AdMob işaretli)

> **GitHub Pages aktif mi?** Repo → Settings → Pages → Source: `Deploy from a
> branch` → main / `/docs`. Push'tan sonra ~1 dakika beklemen gerekebilir.
> Privacy URL açılana kadar Apple submit etme.

---

## 7️⃣ Sandbox Tester ve Demo Hesabı

### 7.1 Sandbox tester (StoreKit'i test etmek için)
ASC → Users and Access → **Sandbox** → Test Accounts → **+**

| Field | Value |
|---|---|
| First Name | `Ascend` |
| Last Name | `Tester` |
| Email | `ascend.tester.001@icloud.com` (gerçek olması şart değil) |
| Password | (8+ karakter, kaydet) |
| DOB | `01/01/1990` |
| Country | `Turkey` |

iPhone → Settings → App Store → en alta in → Sandbox Account → Sign In.
Bu hesapla TestFlight'tan Premium subscribe et — ücret tahsil edilmez.

### 7.2 Apple Review demo hesabı
Supabase Dashboard → Authentication → Users → **Add user**:

- Email: `apple.review@ascend.app` (Berk'in domain'i değilse fake OK)
- Password: (8+ karakter — APP_STORE_LISTING.md'de saklayıp ASC review notes'a yapıştır)
- Email confirm: **Yes** (yoksa giriş yapamaz)

Sonra ASC → App Review → Sign-In Required: **Yes**, demo email/password gir.
Notes alanı için `mobile/APP_STORE_LISTING.md` → "Notes for Reviewer".

---

## 8️⃣ Yeni TestFlight build at

Kod değiştiği için yeni build gerekiyor:

```bash
cd "C:\Users\berk\new proje\ascend-ai-growth-coach"

# Lock file güncel mi? (CI npm ci kullanıyor)
cd mobile && npm install && cd ..

# Commit (eğer değişiklik varsa)
git add -A
git commit -m "fix: privacy disclosure + cloud merge + path threshold"

# Build number'ı bir artır
# mobile/app.json → "buildNumber": "23" → "24"

git push origin main

# Tag ile workflow tetikle
git tag mobile-v1.0.10
git push origin mobile-v1.0.10
```

GitHub → Actions sekmesinden build'i izle (~20 dk). Bittikten sonra
ASC → TestFlight → Builds altında görünür ve "Ready to Test" olur.

---

## 9️⃣ Fiziksel iPhone'da TestFlight test (KRİTİK)

TestFlight uygulamasından son build'i kur, **gerçekten** uçtan uca test:

- [ ] Onboarding tamamlanıyor (welcome → pickPath → upsell)
- [ ] Bildirim izni isteniyor (onboarding sonu)
- [ ] Apple Sign-In çalışıyor (yeni hesap oluşur)
- [ ] Email + şifre signup çalışıyor
- [ ] İlk dersi tamamla → ATT prompt çıkıyor → "Ask App Not to Track"a bas
- [ ] Reklam çıkmıyor (premium isen) / çıkıyor (free isen, ilk birkaç dersten sonra)
- [ ] Paywall'da gerçek fiyatlar görünüyor (₺149, ₺749 vb.) — `notReadyTitle`
      hatası ÇIKMAMALI. Çıkıyorsa ASC IAP veya RevenueCat hatalı.
- [ ] Sandbox tester ile yıllık subscribe → "7 day trial" satın alma akışı temiz
- [ ] Restore Purchases → premium aktif olur
- [ ] Settings → Hesabı Sil → Supabase'de user kaybolur (web dashboard'da kontrol)
- [ ] Cihaz dilini Türkçe → İngilizce yap, uygulama dili otomatik değişir
- [ ] Uçak modunda aç → ErrorBoundary değil, normal ekran (offline akış)

Hata varsa düzelt → 8. adımdan tekrarla.

---

## 🔟 Screenshots (zorunlu)

Apple en az 3 screenshot ister, ideali 6+. **6.7" iPhone (1290×2796)**.

iPhone'da TestFlight build'i aç → her ekrana git → **Yan tuş + Power tuşu** ile
screenshot çek. AirDrop / iCloud ile bilgisayara aktar.

Önerilen 6 ekran:
1. Onboarding hero (Monk Mode + alev)
2. PathScreen (Duolingo-tarzı yol görünümü)
3. LessonScreen (öğretim metni + quiz)
4. HomeScreen streak hero ile (15+ gün)
5. PaywallScreen (yıllık seçili, bestValue badge)
6. Profile (rütbe + total stats)

**Polish:** [previewed.app](https://previewed.app) — iPhone çerçevesi içine yerleştir,
fonun rengini değiştir, başlık ekle (TR + EN ikişer).

ASC → App Store sekmesi → her locale için Screenshots upload.

---

## 1️⃣1️⃣ Submit for Review

ASC → App Store sekmesi → Build seç → **Submit for Review**.

Tüm sekmelerin yeşil tikli olduğundan emin ol. Apple onay süresi: 24-72 saat
genelde.

---

## 🚨 Reject olursa olası sebepler ve çözümleri

| Sebep | Çözüm |
|---|---|
| Privacy policy URL açılmıyor | GitHub Pages aktif değil → Settings → Pages → enable |
| Privacy nutrition labels eksik tracking | IDFA → Yes, AdMob → Yes işaretle |
| "7 gün ücretsiz" yanıltıcı | ASC'de Introductory Offer'ı her sub'a eklemediğin içindir |
| Demo hesap çalışmıyor | Supabase'de email confirm'i yap, password'ü Reviewer Notes'a doğru yaz |
| Sign in with Apple capability eksik | EAS credentials regenerate (otomatik plugin yapıyor) |
| Account deletion çalışmıyor | Edge Function deploy edilmedi → 1️⃣ adımı |
| AdMob test ad'i prod'da görünüyor | `constants.js` → `USE_TEST_ADS_IN_RELEASE: false` doğrula |

---

## 📊 Hızlı durum kontrolü

```bash
# Privacy URL canlı mı?
curl -sI https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html | head -1

# Edge function deploy oldu mu?
curl -X POST https://wihkcmgtzmdupxuyavyr.supabase.co/functions/v1/delete-user
# 401 dönmeli ("Missing Authorization header") — 404 dönüyorsa deploy edilmemiş

# TestFlight build durumu
# (browser ile) https://appstoreconnect.apple.com/apps/6761607644/testflight/ios
```

---

Bittiğinde commit + push at, tag at, ve "Submit for Review" tuşuna bas.
Apple onayından sonra App Store'da olacaksın. 🔥
