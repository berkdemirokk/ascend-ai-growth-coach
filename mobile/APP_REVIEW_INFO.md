# Ascend: Monk Mode — App Review Information

**Use this verbatim** when filling out App Store Connect → My Apps → Ascend → 1.0.10 → **App Review Information**.

---

## Sign-in info (test account for Apple reviewer)

**Important:** Apple reviewers must be able to log in. Pick ONE option:

### Option A: Demo account (recommended)
Create a real test user via the in-app signup, then provide its credentials here:

```
Username: ascend.review@<your-domain>.com
Password: <strong password — record locally>
```

How to create:
1. On any iPhone, install build 46 via TestFlight
2. Open app → Welcome → "Kayıt Ol"
3. Use the email above + a strong password
4. Complete onboarding (any answers fine)
5. Note: this account can also test the in-app review flow without making real
   purchases — sandbox handles that automatically when reviewer is signed into
   their own Apple ID

### Option B: "Sign in is not required to use this app"
**Tick this in ASC** — Ascend has a "Continue as Guest" path. The reviewer can
test most flows without logging in. **Caveat**: account-deletion (5.1.1(v))
demonstration requires a logged-in user, so Option A is safer.

---

## Notes for the reviewer (paste into "Notes")

```
The app is a discipline-building academy with a Duolingo-style format.

KEY FLOWS TO TEST
1. Onboarding (3 steps): pick a goal, set daily time, pick a path. The CTA
   is gated on goal pick — pick "Better focus" then continue.
2. Daily lesson: tap the path on the home tab, complete a lesson. The
   teaching step has a "Listen" button (free Apple TTS).
3. Quiz: 2 questions per lesson, multiple choice. Wrong answer costs a heart.
4. Hearts (Duolingo-style life system): 5 max, lose 1 on wrong quiz answer,
   auto-refills 30 min after the first one is lost. When 0, the modal lets
   you watch a rewarded ad to refill OR upgrade to Premium.
5. Streak: completing a lesson today extends the streak. If the user misses
   exactly yesterday and has a streak repair token, the streak is auto-saved
   and the user is informed via a one-shot alert on next app open.
6. Paywall (Settings → Premium Status, or after 5 free lessons): shows
   monthly + yearly subscription with a 7-day free trial. Auto-renewal
   disclosure is on the paywall and on the onboarding upsell. Privacy +
   Terms links open the GitHub Pages legal docs.
7. Account deletion: Settings → "Hesabı Sil" → confirm. The Supabase Edge
   Function 'delete-user' is invoked, the local AsyncStorage is wiped, the
   RevenueCat user is unlinked, and the user is signed out.

PRIVACY / TRACKING
- ATT prompt is deferred until AFTER the first lesson completion (Apple
  guideline). It is NOT shown at app launch.
- The app fully functions if tracking is denied — non-personalized ads are
  served instead.
- Privacy manifest declares Required Reasons API usage (UserDefaults via
  AsyncStorage, file timestamps, etc.) per Apple's May 2024 requirement.

LANGUAGES
- Turkish is the primary language; English is fully translated.
- 250 lessons across 5 paths in both languages.

CONTENT NOTES (12+ rating)
- Health-positive references to alcohol awareness ("Alcohol Awareness"
  lesson — anti-alcohol message) and smoking cessation as identity examples
  (Atomic Habits style). No promotion of either substance.
- "Cut Hyperstimulation" lesson covers short-form video addiction (TikTok,
  Reels, Shorts) — the dopamine-detox path's strongest message.

THIRD-PARTY SDKs
- Supabase (auth + cloud sync of progress)
- RevenueCat (subscription IAP — products com.ascend.premium.monthly and
  com.ascend.premium.yearly)
- Google AdMob (banner + interstitial + rewarded)
- Apple Sign-In via expo-apple-authentication
```

---

## Contact info

```
First name:  Berk
Last name:   Demirok
Phone:       <your phone, with country code>
Email:       berkdemirok@icloud.com
```

---

## Demo video / attachment

Not required for v1.0.10 (no unusual hardware or pre-launch private
features). Skip unless ASC explicitly asks for one.

---

## Common reviewer questions — pre-emptive answers

**"Why does the app need tracking?"**
For Google AdMob to serve relevant ads to free users. The app fully works
without tracking — ATT denial just means non-personalized ads. Premium users
see no ads at all.

**"How do users delete their account?"**
Settings → "TEHLİKELİ BÖLGE" → "Hesabı Sil". Confirm. The deletion is
complete (auth.users row removed via Edge Function, with cascading deletes
of user_state). Local data is wiped and user is signed out. RevenueCat user
is unlinked so a fresh signup doesn't inherit entitlements.

**"How do I restore a previous purchase?"**
Two places: Paywall ("Satın Alımları Geri Yükle" link at the bottom) and
Settings → "Satın Alımları Geri Yükle".

**"What happens if my subscription expires?"**
Hearts mechanic re-activates (5 hearts, 30-min refill); streak repair token
grants stop. Existing streak/XP/lessons are unaffected — premium controls
are purely additive (unlimited hearts, all paths unlocked, ad-free, more
streak repair tokens).
