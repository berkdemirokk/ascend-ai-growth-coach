# Supabase Setup

## 1. Create a project

1. Go to https://supabase.com and create a new project.
2. Wait for the provisioning to finish.

## 2. Run the schema

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of `schema.sql` and click **Run**.
3. Confirm that the `public.user_state` table exists under **Table Editor**.

## 3. Enable email auth

1. **Authentication → Providers → Email**: make sure it is enabled.
2. Optionally turn on **Confirm email** if you want users to verify before
   signing in. The app handles both cases.

## 4. Wire credentials into the app

Get these two values from **Project Settings → API**:

- `Project URL` → `SUPABASE_URL`
- `anon public` key → `SUPABASE_ANON_KEY`

Add them to `mobile/app.json` under `expo.extra`:

```json
{
  "expo": {
    "extra": {
      "supabase": {
        "url": "https://YOUR_PROJECT.supabase.co",
        "anonKey": "YOUR_ANON_KEY"
      }
    }
  }
}
```

Rebuild the app (`eas build`). Until both values are set the app falls back
to guest mode automatically.

## 5. What gets synced

When a user is signed in the app pushes a JSON snapshot to
`public.user_state.payload` on every change (debounced ~1.5s). On sign-in it
pulls the remote snapshot and keeps whichever copy has more XP / history.

Fields synced: XP, level, streaks, history, achievements, sprint state,
maintenance state, daily-challenge claims, lessons completed, facts read,
onboarding flag, user profile answers. Premium status is **not** synced —
that comes from the store receipt.
