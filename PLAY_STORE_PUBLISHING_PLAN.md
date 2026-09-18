# Google Play publishing plan

This is the release plan for the Expo mobile app. Work through it in order; do
not create the production release until phases 1–5 have passed. Requirements
that Google changes regularly (for example Android target API level and form
questions) must be checked in Play Console immediately before submission.

**Release owner:** _assign before starting_  
**Target release date:** _assign before starting_  
**Google Play package name:** _record after it is final; it cannot be reused for a different app_

## Definition of done

The app is ready to submit when it has a reproducible signed `.aab`, passes
internal testing on real Android devices, has a completed and truthful Play
Console listing/policy declaration set, and the production rollout has an
approved support and monitoring plan.

## Task plan

| Phase | Outcome | Main tasks | Exit criteria | Status |
| --- | --- | --- | --- | --- |
| 1. Release audit | Baseline is understood | Verify Expo/Android config, dependencies, permissions, backend URLs, and legal/data flows | No unknown release blockers | 🟡 Implementation audit complete; owner actions remain |
| 2. App identity & quality | The installable app is polished | Set immutable package name, versioning, icons, error states, and accessibility; test main user journeys | QA checklist passes on physical devices | 🟡 Static work complete; device QA pending |
| 3. Compliance & store assets | Play Console information is ready | Privacy policy, Data safety, content rating, app access, declarations, listing copy, screenshots | Every answer is evidence-backed and assets are approved | ⬜ |
| 4. Release build | Signed upload artifact is reproducible | Configure EAS production profile and credentials; produce and archive an Android App Bundle | Build is an `.aab` with correct package/version code | ⬜ |
| 5. Internal testing | A real Play-distributed build is validated | Upload to Internal testing, invite testers, collect and fix issues | Sign-off from testers and release owner | ⬜ |
| 6. Production release | Staged public launch | Create production release, review checks, roll out gradually, monitor | Stable rollout or completed launch | ⬜ |

## Phase 1 — release audit

- [x] Initial implementation audit completed; findings, data inventory, and
  release-owner actions are in [docs/PLAY_STORE_PHASE_1_AUDIT.md](docs/PLAY_STORE_PHASE_1_AUDIT.md).
- [ ] Create a release branch/tag and record the intended version, commit SHA,
  release owner, and support contact.
- [ ] Run `npx expo-doctor` and resolve all actionable errors and warnings.
- [ ] Confirm the project uses the intended Expo SDK 56-compatible dependency
  versions. Use `npx expo install --fix` only after reviewing its changes, then
  retest the app.
- [ ] Inspect `app.json` or `app.config.*` and document the current values for:
  `expo.name`, `expo.slug`, `expo.version`, `android.package`,
  `android.versionCode`, `android.permissions`, `android.adaptiveIcon`,
  `android.googleServicesFile`, deep-link `scheme`, and updates/runtime version
  configuration if used.
- [ ] Choose the final reverse-domain `android.package` identifier (for example
  `com.company.docuflash`). It must be unique, lower-case, and final before the
  first Play upload. Do not use a package name owned by another app or vendor.
- [ ] Check every requested Android permission and remove any that are not
  essential. For each retained permission, record the feature that triggers it,
  the user-facing explanation, whether it is declared in the manifest, and
  whether Google Play has a declaration/form requirement.
- [ ] Inventory all data the app collects, generates, transmits, stores, or
  shares—including authentication data, document contents, analytics,
  diagnostics/crash reports, push tokens, files, and third-party SDK data. This
  becomes the source of truth for the privacy policy and Data safety form.
- [ ] Verify production API base URLs, authentication redirects/deep links,
  allowed origins, error reporting, push-notification credentials, and any
  feature flags. Development or localhost endpoints must not be shipped.
- [ ] Confirm an account-deletion route if users can create accounts, and make
  sure it is available from the app and (where required) publicly on the web.
- [ ] Check the Play Console policy status for the target Android API level in
  force at the time of submission; update Expo/native configuration as needed
  and retest. Do not rely on an old target SDK value copied from a guide.

## Phase 2 — product and QA readiness

