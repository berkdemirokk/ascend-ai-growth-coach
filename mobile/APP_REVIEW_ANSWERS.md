# App Store Connect — Copy-Paste Cevap Kütüphanesi

Bu dosyadaki her blok, ASC dashboard'da sana **soracakları sorulara** birebir cevap. Aç, kopyala, yapıştır.

---

## 1) Age Rating Anketi

ASC → App → App Information → Age Rating → **Edit**

| Soru | Cevap |
|---|---|
| Cartoon or Fantasy Violence | None |
| Realistic Violence | None |
| Prolonged Graphic or Sadistic Realistic Violence | None |
| Profanity or Crude Humor | None |
| **Sexual Content & Nudity** | **Infrequent/Mild** ← (NoFap/porn referansı) |
| **Alcohol, Tobacco, or Drug Use or References** | **Infrequent/Mild** ← (alkol farkındalığı, sigara dersi) |
| Mature/Suggestive Themes | None |
| Horror/Fear Themes | None |
| Medical/Treatment Information | None |
| Gambling | None |
| Contests | None |
| Unrestricted Web Access | No |
| Gambling and Contests | No |

**Sonuç çıkacak rating: 12+**

> 4+ olarak göndermek **anında reject** (Guideline 1.3).

---

## 2) App Privacy (Nutrition Labels)

ASC → App Privacy → **Get Started**

### "Do you or your third-party partners collect data from this app?"
**Yes**

### Hangi veriler? (her birini ekle)

**Contact Info → Email Address**
- Linked to user? **Yes**
- Used for tracking? **No**
- Purposes: **App Functionality**

**Identifiers → User ID**
- Linked to user? **Yes**
- Used for tracking? **No**
- Purposes: **App Functionality**

**Identifiers → Device ID**
- Linked to user? **No**
- Used for tracking? **Yes**
- Purposes: **Third-Party Advertising**

**Usage Data → Product Interaction**
- Linked to user? **No**
- Used for tracking? **Yes**
- Purposes: **Third-Party Advertising**, **Analytics**

### NOT collected (hiçbirini işaretleme)
Health & Fitness, Financial, Location, Sensitive Info, Contacts, User Content, Browsing History, Search History, Other Data Types.

---

## 3) App Review Information

ASC → App Review Information

**Contact:**
- First Name: `Berk`
- Last Name: `Demirok`
- Phone: (kendi numaran)
- Email: `berkkdemirok@gmail.com`

**Sign-in required: YES**

**Demo Account:**
- Username: `apple-review@ascend.app`
- Password: (aşağıdaki SQL'de set edeceğin şifre)

**Notes** (kutuya birebir yapıştır):

```
TEST ACCOUNT
- Email: apple-review@ascend.app
- Password: [demo-account-sql-de set ettiğin şifre]
- Account is pre-verified (no email confirmation needed).

CORE FLOW
1. Sign in with the demo account on Welcome screen
2. Complete onboarding (3 steps: welcome → pick discipline path → premium upsell)
3. Notification permission is requested AFTER onboarding finishes (not at boot)
4. Open today's lesson → teaching → quiz (2 questions) → reflection
5. After the FIRST lesson is completed, ATT (App Tracking Transparency)
   prompt appears once. Decline keeps generic ads, allow enables targeted ads.
   Premium subscribers see no ads.
6. Settings → Premium opens the paywall (7-day free trial, then yearly or
   monthly auto-renewing subscription). Sandbox tester account works.
7. Settings → Restore Purchases recovers a previous subscription.
8. Settings → Delete Account deletes the user server-side via Supabase
   Edge Function (delete-user) and wipes local cache. Complies with
   guideline 5.1.1(v).
9. Privacy Policy and Terms of Service are tappable from both the Signup
   screen and the Paywall (guideline 3.1.2 binding terms).

SUBSCRIPTIONS
- com.ascend.premium.monthly — $4.99 USD / 149 TRY
- com.ascend.premium.yearly — $39.99 USD / 749 TRY (best value, 33% off)
- Both products include a 1-week free trial for new subscribers.
- Auto-renew terms disclosed on paywall in EN, TR, AR.

CONTENT NOTES
- The "Mind Discipline" path includes lessons that reference NoFap research
  and brief alcohol/tobacco awareness in the context of behavioral
  discipline. There is no explicit content; rating set to 12+ accordingly.

LANGUAGES
- UI: Turkish, English, Arabic (RTL).
- Lesson curriculum: Turkish + English fully translated; Arabic UI falls
  back to Turkish lesson text where curriculum translation is incomplete.

CONTACT
- berkkdemirok@gmail.com for any issues during review.
```

---

## 4) Subscription Group Review Notes

ASC → Subscriptions → Premium group → **App Store Review Notes**

```
Premium subscription unlocks:
- All paths (5 disciplines × 50 lessons = 250 total)
- Unlimited hearts (free tier limited to 5, refilling)
- Ad-free experience
- 3 streak freezes on activation
- Premium achievements

7-day free trial offered to new subscribers.
Auto-renew terms disclosed on the paywall in 3 languages.
```

---

## 5) URLs

ASC → App Information → URLs

- **Support URL:** `https://berkdemirokk.github.io/ascend-ai-growth-coach/`
- **Privacy Policy URL:** `https://berkdemirokk.github.io/ascend-ai-growth-coach/privacy.html`
- **Marketing URL:** (boş bırak)
- **License Agreement (EULA):**
  - Default: **Apple's Standard EULA** (en güvenli)
  - Veya custom: `https://berkdemirokk.github.io/ascend-ai-growth-coach/terms.html`

---

## 6) Categories

ASC → App Information → Category
- **Primary:** Health & Fitness
- **Secondary:** Lifestyle

---

## 7) Demo Account — Supabase SQL

Supabase dashboard → SQL Editor → **Run**

```sql
-- 1. Demo kullanıcısı yarat (Apple review için)
-- (Supabase dashboard → Authentication → Add User UI'sinden de yapılabilir,
-- ama auto-confirm bayrağı SQL'de daha temiz.)

-- Eğer zaten varsa skip
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'apple-review@ascend.app'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'apple-review@ascend.app',
      crypt('REPLACE_WITH_STRONG_PASSWORD', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Apple Reviewer"}',
      FALSE,
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;
```

> ⚠ `REPLACE_WITH_STRONG_PASSWORD` kısmını gerçek bir parola ile değiştir, **aynı parolayı** App Review Notes (yukarıda #3) içine koy.

---

## 8) Localizations — kısa versiyon

3 dilde de hazır metin: `mobile/SUBMISSION.md` içinde TR/EN/AR description, keywords, subtitle. ASC → App Information → Localizations'a oraya kopyala.

---

## 9) Build seçimi

ASC → Versions → 1.0 → **+ Build**
- **v1.0.10 (24)** seç (TestFlight'ta "Ready to Test" durumunda olmalı)
- "Submit for Review" → bekle.

---

Hepsini tikledikten sonra reject riski neredeyse sıfır. Reject olursa Resolution Center mesajına göre tek noktayı düzelt, `buildNumber`'ı 25 yap, yeniden gönder.
