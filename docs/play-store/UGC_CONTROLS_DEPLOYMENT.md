# Deploying the UGC moderation controls

Prepared: 2026-09-18
Scope: everything needed to make the Terms, reporting, and blocking controls
real in production. Until this is done, do not answer the Play Console UGC
questions as "available" — see [`APP_CONTENT_AND_UGC_GATE.md`](APP_CONTENT_AND_UGC_GATE.md).

Deploy in this order. The mobile build depends on the backend; the backend
depends on the migration.

---

## 1. Backend (`Docuflash-Backend`)

### Environment variables

| Variable | Value | Required? |
| --- | --- | --- |
| `MODERATION_ADMIN_EMAILS` | Comma-separated emails allowed to triage reports, e.g. `novorony52@gmail.com` | **Yes.** Without it every admin call returns 403 and no one can action a report. |
| `ABUSE_CONTACT_EMAIL` | Published abuse address | No — defaults to `novorony52@gmail.com` |
| `TERMS_VERSION` | Terms version string | No — defaults to `2026-09-18` |

`FRONTEND_URL` is still required by the account-deletion flow. Confirm it is set.

### Migration

```
npm run migration:run
```

Applies `AddUgcModeration20260918000000`, which creates `report_entity` and
`blocked_sender_entity` and adds `termsAcceptedAt` / `termsVersion` to
`user_entity`. All three columns are nullable, so existing rows are unaffected —
existing users are simply treated as not having accepted yet, which is the
intended behaviour.

### Deploy and verify

```
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Content-Type: application/json" -d '{}' \
  https://docuflash-api.vercel.app/api/moderation/reports
```

Expect `400` (validation error) once deployed. `404` means it is not live yet.

---

## 2. Frontend (`docuflash-frontend`)

Deploy to publish `/terms`, the report controls on `/share/[token]` and
`/folder/[token]`, and the footer link.

Verify while **signed out**:

- `https://docuflash-frontend.vercel.app/terms` returns 200
- Opening any share link shows "Report this file" and submitting one succeeds
- The footer links to Terms of Use

---

## 3. Mobile (`docuflash-mobile`)

Nothing to configure, but note that `src/constants/legal.ts` derives the Terms
and Privacy URLs from `EXPO_PUBLIC_SHARE_BASE_URL`. Confirm that variable is set
correctly in the EAS `production` environment, or the in-app links will point at
the wrong host.

Build and verify on a physical device from a **release** build:

- Signing in shows working Terms of Use and Privacy Policy links
- An existing account is prompted to accept the Terms and cannot dismiss it
  without signing out; accepting persists across a restart
- A share link shows "Report this file" and a report submits successfully
- On a file request you own, a collected file shows the block control, and a
  blocked sender's next upload fails with "You can no longer upload to this link"

---

## 4. Operational

- Name the moderation owner in [`MODERATION_RUNBOOK.md`](MODERATION_RUNBOOK.md).
- Run the pending-reports query once to confirm the admin gate works with your
  account before you rely on it.
- Record the verification date and build version code in the release record.

---

## Rollback

The migration's `down` drops both tables and the two user columns. Reverting the
backend without reverting the mobile build leaves the app calling endpoints that
return 404: reports would fail with an error message and the Terms gate could
not record acceptance. Roll back mobile first, or leave the backend in place.
