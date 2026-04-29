# Ascend Monk Mode — App Store Submission Master Doc

Bu doküman App Store'a submit etmek için **her şey**i içerir. Sırayla takip et.

---

## 0. Mevcut config (kontrol amaçlı)

```
Bundle ID:       com.ascend.growth
App ID:          6761607644
Apple Team:      44B88YK392
ASC API Key ID:  CV8FXZNAR8
Issuer ID:       875b8c0f-3adb-4175-b5d4-334257c02837
Apple ID:        berkkdemirok@gmail.com
EAS Project:     2a44eced-27a4-4ae2-b831-25957422f01b
Supabase URL:    wihkcmgtzmdupxuyavyr.supabase.co
RevenueCat iOS:  appl_GdTXEiIwMXBaFuHLGjwBhzlrruB
```

---

## 1. Kodda neler tamam (yaptıklarım)

### Auth & Account
- ✅ Supabase email/password auth
- ✅ **Apple Sign-In** (`signInWithApple` AuthContext'te, WelcomeScreen'de buton)
- ✅ Misafir mode
- ✅ Şifre sıfırlama akışı

### Monetization
- ✅ RevenueCat entegrasyonu
- ✅ **Aylık + Yıllık subscription** desteği (purchases.js)
- ✅ Paywall yıllık'ı "BEST" badge ile öne çıkarır
- ✅ Restore purchases
- ✅ AdMob **tamamen kaldırıldı** (premium-only monetization)