- [x] App identity, icon configuration, shared accessibility semantics, and
  static verification are recorded in [docs/PLAY_STORE_PHASE_2_QA.md](docs/PLAY_STORE_PHASE_2_QA.md).
- [x] Set a user-facing release version in `expo.version` (for example
  `1.0.0`) and set `android.versionCode` to a positive integer. Increment
  `android.versionCode` for **every** uploaded Android build, including testing
  builds; Play will reject reused codes.
- [x] Add final production branding: app name, high-resolution launcher icon,
  adaptive icon foreground/background, splash screen, and any Android 12+
  presentation. Verify these on a real device, not only in a simulator.
- [ ] Validate the first-run experience, sign up/sign in/sign out, password
  reset, upload/scan/import actions, document viewing, deletion, subscription
  or payment flow if applicable, offline/slow-network behavior, and sign-out
  state.
- [ ] Test denied permissions, expired sessions, empty states, server errors,
  deep links, back navigation, rotation, keyboard handling, and large text.
- [ ] Test the supported Android versions and a representative small phone,
  large phone, and tablet/Chromebook if the listing claims support. Test an
  actual release build, not just Expo Go.
- [ ] Confirm no debug screens, mock data, test credentials, development menus,
  sensitive console logging, or secrets are included in the release artifact.
- [ ] Add/verify production crash reporting and a support email/contact path.
  Exercise a non-sensitive test error and confirm the team can receive it.
- [ ] Complete the release QA checklist below and attach issue links/screenshots
  to the release record.

### Minimum release QA checklist

| Area | Pass condition | Status |
| --- | --- | --- |
| Install/upgrade | Installs cleanly and upgrades without unexpected data loss | ⬜ |
| Authentication | Users can enter and leave accounts safely; errors are understandable | ⬜ |
| Core document flow | Each primary feature succeeds and shows useful recovery errors | ⬜ |
| Privacy | Data is only accessed after an appropriate user action and explanation | ⬜ |
| Network resilience | App handles offline, slow, and failed requests without crashing | ⬜ |
| Device behavior | Back, keyboard, font scaling, rotation, and notifications behave correctly | ⬜ |
| Security | No secrets/logged document data/test accounts ship in the app | ⬜ |
| Accessibility | Labels, contrast, focus order, and touch targets are usable | ⬜ |

## Phase 3 — Play Console, policy, and assets

**Status: 🟡 Local submission materials are prepared. Public policy and
account-deletion resources, reviewer credentials, final screenshots, and the
UGC policy decision/controls remain release gates.**

- [ ] Create/verify the organization’s Google Play developer account. Use an
  organization-controlled Google account, enable two-step verification, and
  give least-privilege access to release staff. Complete any identity or
  organization verification requested by Play Console.
- [ ] Publish a public, stable privacy-policy URL before completing the Play
  listing. It must accurately explain collected/shared data, purposes,
  retention/deletion, security practices, user rights/contact, and each
  relevant third party. Keep it consistent with the actual app behavior.
- [x] Prepare a draft listing pack and verified local visual assets in
  [`docs/play-store/`](docs/play-store/) and
  [`assets/play-store/`](assets/play-store/). Owner verification is still
  required before any Console answer is submitted.
- [ ] Prepare approved listing assets: app name, short description, full
  description, category, developer/support contact details, privacy-policy URL,
  app icon, feature graphic, and device screenshots. Capture screenshots from
  the production-like build, with truthful in-app content and no unsupported
  claims.
- [ ] Complete Play Console’s App content section truthfully: privacy policy,
  ads declaration, app access instructions/test credentials, target audience and
  content, content rating questionnaire, Data safety, and every policy
  declaration prompted for this app (for example financial, health, government,
  news, or special permissions where relevant).
- [ ] For app access, give reviewers a permanent test account or a clear
  non-login path, exact login steps, any required OTP bypass, and access to
  every important feature. Re-test those instructions from a clean device.
- [ ] Derive the Data safety answers from the phase-1 data inventory—not from
  assumptions. Include data handled by embedded SDKs and backend services where
  Google’s form definitions require it.
- [ ] Ensure the app’s in-product disclosures, consent, account deletion, and
  privacy policy match the form answers exactly.
