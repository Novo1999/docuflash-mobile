# Play Store Phase 1 audit

Audited: 2026-09-18  
Scope: Expo/Android configuration, release dependencies, permissions, data
flows, and production endpoints. This is an implementation audit, not a
substitute for the Play Console declarations that must be completed by the
release owner.

## Current configuration

| Item | Result | Release implication |
| --- | --- | --- |
| Android application ID | `com.novodip.docuflashmobile` | Validly configured. Confirm the organization owns it before the first Play upload; it is effectively permanent once published. |
| App / Android version | `1.0.0` / version code `1` | Appropriate for the first upload. EAS production auto-increment is enabled; confirm its remote version source before building. |
| EAS project and update channel | Project ID and `production` channel configured | Build profile exists. Phase 4 must explicitly verify credentials and production environment variables. |
| SDK version | Expo SDK 57.0.0 | Repository guidance still names SDK 56 documentation, while the installed project is SDK 57. Keep the app on the supported SDK 57 patch set unless the team explicitly chooses a downgrade. |
| Android App Links | `https://docuflash-frontend.vercel.app` handles `/share`, `/folder`, and `/request` | Public `assetlinks.json` exists and declares the same package name with two certificate fingerprints. Before release, compare its fingerprints with the Play App Signing and EAS upload certificates. |
| Production API | Default host is `https://docuflash-api.vercel.app` | Host is reachable; its root returns 404, which is not a problem by itself because the app calls `/api/...` routes. Test authenticated endpoints in Phase 2. |
| Account deletion | Available in Profile and calls `DELETE /api/auth/me` | Meets the in-app part of Play's account deletion expectation. Phase 3 still needs a public web deletion URL/instructions if Play Console requires one. |

## Remediation completed

- Removed the explicit microphone declaration and disabled the
  `expo-image-picker` plugin's default microphone permission. No microphone
  feature or audio API call is present in the mobile source, so retaining it
  would create unnecessary user trust and Play policy review risk.
- Confirmed API logging is gated behind `__DEV__`, so release builds do not
  emit the development request/response logs.
- Confirmed authenticated sessions are persisted with `expo-secure-store`, not
  AsyncStorage. AsyncStorage is used for non-secret preferences/device state.

## Verification after remediation

| Check | Result |
| --- | --- |
| `npx expo-doctor` | Pass — 18 of 18 checks passed. |
| `npm run lint` | Pass. |
| `npx tsc --noEmit` | Pass. |
| Resolved Expo public config | Pass — Android package/version/App Links remain configured and no Android microphone permission is present. |
| Working-tree whitespace check | Pass — no `git diff --check` errors. |

## Dependency health

Updated 24 Expo SDK 57 patch dependencies, including `expo`, React Native,
Expo Router, Expo Updates, and EAS-related runtime packages. The resulting
configuration passes all 18 `expo-doctor` checks and TypeScript validation.

The local Node runtime is `22.12.0`, but updated React Native packages require
Node `22.13.0` or newer. EAS production already uses `22.13.0`; update local
Node before device testing or local builds to eliminate engine warnings.

## Dependency security audit

`npm audit --omit=dev --audit-level=high` reported 31 transitive
vulnerabilities (13 high, 18 moderate). The high findings include paths through
Expo/Metro tooling and UploadThing. Some suggested resolutions require breaking
changes (for example a major Expo Router or UploadThing change), so do **not**
run `npm audit fix --force`. Assign dependency remediation to a separately
tested change, and rerun this audit immediately before production release.

## Android permissions and user actions

| Capability | User action in the app | Data involved | Status |
| --- | --- | --- | --- |
| Camera | User taps the camera icon to set a profile photo | A selected/captured avatar image | Needed; keep the image-picker camera explanation accurate. |
| Photo library | User taps the gallery icon to set a profile photo | A selected avatar image | Needed; keep the image-picker photo explanation accurate. |
| Document picker | User selects files to upload or answer a file request | User-provided documents and file metadata | Needed; selected files are uploaded to the configured service. |
| Microphone | No feature or source usage found | None | Removed from the explicit Android manifest configuration. |

## Preliminary data inventory for policy work

Use this as the starting point for the privacy policy and Google Play Data
safety form. The release owner must validate actual backend retention, sharing,
and third-party SDK behavior before answering Play Console.

| Data category | Observed use | Storage / transfer to validate |
| --- | --- | --- |
| Account information | Email, password, display name, authentication | Sent to the Docuflash API; auth session is stored locally in SecureStore. |
| User documents and metadata | Upload/share/request flows; names, types, sizes, links, expiry, sharing choices | Sent to the Docuflash API and UploadThing flow; validate encryption, retention, deletion, access controls, and processors. |
| Avatar image | User-selected/captured profile image | Uploaded through the avatar upload flow; validate host, retention, and deletion. |
| Device/app state | Client ID, nearby/discoverability preference, theme preference | Stored locally with AsyncStorage; validate whether client/device IDs are sent to the backend/realtime service. |
| Google Sign-In data | Native Google account token and identity flow | Validate Google OAuth client configuration, backend token verification, and policy disclosure. |
| Realtime transfer metadata | Uploader display name, file name, upload progress | Sent through Supabase Realtime; validate retention and third-party data handling. |

## Release blockers and owner actions

- [ ] **Dependency update:** update to the supported Expo SDK 57 patch versions
  and rerun `expo-doctor`, lint, and a device smoke test.
- [ ] **Android signing ownership:** verify the organization owns the Android
  application ID, Expo project, EAS credentials, and the Google Play developer
  account. Record the EAS upload certificate SHA-256 and Play App Signing SHA-256.
- [ ] **App Links verification:** ensure both release certificate SHA-256 values
  are present in the deployed `assetlinks.json`; then test all three App Link
  paths from a fresh installed release build.
- [ ] **Google Sign-In release setup:** register the Android package name and
  release certificate SHA-1/SHA-256 in Google Cloud, and replace the iOS
  config-plugin placeholder before any iOS build.
- [ ] **Production EAS environment:** confirm the `production` EAS environment
  contains the required public build variables: `EXPO_PUBLIC_BASE_URL`,
  `EXPO_PUBLIC_SHARE_BASE_URL`, `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
  Check names/visibility only—never commit values.
- [ ] **Privacy evidence:** obtain backend/UploadThing/Supabase retention,
  deletion, encryption, access-control, and subprocessor details for the Phase
  3 privacy policy and Data safety form.
- [ ] **Google Play target API:** check the currently enforced target API level
  in Play Console immediately before submission. Do not rely on a prior release
  or a hard-coded policy value.
