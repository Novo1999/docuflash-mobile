# Docuflash — UGC moderation runbook

Prepared: 2026-09-18
Owner: `[REQUIRED: named person responsible for triage]`
Abuse contact: `novorony52@gmail.com`

Google Play requires UGC apps to run "robust, effective, and ongoing" moderation
and to be able to show that reports are acted on. This is that process. Keep it
accurate — if the process changes, change this file.

See [`UGC_POLICY_STUDY.md`](UGC_POLICY_STUDY.md) for why the policy applies and
what the controls are.

---

## Where reports arrive

| Channel | Who can use it | Lands in |
| --- | --- | --- |
| In-app **Report this file / folder** (mobile share and folder screens) | Anyone with the link, no account needed | `report_entity` table |
| Web **Report this file / folder** (`/share/[token]`, `/folder/[token]`) | Anyone with the link, no account needed | `report_entity` table |
| Email to the abuse contact | Anyone | Inbox — record it manually as a report |

Reports are rate limited to 10 per hour per IP.

## Triage

**Target: review every new report within 24 hours.** Reports alleging child
sexual abuse material take priority over everything else and are actioned
immediately.

1. List pending reports:
   `GET /api/moderation/reports?status=pending`
   Requires a signed-in account whose email is in `MODERATION_ADMIN_EMAILS`.
2. Open the reported `shareToken` and assess it against the prohibited-content
   list in the [Terms of Use](https://docuflash-frontend.vercel.app/terms).
3. Take the action below.
4. Record the outcome:
   `PATCH /api/moderation/reports/:id` with `{ "status": "...", "resolutionNote": "..." }`
   Every report ends at `actioned` or `dismissed`, never left `pending`.

## Actions

| Finding | Action |
| --- | --- |
| Child sexual abuse material | Delete the file immediately, terminate the uploader's account, preserve the report record, and report to NCMEC / local law enforcement as required. Do not re-review or circulate the content. |
| Non-consensual intimate imagery | Delete immediately, terminate the account. |
| Malware, illegal content, fraud/phishing | Delete the file, disable the link, suspend or terminate the account depending on intent and history. |
| Harassment, hate speech | Delete the content; terminate on repeat or severe cases. |
| IP infringement | Delete the content on a valid rights-holder claim; tell the uploader the reason. |
| Spam | Delete the link; terminate on repeat. |
| Abusive sender on a file request | Confirm the request owner has blocked them; block server-side if needed. |
| No violation | Set `dismissed` with a note explaining why. |

**Deleting content:** `DELETE /api/files/token/:token` removes the object from
storage as well as the row. For a folder, `DELETE /api/folders/token/:token`.

**Terminating an account:** delete the user through the account-deletion path.
Record the reason in the report's `resolutionNote` before deleting, because the
user's own rows go with them.

## Notifying people

- Tell the account holder what was removed and why, unless doing so is unlawful
  or would create a risk of harm (for example, CSAM cases).
- Reply to the reporter only when they supplied an email and a reply is useful.
- Appeals come back to the abuse contact and are reviewed by the owner named at
  the top of this file.

## What users can do themselves

| Control | Where | Effect |
| --- | --- | --- |
| Report content | Mobile and web share/folder views | Creates a report |
| Block a sender | Mobile file-request screen, per collected file | That sender's client ID can no longer upload to that request |
| Delete a link | Mobile uploads/request screens, web `/me/uploads` | Content is removed from storage immediately |
| Accept/decline Terms | Mobile, on launch when the accepted version is stale | Declining signs the user out |

## Records to keep for Play

- The `report_entity` table is the enforcement record. Do not hard-delete rows.
- Before submission, be able to state: number of reports received, median time
  to action, and the actions taken. A brand-new app with zero reports is fine —
  say so honestly.

## Known gaps

- **Web has no block control.** A request owner can block a sender from the
  mobile app only. The web request page still needs the same control.
- **No email notification on a new report.** Triage depends on someone running
  the pending-reports query. Add a notification before report volume grows.
- **Nearby-device transfers have no block control.** Decide whether that feature
  ships in 1.0; if it does, it needs one.

## Configuration this depends on

Set in the backend environment:

| Variable | Purpose |
| --- | --- |
| `MODERATION_ADMIN_EMAILS` | Comma-separated emails allowed to list and resolve reports. **Without this, nobody can triage.** |
| `ABUSE_CONTACT_EMAIL` | Published abuse contact. Defaults to the personal support address. |
| `TERMS_VERSION` | Bump to force every user to re-accept after a material Terms change. Defaults to `2026-09-18`. |

The `AddUgcModeration20260918000000` migration must be run before any of this
works.