### i18n
- ✅ 3 dil: 🇹🇷 Türkçe, 🇺🇸 English, 🇸🇦 Arabic (RTL ile)
- ✅ Cihaz dilini otomatik tespit
- ✅ Settings → Language değiştirici
- ✅ Çevrilen ekranlar: Onboarding, Welcome (auth), Login, Signup, ForgotPassword, Settings, Profile, Paywall, HomeScreen (kritik label'lar)
- ⚠️ Henüz çevrilmemiş: LessonScreen detay, SprintCompleteScreen, HistoryScreen, AchievementsScreen, SprintSelectScreen, **curriculum içeriği** (lessons/sprints — sadece TR)

### UX
- ✅ Onboarding 8 sayfa → 1 sayfa
- ✅ Bottom nav 5 tab → 2 tab (Bugün + Sen)
- ✅ Settings/History/Path/Achievements → "Sen" ekranında quick nav
- ✅ Loss-aversion bildirim metinleri

### Branding
- ✅ Monk Mode brand (zaten Expo'daydı)
- ✅ Dark theme (#0B0B14)
- ✅ Privacy Policy + Terms (TR) yazıldı (`docs/privacy.html`, `docs/terms.html`)

---

## 2. SENİN YAPACAKLARIN — sırayla

### 2.1 ✅ Bağımlılıkları yükle (yeni paketler eklendi)

```powershell
cd "C:\Users\berk\new proje\ascend-ai-growth-coach\mobile"
npm install
```

Yeni paketler:
- `expo-localization` (otomatik dil tespiti)
- `expo-apple-authentication` (Apple Sign-In)
- `expo-crypto` (Apple nonce için)
- `i18next`, `react-i18next`

Kaldırılan paketler:
- `react-native-google-mobile-ads`
- `expo-tracking-transparency`

### 2.2 ✅ Test (Expo Go ile)

```powershell
npx expo start
```
Telefonda QR ile aç:
- [ ] Welcome ekranı: "Apple ile devam et" görünüyor mu (sadece iOS'ta)
- [ ] Onboarding tek sayfa
- [ ] Settings → Dil → 3 bayrak (🇹🇷 🇺🇸 🇸🇦)
- [ ] İngilizce'ye geç → metinler değişiyor mu
- [ ] Arapça'ya geç → RTL layout (sağdan-sola) çalışıyor mu

### 2.3 ⚠️ Privacy Policy + Terms public host et

**GitHub Pages ile (5 dakika):**
1. https://github.com/berkdemirokk/ascend-ai-growth-coach/settings/pages
2. Source: Deploy from a branch
3. Branch: `main`
4. Folder: `/docs`
5. Save

URL'ler 1-2 dakika sonra:
- Privacy: `https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html`
- Terms: `https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html`

**Test et tarayıcıdan açılıyor mu** → açılıyorsa App Store Connect'e gir.

### 2.4 ⚠️ App Store Connect — Subscription products oluştur

Apple Developer kuralı: subscription kullanmak için product **App Store Connect'te oluşturulmalı**.

1. App Store Connect → My Apps → Ascend: Monk Mode → **Subscriptions**
2. **Subscription Group** oluştur:
   - Reference Name: `Premium`
3. **+ Create Subscription** (aylık):
   - Reference Name: `Monthly Premium`
   - Product ID: **`ascend_super_monthly`** (kod bu ID'yi bekliyor, değiştirme)
   - Subscription Group: Premium
   - Subscription Duration: 1 Month
   - Price: **149 TL** (Tier 4 ya da custom)
   - Localization (Turkish): Display Name = "Premium Aylık"
   - Localization (English): Display Name = "Monthly Premium"
   - Localization (Arabic): Display Name = "بريميوم شهري"
4. **+ Create Subscription** (yıllık):
   - Reference Name: `Yearly Premium`
   - Product ID: **`ascend_super_yearly`**
   - Subscription Group: Premium (aynı grup!)
   - Subscription Duration: 1 Year
   - Price: **749 TL**
   - Localization (Turkish): Display Name = "Premium Yıllık"
   - Localization (English): Display Name = "Yearly Premium"
   - Localization (Arabic): Display Name = "بريميوم سنوي"

### 2.5 ⚠️ Introductory Offer — 7 gün ücretsiz

Her iki subscription için:
1. Subscription detayında → **Subscription Prices** → **+ Add Introductory Offer**
2. Type: **Free**
3. Duration: **1 Week**
4. Eligibility: New Subscribers
5. Save

⚠️ **Bu olmazsa paywall'da "7 gün ücretsiz" yazısı yalan beyan = reject sebebi.**

### 2.6 ⚠️ RevenueCat dashboard kurulumu

1. https://app.revenuecat.com → giriş yap
2. **Project** oluştur: `Ascend Monk Mode` (henüz yoksa)
3. **+ App** → iOS:
   - Bundle ID: `com.ascend.growth`
   - App Store Connect API key bağla:
     - Issuer ID: `875b8c0f-3adb-4175-b5d4-334257c02837`
     - Key ID: `CV8FXZNAR8`
     - .p8 file: indir App Store Connect'ten (Users and Access → Integrations)
4. **Products** → **Import from App Store Connect**:
   - `ascend_super_monthly` ✅
   - `ascend_super_yearly` ✅
5. **Entitlements** → **+ New**:
   - Identifier: **`premium`**
   - Her iki product'ı bu entitlement'a ekle
6. **Offerings** → **+ New**:
   - Identifier: **`default`**
   - Add packages:
     - Type: **Monthly** → `ascend_super_monthly`
     - Type: **Annual** → `ascend_super_yearly`
   - **Make Current** (kritik — kod current offering'i okuyor)
7. **API Keys** → Public iOS key kopyala. Mevcut key:
   - `appl_GdTXEiIwMXBaFuHLGjwBhzlrruB`
   - Eğer farklı görünüyorsa `mobile/src/config/constants.js` → `REVENUECAT_CONFIG.API_KEY_IOS` güncelle

### 2.7 ⚠️ Apple Developer Portal — Apple Sign-In capability

1. https://developer.apple.com/account → Identifiers
2. `com.ascend.growth` identifier'ını bul → Edit
3. **Sign In with Apple** capability'sini aktif et → Save
4. Provisioning Profile'ı yenile (EAS bunu otomatik yapacak ama Apple panelinde önce capability açık olmalı)

### 2.8 ⚠️ App Store Connect — App Information

**Localizations** sekmesi → Add 3 languages:

#### 🇹🇷 Turkish (Primary)
- **Name:** `Ascend: Monk Mode` (17 char)
- **Subtitle:** `Disiplin sprint'i. Alev koru.` (29 char)
- **Promotional Text (170 char):**
  ```
  Monk mode'a hazır mısın? Her gün tek görev, alev korusu, sprint sistemi. Söndü mü her şey biter.
  ```
- **Description:**
  ```
  Ascend Monk Mode, davranış bilimine dayalı disiplin sprint sistemidir. Her gün TEK bir görev veririz. Sen tamamlarsın, alev tutuşur, ertesi gün yenisi gelir.

  🔥 STREAK SİSTEMİ
  - Her gün tamamladığında alev büyür
  - Milestone rütbeleri: Novice → Disciple → Monk → Sage
  - Streak freeze ile koruma

  🎯 SPRINT'LER
  - Dopamine Detox, Fitness, Erken Kalk, Para, Okuma, Business
  - 30 / 60 / 90 günlük commitment
  - Bitirdikçe daha zor tier'lar açılır

  ⚙️ ÖZELLİKLER
  - Apple ile hızlı giriş
  - Türkçe / İngilizce / Arapça
  - Reklamsız, monk mode aesthetic
  - Cloud sync (Supabase)

  💎 PREMIUM
  - Tüm sprint'lerin kilidi açık
  - Daha fazla streak freeze
  - 7 gün ücretsiz deneme
  - Aylık 149 TL veya yıllık 749 TL (6 ay bedava)

  Disiplin doğuştan gelmez, kurulur.

  ---
  Otomatik yenilenir; App Store ayarlarından her an iptal.
  Privacy: https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html
  Terms: https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html
  ```
- **Keywords:** `monkmode,disiplin,sprint,streak,odak,alışkanlık,motivasyon,kişiselgelişim,hedef,rutin`
- **Support URL:** `https://berkdemirokk.github.io/ascend-ai-growth-coach/`

#### 🇺🇸 English
- **Name:** `Ascend: Monk Mode`
- **Subtitle:** `Discipline sprints. Keep the flame.`
- **Description:** Yukarıdaki TR description'ın İngilizce versiyonu (sıkıştır)
- **Keywords:** `monkmode,discipline,sprint,streak,focus,habit,motivation,selfimprovement,goal,routine`

#### 🇸🇦 Arabic
- **Name:** `Ascend: وضع الراهب`
- **Subtitle:** `تحديات الانضباط. أبقِ الشعلة مشتعلة.`
- **Description:** Yukarıdaki Arapça versiyonu
- **Keywords:** `وضعالراهب,انضباط,تحدي,تتابع,تركيز,عادة,تحفيز`

### 2.9 ⚠️ App Privacy (Nutrition Labels)

App Store Connect → App Privacy → Get Started

**Data Collected (linked to user):**
- ✅ Contact Info → Email Address (App Functionality)
- ✅ Identifiers → User ID (App Functionality)
- ✅ Identifiers → Device ID (App Functionality — push notifications için)

**Tracking:**
- **Do you use data for tracking?** → **No** (AdMob kaldırıldı, sadece kendi servisin için kullanıyorsun)

**NOT collected:**
- ❌ Location, Contacts, Photos, Browsing History, Health, Financial, Sensitive

### 2.10 ⚠️ App Icon (1024×1024)

Mevcut: `mobile/assets/icon.png`. Monk mode aesthetic için yeniden tasarla.

**ChatGPT image prompt:**
```
iOS app icon, 1024x1024, deep matte black background (#0B0B14),
single bold orange-gold flame in center, minimalist, monastic,
premium feel, masculine, high contrast, no text, sharp edges
```

İndir → `mobile/assets/icon.png` üzerine yaz (aynı boyut).

### 2.11 ⚠️ Screenshots (1290×2796 px)

TestFlight build hazır olunca iOS Simulator'da:
- 6.7" iPhone (örn iPhone 15 Pro Max)
- En az 3 ekran, ideal 6:
  1. Onboarding (Monk Mode logo + "Başla")
  2. Welcome auth (Apple Sign-In butonu görünür)
  3. Bugün ekranı (sprint + bugünün görevleri)
  4. Lesson ekranı (öğretim + eylem)
  5. Profile (rütbe + stats)
  6. Paywall (7 gün ücretsiz + yıllık önerilir)

**Hızlı yol:** Simulator'da Cmd+S → screenshot.rocks veya previewed.app ile çerçevele.

### 2.12 ⚠️ Build + TestFlight + Submit

```powershell
cd "C:\Users\berk\new proje\ascend-ai-growth-coach\mobile"

# EAS CLI yüklü değilse
npm install -g eas-cli
eas login

# Production build (cloud Mac, ~15-25 dk)
eas build --platform ios --profile production

# TestFlight'a upload (otomatik)
eas submit --platform ios --latest
```

EAS dashboard'tan progress: https://expo.dev/accounts/[username]/projects/ascend-level-up

### 2.13 ⚠️ TestFlight'ta test

App Store Connect → TestFlight → build görüldüğünde:
- Test Information doldur
- Internal tester olarak kendi Apple ID'ni ekle
- Telefonunda **TestFlight app**'i ile yükle
- Sandbox account ile premium satın alma test et

### 2.14 ⚠️ Submit for Review

App Store → "Submit for Review":
- App Review Information:
  - Contact: Berk Demirok, berkkdemirok@gmail.com
  - **Demo account oluştur**: Supabase'de `apple-review@ascend.app` / random password — ekle
  - Notes: "Free tier sufficient. To test premium: use sandbox account in Settings → Sign In on iPhone."
- **Submit**

Onay süreci: 24-72 saat.

---

## 3. Reject olursa muhtemel sebepler ve çözümler

| Sebep | Çözüm |
|---|---|
| Privacy policy URL açılmıyor | GitHub Pages aktif olduğundan emin ol |
| Subscription metadata eksik | Description'a "Auto-renewable subscription. ..." ekle |
| Demo account çalışmıyor | Supabase'de oluştur, password Apple Review notes'a yaz |
| Apple Sign-In çalışmıyor | Provisioning profile'ı yenile (capability sonrası) |
| Curriculum sadece TR olduğu için | Eklemen gereken not: "Course content currently in Turkish; UI in 3 languages" |

---

## 4. Henüz yapılmamış (V1.1 — sonraki tur)

- [ ] LessonScreen, SprintCompleteScreen, HistoryScreen, AchievementsScreen, SprintSelectScreen detay metinleri çevirisi
- [ ] **Curriculum (lessons.js, sprints.js, facts.js) tüm dillere çevirisi** — en büyük iş, ayrı tur lazım
- [ ] Crashlytics / Sentry
- [ ] Analytics (PostHog)
- [ ] iOS Widget
- [ ] Lock Screen Live Activity

V1 için bunlar OK — kullanıcı core flow'u Türkçe + İngilizce + Arapça'da kullanabiliyor, premium akışı çalışıyor, monk mode brand kurulu.

---

## 5. Marketing — sen söz verdin

**App Store'a girer girmez:**
- TikTok hesabı: `@ascend.monkmode` veya `@berkdmirok`
- Günde 1 video × 90 gün minimum
- İlk video fikirleri:
  1. "Kendi disiplin app'imi yaptım, monk mode'a giriyorum. Gün 1."
  2. "Bu app'te niye AI koç YOK? — kişisel gelişim ≠ AI"
  3. "Streak sönerse her şey biter. İşte mekanik."
- Hashtag: `#monkmode #disiplin #yazılım #girişim #sprintchallenge`

Yapmazsan app ölü doğar. Yaparsan **6 ay sonra ayda 5-15K TL gelir** realistik.

---

## 6. Push checklist

```powershell
cd "C:\Users\berk\new proje\ascend-ai-growth-coach\mobile"
npm install
npx expo start  # test
git add -A
git commit -m "feat: monk mode rebrand + i18n (TR/EN/AR) + Apple Sign-In + yearly subscription + AdMob removal"
git push origin main
eas build --platform ios --profile production
eas submit --platform ios --latest
```
