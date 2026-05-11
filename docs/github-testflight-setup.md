# GitHub TestFlight Setup

This project is prepared to build on GitHub-hosted macOS runners and upload to
TestFlight.

## Required GitHub repository secrets

Add these secrets in `Settings > Secrets and variables > Actions` for the repo:

- `APP_STORE_CONNECT_ISSUER_ID`
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_PRIVATE_KEY`
- `BUILD_CERTIFICATE_BASE64`
- `P12_PASSWORD`
- `BUILD_PROVISION_PROFILE_BASE64`
- `KEYCHAIN_PASSWORD`
- `APPLE_TEAM_ID`

## What each secret is

- `APP_STORE_CONNECT_ISSUER_ID`: Issuer ID from App Store Connect API keys.
- `APP_STORE_CONNECT_KEY_ID`: Key ID for the App Store Connect API key.
- `APP_STORE_CONNECT_PRIVATE_KEY`: Entire contents of the `.p8` key file.
- `BUILD_CERTIFICATE_BASE64`: Base64-encoded Apple Distribution `.p12`.
- `P12_PASSWORD`: Password used when exporting the `.p12`.
- `BUILD_PROVISION_PROFILE_BASE64`: Base64-encoded App Store
  `.mobileprovision` file for `com.ascend.growth`.
- `KEYCHAIN_PASSWORD`: Any random password used to create the temporary CI
  keychain.
- `APPLE_TEAM_ID`: Apple Developer Team ID.

## Base64 conversion examples

On macOS:

```bash
base64 -i BUILD_CERTIFICATE.p12 | pbcopy
base64 -i AppStore.mobileprovision | pbcopy
```

## Workflow

The GitHub Actions workflow lives at:

- `.github/workflows/ios-testflight.yml`

It does the following:

1. Installs Node dependencies.
2. Builds the web app and syncs Capacitor iOS.
3. Installs the Apple distribution certificate and provisioning profile.
4. Archives the Xcode app on a macOS runner.
5. Exports an IPA.
6. Uploads the IPA to TestFlight.

## Notes

- The bundle ID is `com.ascend.growth`.
- The workflow assumes the generated archive exports `App.ipa`.
- The repo must contain the Capacitor iOS project under `ios/`.
