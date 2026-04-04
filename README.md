# Ascend AI Growth Coach

Ascend is a Firebase-backed self-improvement app prepared for a TestFlight pre-release pass.

## Local development

Prerequisites:
- Node.js 22+

Setup:
1. `npm install`
2. Copy [.env.example](.env.example) if you want to configure a trusted AI proxy.
3. `npm run dev`

## Safe runtime behavior

- If `VITE_AI_PROXY_URL` is missing, the app runs in preview mode.
- Preview mode never exposes provider secrets.
- Preview-generated tasks are clearly labeled in the UI and do not count toward verified progression.
- Premium access is read only from `userEntitlements/{uid}` and never from legacy user profile fields.

## Validation commands

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:rules:contract`
- `npm run test:rules:emulator`

`test:rules:emulator` requires Java plus the Firebase Firestore emulator.

## iOS / Capacitor

- `npx cap add ios`
- `npm run ios:sync`

The native iOS project is generated under `ios/` and must still be archived on macOS with Xcode for a real TestFlight upload.
