# Docuflash privacy-policy fact check

Prepared: 2026-09-18  
Status: publication checklist, not a finished public privacy policy.

Before publishing a policy, have the organization’s privacy/legal owner replace
every bracketed item with confirmed facts. The policy must be hosted at a
public, stable HTTPS URL, be accessible without sign-in, and be linked from the
app as well as Play Console.

## Minimum public-policy content

1. **Publisher identity and contact.** Legal entity name, postal address where
   required, support/privacy email, and effective date.
2. **Data collected.** Email, display name, account identifiers, credentials
   as applicable, uploaded files and metadata, link/password/expiry choices,
   avatar image, device/app identifiers, locally stored preferences, Google
   sign-in data, and Realtime transfer metadata — only to the extent actually
   collected in production.
3. **Purposes.** Account authentication, document upload/sharing, file
   requests, support, security/abuse prevention, and any other verified use.
4. **Recipients.** Docuflash and each verified processor/subprocessor
   (including the relevant UploadThing, Supabase, authentication, hosting, and
   Google sign-in services), with the reason each receives data.
5. **Link visibility.** Clearly explain what “public” means, the effect of a
   password, how an expiry works, and that a recipient may further distribute a
   link or file. Do not promise end-to-end encryption unless verified.
6. **Retention and deletion.** State actual account, document, link, log,
   backup, and processor-retention periods. Explain what expires automatically,
   what account deletion removes, any legal/security exceptions, and when
   downstream deletion occurs.
7. **Security.** Describe only controls that the organization has verified;
   avoid absolute promises such as “completely secure.”
8. **User choices and rights.** Explain how to update a profile, revoke access
   where supported, request access/correction/deletion, and contact the privacy
   team; include regional rights only after legal review.
9. **Account deletion.** Give the in-app path and a public signed-out web
   deletion URL. Explain required identity checks and expected completion time.
10. **Children and changes.** State the actual audience/age policy and how
    users will be notified of material changes.

## Required fact table

| Fact needed | Owner / evidence | Final value |
| --- | --- | --- |
| Legal publisher and privacy contact | Business/legal owner | `[REQUIRED]` |
| Public policy URL | Web owner | `[BLOCKER — must be live]` |
| Public account-deletion URL | Web/backend owner | `[BLOCKER — must be live and work signed out]` |
| Production API, file host, auth, Realtime, analytics, and support providers | Backend owner | `[REQUIRED]` |
| All production data fields and network destinations | Backend owner + release test | `[REQUIRED]` |
| Retention, expiry, deletion, backup, and legal-hold behavior | Backend + legal owner | `[REQUIRED]` |
| Encryption/access controls and incident contact | Security owner | `[REQUIRED]` |
| Target audience and children's-data posture | Product + legal owner | `[REQUIRED]` |
| Rights/deletion request procedure and timing | Privacy/legal owner | `[REQUIRED]` |

## In-app implementation gap — closed

`src/app/auth.tsx` now links both the Terms of Use and the Privacy Policy as
working links, and versioned Terms acceptance is recorded against the account
(`termsAcceptedAt` / `termsVersion`, surfaced through `POST /api/auth/accept-terms`).
Users whose accepted version is stale are prompted by `TermsAcceptanceGate`
before they can keep using the app.

Remaining: verify both links open from a release build on a physical device,
and confirm `/terms` is deployed. As of 2026-09-18, `/privacy` and
`/delete-account` return 200 in production; `/terms` is written but **not yet
deployed** (404).

## Accuracy correction applied

The mobile and web clients previously claimed **“End-to-end encrypted”** on the
upload, success, share, and folder surfaces. Docuflash encrypts storage keys
server-side with a master key, so the service can decrypt content — that is not
end-to-end encryption, and the claim contradicted both this checklist and the
store-listing guidance. All five occurrences now read “Encrypted storage”.
Do not reintroduce the stronger claim without an architecture that supports it.

Reference: [Google Play privacy policy requirement](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-GB).