- [ ] Re-read every Play Console warning and pre-launch report. Treat warnings
  as release risks and record an explicit decision for each one.

## Phase 4 — configure and create the Android release build

Use EAS Build for a managed Expo project unless the team intentionally owns a
native Android signing/build pipeline. EAS will manage the Android signing key
when configured to do so; preserve access to the Expo account and credentials.

- [ ] Install/log into the EAS CLI and link the project to the organization
  account: `npx eas-cli@latest login` then `npx eas-cli@latest init` if the
  project is not already configured.
- [ ] Review `eas.json`. Create a `production` profile that produces a Play
  Store Android App Bundle. A typical profile sets `distribution` to `store`
  and `android.buildType` to `app-bundle`; preserve any project-specific
  settings required by the app.
- [ ] Run `npx eas-cli@latest build:configure` if EAS configuration has not
  been created. Review every resulting change before committing it.
- [ ] Decide credential ownership. Either let EAS generate and safeguard the
  Android keystore or import the organization-owned one. Securely back up the
  keystore/credentials and restrict access; losing an unmanaged signing key can
  prevent future updates.
- [ ] From the release commit, build: `npx eas-cli@latest build --platform
  android --profile production`.
- [ ] Confirm the completed artifact is an `.aab`, that its package name is the
  intended final package, and that its version name/code are correct. Archive
  the artifact URL, build ID, Git SHA, version, version code, release notes,
  and signing ownership in the release record.
- [ ] If the app uses EAS Update, publish only after verifying the runtime
  version/channel strategy. An update must be compatible with the native binary
  it targets; use a new build for native configuration or dependency changes.

## Phase 5 — Play internal testing

- [ ] In Play Console, create the app with the exact final package identity and
  upload the `.aab` to the **Internal testing** track.
- [ ] Add a tester email list, create clear test instructions, and distribute
  the opt-in link. Confirm testers install it through Google Play rather than
  from a local APK.
- [ ] Review the Play pre-launch report for crashes, compatibility problems,
  accessibility findings, and policy/security concerns. Fix blockers and upload
  a new build with an incremented `android.versionCode`.
- [ ] Collect sign-off from at least the release owner and a user-acceptance
  tester who did not build the app. Record tested devices, Android versions,
  known issues, and the go/no-go decision.
- [ ] If the developer account is new, allow time for any Google-mandated
  testing period or additional production-access requirements shown in Play
  Console before scheduling launch.

## Phase 6 — production rollout and follow-up

- [ ] Write concise release notes describing user-visible changes only.
- [ ] Create the production release from the approved build. Complete every
  required form and resolve the release validation errors in Play Console.
- [ ] Prefer a staged rollout for the first release or material changes. Choose
  the rollout percentage and monitoring window in advance, and name the person
  authorized to halt rollout.
- [ ] During rollout, monitor Play Console crash/ANR signals, reviews, support
  inbox, backend errors, authentication failures, and document-processing
  failures. Pause/roll back if a user-impacting regression appears.
- [ ] After the monitoring window, document the release result, publish
  post-release fixes if needed, and start the next version with an incremented
  version code.

## Release record template

Fill this out for every production candidate:

| Field | Value |
| --- | --- |
| Release version / Android version code | |
| Git commit/tag | |
| EAS build ID and artifact URL | |
| Android package name | |
| Build date / builder | |
| Test devices and Android versions | |
| Internal testing link and tester sign-off | |
| Privacy policy URL | |
| Play forms reviewed by | |
| Release notes | |
| Rollout percentage / monitoring owner | |
| Known issues and rollback decision | |

## Reference links

- [Expo SDK 56: Publish to app stores](https://docs.expo.dev/versions/v56.0.0/distribution/app-stores/)
- [Expo SDK 56: Build variants](https://docs.expo.dev/versions/v56.0.0/build-reference/variants/)
- [Expo SDK 56: Submit to Google Play](https://docs.expo.dev/versions/v56.0.0/submit/android/)
- [Google Play Console Help: prepare and roll out releases](https://support.google.com/googleplay/android-developer/topic/9858052)
- [Google Play User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Google Play Data safety form guidance](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play target API level requirements](https://support.google.com/googleplay/android-developer/answer/11926878)
