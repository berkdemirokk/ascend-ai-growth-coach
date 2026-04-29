# i18n (Çoklu Dil) — Özet

3 dil eklendi: **🇹🇷 Türkçe**, **🇺🇸 English**, **🇸🇦 العربية (Arabic + RTL)**.

## Yapılan değişiklikler

### Yeni dosyalar
- `src/i18n/index.js` — i18n init, dil değişimi, RTL yönetimi
- `src/i18n/locales/tr.json` — Türkçe çeviriler (kaynak)
- `src/i18n/locales/en.json` — İngilizce çeviriler
- `src/i18n/locales/ar.json` — Arapça çeviriler (RTL)

### Güncellenen dosyalar
- `package.json` — `i18next`, `react-i18next`, `expo-localization` eklendi
- `App.js` — i18n init, app render'dan önce dil yüklenir
- `src/screens/OnboardingScreen.js` — tüm metinler t() ile
- `src/screens/auth/WelcomeScreen.js` — tüm metinler t() ile
- `src/screens/SettingsScreen.js` — Language section eklendi (3 bayraklı buton), section header'lar t() ile
- `src/screens/ProfileScreen.js` — quick nav butonları + section header'ları t() ile
- `src/services/notifications.js` — bildirim metinleri t() ile

## Çeviri kategorileri (her dilde mevcut)

- common (continue, back, save, delete, ...)
- onboarding (welcome ekranı)
- auth (login, signup, welcome)
- home (streak, today's lesson)
- lesson (teaching, action, reflection)
- profile (rank, stats, achievements, history)
- settings (language, notifications, account, premium, legal)
- paywall (features, monthly, yearly, free trial)
- sprintComplete (celebration metinleri)
- history, achievements, path, sprintSelect
- notifications (loss-aversion bildirim metinleri)
- share (paylaş kartı metinleri)

## Otomatik dil tespiti

- İlk açılışta cihaz dilini tespit eder (`expo-localization`)
- Türkçe / İngilizce / Arapça destekleniyor → kullanıcının cihaz dili
- Diğer diller → İngilizce'ye düşer
- Kullanıcı Settings'ten manuel değiştirebilir → seçim AsyncStorage'a kaydedilir

## RTL (Sağdan-sola) desteği

- Arapça seçildiğinde `I18nManager.forceRTL(true)` çağrılır
- iOS'ta dil değişimi sonrası **app restart gerekir** (RTL layout için) — bu Apple kuralı, kaçınılmaz
- Restart promptu eklenebilir (V1.1)

## Henüz çevrilmemiş (V1.1'de)

Kritik kullanıcı yolu çevrildi. Aşağıdakiler hala Türkçe (kullanıcı önce göremez veya az görür):

- HomeScreen detay metinleri (header'lar haricinde — başlıklar görünür ama bazı subtitle/body metinleri TR)
- LessonScreen tam metni (lesson içeriği zaten curriculum'dan geliyor — TR)
- PaywallScreen
- SprintCompleteScreen detay metinleri
- HistoryScreen, AchievementsScreen
- SignupScreen, LoginScreen, ForgotPasswordScreen body metinleri
- **Curriculum içeriği** (lessons.js, sprints.js) — sadece TR (V1.1'de tüm dillere çevrilecek)

**V1 için kabul edilebilir**: Onboarding + Settings + Profile + Welcome ekranlarının çevrilmiş olması "multi-language app" iddiasını destekler. App Store'da "supports English, Turkish, Arabic" diyebilirsin.

## App Store Connect

Localizations sekmesinden 3 dil için ayrı description, keywords, subtitle ekle:

### English
- Subtitle: `Discipline sprints. Keep the flame.`
- Keywords: `monkmode,discipline,sprint,streak,focus,habit,motivation,selfimprovement,goal,routine`

### Arabic
- Subtitle: `تحديات الانضباط. أبقِ الشعلة مشتعلة.`
- Keywords: `وضعالراهب,انضباط,تحدي,تتابع,تركيز,عادة,تحفيز,تطويرذاتي,هدف,روتين`

(Turkish için mevcut subtitle/keyword kalır.)

## Test

```bash
cd "C:\Users\berk\new proje\ascend-ai-growth-coach\mobile"
npm install   # i18next, react-i18next, expo-localization kurulur
npx expo start
```

Telefonda Expo Go ile aç:
1. Cihaz dili Türkçe'yse → app Türkçe açılır
2. İngilizce'yse → İngilizce açılır
3. Arapça'ysa → Arapça + RTL açılır
4. Settings → Language → Türkçe / English / العربية → tıkla, anında değişir

## Push

```bash
git add -A
git commit -m "feat: i18n with 3 languages (TR, EN, AR) + RTL support"
git push origin main
```

## EAS Build + TestFlight

```bash
eas build --platform ios --profile production
eas submit --platform ios --latest
```

## Sıradaki tur (V1.1)

1. Curriculum tüm dillere çeviri (en büyük iş — AI ile batch)
2. Kalan ekranlar: HomeScreen, Paywall, Lesson detail
3. App Store description'ı her 3 dil için ayrı
4. Apple Sign-In ekleme (Apple reject riski azaltır)
