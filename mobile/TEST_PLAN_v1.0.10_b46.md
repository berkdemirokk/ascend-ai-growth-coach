# Test Plan — Ascend v1.0.10 build 46

This is what to walk through after installing build 46 on a real iPhone via
TestFlight, **before** submitting to App Store Review.

Total time: ~25 minutes for a full pass.

---

## 1. Cold-start sanity (2 min)

| Step | Expected |
|------|----------|
| Force-quit the app | App removed from App Switcher |
| Turn on Airplane Mode | No network |
| Open Ascend | Splash → app loads in **≤ 5 seconds** (no infinite spinner) |
| Turn off Airplane Mode | Network restored |

**Pass criteria:** App boots offline. AuthContext getSession() races a 5-second
timeout — splash never hangs forever.

---

## 2. Onboarding personalization (3 min)

| Step | Expected |
|------|----------|
| Fresh install (or delete account first) | Welcome step |
| Tap "Başla" | Personalize step appears |
| Try tapping "Devam et" without picking a goal | Button is disabled (gray) |
| Pick a goal (e.g. "Daha çok odaklan") | Continue button activates |
| Pick a daily time + mood (optional) | Selections stick |
| Tap "Devam et" | Pick-path step opens with **mind-discipline** pre-selected |
| Continue → upsell → "Şimdilik Atla" | Lands on Home tab |

**Pass criteria:** Goal selection pre-selects the matching path. Time + mood
are optional.

---

## 3. First lesson + ATT (3 min)

| Step | Expected |
|------|----------|
| Tap the active path on Home | Lesson screen opens |
| Read the teaching | Teaching card has a "Sesli dinle" button |
| Tap "Sesli dinle" | Native iOS voice reads the teaching |
| Tap again | Audio stops |
| Continue → answer 2 quiz questions | Wrong answer drops a heart |
| Commit step → tap "Tamamla" | Celebration plays |
| Dismiss celebration | **ATT prompt appears** (first lesson only) |
| Tap "Allow" or "Don't Allow" | Either is fine |

**Pass criteria:** ATT prompt only after the first lesson, never on cold start.

---

## 4. Paywall (3 min)

| Step | Expected |
|------|----------|
| Settings → Premium Status (or trigger via 5+ lessons) | Paywall opens |
| Both prices visible | ₺149,99/ay, ₺999,99/yıl |
| "EN İYİ FİYAT" badge on yearly | Visible |
| Auto-renew disclosure visible | "Abonelik otomatik olarak yenilenir..." |
| Privacy Policy + Terms links work | Open in Safari |
| "Satın Alımları Geri Yükle" link | At the bottom |
| Close paywall, open RevenueCat dashboard | Sandbox tab → your customer appears |

**Pass criteria:** All Apple 3.1.2 disclosures present. RC dashboard logs the
customer (proving init reaches RC).

---

## 5. Streak repair token (3 min)

| Step | Expected |
|------|----------|
| Settings → Account → "Streak Onarım Jetonu" | Count visible (12 if premium activated, else 0) |
| (Premium users) Trigger missed-day scenario | Tomorrow morning open the app → "Streak kurtarıldı 🛡️" alert appears, token decremented |

**Pass criteria:** Token count shown in Settings. Auto-burn alert appears once
on next app open after a missed day.

---

## 6. Hearts depletion (3 min)

| Step | Expected |
|------|----------|
| Answer 5 quiz questions wrong | Hearts go 5 → 0 |
| Try to start a new lesson with 0 hearts | OutOfHearts modal appears |
| If a rewarded ad is loaded → tap "Reklam izle" | Ad plays, hearts refill to 5 |
| If no ad available → tap "Reklam izle" | "Reklam hazır değil" alert, fallback to Premium |
| Tap "Premium" | Paywall opens |
| Wait 30 minutes | Hearts auto-refill |

**Pass criteria:** No silent failures. AdMob fill rate may be 0% on a fresh
account — that's fine, the user gets a clear "ad not ready" message instead
of a broken-looking button.

---

## 7. Account flows (3 min)

| Step | Expected |
|------|----------|
| Settings → "Çıkış Yap" | Returns to Welcome screen |
| Sign in again with same account | Returns to Home, progress intact |
| Settings → "Hesabı Sil" → "Sil" | Confirmation dialog, then account gone |
| Open RC dashboard | Customer is unlinked (no longer attached to user_id) |
| Open Supabase user_state table | Row is deleted (cascade from auth.users) |

**Pass criteria:** Logout doesn't crash. Account delete actually deletes
server-side (Apple Guideline 5.1.1(v)).

---

## 8. Apple Sign-In (2 min)

| Step | Expected |
|------|----------|
| Sign out | Welcome screen |
| Tap "Apple ile devam et" | Native Apple Sign-In sheet |
| Pick an Apple ID, tap "Continue" | Returns to app, signed in |
| Open RC dashboard | New customer linked to the Supabase user_id |

**Pass criteria:** Apple Sign-In works without a web redirect. Cancel mid-flow
is graceful (returns to Welcome, no error toast).

---

## 9. Leaderboard (2 min)

| Step | Expected |
|------|----------|
| Insights tab → "Liderlik Tablosu" CTA | LeaderboardScreen opens |
| Top 50 list visible | Anon usernames (`monk_XXXX`) only |
| Your row highlighted with primary red border | "(sen)" suffix on your row |
| Pull to refresh | Reloads data |

**Pass criteria:** Real names never appear. Only the anon handle is shown.

---

## 10. Weekly recap (1 min)

| Step | Expected |
|------|----------|
| Stats tab top card | "BU HAFTA" with total + active days + 7-bar chart |
| Today's bar has primary-color border | Visible distinction |
| If you have 0 lessons this week | Card still renders, all bars empty/gray |

---

## 11. ErrorBoundary (1 min — only if a crash occurs)

If any in-app crash hits ErrorBoundary, you should see:
- The "Bir şeyler ters gitti" screen with the new red theme
- A "Tekrar Dene" button
- After 3 crashes within 60 seconds → a "Destek ile İletişim" button
  appears that opens a mailto: with crash detail

If you don't trigger one — that's fine. We don't want crashes.

---

# When all 10 sections pass

1. Update App Store Connect → 1.0.10 metadata using `APP_STORE_LISTING.md`
2. Fill App Review Information using `APP_REVIEW_INFO.md`
3. ASC → "+ Build" → pick build 46
4. **Submit for Review**

Apple's typical review time: **24–48 hours**.

If a section fails, file the failure here and we fix before submission.
