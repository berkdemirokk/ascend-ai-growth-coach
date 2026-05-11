# App Store Submission — Ascend Monk Mode

## Strateji
Pozisyonlama: **Türkiye'nin Monk Mode app'i — disiplin sprint sistemi**.
Hedef kitle: 18-30 yaş, monk mode / disiplin / odak peşindeki Türkçe konuşan erkekler (ve onlardan ilham alan kadınlar).
TikTok hashtag stratejisi: #monkmode #disiplin #odak #sprint

## ASO copy (Türkçe — primary)

### App Name (30 char max)
```
Ascend: Monk Mode
```
(17 karakter)

### Subtitle (30 char max — kritik ASO alan)
```
Disiplin sprint'i. Alev koru.
```
(29 karakter)

Alternatifler:
- `Monk Mode disiplin sistemi` (26)
- `Her gün disiplin. Alev koru.` (28)
- `Sprint × Streak × Disiplin` (26)

### Promotional Text (170 char — istenildiğinde değişebilir, review gerektirmez)
```
Monk mode'a hazır mısın? 21 günlük disiplin sprint'i, her gün tek görev, alev korusu. Söndü mü her şey biter.
```

### Description (4000 char)
```
Ascend Monk Mode, davranış bilimine dayalı disiplin sprint sistemidir. Her gün TEK bir görev veririz. Sen tamamlarsın, alev tutuşur, ertesi gün yenisi gelir.

🔥 STREAK SİSTEMİ
- Her gün tamamladığında alev büyür
- 1 gün kaçırırsan freeze ile korunursun
- 3, 7, 14, 30, 100, 365 günde milestone rozetleri

📚 6 FARKLI YOL
- Fitness: Hareket Temeli, Sistem Kur, Performans Ritmi
- Kariyer: Odak Temeli, İcra Disiplini, Profesyonel Review
- Kültür: Öğrenme Temeli, Derinlik Kur, Kültürel Sistem
- Sosyal: Temas Temeli, Bağ Kur, Güvenli Tekrar
- Eğlence: Bilinçli Tüketim, Seçim Disiplini, Zevk Sistemi
- Genel: Günlük Temel, Sistem Kur, Yön Netleştir

📖 NASIL ÇALIŞIR
1. Yol seç (fitness, kariyer, vb.)
2. Tempo seç (sakin, dengeli, yüksek odak)
3. Her gün 5-15 dakika
4. Görevi yap, kısa yansıtma yaz, ertesi güne hazır

⚙️ ÖZELLİKLER
- Günlük tek görev sistemi (karar yorgunluğu yok)
- Her ders: öğretim + uygulanabilir eylem + yansıtma
- Adaptif tempo (zorlandığında kolaylaşır, ilerlediğinde derinleşir)
- Günlük hatırlatma bildirimi (saat ayarlanabilir)
- Streak freeze koruması
- Çoklu cihaz senkronu
- Tamamen Türkçe

💎 PREMIUM
- Tüm yolların kilidi açık
- Daha fazla streak freeze hakkı
- Haftalık değerlendirme ve ilerleme analizi
- 7 gün ücretsiz deneme

Davranış değişikliği büyük patlamalarla değil tekrar edilebilir mikro eforlarla kurulur. Ascend bunu sistemleştirir.

Yarın değil bugün başla. Alev seninle.
```

### Keywords (100 char — virgülle, boşluksuz)
```
monkmode,disiplin,streak,sprint,odak,alışkanlık,motivasyon,kişiselgelişim,hedef,rutin,seri
```
(95 char) — `monkmode` keyword'ü TR pazarda az rakipli, viral hashtag eşleşmesi.

### Category
**Primary:** Health & Fitness
**Secondary:** Lifestyle

