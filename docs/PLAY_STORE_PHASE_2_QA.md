# Play Store Phase 2 — identity and quality record

Updated: 2026-09-18  
Status: static implementation complete; physical-device release QA remains.

## Completed application identity work

| Item | Result |
| --- | --- |
| Display name | `Docuflash` remains the user-facing name. |
| Android identity | `com.novodip.docuflashmobile`, version `1.0.0`, and version code `1` remain unchanged and ready for a first release. |
| App description | Added: “Securely share documents with password-protected, self-expiring links.” |
| Launcher icon | Added `assets/images/docuflash-app-icon-v2.png`, a 1254 × 1254 text-free, square source icon. |
| Android adaptive icon | Added `assets/images/docuflash-adaptive-foreground-v2.png`, a matching transparent 1254 × 1254 foreground. The adaptive background remains `#E6F4FE`. |
| iOS icon and splash | Use the new application icon and transparent mark respectively. |

The previous `icon.png` and `icon-192.png` are intentionally retained. The web
favicon continues to use `icon-192.png`; refresh it with web-specific assets
only if web publishing is also in scope.

## Accessibility improvements

- Shared primary, OAuth, danger, segmented, and icon controls now publish
  accessible roles, labels, and disabled/busy/selected state.
- Icon controls include a hit target of at least 48 dp without changing their
  visual size.
- Secure fields now label the password visibility control as “Show password” or
  “Hide password”, and inputs fall back to their label/placeholder for assistive
  technologies.
- Static shared-component changes cover the core authentication, upload,
  sharing, request, profile, note, and confirmation flows.

## Static validation

| Check | Result |
| --- | --- |
| New image assets | Pass — both are square 1254 × 1254 PNGs. |
| Resolved Expo public config | Pass — all new icon/splash paths resolve; Android package, version code, and App Links remain correct. |
| `npx expo-doctor` | Pass — 18 of 18 checks. |
| `npm run lint` | Pass. |
| `npx tsc --noEmit` | Pass. |

## Required physical-device QA

Run this from an Android **preview or production** build, not Expo Go. Expo Go
and development builds do not faithfully display the standalone splash screen.

- [ ] Install the build from Google Play Internal Testing (or an EAS preview
  APK) on at least one Android phone.
- [ ] Check the launcher icon against light/dark wallpapers and Android icon
  masks; the mark must be centered, recognisable, and free of clipped edges.
- [ ] Enable Android themed icons, if available, and record the presentation.
- [ ] Cold launch the app three times to inspect the splash screen transition.
- [ ] With TalkBack enabled, navigate the auth, upload, sharing/request, notes,
  and profile flows. Confirm every icon-only control announces an understandable
  action and every selected/disabled/loading state is communicated.
- [ ] Test large display text, keyboard navigation, denied camera/photo
  permissions, offline errors, expired share/request links, and authenticated
  account deletion.
- [ ] Record device model, Android version, build version code, screenshots,
  observed issues, and release-owner sign-off in the release record.

## Remaining Phase 2 dependencies

The physical-device test build depends on Phase 1 owner actions: upgrade local
Node to at least 22.13 for local tooling, validate EAS/Google credentials and
production environment variables, and complete the documented dependency
security review. See [PLAY_STORE_PHASE_1_AUDIT.md](PLAY_STORE_PHASE_1_AUDIT.md).
