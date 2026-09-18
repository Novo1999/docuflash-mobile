# Docuflash — Data safety evidence worksheet

Prepared: 2026-09-18  
Status: evidence worksheet only — the release owner must verify each answer
against the production backend, contracts, and the current Play Console form.

This is not a privacy-policy substitute and must not be copied into Play
Console without validation. Google’s definitions can include data transmitted
off device by the app, its SDKs, and services acting on the app’s behalf.

## Observed collection inventory

| Play data area | Observed app behavior | Likely purpose | Data leaving device / recipient to validate | Console decision still required |
| --- | --- | --- | --- | --- |
| Personal info: email address and name | Account sign-up/sign-in, display name, uploader name | Account management, app functionality | Docuflash API; authentication service if applicable | Whether data is “shared” under the form’s current definitions; retention and deletion. |
| Personal info: user IDs | Authenticated user identity and sessions | Account management, security | Docuflash API and auth provider | Exact identifier types, recipient, retention, and linkage. |
| Personal info: passwords / credentials | Email-password authentication; password-protected links | Account management and app functionality | Docuflash API/auth provider | Confirm passwords are not logged or stored outside the intended auth system; classify using current form guidance. |
| Files and docs | User-selected upload/request files, names, types, sizes, links, expiry and access settings | App functionality | Docuflash API and UploadThing flow | Storage location, processors, access controls, encryption, retention, expiry deletion, and whether sharing links make this “shared.” |
| Photos | Optional profile photo from camera or photo library | Profile customization | Avatar upload service/API | Recipient, retention, deletion, and whether it is optional in the final build. |
| App activity / other user-generated content | Upload status, file requests, share choices, and user-provided content | App functionality | API; Supabase Realtime for observed upload progress/uploader/file-name transfers | Correct category under the live form, retention, and whether it is shared. |
| Device or other IDs | Locally stored client ID and nearby/discoverability preference | App functionality | Confirm whether client/device ID is ever sent to API or Realtime | Whether it is transmitted, linked to account, and retained. |
| Google sign-in information | Native Google account token/identity flow | Account management | Google OAuth and Docuflash backend | Exact scopes, values received, token handling, and retention. |

## Not observed in this mobile-source audit

No advertising SDK, analytics SDK, crash-reporting SDK, microphone feature,
precise location, contacts, calendar, SMS/call-log, payment, health, or
financial-data collection was found in the mobile source audit. This is not an
attestation that the production backend, web content, SDK configuration, or
future build collects none of it; verify those separately before selecting
“not collected.”

The Android microphone permission was intentionally removed in Phase 1 because
there is no audio feature.

## Answers that need evidence before submission

- For every listed type, decide **collected**, **shared**, purpose, optional vs
  required, whether encrypted in transit, and whether deletion is offered using
  the current Play definitions.
- Obtain written confirmation from the Docuflash backend owner, UploadThing,
  Supabase, and any authentication provider of data fields, processors,
  retention, deletion propagation, locations, and security controls.
- Run the final Android build through the complete upload, public-link,
  password-link, file-request, avatar, Google sign-in, and account-deletion
  flows. Compare network destinations with the provider inventory.
- Make the public privacy policy, in-app disclosures, account deletion route,
  and each form answer agree exactly.
- Record the date, reviewer, production build version code, and evidence link
  beside each final Console answer in the release record.

## Account deletion

The app has an in-product Profile deletion flow that calls `DELETE
/api/auth/me`. Because the app allows account creation, Google Play also
requires a publicly accessible web resource where users can request account and
associated-data deletion. Do not state that this requirement is complete until
the public URL works while signed out and its behavior has been verified.

References: [Google Play Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-GB) and [account deletion
requirements](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en-GB).