(Productivity de aday ama Health & Fitness'ta TR pazarında daha az rakip)

### Age Rating
4+ (sansürlü içerik yok)

## App Store Connect "Privacy Nutrition Labels"

> ⚠️ Reklam SDK'sı (Google AdMob) aktif olduğu için "Used to Track You"
> bölümünde **IDFA** işaretlenmek ZORUNDA. Aşağıdaki dağılım ücretsiz +
> premium kullanıcı ayrımına göredir.

### Data Collected and Linked to User
- **Contact Info → Email Address** — App Functionality (Supabase auth)
- **Identifiers → User ID** — App Functionality (Supabase, RevenueCat anon ID)
- **User Content → Other User Content** — App Functionality (lesson reflections)

### Data Collected and NOT Linked to User
- **Usage Data → Product Interaction** — Analytics & Third-Party Advertising
  (lesson completes, XP, paywall events fed to AdMob/SKAdNetwork)
- **Diagnostics → Crash Data** — opsiyonel (Sentry henüz kurulu değil; ekleyince
  bu satırı işaretle)

### Data Used to Track You
- **Identifiers → Device ID (IDFA)** — Third-Party Advertising
  (sadece kullanıcı App Tracking Transparency'de "İzin Ver"e basarsa)

### Data NOT Collected
- Location, contacts, photos, browsing history, health, financial info — NONE

### Tracking
- App Tracking Transparency: **REQUIRED** — Google AdMob entegre, IDFA'yı
  ücretsiz kullanıcılarda kullanıyor. ATT prompt ilk ders sonrası tetiklenir
  (Apple guideline 5.1.2 uyumlu — kullanıcı uygulamayı anladıktan sonra sor).
  Premium aboneler reklam görmez ama IDFA toggle'ı yine sistem ayarlarındadır.

## Privacy Policy + Terms URL

`docs/privacy.html` ve `docs/terms.html` dosyaları repoda var. Bunları **public bir URL'de host etmen gerek**:
- Seçenek A: GitHub Pages (free) — repo settings → Pages → branch: main → folder: /docs
- Seçenek B: Netlify drop (free)
- Seçenek C: Vercel (free)

Sonra App Store Connect'e şu URL'leri gir:
- Privacy Policy: `https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html`
- Terms: `https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html`

## Required Assets (Bunları sen yapacaksın)

### App Icon
- 1024x1024 PNG, transparan değil, köşesiz (Apple kendisi yuvarlatıyor)
- **Fikir:** Siyah/koyu zemin üzerinde turuncu/altın alev — monk mode estetiği
- Hızlı yol: [Figma + Apple Icon Template] veya **Bing/ChatGPT image generator** ile prompt:
  > "iOS app icon, 1024x1024, deep matte black background, single bold orange-gold flame in center, minimalist, monastic, premium, masculine feel, high contrast"

### Screenshots (zorunlu — 6.7" iPhone için)
- 1290 × 2796 px, 3-10 tane
- Önerilen 6 ekran:
  1. **Streak hero**: dev alev + "47 gün" + "Devam et"
  2. **Bugünün görevi**: ders kartı + tamamla butonu
  3. **Onboarding**: "90 gün sonra farklı biri olacaksın"
  4. **İlerleme**: stat grid + curriculum yolu
  5. **Bildirim**: "Berk, alevini söndürme!" notification preview
  6. **Premium paywall**: 7 gün ücretsiz dene

Hızlı yol: TestFlight'tan iPhone simülatöründe screenshot al, [screenshot.rocks](https://screenshot.rocks) veya [previewed.app](https://previewed.app) ile çerçevele.

### App Preview Video (opsiyonel ama conversion +25%)
- 15-30 saniye
- Önerilen sıra: streak hero → görev tamamla (kutlama animasyonu) → curriculum → paywall
- iPhone simulator screen recording yeter

## Submission checklist

- [ ] App icon 1024×1024 yüklendi
- [ ] 6.7" iPhone screenshot'ları yüklendi (en az 3, ideal 6)
- [ ] Description, keywords, subtitle yazıldı
- [ ] Privacy policy URL public ve erişilebilir
- [ ] Terms URL public
- [ ] Privacy nutrition labels dolduruldu
- [ ] Age rating: 4+
- [ ] Category: Health & Fitness
- [ ] Bundle ID: com.ascend.growth (zaten doğru)
- [ ] In-App Purchase products oluşturuldu (RevenueCat ile bağlı)
- [ ] Premium product'a 7 gün introductory offer eklendi
- [ ] TestFlight build seçildi (production version)
- [ ] App Review Information: test account email/password
- [ ] Demo notes: "Free tier yeterli, premium akışını test etmek için sandbox account kullan"
- [ ] Submit for Review

## Onay süreci
- 24-72 saat (genelde 24 saat)
- Reject olursa Apple email yollar, sebebi açıklar, fix + resubmit

## İlk hafta planı (App Store onayından sonra)

### Day 1 — Soft launch
- Sadece arkadaşlara/aileye linki at
- 5 yabancı kullanıcı bul (DM, üniversite, iş çevresi)
- Crash + bug topla

### Day 2-7 — TikTok/Instagram founder content başlat
- Her gün 1 kısa video:
  - "Gün 1: Kendi geliştirdiğim disiplin app'inde 1. gün serim"
  - "Gün 2: Bugünün görevi şuydu, ne hissettim"
  - "App'in arkasında nasıl bir sistem var, anlatayım"
- Hashtag: #kişiselgelişim #disiplin #alışkanlık #yazılım #girişim

### Day 8-30 — Iterate
- Analitik ekle (PostHog free tier)
- Crash reporting ekle (Sentry free tier)
- Test kullanıcılarından geri bildirimle UX cila
- App Store review beklemekten kaçınmak için minor değişiklikler bundle et
